# accounts/serializers.py
from rest_framework import serializers
from django.contrib.auth import authenticate
from djoser.serializers import UserCreateSerializer as BaseUserCreateSerializer
from django.db import transaction
import logging

from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.contrib.auth.hashers import check_password
from django.conf import settings

from .models import *
from patients.models import Patient
from contacts.serializers import *
from contacts.models import *
from patients.serializers import PatientSerializer
from lab.models import LabUnit
from pharmacies.models import PharmacyStore

logger = logging.getLogger(__name__)

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


class BasicPatientSerializer(serializers.ModelSerializer):
    patient_number = serializers.CharField(read_only=True)
    class Meta:
        model = Patient
        fields = [
            "id",
            "patient_number",
            "phone",
            "status",
            "date_of_birth",
            "age"
        ]


class CustomUserCreateSerializer(serializers.ModelSerializer):
    # extra input-only fields
    password = serializers.CharField(write_only=True, required=True)
    re_password = serializers.CharField(write_only=True, required=True)

    # ---- INPUT (write-only) ----
    patient = PatientSerializer(write_only=True, required=True)
    residential_address = ResidentialAddressSerializer(write_only=True, required=False)
    permanent_address = PermanentAddressSerializer(write_only=True, required=False)
    next_of_kin = NextOfKinSerializer(write_only=True, required=False)

    # ---- OUTPUT (read-only) ----
    patient_data = PatientSerializer(source="patient_profile", read_only=True)
    
    # NEW: Readable store and unit names
    pharmacy_store_name = serializers.SerializerMethodField(read_only=True)
    lab_unit_name = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = CustomUser
        fields = [
            # core user fields
            "id",
            "username",
            "first_name",
            "last_name",
            "other_name",
            "email",
            "gender",
            "user_category",
            "pharmacy_store",
            "lab_unit",
            "pharmacy_store_name",
            "lab_unit_name",
            "is_active",
            "is_staff",
            "is_intern",
            "is_pharmacy_store_manager",
            # password helpers
            "password",
            "re_password",
            # nested input
            "patient",
            "residential_address",
            "permanent_address",
            "next_of_kin",
            # nested output
            "patient_data",
        ]
        
    def get_pharmacy_store_name(self, obj):
        return obj.pharmacy_store.name if obj.pharmacy_store else None

    def get_lab_unit_name(self, obj):
        return obj.lab_unit.name if obj.lab_unit else None

    def validate(self, attrs):
        """Custom validation for the entire payload"""
        password = attrs.get("password")
        re_password = attrs.get("re_password")

        if password and re_password and password != re_password:
            raise serializers.ValidationError({"password": "Passwords do not match."})

        # Validate that user can't be assigned to both pharmacy store and lab unit
        pharmacy_store = attrs.get("pharmacy_store")
        lab_unit = attrs.get("lab_unit")
        
        if pharmacy_store and lab_unit:
            raise serializers.ValidationError({
                "non_field_errors": "User cannot be assigned to both a pharmacy store and a lab unit."
            })

        return attrs

    @transaction.atomic
    def create(self, validated_data):
        # Extract nested data
        patient_data = validated_data.pop("patient")
        residential_data = validated_data.pop("residential_address", None) 
        permanent_data = validated_data.pop("permanent_address", None)
        nok_data = validated_data.pop("next_of_kin", None)

        logger.debug(f"CustomUserCreateSerializer.create - patient_data keys: {patient_data.keys() if patient_data else 'None'}")

        # Handle password
        password = validated_data.pop("password")
        validated_data.pop("re_password", None)

        # Extract mandatory positional args
        first_name = validated_data.pop("first_name")
        last_name = validated_data.pop("last_name")

        # Create user with all other valid fields (email, gender, user_category, etc.)
        user = CustomUser.objects.create_user(
            first_name=first_name,
            last_name=last_name,
            password=password,
            **validated_data
        )

        # Create patient with the patient_data (which may contain photo_base64)
        # The PatientSerializer will handle the photo_base64 conversion
        patient_serializer = PatientSerializer(data=patient_data)
        if patient_serializer.is_valid():
            patient = patient_serializer.save(user=user)
            logger.debug(f"Patient created with ID: {patient.id}")
        else:
            logger.error(f"Patient serializer errors: {patient_serializer.errors}")
            raise serializers.ValidationError({"patient": patient_serializer.errors})

        # Related tables
        if residential_data:
            ResidentialAddress.objects.create(user=user, **residential_data)
        if permanent_data:
            PermanentAddress.objects.create(user=user, **permanent_data)
        if nok_data:
            NextOfKin.objects.create(user=user, **nok_data)

        return user


