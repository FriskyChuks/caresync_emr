# views.py
from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.viewsets import ModelViewSet
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter
from django.utils import timezone

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
    serializer_class = RequestDetailSerializer
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


class InvestigationResultViewSet(ModelViewSet):
    queryset = InvestigationResult.objects.select_related(
        'request_detail',
        'request_detail__request',
        'request_detail__request__patient',
        'request_detail__investigation',
        'created_by',
        # Remove 'supervised_by' from select_related since it's now a CharField
    )
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = [
        'request_detail__request__patient',
        'request_detail__investigation',
        'is_abnormal',
        'created_by',
        # Remove 'supervised_by' from filterset_fields if it was there
    ]
    search_fields = [
        'request_detail__request__patient__user__first_name',
        'request_detail__request__patient__user__last_name',
        'diagnosis',
        'comments',
        'supervised_by',  # This can stay - CharField can be searched
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
        # Since supervised_by is now a CharField, you might want to store the verifier's name
        result.supervised_by = request.user.get_full_name() or request.user.username
        result.date_verified = timezone.now()
        result.save()
        
        serializer = self.get_serializer(result)
        return Response(serializer.data) 

# views.py - Add this view
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
    serializer_class = InvestigationRequestDashboardSerializer  # Use the new serializer
    ordering = ['-date_created']

    def get_queryset(self):
        return InvestigationRequest.objects.filter(
            status__in=['pending', 'in_progress', 'billed','partly_billed']
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
        from django.utils import timezone
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
            'supervised_by'
        ).get(request_detail_id=detail_id)
        
        serializer = InvestigationResultSerializer(result)
        return Response(serializer.data)
    except InvestigationResult.DoesNotExist:
        return Response(
            {"detail": "Investigation result not found."}, 
            status=status.HTTP_404_NOT_FOUND
        )