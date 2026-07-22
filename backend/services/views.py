# services/views.py
from rest_framework import generics, permissions, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from django.db import transaction
from django.db.models import Q
from django.shortcuts import get_object_or_404
from django.contrib.contenttypes.models import ContentType

from .models import Service, ServiceCategory, ServiceRequest, ServiceRequestDetail
from .serializers import (
    ServiceSerializer,
    ServiceCategorySerializer,
    ServiceCategoryWithServicesSerializer,
    ServiceRequestSerializer,
    ServiceRequestDetailUpdateSerializer,
)


class ServiceListView(generics.ListAPIView):
    serializer_class = ServiceSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return (
            Service.objects.filter(is_active=True)
            .select_related("category")
            .order_by("category__name", "name")
        )


class ServiceCategoryListView(generics.ListAPIView):
    serializer_class = ServiceCategorySerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return ServiceCategory.objects.filter(is_active=True).order_by("name")


class ServicesByCategoryView(generics.RetrieveAPIView):
    serializer_class = ServiceCategoryWithServicesSerializer
    permission_classes = [permissions.IsAuthenticated]
    queryset = ServiceCategory.objects.filter(is_active=True)


class ServiceCreateView(generics.CreateAPIView):
    serializer_class = ServiceSerializer
    permission_classes = [permissions.IsAdminUser]
    queryset = Service.objects.all()


class ServiceRequestListCreateView(generics.ListCreateAPIView):
    serializer_class = ServiceRequestSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        qs = (
            ServiceRequest.objects
            .select_related("patient", "requested_by", "encounter_route")
            .prefetch_related("details__service", "details__service__category")
            .order_by("-date_requested")
        )

        patient_id = self.request.query_params.get("patient")
        if patient_id:
            qs = qs.filter(patient_id=patient_id)
        return qs


class ServiceRequestDetailView(generics.RetrieveUpdateAPIView):
    """Get or update a specific service request"""
    serializer_class = ServiceRequestSerializer
    permission_classes = [permissions.IsAuthenticated]
    lookup_field = 'id'
    
    def get_queryset(self):
        return ServiceRequest.objects.select_related(
            'patient', 'requested_by', 'encounter_route'
        ).prefetch_related('details__service', 'details__service__category')


class ServiceRequestDetailItemUpdateView(generics.UpdateAPIView):
    """Update a specific service detail (e.g., mark as paid)"""
    serializer_class = ServiceRequestDetailUpdateSerializer
    permission_classes = [permissions.IsAuthenticated]
    queryset = ServiceRequestDetail.objects.all()
    lookup_field = 'id'
    
    @transaction.atomic
    def update(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        detail = serializer.save()
        
        # Update parent request status
        if detail.request:
            detail.request.update_overall_status()
        
        return Response(serializer.data, status=status.HTTP_200_OK)


class CheckPatientAccessView(APIView):
    """
    Check if a patient can access the folder/clinic workflow
    Returns whether registration/consultation fees are paid
    """
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request, patient_id):
        # Get the most recent service request for this patient
        latest_service_request = ServiceRequest.objects.filter(
            patient_id=patient_id
        ).order_by('-date_requested').first()
        
        if not latest_service_request:
            # No service requests, allow access (new patient not yet billed)
            return Response({
                "can_access": True,
                "requires_payment": False,
                "message": "No pending service fees"
            })
        
        can_access = latest_service_request.can_access_patient_folder()
        
        if can_access:
            return Response({
                "can_access": True,
                "requires_payment": False,
                "message": "All required fees are paid"
            })
        else:
            # Get unpaid services
            unpaid_services = latest_service_request.details.filter(
                service__name__icontains='Registration'
            ).exclude(status__in=['paid', 'in_progress']) | \
            latest_service_request.details.filter(
                service__name__icontains='Consultation'
            ).exclude(status__in=['paid', 'in_progress'])
            
            service_names = [f"{d.service.name} (₦{d.total_amount})" for d in unpaid_services]
            
            return Response({
                "can_access": False,
                "requires_payment": True,
                "message": f"Payment required: {', '.join(service_names)}",
                "service_request_id": latest_service_request.id,
                "unpaid_services": service_names,
                "total_due": float(sum(d.total_amount for d in unpaid_services))
            })


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_uncompleted_service_requests(request, pid):
    status_list = ["pending", "partly_paid", "in_progress"]
    queryset = ServiceRequest.objects.filter(
        status__in=status_list, 
        patient_id=pid
    ).prefetch_related(
        "details__service", "details__service__category"
    ).order_by("-date_requested")
    serializer = ServiceRequestSerializer(queryset, many=True)
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def service_search(request):
    query = request.GET.get('q', '').strip()
    if not query:
        return Response([], status=200)

    services = Service.objects.filter(
        Q(name__icontains=query) | Q(category__name__icontains=query),
        is_active=True
    ).select_related('category')[:20]

    serializer = ServiceSerializer(services, many=True)
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_patient_service_requests(request, patient):
    services = ServiceRequest.objects.filter(patient=patient)
    serializer = ServiceRequestSerializer(services, many=True)
    return Response(serializer.data)