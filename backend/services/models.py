from django.db import models

from locations.models import Clinic
from accounts.models import CustomUser
from patients.models import Patient
from encounters.models import EncounterRoute

class ServiceCategory(models.Model):
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True, null=True)
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return self.name


class Service(models.Model):
    category = models.ForeignKey(ServiceCategory, on_delete=models.CASCADE, related_name='services')
    name = models.CharField(max_length=150)
    description = models.TextField(blank=True, null=True)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    created_by = models.ForeignKey(CustomUser, on_delete=models.SET_NULL, null=True, blank=True)
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return f"{self.name} ({self.category.name})"
    

class ServiceRequest(models.Model):
    """
    A grouped request representing multiple service items
    ordered together for a single patient.
    """
    STATUS_CHOICES = [
        ("pending", "Pending"),
        ("billed", "Billed"),
        ("in_progress", "In Progress"),
        ("completed", "Completed"),
    ]

    patient = models.ForeignKey(
        Patient, on_delete=models.CASCADE, related_name="service_requests"
    )
    requested_by = models.ForeignKey(
        CustomUser, on_delete=models.SET_NULL, null=True, blank=True
    )
    encounter_route = models.ForeignKey(
        EncounterRoute, on_delete=models.SET_NULL, null=True, blank=True,
        help_text="Patient’s location at the time of request (clinic or ward)"
    )
    note = models.TextField(blank=True)
    status = models.CharField(
        max_length=20, choices=STATUS_CHOICES, default="pending",
        help_text="Overall status (pending, billed, in_progress, completed)"
    )
    date_requested = models.DateTimeField(auto_now_add=True)
    date_updated = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-date_requested"]

    def __str__(self):
        return f"Service Request #{self.id} for {self.patient.id}"

    @property
    def total_amount(self):
        return sum(item.total_amount for item in self.details.all())


class ServiceRequestDetail(models.Model):
    """
    Line items under a grouped ServiceRequest.
    Each represents a specific service and quantity.
    """
    STATUS_CHOICES = [
        ("pending", "Pending"),
        ("billed", "Billed"),
        ("completed", "Completed"),
    ]

    request = models.ForeignKey(
        ServiceRequest, on_delete=models.CASCADE, related_name="details"
    )
    service = models.ForeignKey(Service, on_delete=models.CASCADE)
    quantity = models.PositiveIntegerField(default=1)
    unit_price = models.DecimalField(max_digits=10, decimal_places=2)
    status = models.CharField(
        max_length=20, choices=STATUS_CHOICES, default="pending",
        help_text="Item-level status (pending/completed)"
    )

    class Meta:
        ordering = ["id"]

    def __str__(self):
        return f"{self.service.name} × {self.quantity}"

    @property
    def total_amount(self):
        return self.quantity * self.unit_price
