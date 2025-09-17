from rest_framework import status, generics
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from .models import Visit, EncounterRoute
from patients.models import Patient
from .serializers import VisitSerializer
from locations.models import Clinic, Ward

class SendToClinicView(generics.GenericAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = VisitSerializer

    def post(self, request, *args, **kwargs):
        patient_id = request.data.get("patient_id")
        clinic_id = request.data.get("clinic_id")
        ward_id = request.data.get("ward_id")

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

        # 🔎 Lookups for Clinic / Ward
        clinic = None
        ward = None

        if clinic_id:
            try:
                clinic = Clinic.objects.get(id=int(clinic_id))
            except (Clinic.DoesNotExist, ValueError, TypeError):
                return Response({"error": "Clinic not found"}, status=status.HTTP_400_BAD_REQUEST)

        if ward_id:
            try:
                ward = Ward.objects.get(id=int(ward_id))
            except (Ward.DoesNotExist, ValueError, TypeError):
                return Response({"error": "Ward not found"}, status=status.HTTP_400_BAD_REQUEST)

        # ✅ Always create EncounterRoute
        EncounterRoute.objects.create(
            visit=visit,
            transferred_by=request.user,
            out_patient_transfer=clinic,
            in_patient_transfer=ward,
        )

        serializer = self.get_serializer(visit)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

