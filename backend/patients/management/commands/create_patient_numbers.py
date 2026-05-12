from django.core.management.base import BaseCommand
from django.db import transaction
from patients.models import Patient


class Command(BaseCommand):
    help = "Generate patient numbers for existing patients"

    @transaction.atomic
    def handle(self, *args, **kwargs):

        patients = Patient.objects.filter(
            patient_number__isnull=True
        ).order_by('date_created', 'id')

        yearly_counters = {}

        for patient in patients:

            year = patient.date_created.year

            if year not in yearly_counters:

                existing_count = Patient.objects.filter(
                    patient_number__startswith=f"FMCK-{year}-"
                ).count()

                yearly_counters[year] = existing_count

            yearly_counters[year] += 1

            sequence = yearly_counters[year]

            patient.patient_number = (
                f"FMCK-{year}-{sequence:06d}"
            )

            patient.save(update_fields=['patient_number'])

            self.stdout.write(
                self.style.SUCCESS(
                    f"{patient.id} -> {patient.patient_number}"
                )
            )