from rest_framework import serializers
from .models import *

class EncounterSerializer(serializers.ModelSerializer):
    class Meta:
        model = Visit
        fields = '__all__'

class TransferSerializer(serializers.ModelSerializer):
    class Meta:
        model = EncounterRoute
        fields = '__all__'


class EncounterRouteSerializer(serializers.ModelSerializer):
    transferred_by = serializers.StringRelatedField(read_only=True)

    class Meta:
        model = EncounterRoute
        fields = [
            "id", "visit", "transferred_by", "date_created",
            "in_patient_transfer", "out_patient_transfer"
        ]
        read_only_fields = ["id", "visit", "transferred_by", "date_created"]


class VisitSerializer(serializers.ModelSerializer):
    routes = EncounterRouteSerializer(many=True, read_only=True)
    current_location = serializers.SerializerMethodField()

    class Meta:
        model = Visit
        fields = [
            "id",
            "patient",
            "send_by",
            "date_created",
            "visit_status",
            "is_inpatient",
            "visit_number",
            "routes",
            "current_location",
        ]

    def get_current_location(self, obj):
        if not obj.visit_status:  # only for active visits
            return None
        last_route = obj.routes.order_by("-date_created").first()
        if not last_route:
            return None
        return {
            "id": last_route.id,
            "date_created": last_route.date_created,
            "ward": (
                last_route.in_patient_transfer.name
                if last_route.in_patient_transfer
                else None
            ),
            "ward_id": (
                last_route.in_patient_transfer.id
                if last_route.in_patient_transfer
                else None
            ),
            "clinic": (
                last_route.out_patient_transfer.name
                if last_route.out_patient_transfer
                else None
            ),
            "clinic_id": (
                last_route.out_patient_transfer.id
                if last_route.out_patient_transfer
                else None
            ),
        }







