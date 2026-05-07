from django.urls import path

from .views import *

urlpatterns = [
    path('', AppointmentListCreateView.as_view(), name='appointments'),
    path('update/<int:appointment_id>/', UpdateAppointmentView.as_view(), name='update-appointment'),
    path('appointments/<int:appointment_id>/', AppointmentDetailView.as_view(), name='appointment-detail'),
]