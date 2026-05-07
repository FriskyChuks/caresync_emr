from django.db import models
from patients.models import Patient  # adjust import to match your project


class ENTClerking(models.Model):
    """Top-level ENT clerking record — one per patient visit."""
    patient = models.ForeignKey(Patient, on_delete=models.CASCADE, related_name="ent_clerkings")
    presenting_complaint = models.TextField(blank=True, null=True)
    history_of_presenting_complaint = models.TextField(blank=True, null=True)
    diagnosis = models.TextField(blank=True, null=True)
    treatment_plan = models.TextField(blank=True, null=True)
    date_created = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-date_created']

    def __str__(self):
        return f"ENT Clerking - {self.patient}"


# ──────────────────────────────────────────
# History sections
# ──────────────────────────────────────────

class OtologicHistory(models.Model):
    clerking = models.OneToOneField(ENTClerking, on_delete=models.CASCADE, related_name="otologic_history")
    # null=True means "doctor never answered this"; False means "doctor said No"
    otalgia      = models.BooleanField(null=True, blank=True, default=None, help_text="Ear pain")
    otorrhoea    = models.BooleanField(null=True, blank=True, default=None, help_text="Ear discharge")
    tinnitus     = models.BooleanField(null=True, blank=True, default=None, help_text="Ringing in the ear")
    vertigo      = models.BooleanField(null=True, blank=True, default=None, help_text="Dizziness/spinning sensation")
    hearing_loss = models.BooleanField(null=True, blank=True, default=None)
    others       = models.TextField(blank=True, null=True)

    def __str__(self):
        return f"Otologic History - {self.clerking.patient}"


class RhinologicHistory(models.Model):
    clerking = models.OneToOneField(ENTClerking, on_delete=models.CASCADE, related_name="rhinologic_history")
    nasal_obstruction  = models.BooleanField(null=True, blank=True, default=None)
    rhinorrhea         = models.BooleanField(null=True, blank=True, default=None, help_text="Runny nose")
    excessive_sneezing = models.BooleanField(null=True, blank=True, default=None)
    facial_pain        = models.BooleanField(null=True, blank=True, default=None)
    anosmia            = models.BooleanField(null=True, blank=True, default=None, help_text="Complete loss of smell")
    hyposmia           = models.BooleanField(null=True, blank=True, default=None, help_text="Reduced sense of smell")
    nose_bleeding      = models.BooleanField(null=True, blank=True, default=None)
    nasal_growth       = models.BooleanField(null=True, blank=True, default=None)
    others             = models.TextField(blank=True, null=True)

    def __str__(self):
        return f"Rhinologic History - {self.clerking.patient}"


class LaryngologyHistory(models.Model):
    clerking = models.OneToOneField(ENTClerking, on_delete=models.CASCADE, related_name="laryngology_history")
    throat_pain              = models.BooleanField(null=True, blank=True, default=None)
    dysphagia                = models.BooleanField(null=True, blank=True, default=None, help_text="Difficulty swallowing")
    odynophagia              = models.BooleanField(null=True, blank=True, default=None, help_text="Painful swallowing")
    hoarseness               = models.BooleanField(null=True, blank=True, default=None)
    other_voice_changes      = models.TextField(blank=True, null=True)
    halitosis                = models.BooleanField(null=True, blank=True, default=None, help_text="Bad breath")
    lump_in_throat           = models.BooleanField(null=True, blank=True, default=None)
    excessive_throat_hawking = models.BooleanField(null=True, blank=True, default=None)
    breathing_difficulty     = models.BooleanField(null=True, blank=True, default=None)
    snoring                  = models.BooleanField(null=True, blank=True, default=None)
    loss_of_taste            = models.BooleanField(null=True, blank=True, default=None)
    others                   = models.TextField(blank=True, null=True)

    def __str__(self):
        return f"Laryngology History - {self.clerking.patient}"


class HeadAndNeckHistory(models.Model):
    clerking = models.OneToOneField(ENTClerking, on_delete=models.CASCADE, related_name="head_neck_history")
    neck_swelling    = models.BooleanField(null=True, blank=True, default=None)
    jaw_swelling     = models.BooleanField(null=True, blank=True, default=None)
    facial_deformity = models.BooleanField(null=True, blank=True, default=None)
    others           = models.TextField(blank=True, null=True)

    def __str__(self):
        return f"Head & Neck History - {self.clerking.patient}"


