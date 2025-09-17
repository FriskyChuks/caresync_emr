from rest_framework import serializers
from django.contrib.auth import authenticate
from djoser.serializers import UserCreateSerializer as BaseUserCreateSerializer
from django.db import transaction

from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.contrib.auth.hashers import check_password
from django.conf import settings

from .models import *
from patients.models import Patient
from contacts.serializers import *
from contacts.models import *
from patients.serializers import PatientSerializer

class UserCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = UserCategory
        fields =  "__all__"

class GenderSerializer(serializers.ModelSerializer):
    class Meta:
        model = Gender
        fields =  "__all__"

class MaritalStatusSerializer(serializers.ModelSerializer):
    class Meta:
        model = MaritalStatus
        fields =  "__all__"

class ReligionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Religion
        fields =  "__all__"


class CustomUserCreateSerializer(BaseUserCreateSerializer):
    # ---- INPUT (write-only) ----
    patient = PatientSerializer(write_only=True, required=True)
    residential_address = ResidentialAddressSerializer(write_only=True, required=False)
    permanent_address = PermanentAddressSerializer(write_only=True, required=False)
    next_of_kin = NextOfKinSerializer(write_only=True, required=False)

    # ---- OUTPUT (read-only) ----
    patient_data = PatientSerializer(source="patient_profile", read_only=True)

    class Meta(BaseUserCreateSerializer.Meta):
        model = CustomUser
        fields = BaseUserCreateSerializer.Meta.fields + (
            # input fields
            "patient",
            "residential_address", 
            "permanent_address",
            "next_of_kin",
            # output fields
            "patient_data",
        )
        extra_kwargs = {
            "password": {"write_only": True},
            "re_password": {"write_only": True}
        }

    def validate(self, attrs):
        """Custom validation for the entire payload"""
        password = attrs.get('password')
        re_password = attrs.get('re_password')
        
        if password and re_password and password != re_password:
            raise serializers.ValidationError({"password": "Passwords do not match."})
        
        return attrs

    @transaction.atomic
    def create(self, validated_data):
        """
        Create user and populate all related tables from single payload.
        Manager handles field filtering automatically.
        """
        # Extract nested data first
        patient_data = validated_data.pop("patient")
        residential_data = validated_data.pop("residential_address", None) 
        permanent_data = validated_data.pop("permanent_address", None)
        nok_data = validated_data.pop("next_of_kin", None)

        # Extract password fields
        password = validated_data.pop("password")
        validated_data.pop("re_password", None)  # Remove re_password, not needed for user creation

        # Extract user creation fields to avoid duplication
        first_name = validated_data.pop("first_name")
        last_name = validated_data.pop("last_name")

        # Create the user
        user = CustomUser.objects.create_user(
            first_name=first_name, last_name=last_name, password=password,
            **validated_data
        )

        # Create mandatory patient record
        Patient.objects.create(user=user, **patient_data)

        # Create optional related records
        if residential_data:
            ResidentialAddress.objects.create(user=user, **residential_data)
            
        if permanent_data:
            PermanentAddress.objects.create(user=user, **permanent_data)
            
        if nok_data:
            NextOfKin.objects.create(user=user, **nok_data)

        return user
    

class BasicPatientSerializer(serializers.ModelSerializer):
    class Meta:
        model = Patient
        fields = ["id", "phone", "status", "date_of_birth", "age"]

class BasicUserSerializer(serializers.ModelSerializer):
    patient_profile = BasicPatientSerializer(read_only=True)

    class Meta:
        model = CustomUser
        fields = [
            "id", "username", "first_name", "last_name", "email",
            "is_active", "is_staff", "patient_profile"
        ]
        

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        data = super().validate(attrs)
        # self.user is the authenticated user after token creation
        default_pw = getattr(settings, "AUTH_DEFAULT_PASSWORD", None)
        if default_pw and check_password(default_pw, self.user.password):
            # instruct frontend to force change
            data["must_change_password"] = True
        else:
            data["must_change_password"] = False
        return data





