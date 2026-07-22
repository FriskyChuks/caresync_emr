# radiology/views.py
from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.viewsets import ModelViewSet
from rest_framework.views import APIView
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter
from django.utils import timezone
from django.db import transaction
from django.shortcuts import get_object_or_404
from django.contrib.contenttypes.models import ContentType

from .models import Unit, Investigation, InvestigationView, InvestigationRequest, RequestDetail, InvestigationResult
from .serializers import *

# Unit Views
class UnitListCreateView(generics.ListCreateAPIView):
    queryset = Unit.objects.all()
    serializer_class = UnitSerializer
    filter_backends = [SearchFilter, OrderingFilter]
    search_fields = ['title']

class UnitDetailView(generics.RetrieveUpdateAPIView):
    queryset = Unit.objects.all()
    serializer_class = UnitSerializer

class InvestigationDetailView(generics.RetrieveAPIView):
    queryset = Investigation.objects.select_related('radiology_unit').prefetch_related('views')
    serializer_class = InvestigationSerializer

# Investigation Views - List and Create
class InvestigationListCreateView(generics.ListCreateAPIView):
    queryset = Investigation.objects.select_related('radiology_unit').prefetch_related('views')
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['radiology_unit', 'has_views']
    search_fields = ['title', 'radiology_unit__title']
    ordering_fields = ['title', 'price', 'date_created']
    
    def get_serializer_class(self):
        if self.request.method == 'POST':
            return InvestigationCreateSerializer
        return InvestigationSerializer
    
    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['request'] = self.request
        return context

class InvestigationUpdateView(generics.RetrieveUpdateAPIView):
    queryset = Investigation.objects.select_related('radiology_unit').prefetch_related('views')
    lookup_field = 'id'
    
    def get_serializer_class(self):
        if self.request.method in ['PUT', 'PATCH']:
            return InvestigationCreateSerializer
        return InvestigationSerializer
    
    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['request'] = self.request
        return context

# Investigation Views - List and Create
class InvestigationViewListCreateView(generics.ListCreateAPIView):
    queryset = InvestigationView.objects.select_related('investigation')
    serializer_class = InvestigationViewSerializer
    filter_backends = [DjangoFilterBackend, SearchFilter]
    filterset_fields = ['investigation']
    search_fields = ['title', 'investigation__title']

# Investigation View Update
class InvestigationViewUpdateView(generics.RetrieveUpdateDestroyAPIView):
    queryset = InvestigationView.objects.all()
    serializer_class = InvestigationViewSerializer
    lookup_field = 'id'

# NEW: Sync payment status view
class SyncRadiologyPaymentStatusView(APIView):
    """
    Endpoint to sync payment status from bills to RequestDetail
    """
    permission_classes = [IsAuthenticated]
    
    def post(self, request, *args, **kwargs):
        detail_id = request.data.get("detail_id")
        
        if detail_id:
            detail = get_object_or_404(RequestDetail, pk=detail_id)
            self._sync_single_detail(detail)
            return Response({"status": "synced", "detail_status": detail.status})
        
        # Sync all pending/billed details
        details = RequestDetail.objects.filter(status__in=["pending", "billed"])
        synced_count = 0
        for detail in details:
            if self._sync_single_detail(detail):
                synced_count += 1
        
        return Response({"message": f"Synced {synced_count} details"})
    
    def _sync_single_detail(self, detail):
        """Sync payment status for a single RequestDetail"""
        from bills.models import Bill
        
        detail_ct = ContentType.objects.get_for_model(RequestDetail)
        
        bills = Bill.objects.filter(
            content_type=detail_ct,
            object_id=detail.id
        )
        
        if not bills.exists():
            if detail.status not in ["pending", "billed"]:
                detail.status = "pending"
                detail.save(update_fields=["status"])
                return True
            return False
        
        # Check if fully paid
        is_fully_paid = all(bill.status == "paid" for bill in bills)
        
        if is_fully_paid and detail.status in ["pending", "billed"]:
            detail.status = "paid"
            detail.save(update_fields=["status"])
            return True
        elif not is_fully_paid and detail.status == "paid":
            detail.status = "billed"
            detail.save(update_fields=["status"])
            return True
        
        return False


