# radiology/serializers.py
from rest_framework import serializers
from .models import *

class UnitSerializer(serializers.ModelSerializer):
    class Meta:
        model = Unit
        fields = '__all__'

class InvestigationViewSerializer(serializers.ModelSerializer):
    class Meta:
        model = InvestigationView
        fields = ['id', 'title', 'price', 'date_created']
        read_only_fields = ['id', 'date_created']

class InvestigationCreateSerializer(serializers.ModelSerializer):
    views = InvestigationViewSerializer(many=True, required=False, write_only=True)
    
    class Meta:
        model = Investigation
        fields = [
            'id', 'title', 'radiology_unit', 'has_views', 
            'price', 'views', 'date_created', 'created_by'
        ]
        read_only_fields = ['id', 'date_created', 'created_by']
        extra_kwargs = {
            'created_by': {'read_only': True}
        }

    def validate(self, data):
        has_views = data.get('has_views', False)
        views_data = data.get('views', [])
        
        if has_views and not views_data:
            raise serializers.ValidationError({
                "views": "Views are required when has_views is True."
            })
        
        if not has_views and views_data:
            raise serializers.ValidationError({
                "views": "Cannot provide views when has_views is False."
            })
            
        return data

    def create(self, validated_data):
        views_data = validated_data.pop('views', [])
        request = self.context.get('request')
        
        if request and request.user.is_authenticated:
            validated_data['created_by'] = request.user
        
        investigation = Investigation.objects.create(**validated_data)
        
        for view_data in views_data:
            InvestigationView.objects.create(
                investigation=investigation,
                created_by=request.user if request and request.user.is_authenticated else None,
                **view_data
            )
        
        return investigation

class InvestigationSerializer(serializers.ModelSerializer):
    views = InvestigationViewSerializer(many=True, read_only=True)
    radiology_unit_title = serializers.CharField(source='radiology_unit.title', read_only=True)
    
    class Meta:
        model = Investigation
        fields = [
            'id', 'title', 'radiology_unit', 'radiology_unit_title', 
            'has_views', 'price', 'views', 'date_created', 'created_by'
        ]

# UPDATED: RequestDetailSerializer with payment status and comment support
class RequestDetailSerializer(serializers.ModelSerializer):
    investigation_title = serializers.CharField(source='investigation.title', read_only=True)
    investigation_view_title = serializers.CharField(source='investigation_view.title', read_only=True, allow_null=True)
    can_enter_results = serializers.SerializerMethodField()
    status_display = serializers.SerializerMethodField()

    class Meta:
        model = RequestDetail
        fields = [
            'id', 'investigation', 'investigation_title', 'investigation_view', 
            'investigation_view_title', 'quantity', 'unit_price', 'total_price',
            'status', 'status_display', 'priority', 'notes', 'radiologist_comment',
            'can_enter_results', 'date_created', 'last_updated'
        ]
        read_only_fields = ['total_price', 'date_created', 'last_updated']

    def get_can_enter_results(self, obj):
        return obj.can_enter_results()
    
    def get_status_display(self, obj):
        return dict(REQUEST_STATUS).get(obj.status, obj.status)

# radiology/serializers.py

class RequestDetailListSerializer(serializers.ModelSerializer):
    investigation_title = serializers.CharField(source='investigation.title', read_only=True)
    investigation_view_title = serializers.CharField(source='investigation_view.title', read_only=True, allow_null=True)
    investigation_id = serializers.IntegerField(source='investigation.id', read_only=True)
    can_enter_results = serializers.SerializerMethodField()
    status_display = serializers.SerializerMethodField()
    is_paid = serializers.SerializerMethodField()  # NEW

    class Meta:
        model = RequestDetail
        fields = [
            'id', 'investigation_id', 'investigation_title', 'investigation_view', 
            'investigation_view_title', 'quantity', 'unit_price', 'total_price',
            'status', 'status_display', 'priority', 'notes', 'radiologist_comment',
            'can_enter_results', 'is_paid', 'date_created'
        ]

    def get_can_enter_results(self, obj):
        return obj.can_enter_results()
    
    def get_status_display(self, obj):
        status_labels = {
            'pending': 'Pending Payment',
            'billed': 'Awaiting Payment',
            'partly_billed': 'Partly Billed',
            'partly_paid': 'Partly Paid',
            'paid': 'Paid - Ready',
            'in_progress': 'In Progress',
            'completed': 'Completed'
        }
        return status_labels.get(obj.status, obj.status)
    
    def get_is_paid(self, obj):
        """Check if detail is paid and ready for results"""
        return obj.status in ['paid', 'in_progress']

