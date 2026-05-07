from rest_framework import serializers
from .models import (
    ICD11Chapter, ICD11Block, ICD11Category, 
    ICD11Grouping, ICD11Diagnosis, ICD11DiagnosisHistory
)


# ==================== BASIC SERIALIZERS ====================

class ICD11GroupingSerializer(serializers.ModelSerializer):
    """Serializer for groupings"""
    class Meta:
        model = ICD11Grouping
        fields = ['grouping_type', 'grouping_value']


class ICD11ChapterSerializer(serializers.ModelSerializer):
    """Serializer for chapters"""
    blocks_count = serializers.IntegerField(read_only=True)
    categories_count = serializers.IntegerField(read_only=True)
    
    class Meta:
        model = ICD11Chapter
        fields = [
            'id', 'chapter_no', 'code', 'title', 
            'blocks_count', 'categories_count', 'created_at'
        ]


class ICD11BlockSerializer(serializers.ModelSerializer):
    """Serializer for blocks"""
    chapter_no = serializers.CharField(source='chapter.chapter_no', read_only=True)
    chapter_title = serializers.CharField(source='chapter.title', read_only=True)
    parent_block_id = serializers.CharField(source='parent_block.block_id', read_only=True, allow_null=True)
    categories_count = serializers.IntegerField(read_only=True)
    
    class Meta:
        model = ICD11Block
        fields = [
            'id', 'block_id', 'title', 'chapter_no', 'chapter_title',
            'parent_block_id', 'depth_in_kind', 'is_residual',
            'categories_count', 'created_at'
        ]


class ICD11CategoryListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for category list views"""
    chapter_no = serializers.CharField(source='chapter.chapter_no', read_only=True)
    block_id = serializers.CharField(source='block.block_id', read_only=True, allow_null=True)
    parent_code = serializers.CharField(source='parent_category.code', read_only=True, allow_null=True)
    has_children = serializers.SerializerMethodField()
    groupings = serializers.SerializerMethodField()
    
    class Meta:
        model = ICD11Category
        fields = [
            'id', 'code', 'title', 'chapter_no', 'block_id',
            'parent_code', 'depth_in_kind', 'is_leaf', 'is_residual',
            'has_children', 'groupings'
        ]
    
    def get_has_children(self, obj):
        return obj.children.exists()
    
    def get_groupings(self, obj):
        return [g.grouping_value for g in obj.groupings.all()]


class ICD11CategoryDetailSerializer(serializers.ModelSerializer):
    """Detailed serializer for single category view"""
    chapter = ICD11ChapterSerializer(read_only=True)
    block = ICD11BlockSerializer(read_only=True)
    parent_category = ICD11CategoryListSerializer(read_only=True)
    children = ICD11CategoryListSerializer(many=True, read_only=True)
    groupings = ICD11GroupingSerializer(many=True, read_only=True)
    
    class Meta:
        model = ICD11Category
        fields = [
            'id', 'code', 'title', 'chapter', 'block',
            'parent_category', 'children', 'depth_in_kind',
            'is_leaf', 'is_residual', 'groupings', 'created_at'
        ]


class ICD11CategoryHierarchySerializer(serializers.ModelSerializer):
    """Serializer for hierarchical display"""
    children = serializers.SerializerMethodField()
    
    class Meta:
        model = ICD11Category
        fields = ['code', 'title', 'depth_in_kind', 'is_leaf', 'children']
    
    def get_children(self, obj):
        if obj.children.exists():
            return ICD11CategoryHierarchySerializer(obj.children.all(), many=True).data
        return []


class ICD11SearchSerializer(serializers.ModelSerializer):
    """Serializer for search results"""
    chapter_no = serializers.CharField(source='chapter.chapter_no', read_only=True)
    chapter_title = serializers.CharField(source='chapter.title', read_only=True)
    
    class Meta:
        model = ICD11Category
        fields = ['id', 'code', 'title', 'chapter_no', 'chapter_title', 'depth_in_kind']


# ==================== DIAGNOSIS SERIALIZERS ====================

class ICD11DiagnosisCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating diagnoses"""
    patient_id = serializers.IntegerField(write_only=True)
    encounter_route_id = serializers.IntegerField(write_only=True, required=False, allow_null=True)
    category_code = serializers.CharField(write_only=True)
    
    class Meta:
        model = ICD11Diagnosis
        fields = [
            'patient_id', 'encounter_route_id', 'category_code',
            'diagnosis_type', 'notes', 'clinical_description', 'severity'
        ]
    
    def validate_category_code(self, value):
        """Validate that the category exists"""
        try:
            category = ICD11Category.objects.get(code=value)
            return category
        except ICD11Category.DoesNotExist:
            raise serializers.ValidationError(f"Category with code '{value}' not found")
    
    def validate_patient_id(self, value):
        """Validate that the patient exists"""
        from patients.models import Patient
        try:
            patient = Patient.objects.get(id=value)
            return patient
        except Patient.DoesNotExist:
            raise serializers.ValidationError(f"Patient with id {value} not found")
    
    def validate_encounter_route_id(self, value):
        """Validate that the encounter route exists"""
        from encounters.models import EncounterRoute
        if value:
            try:
                encounter_route = EncounterRoute.objects.get(id=value)
                return encounter_route
            except EncounterRoute.DoesNotExist:
                raise serializers.ValidationError(f"EncounterRoute with id {value} not found")
        return None
    
    def create(self, validated_data):
        patient = validated_data.pop('patient_id')
        encounter_route = validated_data.pop('encounter_route_id', None)
        category = validated_data.pop('category_code')
        
        # Create diagnosis
        diagnosis = ICD11Diagnosis.objects.create(
            patient=patient,
            encounter_route=encounter_route,
            category=category,
            diagnosed_by=self.context.get('request').user if self.context.get('request') else None,
            **validated_data
        )
        
        return diagnosis


