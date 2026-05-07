from django.urls import path

from .views import *

urlpatterns = [
    # ----------- triage/urls.py -----------
    path("patients/<int:pid>/", PatientTriageListCreateView.as_view(), name="patient-triage"),

    # ----------- fluid_balance/urls.py -----------
    path('patients/<int:pid>/fluid-balance/', PatientFluidBalanceListCreateView.as_view(), name='patient-fluid-balance'),
    # path('patients/<int:pid>/fluid-balance/summary/',FluidBalanceSummaryView.as_view(),name='fluid-balance-summary'),
]
