from django.urls import path

from .views import *

urlpatterns = [
    path('', PatientListCreateView.as_view()),
    path('patient_search/', PatientSearchView.as_view()),
    path("patient_detail/<int:id>/", PatientDetailView.as_view(), name="patient-detail"),
]