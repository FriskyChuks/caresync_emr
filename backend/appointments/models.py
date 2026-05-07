from django.db import models

from patients.models import Patient
from locations.models import Clinic
from accounts.models import CustomUser

APPOINTMENT_STATUS = (
    ('pending','Pending'),
    ('in_progress','In Progress'),
    ('kept','Kept'),
    ('cancelled','Cancelled'),
    ('overdue','Overdue'),
)

class Appointment(models.Model):
    patient = models.ForeignKey(Patient, on_delete=models.CASCADE)
    clinic = models.ForeignKey(Clinic, on_delete=models.CASCADE, related_name='appointment')
    appointment_date = models.DateField()
    appointment_time = models.TimeField()
    reason = models.TextField(default='Follow Up')
    created_by = models.ForeignKey(CustomUser, on_delete=models.CASCADE)
    status = models.CharField(choices=APPOINTMENT_STATUS, max_length=15, default='pending')
    date_created = models.DateTimeField(auto_now_add=True)
    last_updated = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.clinic}: {self.appointment_date}; {self.appointment_time}"

