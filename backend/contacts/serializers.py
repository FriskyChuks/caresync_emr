from rest_framework import serializers
from .models import *

class ContinentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Continent
        fields = "__all__"


class CountrySerializer(serializers.ModelSerializer):
    continent_name = serializers.CharField(source="continent.title", read_only=True)

    class Meta:
        model = Country
        fields = '__all__'


class StateSerializer(serializers.ModelSerializer):
    country_name = serializers.CharField(source="country.title", read_only=True)

    class Meta:
        model = State
        fields = ["id", "title", "country", "country_name"]


class LocalGovernmentAreaSerializer(serializers.ModelSerializer):
    state_name = serializers.CharField(source="state.title", read_only=True)

    class Meta:
        model = LocalGovernmentArea
        fields = '__all__'


class ResidentialAddressSerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(source="user.get_full_name", read_only=True)
    state_of_origin_name = serializers.CharField(source="state_of_origin.title", read_only=True)
    lga_name = serializers.CharField(source="local_government_area.title", read_only=True)
    country_name = serializers.CharField(source="country.title", read_only=True)

    class Meta:
        model = ResidentialAddress
        exclude = ['user']


class PermanentAddressSerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(source="user.get_full_name", read_only=True)
    state_name = serializers.CharField(source="state_of_residence.title", read_only=True)
    lga_name = serializers.CharField(source="local_government_area_of_residence.title", read_only=True)

    class Meta:
        model = PermanentAddress
        exclude = ['user']


class NextOfKinSerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(source="user.get_full_name", read_only=True)

    class Meta:
        model = NextOfKin
        exclude = ['user']