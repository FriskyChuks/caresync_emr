from django.db import models
from django.utils import timezone
from datetime import timedelta

from accounts.models import *
from patients.models import *
from locations.models import Clinic, Ward

class Visit(models.Model):
    send_by = models.ForeignKey(
        CustomUser, on_delete=models.SET_NULL,
        null=True, blank=True, related_name="sent_visits"
    )
    date_created = models.DateTimeField(auto_now_add=True)
    patient = models.ForeignKey(
        Patient, on_delete=models.SET_NULL,
        null=True, blank=True, related_name="visits"
    )
    visit_status = models.BooleanField(default=True)  # active/inactive
    is_inpatient = models.BooleanField(default=False)
    visit_number = models.PositiveIntegerField(default=1)

    def auto_reset_visit_number(self):
        """Reset visit number after 7 days for outpatients"""
        if not self.is_inpatient and timezone.now() - self.date_created >= timedelta(days=7):
            self.visit_number = 1
            self.save()

    def __str__(self):
        return f"Visit {self.visit_number} - {self.patient}"


class EncounterRoute(models.Model):
    visit = models.ForeignKey(
        Visit, on_delete=models.CASCADE,
        related_name="routes"
    )
    transferred_by = models.ForeignKey(
        CustomUser, on_delete=models.CASCADE,
        related_name="transfers"
    )
    date_created = models.DateTimeField(auto_now_add=True)

    # Either clinic (outpatient) or ward (inpatient)
    in_patient_transfer = models.ForeignKey(Ward, on_delete=models.CASCADE, null=True, blank=True)
    out_patient_transfer = models.ForeignKey(Clinic, on_delete=models.CASCADE, null=True, blank=True)

    def __str__(self):
        if self.in_patient_transfer:
            return f"{self.visit.patient} → Ward: {self.in_patient_transfer}"
        elif self.out_patient_transfer:
            return f"{self.visit.patient} → Clinic: {self.out_patient_transfer}"
        return f"Route for {self.visit.patient} (unspecified transfer)"

