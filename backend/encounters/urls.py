from django.urls import path
from .views import *

urlpatterns = [
    path("transfer_patient/", TransferPatientView.as_view(), name="transfer_patient"),
    path("wards/<int:ward_id>/incoming-transfers/", IncomingTransfersForWardView.as_view(), 
         name="ward-incoming-transfers"),
    path("accept-transfer/", AcceptTransferView.as_view(), name="accept-transfer"),
    path("reject_transfer/", reject_transfer, name="reject_transfer"),

    # Discharge endpoints
    path("dicharge_reasons/", DischargeReasonListCreateView.as_view(), name="discharge-reasons"),
    path("discharge/", DischargeCreateView.as_view(), name="discharge-create"),
    path("discharge_details/<int:visit_id>/", DischargeDetailView.as_view(), name="discharge-detail"),
]
 