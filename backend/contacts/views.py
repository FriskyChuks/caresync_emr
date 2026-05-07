from django.shortcuts import render
from rest_framework import generics
from .models import *
from .serializers import *
from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404
from accounts.models import CustomUser


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



class PatientResidentialAddressView(generics.GenericAPIView):
    """
    Custom view to handle residential address for patient updates.
    If address exists, update it. If not, create it with the provided user.
    """
    serializer_class = ResidentialAddressSerializer
    permission_classes = [IsAuthenticated]
    
    def post(self, request, *args, **kwargs):
        user_id = request.data.get('user')
        if not user_id:
            return Response({"error": "user field is required"}, status=status.HTTP_400_BAD_REQUEST)
        
        # Get the user instance
        try:
            user = CustomUser.objects.get(id=user_id)
        except CustomUser.DoesNotExist:
            return Response({"error": "User not found"}, status=status.HTTP_404_NOT_FOUND)
        
        # Prepare data without the user field (since serializer excludes it)
        data = request.data.copy()
        if 'user' in data:
            data.pop('user')
        
        # Check if address already exists for this user
        try:
            address = ResidentialAddress.objects.get(user_id=user_id)
            # Update existing
            serializer = self.get_serializer(address, data=data, partial=True)
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data, status=status.HTTP_200_OK)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except ResidentialAddress.DoesNotExist:
            # Create new - manually set the user
            serializer = self.get_serializer(data=data)
            if serializer.is_valid():
                serializer.save(user=user)  # Explicitly set the user
                return Response(serializer.data, status=status.HTTP_201_CREATED)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class PatientPermanentAddressView(generics.GenericAPIView):
    """
    Custom view to handle permanent address for patient updates.
    If address exists, update it. If not, create it with the provided user.
    """
    serializer_class = PermanentAddressSerializer
    permission_classes = [IsAuthenticated]
    
    def post(self, request, *args, **kwargs):
        user_id = request.data.get('user')
        if not user_id:
            return Response({"error": "user field is required"}, status=status.HTTP_400_BAD_REQUEST)
        
        # Get the user instance
        try:
            user = CustomUser.objects.get(id=user_id)
        except CustomUser.DoesNotExist:
            return Response({"error": "User not found"}, status=status.HTTP_404_NOT_FOUND)
        
        # Prepare data without the user field (since serializer excludes it)
        data = request.data.copy()
        if 'user' in data:
            data.pop('user')
        
        # Check if address already exists for this user
        try:
            address = PermanentAddress.objects.get(user_id=user_id)
            # Update existing
            serializer = self.get_serializer(address, data=data, partial=True)
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data, status=status.HTTP_200_OK)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except PermanentAddress.DoesNotExist:
            # Create new - manually set the user
            serializer = self.get_serializer(data=data)
            if serializer.is_valid():
                serializer.save(user=user)  # Explicitly set the user
                return Response(serializer.data, status=status.HTTP_201_CREATED)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class PatientNextOfKinView(generics.GenericAPIView):
    """
    Custom view to handle next of kin for patient updates.
    If kin exists, update it. If not, create it with the provided user.
    """
    serializer_class = NextOfKinSerializer
    permission_classes = [IsAuthenticated]
    
    def post(self, request, *args, **kwargs):
        user_id = request.data.get('user')
        if not user_id:
            return Response({"error": "user field is required"}, status=status.HTTP_400_BAD_REQUEST)
        
        # Get the user instance
        try:
            user = CustomUser.objects.get(id=user_id)
        except CustomUser.DoesNotExist:
            return Response({"error": "User not found"}, status=status.HTTP_404_NOT_FOUND)
        
        # Prepare data without the user field (since serializer excludes it)
        data = request.data.copy()
        if 'user' in data:
            data.pop('user')
        
        # Check if kin already exists for this user
        try:
            kin = NextOfKin.objects.get(user_id=user_id)
            # Update existing
            serializer = self.get_serializer(kin, data=data, partial=True)
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data, status=status.HTTP_200_OK)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except NextOfKin.DoesNotExist:
            # Create new - manually set the user
            serializer = self.get_serializer(data=data)
            if serializer.is_valid():
                serializer.save(user=user)  # Explicitly set the user
                return Response(serializer.data, status=status.HTTP_201_CREATED)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
