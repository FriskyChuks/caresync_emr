from django.db import models
from accounts.models import *
# Create your models here.

from django.db import models
from django.contrib.auth.models import User
from accounts.models import *
from django.conf import settings

from patients.models import *
from encounters.models import EncounterRoute

# Create your models here.

class LabUnit(models.Model):
    name = models.CharField(max_length=255, unique=True) 

    def __str__(self):
        return self.name

class Test(models.Model):
    name = models.CharField(max_length=255)
    is_complex = models.BooleanField(default=False)
    si_unit = models.CharField(max_length=50, blank=True, null=True)
    lab_unit = models.ForeignKey(LabUnit, on_delete=models.CASCADE, related_name="tests")  # Tied to a lab unit
    price = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)  # Monetary value
    is_active = models.BooleanField(default=True)  
    remark = models.TextField(blank=True, null=True)
    requires_remark = models.BooleanField(default=False)
    requires_reference_range = models.BooleanField(default=True)


    def __str__(self):
        return self.name

class SubTest(models.Model):
    test = models.ForeignKey(Test, on_delete=models.CASCADE, related_name="sub_tests")
    parameter_name = models.CharField(max_length=255)
    price = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)  # Monetary value
    si_unit = models.CharField(max_length=50, blank=True, null=True)
    requires_reference_range = models.BooleanField(default=True)

    def __str__(self):
        return f'{self.test}|{self.parameter_name}'
    
class ReferenceRange(models.Model):
    test = models.ForeignKey(Test, on_delete=models.CASCADE, related_name="reference_ranges", null=True, blank=True)  
    sub_test = models.ForeignKey(SubTest, on_delete=models.CASCADE, related_name="reference_ranges", null=True, blank=True)  
    gender = models.CharField(max_length=10, choices=[("Male", "Male"), ("Female", "Female"), ("Any", "Any")])
    age_min = models.CharField(max_length=100,null=True, blank=True)  # Optional age range
    age_max = models.CharField(max_length=100,null=True, blank=True)  # Optional age range
    category = models.CharField(max_length=10, choices=[("Adult", "Adult"), 
                            ("Child", "Child"), ("Any", "Any")], null=True, blank=True)  # New category field
    range_value = models.CharField(max_length=255)  # Example: "5.0 - 10.0 mmol/L"

    def __str__(self):
        return f"{self.test or self.sub_test} | {self.gender} | {self.category or f'{self.age_min}-{self.age_max}'}: {self.range_value}"


TEST_REQUEST_STATUS = [
    ("pending", "Pending"),           # No payment, no results
    ("billed", "Billed"),             # Bill created but not paid
    ("partly_billed", "Partly Billed"), # Multiple bills, some paid (legacy)
    ("partly_paid", "Partly Paid"),   # NEW: Some items paid, some unpaid
    ("paid", "Paid"),                 # NEW: Payment completed
    ("in_progress", "In progress"),   # Payment done, results being entered
    ("completed", "Completed"),       # Results finalized
    ("canceled", "Canceled"),
]


class TestRequest(models.Model):
    encounter = models.ForeignKey(EncounterRoute, on_delete=models.SET_NULL, null=True, blank=True)
    patient = models.ForeignKey(Patient, on_delete=models.CASCADE, related_name="test_requests")
    tests = models.ManyToManyField(Test, related_name="requests")
    sub_tests = models.ManyToManyField(SubTest, related_name="requests", blank=True)
    status = models.CharField(max_length=20, choices=TEST_REQUEST_STATUS, default="pending")
    requested_by = models.ForeignKey(CustomUser, on_delete=models.CASCADE)
    request_date = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    notes = models.TextField(blank=True, null=True)

    class Meta:
        ordering = ["-request_date"]

    def __str__(self):
        return f"Test Request for {self.patient} - {self.status}"

    def update_status_from_details(self):
        details = list(self.details.all())

        if not details:
            self.status = "pending"
            self.save(update_fields=["status"])
            return

        statuses = {d.status for d in details}

        if statuses == {"completed"}:
            self.status = "completed"
        elif statuses == {"billed"}:
            self.status = "billed"
        elif "billed" in statuses and "pending" in statuses:
            self.status = "partly_billed"
        elif "in_progress" in statuses:
            self.status = "in_progress"
        elif statuses == {"pending"}:
            self.status = "pending"
        else:
            # fallback for mixed states
            self.status = "in_progress"

        self.save(update_fields=["status"])


