from rest_framework import generics, filters, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.pagination import PageNumberPagination
from django.db.models import Q, Count
from django.db import transaction
from django.utils import timezone
from django_filters.rest_framework import DjangoFilterBackend

from .models import (
    ICD11Chapter, ICD11Block, ICD11Category, 
    ICD11Diagnosis, ICD11DiagnosisHistory
)
from .serializers import (
    ICD11ChapterSerializer, ICD11BlockSerializer,
    ICD11CategoryListSerializer, ICD11CategoryDetailSerializer,
    ICD11CategoryHierarchySerializer, ICD11SearchSerializer,
    ICD11DiagnosisCreateSerializer, ICD11DiagnosisListSerializer,
    ICD11DiagnosisDetailSerializer, ICD11DiagnosisUpdateSerializer,
    ICD11DiagnosisHistorySerializer
)
from .filters import CategoryFilter


# Custom pagination
class StandardResultsSetPagination(PageNumberPagination):
    page_size = 20
    page_size_query_param = 'page_size'
    max_page_size = 100


# ==================== CHAPTER VIEWS ====================

class ChapterListAPIView(generics.ListAPIView):
    """List all chapters"""
    queryset = ICD11Chapter.objects.all().annotate(
        blocks_count=Count('blocks', distinct=True),
        categories_count=Count('categories', distinct=True)
    )
    serializer_class = ICD11ChapterSerializer
    pagination_class = StandardResultsSetPagination
    permission_classes = [IsAuthenticated]


class ChapterDetailAPIView(generics.RetrieveAPIView):
    """Get a specific chapter"""
    queryset = ICD11Chapter.objects.all()
    serializer_class = ICD11ChapterSerializer
    lookup_field = 'chapter_no'
    permission_classes = [IsAuthenticated]


class ChapterBlocksAPIView(generics.ListAPIView):
    """Get all blocks in a chapter"""
    serializer_class = ICD11BlockSerializer
    pagination_class = StandardResultsSetPagination
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        chapter_no = self.kwargs['chapter_no']
        return ICD11Block.objects.filter(
            chapter__chapter_no=chapter_no
        ).annotate(
            categories_count=Count('categories', distinct=True)
        )


class ChapterCategoriesAPIView(generics.ListAPIView):
    """Get all categories in a chapter"""
    serializer_class = ICD11CategoryListSerializer
    pagination_class = StandardResultsSetPagination
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_class = CategoryFilter
    search_fields = ['code', 'title']
    ordering_fields = ['code', 'title', 'depth_in_kind']
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        chapter_no = self.kwargs['chapter_no']
        return ICD11Category.objects.filter(
            chapter__chapter_no=chapter_no
        ).select_related('chapter', 'block', 'parent_category')


# ==================== BLOCK VIEWS ====================

class BlockListAPIView(generics.ListAPIView):
    """List all blocks"""
    queryset = ICD11Block.objects.all().annotate(
        categories_count=Count('categories', distinct=True)
    )
    serializer_class = ICD11BlockSerializer
    pagination_class = StandardResultsSetPagination
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ['chapter__chapter_no', 'depth_in_kind', 'is_residual']
    search_fields = ['title', 'block_id']
    permission_classes = [IsAuthenticated]


class BlockDetailAPIView(generics.RetrieveAPIView):
    """Get a specific block"""
    queryset = ICD11Block.objects.all()
    serializer_class = ICD11BlockSerializer
    lookup_field = 'block_id'
    permission_classes = [IsAuthenticated]


class BlockCategoriesAPIView(generics.ListAPIView):
    """Get all categories in a block"""
    serializer_class = ICD11CategoryListSerializer
    pagination_class = StandardResultsSetPagination
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ['is_leaf', 'is_residual']
    search_fields = ['code', 'title']
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        block_id = self.kwargs['block_id']
        return ICD11Category.objects.filter(
            block__block_id=block_id
        ).select_related('chapter', 'block', 'parent_category')


# ==================== CATEGORY VIEWS ====================

