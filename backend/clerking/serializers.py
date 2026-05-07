from rest_framework import serializers
from .models import *


class NoteTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = NoteType
        fields =  "__all__"

class NoteSerializer(serializers.ModelSerializer):
    written_by = serializers.SerializerMethodField(read_only=True)
    notetype = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = Note
        fields =  "__all__"

    def get_notetype(self, obj):
        return obj.note_type.title

    def get_written_by(self, obj):
        return f"{obj.created_by.first_name} {obj.created_by.last_name}"