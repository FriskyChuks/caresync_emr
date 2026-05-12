# services/serializers.py
from rest_framework import serializers
from .models import (
    ServiceCategory,
    Service,
    ServiceRequest,
    ServiceRequestDetail,
)

class ServiceCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = ServiceCategory
        fields = ["id", "name", "description", "is_active"]


class ServiceSerializer(serializers.ModelSerializer):
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
    service_name = serializers.CharField(source="service.name", read_only=True)
    category_name = serializers.CharField(source="service.category.name", read_only=True)
    total_amount = serializers.SerializerMethodField()
    can_deliver = serializers.SerializerMethodField()
    status_display = serializers.SerializerMethodField()

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
            "status_display",
            "total_amount",
            "can_deliver",
        ]

    def get_total_amount(self, obj):
        return obj.quantity * obj.unit_price
    
    def get_can_deliver(self, obj):
        return obj.can_deliver_service()
    
    def get_status_display(self, obj):
        status_labels = {
            'pending': 'Pending Payment',
            'billed': 'Awaiting Payment',
            'partly_paid': 'Partly Paid',
            'paid': 'Paid - Ready',
            'completed': 'Completed'
        }
        return status_labels.get(obj.status, obj.status)


class ServiceRequestSerializer(serializers.ModelSerializer):
    details = ServiceRequestDetailSerializer(many=True)
    total_amount = serializers.SerializerMethodField()
    patient_name = serializers.CharField(source="patient.user_info.fullname", read_only=True)
    encounter_name = serializers.CharField(source="encounter_route.name", read_only=True, default=None)
    can_access_folder = serializers.SerializerMethodField()
    payment_summary = serializers.SerializerMethodField()

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
            "can_access_folder",
            "payment_summary",
        ]

    def get_total_amount(self, obj):
        return sum(d.total_amount for d in obj.details.all())
    
    def get_can_access_folder(self, obj):
        return obj.can_access_patient_folder()
    
    def get_payment_summary(self, obj):
        """Get payment summary for this service request"""
        details = obj.details.all()
        paid_count = sum(1 for d in details if d.is_payment_complete())
        total_count = details.count()
        
        return {
            "total": total_count,
            "paid": paid_count,
            "pending": total_count - paid_count,
            "all_paid": paid_count == total_count
        }

    def create(self, validated_data):
        details_data = validated_data.pop("details", [])
        service_request = ServiceRequest.objects.create(**validated_data)
        for detail_data in details_data:
            ServiceRequestDetail.objects.create(request=service_request, **detail_data)
        
        # Update overall status
        service_request.update_overall_status()
        return service_request


class ServiceRequestDetailUpdateSerializer(serializers.ModelSerializer):
    """Serializer for updating individual service details"""
    
    class Meta:
        model = ServiceRequestDetail
        fields = ['id', 'status']
    
    def update(self, instance, validated_data):
        instance.status = validated_data.get('status', instance.status)
        instance.save()
        return instance