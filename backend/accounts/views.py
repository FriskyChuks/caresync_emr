from rest_framework.generics import *
from .models import *
from rest_framework.generics import ListCreateAPIView
from rest_framework import generics
from .serializers import *
from patients.models import *
from patients.serializers import *



class UserCategoryListCreateView(ListCreateAPIView):
    queryset = UserCategory.objects.all()
    serializer_class = UserCategorySerializer


class GenderListCreateView(ListCreateAPIView):
    queryset = Gender.objects.all()
    serializer_class = GenderSerializer


class MaritalStatusListCreatetView(ListCreateAPIView):
    queryset = MaritalStatus.objects.all()
    serializer_class = MaritalStatusSerializer


class ReligionListCreateView(ListCreateAPIView):
    queryset = Religion.objects.all()
    serializer_class = ReligionSerializer


# class PatientRegisterView(generics.ListCreateAPIView):
#     queryset = Patient.objects.all()
#     serializer_class = PatientSerializer
#     # permission_classes = [IsAuthenticated] 

#     def get_serializer_context(self):
#         """Pass the request into the context for use in the serializer."""
#         context = super().get_serializer_context()
#         context['request'] = self.request
#         return context



# accounts/views.py
from rest_framework_simplejwt.views import TokenObtainPairView
from .serializers import CustomTokenObtainPairSerializer

class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer





