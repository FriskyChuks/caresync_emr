from rest_framework import serializers
from django.db import transaction
from .models import *
from .models import (
    ENTClerking, OtologicHistory, RhinologicHistory,
    LaryngologyHistory, HeadAndNeckHistory, PastMedicalSocialHistory,
    DrugHistory, GeneralExamination, EarExamination,
    NasalExamination, OralCavityOropharynxExamination, NeckExamination,
)
 
 
class OtologicHistorySerializer(serializers.ModelSerializer):
    class Meta:
        model = OtologicHistory
        exclude = ["clerking"]
 
 
class RhinologicHistorySerializer(serializers.ModelSerializer):
    class Meta:
        model = RhinologicHistory
        exclude = ["clerking"]
 
 
class LaryngologyHistorySerializer(serializers.ModelSerializer):
    class Meta:
        model = LaryngologyHistory
        exclude = ["clerking"]
 
 
class HeadAndNeckHistorySerializer(serializers.ModelSerializer):
    class Meta:
        model = HeadAndNeckHistory
        exclude = ["clerking"]
 
 
class PastMedicalSocialHistorySerializer(serializers.ModelSerializer):
    class Meta:
        model = PastMedicalSocialHistory
        exclude = ["clerking"]
 
 
class DrugHistorySerializer(serializers.ModelSerializer):
    class Meta:
        model = DrugHistory
        exclude = ["clerking"]
 
 
class GeneralExaminationSerializer(serializers.ModelSerializer):
    class Meta:
        model = GeneralExamination
        exclude = ["clerking"]
 
 
class EarExaminationSerializer(serializers.ModelSerializer):
    class Meta:
        model = EarExamination
        exclude = ["clerking"]
 
 
class NasalExaminationSerializer(serializers.ModelSerializer):
    class Meta:
        model = NasalExamination
        exclude = ["clerking"]
 
 
class OralCavityOropharynxExaminationSerializer(serializers.ModelSerializer):
    class Meta:
        model = OralCavityOropharynxExamination
        exclude = ["clerking"]
 
 
class NeckExaminationSerializer(serializers.ModelSerializer):
    class Meta:
        model = NeckExamination
        exclude = ["clerking"]
 
# class ENTRegistrationSerializer(serializers.Serializer):
   
#     # Top-level clerking fields
#     patient                          = serializers.IntegerField()
#     presenting_complaint             = serializers.CharField(allow_blank=True, required=False)
#     history_of_presenting_complaint  = serializers.CharField(allow_blank=True, required=False)
#     diagnosis                        = serializers.CharField(allow_blank=True, required=False)
#     treatment_plan                   = serializers.CharField(allow_blank=True, required=False)
 
#     # Nested sections
#     otologic_history     = OtologicHistorySerializer()
#     rhinologic_history   = RhinologicHistorySerializer()
#     laryngology_history  = LaryngologyHistorySerializer()
#     head_neck_history    = HeadAndNeckHistorySerializer()
#     past_medical_history = PastMedicalSocialHistorySerializer()
#     drug_history         = DrugHistorySerializer()
#     general_examination  = GeneralExaminationSerializer()
#     ear_examination      = EarExaminationSerializer()
#     nasal_examination    = NasalExaminationSerializer()
#     oral_examination     = OralCavityOropharynxExaminationSerializer()
#     neck_examination     = NeckExaminationSerializer()
 
#     # ── validation ──────────────────────────────────────────────
 
#     def validate_patient(self, value):
#         from .models import Patient
#         try:
#             return Patient.objects.get(pk=value)
#         except Patient.DoesNotExist:
#             raise serializers.ValidationError(f"Patient with id {value} does not exist.")
 
#     # ── atomic create ────────────────────────────────────────────
 
#     @transaction.atomic
#     def create(self, validated_data):
#         patient = validated_data["patient"]
 
#         # Create the parent clerking record first
#         clerking = ENTClerking.objects.create(
#             patient=patient,
#             presenting_complaint=validated_data.get("presenting_complaint", ""),
#             history_of_presenting_complaint=validated_data.get("history_of_presenting_complaint", ""),
#             diagnosis=validated_data.get("diagnosis", ""),
#             treatment_plan=validated_data.get("treatment_plan", ""),
#         )
 
