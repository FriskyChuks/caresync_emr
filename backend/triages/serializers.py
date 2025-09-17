# patients/serializers.py

from rest_framework import serializers

from .models import Triage
from .models import Patient
from accounts.models import CustomUser   # adjust path
from accounts.serializers import GenderSerializer  # if you already have one


class TriagePatientSerializer(serializers.ModelSerializer):
    first_name = serializers.CharField(source="user.first_name", read_only=True)
    last_name = serializers.CharField(source="user.last_name", read_only=True)
    gender = serializers.CharField(source="user.gender.title", read_only=True)  # just the string

    class Meta:
        model = Patient
        fields = ("id", "age", "date_of_birth", "status", "first_name", "last_name", "gender")

# triage/serializers.py

class TriageSerializer(serializers.ModelSerializer):
    patient_data = TriagePatientSerializer(source="pid", read_only=True)
    recorded_by = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = Triage
        fields = "__all__"

    def get_recorded_by(self, obj):
        return f"{obj.created_by.first_name} {obj.created_by.last_name}"
