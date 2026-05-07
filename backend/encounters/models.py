from django.db import models
from django.utils import timezone
from datetime import timedelta

from accounts.models import *
from patients.models import *
from locations.models import *


class Visit(models.Model):
    patient = models.ForeignKey(Patient, on_delete=models.SET_NULL, null=True, related_name="visits")
    send_by = models.ForeignKey(CustomUser, on_delete=models.SET_NULL, null=True, 
                                                blank=True, related_name="sent_visits")
    date_created = models.DateTimeField(auto_now_add=True)
    visit_status = models.BooleanField(default=True)  # active/inactive
    is_inpatient = models.BooleanField(default=False)
    visit_number = models.PositiveIntegerField(default=1)

    def auto_reset_visit_number(self):
        """Reset visit number after 7 days for outpatients"""
        from django.utils import timezone
        from datetime import timedelta
        if not self.is_inpatient and timezone.now() - self.date_created >= timedelta(days=7):
            self.visit_number, self.visit_status = 1, False
            self.save()

    def __str__(self): return f"Visit {self.visit_number} - {self.patient}"


class EncounterRoute(models.Model):
    visit = models.ForeignKey(Visit, on_delete=models.CASCADE, related_name="routes")
    transferred_by = models.ForeignKey(CustomUser, on_delete=models.CASCADE,related_name="transfers")
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


class TransferRequest(models.Model):
    STATUS_CHOICES = [
        ("pending", "Pending"),
        ("accepted", "Accepted"),
        ("rejected", "Rejected"),
        ("discharged", "Discharged")
    ]

    visit = models.ForeignKey(Visit, on_delete=models.CASCADE, related_name="transfer_requests")
    from_clinic = models.ForeignKey(Clinic, null=True, blank=True, on_delete=models.SET_NULL)
    from_ward = models.ForeignKey(Ward, null=True, blank=True, on_delete=models.SET_NULL)
    to_ward = models.ForeignKey(Ward, on_delete=models.CASCADE, related_name="incoming_transfers")

    assigned_room = models.ForeignKey(Room, null=True, blank=True, on_delete=models.SET_NULL)
    assigned_bed_number = models.PositiveIntegerField(null=True, blank=True)  # store bed number as int

    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="pending")
    requested_by = models.ForeignKey(CustomUser, null=True, blank=True, on_delete=models.SET_NULL, related_name="requested_transfers")
    handled_by = models.ForeignKey(CustomUser, null=True, blank=True, on_delete=models.SET_NULL, related_name="handled_transfers")

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    accepted_at = models.DateTimeField(null=True, blank=True)
    rejected_at = models.DateTimeField(null=True, blank=True)
    rejection_reason = models.TextField(null=True, blank=True)

    def __str__(self):
        return f"TransferRequest for {self.visit.patient} to {self.to_ward} ({self.status})"

    def accept(self, user, room, bed_number):
        """Ward in-charge accepts transfer + allocates a bed number"""
        if self.status != "pending":
            raise ValueError("Only pending transfers can be accepted.")

        # Check bed availability
        current_assignments = self.to_ward.incoming_transfers.filter(
            status="accepted", assigned_room=room
        ).values_list("assigned_bed_number", flat=True)

        if bed_number not in room.available_beds(current_assignments=list(current_assignments)):
            raise ValueError(f"Bed {bed_number} is not available in {room.name}")

        # Assign room and bed number
        self.assigned_room = room
        self.assigned_bed_number = bed_number
        self.status = "accepted"
        self.handled_by = user
        self.accepted_at = timezone.now()
        self.save()

        EncounterRoute.objects.create(
            visit=self.visit,
            transferred_by=user,
            in_patient_transfer=self.to_ward
        )
        self.visit.is_inpatient = True
        self.visit.save()

    def reject(self, user, reason: str):
        """
        Ward in-charge rejects transfer with a reason.
        """
        if self.status != "pending":
            raise ValueError("Only pending transfers can be rejected.")
        if not reason:
            raise ValueError("Rejection reason is required.")

        self.status = "rejected"
        self.handled_by = user
        self.rejected_at = timezone.now()
        self.rejection_reason = reason
        self.save()


class DischargeReason(models.Model):
    name = models.CharField(max_length=100, unique=True)
    def __str__(self): return self.name


class Discharge(models.Model):
    visit = models.OneToOneField(Visit, on_delete=models.CASCADE, related_name="discharge")
    summary = models.TextField(null=True, blank=True)  # doctor fills
    summary_by = models.ForeignKey(CustomUser, on_delete=models.SET_NULL, null=True, 
                                   blank=True, related_name="discharge_summaries")
    reason = models.ForeignKey(DischargeReason, on_delete=models.SET_NULL, null=True, 
                               blank=True, related_name="discharges")  # nurse picks
    discharged_by = models.ForeignKey(CustomUser, on_delete=models.SET_NULL, null=True, 
                                      blank=True, related_name="final_discharges")
    discharged_at = models.DateTimeField(auto_now_add=True)

    def __str__(self): return f"Discharge for {self.visit}"