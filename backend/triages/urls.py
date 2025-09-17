from django.urls import path

from .views import PatientTriageListCreateView

urlpatterns = [
    path("patients/<int:pid>/", PatientTriageListCreateView.as_view(), name="patient-triage"),
]