#         # Create all child records linked to the clerking
#         OtologicHistory.objects.create(clerking=clerking, **validated_data["otologic_history"])
#         RhinologicHistory.objects.create(clerking=clerking, **validated_data["rhinologic_history"])
#         LaryngologyHistory.objects.create(clerking=clerking, **validated_data["laryngology_history"])
#         HeadAndNeckHistory.objects.create(clerking=clerking, **validated_data["head_neck_history"])
#         PastMedicalSocialHistory.objects.create(clerking=clerking, **validated_data["past_medical_history"])
#         DrugHistory.objects.create(clerking=clerking, **validated_data["drug_history"])
#         GeneralExamination.objects.create(clerking=clerking, **validated_data["general_examination"])
#         EarExamination.objects.create(clerking=clerking, **validated_data["ear_examination"])
#         NasalExamination.objects.create(clerking=clerking, **validated_data["nasal_examination"])
#         OralCavityOropharynxExamination.objects.create(clerking=clerking, **validated_data["oral_examination"])
#         NeckExamination.objects.create(clerking=clerking, **validated_data["neck_examination"])
 
#         return clerking
 
 
#     @transaction.atomic
#     def update(self, instance, validated_data):
#         # ✅ Update parent fields
#         instance.presenting_complaint = validated_data.get(
#             "presenting_complaint", instance.presenting_complaint
#         )
#         instance.history_of_presenting_complaint = validated_data.get(
#             "history_of_presenting_complaint", instance.history_of_presenting_complaint
#         )
#         instance.diagnosis = validated_data.get(
#             "diagnosis", instance.diagnosis
#         )
#         instance.treatment_plan = validated_data.get(
#             "treatment_plan", instance.treatment_plan
#         )
#         instance.save()

#         # ✅ Helper to update child models
#         def update_child(model, field_name):
#             if field_name in validated_data:
#                 data = validated_data[field_name]
#                 obj = model.objects.filter(clerking=instance).first()
#                 if obj:
#                     for attr, value in data.items():
#                         setattr(obj, attr, value)
#                     obj.save()
        
        
#         # ✅ Update all nested sections
#         update_child(OtologicHistory, "otologic_history")
#         update_child(RhinologicHistory, "rhinologic_history")
#         update_child(LaryngologyHistory, "laryngology_history")
#         update_child(HeadAndNeckHistory, "head_neck_history")
#         update_child(PastMedicalSocialHistory, "past_medical_history")
#         update_child(DrugHistory, "drug_history")
#         update_child(GeneralExamination, "general_examination")
#         update_child(EarExamination, "ear_examination")
#         update_child(NasalExamination, "nasal_examination")
#         update_child(OralCavityOropharynxExamination, "oral_examination")
#         update_child(NeckExamination, "neck_examination")

#         return instance

from rest_framework import serializers
from django.db import transaction

from .models import (
    ENTClerking,
    OtologicHistory,
    RhinologicHistory,
    LaryngologyHistory,
    HeadAndNeckHistory,
    PastMedicalSocialHistory,
    DrugHistory,
    GeneralExamination,
    EarExamination,
    NasalExamination,
    OralCavityOropharynxExamination,
    NeckExamination,
    Patient
)

