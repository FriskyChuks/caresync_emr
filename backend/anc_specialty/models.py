from django.db import models
from patients.models import *
from accounts.models import *
from django.core.exceptions import ValidationError


class ObstetricHistory(models.Model):
    patient = models.ForeignKey(Patient, on_delete=models.CASCADE, related_name="obstetric_history")
    gravida = models.PositiveIntegerField(help_text="Total number of pregnancies")
    para = models.PositiveIntegerField(help_text="Number of births ≥ 24 weeks")
    abortions = models.PositiveIntegerField(default=0)
    living_children = models.PositiveIntegerField(default=0)
    previous_c_section = models.BooleanField(default=False)
    previous_stillbirth = models.BooleanField(default=False)
    previous_neonatal_death = models.BooleanField(default=False)
    pregnancy_complications = models.TextField(blank=True, null=True)
    inter_pregnancy_interval = models.CharField(max_length=100, blank=True, null=True)
     # ✅ ONLY ADD THIS (DO NOT REMOVE ANYTHING)
    is_active = models.BooleanField(default=True)

    date_created = models.DateTimeField(auto_now_add=True)

    def clean(self):
        if self.is_active:
            existing = ObstetricHistory.objects.filter(
                patient=self.patient,
                is_active=True
            ).exclude(pk=self.pk)

            if existing.exists():
                raise ValidationError("Patient already has an active pregnancy.")

    def save(self, *args, **kwargs):
        self.clean()
        super().save(*args, **kwargs)

    def __str__(self):
        return f"Obstetric History - {self.patient}"
   

class MenstrualGynecologicalHistory(models.Model):
    patient = models.ForeignKey(Patient, on_delete=models.CASCADE, related_name="menstrual_history")
    last_menstrual_period = models.DateField()
    estimated_due_date = models.DateField()
    cycle_regular = models.BooleanField(default=True)
    cycle_length = models.PositiveIntegerField(help_text="Cycle length in days", blank=True, null=True)
    contraceptive_history = models.TextField(blank=True, null=True)
    gynecological_conditions = models.TextField(blank=True, null=True)
    date_created = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Menstrual History - {self.patient}"

 
class MedicalFamilyHistory(models.Model):
    patient = models.ForeignKey(Patient, on_delete=models.CASCADE, related_name="medical_history")
    hypertension = models.BooleanField(default=False)
    diabetes = models.BooleanField(default=False)
    asthma = models.BooleanField(default=False)
    heart_disease = models.BooleanField(default=False)
    allergies = models.TextField(blank=True, null=True)
    family_genetic_disorders = models.TextField(blank=True, null=True)
    other_medical_conditions = models.TextField(blank=True, null=True)
    date_created = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Medical History - {self.patient}"


class CurrentPregnancy(models.Model):
    patient = models.ForeignKey(Patient, on_delete=models.CASCADE, related_name="current_pregnancy")
    gestational_age_weeks = models.PositiveIntegerField()
    number_of_fetuses = models.PositiveIntegerField(default=1)
    presenting_complaints = models.TextField(blank=True, null=True)
    medications = models.TextField(blank=True, null=True)
    supplements = models.TextField(blank=True, null=True)
    smoking = models.BooleanField(default=False)
    alcohol = models.BooleanField(default=False)
    date_created = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Current Pregnancy - {self.patient}"


class AntenatalVitals(models.Model):
    patient = models.ForeignKey(Patient, on_delete=models.CASCADE, related_name="antenatal_vitals")
    blood_pressure = models.CharField(max_length=20)
    pulse = models.PositiveIntegerField()
    temperature = models.DecimalField(max_digits=4, decimal_places=1)
    weight = models.DecimalField(max_digits=5, decimal_places=2)
    bmi = models.DecimalField(max_digits=5, decimal_places=2, blank=True, null=True)
    fundal_height = models.DecimalField(max_digits=5, decimal_places=2, help_text="in cm", blank=True, null=True)
    fetal_heart_rate = models.PositiveIntegerField(blank=True, null=True)
    edema = models.BooleanField(default=False)
    date_created = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Antenatal Vitals - {self.patient}"
    


