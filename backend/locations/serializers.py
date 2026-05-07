from rest_framework import serializers
from .models import *

from encounters.models import TransferRequest

class ClinicSerializer(serializers.ModelSerializer):
    patient_count = serializers.IntegerField(read_only=True)
    class Meta:
        model = Clinic
        fields = ["id", "name","male_only","female_only","patient_count"]      


class WardSerializer(serializers.ModelSerializer):
    patient_count = serializers.IntegerField(read_only=True)
    
    class Meta:
        model = Ward
        fields = ["id", "name","male_only","female_only","patient_count"]      


class RoomSerializer(serializers.ModelSerializer):
    available_beds = serializers.SerializerMethodField()

    class Meta:
        model = Room
        fields = ["id", "name", "bed_count", "sealed_beds", "available_beds"]

    def get_available_beds(self, obj):
        """
        Returns a list of free bed numbers for this room:
        bed numbers already assigned in accepted TransferRequests are considered occupied.
        """
        # Get accepted transfers to this room
        accepted_transfers = TransferRequest.objects.filter(
            to_ward=obj.ward,
            assigned_room=obj,
            status="accepted"
        )

        # Collect currently assigned bed numbers
        occupied_beds = [t.assigned_bed_number for t in accepted_transfers if t.assigned_bed_number]

        # All beds in the room
        all_beds = set(range(1, obj.bed_count + 1))

        # Remove sealed beds and occupied beds
        unavailable_beds = set(obj.sealed_beds) | set(occupied_beds)

        free_beds = sorted(all_beds - unavailable_beds)
        return free_beds 


