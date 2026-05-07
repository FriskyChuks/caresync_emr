from rest_framework import serializers
from .models import (
    ServiceCategory,
    Service,
    ServiceRequest,
    ServiceRequestDetail,
)


class ServiceCategorySerializer(serializers.ModelSerializer):
    """Serializer for grouping services (e.g., Consultation, Lab Tests, etc.)"""

    class Meta:
        model = ServiceCategory
        fields = ["id", "name", "description", "is_active"]


class ServiceSerializer(serializers.ModelSerializer):
    """Serializer for each individual billable service."""

    category_name = serializers.CharField(source="category.name", read_only=True)
    category_id = serializers.PrimaryKeyRelatedField(
        source="category", queryset=ServiceCategory.objects.filter(is_active=True)
    )

    class Meta:
        model = Service
        fields = [
            "id",
            "name",
            "description",
            "price",
            "category_id",
            "category_name",
            "is_active",
        ]


class ServiceCategoryWithServicesSerializer(serializers.ModelSerializer):
    services = ServiceSerializer(many=True, read_only=True)

    class Meta:
        model = ServiceCategory
        fields = ["id", "name", "description", "services"]


class ServiceRequestDetailSerializer(serializers.ModelSerializer):
    """Each line item under a grouped service request."""

    service_name = serializers.CharField(source="service.name", read_only=True)
    category_name = serializers.CharField(
        source="service.category.name", read_only=True
    )
    total_amount = serializers.SerializerMethodField()

    class Meta:
        model = ServiceRequestDetail
        fields = [
            "id",
            "service",
            "service_name",
            "category_name",
            "quantity",
            "unit_price",
            "status",
            "total_amount",
        ]

    def get_total_amount(self, obj):
        return obj.quantity * obj.unit_price


class ServiceRequestSerializer(serializers.ModelSerializer):
    """A grouped request representing multiple service items."""

    details = ServiceRequestDetailSerializer(many=True)
    total_amount = serializers.SerializerMethodField()
    patient_name = serializers.CharField(source="patient.user_info.fullname", read_only=True)
    encounter_name = serializers.CharField(source="encounter_route.name", read_only=True, default=None)

    class Meta:
        model = ServiceRequest
        fields = [
            "id",
            "patient",
            "patient_name",
            "requested_by",
            "encounter_route",
            "encounter_name",
            "note",
            "status",
            "date_requested",
            "date_updated",
            "details",
            "total_amount",
        ]

    def get_total_amount(self, obj):
        # Compute from related details
        return sum(d.total_amount for d in obj.details.all())

    def create(self, validated_data):
        details_data = validated_data.pop("details", [])
        service_request = ServiceRequest.objects.create(**validated_data)
        for detail_data in details_data:
            ServiceRequestDetail.objects.create(request=service_request, **detail_data)
        return service_request
