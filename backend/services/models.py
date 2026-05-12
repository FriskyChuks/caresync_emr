# services/models.py
from django.db import models
from decimal import Decimal
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


# Updated STATUS_CHOICES for Service Request
SERVICE_REQUEST_STATUS = [
    ("pending", "Pending"),           # No payment
    ("billed", "Billed"),             # Bill created, awaiting payment
    ("partly_paid", "Partly Paid"),   # Partial payment made
    ("paid", "Paid"),                 # Fully paid - ready for service
    ("in_progress", "In Progress"),   # Service being provided
    ("completed", "Completed"),       # Service completed
    ("cancelled", "Cancelled"),
]

class ServiceRequest(models.Model):
    """
    A grouped request representing multiple service items
    ordered together for a single patient.
    """
    patient = models.ForeignKey(
        Patient, on_delete=models.CASCADE, related_name="service_requests"
    )
    requested_by = models.ForeignKey(
        CustomUser, on_delete=models.SET_NULL, null=True, blank=True
    )
    encounter_route = models.ForeignKey(
        EncounterRoute, on_delete=models.SET_NULL, null=True, blank=True,
        help_text="Patient's location at the time of request (clinic or ward)"
    )
    note = models.TextField(blank=True)
    status = models.CharField(
        max_length=20, choices=SERVICE_REQUEST_STATUS, default="pending",
        help_text="Overall status based on payment and service delivery"
    )
    date_requested = models.DateTimeField(auto_now_add=True)
    date_updated = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-date_requested"]

    def __str__(self):
        return f"Service Request #{self.id} for {self.patient}"

    @property
    def total_amount(self):
        return sum(item.total_amount for item in self.details.all())
    
    def is_fully_paid(self):
        """Check if all service details are paid"""
        return all(detail.status in ['paid', 'in_progress', 'completed'] for detail in self.details.all())
    
    def has_paid_items(self):
        """Check if any service detail is paid"""
        return any(detail.status in ['paid', 'in_progress', 'completed'] for detail in self.details.all())
    
    def update_overall_status(self):
        """Auto-update request status based on detail statuses"""
        details = self.details.all()
        
        if not details.exists():
            self.status = "pending"
        elif all(detail.status == "completed" for detail in details):
            self.status = "completed"
        elif any(detail.status == "in_progress" for detail in details):
            self.status = "in_progress"
        elif all(detail.status in ["paid", "completed"] for detail in details):
            self.status = "paid"
        elif any(detail.status == "paid" for detail in details):
            self.status = "partly_paid"
        elif all(detail.status in ["billed", "paid", "completed"] for detail in details):
            self.status = "billed"
        elif any(detail.status == "billed" for detail in details):
            self.status = "billed"
        else:
            self.status = "pending"
        
        self.save(update_fields=['status'])
    
    def can_access_patient_folder(self):
        """Check if patient folder can be accessed (registration/consultation paid)"""
        # Check if there's a registration or consultation service in this request
        registration_or_consultation = self.details.filter(
            service__name__icontains='Registration'
        ).exists() or self.details.filter(
            service__name__icontains='Consultation'
        ).exists()
        
        if not registration_or_consultation:
            return True  # No registration/consultation, allow access
        
        # Check if these specific services are paid
        return self.details.filter(
            service__name__icontains='Registration'
        ).exclude(status__in=['paid', 'in_progress']).exists() == False and \
               self.details.filter(
                   service__name__icontains='Consultation'
               ).exclude(status__in=['paid', 'in_progress']).exists() == False


class ServiceRequestDetail(models.Model):
    """
    Line items under a grouped ServiceRequest.
    Each represents a specific service and quantity.
    """
    SERVICE_DETAIL_STATUS = [
        ("pending", "Pending"),           # No payment
        ("billed", "Billed"),             # Bill created
        ("partly_paid", "Partly Paid"),   # Partial payment
        ("paid", "Paid"),                 # Fully paid
        ("completed", "Completed"),       # Service delivered
    ]

    request = models.ForeignKey(
        ServiceRequest, on_delete=models.CASCADE, related_name="details"
    )
    service = models.ForeignKey(Service, on_delete=models.CASCADE)
    quantity = models.PositiveIntegerField(default=1)
    unit_price = models.DecimalField(max_digits=10, decimal_places=2)
    status = models.CharField(
        max_length=20, choices=SERVICE_DETAIL_STATUS, default="pending",
        help_text="Item-level status for payment and delivery"
    )

    class Meta:
        ordering = ["id"]

    def __str__(self):
        return f"{self.service.name} × {self.quantity}"

    @property
    def total_amount(self):
        return self.quantity * self.unit_price
    
    def can_deliver_service(self):
        """Check if service can be delivered (payment completed)"""
        return self.status in ['paid', 'in_progress']
    
    def is_payment_complete(self):
        """Check if payment is completed"""
        return self.status in ['paid', 'in_progress', 'completed']
    
    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)
        # Update parent request status
        if self.request:
            self.request.update_overall_status()