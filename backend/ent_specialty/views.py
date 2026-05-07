from django.shortcuts import render
from rest_framework import generics
from .models import *
from .serializers import *
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
 
# class ENTClerkingListCreateView(generics.ListCreateAPIView):
#     queryset = ENTClerking.objects.all()
#     serializer_class = ENTClerkingSerializer
 
# class ENTClerkingRetrieveUpdateDestroyView(generics.RetrieveUpdateDestroyAPIView):
#     queryset = ENTClerking.objects.all()
#     serializer_class = ENTClerkingSerializer
 
 
# class OtologicHistoryListCreateView(generics.ListCreateAPIView):
#     queryset = OtologicHistory.objects.all()
#     serializer_class = OtologicHistorySerializer
 
# class OtologicHistoryRetrieveUpdateDestroyView(generics.RetrieveUpdateDestroyAPIView):
#     queryset = OtologicHistory.objects.all()
#     serializer_class = OtologicHistorySerializer
 
 
# class RhinologicHistoryListCreateView(generics.ListCreateAPIView):
#     queryset = RhinologicHistory.objects.all()
#     serializer_class = RhinologicHistorySerializer
 
# class RhinologicHistoryRetrieveUpdateDestroyView(generics.RetrieveUpdateDestroyAPIView):
#     queryset = RhinologicHistory.objects.all()
#     serializer_class = RhinologicHistorySerializer
 
 
# class LaryngologyHistoryListCreateView(generics.ListCreateAPIView):
#     queryset = LaryngologyHistory.objects.all()
#     serializer_class = LaryngologyHistorySerializer
 
# class LaryngologyHistoryRetrieveUpdateDestroyView(generics.RetrieveUpdateDestroyAPIView):
#     queryset = LaryngologyHistory.objects.all()
#     serializer_class = LaryngologyHistorySerializer
 
 
# class HeadAndNeckHistoryListCreateView(generics.ListCreateAPIView):
#     queryset = HeadAndNeckHistory.objects.all()
#     serializer_class = HeadAndNeckHistorySerializer
 
# class HeadAndNeckHistoryRetrieveUpdateDestroyView(generics.RetrieveUpdateDestroyAPIView):
#     queryset = HeadAndNeckHistory.objects.all()
#     serializer_class = HeadAndNeckHistorySerializer
 
 
# class PastMedicalSocialHistoryListCreateView(generics.ListCreateAPIView):
#     queryset = PastMedicalSocialHistory.objects.all()
#     serializer_class = PastMedicalSocialHistorySerializer
 
# class PastMedicalSocialHistoryRetrieveUpdateDestroyView(generics.RetrieveUpdateDestroyAPIView):
#     queryset = PastMedicalSocialHistory.objects.all()
#     serializer_class = PastMedicalSocialHistorySerializer
 
 
# class DrugHistoryListCreateView(generics.ListCreateAPIView):
#     queryset = DrugHistory.objects.all()
#     serializer_class = DrugHistorySerializer
 
# class DrugHistoryRetrieveUpdateDestroyView(generics.RetrieveUpdateDestroyAPIView):
#     queryset = DrugHistory.objects.all()
#     serializer_class = DrugHistorySerializer
 
 
# class GeneralExaminationListCreateView(generics.ListCreateAPIView):
#     queryset = GeneralExamination.objects.all()
#     serializer_class = GeneralExaminationSerializer
 
# class GeneralExaminationRetrieveUpdateDestroyView(generics.RetrieveUpdateDestroyAPIView):
#     queryset = GeneralExamination.objects.all()
#     serializer_class = GeneralExaminationSerializer
 
 
# class EarExaminationListCreateView(generics.ListCreateAPIView):
#     queryset = EarExamination.objects.all()
#     serializer_class = EarExaminationSerializer
 
# class EarExaminationRetrieveUpdateDestroyView(generics.RetrieveUpdateDestroyAPIView):
#     queryset = EarExamination.objects.all()
#     serializer_class = EarExaminationSerializer
 
 
# class NasalExaminationListCreateView(generics.ListCreateAPIView):
#     queryset = NasalExamination.objects.all()
#     serializer_class = NasalExaminationSerializer
 
# class NasalExaminationRetrieveUpdateDestroyView(generics.RetrieveUpdateDestroyAPIView):
#     queryset = NasalExamination.objects.all()
#     serializer_class = NasalExaminationSerializer
 
 
# class OralCavityOropharynxExaminationListCreateView(generics.ListCreateAPIView):
#     queryset = OralCavityOropharynxExamination.objects.all()
#     serializer_class = OralCavityOropharynxExaminationSerializer
 
# class OralCavityOropharynxExaminationRetrieveUpdateDestroyView(generics.RetrieveUpdateDestroyAPIView):
#     queryset = OralCavityOropharynxExamination.objects.all()
#     serializer_class = OralCavityOropharynxExaminationSerializer
 
 
# class NeckExaminationListCreateView(generics.ListCreateAPIView):
#     queryset = NeckExamination.objects.all()
#     serializer_class = NeckExaminationSerializer
 
# class NeckExaminationRetrieveUpdateDestroyView(generics.RetrieveUpdateDestroyAPIView):
#     queryset = NeckExamination.objects.all()
#     serializer_class = NeckExaminationSerializer


 
 
from rest_framework.generics import ListCreateAPIView,RetrieveUpdateAPIView,RetrieveAPIView,RetrieveUpdateAPIView
from rest_framework.response import Response
from rest_framework import status
from .models import *


from .models import ENTClerking
from .serializers import ENTRegistrationSerializer

    
class ENTRegistrationView(ListCreateAPIView):
    queryset = ENTClerking.objects.all()

    def get_serializer_class(self):
        if self.request.method == "POST":
            return ENTRegistrationSerializer   # your current serializer (WRITE)
        return ENTRegistrationReadSerializer   # new READ serializer

    def get_queryset(self):
        queryset = super().get_queryset()
        patient_id = self.request.query_params.get("patient_id")

        if patient_id:
            queryset = queryset.filter(patient_id=patient_id)

        return queryset

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        clerking = serializer.save()

        return Response(
            {
                "detail": "ENT clerking registration complete.",
                "clerking_id": clerking.pk,
                "patient_id": clerking.patient.pk,
            },
            status=status.HTTP_201_CREATED,
        )



class ENTRegistrationDetailView(RetrieveUpdateAPIView):
    queryset = ENTClerking.objects.all()

    def get_serializer_class(self):
        if self.request.method in ["PUT", "PATCH"]:
            return ENTRegistrationSerializer   # WRITE (uses your update())
        return ENTRegistrationReadSerializer   # READ   
    
     
class ENTClerkingDetailView(RetrieveAPIView):
    queryset = ENTClerking.objects.all()
    serializer_class = ENTRegistrationSerializer 


class OtologicHistoryView(RetrieveUpdateAPIView):
    queryset = OtologicHistory.objects.all()
    serializer_class = OtologicHistorySerializer    

class EarExaminationView(RetrieveUpdateAPIView):
    queryset = EarExamination.objects.all()
    serializer_class = EarExaminationSerializer    

