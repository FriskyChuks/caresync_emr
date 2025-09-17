from django.core.management.base import BaseCommand
from encounters.models import Encounter
from django.utils import timezone
import datetime

class Command(BaseCommand):
    help = 'Discharges all out-patients every Sunday night'

    def handle(self, *args, **kwargs):
        today = timezone.now()
        if today.weekday() == 6:  # Sunday
            discharged = Encounter.objects.filter(visit_status=True, is_inpatient=False)
            discharged.update(visit_status=False)
            self.stdout.write(self.style.SUCCESS(f'{discharged.count()} out-patients discharged.'))