class ENTRegistrationSerializer(serializers.Serializer):

    # ── Top-level clerking fields ──────────────────────────────
    patient = serializers.IntegerField()
    presenting_complaint = serializers.CharField(allow_blank=True, required=False)
    history_of_presenting_complaint = serializers.CharField(allow_blank=True, required=False)
    diagnosis = serializers.CharField(allow_blank=True, required=False)
    treatment_plan = serializers.CharField(allow_blank=True, required=False)

    # ── Nested sections ────────────────────────────────────────
    otologic_history = OtologicHistorySerializer()
    rhinologic_history = RhinologicHistorySerializer()
    laryngology_history = LaryngologyHistorySerializer()
    head_neck_history = HeadAndNeckHistorySerializer()
    past_medical_history = PastMedicalSocialHistorySerializer()
    drug_history = DrugHistorySerializer()
    general_examination = GeneralExaminationSerializer()
    ear_examination = EarExaminationSerializer()
    nasal_examination = NasalExaminationSerializer()
    oral_examination = OralCavityOropharynxExaminationSerializer()
    neck_examination = NeckExaminationSerializer()

    # ── VALIDATION ─────────────────────────────────────────────
    def validate_patient(self, value):
        try:
            return Patient.objects.get(pk=value)
        except Patient.DoesNotExist:
            raise serializers.ValidationError(f"Patient with id {value} does not exist.")

    # ── HELPER FOR SAFE NESTED FETCH ───────────────────────────
    def get_nested(self, model, serializer, instance):
        obj = model.objects.filter(clerking=instance).first()
        return serializer(obj).data if obj else None

    # ── CREATE ────────────────────────────────────────────────
    @transaction.atomic
    def create(self, validated_data):
        patient = validated_data["patient"]

        clerking = ENTClerking.objects.create(
            patient=patient,
            presenting_complaint=validated_data.get("presenting_complaint", ""),
            history_of_presenting_complaint=validated_data.get("history_of_presenting_complaint", ""),
            diagnosis=validated_data.get("diagnosis", ""),
            treatment_plan=validated_data.get("treatment_plan", ""),
        )

        OtologicHistory.objects.create(clerking=clerking, **validated_data["otologic_history"])
        RhinologicHistory.objects.create(clerking=clerking, **validated_data["rhinologic_history"])
        LaryngologyHistory.objects.create(clerking=clerking, **validated_data["laryngology_history"])
        HeadAndNeckHistory.objects.create(clerking=clerking, **validated_data["head_neck_history"])
        PastMedicalSocialHistory.objects.create(clerking=clerking, **validated_data["past_medical_history"])
        DrugHistory.objects.create(clerking=clerking, **validated_data["drug_history"])
        GeneralExamination.objects.create(clerking=clerking, **validated_data["general_examination"])
        EarExamination.objects.create(clerking=clerking, **validated_data["ear_examination"])
        NasalExamination.objects.create(clerking=clerking, **validated_data["nasal_examination"])
        OralCavityOropharynxExamination.objects.create(clerking=clerking, **validated_data["oral_examination"])
        NeckExamination.objects.create(clerking=clerking, **validated_data["neck_examination"])

        return clerking

    # ── UPDATE ────────────────────────────────────────────────
    @transaction.atomic
    def update(self, instance, validated_data):

        instance.presenting_complaint = validated_data.get(
            "presenting_complaint", instance.presenting_complaint
        )
        instance.history_of_presenting_complaint = validated_data.get(
            "history_of_presenting_complaint", instance.history_of_presenting_complaint
        )
        instance.diagnosis = validated_data.get("diagnosis", instance.diagnosis)
        instance.treatment_plan = validated_data.get("treatment_plan", instance.treatment_plan)
        instance.save()

        def update_child(model, field_name):
            if field_name in validated_data:
                data = validated_data[field_name]
                obj = model.objects.filter(clerking=instance).first()
                if obj:
                    for attr, value in data.items():
                        setattr(obj, attr, value)
                    obj.save()

        update_child(OtologicHistory, "otologic_history")
        update_child(RhinologicHistory, "rhinologic_history")
        update_child(LaryngologyHistory, "laryngology_history")
        update_child(HeadAndNeckHistory, "head_neck_history")
        update_child(PastMedicalSocialHistory, "past_medical_history")
        update_child(DrugHistory, "drug_history")
        update_child(GeneralExamination, "general_examination")
        update_child(EarExamination, "ear_examination")
        update_child(NasalExamination, "nasal_examination")
        update_child(OralCavityOropharynxExamination, "oral_examination")
        update_child(NeckExamination, "neck_examination")

        return instance

    # ── READ REPRESENTATION ───────────────────────────────────
    def to_representation(self, instance):
        return {
            "id": instance.id,
            "patient": instance.patient.id,
            "presenting_complaint": instance.presenting_complaint,
            "history_of_presenting_complaint": instance.history_of_presenting_complaint,
            "diagnosis": instance.diagnosis,
            "treatment_plan": instance.treatment_plan,
            "date_created": instance.date_created,

            "otologic_history": self.get_nested(OtologicHistory, OtologicHistorySerializer, instance),
            "rhinologic_history": self.get_nested(RhinologicHistory, RhinologicHistorySerializer, instance),
            "laryngology_history": self.get_nested(LaryngologyHistory, LaryngologyHistorySerializer, instance),
            "head_neck_history": self.get_nested(HeadAndNeckHistory, HeadAndNeckHistorySerializer, instance),
            "past_medical_history": self.get_nested(PastMedicalSocialHistory, PastMedicalSocialHistorySerializer, instance),
            "drug_history": self.get_nested(DrugHistory, DrugHistorySerializer, instance),
            "general_examination": self.get_nested(GeneralExamination, GeneralExaminationSerializer, instance),
            "ear_examination": self.get_nested(EarExamination, EarExaminationSerializer, instance),
            "nasal_examination": self.get_nested(NasalExamination, NasalExaminationSerializer, instance),
            "oral_examination": self.get_nested(OralCavityOropharynxExamination, OralCavityOropharynxExaminationSerializer, instance),
            "neck_examination": self.get_nested(NeckExamination, NeckExaminationSerializer, instance),
        }
        
    

class ENTRegistrationReadSerializer(serializers.ModelSerializer):
    patient = serializers.IntegerField(source="patient.id")

    class Meta:
        model = ENTClerking
        fields = "__all__"