class InvestigationRequestDetailSerializer(serializers.ModelSerializer):
    patient_name = serializers.SerializerMethodField(read_only=True)
    patient_id = serializers.SerializerMethodField(read_only=True)
    patient_gender = serializers.SerializerMethodField(read_only=True)
    patient_age = serializers.SerializerMethodField(read_only=True)
    patient_phone = serializers.SerializerMethodField(read_only=True)
    created_by_name = serializers.CharField(source='created_by.get_full_name', read_only=True)
    details = RequestDetailListSerializer(many=True, read_only=True)
    payment_summary = serializers.SerializerMethodField()

    class Meta:
        model = InvestigationRequest
        fields = [
            'id', 'patient', 'patient_name', 'patient_id', 'patient_gender', 
            'patient_age', 'patient_phone', 'clinical_notes', 'urgency', 
            'status', 'total_amount', 'created_by', 'created_by_name', 
            'date_created', 'last_updated', 'details', 'payment_summary'
        ]

    def get_patient_name(self, obj):
        if obj.patient and obj.patient.user:
            return f"{obj.patient.user.first_name} {obj.patient.user.last_name}".strip()
        return f"Patient #{obj.patient.id}" if obj.patient else "Unknown"

    def get_patient_id(self, obj):
        return obj.patient.id if obj.patient else None

    def get_patient_gender(self, obj):
        if obj.patient and obj.patient.user:
            return obj.patient.user.gender.title if hasattr(obj.patient.user, 'gender') else None
        return None

    def get_patient_age(self, obj):
        if obj.patient:
            return obj.patient.age if hasattr(obj.patient, 'age') else None
        return None

    def get_patient_phone(self, obj):
        if obj.patient and obj.patient.user:
            return obj.patient.user.phone if hasattr(obj.patient.user, 'phone') else None
        return None

    def get_payment_summary(self, obj):
        """Get payment status summary across all details"""
        details = obj.details.all()
        if not details:
            return {"total": 0, "paid": 0, "pending_payment": 0, "all_paid": False}
        
        payment_complete_statuses = ["paid", "in_progress", "completed"]
        paid_count = sum(1 for d in details if d.status in payment_complete_statuses)
        pending_count = details.count() - paid_count
        
        return {
            "total": details.count(),
            "paid": paid_count,
            "pending_payment": pending_count,
            "all_paid": paid_count == details.count()
        }

# radiology/serializers.py - Update InvestigationRequestListSerializer

class InvestigationRequestListSerializer(serializers.ModelSerializer):
    patient_name = serializers.SerializerMethodField(read_only=True)
    patient_id = serializers.CharField(source='patient.id', read_only=True)
    patient_gender = serializers.SerializerMethodField(read_only=True)
    patient_age = serializers.SerializerMethodField(read_only=True)
    created_by_name = serializers.CharField(source='created_by.get_full_name', read_only=True)
    details_count = serializers.SerializerMethodField()
    completed_details_count = serializers.SerializerMethodField()
    
    class Meta:
        model = InvestigationRequest
        fields = [
            'id', 'patient', 'patient_name', 'patient_id', 'patient_gender',
            'patient_age', 'clinical_notes', 'urgency', 'status', 'total_amount', 
            'created_by', 'created_by_name', 'date_created', 'last_updated', 
            'details_count', 'completed_details_count'
        ]
        read_only_fields = ['total_amount', 'date_created', 'last_updated']
    
    def get_details_count(self, obj):
        return obj.details.count()
    
    def get_patient_name(self, obj):
        if obj.patient and obj.patient.user:
            return f"{obj.patient.user.first_name} {obj.patient.user.last_name}".strip()
        return f"Patient #{obj.patient.id}" if obj.patient else "Unknown"
    
    def get_patient_gender(self, obj):
        if obj.patient and obj.patient.user:
            return obj.patient.user.gender.title if hasattr(obj.patient.user, 'gender') else None
        return None
    
    def get_patient_age(self, obj):
        if obj.patient:
            return obj.patient.age if hasattr(obj.patient, 'age') else None
        return None

