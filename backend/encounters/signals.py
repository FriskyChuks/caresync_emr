import logging
from django.apps import apps
from django.db.models.signals import post_save
from django.dispatch import receiver
from django.db.models.signals import post_save
from django.dispatch import receiver
from django.contrib.contenttypes.models import ContentType
from decimal import Decimal
from django.db import transaction


from .models import EncounterRoute
from services.models import Service, ServiceRequest, ServiceRequestDetail
from bills.models import Bill

logger = logging.getLogger(__name__)

# get models via apps to avoid import cycles
TransferRequest = apps.get_model("encounters", "TransferRequest")
Visit = apps.get_model("encounters", "Visit")
Room = apps.get_model("locations", "Room")

def _release_bed_for_visit(visit):
    """
    Best-effort: free bed(s) associated with a visit.
    Strategy:
      - Find accepted TransferRequest(s) referencing this patient or this visit
        and clear their assigned_bed_number.
      - Clear visit-level bed fields if present (bed_number, room, assigned_room).
    Returns True if any change made, False otherwise.
    """
    try:
        changed = False

        # 1) Prefer exact matches: TransferRequests that reference this visit (if field exists)
        qs = TransferRequest.objects.none()
        # some projects might include a visit foreignkey on TransferRequest, try possible names:
        for fk in ("visit", "visit_id", "related_visit"):
            if hasattr(TransferRequest, fk):
                # If it's a field on the model, query it
                try:
                    kwargs = {fk: visit}
                    qs = TransferRequest.objects.filter(**kwargs, status="accepted")
                    break
                except Exception:
                    pass

        # 2) If no direct visit FK, fallback to patient-based accepted transfers
        if not qs.exists():
            qs = TransferRequest.objects.filter(patient_id=visit.patient_id, status="accepted")

        # 3) If we still have none, try to match by room & bed number (common case)
        if not qs.exists():
            bed_num = getattr(visit, "bed_number", None) or getattr(visit, "assigned_bed_number", None)
            room_obj = getattr(visit, "room", None) or getattr(visit, "assigned_room", None)
            if bed_num:
                if room_obj and hasattr(room_obj, "id"):
                    qs = TransferRequest.objects.filter(
                        assigned_room_id=room_obj.id,
                        assigned_bed_number=bed_num,
                        status="accepted",
                    )
                else:
                    qs = TransferRequest.objects.filter(
                        assigned_bed_number=bed_num,
                        status="accepted",
                    )

        # Clear assigned_bed_number and mark as completed
        for tr in qs:
            updates = []
            if getattr(tr, "assigned_bed_number", None) is not None:
                tr.assigned_bed_number = None
                updates.append("assigned_bed_number")

            if tr.status == "accepted":   # only close active admissions
                tr.status = "discharged"   # or "discharged", depending on your choice
                updates.append("status")

            if updates:
                tr.save(update_fields=updates)
                changed = True
                logger.info(
                    "Released bed + marked TransferRequest id=%s as %s for visit id=%s",
                    tr.id,
                    tr.status,
                    visit.id,
                )

        # 4) Clear visit-level bed info (if present)
        visit_updates = []
        if hasattr(visit, "bed_number") and getattr(visit, "bed_number", None) is not None:
            visit.bed_number = None
            visit_updates.append("bed_number")
        if hasattr(visit, "room") and getattr(visit, "room", None) is not None:
            # If visit.room is FK, you might want to set None; if it's string, skip.
            try:
                visit.room = None
                visit_updates.append("room")
            except Exception:
                pass

        if visit_updates:
            visit.save(update_fields=visit_updates)
            changed = True
            logger.info("Cleared visit fields %s for visit id=%s", visit_updates, visit.id)

        return changed

    except Exception as exc:
        logger.exception("Error releasing bed for visit id=%s: %s", getattr(visit, "id", None), exc)
        return False


# Run when Visit is saved. If visit_status is False (closed), attempt to release bed(s).
@receiver(post_save, sender=Visit)
def release_bed_on_visit_close(sender, instance, created, **kwargs):
    """
    When a Visit becomes inactive (visit_status=False), free the bed(s) associated with it.
    Using Visit post_save is robust: any code path that closes a visit (discharge view,
    admin, etc.) will trigger bed release.
    """
    # only act when visit is closed (inactive)
    if getattr(instance, "visit_status", True) is False:
        # best-effort release
        _release_bed_for_visit(instance)


