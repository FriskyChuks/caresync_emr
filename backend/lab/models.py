from django.db import models
from accounts.models import *
# Create your models here.

from django.db import models
from django.contrib.auth.models import User
from accounts.models import *
from django.conf import settings
from patients.models import Patient

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


class TestRequest(models.Model):
    patient = models.ForeignKey(Patient, on_delete=models.CASCADE, related_name="test_requests")
    tests = models.ManyToManyField(Test, related_name="requests")
    sub_tests = models.ManyToManyField(SubTest, related_name="requests", blank=True)  # Explicit sub-test tracking
    status = models.CharField(max_length=20, choices=[("pending", "Pending"), ("in_progress", "In progress"), 
                 ("completed", "Completed"), ("canceled", "Canceled")],default="pending")
    requested_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)  # Optional
    request_date = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Test Request for {self.patient} - {self.status}"


class LabResult(models.Model):
    test_request     = models.ForeignKey(TestRequest, on_delete=models.CASCADE,related_name="lab_results")
    test             = models.ForeignKey(Test, on_delete=models.CASCADE,related_name="results")
    reference_range  = models.ForeignKey(ReferenceRange, on_delete=models.SET_NULL,null=True, blank=True,related_name="lab_results")
    result_value     = models.TextField()
    remark           = models.TextField(blank=True, null=True)
    validated_by     = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE,null=True,blank=True)
    result_date      = models.DateTimeField(auto_now_add=True)
    is_critical      = models.BooleanField(default=False)
    needs_retest     = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.test_request.patient} – {self.test}"


class SubTestResult(models.Model):
    lab_result       = models.ForeignKey(LabResult, on_delete=models.CASCADE,related_name="sub_test_results")
    sub_test         = models.ForeignKey(SubTest, on_delete=models.CASCADE,related_name="results")
    reference_range  = models.ForeignKey(ReferenceRange,on_delete=models.SET_NULL,null=True, blank=True,related_name="sub_test_results")
    result_value     = models.CharField(max_length=255)
    is_critical      = models.BooleanField(default=False)
    needs_retest     = models.BooleanField(default=False)

    def __str__(self):
        return str(self.sub_test)
    

class TestPanel(models.Model):
    name = models.CharField(max_length=255, unique=True)
    description = models.TextField(blank=True, null=True)
    tests = models.ManyToManyField("Test")  # Linking tests to each panel
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)

    def __str__(self):
        return self.name
