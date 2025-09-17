from django.db import models

# Create your models here.
from django.conf import settings
from django.db import models

from accounts.models import CustomUser as User
from lab.models import TestRequest
from visits.models import *
# from services.models import PatientEncounterService
from pharmacy.models import *
from radiology.models import RadiologyRequest

BILL_STATUS = (
    ("pending", "Pending"),
    ("billed", "Billed"),
    ("paid", "Paid")
)

PAY_ACTION = (
    ("deposit", "Deposit"),
    ("invoice", "Invoice"),
    ("receipt", "Receipt"),
)


# class Bill(models.Model):
#     encounter = models.ForeignKey(
#         PatientEncounter, on_delete=models.CASCADE, blank=True, null=True)
#     # patient             = models.ForeignKey(Patient, on_delete=models.CASCADE)
#     medical_service = models.ForeignKey(
#         PatientEncounterService, on_delete=models.CASCADE, blank=True, null=True)
#     radiology_service = models.ForeignKey(
#         RadiologyRequest, on_delete=models.CASCADE, blank=True, null=True)
#     # prescription        = models.ForeignKey(Prescription, on_delete=models.CASCADE, blank=True, null=True)
#     dispensary = models.ForeignKey(
#         Dispensary, on_delete=models.CASCADE, blank=True, null=True)
#     lab_request = models.ForeignKey(
#         TestRequest, on_delete=models.CASCADE, blank=True, null=True)
#     status = models.CharField(
#         max_length=10, choices=BILL_STATUS, default='pending')
#     created_by = models.ForeignKey(
#         User, on_delete=models.CASCADE, null=True, blank=True)
#     date_created = models.DateTimeField(auto_now_add=True, auto_now=False)
#     last_updated = models.DateTimeField(auto_now_add=False, auto_now=True)

#     def __str__(self):
#         if self.medical_service:
#             return f"{self.medical_service}"
#         elif self.radiology_service:
#             return f"{self.radiology_service}"
#         elif self.lab_request:
#             return f"{self.lab_request}"
#         else:
#             return f"{self.dispensary}"


# class Payment(models.Model):
#     amount_paid = models.DecimalField(
#         decimal_places=2, default='00.00', max_digits=20)
#     action = models.CharField(max_length=20, choices=PAY_ACTION)
#     patient = models.ForeignKey(Patient, on_delete=models.CASCADE)
#     created_by = models.ForeignKey(
#         User, on_delete=models.CASCADE, null=True, blank=True)
#     date_created = models.DateTimeField(auto_now_add=True, auto_now=False)

#     def __str__(self):
#         return str(self.amount_paid)

#     class Meta:
#         ordering = ["id"]


# class PaymentDetail(models.Model):
#     bill = models.ForeignKey(
#         Bill, on_delete=models.CASCADE, blank=True, null=True)
#     payment = models.ForeignKey(
#         Payment, on_delete=models.CASCADE, null=True, blank=True)
#     created_by = models.ForeignKey(
#         User, on_delete=models.CASCADE, null=True, blank=True)
#     date_created = models.DateTimeField(auto_now_add=False, auto_now=True)
#     last_updated = models.DateTimeField(auto_now_add=True, auto_now=False)

#     def __str__(self):
#         if self.bill.lab_request:
#             return f"{self.bill.lab_request} {self.bill.lab_request.test.price}"
#         elif self.bill.medical_service:
#             return f"{self.bill.medical_service} {self.bill.medical_service.medical_service.price}"
#         elif self.bill.dispensary:
#             return f"{self.bill.dispensary} {self.bill.dispensary.brand.sale_price}"
#         else:
#             return f"{self.bill.radiology_service} {self.bill.radiology_service.radiology_service.price}"


# class Wallet(models.Model):
#     patient = models.OneToOneField(Patient, on_delete=models.CASCADE)
#     account_balance = models.DecimalField(
#         decimal_places=2, default='00.00', max_digits=20)
#     created_by = models.ForeignKey(
#         User, on_delete=models.CASCADE, null=True, blank=True)
#     date_created = models.DateTimeField(auto_now_add=True, auto_now=False)
#     last_updated = models.DateTimeField(
#         auto_now_add=False, auto_now=True, null=True)

#     def __str__(self):
#         return f"N{self.account_balance} || {self.patient.id}"
