from django.db import models
from django.contrib.auth.models import User
from accounts.models import  CustomUser
from patients.models import Patient
from encounters.models import *
from triages.models import *

# NoteType Model
class NoteType(models.Model):
    title = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True)

    def __str__(self):
        return self.title 


class Clerking(models.Model):
    patient = models.ForeignKey(Patient, on_delete=models.CASCADE,)
    note_type = models.ForeignKey(NoteType, on_delete=models.CASCADE)
    subtitle = models.CharField(max_length=255)
    note = models.TextField()
    created_by = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='clerking_created_by_set')
    date_created = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Clerking note for {self.patient}"