from django.contrib import admin
from .models import *
# Register your models here.

admin.site.register(LabResult)
admin.site.register(LabUnit)
admin.site.register(Test)
admin.site.register(TestRequest)
admin.site.register(TestRequestDetail)
admin.site.register(TestPanel)
admin.site.register(ReferenceRange)
admin.site.register(SubTestResult)
admin.site.register(SubTest)
