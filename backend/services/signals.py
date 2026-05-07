# services/signals.py
from django.db.models import Sum, F, DecimalField, ExpressionWrapper
from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from .models import ServiceRequest, ServiceRequestDetail
