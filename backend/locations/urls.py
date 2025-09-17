from django.urls import path

from .views import *

urlpatterns = [
    path('clinics/', ClinicListCreateView.as_view(), name='clinic-list-create'), 
    path('clinics/<int:pk>/', ClinicDetailView.as_view(), name='clinic-detail'),   
    path('wards/', WardListCreateView.as_view(), name='ward-list-create'),
    path('wards/<int:pk>/', WardDetailView.as_view(), name='ward-detail'),
    path('clinics/<int:pk>/patients/', ClinicPatientListView.as_view(), name='clinic-patients'),
    path('wards/<int:pk>/patients/', WardPatientListView.as_view(), name='ward-patients'),
]