from rest_framework.decorators import api_view, permission_classes
from rest_framework.generics import *

from .models import *
from .serializers import *


class AppointmentListCreateView(ListCreateAPIView):
    queryset = Appointment.objects.all()
    serializer_class = AppointmentSerializer


class UpdateAppointmentView(RetrieveUpdateAPIView):
    queryset = Appointment.objects.all()
    serializer_class = AppointmentSerializer
    lookup_field = 'id'
    lookup_url_kwarg = 'appointment_id'
    

class AppointmentDetailView(RetrieveAPIView):
    queryset = Appointment.objects.all()
    serializer_class = AppointmentSerializer
    lookup_field = 'id'
    lookup_url_kwarg = 'appointment_id'