class PastMedicalSocialHistory(models.Model):
    clerking = models.OneToOneField(ENTClerking, on_delete=models.CASCADE, related_name="past_medical_history")
    previous_ent_surgery   = models.TextField(blank=True, null=True)
    previous_other_surgery = models.TextField(blank=True, null=True)
    previous_trauma        = models.TextField(blank=True, null=True)
    history_of_pud         = models.BooleanField(null=True, blank=True, default=None, help_text="Peptic Ulcer Disease")
    hypertension           = models.BooleanField(null=True, blank=True, default=None)
    diabetes               = models.BooleanField(null=True, blank=True, default=None)
    allergy                = models.BooleanField(null=True, blank=True, default=None)
    autoimmune_disease     = models.TextField(blank=True, null=True)
    migraine_headache      = models.BooleanField(null=True, blank=True, default=None)
    others                 = models.TextField(blank=True, null=True)

    def __str__(self):
        return f"Past Medical History - {self.clerking.patient}"


class DrugHistory(models.Model):
    clerking           = models.OneToOneField(ENTClerking, on_delete=models.CASCADE, related_name="drug_history")
    on_medications     = models.BooleanField(null=True, blank=True, default=None)
    medications_detail = models.TextField(blank=True, null=True)
    drug_allergy       = models.BooleanField(null=True, blank=True, default=None)

    def __str__(self):
        return f"Drug History - {self.clerking.patient}"


# ──────────────────────────────────────────
# Examination sections
# ──────────────────────────────────────────

class GeneralExamination(models.Model):
    clerking = models.OneToOneField(ENTClerking, on_delete=models.CASCADE, related_name="general_examination")
    # General appearance — all optional; doctor ticks whichever apply
    acutely_ill_looking     = models.BooleanField(null=True, blank=True, default=None)
    chronically_ill_looking = models.BooleanField(null=True, blank=True, default=None)
    pallor                  = models.BooleanField(null=True, blank=True, default=None)
    cyanosis                = models.BooleanField(null=True, blank=True, default=None)
    dehydrated              = models.BooleanField(null=True, blank=True, default=None)
    lymph_node              = models.BooleanField(null=True, blank=True, default=None)
    jaundice                = models.BooleanField(null=True, blank=True, default=None)
    weight_loss             = models.BooleanField(null=True, blank=True, default=None)
    normal                  = models.BooleanField(null=True, blank=True, default=None)
    # Respiratory
    dyspnoeic                       = models.BooleanField(null=True, blank=True, default=None)
    tachypnoea                      = models.BooleanField(null=True, blank=True, default=None)
    intercostal_subcostal_recession = models.BooleanField(null=True, blank=True, default=None)

    def __str__(self):
        return f"General Examination - {self.clerking.patient}"


class EarExamination(models.Model):
    clerking = models.OneToOneField(ENTClerking, on_delete=models.CASCADE, related_name="ear_examination")
    pinna_deformity         = models.BooleanField(null=True, blank=True, default=None)
    tragal_pinna_tenderness = models.BooleanField(null=True, blank=True, default=None)
    otorrhoea               = models.BooleanField(null=True, blank=True, default=None)
    eac_findings_left       = models.TextField(blank=True, null=True, help_text="External Auditory Canal - Left")
    eac_findings_right      = models.TextField(blank=True, null=True, help_text="External Auditory Canal - Right")
    tm_findings_left        = models.TextField(blank=True, null=True, help_text="Tympanic Membrane - Left")
    tm_findings_right       = models.TextField(blank=True, null=True, help_text="Tympanic Membrane - Right")
    rinne_test_left         = models.CharField(max_length=100, blank=True, null=True)
    rinne_test_right        = models.CharField(max_length=100, blank=True, null=True)
    weber_test              = models.CharField(max_length=100, blank=True, null=True)
    other_tuning_fork_findings    = models.TextField(blank=True, null=True)
    left_facial_nerve_paralysis   = models.BooleanField(null=True, blank=True, default=None)
    right_facial_nerve_paralysis  = models.BooleanField(null=True, blank=True, default=None)

    def __str__(self):
        return f"Ear Examination - {self.clerking.patient}"


