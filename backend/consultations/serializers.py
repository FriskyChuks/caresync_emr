from rest_framework import serializers
from .models import Clerking
from .models import NoteType

class ClerkingSerializer(serializers.ModelSerializer):
    class Meta:
        model = Clerking
        fields = '__all__'



class NoteTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = NoteType
        fields = '__all__'
