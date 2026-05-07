from django.db import models
from accounts.models import CustomUser
from patients.models import Patient
from encounters.models import EncounterRoute

class NoteType(models.Model):
    title = models.CharField(max_length=225)
    date_created = models.DateTimeField(auto_now_add=True)
    created_by = models.ForeignKey(CustomUser, on_delete=models.CASCADE)

    def __str__(self):
        return self.title


class Note(models.Model):
    encounter_route = models.ForeignKey(EncounterRoute, on_delete=models.CASCADE, null=True, blank=True)
    patient = models.ForeignKey(Patient, on_delete=models.CASCADE, related_name='patient_note')
    note_type = models.ForeignKey(NoteType, on_delete=models.CASCADE)
    header = models.CharField(max_length=225)
    body = models.TextField()
    date_created = models.DateTimeField(auto_now_add=True)
    created_by = models.ForeignKey(CustomUser, on_delete=models.CASCADE)
    last_updated = models.DateTimeField(auto_now_add=False, auto_now=True)

    def __str__(self):
        return f"{self.note_type} - {self.header}"