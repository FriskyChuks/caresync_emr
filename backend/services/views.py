from rest_framework import generics, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.db.models import Q

from .models import Service, ServiceCategory, ServiceRequest
from .serializers import (
    ServiceSerializer,
    ServiceCategorySerializer,
    ServiceCategoryWithServicesSerializer,
    ServiceRequestSerializer,
)


# 1️⃣ List all active services
class ServiceListView(generics.ListAPIView):
    """
    Returns all active services with category name and price.
    """
    serializer_class = ServiceSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return (
            Service.objects.filter(is_active=True)
            .select_related("category")
            .order_by("category__name", "name")
        )


# 2️⃣ List all active categories
class ServiceCategoryListView(generics.ListAPIView):
    """
    Returns all active service categories.
    """
    serializer_class = ServiceCategorySerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return ServiceCategory.objects.filter(is_active=True).order_by("name")


# 3️⃣ List all services under a given category
class ServicesByCategoryView(generics.RetrieveAPIView):
    """
    Returns a category and its services.
    Example: GET /servicesapi/categories/2/services/
    """
    serializer_class = ServiceCategoryWithServicesSerializer
    permission_classes = [permissions.IsAuthenticated]
    queryset = ServiceCategory.objects.filter(is_active=True)


# 4️⃣ Admin-only endpoint to create new services
class ServiceCreateView(generics.CreateAPIView):
    serializer_class = ServiceSerializer
    permission_classes = [permissions.IsAdminUser]
    queryset = Service.objects.all()


# 5️⃣ Combined endpoint for listing & creating grouped service requests
class ServiceRequestListCreateView(generics.ListCreateAPIView):
    """
    Allows listing (GET) and creating (POST) grouped patient service requests.
    Accepts optional ?patient=<id> filter.
    """
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
    

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_uncompleted_service_requests(request,pid):
    status=["pending","in_progress"]
    queryset = ServiceRequest.objects.filter(status__in=status, patient_id=pid).prefetch_related(
        "details__service", "details__service__category").order_by("-date_requested")
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
    ).select_related('category')[:20]  # Limit results for performance

    serializer = ServiceSerializer(services, many=True)
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_patient_service_requests(request, patient):
    services = ServiceRequest.objects.filter(patient=patient)
    serializer = ServiceRequestSerializer(services, many=True)
    data = serializer.data

    return Response(data)