class InvestigationRequestCreateSerializer(serializers.ModelSerializer):
    details = RequestDetailSerializer(many=True, required=False)
    
    class Meta:
        model = InvestigationRequest
        fields = [
            'id', 'patient', 'clinical_notes', 'urgency', 
            'status', 'created_by', 'details'
        ]
        read_only_fields = ['status', 'created_by']
    
    def create(self, validated_data):
        details_data = validated_data.pop('details', [])
        request = InvestigationRequest.objects.create(**validated_data)
        
        for detail_data in details_data:
            RequestDetail.objects.create(request=request, **detail_data)
        
        request.update_total_amount()
        return request

# UPDATED: RequestDetailStatusUpdateSerializer with comment support
class RequestDetailStatusUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = RequestDetail
        fields = ['id', 'status', 'notes', 'radiologist_comment']
    
    def update(self, instance, validated_data):
        instance.status = validated_data.get('status', instance.status)
        instance.notes = validated_data.get('notes', instance.notes)
        instance.radiologist_comment = validated_data.get('radiologist_comment', instance.radiologist_comment)
        instance.save()
        return instance

class InvestigationRequestStatusUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = InvestigationRequest
        fields = ['id', 'status', 'clinical_notes']
    
    def update(self, instance, validated_data):
        instance.status = validated_data.get('status', instance.status)
        instance.clinical_notes = validated_data.get('clinical_notes', instance.clinical_notes)
        instance.save()
        return instance

class AddRequestDetailSerializer(serializers.ModelSerializer):
    class Meta:
        model = RequestDetail
        fields = [
            'id', 'investigation', 'investigation_view', 'quantity', 
            'unit_price', 'priority', 'notes'
        ]
    
    def create(self, validated_data):
        request = self.context['request_obj']
        return RequestDetail.objects.create(request=request, **validated_data)


# radiology/serializers.py

