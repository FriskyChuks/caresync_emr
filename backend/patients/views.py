from rest_framework import generics, filters
from django.db.models import Q
from accounts.models import CustomUser
from accounts.serializers import CustomUserCreateSerializer

from .models import Patient
from .serializers import PatientSerializer


class PatientListCreateView(generics.ListAPIView):
    queryset = Patient.objects.all()
    serializer_class = PatientSerializer
    # permission_classes = [IsAuthenticated] 


class PatientDetailView(generics.RetrieveAPIView):
    queryset = Patient.objects.all()
    serializer_class = PatientSerializer
    lookup_field = "id"   # default anyway


class PatientSearchView(generics.ListAPIView):
    serializer_class = CustomUserCreateSerializer

    def get_queryset(self):
        query = self.request.query_params.get("q", "")
        if not query:
            return CustomUser.objects.none()

        return CustomUser.objects.filter(
            Q(first_name__icontains=query) |
            Q(last_name__icontains=query) |
            Q(patient_profile__id__iexact=query) |  # search by PID
            Q(patient_profile__phone__icontains=query) |
            Q(email__icontains=query)
        ).select_related("patient_profile")