# Update TestRequestDetail model - extend status field instead of new field
class TestRequestDetail(models.Model):
    test_request = models.ForeignKey(TestRequest, on_delete=models.CASCADE, related_name="details")
    test = models.ForeignKey(Test, on_delete=models.CASCADE, related_name="request_details")
    sub_tests = models.ManyToManyField(SubTest, blank=True, related_name="request_details")
    status = models.CharField(max_length=20, choices=TEST_REQUEST_STATUS, default="pending")
    
    # NEW: Comment field for MLS (tied to each detail/result)
    mls_comment = models.TextField(blank=True, null=True, help_text="Comments from MLS about this test result")

    class Meta:
        ordering = ["id"]

    def __str__(self):
        return f"{self.test_request.patient} - {self.test} ({self.status})"

    def evaluate_status(self):
        """
        Determines detail status based on results entry:
        - pending → no payment, no data
        - paid → payment completed, ready for results
        - in_progress → some results exist
        - completed → all required (sub)test results exist
        """
        # First check if payment is required (based on bill)
        if self.status in ["pending", "billed"]:
            # Status will be updated by bill sync
            return
        
        lab_result = getattr(self, "lab_result", None)
        
        if not lab_result:
            if self.status == "paid":
                # Ready for results but none yet
                self.status = "in_progress"
                self.save(update_fields=["status"])
            return

        if self.sub_tests.exists():
            sub_ids = set(self.sub_tests.values_list("id", flat=True))
            result_ids = set(lab_result.sub_test_results.values_list("sub_test_id", flat=True))
            self.status = "completed" if sub_ids <= result_ids else "in_progress"
        else:
            self.status = "completed" if lab_result.result_value else "in_progress"

        self.save(update_fields=["status"])
    
    def can_enter_results(self):
        """Check if results can be entered for this detail"""
        # Results can be entered if status is 'paid' or 'in_progress'
        # 'paid' means payment done, ready for results
        # 'in_progress' means already started entering results
        return self.status in ["paid", "in_progress"]
    
    def is_payment_complete(self):
        """Check if payment is completed for this detail"""
        return self.status in ["paid", "in_progress", "completed"]


class LabResult(models.Model):
    test_request = models.ForeignKey(TestRequest, on_delete=models.CASCADE, related_name="lab_results")
    detail = models.OneToOneField(TestRequestDetail, on_delete=models.CASCADE, related_name="lab_result")
    test = models.ForeignKey(Test, on_delete=models.CASCADE)

    result_value = models.CharField(max_length=255, blank=True, null=True)
    remark = models.TextField(blank=True, null=True)

    is_critical = models.BooleanField(default=False)
    needs_retest = models.BooleanField(default=False)

    reference_range = models.CharField(max_length=255, blank=True, null=True)

    validated_by = models.ForeignKey(CustomUser, on_delete=models.SET_NULL, null=True, blank=True
    )
    validated_at = models.DateTimeField(auto_now_add=True)
    last_updated = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Result for {self.detail}"


class SubTestResult(models.Model):
    lab_result = models.ForeignKey(LabResult, on_delete=models.CASCADE, related_name="sub_test_results")
    sub_test = models.ForeignKey(SubTest, on_delete=models.CASCADE)

    result_value = models.CharField(max_length=255, blank=True, null=True)

    is_critical = models.BooleanField(default=False)
    needs_retest = models.BooleanField(default=False)
    reference_range = models.CharField(max_length=255, blank=True, null=True)

    class Meta:
        unique_together = ("lab_result", "sub_test")  # ⛔ Prevent duplicates

    def __str__(self):
        return f"{self.sub_test.parameter_name} result"
   

class TestPanel(models.Model):
    name = models.CharField(max_length=255, unique=True)
    description = models.TextField(blank=True, null=True)
    tests = models.ManyToManyField("Test")  # Linking tests to each panel
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)

    def __str__(self):
        return self.name
