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



REQUEST_STATUS = [
    ("pending", "Pending"),           # No payment, no results
    ("billed", "Billed"),             # Bill created but not paid
    ("partly_billed", "Partly Billed"), # Multiple bills, some paid (legacy)
    ("partly_paid", "Partly Paid"),   # NEW: Some items paid, some unpaid
    ("paid", "Paid"),                 # NEW: Payment completed
    ("in_progress", "In progress"),   # Payment done, results being entered
    ("completed", "Completed"),       # Results finalized
    ("canceled", "Canceled"),
]

# 4. Investigation Request Table (Updated)
class InvestigationRequest(models.Model):
    encounter = models.ForeignKey(EncounterRoute, on_delete=models.SET_NULL, null=True, blank=True)
    patient = models.ForeignKey(Patient, on_delete=models.CASCADE, related_name="investigation_requests")
    clinical_notes = models.TextField(blank=True, null=True)
    urgency = models.CharField(max_length=20, choices=[("routine", "Routine"), 
                                                       ("urgent", "Urgent"), ("stat", "STAT")], default="routine")
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
        """
        Auto-update request status based on detail statuses
        This should consider paid status properly
        """
        details = self.details.all()
        
        if not details.exists():
            self.status = "pending"
            self.save(update_fields=['status'])
            return
        
        # Get all detail statuses
        statuses = [d.status for d in details]
        
        # Check if all are completed
        if all(s == "completed" for s in statuses):
            self.status = "completed"
        # Check if any are in progress
        elif any(s == "in_progress" for s in statuses):
            self.status = "in_progress"
        # Check if all are either paid or completed (ready for results)
        elif all(s in ["paid", "completed"] for s in statuses):
            self.status = "paid"
        # Check if any are paid (some paid, some pending)
        elif any(s == "paid" for s in statuses):
            self.status = "partly_paid"
        # Check if all are billed or beyond
        elif all(s in ["billed", "paid", "completed"] for s in statuses):
            self.status = "billed"
        # Check if any are billed
        elif any(s == "billed" for s in statuses):
            self.status = "partly_billed"
        # Check if any are canceled
        elif any(s == "canceled" for s in statuses):
            self.status = "canceled"
        else:
            self.status = "pending"
        
        self.save(update_fields=['status'])

   
# 5. Request Details Table (NEW)
class RequestDetail(models.Model):
    request = models.ForeignKey(InvestigationRequest, on_delete=models.CASCADE, related_name="details")
    investigation = models.ForeignKey(Investigation, on_delete=models.CASCADE)
    investigation_view = models.ForeignKey(InvestigationView, on_delete=models.SET_NULL, null=True, blank=True)
    quantity = models.PositiveIntegerField(default=1)
    unit_price = models.DecimalField(max_digits=10, decimal_places=2)
    total_price = models.DecimalField(max_digits=10, decimal_places=2)
    status = models.CharField(max_length=20, choices=REQUEST_STATUS, default="pending")
    priority = models.PositiveIntegerField(default=1)
    notes = models.TextField(blank=True, null=True)
    
    # NEW: MLS/Radiologist comment field
    radiologist_comment = models.TextField(blank=True, null=True, help_text="Comments from radiologist/MLS about this investigation")
    
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

    def can_enter_results(self):
        """Check if results can be entered for this detail"""
        return self.status in ["paid", "in_progress"]
    
    def is_payment_complete(self):
        """Check if payment is completed for this detail"""
        return self.status in ["paid", "in_progress", "completed"]

    def __str__(self):
        return f"{self.investigation.title} - {self.request.patient}"


# 6. Result Table (Updated)
class InvestigationResult(models.Model):
    request_detail = models.OneToOneField(RequestDetail, on_delete=models.CASCADE, related_name="result")
    result = models.TextField()
    comments = models.CharField(max_length=500, blank=True, null=True)
    diagnosis = models.TextField(blank=True, null=True)
    findings = models.JSONField(blank=True, null=True)
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