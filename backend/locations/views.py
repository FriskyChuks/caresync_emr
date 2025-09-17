from rest_framework.generics import *
from django.db.models import OuterRef, Subquery

from .models import Clinic, Ward
from .serializers import ClinicSerializer, WardSerializer
from patients.models import Patient
from patients.serializers import PatientSerializer
from encounters.models import EncounterRoute, Visit


class ClinicListCreateView(ListCreateAPIView):
    queryset = Clinic.objects.all()
    serializer_class = ClinicSerializer

class ClinicDetailView(RetrieveUpdateDestroyAPIView):
    queryset = Clinic.objects.all()
    serializer_class = ClinicSerializer

class WardListCreateView(ListCreateAPIView):
    queryset = Ward.objects.all()
    serializer_class = WardSerializer

class WardDetailView(RetrieveUpdateDestroyAPIView):
    queryset = Ward.objects.all()
    serializer_class = WardSerializer


class ClinicPatientListView(ListAPIView):
    serializer_class = PatientSerializer

    def get_queryset(self):
        clinic_id = self.kwargs["pk"]

        # Subquery: latest route for this visit
        latest_route = (
            EncounterRoute.objects.filter(visit=OuterRef("pk"))
            .order_by("-date_created")  # or -id
            .values("out_patient_transfer_id")[:1]
        )

        # Patients with active visit whose latest route clinic = requested clinic
        return Patient.objects.filter(
            visits__visit_status=True,
            visits__id__in=Visit.objects.annotate(
                latest_clinic=Subquery(latest_route)
            ).filter(latest_clinic=clinic_id)
        ).distinct()
    

class WardPatientListView(ListAPIView):
    serializer_class = PatientSerializer

    def get_queryset(self):
        ward_id = self.kwargs["pk"]

        # Subquery: latest route for this visit
        latest_route = (
            EncounterRoute.objects.filter(visit=OuterRef("pk"))
            .order_by("-date_created")  # or -id
            .values("in_patient_transfer_id")[:1]
        )

        # Patients with active visit whose latest route clinic = requested clinic
        return Patient.objects.filter(
            visits__visit_status=True,
            visits__id__in=Visit.objects.annotate(
                latest_ward=Subquery(latest_route)
            ).filter(latest_ward=ward_id)
        ).distinct()