class CategoryListAPIView(generics.ListAPIView):
    """List all categories with filtering"""
    queryset = ICD11Category.objects.select_related(
        'chapter', 'block', 'parent_category'
    ).prefetch_related('groupings')
    serializer_class = ICD11CategoryListSerializer
    pagination_class = StandardResultsSetPagination
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_class = CategoryFilter
    search_fields = ['code', 'title']
    ordering_fields = ['code', 'title', 'depth_in_kind', 'created_at']
    permission_classes = [IsAuthenticated]


class CategoryDetailAPIView(generics.RetrieveAPIView):
    """Get detailed information about a specific category"""
    queryset = ICD11Category.objects.select_related(
        'chapter', 'block', 'parent_category'
    ).prefetch_related('children', 'groupings')
    serializer_class = ICD11CategoryDetailSerializer
    lookup_field = 'code'
    permission_classes = [IsAuthenticated]


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def category_path(request, code):
    """Get the full path from root to this category"""
    try:
        category = ICD11Category.objects.select_related('parent_category').get(code=code)
    except ICD11Category.DoesNotExist:
        return Response(
            {'error': 'Category not found'}, 
            status=status.HTTP_404_NOT_FOUND
        )
    
    path = []
    current = category
    while current:
        path.insert(0, {
            'code': current.code,
            'title': current.title,
            'depth': current.depth_in_kind
        })
        current = current.parent_category
    
    return Response(path)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def category_descendants(request, code):
    """Get all descendants of this category"""
    try:
        category = ICD11Category.objects.get(code=code)
    except ICD11Category.DoesNotExist:
        return Response(
            {'error': 'Category not found'}, 
            status=status.HTTP_404_NOT_FOUND
        )
    
    # Get all descendants recursively
    all_descendants = []
    
    def get_descendants_recursive(cats):
        for cat in cats.select_related('chapter', 'block', 'parent_category'):
            all_descendants.append(cat)
            if cat.children.exists():
                get_descendants_recursive(cat.children.all())
    
    get_descendants_recursive(category.children.all())
    
    serializer = ICD11CategoryListSerializer(all_descendants, many=True)
    return Response({
        'count': len(all_descendants),
        'results': serializer.data
    })


# ==================== HIERARCHY VIEW ====================

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def hierarchy_view(request, chapter_no):
    """Get hierarchical tree structure for a chapter"""
    # Get top-level categories (depth 1) for the specified chapter
    categories = ICD11Category.objects.filter(
        chapter__chapter_no=chapter_no,
        depth_in_kind=1
    ).select_related('chapter', 'block', 'parent_category')
    
    def build_hierarchy(categories_list):
        """Recursively build hierarchy"""
        result = []
        for cat in categories_list:
            node = {
                'code': cat.code,
                'title': cat.title,
                'depth': cat.depth_in_kind,
                'is_leaf': cat.is_leaf,
                'children': []
            }
            
            # Get children
            children = cat.children.all()
            if children.exists():
                node['children'] = build_hierarchy(children)
            
            result.append(node)
        return result
    
    hierarchy = build_hierarchy(categories)
    
    return Response({
        'chapter_no': chapter_no,
        'total_categories': ICD11Category.objects.filter(chapter__chapter_no=chapter_no).count(),
        'hierarchy': hierarchy
    })


