from django.contrib import admin
from .models import *

# Register your models here.

admin.site.register(Continent)
admin.site.register(Country)
admin.site.register(State)
admin.site.register(LocalGovernmentArea)
admin.site.register(ResidentialAddress)
admin.site.register(PermanentAddress)
admin.site.register(NextOfKin)