class BasicUserSerializer(serializers.ModelSerializer):

    patient_profile = BasicPatientSerializer(read_only=True)
    user_category = UserCategorySerializer(read_only=True)
    gender = GenderSerializer(read_only=True)

    pharmacy_store_name = serializers.SerializerMethodField(read_only=True)
    lab_unit_name = serializers.SerializerMethodField(read_only=True)

    pharmacy_store_id = serializers.IntegerField(source='pharmacy_store.id', read_only=True)
    lab_unit_id = serializers.IntegerField(source='lab_unit.id', read_only=True)

    # OPTIONAL: direct shortcut (flattened access for frontend convenience)
    patient_number = serializers.CharField(source='patient_profile.patient_number', read_only=True)

    class Meta:
        model = CustomUser
        fields = [
            "id",
            "username",
            "first_name",
            "last_name",
            "email",
            "gender",
            "is_active",
            "is_staff",
            "is_pharmacy_store_manager",

            "patient_profile",
            "patient_number",   # 👈 NEW FLAT FIELD

            "user_category",
            "pharmacy_store_id",
            "lab_unit_id",
            "pharmacy_store_name",
            "lab_unit_name",

            "is_intern",
            "other_name"
        ]

    def get_pharmacy_store_name(self, obj):
        return obj.pharmacy_store.name if obj.pharmacy_store else None

    def get_lab_unit_name(self, obj):
        return obj.lab_unit.name if obj.lab_unit else None


# Updated: UserCategoryAssignmentSerializer with readable names
class UserCategoryAssignmentSerializer(serializers.ModelSerializer):
    pharmacy_store_name = serializers.SerializerMethodField(read_only=True)
    lab_unit_name = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = CustomUser
        fields = [
            "user_category", 
            "pharmacy_store", 
            "lab_unit",
            "pharmacy_store_name",
            "lab_unit_name"
        ]
    
    def get_pharmacy_store_name(self, obj):
        return obj.pharmacy_store.name if obj.pharmacy_store else None

    def get_lab_unit_name(self, obj):
        return obj.lab_unit.name if obj.lab_unit else None
    
    def validate(self, attrs):
        pharmacy_store = attrs.get("pharmacy_store")
        lab_unit = attrs.get("lab_unit")
        
        # Validate that user can't be assigned to both pharmacy store and lab unit
        if pharmacy_store and lab_unit:
            raise serializers.ValidationError({
                "non_field_errors": "User cannot be assigned to both a pharmacy store and a lab unit."
            })
        
        return attrs


# Updated: DetailedUserSerializer with readable names
class DetailedUserSerializer(serializers.ModelSerializer):

    patient_profile = BasicPatientSerializer(read_only=True)
    user_category = UserCategorySerializer(read_only=True)
    gender = GenderSerializer(read_only=True)

    pharmacy_store_name = serializers.SerializerMethodField(read_only=True)
    lab_unit_name = serializers.SerializerMethodField(read_only=True)

    pharmacy_store_id = serializers.PrimaryKeyRelatedField(
        queryset=PharmacyStore.objects.all(),
        source='pharmacy_store',
        write_only=True,
        required=False,
        allow_null=True
    )

    lab_unit_id = serializers.PrimaryKeyRelatedField(
        queryset=LabUnit.objects.all(),
        source='lab_unit',
        write_only=True,
        required=False,
        allow_null=True
    )

    # ✅ NEW: flattened MRN for frontend convenience
    patient_number = serializers.CharField(
        source='patient_profile.patient_number',
        read_only=True
    )

    class Meta:
        model = CustomUser
        fields = [
            "id",
            "username",
            "first_name",
            "last_name",
            "other_name",
            "email",
            "gender",
            "user_category",

            "patient_profile",
            "patient_number",   # 👈 NEW FLAT FIELD

            "pharmacy_store_name",
            "lab_unit_name",
            "pharmacy_store_id",
            "lab_unit_id",

            "is_active",
            "is_staff",
            "is_intern",
            "last_login"
        ]

        read_only_fields = ["last_login"]

    def get_pharmacy_store_name(self, obj):
        return obj.pharmacy_store.name if obj.pharmacy_store else None

    def get_lab_unit_name(self, obj):
        return obj.lab_unit.name if obj.lab_unit else None
      

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


class FacilityAddressSerializer(serializers.ModelSerializer):
    class Meta:
        model = FacilityAddress
        fields = '__all__'