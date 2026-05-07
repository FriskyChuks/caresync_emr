from rest_framework import status, generics
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django.shortcuts import get_object_or_404

from .models import *
from patients.models import Patient
from .serializers import *
from locations.models import *


def get_active_encounter(patient):
        """Retrieve the active encounter for a patient, if any."""
        encounter = None
        try:
            visit = Visit.objects.filter(patient=patient, visit_status=True).latest('date_created')
            if visit:
                encounter = EncounterRoute.objects.filter(visit=visit).latest('date_created')  # Ensure there's an active route
            return encounter
        except Visit.DoesNotExist:
            return encounter


class TransferPatientView(generics.GenericAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = VisitSerializer

    def post(self, request, *args, **kwargs):
        patient_id = request.data.get("patient_id")
        clinic_id = request.data.get("clinic_id")  # destination clinic
        ward_id = request.data.get("ward_id")      # destination ward
        from_clinic_id = request.data.get("from_clinic_id")
        from_ward_id = request.data.get("from_ward_id")

        if not patient_id:
            return Response({"error": "patient_id is required"}, status=status.HTTP_400_BAD_REQUEST)

        # 🔎 Ensure patient exists
        try:
            patient = Patient.objects.get(id=int(patient_id))
        except (Patient.DoesNotExist, ValueError, TypeError):
            return Response({"error": "Patient not found"}, status=status.HTTP_404_NOT_FOUND)

        # ✅ Check if active visit exists or create one
        visit = Visit.objects.filter(patient=patient, visit_status=True).last()
        if not visit:
            visit = Visit.objects.create(
                patient=patient,
                send_by=request.user,
                is_inpatient=bool(ward_id),
            )

        # --- Handle Clinic Transfer ---
        if clinic_id:
            try:
                clinic = Clinic.objects.get(id=int(clinic_id))
            except (Clinic.DoesNotExist, ValueError, TypeError):
                return Response({"error": "Clinic not found"}, status=status.HTTP_400_BAD_REQUEST)

            EncounterRoute.objects.create(
                visit=visit,
                transferred_by=request.user,
                out_patient_transfer=clinic,
                # from_clinic_id=from_clinic_id if from_clinic_id else None,
                # from_ward_id=from_ward_id if from_ward_id else None,
            )

            serializer = self.get_serializer(visit)
            return Response(serializer.data, status=status.HTTP_201_CREATED)

        # --- Handle Ward Transfer (pending admission) ---
        if ward_id:
            try:
                ward = Ward.objects.get(id=int(ward_id))
            except (Ward.DoesNotExist, ValueError, TypeError):
                return Response({"error": "Ward not found"}, status=status.HTTP_400_BAD_REQUEST)

            # ✅ store BOTH from_clinic and from_ward
            TransferRequest.objects.create(
                visit=visit,
                from_clinic_id=from_clinic_id if from_clinic_id else None,
                from_ward_id=from_ward_id if from_ward_id else None,
                to_ward=ward,
                requested_by=request.user,
                status="pending",
            )

            return Response(
                {"message": "Transfer request created, awaiting ward acceptance."},
                status=status.HTTP_202_ACCEPTED
            )

        return Response(
            {"error": "Either clinic_id or ward_id is required"},
            status=status.HTTP_400_BAD_REQUEST
        )


class AcceptTransferView(generics.GenericAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = VisitSerializer

    def post(self, request, *args, **kwargs):
        transfer_id = request.data.get("transfer_request_id")
        room_id = request.data.get("room_id")
        bed_number = request.data.get("bed_number")

        if not transfer_id:
            return Response({"error": "transfer_request_id is required"}, status=status.HTTP_400_BAD_REQUEST)
        if not room_id:
            return Response({"error": "room_id is required"}, status=status.HTTP_400_BAD_REQUEST)
        if not bed_number:
            return Response({"error": "bed_number is required"}, status=status.HTTP_400_BAD_REQUEST)

        # 🔎 Get pending transfer request
        try:
            transfer = TransferRequest.objects.select_related("visit", "to_ward").get(
                id=int(transfer_id), status="pending"
            )
        except (TransferRequest.DoesNotExist, ValueError, TypeError):
            return Response({"error": "Pending transfer request not found"}, status=status.HTTP_404_NOT_FOUND)

        visit = transfer.visit
        ward = transfer.to_ward

        # 🔎 Validate room belongs to ward
        try:
            room = Room.objects.get(id=int(room_id), ward=ward)
        except (Room.DoesNotExist, ValueError, TypeError):
            return Response({"error": "Room not found in this ward"}, status=status.HTTP_400_BAD_REQUEST)

        # 🔎 Validate bed number is available
        current_assignments = ward.incoming_transfers.filter(
            status="accepted", assigned_room=room
        ).values_list("assigned_bed_number", flat=True)

        bed_number = int(bed_number)
        if bed_number not in room.available_beds(current_assignments=list(current_assignments)):
            return Response(
                {"error": f"Bed {bed_number} is not available in room {room.name}"},
                status=status.HTTP_400_BAD_REQUEST
            )

        # ✅ Accept transfer and assign bed
        try:
            transfer.accept(request.user, room=room, bed_number=bed_number)
        except ValueError as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

        # ✅ Create EncounterRoute (no room/bed fields)
        EncounterRoute.objects.create(
            visit=visit,
            transferred_by=request.user,
            in_patient_transfer=ward
        )

        # ✅ Return updated visit
        serializer = self.get_serializer(visit)
        return Response(serializer.data, status=status.HTTP_200_OK)
    

@api_view(["POST"])
@permission_classes([IsAuthenticated])
def reject_transfer(request):
    """
    Ward in-charge rejects a transfer request.
    Expects: { "transfer_id": int, "reason": str }
    """
    transfer_id = request.data.get("transfer_id")
    reason = request.data.get("reason")

    if not transfer_id:
        return Response({"error": "transfer_id is required"}, status=status.HTTP_400_BAD_REQUEST)

    transfer = get_object_or_404(TransferRequest, id=transfer_id)

    try:
        transfer.reject(user=request.user, reason=reason)
    except ValueError as e:
        return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

    return Response(
        {
            "message": "Transfer rejected successfully",
            "transfer_id": transfer.id,
            "status": transfer.status,
            "rejected_at": transfer.rejected_at,
            "rejection_reason": transfer.rejection_reason,
        },
        status=status.HTTP_200_OK,
    )
  

class IncomingTransfersForWardView(generics.ListAPIView):
    serializer_class = TransferRequestSerializer

    def get_queryset(self):
        ward_id = self.kwargs["ward_id"]
        return TransferRequest.objects.filter(
            to_ward_id=ward_id, status="pending"
        ).select_related(
            "visit__patient__user", "from_clinic", "from_ward", "requested_by"
        )
    

# --- Discharge Reasons ---
class DischargeReasonListCreateView(generics.ListCreateAPIView):
    queryset = DischargeReason.objects.all()
    serializer_class = DischargeReasonSerializer


# --- Discharge ---
class DischargeCreateView(generics.CreateAPIView):
    queryset = Discharge.objects.all()
    serializer_class = DischargeSerializer

    def perform_create(self, serializer):
        """
        Create a discharge record.
        - If payload contains a summary -> treat as doctor filling summary -> set summary_by.
        - If payload does NOT contain a summary -> treat as immediate discharge (clinic) -> set discharged_by.
        After save:
        - If visit is outpatient -> immediately close visit (visit_status=False).
        - If inpatient and reason is already present on the created object -> close visit.
        """
        validated = serializer.validated_data
        # Decide which user-field to populate
        if validated.get("summary"):  # doctor creating a summary
            discharge = serializer.save(summary_by=self.request.user)
        else:
            # quick discharge (clinic) OR explicit creation with no summary:
            discharge = serializer.save(discharged_by=self.request.user)

        visit = discharge.visit

        # Outpatient -> always close immediately
        if not visit.is_inpatient:
            visit.visit_status = False
            visit.save(update_fields=["visit_status"])
            return

        # Inpatient: only close if discharge.reason already set on creation
        if discharge.reason:
            visit.visit_status = False
            visit.save(update_fields=["visit_status"])


class DischargeDetailView(generics.RetrieveUpdateAPIView):
    """
    Lookup discharge by visit_id so frontend can call:
      GET /encounter/discharge_details/<visit_id>/
      PATCH /encounter/discharge_details/<visit_id>/
    """
    queryset = Discharge.objects.all()
    serializer_class = DischargeSerializer
    lookup_field = "visit_id"   # important: lookup by visit_id not pk

    def get_object(self):
        # fallback to ensure we return the discharge object for the given visit_id
        visit_id = self.kwargs.get("visit_id")
        obj = get_object_or_404(Discharge, visit_id=visit_id)
        self.check_object_permissions(self.request, obj)
        return obj

    def perform_update(self, serializer):
        """
        When updating (nurse adds reason), set discharged_by and close visit if reason is present.
        """
        discharge = serializer.save(discharged_by=self.request.user)
        visit = discharge.visit

        # If this update has the reason field set (nurse confirming discharge) -> close visit.
        if discharge.reason:
            visit.visit_status = False
            visit.save(update_fields=["visit_status"])
