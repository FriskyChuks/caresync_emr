#l serializers · PY
from rest_framework import serializers
from django.db import transaction
from .models import *
 
 
# ──────────────────────────────────────────
# Individual serializers
# ──────────────────────────────────────────
 
class ObstetricHistorySerializer(serializers.ModelSerializer):
    class Meta:
        model = ObstetricHistory
        fields = "__all__"
 
    def validate(self, data):
        patient = data.get("patient")
        if patient:
            qs = ObstetricHistory.objects.filter(patient=patient, is_active=True)
            if self.instance:
                qs = qs.exclude(pk=self.instance.pk)
            if qs.exists():
                raise serializers.ValidationError(
                    {"non_field_errors": ["This patient already has an active pregnancy booking."]}
                )
        return data
 
 
 
class MenstrualGynecologicalHistorySerializer(serializers.ModelSerializer):
    class Meta:
        model = MenstrualGynecologicalHistory
        fields = "__all__"         
 
 
# ── Medical / Family History ──────────────────────────────────────────────────
class MedicalFamilyHistorySerializer(serializers.ModelSerializer):
    class Meta:
        model = MedicalFamilyHistory
        fields = "__all__"         
 
 
# ── Current Pregnancy ─────────────────────────────────────────────────────────
class CurrentPregnancySerializer(serializers.ModelSerializer):
    class Meta:
        model = CurrentPregnancy
        fields = "__all__"         
 
 
class AntenatalVitalsSerializer(serializers.ModelSerializer):
    class Meta:
        model = AntenatalVitals
        exclude = ["patient", "date_created"]
 
 

 ######################################################################################
 # revisit




class ANCReVisitSerializer(serializers.ModelSerializer):
    class Meta:
        model = ANCReVisit
        fields = "__all__" 


class UltrasoundRecordSerializer(serializers.ModelSerializer):
    class Meta:
        model = UltrasoundRecord
        fields = "__all__"



class DeliveryRecordSerializer(serializers.ModelSerializer):
    class Meta:
        model = DeliveryRecord
        fields = "__all__"



class BabyDetailSerializer(serializers.ModelSerializer):
    class Meta:
        model = BabyDetail
        fields = ["baby_sex", "birth_weight", "apgar_score_1min", "apgar_score_5min", "baby_condition"]
        extra_kwargs = {
            "baby_sex":         {"required": False, "allow_null": True, "allow_blank": True},
            "birth_weight":     {"required": False, "allow_null": True},
            "apgar_score_1min": {"required": False, "allow_null": True},
            "apgar_score_5min": {"required": False, "allow_null": True},
            "baby_condition":   {"required": False, "allow_null": True, "allow_blank": True},
        }
 

class DeliveryRecordSerializer(serializers.ModelSerializer):
    babies = BabyDetailSerializer(many=True, required=False)
 
    class Meta:
        model = DeliveryRecord
        fields = "__all__"
        extra_kwargs = {
            "booking":          {"required": True},
            # Legacy single-baby fields — optional (new records use BabyDetail)
            "baby_sex":         {"required": False, "allow_null": True, "allow_blank": True},
            "birth_weight":     {"required": False, "allow_null": True},
            "apgar_score_1min": {"required": False, "allow_null": True},
            "apgar_score_5min": {"required": False, "allow_null": True},
            "baby_condition":   {"required": False, "allow_null": True, "allow_blank": True},
            "mother_condition": {"required": False, "allow_null": True, "allow_blank": True},
            "place_of_delivery":{"required": False, "allow_null": True, "allow_blank": True},
            "complications":    {"required": False, "allow_null": True, "allow_blank": True},
        }
 
    def create(self, validated_data):
        babies_data = validated_data.pop("babies", [])
 
        delivery = DeliveryRecord.objects.create(**validated_data)
 
        for index, baby in enumerate(babies_data, start=1):
            BabyDetail.objects.create(delivery=delivery, baby_number=index, **baby)
 
        # Close the active booking after delivery is saved
        booking = delivery.booking
        booking.is_active = False
        booking.save()
 
        return delivery