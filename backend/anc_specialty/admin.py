# Register your models here.
from django.contrib import admin
from .models import *
# Register your models here.

admin.site.register(ObstetricHistory)
admin.site.register(MenstrualGynecologicalHistory)
admin.site.register(MedicalFamilyHistory)
admin.site.register(CurrentPregnancy)
admin.site.register(AntenatalVitals)
admin.site.register(ANCReVisit)
admin.site.register(UltrasoundRecord)
admin.site.register(DeliveryRecord)