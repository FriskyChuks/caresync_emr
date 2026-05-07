from django.db import models
from accounts.models import CustomUser, MaritalStatus, Religion

class Patient(models.Model):
    photo = models.ImageField(upload_to='images/patients/', blank=True, null=True)
    STATUS_CHOICES = [('adult', 'Adult'), ('neonate', 'Neonate'), ('child', 'Child'),]
    user = models.OneToOneField( CustomUser, on_delete=models.CASCADE, related_name='patient_profile')
    old_pid = models.CharField(max_length=10, unique=True, blank=True, null=True)
    marital_status = models.ForeignKey(MaritalStatus, on_delete=models.SET_NULL, null=True, blank=True)
    religion = models.ForeignKey(Religion, on_delete=models.SET_NULL, null=True, blank=True)
    date_of_birth = models.DateField(blank=True, null=True)
    age = models.IntegerField(blank=True, null=True)
    phone = models.CharField(max_length=11, blank=True, null=True)
    occupation = models.CharField(max_length=200, blank=True, null=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='adult')
    is_emergency = models.BooleanField(default=False)
    created_by = models.ForeignKey( CustomUser, on_delete=models.SET_NULL, null=True,blank=True)
    date_created = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user} {self.date_of_birth}"
    
    @property
    def full_name(self):
        """Return the patient's full name from the associated user"""
        if self.user:
            if self.user.other_name:
                return f"{self.user.first_name} {self.user.other_name} {self.user.last_name}"
            return f"{self.user.first_name} {self.user.last_name}"
        return "Unknown Patient"
    
    @property
    def hospital_number(self):
        """Return the patient's hospital number (using ID)"""
        return str(self.id)
    