# AUTO CREATE CONSULTATION SERVICE & BILL ON CLINIC ENCOUNTER
def get_consultation_service_for_clinic(clinic_name):
    """
    Determine the appropriate consultation service based on clinic name.
    You can customize this logic based on your clinic naming conventions.
    """
    clinic_name_lower = clinic_name.lower()
    
    # Map clinic types to consultation services
    if 'anc' in clinic_name_lower or 'antenatal' in clinic_name_lower:
        return Service.objects.filter(name__icontains='ANC Consultation').first()
    elif 'gopd' in clinic_name_lower or 'general' in clinic_name_lower:
        return Service.objects.filter(name__icontains='GOPD Consultation').first()
    elif 'surgical' in clinic_name_lower:
        return Service.objects.filter(name__icontains='Surgical Consultation').first()
    elif 'dental' in clinic_name_lower:
        return Service.objects.filter(name__icontains='Dental Consultation').first()
    elif 'eye' in clinic_name_lower or 'optical' in clinic_name_lower:
        return Service.objects.filter(name__icontains='Opthalmology Consultation').first()
    elif 'pediatric' in clinic_name_lower or 'child' in clinic_name_lower:
        return Service.objects.filter(name__icontains='Pediatric Consultation').first()
    
    # Default consultation service
    return Service.objects.filter(name__icontains='Consultation').first()

def get_digital_card_service():
    """Get the digital card service"""
    return Service.objects.filter(name__icontains='Digital Card').first()

def get_registration_service():
    """Get the patient registration service."""
    return Service.objects.filter(name__icontains='Patient Registration').first()

def is_first_encounter(patient):
    """
    Check if this is the patient's first encounter.
    """
    return EncounterRoute.objects.filter(visit__patient=patient).count() <= 1

@receiver(post_save, sender=EncounterRoute)
def create_consultation_service_and_bill(sender, instance, created, **kwargs):
    """
    Automatically create consultation service and bill when a patient is sent to a clinic.
    For first encounter: Create Registration, Digital Card, and Consultation services
    For subsequent encounters: Create only Consultation service
    """
    if created and instance.out_patient_transfer and not instance.in_patient_transfer:
        with transaction.atomic():
            patient = instance.visit.patient
            is_first_time = is_first_encounter(patient)
            
            # Get services
            consultation_service = get_consultation_service_for_clinic(instance.out_patient_transfer.name)
            registration_service = get_registration_service() if is_first_time else None
            digital_card_service = get_digital_card_service() if is_first_time else None
            
            if not consultation_service:
                print(f"Warning: No consultation service found for clinic: {instance.out_patient_transfer.name}")
                return
            
            # Create service request
            service_request = ServiceRequest.objects.create(
                patient=patient,
                requested_by=instance.transferred_by,
                encounter_route=instance,
                note=f"Auto-generated {'registration, digital card, and ' if is_first_time else ''}consultation for {instance.out_patient_transfer.name}",
                status="pending"
            )
            
            services_to_create = []
            
            # Add registration service for first-time patients
            if is_first_time and registration_service:
                services_to_create.append({
                    'service': registration_service,
                    'description': f"{registration_service.name} - New Patient"
                })
            
            # Add digital card service for first-time patients
            if is_first_time and digital_card_service:
                services_to_create.append({
                    'service': digital_card_service,
                    'description': f"{digital_card_service.name} - New Patient"
                })
            
            # Add consultation service for all clinic visits
            services_to_create.append({
                'service': consultation_service,
                'description': f"{consultation_service.name} - {instance.out_patient_transfer.name}"
            })
            
            # Create service details and bills
            for service_data in services_to_create:
                service = service_data['service']
                description = service_data['description']
                
                # Create service request detail
                service_detail = ServiceRequestDetail.objects.create(
                    request=service_request,
                    service=service,
                    quantity=1,
                    unit_price=service.price,
                    status="pending"
                )
                
                # Create bill for the service
                content_type = ContentType.objects.get_for_model(service_detail)
                
                Bill.objects.create(
                    patient=patient,
                    encounter=instance,
                    content_type=content_type,
                    object_id=service_detail.id,
                    description=description,
                    amount=service_detail.total_amount,
                    amount_paid=Decimal('0.00'),
                    balance=service_detail.total_amount,
                    status='pending',
                    created_by=instance.transferred_by
                )
            
            encounter_type = "first" if is_first_time else "follow-up"
            print(f"Auto-created services and bills for {patient} at {instance.out_patient_transfer.name} ({encounter_type} visit)")