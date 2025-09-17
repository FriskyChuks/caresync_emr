from rest_framework import generics
from .models import *
from .serializers import *


class ClerkingListCreateView(generics.ListCreateAPIView):
    queryset = Clerking.objects.all().order_by('-date_created')
    serializer_class = ClerkingSerializer



class NoteTypeListCreateView(generics.ListCreateAPIView):
    queryset = NoteType.objects.all().order_by('title')
    serializer_class = NoteTypeSerializer
 