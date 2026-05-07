from rest_framework.response import Response
from rest_framework import generics
from rest_framework.decorators import api_view

from .serializers import *
from .models import *
# Create your views here.

class  NoteTypeListCreateView(generics.ListCreateAPIView):
    queryset = NoteType.objects.all()
    serializer_class = NoteTypeSerializer

class NoteTypeDetailView(generics.RetrieveUpdateAPIView):
    queryset = NoteType.objects.all()
    serializer_class = NoteTypeSerializer


class NoteListCreateView(generics.ListCreateAPIView):
    queryset = Note.objects.all()
    serializer_class = NoteSerializer

class NoteDetailView(generics.RetrieveUpdateAPIView):
    queryset = NoteType.objects.all()
    serializer_class = NoteSerializer   

class NoteRetrieveUpdateView(generics.RetrieveUpdateAPIView):
    queryset = Note.objects.all()
    serializer_class = NoteSerializer


@api_view(['GET'])
def patient_notes(request, patient_id):
    notes = Note.objects.filter(patient_id=patient_id).order_by('-date_created')
    serializer = NoteSerializer(notes, many=True)
    return Response(serializer.data)