class NasalExamination(models.Model):
    clerking = models.OneToOneField(ENTClerking, on_delete=models.CASCADE, related_name="nasal_examination")
    # These had default=True — keep that semantic but make them nullable so
    # an unvisited clerking (null) is distinct from an examined normal (True)
    nasal_pyramid_normal   = models.BooleanField(null=True, blank=True, default=None)
    nasal_pyramid_deformed = models.BooleanField(null=True, blank=True, default=None)
    patent_nasal_cavity    = models.BooleanField(null=True, blank=True, default=None)
    olfactory_intact       = models.BooleanField(null=True, blank=True, default=None)
    septum_central         = models.BooleanField(null=True, blank=True, default=None)
    septum_deviated        = models.BooleanField(null=True, blank=True, default=None)
    # Bilateral findings
    engorged_inferior_turbinate_left  = models.BooleanField(null=True, blank=True, default=None)
    engorged_inferior_turbinate_right = models.BooleanField(null=True, blank=True, default=None)
    otorrhoea_left    = models.BooleanField(null=True, blank=True, default=None)
    otorrhoea_right   = models.BooleanField(null=True, blank=True, default=None)
    nose_bleeding_left  = models.BooleanField(null=True, blank=True, default=None)
    nose_bleeding_right = models.BooleanField(null=True, blank=True, default=None)
    nasal_polyps_left   = models.BooleanField(null=True, blank=True, default=None)
    nasal_polyps_right  = models.BooleanField(null=True, blank=True, default=None)
    nasal_mass_left     = models.BooleanField(null=True, blank=True, default=None)
    nasal_mass_right    = models.BooleanField(null=True, blank=True, default=None)
    other_findings      = models.TextField(blank=True, null=True)

    def __str__(self):
        return f"Nasal Examination - {self.clerking.patient}"


class OralCavityOropharynxExamination(models.Model):
    clerking = models.OneToOneField(ENTClerking, on_delete=models.CASCADE, related_name="oral_examination")
    good_oral_hygiene                  = models.BooleanField(null=True, blank=True, default=None)
    halitosis                          = models.BooleanField(null=True, blank=True, default=None)
    free_labial_buccal_sulci           = models.BooleanField(null=True, blank=True, default=None)
    free_retromolar_trigone            = models.BooleanField(null=True, blank=True, default=None)
    tonsil_normal                      = models.BooleanField(null=True, blank=True, default=None)
    hyperaemia                         = models.BooleanField(null=True, blank=True, default=None)
    exudates                           = models.BooleanField(null=True, blank=True, default=None)
    grade                              = models.CharField(max_length=50, blank=True, null=True)
    granular_posterior_pharyngeal_wall = models.BooleanField(null=True, blank=True, default=None)

    def __str__(self):
        return f"Oral Cavity Examination - {self.clerking.patient}"


class NeckExamination(models.Model):
    clerking = models.OneToOneField(ENTClerking, on_delete=models.CASCADE, related_name="neck_examination")
    cervical_lymph_nodes_level     = models.CharField(max_length=100, blank=True, null=True)
    lymph_nodes_description        = models.TextField(blank=True, null=True)
    laryngeal_framework_preserved  = models.BooleanField(null=True, blank=True, default=None)
    anterior_neck_mass             = models.BooleanField(null=True, blank=True, default=None)
    anterior_neck_mass_description = models.TextField(blank=True, null=True)
    lateral_neck_mass              = models.BooleanField(null=True, blank=True, default=None)
    lateral_neck_mass_description  = models.TextField(blank=True, null=True)

    def __str__(self):
        return f"Neck Examination - {self.clerking.patient}"



# from django.db import models
# from patients.models import Patient  # adjust import to match your project


# class ENTClerking(models.Model):
#     """Top-level ENT clerking record — one per patient visit."""
#     patient = models.ForeignKey(Patient, on_delete=models.CASCADE, related_name="ent_clerkings")
#     presenting_complaint = models.TextField(blank=True, null=True)
#     history_of_presenting_complaint = models.TextField(blank=True, null=True)
#     diagnosis = models.TextField(blank=True, null=True)
#     treatment_plan = models.TextField(blank=True, null=True)
#     date_created = models.DateTimeField(auto_now_add=True)

#     class Meta:
#         ordering = ['-date_created']
#     def __str__(self):
#         return f"ENT Clerking - {self.patient}"


# # ──────────────────────────────────────────
# # History sections
# # ──────────────────────────────────────────

# class OtologicHistory(models.Model):
#     clerking = models.OneToOneField(ENTClerking, on_delete=models.CASCADE, related_name="otologic_history")
#     otalgia = models.BooleanField(default=False, help_text="Ear pain")
#     otorrhoea = models.BooleanField(default=False, help_text="Ear discharge")
#     tinnitus = models.BooleanField(default=False, help_text="Ringing in the ear")
#     vertigo = models.BooleanField(default=False, help_text="Dizziness/spinning sensation")
#     hearing_loss = models.BooleanField(default=False)
#     others = models.TextField(blank=True, null=True)

