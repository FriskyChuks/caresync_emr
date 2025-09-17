from django.db import models
from accounts.models import CustomUser

class Clinic(models.Model):
    name = models.CharField(max_length=100)
    female_only = models.BooleanField(default=False)
    created_by = models.ForeignKey(CustomUser, on_delete=models.SET_NULL, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['name']

    def __str__(self):
        if self.female_only:
            return f"{self.name} (Female Only)"
        return self.name

class Ward(models.Model):
    name = models.CharField(max_length=100)
    clinic = models.ForeignKey(Clinic, on_delete=models.CASCADE, related_name='wards', null=True, blank=True)
    female_only = models.BooleanField(default=False)
    created_by = models.ForeignKey(CustomUser, on_delete=models.SET_NULL, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['name']

    def __str__(self):
        if self.female_only and self.clinic:
            return f"{self.name}  - {self.clinic.name} (Female Only)"
        elif self.female_only:
            return f"{self.name} (Female Only)"
        elif self.clinic:
            return f"{self.name} - {self.clinic.name}"
        return self.name