# ####################################################################################
##############ANC Visit Model

class ANCReVisit(models.Model):
    booking = models.ForeignKey(ObstetricHistory,on_delete=models.CASCADE,related_name="anc_visits")
    visit_date = models.DateField()
    gestational_age = models.PositiveIntegerField(help_text="Gestational age in weeks")
    weight = models.DecimalField(max_digits=5, decimal_places=2)
    blood_pressure = models.CharField(max_length=20)
    fetal_heart_rate = models.PositiveIntegerField(blank=True, null=True)
    fundal_height = models.DecimalField(max_digits=5,decimal_places=2,blank=True,null=True)
    complaints = models.TextField(blank=True, null=True)
    clinical_notes = models.TextField(blank=True, null=True)
    next_visit_date = models.DateField(blank=True, null=True)
    date_created = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"ANC Visit - {self.booking.patient}"
    


    ###########ultrasound records
    
class UltrasoundRecord(models.Model):
    booking = models.ForeignKey(ObstetricHistory,on_delete=models.CASCADE,related_name="ultrasounds")
    scan_date = models.DateField()
    gestational_age = models.PositiveIntegerField()
    fetal_heartbeat = models.BooleanField(default=True)
    number_of_fetuses = models.PositiveIntegerField(default=1)
    placenta_position = models.CharField(max_length=100,blank=True,null=True)
    amniotic_fluid = models.CharField(max_length=100,blank=True,null=True)
    fetal_weight_estimate = models.DecimalField(max_digits=6,decimal_places=2,blank=True,null=True)
    findings = models.TextField(blank=True, null=True)
    scan_image = models.FileField(upload_to="ultrasound_scans/",blank=True,null=True)
    date_created = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Ultrasound - {self.booking.patient}"

#########################delivery recotrds models##############################
    


class DeliveryRecord(models.Model):
    booking = models.OneToOneField(ObstetricHistory, on_delete=models.CASCADE, related_name="delivery")
    delivery_date = models.DateField()
    delivery_mode = models.CharField(max_length=50, choices=[
        ("vaginal", "Vaginal Delivery"),
        ("c_section", "Caesarean Section"),
        ("assisted", "Assisted Delivery"),
    ])
    place_of_delivery = models.CharField(max_length=100, blank=True, null=True)
    complications = models.TextField(blank=True, null=True)
    mother_condition = models.CharField(max_length=100, blank=True, null=True)
    baby_condition = models.CharField(max_length=100, blank=True, null=True)
    
    # Legacy single-baby fields — kept for backwards compatibility
    # New records use BabyDetail instead
    baby_sex = models.CharField(
        max_length=10,
        choices=[("male", "Male"), ("female", "Female")],
        blank=True, null=True   # ← must be nullable
    )
    birth_weight = models.DecimalField(max_digits=5, decimal_places=2, blank=True, null=True)
    apgar_score_1min = models.PositiveIntegerField(blank=True, null=True)
    apgar_score_5min = models.PositiveIntegerField(blank=True, null=True)
    date_created = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Delivery Record - {self.booking.patient}"
        
    

class BabyDetail(models.Model):
    delivery = models.ForeignKey(DeliveryRecord, on_delete=models.CASCADE, related_name="babies")

    baby_number = models.PositiveIntegerField()

    baby_sex = models.CharField(max_length=10, choices=[
        ("male", "Male"),
        ("female", "Female")],
        blank=True, null=True 
    )

    birth_weight = models.DecimalField(max_digits=5, decimal_places=2, blank=True, null=True)
    apgar_score_1min = models.PositiveIntegerField(blank=True, null=True)
    apgar_score_5min = models.PositiveIntegerField(blank=True, null=True)

    baby_condition = models.CharField(max_length=100, blank=True, null=True)

    def __str__(self):
        return f"Baby {self.baby_number} - {self.delivery.booking.patient}"