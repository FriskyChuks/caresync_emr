# encounters/serializers.py
from rest_framework import serializers
from .models import *
from locations.models import Clinic, Ward  # if you need them
from patients.models import Patient  # not strictly required here


class EncounterSerializer(serializers.ModelSerializer):
    class Meta:
        model = Visit
        fields = "__all__"


class TransferSerializer(serializers.ModelSerializer):
    class Meta:
        model = EncounterRoute
        fields = "__all__"


class EncounterRouteSerializer(serializers.ModelSerializer):
    transferred_by = serializers.StringRelatedField(read_only=True)
    location = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = EncounterRoute
        fields = [
            "id", "visit", "transferred_by", "date_created",
            "in_patient_transfer", "out_patient_transfer","location"
        ]
        read_only_fields = ["id", "visit", "transferred_by", "date_created","location"]

    def get_location(self, obj):
        if obj.in_patient_transfer:
            return obj.in_patient_transfer.name
        return obj.out_patient_transfer.name

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
        if not obj.visit_status:
            return None
        last_route = obj.routes.order_by("-date_created").first()
        if not last_route:
            return None
        return {
            "id": last_route.id,
            "date_created": last_route.date_created,
            "ward": (last_route.in_patient_transfer.name if last_route.in_patient_transfer else None),
            "ward_id": (last_route.in_patient_transfer.id if last_route.in_patient_transfer else None),
            "clinic": (last_route.out_patient_transfer.name if last_route.out_patient_transfer else None),
            "clinic_id": (last_route.out_patient_transfer.id if last_route.out_patient_transfer else None),
        }


# ----------------------------
# NEW: TransferRequest serializer
# ----------------------------
class TransferRequestSerializer(serializers.ModelSerializer):
    patient = serializers.SerializerMethodField()
    requested_by = serializers.SerializerMethodField(read_only=True)

    to_ward_id = serializers.IntegerField(source="to_ward.id", read_only=True)
    to_ward_name = serializers.CharField(source="to_ward.name", read_only=True)

    from_clinic_id = serializers.IntegerField(source="from_clinic.id", read_only=True)
    from_clinic_name = serializers.CharField(source="from_clinic.name", read_only=True)

    from_ward_id = serializers.IntegerField(source="from_ward.id", read_only=True)
    from_ward_name = serializers.CharField(source="from_ward.name", read_only=True)

    from_location_name = serializers.SerializerMethodField()
    from_location_type = serializers.SerializerMethodField()

    created_at = serializers.DateTimeField(read_only=True)
    date_created = serializers.DateTimeField(source="created_at", read_only=True)

    class Meta:
        model = TransferRequest
        fields = ["id","status","patient","to_ward_id","to_ward_name","from_clinic_id","from_clinic_name",
            "from_ward_id","from_ward_name","from_location_name",   # ✅ unified field
            "from_location_type", "requested_by","created_at","date_created","rejection_reason",
        ]
        read_only_fields = fields

    def get_patient(self, obj):
        visit = getattr(obj, "visit", None)
        if not visit or not visit.patient:
            return None
        patient = visit.patient
        user_info = getattr(patient, "user", None)
        return {
            "id": patient.id,
            "fullname": f"{user_info.first_name} {user_info.last_name}" if user_info else "",
            "age": patient.age,
            "gender": user_info.gender.title if user_info and user_info.gender else None,
        }

    def get_requested_by(self, obj):
        user = getattr(obj, "requested_by", None)
        if not user:
            return None
        full_name = f"{getattr(user, 'first_name', '')} {getattr(user, 'last_name', '')}".strip()
        return full_name if full_name else getattr(user, "username", None)

    def get_from_location_name(self, obj):
        if obj.from_ward:
            return obj.from_ward.name
        if obj.from_clinic:
            return obj.from_clinic.name
        return None

    def get_from_location_type(self, obj):
        if obj.from_ward:
            return "ward"
        if obj.from_clinic:
            return "clinic"
        return None


class DischargeReasonSerializer(serializers.ModelSerializer):
    class Meta:
        model = DischargeReason
        fields = ["id", "name"]


class DischargeSerializer(serializers.ModelSerializer):
    reason = DischargeReasonSerializer(read_only=True)
    reason_id = serializers.PrimaryKeyRelatedField(
        queryset=DischargeReason.objects.all(),
        source="reason",
        write_only=True,
        required=False
    )

    class Meta:
        model = Discharge
        fields = ["id","visit","summary","summary_by","reason","reason_id","discharged_by","discharged_at",]
        read_only_fields = ["discharged_at"]

    def validate_visit(self, visit):
        if hasattr(visit, "discharge"):
            raise serializers.ValidationError("This visit already has a discharge record.")
        return visit