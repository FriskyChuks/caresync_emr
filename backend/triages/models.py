from django.db import models

from patients.models import Patient  
from accounts.models import CustomUser 
from encounters.models import EncounterRoute


class Triage(models.Model):
    encounter = models.ForeignKey(EncounterRoute, on_delete=models.SET_NULL, null=True, blank=True)
    pid = models.ForeignKey(Patient, on_delete=models.CASCADE)
    temp = models.FloatField(verbose_name="Temperature (°C)", blank=True, null=True)
    weight = models.FloatField(verbose_name="Weight (kg)", blank=True, null=True)
    height = models.FloatField(verbose_name="Height (cm)", blank=True, null=True)
    bp = models.CharField(max_length=7, verbose_name="Blood Pressure", blank=True, null=True)
    spo2 = models.FloatField(verbose_name="SpO2 (%)", blank=True, null=True)
    pulse = models.FloatField(verbose_name="Pulse (bpm)", blank=True, null=True)
    date_recorded = models.DateTimeField(auto_now_add=True)
    created_by = models.ForeignKey(CustomUser, on_delete=models.CASCADE)

    def __str__(self):
        return f"Triage for {self.pid} on {self.date_recorded.strftime('%Y-%m-%d %H:%M')}"
    

class FluidBalance(models.Model):
    INTAKE_TYPES = [
        ('oral', 'Oral'),
        ('iv', 'IV Fluids'),
        ('ng', 'NG Tube'),
        ('other', 'Other'),
    ]
    
    OUTPUT_TYPES = [
        ('urine', 'Urine'),
        ('vomit', 'Vomit'),
        ('drain', 'Drain'),
        ('stool', 'Stool'),
        ('other', 'Other'),
    ]
    
    patient = models.ForeignKey(Patient, on_delete=models.CASCADE, related_name='fluid_balance_records')
    encounter = models.ForeignKey(EncounterRoute, on_delete=models.SET_NULL, null=True, blank=True)
    
    # Intake Fields
    intake_type = models.CharField(max_length=20, choices=INTAKE_TYPES, null=True, blank=True)
    intake_volume = models.PositiveIntegerField(help_text="Volume in ml", null=True, blank=True)
    intake_description = models.CharField(max_length=255, blank=True, null=True)
    
    # Output Fields
    output_type = models.CharField(max_length=20, choices=OUTPUT_TYPES, null=True, blank=True)
    output_volume = models.PositiveIntegerField(help_text="Volume in ml", null=True, blank=True)
    output_description = models.CharField(max_length=255, blank=True, null=True)
    
    # Balance Calculation
    net_balance = models.IntegerField(help_text="Intake - Output", default=0)
    
    # Metadata
    recorded_at = models.DateTimeField(auto_now_add=True)
    recorded_by = models.ForeignKey(CustomUser, on_delete=models.SET_NULL, null=True)
    notes = models.TextField(blank=True, null=True)
    
    class Meta:
        ordering = ['-recorded_at']
        verbose_name = "Fluid Balance Record"
        verbose_name_plural = "Fluid Balance Records"
    
    def save(self, *args, **kwargs):
        # Calculate net balance
        intake = self.intake_volume or 0
        output = self.output_volume or 0
        self.net_balance = intake - output
        super().save(*args, **kwargs)
    
    def __str__(self):
        return f"Fluid Balance for {self.patient} at {self.recorded_at}"



