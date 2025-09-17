from django.db import models

from patients.models import Patient  
from accounts.models import CustomUser 


class Triage(models.Model):
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



