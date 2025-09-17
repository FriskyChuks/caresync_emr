from rest_framework import generics
from rest_framework.permissions import IsAuthenticated
from .models import Triage
from .serializers import TriageSerializer
from patients.models import Patient


class PatientTriageListCreateView(generics.ListCreateAPIView):
    serializer_class = TriageSerializer

    def get_queryset(self):
        pid = self.kwargs.get("pid")
        return Triage.objects.filter(pid_id=pid).order_by("-date_recorded")

    def perform_create(self, serializer):
        pid = self.kwargs.get("pid")
        patient = Patient.objects.get(pk=pid)
        serializer.save(pid=patient)





