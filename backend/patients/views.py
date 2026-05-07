import logging

from rest_framework import generics, filters
from django.db.models import Q
from accounts.models import CustomUser
from accounts.serializers import CustomUserCreateSerializer
from rest_framework import generics, parsers
from rest_framework.permissions import IsAuthenticated
from .serializers import PatientPhotoSerializer

from .models import Patient
from .serializers import PatientSerializer


class PatientListCreateView(generics.ListAPIView):
    queryset = Patient.objects.all()
    serializer_class = PatientSerializer
    # permission_classes = [IsAuthenticated] 


class PatientPhotoUpdateView(generics.UpdateAPIView):
    queryset = Patient.objects.all()
    serializer_class = PatientPhotoSerializer
    permission_classes = [IsAuthenticated]
    parser_classes = [parsers.MultiPartParser, parsers.FormParser]
    
    def get_object(self):
        return Patient.objects.get(user=self.request.user)

logger = logging.getLogger(__name__)

class PatientDetailView(generics.RetrieveUpdateAPIView):
    queryset = Patient.objects.all()
    serializer_class = PatientSerializer
    lookup_field = 'id'
    lookup_url_kwarg = 'id'
    
    # Add parsers to handle both JSON and multipart/form-data
    parser_classes = [parsers.MultiPartParser, parsers.JSONParser, parsers.FormParser]
    
    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['request'] = self.request
        return context
    
    def update(self, request, *args, **kwargs):
        logger.debug(f"Update - Content-Type: {request.content_type}")
        logger.debug(f"Update - Data: {request.data}")
        logger.debug(f"Update - FILES: {request.FILES}")
        return super().update(request, *args, **kwargs)
    
    def partial_update(self, request, *args, **kwargs):
        logger.debug(f"Partial Update - Content-Type: {request.content_type}")
        logger.debug(f"Partial Update - Data: {request.data}")
        logger.debug(f"Partial Update - FILES: {request.FILES}")
        return super().partial_update(request, *args, **kwargs)


class PatientSearchView(generics.ListAPIView):
    serializer_class = CustomUserCreateSerializer

    def get_queryset(self):
        query = self.request.query_params.get("q", "")
        if not query:
            return CustomUser.objects.none()

        return (
            CustomUser.objects.filter(
                Q(first_name__icontains=query)
                | Q(last_name__icontains=query)
                | Q(patient_profile__id__iexact=query)
                | Q(patient_profile__phone__icontains=query)
                | Q(email__icontains=query)
            )
            .select_related(
                "patient_profile",        # ✅ patient profile
                "patient_profile__wallet" # ✅ wallet relation
            )
            .order_by("first_name")[:25]
        )