# NEW: Single result submission with payment check (for individual detail)
class SubmitRadiologyResultView(APIView):
    """
    Submit result for a single radiology request detail
    Checks payment status before allowing result entry
    """
    permission_classes = [IsAuthenticated]
    
    def post(self, request, detail_id, *args, **kwargs):
        detail = get_object_or_404(RequestDetail, pk=detail_id)
        
        # Check payment status
        if not detail.can_enter_results():
            return Response({
                "error": f"Cannot enter results - payment status is {detail.get_status_display()}",
                "status": detail.status,
                "payment_required": True
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Create or update result
        serializer = InvestigationResultCreateSerializer(
            data=request.data,
            context={'request': request}
        )
        
        if serializer.is_valid():
            result = serializer.save(created_by=request.user)
            
            # Update detail status to completed
            detail.status = "completed"
            detail.save()
            
            # Update parent request status
            detail.request.update_overall_status()
            
            # Return the result
            result_serializer = InvestigationResultSerializer(result)
            return Response(result_serializer.data, status=status.HTTP_200_OK)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# NEW: Get single result by detail ID
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_radiology_result(request, detail_id):
    """Fetch the radiology result for a specific request detail"""
    try:
        result = InvestigationResult.objects.select_related(
            'request_detail',
            'request_detail__request',
            'request_detail__request__patient',
            'request_detail__investigation',
            'created_by',
        ).get(request_detail_id=detail_id)
        
        serializer = InvestigationResultSerializer(result)
        return Response(serializer.data)
    except InvestigationResult.DoesNotExist:
        return Response(
            {"detail": "Result not found for this investigation."}, 
            status=status.HTTP_404_NOT_FOUND
    )


# InvestigationRequest ViewSet
class InvestigationRequestViewSet(ModelViewSet):
    queryset = InvestigationRequest.objects.select_related(
        'patient', 'patient__user', 'created_by'
    ).prefetch_related('details', 'details__investigation', 'details__investigation_view')
    
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['status', 'urgency', 'patient', 'created_by']
    search_fields = [
        'patient__user__first_name', 
        'patient__user__last_name',
        'patient__identifier',
        'clinical_notes'
    ]
    ordering_fields = ['date_created', 'last_updated', 'total_amount']
    ordering = ['-date_created']

    def get_serializer_class(self):
        if self.action == 'create':
            return InvestigationRequestCreateSerializer
        elif self.action == 'list':
            return InvestigationRequestListSerializer
        elif self.action in ['retrieve', 'update', 'partial_update']:
            return InvestigationRequestDetailSerializer
        return InvestigationRequestListSerializer

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)

    @action(detail=True, methods=['get'])
    def details(self, request, pk=None):
        """Get all details for a specific request"""
        request_obj = self.get_object()
        details = request_obj.details.select_related('investigation', 'investigation_view')
        serializer = RequestDetailSerializer(details, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def add_detail(self, request, pk=None):
        """Add a new investigation detail to existing request"""
        request_obj = self.get_object()
        serializer = AddRequestDetailSerializer(
            data=request.data, 
            context={'request_obj': request_obj}
        )
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['patch'])
    def update_status(self, request, pk=None):
        """Update the status of the entire request"""
        request_obj = self.get_object()
        serializer = InvestigationRequestStatusUpdateSerializer(
            request_obj, 
            data=request.data, 
            partial=True
        )
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# RequestDetail ViewSet
class RequestDetailViewSet(ModelViewSet):
    queryset = RequestDetail.objects.select_related(
        'request', 'request__patient', 'investigation', 'investigation_view'
    )
    filter_backends = [DjangoFilterBackend, OrderingFilter]
    filterset_fields = ['request', 'investigation', 'status']
    ordering_fields = ['priority', 'date_created']

    def get_serializer_class(self):
        if self.action in ['update', 'partial_update']:
            return RequestDetailStatusUpdateSerializer
        return RequestDetailSerializer

    @action(detail=True, methods=['patch'])
    def update_status(self, request, pk=None):
        """Update status of a specific request detail"""
        detail = self.get_object()
        serializer = RequestDetailStatusUpdateSerializer(
            detail, 
            data=request.data, 
            partial=True
        )
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=True, methods=['patch'], url_path='update-comment')
    def update_comment(self, request, pk=None):
        """Update radiologist comment for a request detail"""
        detail = self.get_object()
        comment = request.data.get("radiologist_comment", "")
        
        detail.radiologist_comment = comment
        detail.save(update_fields=["radiologist_comment"])
        
        return Response({
            "id": detail.id,
            "radiologist_comment": detail.radiologist_comment,
            "message": "Comment updated successfully"
        })


