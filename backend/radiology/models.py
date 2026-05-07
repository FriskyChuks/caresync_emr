from django.db import models
from accounts.models import *
from patients.models import *

from encounters.models import EncounterRoute


# 1. Units Table
class Unit(models.Model):
    title = models.CharField(max_length=255)

    def __str__(self):
        return self.title


# 2. Investigation Table
class Investigation(models.Model):
    title = models.CharField(max_length=255)
    radiology_unit = models.ForeignKey(Unit, on_delete=models.CASCADE, related_name="investigations")
    has_views = models.BooleanField(default=False)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    created_by = models.ForeignKey(CustomUser, on_delete=models.SET_NULL, null=True, blank=True)
    date_created = models.DateTimeField(auto_now_add=True)
    last_updated = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.title


# 3. Views Table
class InvestigationView(models.Model):
    investigation = models.ForeignKey(Investigation, on_delete=models.CASCADE, related_name="views")
    title = models.CharField(max_length=255)
    price = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    created_by = models.ForeignKey(CustomUser, on_delete=models.SET_NULL, null=True, blank=True)
    date_created = models.DateTimeField(auto_now_add=True)
    last_updated = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.title} ({self.investigation.title})"



# 4. Investigation Request Table (Updated)
# Updated models with your status choices
REQUEST_STATUS = [
    ("pending", "Pending"),
    ("billed", "Billed"),
    ("partly_billed", "Partly Billed"),
    ("in_progress", "In progress"),
    ("completed", "Completed"),
    ("canceled", "Canceled"),
]

# 4. Investigation Request Table (Updated)
class InvestigationRequest(models.Model):
    encounter = models.ForeignKey(EncounterRoute, on_delete=models.SET_NULL, null=True, blank=True)
    patient = models.ForeignKey(Patient, on_delete=models.CASCADE, related_name="investigation_requests")
    clinical_notes = models.TextField(blank=True, null=True)
    urgency = models.CharField(max_length=20, choices=[("routine", "Routine"), ("urgent", "Urgent"), ("stat", "STAT")], default="routine")
    status = models.CharField(max_length=20, choices=REQUEST_STATUS, default="pending")
    total_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    created_by = models.ForeignKey(CustomUser, on_delete=models.SET_NULL, null=True, blank=True)
    date_created = models.DateTimeField(auto_now_add=True)
    last_updated = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"RAD#{self.id} - {self.patient}"

    def update_total_amount(self):
        total = sum(detail.total_price for detail in self.details.all())
        self.total_amount = total
        self.save()

    def update_overall_status(self):
        """Auto-update request status based on detail statuses"""
        details = self.details.all()
        
        if not details.exists():
            self.status = "pending"
        elif all(detail.status == "completed" for detail in details):
            self.status = "completed"
        elif any(detail.status == "in_progress" or detail.status == "completed" for detail in details):
            self.status = "in_progress"
        elif all(detail.status in ["billed", "completed"] for detail in details):
            self.status = "billed"
        elif any(detail.status == "billed" for detail in details):
            self.status = "partly_billed"
        elif any(detail.status == "canceled" for detail in details):
            self.status = "canceled"
        else:
            self.status = "pending"
        
        self.save()

# 5. Request Details Table (NEW)
class RequestDetail(models.Model):
    request = models.ForeignKey(InvestigationRequest, on_delete=models.CASCADE, related_name="details")
    investigation = models.ForeignKey(Investigation, on_delete=models.CASCADE)
    investigation_view = models.ForeignKey(InvestigationView, on_delete=models.SET_NULL, null=True, blank=True)
    quantity = models.PositiveIntegerField(default=1)
    unit_price = models.DecimalField(max_digits=10, decimal_places=2)
    total_price = models.DecimalField(max_digits=10, decimal_places=2)
    status = models.CharField(max_length=20, choices=REQUEST_STATUS, default="pending")
    priority = models.PositiveIntegerField(default=1)  # For ordering tests
    notes = models.TextField(blank=True, null=True)  # Specific notes for this test
    date_created = models.DateTimeField(auto_now_add=True)
    last_updated = models.DateTimeField(auto_now=True)

    def save(self, *args, **kwargs):
        # Auto-calculate total price
        if not self.total_price:
            self.total_price = self.unit_price * self.quantity
        super().save(*args, **kwargs)
        
        # Update parent request status and total
        if self.request:
            self.request.update_overall_status()
            self.request.update_total_amount()

    def __str__(self):
        return f"{self.investigation.title} - {self.request.patient}"

# 6. Result Table (Updated)
class InvestigationResult(models.Model):
    request_detail = models.OneToOneField(RequestDetail, on_delete=models.CASCADE, related_name="result")
    result = models.TextField()
    comments = models.CharField(max_length=500, blank=True, null=True)
    diagnosis = models.TextField(blank=True, null=True)
    findings = models.JSONField(blank=True, null=True)  # For structured data
    attachments = models.FileField(upload_to='radiology/results/', blank=True, null=True)
    is_abnormal = models.BooleanField(default=False)
    supervised_by = models.CharField(max_length=255, blank=True, null=True)
    created_by = models.ForeignKey(CustomUser, on_delete=models.SET_NULL, null=True, blank=True, related_name="created_results")
    date_created = models.DateTimeField(auto_now_add=True)
    date_verified = models.DateTimeField(null=True, blank=True)

    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)
        # Auto-update the request detail status when result is created
        if self.request_detail.status != "completed":
            self.request_detail.status = "completed"
            self.request_detail.save()

    def __str__(self):
        return f"Result for {self.request_detail}"