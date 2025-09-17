from django.shortcuts import render
from .models import *
from .serializers import *
from rest_framework import generics

class UnitListCreateView(generics.ListCreateAPIView):
    queryset = Unit.objects.all()
    serializer_class = UnitSerializer
    
class RadiologyTestListCreateView(generics.ListCreateAPIView):
    queryset = RadiologyTest.objects.all()
    serializer_class = RadiologyTestSerializer

class RadiologyRequestListCreateView(generics.ListCreateAPIView):
    queryset = RadiologyRequest.objects.all()
    serializer_class = RadiologyRequestSerializer
    
class RadiologyResultListCreateView(generics.ListCreateAPIView):
    queryset = Unit.objects.all()
    serializer_class = RadiologyResultSerializer