class InvestigationResultViewSet(ModelViewSet):
    queryset = InvestigationResult.objects.select_related(
        'request_detail',
        'request_detail__request',
        'request_detail__request__patient',
        'request_detail__investigation',
        'created_by',
    )
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = [
        'request_detail__request__patient',
        'request_detail__investigation',
        'is_abnormal',
        'created_by',
    ]
    search_fields = [
        'request_detail__request__patient__user__first_name',
        'request_detail__request__patient__user__last_name',
        'diagnosis',
        'comments',
        'supervised_by',
    ]
    ordering_fields = ['date_created', 'date_verified']
    ordering = ['-date_created']

    def get_serializer_class(self):
        if self.action == 'create':
            return InvestigationResultCreateSerializer
        return InvestigationResultSerializer

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)

    @action(detail=True, methods=['post'])
    def verify(self, request, pk=None):
        """Verify a result (typically by supervisor)"""
        result = self.get_object()
        result.supervised_by = request.user.get_full_name() or request.user.username
        result.date_verified = timezone.now()
        result.save()
        
        serializer = self.get_serializer(result)
        return Response(serializer.data)


# Patient Investigation Requests View
class PatientInvestigationRequestsView(generics.ListAPIView):
    """Get all investigation requests for a specific patient with detailed information"""
    serializer_class = InvestigationRequestDetailSerializer
    filter_backends = [DjangoFilterBackend, OrderingFilter]
    filterset_fields = ['status', 'urgency']
    ordering_fields = ['date_created', 'last_updated']
    ordering = ['-date_created']

    def get_queryset(self):
        patient_id = self.kwargs['patient_id']
        return InvestigationRequest.objects.filter(
            patient_id=patient_id
        ).select_related(
            'patient', 'patient__user', 'created_by'
        ).prefetch_related(
            'details',
            'details__investigation',
            'details__investigation_view'
        )


class TodayInvestigationRequestsView(generics.ListAPIView):
    """Get today's investigation requests"""
    serializer_class = InvestigationRequestListSerializer
    ordering = ['-date_created']

    def get_queryset(self):
        today = timezone.now().date()
        return InvestigationRequest.objects.filter(
            date_created__date=today
        ).select_related('patient', 'patient__user', 'created_by')


class PendingInvestigationRequestsView(generics.ListAPIView):
    """Get all pending investigation requests"""
    serializer_class = InvestigationRequestDashboardSerializer
    ordering = ['-date_created']

    def get_queryset(self):
        return InvestigationRequest.objects.filter(
            status__in=['pending', 'in_progress', 'billed', 'partly_billed', 'paid', 'partly_paid']
        ).select_related(
            'patient', 'patient__user', 'created_by'
        ).prefetch_related(
            'details',
            'details__investigation',
            'details__investigation_view'
        )


# Statistics and Reports
class RadiologyStatisticsView(generics.GenericAPIView):
    """Get radiology department statistics"""
    
    def get(self, request):
        from django.db.models import Count, Sum, Q
        from datetime import timedelta
        
        today = timezone.now().date()
        week_ago = today - timedelta(days=7)
        
        stats = {
            'total_requests_today': InvestigationRequest.objects.filter(
                date_created__date=today
            ).count(),
            'pending_requests': InvestigationRequest.objects.filter(
                status__in=['pending', 'in_progress']
            ).count(),
            'completed_today': InvestigationRequest.objects.filter(
                status='completed',
                date_created__date=today
            ).count(),
            'total_requests_week': InvestigationRequest.objects.filter(
                date_created__date__gte=week_ago
            ).count(),
            'popular_investigations': Investigation.objects.annotate(
                request_count=Count('requestdetail')
            ).order_by('-request_count')[:5].values('id', 'title', 'request_count')
        }
        
        return Response(stats)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def open_investigation_result(request, detail_id):
    """Fetch the investigation result for a specific request detail"""
    try:
        result = InvestigationResult.objects.select_related(
            'request_detail',
            'request_detail__request',
            'request_detail__request__patient',
            'request_detail__investigation',
            'created_by',
        ).get(request_detail_id=detail_id)
        
        serializer = InvestigationResultSerializer(result)
        return Response(serializer.data)
    except InvestigationResult.DoesNotExist:
        return Response(
            {"detail": "Investigation result not found."}, 
            status=status.HTTP_404_NOT_FOUND
        )