class ICD11DiagnosisListSerializer(serializers.ModelSerializer):
    """Serializer for listing diagnoses"""
    category_code = serializers.CharField(source='category.code', read_only=True)
    category_title = serializers.CharField(source='category.title', read_only=True)
    patient_name = serializers.SerializerMethodField()
    diagnosed_by_name = serializers.CharField(source='diagnosed_by.get_full_name', read_only=True)
    encounter_route_info = serializers.SerializerMethodField()
    
    class Meta:
        model = ICD11Diagnosis
        fields = [
            'id', 'category_code', 'category_title', 'patient_name',
            'diagnosis_type', 'status', 'severity', 'diagnosed_date',
            'is_confirmed', 'diagnosed_by_name', 'encounter_route_info'
        ]
    
    def get_patient_name(self, obj):
        return f"{obj.patient.user.first_name} {obj.patient.user.last_name}"
    
    def get_encounter_route_info(self, obj):
        if obj.encounter_route:
            return {
                'id': obj.encounter_route.id,
                'date_created': obj.encounter_route.date_created,
                'location': str(obj.encounter_route)
            }
        return None


class ICD11DiagnosisDetailSerializer(serializers.ModelSerializer):
    """Serializer for detailed diagnosis view"""
    category = serializers.SerializerMethodField()
    patient = serializers.SerializerMethodField()
    encounter_route = serializers.SerializerMethodField()
    diagnosed_by_name = serializers.CharField(source='diagnosed_by.get_full_name', read_only=True)
    confirmed_by_name = serializers.CharField(source='confirmed_by.get_full_name', read_only=True)
    
    class Meta:
        model = ICD11Diagnosis
        fields = [
            'id', 'category', 'patient', 'encounter_route',
            'diagnosis_type', 'status', 'notes', 'clinical_description',
            'severity', 'diagnosed_by_name', 'diagnosed_date',
            'resolved_date', 'is_confirmed', 'confirmed_by_name',
            'confirmed_date', 'created_at', 'updated_at'
        ]
    
    def get_category(self, obj):
        return {
            'code': obj.category.code,
            'title': obj.category.title,
            'depth': obj.category.depth_in_kind,
            'is_leaf': obj.category.is_leaf,
            'is_residual': obj.category.is_residual
        }
    
    def get_patient(self, obj):
        return {
            'id': obj.patient.id,
            'name': f"{obj.patient.user.first_name} {obj.patient.user.last_name}",
            'date_of_birth': obj.patient.date_of_birth,
            'age': obj.patient.age,
            'phone': obj.patient.phone
        }
    
    def get_encounter_route(self, obj):
        if obj.encounter_route:
            from encounters.serializers import EncounterRouteSerializer
            return {
                'id': obj.encounter_route.id,
                'visit_number': obj.encounter_route.visit.visit_number if obj.encounter_route.visit else None,
                'date_created': obj.encounter_route.date_created,
                'location': str(obj.encounter_route)
            }
        return None


class ICD11DiagnosisUpdateSerializer(serializers.ModelSerializer):
    """Serializer for updating diagnoses"""
    class Meta:
        model = ICD11Diagnosis
        fields = ['diagnosis_type', 'status', 'notes', 'clinical_description', 'severity']


class ICD11DiagnosisHistorySerializer(serializers.ModelSerializer):
    """Serializer for diagnosis history"""
    changed_by_name = serializers.CharField(source='changed_by.get_full_name', read_only=True)
    
    class Meta:
        model = ICD11DiagnosisHistory
        fields = ['field_name', 'old_value', 'new_value', 'changed_by_name', 'changed_date']