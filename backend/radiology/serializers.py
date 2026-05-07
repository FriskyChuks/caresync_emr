# serializers.py
from rest_framework import serializers
from .models import Unit, Investigation, InvestigationView, InvestigationRequest, RequestDetail, InvestigationResult

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
        # Custom validation
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
        
        # Add created_by from request user
        if request and request.user.is_authenticated:
            validated_data['created_by'] = request.user
        
        # Create the investigation
        investigation = Investigation.objects.create(**validated_data)
        
        # Create views if provided
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

class RequestDetailSerializer(serializers.ModelSerializer):
    investigation_title = serializers.CharField(source='investigation.title', read_only=True)
    investigation_view_title = serializers.CharField(source='investigation_view.title', read_only=True, allow_null=True)
    
    class Meta:
        model = RequestDetail
        fields = [
            'id', 'investigation', 'investigation_title', 'investigation_view', 
            'investigation_view_title', 'quantity', 'unit_price', 'total_price',
            'status', 'priority', 'notes', 'date_created', 'last_updated'
        ]
        read_only_fields = ['total_price', 'date_created', 'last_updated']

class RequestDetailListSerializer(serializers.ModelSerializer):
    investigation_title = serializers.CharField(source='investigation.title', read_only=True)
    investigation_view_title = serializers.CharField(source='investigation_view.title', read_only=True, allow_null=True)
    investigation_id = serializers.IntegerField(source='investigation.id', read_only=True)
    
    class Meta:
        model = RequestDetail
        fields = [
            'id', 'investigation_id', 'investigation_title', 'investigation_view', 
            'investigation_view_title', 'quantity', 'unit_price', 'total_price',
            'status', 'priority', 'notes', 'date_created'
        ]

class InvestigationRequestDetailSerializer(serializers.ModelSerializer):
    patient_name = serializers.CharField(source='patient.user_info.fullname', read_only=True)
    patient_identifier = serializers.CharField(source='patient.identifier', read_only=True)
    created_by_name = serializers.CharField(source='created_by.get_full_name', read_only=True)
    details = RequestDetailListSerializer(many=True, read_only=True)
    
    class Meta:
        model = InvestigationRequest
        fields = [
            'id', 'patient', 'patient_name', 'patient_identifier', 
            'clinical_notes', 'urgency', 'status', 'total_amount',
            'created_by', 'created_by_name', 'date_created', 'last_updated', 'details'
        ]

class InvestigationRequestListSerializer(serializers.ModelSerializer):
    patient_name = serializers.SerializerMethodField(read_only=True)
    patient_id = serializers.CharField(source='patient.id', read_only=True)
    created_by_name = serializers.CharField(source='created_by.get_full_name', read_only=True)
    details_count = serializers.SerializerMethodField()
    completed_details_count = serializers.SerializerMethodField()
    
    class Meta:
        model = InvestigationRequest
        fields = [
            'id', 'patient', 'patient_name', 'patient_id',
            'clinical_notes', 'urgency', 'status', 'total_amount', 'created_by', 'created_by_name',
            'date_created', 'last_updated', 'details_count', 'completed_details_count'
        ]
        read_only_fields = ['total_amount', 'date_created', 'last_updated']
    
    def get_details_count(self, obj):
        return obj.details.count()
    
    def get_patient_name(self, obj):
        return f"{obj.patient.user.first_name} {obj.patient.user.last_name}"
    
    def get_completed_details_count(self, obj):
        return obj.details.filter(status='completed').count()

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

class InvestigationRequestDetailSerializer(serializers.ModelSerializer):
    patient_name = serializers.SerializerMethodField(read_only=True)
    # patient_identifier = serializers.CharField(source='patient.identifier', read_only=True)
    created_by_name = serializers.CharField(source='created_by.get_full_name', read_only=True)
    details = RequestDetailSerializer(many=True, read_only=True)
    
    class Meta:
        model = InvestigationRequest
        fields = [
            'id', 'patient', 'patient_name',  
            'clinical_notes', 'urgency', 'status', 'total_amount',
            'created_by', 'created_by_name', 'date_created', 'last_updated', 'details'
        ]
        read_only_fields = ['total_amount', 'date_created', 'last_updated']

    def get_patient_name(self, obj):
        return f"{obj.patient.user.first_name} {obj.patient.user.last_name}"

class InvestigationResultSerializer(serializers.ModelSerializer):
    request_detail_id = serializers.IntegerField(source='request_detail.id', read_only=True)
    investigation_title = serializers.CharField(source='request_detail.investigation.title', read_only=True)
    patient_data = serializers.SerializerMethodField(read_only=True)
    created_by_name = serializers.SerializerMethodField(read_only=True)
    # Remove the supervised_by_name field since it's now a CharField, not a relation
    # supervised_by_name = serializers.CharField(source='supervised_by.get_full_name', read_only=True, allow_null=True)
    
    class Meta:
        model = InvestigationResult
        fields = [
            'id', 'request_detail', 'request_detail_id', 'investigation_title', 'patient_data',
            'result', 'comments', 'diagnosis', 'findings', 'attachments', 'is_abnormal',
            'supervised_by', 'created_by', 'created_by_name',  # Removed supervised_by_name
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

class InvestigationResultCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = InvestigationResult
        fields = [
            'id', 'request_detail', 'result', 'comments', 'diagnosis', 'findings',
            'attachments', 'is_abnormal', 'supervised_by', 'created_by'
        ]
        extra_kwargs = {
            'supervised_by': {'allow_blank': True, 'allow_null': True}  # Allow empty string
        }
    
    def create(self, validated_data):
        result = super().create(validated_data)
        # Auto-update the request detail status to completed
        result.request_detail.status = 'completed'
        result.request_detail.save()
        return result

# Specialized serializers for specific workflows
class RequestDetailStatusUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = RequestDetail
        fields = ['id', 'status', 'notes']
    
    def update(self, instance, validated_data):
        instance.status = validated_data.get('status', instance.status)
        instance.notes = validated_data.get('notes', instance.notes)
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

# Serializer for adding details to existing request
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
    
# serializers.py - Add this new serializer
class InvestigationRequestDashboardSerializer(serializers.ModelSerializer):
    patient_name = serializers.SerializerMethodField(read_only=True)
    patient_id = serializers.CharField(source='patient.id', read_only=True)
    created_by_name = serializers.CharField(source='created_by.get_full_name', read_only=True)
    details_count = serializers.SerializerMethodField()
    completed_details_count = serializers.SerializerMethodField()
    details = RequestDetailListSerializer(many=True, read_only=True)
    
    class Meta:
        model = InvestigationRequest
        fields = [
            'id', 'patient', 'patient_name', 'patient_id',
            'clinical_notes', 'urgency', 'status', 'total_amount', 'created_by', 'created_by_name',
            'date_created', 'last_updated', 'details_count', 'completed_details_count', 'details'
        ]
        read_only_fields = ['total_amount', 'date_created', 'last_updated']
    
    def get_details_count(self, obj):
        return obj.details.count()
    
    def get_completed_details_count(self, obj):
        return obj.details.filter(status='completed').count()
    
    def get_patient_name(self, obj):
        return f"{obj.patient.user.first_name} {obj.patient.user.last_name}"