class InvestigationRequestDashboardSerializer(serializers.ModelSerializer):
    patient_name = serializers.SerializerMethodField(read_only=True)
    patient_id = serializers.CharField(source='patient.id', read_only=True)
    patient_gender = serializers.SerializerMethodField(read_only=True)
    patient_age = serializers.SerializerMethodField(read_only=True)
    patient_phone = serializers.SerializerMethodField(read_only=True)
    created_by_name = serializers.CharField(source='created_by.get_full_name', read_only=True)
    details_count = serializers.SerializerMethodField()
    completed_details_count = serializers.SerializerMethodField()
    paid_details_count = serializers.SerializerMethodField()
    pending_payment_count = serializers.SerializerMethodField()
    pending_results_count = serializers.SerializerMethodField()  # NEW
    needs_attention = serializers.SerializerMethodField()  # NEW
    details = RequestDetailListSerializer(many=True, read_only=True)
    
    class Meta:
        model = InvestigationRequest
        fields = [
            'id', 'patient', 'patient_name', 'patient_id', 'patient_gender',
            'patient_age', 'patient_phone', 'clinical_notes', 'urgency', 
            'status', 'total_amount', 'created_by', 'created_by_name',
            'date_created', 'last_updated', 'details_count', 
            'completed_details_count', 'paid_details_count', 
            'pending_payment_count', 'pending_results_count', 'needs_attention', 'details'
        ]
        read_only_fields = ['total_amount', 'date_created', 'last_updated']
    
    def get_details_count(self, obj):
        return obj.details.count()
    
    def get_completed_details_count(self, obj):
        return obj.details.filter(status='completed').count()
    
    def get_paid_details_count(self, obj):
        """Count of details that are paid or in_progress (ready for results but not completed)"""
        return obj.details.filter(status__in=['paid', 'in_progress']).count()
    
    def get_pending_payment_count(self, obj):
        """Count of details pending payment"""
        return obj.details.filter(status__in=['pending', 'billed', 'partly_billed']).count()
    
    def get_pending_results_count(self, obj):
        """Count of details that are paid but not yet completed"""
        return obj.details.filter(status__in=['paid', 'in_progress']).count()
    
    def get_needs_attention(self, obj):
        """Determine if request needs attention (has pending work)"""
        return (
            self.get_pending_payment_count(obj) > 0 or 
            self.get_pending_results_count(obj) > 0
        )
    
    def get_patient_name(self, obj):
        if obj.patient and obj.patient.user:
            return f"{obj.patient.user.first_name} {obj.patient.user.last_name}".strip()
        return f"Patient #{obj.patient.id}" if obj.patient else "Unknown"
    
    def get_patient_id(self, obj):
        return obj.patient.id if obj.patient else None
    
    def get_patient_gender(self, obj):
        if obj.patient and obj.patient.user:
            return obj.patient.user.gender.title if hasattr(obj.patient.user, 'gender') else None
        return None
    
    def get_patient_age(self, obj):
        if obj.patient:
            return obj.patient.age if hasattr(obj.patient, 'age') else None
        return None
    
    def get_patient_phone(self, obj):
        if obj.patient and obj.patient.user:
            return obj.patient.user.phone if hasattr(obj.patient.user, 'phone') else None
        return None


# UPDATED: InvestigationResultCreateSerializer with payment check
class InvestigationResultCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = InvestigationResult
        fields = [
            'id', 'request_detail', 'result', 'comments', 'diagnosis', 'findings',
            'attachments', 'is_abnormal', 'supervised_by', 'created_by'
        ]
        extra_kwargs = {
            'supervised_by': {'allow_blank': True, 'allow_null': True}
        }
    
    def create(self, validated_data):
        request_detail = validated_data.get('request_detail')
        
        # Check payment status before allowing result entry
        if not request_detail.can_enter_results():
            raise serializers.ValidationError({
                "request_detail": f"Cannot enter results - payment status is {request_detail.get_status_display()}"
            })
        
        result = super().create(validated_data)
        result.request_detail.status = 'completed'
        result.request_detail.save()
        return result

class InvestigationResultSerializer(serializers.ModelSerializer):
    request_detail_id = serializers.IntegerField(source='request_detail.id', read_only=True)
    investigation_title = serializers.CharField(source='request_detail.investigation.title', read_only=True)
    patient_data = serializers.SerializerMethodField(read_only=True)
    created_by_name = serializers.SerializerMethodField(read_only=True)
    
    class Meta:
        model = InvestigationResult
        fields = [
            'id', 'request_detail', 'request_detail_id', 'investigation_title', 'patient_data',
            'result', 'comments', 'diagnosis', 'findings', 'attachments', 'is_abnormal',
            'supervised_by', 'created_by', 'created_by_name',
            'date_created', 'date_verified'
        ]
        read_only_fields = ['date_created', 'date_verified']

    def get_created_by_name(self, obj):
        if obj.created_by:
            return f"{obj.created_by.first_name} {obj.created_by.last_name}"
        return ""

    def get_patient_data(self, obj):
        return {
            "name": f'{obj.request_detail.request.patient.user.first_name} {obj.request_detail.request.patient.user.last_name}',
            "age": obj.request_detail.request.patient.age,
            "gender": obj.request_detail.request.patient.user.gender.title,
        }