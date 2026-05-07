from rest_framework import serializers
from django.contrib.contenttypes.models import ContentType
from .models import Bill, Payment, PaymentDetail, Wallet


class BillSerializer(serializers.ModelSerializer):
    source_model = serializers.SerializerMethodField()

    class Meta:
        model = Bill
        fields = [
            "id", "patient", "encounter",
            "content_type", "object_id", "source_model",
            "description", "amount", "amount_paid", "balance", "status",
            "created_by", "date_created", "last_updated"
        ]
        read_only_fields = ["amount_paid", "balance", "status", "date_created", "last_updated"]

    def get_source_model(self, obj):
        """Return the originating model name (LabRequest, Prescription, etc.)."""
        return obj.content_type.model if obj.content_type else None


class PaymentDetailSerializer(serializers.ModelSerializer):
    bill_info = serializers.SerializerMethodField()

    class Meta:
        model = PaymentDetail
        fields = [
            "id", "payment", "bill", "bill_info",
            "description", "amount", "created_by",
            "date_created", "last_updated",
        ]

    def get_bill_info(self, obj):
        if not obj.bill:
            return None
        return {
            "id": obj.bill.id,
            "description": obj.bill.description,
            "amount": obj.bill.amount,
            "balance": obj.bill.balance,
            "status": obj.bill.status,
        }


class PaymentSerializer(serializers.ModelSerializer):
    details = PaymentDetailSerializer(many=True, read_only=True)
    patient_name = serializers.SerializerMethodField()
    status_label = serializers.SerializerMethodField()

    class Meta:
        model = Payment
        fields = [
            "id", "amount_paid", "action", "payment_method",
            "patient", "patient_name", "created_by",
            "reference", "notes", "walk_in",
            "date_created", "last_updated",
            "details","status_label"
        ]

    def get_patient_name(self, obj):
        if obj.patient:
            return str(obj.patient)
        if obj.walk_in:
            return "🚶 Walk-in Customer"
        return "—"

    def get_status_label(self, obj):
        if obj.walk_in:
            return "Walk-in Payment"
        return f"{obj.get_payment_method_display().title()} Payment"


class WalletSerializer(serializers.ModelSerializer):
    patient_name = serializers.SerializerMethodField()

    class Meta:
        model = Wallet
        fields = [
            "id", "patient", "patient_name",
            "account_balance", "date_created", "last_updated",
        ]

    def get_patient_name(self, obj):
        return str(obj.patient) if obj.patient else None