#     def __str__(self):
#         return f"Otologic History - {self.clerking.patient}"


# class RhinologicHistory(models.Model):
#     clerking = models.OneToOneField(ENTClerking, on_delete=models.CASCADE, related_name="rhinologic_history")
#     nasal_obstruction = models.BooleanField(default=False)
#     rhinorrhea = models.BooleanField(default=False, help_text="Runny nose")
#     excessive_sneezing = models.BooleanField(default=False)
#     facial_pain = models.BooleanField(default=False)
#     anosmia = models.BooleanField(default=False, help_text="Complete loss of smell")
#     hyposmia = models.BooleanField(default=False, help_text="Reduced sense of smell")
#     nose_bleeding = models.BooleanField(default=False)
#     nasal_growth = models.BooleanField(default=False)
#     others = models.TextField(blank=True, null=True)

#     def __str__(self):
#         return f"Rhinologic History - {self.clerking.patient}"


# class LaryngologyHistory(models.Model):
#     clerking = models.OneToOneField(ENTClerking, on_delete=models.CASCADE, related_name="laryngology_history")
#     throat_pain = models.BooleanField(default=False)
#     dysphagia = models.BooleanField(default=False, help_text="Difficulty swallowing")
#     odynophagia = models.BooleanField(default=False, help_text="Painful swallowing")
#     hoarseness = models.BooleanField(default=False)
#     other_voice_changes = models.TextField(blank=True, null=True)
#     halitosis = models.BooleanField(default=False, help_text="Bad breath")
#     lump_in_throat = models.BooleanField(default=False)
#     excessive_throat_hawking = models.BooleanField(default=False)
#     breathing_difficulty = models.BooleanField(default=False)
#     snoring = models.BooleanField(default=False)
#     loss_of_taste = models.BooleanField(default=False)
#     others = models.TextField(blank=True, null=True)

#     def __str__(self):
#         return f"Laryngology History - {self.clerking.patient}"


# class HeadAndNeckHistory(models.Model):
#     clerking = models.OneToOneField(ENTClerking, on_delete=models.CASCADE, related_name="head_neck_history")
#     neck_swelling = models.BooleanField(default=False)
#     jaw_swelling = models.BooleanField(default=False)
#     facial_deformity = models.BooleanField(default=False)
#     others = models.TextField(blank=True, null=True)

#     def __str__(self):
#         return f"Head & Neck History - {self.clerking.patient}"


# class PastMedicalSocialHistory(models.Model):
#     clerking = models.OneToOneField(ENTClerking, on_delete=models.CASCADE, related_name="past_medical_history")
#     previous_ent_surgery = models.TextField(blank=True, null=True)
#     previous_other_surgery = models.TextField(blank=True, null=True)
#     previous_trauma = models.TextField(blank=True, null=True)
#     history_of_pud = models.BooleanField(default=False, help_text="Peptic Ulcer Disease")
#     hypertension = models.BooleanField(default=False)
#     diabetes = models.BooleanField(default=False)
#     allergy = models.BooleanField(default=False)
#     autoimmune_disease = models.TextField(blank=True, null=True)
#     migraine_headache = models.BooleanField(default=False)
#     others = models.TextField(blank=True, null=True)

#     def __str__(self):
#         return f"Past Medical History - {self.clerking.patient}"


# class DrugHistory(models.Model):
#     clerking = models.OneToOneField(ENTClerking, on_delete=models.CASCADE, related_name="drug_history")
#     on_medications = models.BooleanField(default=False)
#     medications_detail = models.TextField(blank=True, null=True)
#     drug_allergy = models.BooleanField(default=False)

#     def __str__(self):
#         return f"Drug History - {self.clerking.patient}"


# # ──────────────────────────────────────────
# # Examination sections
# # ──────────────────────────────────────────

# class GeneralExamination(models.Model):
#     clerking = models.OneToOneField(ENTClerking, on_delete=models.CASCADE, related_name="general_examination")
#     acutely_ill_looking = models.BooleanField(default=False)
#     chronically_ill_looking = models.BooleanField(default=False)
#     pallor = models.BooleanField(default=False)
#     cyanosis = models.BooleanField(default=False)
#     dehydrated = models.BooleanField(default=False)
#     lymph_node = models.BooleanField(default=False)
#     jaundice = models.BooleanField(default=False)
#     weight_loss = models.BooleanField(default=False)
#     normal = models.BooleanField(default=False)
#     dyspnoeic = models.BooleanField(default=False)
#     tachypnoea = models.BooleanField(default=False)
#     intercostal_subcostal_recession = models.BooleanField(default=False)

