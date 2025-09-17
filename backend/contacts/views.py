from django.shortcuts import render
from rest_framework import generics
from .models import *
from .serializers import *


class ContinentListCreateView(generics.ListCreateAPIView):
    queryset = Continent.objects.all()
    serializer_class = ContinentSerializer


class ContinentDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Continent.objects.all()
    serializer_class = ContinentSerializer


# ---------------- COUNTRY ----------------
class CountryListCreateView(generics.ListCreateAPIView):
    queryset = Country.objects.select_related("continent").all()
    serializer_class = CountrySerializer


class CountryDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Country.objects.all()
    serializer_class = CountrySerializer


# ---------------- STATE ----------------
class StateListCreateView(generics.ListCreateAPIView):
    queryset = State.objects.select_related("country").all()
    serializer_class = StateSerializer


class StateDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = State.objects.all()
    serializer_class = StateSerializer


# ---------------- LOCAL GOVERNMENT AREA ----------------
class LGAListCreateView(generics.ListCreateAPIView):
    queryset = LocalGovernmentArea.objects.select_related("state").all()
    serializer_class = LocalGovernmentAreaSerializer


class LGADetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = LocalGovernmentArea.objects.all()
    serializer_class = LocalGovernmentAreaSerializer


# ---------------- RESIDENTIAL ADDRESS ----------------
class ResidentialAddressListCreateView(generics.ListCreateAPIView):
    queryset = ResidentialAddress.objects.select_related("user", "country", "state_of_origin", "local_government_area")
    serializer_class = ResidentialAddressSerializer


class ResidentialAddressDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = ResidentialAddress.objects.select_related("user", "country", "state_of_origin", "local_government_area")
    serializer_class = ResidentialAddressSerializer


# ---------------- PERMANENT ADDRESS ----------------
class PermanentAddressListCreateView(generics.ListCreateAPIView):
    queryset = PermanentAddress.objects.select_related("user", "state_of_residence", "local_government_area_of_residence")
    serializer_class = PermanentAddressSerializer


class PermanentAddressDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = PermanentAddress.objects.select_related("user", "state_of_residence", "local_government_area_of_residence")
    serializer_class = PermanentAddressSerializer


# ---------------- NEXT OF KIN ----------------
class NextOfKinListCreateView(generics.ListCreateAPIView):
    queryset = NextOfKin.objects.select_related("user")
    serializer_class = NextOfKinSerializer


class NextOfKinDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = NextOfKin.objects.select_related("user")
    serializer_class = NextOfKinSerializer
