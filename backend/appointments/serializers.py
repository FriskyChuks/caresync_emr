from rest_framework import serializers

from .models import *
from patients.serializers import PatientSerializer
from locations.serializers import ClinicSerializer


class AppointmentSerializer(serializers.ModelSerializer):
    patient_data = PatientSerializer(source='patient', read_only=True)
    clinic_name = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = Appointment
        fields = ['patient','patient_data', 'clinic','appointment_date','appointment_time',
                  'created_by','clinic_name', 'status', 'id','reason']
   
    def get_clinic_name(self,obj):
        return obj.clinic.name