#     def __str__(self):
#         return f"General Examination - {self.clerking.patient}"


# class EarExamination(models.Model):
#     clerking = models.OneToOneField(ENTClerking, on_delete=models.CASCADE, related_name="ear_examination")
#     pinna_deformity = models.BooleanField(default=False)
#     tragal_pinna_tenderness = models.BooleanField(default=False)
#     otorrhoea = models.BooleanField(default=False)
#     eac_findings_left = models.TextField(blank=True, null=True, help_text="External Auditory Canal - Left")
#     eac_findings_right = models.TextField(blank=True, null=True, help_text="External Auditory Canal - Right")
#     tm_findings_left = models.TextField(blank=True, null=True, help_text="Tympanic Membrane - Left")
#     tm_findings_right = models.TextField(blank=True, null=True, help_text="Tympanic Membrane - Right")
#     rinne_test_left = models.CharField(max_length=100, blank=True, null=True)
#     rinne_test_right = models.CharField(max_length=100, blank=True, null=True)
#     weber_test = models.CharField(max_length=100, blank=True, null=True)
#     other_tuning_fork_findings = models.TextField(blank=True, null=True)
#     left_facial_nerve_paralysis = models.BooleanField(default=False)
#     right_facial_nerve_paralysis = models.BooleanField(default=False)

#     def __str__(self):
#         return f"Ear Examination - {self.clerking.patient}"


# class NasalExamination(models.Model):
#     clerking = models.OneToOneField(ENTClerking, on_delete=models.CASCADE, related_name="nasal_examination")
#     nasal_pyramid_normal = models.BooleanField(default=True)
#     nasal_pyramid_deformed = models.BooleanField(default=False)
#     patent_nasal_cavity = models.BooleanField(default=True)
#     olfactory_intact = models.BooleanField(default=True)
#     engorged_inferior_turbinate_left = models.BooleanField(default=False)
#     engorged_inferior_turbinate_right = models.BooleanField(default=False)
#     septum_central = models.BooleanField(default=True)
#     septum_deviated = models.BooleanField(default=False)
#     otorrhoea_left = models.BooleanField(default=False)
#     otorrhoea_right = models.BooleanField(default=False)
#     nose_bleeding_left = models.BooleanField(default=False)
#     nose_bleeding_right = models.BooleanField(default=False)
#     nasal_polyps_left = models.BooleanField(default=False)
#     nasal_polyps_right = models.BooleanField(default=False)
#     nasal_mass_left = models.BooleanField(default=False)
#     nasal_mass_right = models.BooleanField(default=False)
#     other_findings = models.TextField(blank=True, null=True)

#     def __str__(self):
#         return f"Nasal Examination - {self.clerking.patient}"


# class OralCavityOropharynxExamination(models.Model):
#     clerking = models.OneToOneField(ENTClerking, on_delete=models.CASCADE, related_name="oral_examination")
#     good_oral_hygiene = models.BooleanField(default=True)
#     halitosis = models.BooleanField(default=False)
#     free_labial_buccal_sulci = models.BooleanField(default=True)
#     free_retromolar_trigone = models.BooleanField(default=True)
#     tonsil_normal = models.BooleanField(default=True)
#     hyperaemia = models.BooleanField(default=False)
#     exudates = models.BooleanField(default=False)
#     grade = models.CharField(max_length=50, blank=True, null=True)
#     granular_posterior_pharyngeal_wall = models.BooleanField(default=False)

#     def __str__(self):
#         return f"Oral Cavity Examination - {self.clerking.patient}"


# class NeckExamination(models.Model):
#     clerking = models.OneToOneField(ENTClerking, on_delete=models.CASCADE, related_name="neck_examination")
#     cervical_lymph_nodes_level = models.CharField(max_length=100, blank=True, null=True)
#     lymph_nodes_description = models.TextField(blank=True, null=True)
#     laryngeal_framework_preserved = models.BooleanField(default=True)
#     anterior_neck_mass = models.BooleanField(default=False)
#     anterior_neck_mass_description = models.TextField(blank=True, null=True)
#     lateral_neck_mass = models.BooleanField(default=False)
#     lateral_neck_mass_description = models.TextField(blank=True, null=True)

#     def __str__(self):
#         return f"Neck Examination - {self.clerking.patient}"
