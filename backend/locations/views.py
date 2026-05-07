from rest_framework.generics import *
from django.db.models import Count, OuterRef, Subquery, Q

from .models import *
from .serializers import *
from patients.models import Patient
from patients.serializers import PatientSerializer
from encounters.models import EncounterRoute, Visit


class ClinicListCreateView(ListCreateAPIView):
    serializer_class = ClinicSerializer

    def get_queryset(self):
        # Subquery to find latest clinic for each Visit
        latest_route = (
            EncounterRoute.objects.filter(visit=OuterRef("pk"))
            .order_by("-date_created")
            .values("out_patient_transfer_id")[:1]
        )

        # Subquery to count patients whose latest clinic = this clinic
        patient_count_subquery = (
            Visit.objects.annotate(latest_clinic=Subquery(latest_route))
            .filter(
                latest_clinic=OuterRef("pk"),
                visit_status=True,
            )
            .values("latest_clinic")
            .annotate(c=Count("patient", distinct=True))
            .values("c")[:1]
        )

        queryset = (
            Clinic.objects.annotate(
                patient_count=Subquery(patient_count_subquery)
            )
            .order_by("name")
        )

        return queryset
    

class ClinicDetailView(RetrieveUpdateDestroyAPIView):
    queryset = Clinic.objects.all()
    serializer_class = ClinicSerializer

class WardListCreateView(ListCreateAPIView):
    serializer_class = WardSerializer
    
    def get_queryset(self):
        # Subquery to find latest clinic for each Visit
        latest_route = (
            EncounterRoute.objects.filter(visit=OuterRef("pk"))
            .order_by("-date_created")
            .values("in_patient_transfer_id")[:1]
        )

        # Subquery to count patients whose latest clinic = this clinic
        patient_count_subquery = (
            Visit.objects.annotate(latest_ward=Subquery(latest_route))
            .filter(
                latest_ward=OuterRef("pk"),
                visit_status=True,
            )
            .values("latest_ward")
            .annotate(c=Count("patient", distinct=True))
            .values("c")[:1]
        )

        queryset = (
            Ward.objects.annotate(
                patient_count=Subquery(patient_count_subquery)
            )
            .order_by("name")
        )

        return queryset
    

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
      

class WardRoomsWithBedsView(ListAPIView):
    serializer_class = RoomSerializer

    def get_queryset(self):
        ward_id = self.kwargs.get("ward_id")
        return Room.objects.filter(ward_id=ward_id)