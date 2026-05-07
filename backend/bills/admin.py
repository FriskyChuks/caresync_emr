from django.contrib import admin

from .models import *

admin.site.register(Bill)
admin.site.register(Payment)
admin.site.register(PaymentDetail)
admin.site.register(Wallet)
