from django.db import models, transaction
from django.utils import timezone

from accounts.models import CustomUser, MaritalStatus, Religion


class PatientNumberSequence(models.Model):
    year = models.IntegerField(unique=True)
    last_number = models.IntegerField(default=0)

    def __str__(self):
        return f"{self.year} - {self.last_number}"


@transaction.atomic
def generate_patient_number():
    year = timezone.now().year

    seq, created = PatientNumberSequence.objects.select_for_update().get_or_create(
        year=year,
        defaults={"last_number": 0}
    )

    # SAFETY: sync if DB already has higher values
    max_existing = Patient.objects.filter(
        patient_number__startswith=f"FMCK-{year}-"
    ).aggregate(models.Max('patient_number'))['patient_number__max']

    if max_existing:
        try:
            max_seq = int(max_existing.split('-')[-1])
            seq.last_number = max(seq.last_number, max_seq)
        except:
            pass

    seq.last_number += 1
    seq.save(update_fields=['last_number'])

    return f"FMCK-{year}-{seq.last_number:06d}"

class Patient(models.Model):

    STATUS_CHOICES = [
        ('adult', 'Adult'),
        ('neonate', 'Neonate'),
        ('child', 'Child'),
    ]

    patient_number = models.CharField(max_length=30, unique=True, null=True, blank=True, editable=False)

    photo = models.ImageField(upload_to='images/patients/', blank=True, null=True)

    user = models.OneToOneField(CustomUser, on_delete=models.CASCADE, related_name='patient_profile')

    old_pid = models.CharField(max_length=10, unique=True, blank=True, null=True)

    marital_status = models.ForeignKey(MaritalStatus, on_delete=models.SET_NULL, null=True, blank=True)

    religion = models.ForeignKey(Religion, on_delete=models.SET_NULL, null=True, blank=True)

    date_of_birth = models.DateField(blank=True, null=True)

    age = models.IntegerField(blank=True, null=True)

    phone = models.CharField(max_length=11, blank=True, null=True)

    occupation = models.CharField(max_length=200, blank=True, null=True)

    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='adult')

    is_emergency = models.BooleanField(default=False)

    created_by = models.ForeignKey(CustomUser, on_delete=models.SET_NULL, null=True, blank=True)

    date_created = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-date_created']
        indexes = [
            models.Index(fields=['date_created']),
            models.Index(fields=['phone']),
            # models.Index(fields=['last_name_search']),
        ]

    def __str__(self):
        return f"{self.full_name} ({self.patient_number})"

    def save(self, *args, **kwargs):

        if not self.patient_number:
            self.patient_number = generate_patient_number()

        super().save(*args, **kwargs)

    @property
    def full_name(self):

        if not self.user:
            return "Unknown Patient"

        names = [
            self.user.first_name,
            self.user.other_name,
            self.user.last_name
        ]

        return " ".join(filter(None, names))

    @property
    def hospital_number(self):
        return self.patient_number

    @property
    def age_display(self):

        if not self.date_of_birth:
            return None

        today = timezone.now().date()

        years = today.year - self.date_of_birth.year

        if (
            today.month,
            today.day
        ) < (
            self.date_of_birth.month,
            self.date_of_birth.day
        ):
            years -= 1

        return years