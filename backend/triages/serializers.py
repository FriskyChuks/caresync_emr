# patients/serializers.py

from rest_framework import serializers

from .models import *
from accounts.serializers import GenderSerializer  # if you already have one


class TriagePatientSerializer(serializers.ModelSerializer):

    class Meta:
        model = Patient
        fields = ("id", "age", "date_of_birth", "status")

# triage/serializers.py

class TriageSerializer(serializers.ModelSerializer):
    patient_data = TriagePatientSerializer(source="pid", read_only=True)
    recorded_by = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = Triage
        fields = "__all__"

    def get_recorded_by(self, obj):
        return f"{obj.created_by.first_name} {obj.created_by.last_name}"
    

class FluidBalanceSerializer(serializers.ModelSerializer):
    patient_name = serializers.SerializerMethodField()
    recorded_by_name = serializers.SerializerMethodField()
    encounter_location = serializers.SerializerMethodField()
    
    class Meta:
        model = FluidBalance
        fields = [
            'id', 'patient', 'patient_name', 'encounter', 'encounter_location',
            'intake_type', 'intake_volume', 'intake_description',
            'output_type', 'output_volume', 'output_description',
            'net_balance', 'recorded_at', 'recorded_by', 'recorded_by_name', 'notes'
        ]
        read_only_fields = ['net_balance', 'recorded_at']
    
    def get_patient_name(self, obj):
        return f"{obj.patient.user.first_name} {obj.patient.user.last_name}"
    
    def get_recorded_by_name(self, obj):
        if obj.recorded_by:
            return f"{obj.recorded_by.first_name} {obj.recorded_by.last_name}"
        return None
    
    def get_encounter_location(self, obj):
        if obj.encounter:
            if obj.encounter.in_patient_transfer:
                location = obj.encounter.in_patient_transfer.name
                return f"Ward: {location}"
            else:
                location = obj.encounter.out_patient_transfer.name
                return f"Clinic: {location}"
        return None
    
    def validate(self, data):
        # Ensure either intake or output is provided
        if not data.get('intake_volume') and not data.get('output_volume'):
            raise serializers.ValidationError("Either intake volume or output volume must be provided.")
        
        # Ensure type is provided if volume is provided
        if data.get('intake_volume') and not data.get('intake_type'):
            raise serializers.ValidationError("Intake type is required when intake volume is provided.")
        
        if data.get('output_volume') and not data.get('output_type'):
            raise serializers.ValidationError("Output type is required when output volume is provided.")
        
        return data
