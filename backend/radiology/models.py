from django.db import models
from accounts.models import *

class Unit(models.Model):
    title = models.CharField(max_length=30)
    
    def __str__(self):
        return self.title
    
    
class RadiologyTest(models.Model):
    title = models.CharField(max_length=30)
    description = models.TextField(blank=True, null=True)
    cost = models.DecimalField(max_digits=10, decimal_places=2)

    def __str__(self):
        return self.title
    
class RadiologyRequest(models.Model):
    patient = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name="patient_radiology")
    test = models.ForeignKey(RadiologyTest, on_delete=models.CASCADE)
    clinical_notes = models.TextField(blank=True, null=True)
    requested_by = models.ForeignKey(CustomUser, on_delete=models.CASCADE)
    date_created = models.DateTimeField(auto_now_add=True)
    status = models.CharField(
        max_length=20,
        choices=[
            ('pending', 'Pending'),
            ('in_progress', 'In Progress'),
            ('completed', 'Completed'),
            ('cancelled', 'Cancelled')
        ],
        default='pending'
    )
    def __str__(self):
        return self.patient
        
    
class RadiologyResult(models.Model):
    request = models.ForeignKey(RadiologyRequest, on_delete=models.CASCADE)
    test = models.ForeignKey(RadiologyTest, on_delete=models.CASCADE)
    report = models.TextField
    diagnosis = models.CharField(max_length=50)
    conclusion = models.TextField
    reported_by = models.ForeignKey(CustomUser, on_delete=models.CASCADE)
    date_created = models.DateTimeField(auto_now_add=True)
        
    def __str__(self):
        return self.request

     
    
    
    

