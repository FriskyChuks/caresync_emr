from rest_framework import serializers
from .models import *

class UnitSerializer(serializers.ModelSerializer):
    class Meta:
        model = Unit
        fields = '__all__'
        
class RadiologyTestSerializer(serializers.ModelSerializer):
    class Meta:
        model = RadiologyTest
        fields = '__all__'
        
class RadiologyRequestSerializer(serializers.ModelSerializer):
    class Meta:
        model = RadiologyRequest
        fields = '__all__'

class RadiologyResultSerializer(serializers.ModelSerializer):
    class Meta:
        model = RadiologyResult
        fields = '__all__'