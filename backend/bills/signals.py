from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver

from lab.models import TestRequest
from pharmacies.models import Prescription
from radiology.models import InvestigationRequest
from patients.models import Patient
from .models import *


@receiver(post_save, sender=Patient)
def create_patient_wallet(sender, instance, created, **kwargs):
    """
    Automatically create a wallet for each new patient after registration.
    Avoids duplicate wallet creation and ensures consistent linkage.
    """
    if created:
        if not hasattr(instance, "wallet"):
            Wallet.objects.create(
                patient=instance,
                account_balance=0.00,
                created_by=getattr(instance, "created_by", None),
            )


@receiver(post_delete, sender=Patient)
def delete_patient_wallet(sender, instance, **kwargs):
    """
    Automatically delete a wallet when its patient is deleted.
    Keeps the database clean and prevents orphaned wallet records.
    """
    try:
        wallet = getattr(instance, "wallet", None)
        if wallet:
            wallet.delete()
    except Exception:
        # Prevent unexpected errors from breaking patient deletion
        pass


@receiver(post_save, sender=Bill)
def update_source_status(sender, instance, created, **kwargs):
    if not created or not instance.content_type:
        return

    model = instance.content_type.model
    mapping = {
        "testrequest": TestRequest,
        "prescription": Prescription,
        "radiologyrequest": InvestigationRequest,
    }

    Model = mapping.get(model)
    if Model:
        Model.objects.filter(id=instance.object_id).update(status="billed")


@receiver(post_save, sender=PaymentDetail)
def update_prescription_on_payment(sender, instance, created, **kwargs):
    """When a payment detail is created, update prescription status"""
    if created and instance.bill and instance.bill.status == 'paid':
        from pharmacies.models import PrescriptionDetailBill
        
        bill_records = PrescriptionDetailBill.objects.filter(bill=instance.bill)
        for bill_record in bill_records:
            detail = bill_record.prescription_detail
            if detail.status != 'dispensed':
                detail.status = 'paid'
                detail.save(update_fields=['status'])
                if hasattr(detail.prescription, 'update_status'):
                    detail.prescription.update_status()


@receiver(post_save, sender=Bill)
def update_lab_status_on_bill_change(sender, instance, created, **kwargs):
    """
    Automatically update lab test detail status when bill status changes
    """
    # Skip if this is a recursive call (add a flag to avoid loops)
    if hasattr(instance, '_updating_lab'):
        return
    
    # Only process if this bill is linked to a lab test detail
    if instance.content_type and instance.content_type.model == 'testrequestdetail':
        from lab.models import TestRequestDetail
        
        try:
            detail = TestRequestDetail.objects.get(pk=instance.object_id)
            
            # Determine new status
            if instance.status == "paid":
                new_status = "paid"
            elif instance.status == "partly_paid":
                new_status = "partly_paid"
            else:
                new_status = "billed" if instance.amount_paid > 0 else "pending"
            
            # Only update if status changed
            if detail.status != new_status:
                detail.status = new_status
                detail.save(update_fields=["status"])
                
                # Mark to avoid recursion
                detail._updating = True
                
                # Update parent test request status
                if detail.test_request:
                    detail.test_request.update_status_from_details()
                    
        except TestRequestDetail.DoesNotExist:
            pass

@receiver(post_save, sender=PaymentDetail)
def trigger_bill_update_on_payment(sender, instance, created, **kwargs):
    """
    When payment details are added, trigger bill update
    """
    if instance.bill and created:
        # Force bill to recalculate totals
        instance.bill.update_totals()
        # The post_save on Bill will handle the lab update
