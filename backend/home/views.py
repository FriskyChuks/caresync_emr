from django.shortcuts import render
from rest_framework.response import Response

def home_view(request):
    return Response({'hi':'hi'})
