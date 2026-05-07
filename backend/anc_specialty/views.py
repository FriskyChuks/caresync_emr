
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser

from rest_framework import serializers
from django.shortcuts import get_object_or_404
from patients.models import Patient

from rest_framework import generics
from .models import *
from .serializers import *



class PatientAttachedListCreateView(generics.ListCreateAPIView):
 
    def get_patient(self):
        patient_id = (
            self.request.data.get("patient") or
            self.request.query_params.get("patient")
        )
        if not patient_id:
            raise serializers.ValidationError({"patient": "Patient ID is required."})
        try:
            return Patient.objects.get(id=patient_id)
        except Patient.DoesNotExist:
            raise serializers.ValidationError({"patient": "Invalid patient ID."})
 
    def perform_create(self, serializer):
        patient = self.get_patient()
        serializer.save(patient=patient)
 
    def get_queryset(self):
        patient_id = self.request.query_params.get("patient")
        if patient_id:
            return self.queryset.filter(patient_id=patient_id)
        return self.queryset.none() 

# Obstetric History
class ObstetricHistoryListCreateView(PatientAttachedListCreateView):
    queryset = ObstetricHistory.objects.all()
    serializer_class = ObstetricHistorySerializer

class ObstetricHistoryRetrieveUpdateView(generics.RetrieveUpdateAPIView):
    queryset = ObstetricHistory.objects.all()
    serializer_class = ObstetricHistorySerializer
    http_method_names = ["get", "patch", "head", "options"]   

# Menstrual Gynecological History
class MenstrualGynecologicalHistoryListCreateView(PatientAttachedListCreateView):
    queryset = MenstrualGynecologicalHistory.objects.all()
    serializer_class = MenstrualGynecologicalHistorySerializer
 
 
class MenstrualGynecologicalHistoryRetrieveUpdateView(generics.RetrieveUpdateAPIView):
    queryset = MenstrualGynecologicalHistory.objects.all()
    serializer_class = MenstrualGynecologicalHistorySerializer
    http_method_names = ["get", "patch", "head", "options"]

# Medical Family History
class MedicalFamilyHistoryListCreateView(PatientAttachedListCreateView):
    queryset = MedicalFamilyHistory.objects.all()
    serializer_class = MedicalFamilyHistorySerializer
 
 
class MedicalFamilyHistoryRetrieveUpdateView(generics.RetrieveUpdateAPIView):
    queryset = MedicalFamilyHistory.objects.all()
    serializer_class = MedicalFamilyHistorySerializer
    http_method_names = ["get", "patch", "head", "options"]

# Current Pregnancy
class CurrentPregnancyListCreateView(PatientAttachedListCreateView):
    queryset = CurrentPregnancy.objects.all()
    serializer_class = CurrentPregnancySerializer
 
 
class CurrentPregnancyRetrieveUpdateView(generics.RetrieveUpdateAPIView):
    queryset = CurrentPregnancy.objects.all()
    serializer_class = CurrentPregnancySerializer
    http_method_names = ["get", "patch", "head", "options"]

# Antenatal Vitals
class AntenatalVitalsListCreateView(PatientAttachedListCreateView):
    queryset = AntenatalVitals.objects.all()
    serializer_class = AntenatalVitalsSerializer

class AntenatalVitalsRetrieveUpdateDestroyView(generics.RetrieveUpdateDestroyAPIView):
    queryset = AntenatalVitals.objects.all()
    serializer_class = AntenatalVitalsSerializer



# ===============================
# ANC Revisit
# ===============================
class ANCReVisitListCreateView(generics.ListCreateAPIView):
    serializer_class = ANCReVisitSerializer

    def get_queryset(self):
        queryset = ANCReVisit.objects.all()

        patient_id = self.request.query_params.get("patient")
        booking_id = self.request.query_params.get("booking")

        if booking_id:
            return queryset.filter(booking_id=booking_id)

        if patient_id:
            return queryset.filter(booking__patient_id=patient_id)

        return queryset.none()  # 🔒 VERY IMPORTANT (avoid leaking all data)


class ANCReVisitDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = ANCReVisit.objects.all()
    serializer_class = ANCReVisitSerializer


# ===============================
# Ultrasound Record
# ===============================
class UltrasoundRecordListCreateView(generics.ListCreateAPIView):
    serializer_class = UltrasoundRecordSerializer
    # ✅ THIS IS THE FIX
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def get_queryset(self):
        queryset = UltrasoundRecord.objects.all()

        patient_id = self.request.query_params.get("patient")
        booking_id = self.request.query_params.get("booking")

        if booking_id:
            return queryset.filter(booking_id=booking_id)

        if patient_id:
            return queryset.filter(booking__patient_id=patient_id)

        return queryset.none()



class UltrasoundRecordDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = UltrasoundRecord.objects.all()
    serializer_class = UltrasoundRecordSerializer


# ===============================
# Delivery Record
# ===============================
class DeliveryRecordListCreateView(generics.ListCreateAPIView):
    serializer_class = DeliveryRecordSerializer
 
    def get_queryset(self):
        queryset = DeliveryRecord.objects.all()
        patient_id = self.request.query_params.get("patient")
        booking_id = self.request.query_params.get("booking")
 
        if booking_id:
            return queryset.filter(booking_id=booking_id)
        if patient_id:
            return queryset.filter(booking__patient_id=patient_id)
        return queryset.none()
    

class DeliveryRecordDetailView(generics.RetrieveAPIView):
    queryset = DeliveryRecord.objects.all()
    serializer_class = DeliveryRecordSerializer
    http_method_names = ["get", "head", "options"]