# ==================== SEARCH VIEWS ====================

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def search_categories(request):
    """Advanced search for ICD-11 categories"""
    queryset = ICD11Category.objects.select_related('chapter')
    
    # Get search parameters
    query = request.query_params.get('q', '')
    code = request.query_params.get('code', '')
    chapter = request.query_params.get('chapter', '')
    depth = request.query_params.get('depth', None)
    is_leaf = request.query_params.get('is_leaf', None)
    is_residual = request.query_params.get('is_residual', None)
    page = int(request.query_params.get('page', 1))
    page_size = min(int(request.query_params.get('page_size', 20)), 100)
    
    # Apply filters
    if query:
        queryset = queryset.filter(
            Q(title__icontains=query) |
            Q(code__icontains=query)
        )
    
    if code:
        queryset = queryset.filter(code__icontains=code)
    
    if chapter:
        queryset = queryset.filter(chapter__chapter_no=chapter)
    
    if depth is not None:
        queryset = queryset.filter(depth_in_kind=int(depth))
    
    if is_leaf is not None:
        queryset = queryset.filter(is_leaf=is_leaf.lower() == 'true')
    
    if is_residual is not None:
        queryset = queryset.filter(is_residual=is_residual.lower() == 'true')
    
    # Pagination
    total = queryset.count()
    start = (page - 1) * page_size
    end = start + page_size
    queryset = queryset[start:end]
    
    serializer = ICD11SearchSerializer(queryset, many=True)
    
    return Response({
        'count': total,
        'page': page,
        'page_size': page_size,
        'total_pages': (total + page_size - 1) // page_size,
        'results': serializer.data
    })


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def autocomplete(request):
    """Fast autocomplete for search boxes"""
    query = request.query_params.get('q', '')
    limit = min(int(request.query_params.get('limit', 10)), 50)
    
    if len(query) < 2:
        return Response({'results': []})
    
    categories = ICD11Category.objects.filter(
        Q(title__icontains=query) |
        Q(code__icontains=query)
    ).select_related('chapter')[:limit]
    
    serializer = ICD11SearchSerializer(categories, many=True)
    
    return Response({
        'query': query,
        'results': serializer.data
    })


# ==================== DIAGNOSIS VIEWS ====================

class DiagnosisListCreateAPIView(generics.ListCreateAPIView):
    """List all diagnoses or create a new diagnosis"""
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        queryset = ICD11Diagnosis.objects.select_related(
            'category', 'patient__user', 'diagnosed_by', 'confirmed_by', 'encounter_route__visit'
        )
        
        # Filter by patient
        patient_id = self.request.query_params.get('patient_id')
        if patient_id:
            queryset = queryset.filter(patient_id=patient_id)
        
        # Filter by encounter route
        encounter_route_id = self.request.query_params.get('encounter_route_id')
        if encounter_route_id:
            queryset = queryset.filter(encounter_route_id=encounter_route_id)
        
        # Filter by status
        status_filter = self.request.query_params.get('status')
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        
        # Filter by diagnosis type
        diagnosis_type = self.request.query_params.get('diagnosis_type')
        if diagnosis_type:
            queryset = queryset.filter(diagnosis_type=diagnosis_type)
        
        # Filter by date range
        from_date = self.request.query_params.get('from_date')
        to_date = self.request.query_params.get('to_date')
        if from_date:
            queryset = queryset.filter(diagnosed_date__gte=from_date)
        if to_date:
            queryset = queryset.filter(diagnosed_date__lte=to_date)
        
        # Only show active diagnoses by default (include resolved when show_all=true)
        show_all = self.request.query_params.get('show_all', 'false').lower() == 'true'
        if not show_all:
            queryset = queryset.filter(status='active')
        
        return queryset.order_by('-diagnosed_date')
    
    def get_serializer_class(self):
        if self.request.method == 'POST':
            return ICD11DiagnosisCreateSerializer
        return ICD11DiagnosisListSerializer
    
    @transaction.atomic
    def perform_create(self, serializer):
        serializer.save()
        
        # Log creation
        diagnosis = serializer.instance
        ICD11DiagnosisHistory.objects.create(
            diagnosis=diagnosis,
            changed_by=self.request.user,
            field_name='creation',
            old_value=None,
            new_value=f"Diagnosis created: {diagnosis.category.code} - {diagnosis.category.title}"
        )


