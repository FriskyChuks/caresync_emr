from django.urls import path
from .views import *

urlpatterns = [
    path("send-to-clinic/", SendToClinicView.as_view(), name="send-to-clinic"),
]
 