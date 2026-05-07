from rest_framework.permissions import IsAuthenticated
from rest_framework import generics, permissions
from rest_framework.response import Response
from django.db.models import Sum, Q
from django.utils import timezone
from datetime import timedelta

from .models import *
from .serializers import *
from patients.models import Patient
from encounters.models import EncounterRoute, Visit


def get_current_visit(patient):
    """Helper function to get the current active visit for a patient"""
    try:
        visit = Visit.objects.filter(patient=patient, visit_status=True).last()
        encounter_route = EncounterRoute.objects.filter(visit=visit).last()
        # current_visit = encounter_route.visit
        return encounter_route
    except Visit.DoesNotExist:
        return None

# triage/serializers.py
class PatientTriageListCreateView(generics.ListCreateAPIView):
    serializer_class = TriageSerializer

    def get_queryset(self):
        pid = self.kwargs.get("pid")
        
        # Get the patient's current active visit
        try:
            current_visit=get_current_visit(Patient.objects.get(pk=pid)).visit
            if current_visit:
                # Filter vitals recorded during this current visit/encounter
                return Triage.objects.filter(
                    pid_id=pid,
                    date_recorded__gte=current_visit.date_created
                ).order_by("-date_recorded")
            else:
                # If no active visit, return empty or all vitals based on your preference
                return Triage.objects.filter(pid_id=pid).order_by("-date_recorded")
                
        except Visit.DoesNotExist:
            return Triage.objects.none()

    def perform_create(self, serializer):
        pid = self.kwargs.get("pid")
        patient = Patient.objects.get(pk=pid)
        serializer.save(pid=patient)


# ----- fluid_balance/views.py-------------------
class PatientFluidBalanceListCreateView(generics.ListCreateAPIView):
    serializer_class = FluidBalanceSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        pid = self.kwargs.get('pid')
        
        # Check if we should filter by current location
        current_only = self.request.query_params.get('current', 'true').lower() == 'true'
        
        queryset = FluidBalance.objects.filter(patient_id=pid)
        
        if current_only:
            try:
                from patients.models import Patient
                current_visit = get_current_visit(Patient.objects.get(pk=pid))                
                if current_visit:
                    queryset = queryset.filter(
                        recorded_at__gte=current_visit.date_created
                    )
            except Patient.DoesNotExist:
                pass
        
        return queryset.order_by('-recorded_at')
    
    def perform_create(self, serializer):
        pid = self.kwargs.get('pid')
        patient = Patient.objects.get(pk=pid)
        current_visit = get_current_visit(patient) 
        current_encounter = current_visit.id if current_visit else None
        
        serializer.save(
            patient=patient,
            encounter_id=current_encounter,
            recorded_by=self.request.user
        )
    
    def list(self, request, *args, **kwargs):
        # Get the base queryset
        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True)
        
        # Time periods for summary
        twenty_four_hours_ago = timezone.now() - timedelta(hours=24)
        forty_eight_hours_ago = timezone.now() - timedelta(hours=48)
        
        # Calculate summaries for different time periods
        last_24h_data = queryset.filter(recorded_at__gte=twenty_four_hours_ago)
        last_48h_data = queryset.filter(recorded_at__gte=forty_eight_hours_ago)
        
        # Last 24 hours summary
        last_24h_intake = last_24h_data.aggregate(Sum('intake_volume'))['intake_volume__sum'] or 0
        last_24h_output = last_24h_data.aggregate(Sum('output_volume'))['output_volume__sum'] or 0
        last_24h_balance = last_24h_intake - last_24h_output
        
        # Last 48 hours summary (for trend comparison)
        last_48h_intake = last_48h_data.aggregate(Sum('intake_volume'))['intake_volume__sum'] or 0
        last_48h_output = last_48h_data.aggregate(Sum('output_volume'))['output_volume__sum'] or 0
        
        # Current period summary (all records in queryset)
        current_intake = queryset.aggregate(Sum('intake_volume'))['intake_volume__sum'] or 0
        current_output = queryset.aggregate(Sum('output_volume'))['output_volume__sum'] or 0
        current_balance = current_intake - current_output
        
        # Build comprehensive response
        response_data = {
            'success': True,
            'records': serializer.data,
            'summary': {
                'last_24_hours': {
                    'total_intake': last_24h_intake,
                    'total_output': last_24h_output,
                    'net_balance': last_24h_balance,
                    'record_count': last_24h_data.count()
                },
                'current_period': {
                    'total_intake': current_intake,
                    'total_output': current_output,
                    'net_balance': current_balance,
                    'record_count': queryset.count()
                },
                'trends': {
                    'intake_trend': 'increasing' if last_24h_intake > (last_48h_intake - last_24h_intake) else 'decreasing',
                    'output_trend': 'increasing' if last_24h_output > (last_48h_output - last_24h_output) else 'decreasing'
                }
            },
            'pagination': {
                'total_records': queryset.count(),
                'current_location_only': self.request.query_params.get('current', 'true').lower() == 'true'
            }
        }
        
        return Response(response_data)

# class FluidBalanceSummaryView(generics.RetrieveAPIView):
#     permission_classes = [permissions.IsAuthenticated]
    
#     def get(self, request, pid):
#         """Get comprehensive fluid balance summary for a patient"""
#         try:
#             from patients.models import Patient
#             patient = Patient.objects.get(pk=pid)
            
#             # Get current visit timeframe
#             current_visit=get_current_visit(patient)
#             queryset = FluidBalance.objects.filter(patient=patient)
            
#             if current_visit:
#                 queryset = queryset.filter(recorded_at__gte=current_visit.date_created)
            
#             # Daily breakdown for last 7 days
#             seven_days_ago = timezone.now() - timedelta(days=7)
#             recent_data = queryset.filter(recorded_at__gte=seven_days_ago)
            
#             # Aggregate by day
#             from django.db.models.functions import TruncDate
#             daily_summary = recent_data.annotate(
#                 date=TruncDate('recorded_at')
#             ).values('date').annotate(
#                 total_intake=Sum('intake_volume'),
#                 total_output=Sum('output_volume')
#             ).order_by('-date')
            
#             # Calculate current totals
#             total_intake = queryset.aggregate(Sum('intake_volume'))['intake_volume__sum'] or 0
#             total_output = queryset.aggregate(Sum('output_volume'))['output_volume__sum'] or 0
#             net_balance = total_intake - total_output
            
#             summary_data = {
#                 'patient_id': patient.id,
#                 'patient_name': f"{patient.user.first_name} {patient.user.last_name}",
#                 'current_totals': {
#                     'total_intake': total_intake,
#                     'total_output': total_output,
#                     'net_balance': net_balance
#                 },
#                 'daily_breakdown': list(daily_summary),
#                 'last_24_hours': {
#                     'intake': queryset.filter(
#                         recorded_at__gte=timezone.now() - timedelta(hours=24)
#                     ).aggregate(Sum('intake_volume'))['intake_volume__sum'] or 0,
#                     'output': queryset.filter(
#                         recorded_at__gte=timezone.now() - timedelta(hours=24)
#                     ).aggregate(Sum('output_volume'))['output_volume__sum'] or 0
#                 }
#             }
            
#             return Response(summary_data)
            
#         except Patient.DoesNotExist:
#             return Response({'error': 'Patient not found'}, status=404)


