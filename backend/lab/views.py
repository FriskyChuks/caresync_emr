from rest_framework import generics
from .models import *
from .serializer import *
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.permissions import AllowAny
from rest_framework import status
from .serializer import *


class LabUnitListCreate(generics.ListCreateAPIView):
    queryset = LabUnit.objects.all()
    serializer_class = LabUnitSerializer

class LabUnitDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = LabUnit.objects.all()
    serializer_class = LabUnitSerializer    

# ---------------- TEST ----------------
class CreateTestAPIView(generics.ListCreateAPIView):
    queryset = Test.objects.all()
    serializer_class = TestSerializer

class TestDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Test.objects.all()
    serializer_class = TestSerializer    


# ---------------- SUBTEST ----------------
class SubTestListCreate(generics.ListCreateAPIView):
    queryset = SubTest.objects.all()
    serializer_class = SubTestSerializer

class SubTestDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = SubTest.objects.all()
    serializer_class = SubTestSerializer

#---------------- REFERENCE RANGE ----------------
class ReferenceRangeListCreate(generics.ListCreateAPIView):
    queryset = ReferenceRange.objects.all()
    serializer_class = ReferenceRangeSerializer

class ReferenceRangeDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = ReferenceRange.objects.all()
    serializer_class = ReferenceRangeSerializer

#---------------- TEST REQUEST ----------------
class TestRequestListCreate(generics.ListCreateAPIView):
    queryset = TestRequest.objects.all()
    serializer_class = TestRequestSerializer

class TestRequestDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = TestRequest.objects.all()
    serializer_class = TestRequestSerializer

#---------------- LAB RESULT ----------------
class LabResultCreateView(generics.ListCreateAPIView):
    queryset = LabResult.objects.all()
    serializer_class = LabResultSerializer
    permission_classes = [AllowAny]

    def perform_create(self, serializer):
        user = self.request.user
        if user.is_authenticated:
            serializer.save(validated_by=user)
        else:
            serializer.save(validated_by=None)

class LabResultDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = LabResult.objects.all()
    serializer_class = LabResultSerializer

#---------------- SUBTEST RESULT ----------------
class SubTestResultListCreate(generics.ListCreateAPIView):
    queryset = SubTestResult.objects.all()
    serializer_class = SubTestResultSerializer

class SubTestResultDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = SubTestResult.objects.all()
    serializer_class = SubTestResultSerializer

#---------------- TEST PANEL ----------------
class TestPanelListCreate(generics.ListCreateAPIView):
    queryset = TestPanel.objects.all()
    serializer_class = TestPanelSerializer

class TestPanelDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = TestPanel.objects.all()
    serializer_class = TestPanelSerializer
