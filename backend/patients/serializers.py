from rest_framework import serializers
from django.contrib.auth import authenticate
from .models import *

from encounters.serializers import VisitSerializer
from encounters.models import Visit
from contacts.serializers import *
    
class PatientSerializer(serializers.ModelSerializer):
    registered_by = serializers.SerializerMethodField(read_only=True)
    marital_status = serializers.SerializerMethodField(read_only=True)
    religion = serializers.SerializerMethodField(read_only=True)
    active_visit = serializers.SerializerMethodField(read_only=True)
    user_info = serializers.SerializerMethodField(read_only=True)

    residential_address_data = serializers.SerializerMethodField(read_only=True)
    permanent_address_data = serializers.SerializerMethodField(read_only=True)
    next_of_kin_data = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = Patient
        exclude = ["user"]

    def get_user_info(self, obj):
        if obj.user:
            return {
                "id": obj.user.id,
                "first_name": obj.user.first_name,
                "last_name": obj.user.last_name,
                "fullname":f"{obj.user.first_name} {obj.user.last_name}",
                "email": obj.user.email,
                "gender": {
                            "id": obj.user.gender.id,
                            "title": obj.user.gender.title
                    } if obj.user.gender else None,
                "is_active": obj.user.is_active,
            }
        return None

    def get_registered_by(self, obj):
        if obj.created_by:
            return {
                "first_name": obj.created_by.first_name,
                "last_name": obj.created_by.last_name,
            }
        return None
    
    def get_marital_status(self, obj):
        if obj.marital_status:
            return obj.marital_status.title
        return None
    
    def get_religion(self, obj):
        if obj.religion:
            return obj.religion.title
        return None
    
    def get_active_visit(self, obj):
        visit = Visit.objects.filter(patient=obj, visit_status=True).last()
        if visit:
            return VisitSerializer(visit).data
        return None
    
    def get_residential_address_data(self, obj):
        address = getattr(obj.user, "residentialaddress", None)
        if address:
            return ResidentialAddressSerializer(address).data
        return None

    def get_permanent_address_data(self, obj):
        addr = getattr(obj.user, "permanentaddress", None)
        return PermanentAddressSerializer(addr).data if addr else None

    def get_next_of_kin_data(self, obj):
        nok = getattr(obj.user, "nextofkin", None)
        return NextOfKinSerializer(nok).data if nok else None