class DiagnosisDetailAPIView(generics.RetrieveUpdateDestroyAPIView):
    """Get, update or delete a specific diagnosis"""
    queryset = ICD11Diagnosis.objects.select_related(
        'category', 'patient__user', 'encounter_route__visit',
        'diagnosed_by', 'confirmed_by'
    )
    permission_classes = [IsAuthenticated]
    
    def get_serializer_class(self):
        if self.request.method == 'GET':
            return ICD11DiagnosisDetailSerializer
        elif self.request.method in ['PUT', 'PATCH']:
            return ICD11DiagnosisUpdateSerializer
        return ICD11DiagnosisListSerializer
    
    @transaction.atomic
    def perform_update(self, serializer):
        diagnosis = self.get_object()
        
        # Track what's being changed
        old_type = diagnosis.diagnosis_type
        old_status = diagnosis.status
        old_confirmed = diagnosis.is_confirmed
        old_notes = diagnosis.notes
        old_description = diagnosis.clinical_description
        old_severity = diagnosis.severity
        
        # Handle special case: promoting to primary automatically confirms
        new_type = self.request.data.get('diagnosis_type')
        if new_type == 'primary' and old_type != 'primary':
            serializer.save(is_confirmed=True, confirmed_by=self.request.user)
        else:
            serializer.save()
        
        diagnosis.refresh_from_db()
        
        # Log changes
        changes = []
        if diagnosis.diagnosis_type != old_type:
            changes.append(f"Type changed from {old_type} to {diagnosis.diagnosis_type}")
        if diagnosis.status != old_status:
            changes.append(f"Status changed from {old_status} to {diagnosis.status}")
        if diagnosis.is_confirmed != old_confirmed:
            changes.append(f"Confirmed by {self.request.user.get_full_name()}")
        if diagnosis.notes != old_notes:
            changes.append("Notes updated")
        if diagnosis.clinical_description != old_description:
            changes.append("Clinical description updated")
        if diagnosis.severity != old_severity:
            changes.append(f"Severity changed from {old_severity or 'none'} to {diagnosis.severity or 'none'}")
        
        if changes:
            ICD11DiagnosisHistory.objects.create(
                diagnosis=diagnosis,
                changed_by=self.request.user,
                field_name='update',
                old_value=None,
                new_value=' | '.join(changes)
            )
    
    @transaction.atomic
    def perform_destroy(self, instance):
        # Log deletion before deleting
        ICD11DiagnosisHistory.objects.create(
            diagnosis=instance,
            changed_by=self.request.user,
            field_name='deletion',
            old_value=f"Diagnosis deleted: {instance.category.code}",
            new_value=None
        )
        instance.delete()


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def resolve_diagnosis(request, pk):
    """Mark a diagnosis as resolved"""
    try:
        diagnosis = ICD11Diagnosis.objects.get(pk=pk)
    except ICD11Diagnosis.DoesNotExist:
        return Response(
            {'error': 'Diagnosis not found'},
            status=status.HTTP_404_NOT_FOUND
        )
    
    # Only active diagnoses can be resolved
    if diagnosis.status != 'active':
        return Response(
            {'error': 'Only active diagnoses can be resolved'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # Update the diagnosis status to resolved
    diagnosis.status = 'resolved'
    diagnosis.resolved_date = timezone.now()
    diagnosis.save()
    
    # Log resolution
    ICD11DiagnosisHistory.objects.create(
        diagnosis=diagnosis,
        changed_by=request.user,
        field_name='status',
        old_value='active',
        new_value='resolved'
    )
    
    # Return the updated diagnosis for UI refresh
    serializer = ICD11DiagnosisListSerializer(diagnosis)
    
    return Response({
        'message': 'Diagnosis resolved successfully',
        'diagnosis': serializer.data
    })


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def confirm_diagnosis(request, pk):
    """Confirm a diagnosis"""
    try:
        diagnosis = ICD11Diagnosis.objects.get(pk=pk)
    except ICD11Diagnosis.DoesNotExist:
        return Response(
            {'error': 'Diagnosis not found'},
            status=status.HTTP_404_NOT_FOUND
        )
    
    # Only active and unconfirmed diagnoses can be confirmed
    if diagnosis.status != 'active':
        return Response(
            {'error': 'Only active diagnoses can be confirmed'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    if diagnosis.is_confirmed:
        return Response(
            {'error': 'Diagnosis is already confirmed'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # Update the diagnosis
    diagnosis.is_confirmed = True
    diagnosis.confirmed_by = request.user
    diagnosis.confirmed_date = timezone.now()
    diagnosis.save()
    
    # Log confirmation
    ICD11DiagnosisHistory.objects.create(
        diagnosis=diagnosis,
        changed_by=request.user,
        field_name='confirmation',
        old_value=None,
        new_value=f"Confirmed by {request.user.get_full_name()}"
    )
    
    # Return the updated diagnosis for UI refresh
    serializer = ICD11DiagnosisListSerializer(diagnosis)
    
    return Response({
        'message': 'Diagnosis confirmed successfully',
        'diagnosis': serializer.data
    })


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def reopen_diagnosis(request, pk):
    """Reopen a resolved diagnosis"""
    try:
        diagnosis = ICD11Diagnosis.objects.get(pk=pk)
    except ICD11Diagnosis.DoesNotExist:
        return Response(
            {'error': 'Diagnosis not found'},
            status=status.HTTP_404_NOT_FOUND
        )
    
    # Only resolved diagnoses can be reopened
    if diagnosis.status != 'resolved':
        return Response(
            {'error': 'Only resolved diagnoses can be reopened'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # Update the diagnosis status back to active
    diagnosis.status = 'active'
    diagnosis.resolved_date = None
    diagnosis.save()
    
    # Log reopening
    ICD11DiagnosisHistory.objects.create(
        diagnosis=diagnosis,
        changed_by=request.user,
        field_name='status',
        old_value='resolved',
        new_value='active'
    )
    
    # Return the updated diagnosis for UI refresh
    serializer = ICD11DiagnosisListSerializer(diagnosis)
    
    return Response({
        'message': 'Diagnosis reopened successfully',
        'diagnosis': serializer.data
    })


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def diagnosis_history(request, pk):
    """Get history of changes for a diagnosis"""
    try:
        diagnosis = ICD11Diagnosis.objects.get(pk=pk)
    except ICD11Diagnosis.DoesNotExist:
        return Response(
            {'error': 'Diagnosis not found'},
            status=status.HTTP_404_NOT_FOUND
        )
    
    history = diagnosis.history.all()
    serializer = ICD11DiagnosisHistorySerializer(history, many=True)
    
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def patient_diagnosis_summary(request, patient_id):
    """Get summary of diagnoses for a patient"""
    from django.db.models import Count
    from patients.models import Patient
    
    try:
        patient = Patient.objects.get(id=patient_id)
    except Patient.DoesNotExist:
        return Response(
            {'error': 'Patient not found'},
            status=status.HTTP_404_NOT_FOUND
        )
    
    diagnoses = ICD11Diagnosis.objects.filter(patient_id=patient_id)
    
    # Get type counts
    type_counts = {}
    for dt in ICD11Diagnosis.DIAGNOSIS_TYPES:
        count = diagnoses.filter(diagnosis_type=dt[0]).count()
        if count > 0:
            type_counts[dt[0]] = count
    
    # Get status counts
    status_counts = {}
    for st in ICD11Diagnosis.DIAGNOSIS_STATUS:
        count = diagnoses.filter(status=st[0]).count()
        if count > 0:
            status_counts[st[0]] = count
    
    summary = {
        'patient_id': patient_id,
        'patient_name': f"{patient.user.first_name} {patient.user.last_name}",
        'total': diagnoses.count(),
        'active': diagnoses.filter(status='active').count(),
        'resolved': diagnoses.filter(status='resolved').count(),
        'confirmed': diagnoses.filter(is_confirmed=True).count(),
        'by_type': [{'diagnosis_type': k, 'count': v} for k, v in type_counts.items()],
        'by_status': [{'status': k, 'count': v} for k, v in status_counts.items()],
        'recent': ICD11DiagnosisListSerializer(
            diagnoses.order_by('-diagnosed_date')[:5],
            many=True
        ).data
    }
    
    return Response(summary)