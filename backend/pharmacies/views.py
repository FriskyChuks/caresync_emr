from rest_framework import generics, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.db.models import Q, F, Sum, Prefetch
from django.utils import timezone
from django.db import transaction
from django.core.exceptions import ValidationError

from .models import (
    StoreType, PharmacyStore, DrugsForms, DrugsTypes, Product, Brand, Batch,
    Inventory, Supplier, Supply, StockTransfer, Prescription, PrescriptionDetail,
    DispensingRecord  # New model
)
from .serializers import *
from patients.models import Patient

# ========== UNCHANGED VIEWS (Keep exactly as they were) ==========
# Store Type Views
class StoreTypeListCreateView(generics.ListCreateAPIView):
    queryset = StoreType.objects.all()
    serializer_class = StoreTypeSerializer

class StoreTypeDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = StoreType.objects.all()
    serializer_class = StoreTypeSerializer

# Pharmacy Store Views
class PharmacyStoreListCreateView(generics.ListCreateAPIView):
    queryset = PharmacyStore.objects.filter(is_active=True)
    serializer_class = PharmacyStoreSerializer

class PharmacyStoreDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = PharmacyStore.objects.all()
    serializer_class = PharmacyStoreSerializer

@api_view(['GET'])
def pharmacy_store_bulk_stores(request):
    bulk_stores = PharmacyStore.objects.filter(is_bulk_store=True, is_active=True)
    serializer = PharmacyStoreSerializer(bulk_stores, many=True)
    return Response(serializer.data)

@api_view(['GET'])
def pharmacy_store_outlets(request):
    outlets = PharmacyStore.objects.filter(is_bulk_store=False, is_active=True)
    serializer = PharmacyStoreSerializer(outlets, many=True)
    return Response(serializer.data)

# Drugs Forms Views
class DrugsFormsListCreateView(generics.ListCreateAPIView):
    queryset = DrugsForms.objects.all()
    serializer_class = DrugsFormsSerializer

class DrugsFormsDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = DrugsForms.objects.all()
    serializer_class = DrugsFormsSerializer

# Drugs Types Views
class DrugsTypesListCreateView(generics.ListCreateAPIView):
    queryset = DrugsTypes.objects.all()
    serializer_class = DrugsTypesSerializer

class DrugsTypesDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = DrugsTypes.objects.all()
    serializer_class = DrugsTypesSerializer


class ProductListCreateView(generics.ListCreateAPIView):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer

    def get_serializer_context(self):
        context = super().get_serializer_context()
        # Pass store_id to serializer context for filtering
        store_id = self.request.query_params.get('store_id')
        if store_id:
            context['store_id'] = int(store_id)
        return context

    def get_queryset(self):
        queryset = Product.objects.all()
        low_stock = self.request.query_params.get('low_stock')
        category = self.request.query_params.get('category')
        search = self.request.query_params.get('search')
        store_id = self.request.query_params.get('store_id')
        
        if store_id:
            # Filter products that have inventory in this store
            queryset = queryset.filter(
                brands__batches__inventory__store_id=store_id
            ).distinct()
        
        if low_stock == 'true':
            if store_id:
                queryset = queryset.filter(
                    brands__batches__inventory__store_id=store_id,
                    brands__batches__inventory__quantity__lte=F('brands__reorder_level')
                ).distinct()
            else:
                queryset = queryset.filter(
                    brands__batches__inventory__quantity__lte=F('brands__reorder_level')
                ).distinct()
        
        if category:
            queryset = queryset.filter(category=category)
        
        if search:
            queryset = queryset.filter(
                Q(name__icontains=search) | 
                Q(strength__icontains=search) |
                Q(description__icontains=search)
            )
        
        return queryset.distinct()


class ProductDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer

@api_view(['GET'])
def product_brands(request, pk):
    try:
        product = Product.objects.get(pk=pk)
        brands = product.brands.all()
        serializer = BrandSerializer(brands, many=True)
        return Response(serializer.data)
    except Product.DoesNotExist:
        return Response({'error': 'Product not found'}, status=status.HTTP_404_NOT_FOUND)

@api_view(['GET'])
def product_inventory(request, pk):
    try:
        product = Product.objects.get(pk=pk)
        inventory = Inventory.objects.filter(batch__brand__product=product)
        serializer = InventorySerializer(inventory, many=True)
        return Response(serializer.data)
    except Product.DoesNotExist:
        return Response({'error': 'Product not found'}, status=status.HTTP_404_NOT_FOUND)

@api_view(['GET'])
def product_available_brands(request, pk, store_id):
    try:
        product = Product.objects.get(pk=pk)
        store = PharmacyStore.objects.get(id=store_id)
        
        available_brands = Brand.objects.filter(
            batches__inventory__store=store,
            batches__inventory__quantity__gt=0,
            product=product
        ).distinct()
        
        serializer = BrandSerializer(available_brands, many=True, context={'store_id': store_id})
        return Response(serializer.data)
    except (Product.DoesNotExist, PharmacyStore.DoesNotExist):
        return Response({'error': 'Product or Store not found'}, status=status.HTTP_404_NOT_FOUND)

# Brand Views
class BrandListCreateView(generics.ListCreateAPIView):
    queryset = Brand.objects.all()
    serializer_class = BrandSerializer

    def get_queryset(self):
        queryset = Brand.objects.all()
        low_stock = self.request.query_params.get('low_stock')
        product_id = self.request.query_params.get('product_id')
        search = self.request.query_params.get('search')
        
        if low_stock:
            queryset = queryset.annotate(
                current_stock=Sum('batches__inventory__quantity')
            ).filter(current_stock__lte=F('reorder_level'))
        if product_id:
            queryset = queryset.filter(product_id=product_id)
        if search:
            queryset = queryset.filter(
                Q(name__icontains=search) | 
                Q(product__name__icontains=search)
            )
        
        return queryset

class BrandDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Brand.objects.all()
    serializer_class = BrandSerializer

# Batch Views
class BatchListCreateView(generics.ListCreateAPIView):
    queryset = Batch.objects.all()
    serializer_class = BatchSerializer

    def get_queryset(self):
        queryset = Batch.objects.all()
        brand_id = self.request.query_params.get('brand_id')
        expired = self.request.query_params.get('expired')
        store_id = self.request.query_params.get('store_id')
        
        if brand_id:
            queryset = queryset.filter(brand_id=brand_id)
        
        if expired:
            today = timezone.now().date()
            if expired == 'true':
                queryset = queryset.filter(expiry_date__lt=today)
            elif expired == 'false':
                queryset = queryset.filter(expiry_date__gte=today)
        
        if store_id:
            queryset = queryset.filter(inventory__store_id=store_id, inventory__quantity__gt=0)
        
        return queryset.distinct()

class BatchDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Batch.objects.all()
    serializer_class = BatchSerializer

# Inventory Views
class InventoryListCreateView(generics.ListCreateAPIView):
    queryset = Inventory.objects.all()
    serializer_class = InventorySerializer

    def get_queryset(self):
        queryset = Inventory.objects.all()
        store_id = self.request.query_params.get('store_id')
        batch_id = self.request.query_params.get('batch_id')
        product_id = self.request.query_params.get('product_id')
        low_stock = self.request.query_params.get('low_stock')
        
        if store_id:
            queryset = queryset.filter(store_id=store_id)
        if batch_id:
            queryset = queryset.filter(batch_id=batch_id)
        if product_id:
            queryset = queryset.filter(batch__brand__product_id=product_id)
        if low_stock:
            queryset = queryset.filter(quantity__lte=F('batch__brand__reorder_level'))
        
        return queryset.select_related('batch', 'batch__brand', 'batch__brand__product')

class InventoryDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Inventory.objects.all()
    serializer_class = InventorySerializer

@api_view(['GET'])
def inventory_low_stock(request):
    low_stock = Inventory.objects.filter(quantity__lte=F('batch__brand__reorder_level'))
    serializer = InventorySerializer(low_stock, many=True)
    return Response(serializer.data)


from rest_framework.views import APIView
class AvailableBatchesForTransferView(APIView):
    """
    Get available batches for honoring a transfer request
    GET /api/stock-transfers/{transfer_id}/available-batches/
    """
    
    def get(self, request, pk):
        try:
            transfer = StockTransfer.objects.get(pk=pk)
        except StockTransfer.DoesNotExist:
            return Response(
                {'error': 'Transfer not found'}, 
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Check authorization
        user = request.user
        is_authorized = False
        
        if hasattr(user, 'pharmacy_store') and user.pharmacy_store:
            if user.pharmacy_store.id == transfer.from_store.id:
                is_authorized = True
        
        is_admin = (
            user.is_superuser or 
            user.is_staff or 
            getattr(user, 'is_pharmacy_store_manager', False) or
            (hasattr(user, 'user_category') and user.user_category and 
             user.user_category.title in ['manager', 'admin', 'support', 'developer'])
        )
        
        if not is_authorized and not is_admin:
            return Response(
                {'error': 'Not authorized to view batches for this transfer'}, 
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Get inventory items
        inventory_items = Inventory.objects.filter(
            batch__brand__product=transfer.product,
            store=transfer.from_store,
            quantity__gt=0,
            batch__expiry_date__gte=timezone.now().date()
        ).select_related('batch', 'batch__brand').order_by('batch__expiry_date')
        
        # Group by brand
        brands_dict = {}
        for inv in inventory_items:
            brand = inv.batch.brand
            if brand.id not in brands_dict:
                brands_dict[brand.id] = {
                    'brand_id': brand.id,
                    'brand_name': brand.name,
                    'batches': []
                }
            
            brands_dict[brand.id]['batches'].append({
                'batch_id': inv.batch.id,
                'batch_no': inv.batch.batch_no,
                'expiry_date': inv.batch.expiry_date,
                'available_quantity': inv.quantity,
                'is_expiring_soon': inv.batch.is_expiring_soon
            })
        
        return Response(list(brands_dict.values()))

# Supplier Views
class SupplierListCreateView(generics.ListCreateAPIView):
    queryset = Supplier.objects.all()
    serializer_class = SupplierSerializer

class SupplierDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Supplier.objects.all()
    serializer_class = SupplierSerializer

# Supply Views
class SupplyListCreateView(generics.ListCreateAPIView):
    queryset = Supply.objects.all()
    serializer_class = SupplySerializer

    def get_queryset(self):
        queryset = Supply.objects.all()
        store_id = self.request.query_params.get('store_id')
        supplier_id = self.request.query_params.get('supplier_id')
        
        if store_id:
            queryset = queryset.filter(store_id=store_id)
        
        if supplier_id:
            queryset = queryset.filter(supplier_id=supplier_id)
        
        return queryset

class SupplyDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Supply.objects.all()
    serializer_class = SupplySerializer

# Stock Transfer Views
# views.py - Update StockTransfer views

class StockTransferListCreateView(generics.ListCreateAPIView):
    queryset = StockTransfer.objects.all()
    
    def get_serializer_class(self):
        if self.request.method == 'POST':
            return StockTransferCreateSerializer
        return StockTransferSerializer
    
    def get_queryset(self):
        queryset = StockTransfer.objects.all().select_related(
            'product', 'brand', 'from_store', 'to_store', 'requested_by', 
            'processed_by', 'batch', 'batch__brand', 'batch__brand__product'
        )
        
        status_param = self.request.query_params.get('status')
        store_id = self.request.query_params.get('store_id')
        
        user = self.request.user
        is_admin_manager = (
            user.is_superuser or 
            user.is_pharmacy_store_manager or 
            (hasattr(user, 'user_category') and user.user_category and 
             user.user_category.title in ['manager', 'admin', 'support', 'developer'])
        )
        
        if status_param:
            queryset = queryset.filter(status=status_param)
        
        if store_id and not is_admin_manager:
            queryset = queryset.filter(
                Q(from_store_id=store_id) | Q(to_store_id=store_id)
            )
        
        return queryset
    
    def perform_create(self, serializer):
        serializer.save(requested_by=self.request.user)


class StockTransferDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = StockTransfer.objects.all()
    
    def get_serializer_class(self):
        if self.request.method in ['PUT', 'PATCH']:
            return StockTransferCreateSerializer
        return StockTransferSerializer


@api_view(['POST'])
def honor_transfer(request, pk):
    try:
        transfer = StockTransfer.objects.get(pk=pk)
    except StockTransfer.DoesNotExist:
        return Response({'error': 'Transfer not found'}, status=status.HTTP_404_NOT_FOUND)
    
    serializer = HonorTransferSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    honored_quantity = serializer.validated_data['honored_quantity']
    batch_id = serializer.validated_data['batch_id']
    notes = serializer.validated_data.get('notes', '')
    
    # FIXED: Check if user's store is the FROM store (transferring store)
    # The transferring store has the stock to send
    if not hasattr(request.user, 'pharmacy_store') or request.user.pharmacy_store.id != transfer.from_store.id:
        return Response(
            {'error': 'You are not authorized to honor transfers for this store. Only the transferring store can honor.'}, 
            status=status.HTTP_403_FORBIDDEN
        )
    
    success, message = transfer.honor_transfer(honored_quantity, batch_id, request.user, notes)
    
    if success:
        return Response({
            'message': message,
            'transfer': StockTransferSerializer(transfer).data
        })
    else:
        return Response({'error': message}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
def decline_transfer(request, pk):
    try:
        transfer = StockTransfer.objects.get(pk=pk)
    except StockTransfer.DoesNotExist:
        return Response({'error': 'Transfer not found'}, status=status.HTTP_404_NOT_FOUND)
    
    serializer = DeclineTransferSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    decline_reason = serializer.validated_data['decline_reason']
    
    # FIXED: Check if user's store is the FROM store (transferring store)
    # The transferring store has the right to decline
    if not hasattr(request.user, 'pharmacy_store') or request.user.pharmacy_store.id != transfer.from_store.id:
        return Response(
            {'error': 'You are not authorized to decline transfers for this store. Only the transferring store can decline.'}, 
            status=status.HTTP_403_FORBIDDEN
        )
    
    success, message = transfer.decline_transfer(decline_reason, request.user)
    
    if success:
        return Response({
            'message': message,
            'transfer': StockTransferSerializer(transfer).data
        })
    else:
        return Response({'error': message}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
def get_available_batches_for_transfer(request, transfer_id):
    """
    Get available batches for honoring a transfer request
    """
    try:
        transfer = StockTransfer.objects.get(pk=transfer_id)
    except StockTransfer.DoesNotExist:
        return Response({'error': 'Transfer not found'}, status=status.HTTP_404_NOT_FOUND)
    
    # Check authorization
    if not hasattr(request.user, 'pharmacy_store') or request.user.pharmacy_store.id != transfer.to_store.id:
        return Response({'error': 'Not authorized'}, status=status.HTTP_403_FORBIDDEN)
    
    # Get available batches from source store
    queryset = Batch.objects.filter(
        brand__product=transfer.product,
        inventory__store=transfer.from_store,
        inventory__quantity__gt=0,
        expiry_date__gte=timezone.now().date()
    )
    
    # If specific brand requested, filter by brand
    if transfer.brand:
        queryset = queryset.filter(brand=transfer.brand)
    
    # Annotate with available quantity
    queryset = queryset.annotate(
        available_quantity=F('inventory__quantity')
    ).order_by('expiry_date')
    
    serializer = BatchSerializer(queryset, many=True)
    return Response(serializer.data)


# ========== Inventory Adjustment Views (New) ==========

class StockAdjustmentTypeListCreateView(generics.ListCreateAPIView):
    queryset = StockAdjustmentType.objects.filter(is_active=True)
    serializer_class = StockAdjustmentTypeSerializer
    permission_classes = [IsAuthenticated]


class StockAdjustmentListCreateView(generics.ListCreateAPIView):
    queryset = StockAdjustment.objects.all()
    
    def get_serializer_class(self):
        if self.request.method == 'POST':
            return StockAdjustmentCreateSerializer
        return StockAdjustmentSerializer
    
    def get_queryset(self):
        queryset = StockAdjustment.objects.all().select_related(
            'adjustment_type', 'batch', 'batch__brand', 'batch__brand__product',
            'store', 'created_by'
        )
        
        user = self.request.user
        
        # Filter by store based on user permissions
        store_id = self.request.query_params.get('store_id')
        
        if store_id:
            queryset = queryset.filter(store_id=store_id)
        elif not self._can_see_all_adjustments(user):
            # Regular managers only see their own store's adjustments
            if user.pharmacy_store:
                queryset = queryset.filter(store=user.pharmacy_store)
        
        # Filter by adjustment type
        adjustment_type = self.request.query_params.get('type')
        if adjustment_type:
            queryset = queryset.filter(adjustment_type__code=adjustment_type)
        
        # Filter by date range
        start_date = self.request.query_params.get('start_date')
        end_date = self.request.query_params.get('end_date')
        if start_date and end_date:
            queryset = queryset.filter(date_created__date__range=[start_date, end_date])
        
        return queryset
    
    def _can_see_all_adjustments(self, user):
        return (user.is_superuser or 
                user.is_staff or 
                (hasattr(user, 'user_category') and user.user_category and 
                 user.user_category.title.lower() in ['admin', 'manager']))
    
    def perform_create(self, serializer):
        user = self.request.user
        store = serializer.validated_data.get('store')
        
        # Verify permission again
        if not self._can_adjust_stock(user, store):
            raise PermissionError("You do not have permission to adjust stock at this store")
        
        serializer.save(created_by=user)
    
    def _can_adjust_stock(self, user, store):
        if user.is_superuser or user.is_staff:
            return True
        
        if not user.is_pharmacy_store_manager:
            return False
        
        if user.pharmacy_store and user.pharmacy_store.id == store.id:
            return True
        
        if hasattr(user, 'user_category') and user.user_category:
            if user.user_category.title.lower() in ['admin', 'manager']:
                return True
        
        return False


class StockAdjustmentDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = StockAdjustment.objects.all()
    
    def get_serializer_class(self):
        if self.request.method in ['PUT', 'PATCH']:
            return StockAdjustmentCreateSerializer
        return StockAdjustmentSerializer
    
    def get_queryset(self):
        user = self.request.user
        queryset = StockAdjustment.objects.all()
        
        if not self._can_see_all_adjustments(user):
            if user.pharmacy_store:
                queryset = queryset.filter(store=user.pharmacy_store)
            else:
                queryset = queryset.none()
        
        return queryset
    
    def _can_see_all_adjustments(self, user):
        return (user.is_superuser or 
                user.is_staff or 
                (hasattr(user, 'user_category') and user.user_category and 
                 user.user_category.title.lower() in ['admin', 'manager']))
    
    def perform_update(self, serializer):
        """Prevent updates to completed adjustments"""
        instance = self.get_object()
        if instance.date_created:
            raise PermissionError("Adjustments cannot be modified after creation")
        serializer.save()
    
    def perform_destroy(self, instance):
        """Prevent deletion of adjustments"""
        raise PermissionError("Adjustments cannot be deleted for audit purposes")

# -------------------------------------------------------------------------------------- 

@api_view(['POST'])
def process_stock_adjustment(request, pk):
    """Process (approve and execute) a stock adjustment"""
    try:
        adjustment = StockAdjustment.objects.get(pk=pk)
    except StockAdjustment.DoesNotExist:
        return Response({'error': 'Adjustment not found'}, status=status.HTTP_404_NOT_FOUND)
    
    # Check permission - only managers or admins can approve
    user = request.user
    is_authorized = (
        user.is_superuser or 
        user.is_staff or 
        user.is_pharmacy_store_manager or
        (hasattr(user, 'user_category') and user.user_category and 
         user.user_category.title in ['manager', 'admin'])
    )
    
    if not is_authorized:
        return Response({'error': 'Not authorized to process adjustments'}, 
                       status=status.HTTP_403_FORBIDDEN)
    
    success, message = adjustment.process_adjustment(user)
    
    if success:
        return Response({
            'message': message,
            'adjustment': StockAdjustmentSerializer(adjustment).data
        })
    else:
        return Response({'error': message}, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
def approve_stock_adjustment(request, pk):
    """Approve a stock adjustment (without executing)"""
    try:
        adjustment = StockAdjustment.objects.get(pk=pk)
    except StockAdjustment.DoesNotExist:
        return Response({'error': 'Adjustment not found'}, status=status.HTTP_404_NOT_FOUND)
    
    if adjustment.status != 'pending':
        return Response({'error': f'Adjustment already {adjustment.status}'}, 
                       status=status.HTTP_400_BAD_REQUEST)
    
    adjustment.status = 'approved'
    adjustment.approved_by = request.user
    adjustment.approved_date = timezone.now()
    adjustment.save()
    
    return Response({
        'message': 'Adjustment approved successfully',
        'adjustment': StockAdjustmentSerializer(adjustment).data
    })


# ========== UPDATED PRESCRIPTION VIEWS ==========
class PrescriptionListCreateView(generics.ListCreateAPIView):
    queryset = Prescription.objects.all()
    
    def get_serializer_class(self):
        if self.request.method == 'POST':
            return PrescriptionCreateSerializer
        return PrescriptionSerializer
    
    def get_queryset(self):
        queryset = Prescription.objects.all()
        patient_id = self.request.query_params.get('patient_id')
        status = self.request.query_params.get('status')
        start_date = self.request.query_params.get('start_date')
        end_date = self.request.query_params.get('end_date')
        
        if patient_id:
            queryset = queryset.filter(patient_id=patient_id)
        
        if status:
            status_list = status.split(',')
            queryset = queryset.filter(status__in=status_list)
        
        if start_date and end_date:
            queryset = queryset.filter(date_prescribed__date__range=[start_date, end_date])
        
        return queryset.select_related('patient', 'prescribed_by', 'encounter').prefetch_related(
            Prefetch('details', queryset=PrescriptionDetail.objects.select_related('product'))
        )

class PrescriptionDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Prescription.objects.all()
    serializer_class = PrescriptionSerializer


@api_view(['GET'])
def patient_prescriptions_grouped(request, patient_id):
    """Get patient prescriptions grouped by status for dispensary view"""
    store_id = request.query_params.get('store_id')
    status_filter = request.query_params.get('status', 'pending,in_progress,billed,partly_paid,paid,dispensed')  # Added dispensed
    
    # Base queryset
    prescriptions = Prescription.objects.filter(
        patient_id=patient_id
    ).select_related('prescribed_by').prefetch_related(
        Prefetch('details', queryset=PrescriptionDetail.objects.select_related('product'))
    ).order_by('-date_prescribed')
    
    # Apply status filter if provided
    if status_filter:
        status_list = status_filter.split(',')
        prescriptions = prescriptions.filter(status__in=status_list)
    
    # Group by status
    pending = prescriptions.filter(status='pending')
    in_progress = prescriptions.filter(status='in_progress')
    billed = prescriptions.filter(status='billed')
    partly_paid = prescriptions.filter(status='partly_paid')
    paid = prescriptions.filter(status='paid')
    dispensed = prescriptions.filter(status='dispensed')
    
    serializer_context = {'request': request}
    if store_id:
        serializer_context['store_id'] = store_id
    
    return Response({
        'pending': PrescriptionSerializer(pending, many=True, context=serializer_context).data,
        'in_progress': PrescriptionSerializer(in_progress, many=True, context=serializer_context).data,
        'billed': PrescriptionSerializer(billed, many=True, context=serializer_context).data,
        'partly_paid': PrescriptionSerializer(partly_paid, many=True, context=serializer_context).data,
        'paid': PrescriptionSerializer(paid, many=True, context=serializer_context).data,
        'dispensed': PrescriptionSerializer(dispensed, many=True, context=serializer_context).data
    })


@api_view(['POST'])
def prescription_bill_items(request, pk):
    """Mark prescription items as billed (called by billing app)"""
    try:
        prescription = Prescription.objects.get(pk=pk)
        detail_ids = request.data.get('detail_ids', [])
        
        if not detail_ids:
            return Response({'error': 'No items specified'}, status=status.HTTP_400_BAD_REQUEST)
        
        with transaction.atomic():
            # Update each detail to 'billed' status
            updated = PrescriptionDetail.objects.filter(
                id__in=detail_ids,
                prescription=prescription
            ).update(status='billed')
            
            if updated == 0:
                return Response({'error': 'No items found to bill'}, 
                              status=status.HTTP_400_BAD_REQUEST)
            
            # Update prescription status
            prescription.update_status()
        
        # Return the updated prescription with details
        updated_prescription = Prescription.objects.get(pk=pk)
        serializer = PrescriptionSerializer(updated_prescription)
        
        return Response({
            'message': f'{updated} items billed successfully',
            'prescription': serializer.data
        })
    except Prescription.DoesNotExist:
        return Response({'error': 'Prescription not found'}, status=status.HTTP_404_NOT_FOUND)

@api_view(['POST'])
def prescription_dispense_items(request, pk):
    """Dispense items and create dispensing records"""
    try:
        prescription = Prescription.objects.get(pk=pk)
    except Prescription.DoesNotExist:
        return Response({'error': 'Prescription not found'}, status=status.HTTP_404_NOT_FOUND)
    
    serializer = DispenseRequestSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    store_id = serializer.validated_data['store_id']
    items = serializer.validated_data['items']
    
    try:
        store = PharmacyStore.objects.get(id=store_id, is_bulk_store=False)
    except PharmacyStore.DoesNotExist:
        return Response({'error': 'Store not found or is a bulk store'}, status=status.HTTP_404_NOT_FOUND)
    
    dispensing_records = []
    errors = []
    
    try:
        with transaction.atomic():
            for item in items:
                try:
                    # Get and lock the prescription detail
                    detail = PrescriptionDetail.objects.select_for_update().get(
                        id=item['detail_id'],
                        prescription=prescription,
                        status__in=['paid', 'partly_paid']  # Only paid items can be dispensed
                    )
                    
                    # Get the bill record to know what was billed
                    bill_record = detail.bill_records.filter(
                        batch_id=item['batch_id'],
                        quantity=item['quantity']
                    ).first()
                    
                    if not bill_record:
                        errors.append(f"Item {detail.product.name}: No matching bill record found")
                        continue
                    
                    # Get and lock the batch
                    batch = Batch.objects.select_for_update().get(id=item['batch_id'])
                    
                    # Validate batch matches product
                    if batch.brand.product != detail.product:
                        errors.append(f"Item {detail.product.name}: Selected batch does not match product")
                        continue
                    
                    # Check and update inventory
                    inventory = Inventory.objects.select_for_update().get(
                        batch=batch,
                        store=store
                    )
                    
                    if inventory.quantity < item['quantity']:
                        errors.append(f"Item {detail.product.name}: Insufficient stock. Available: {inventory.quantity}")
                        continue
                    
                    # Validate quantity matches what was billed
                    if item['quantity'] > bill_record.quantity:
                        errors.append(f"Item {detail.product.name}: Cannot dispense more than billed quantity ({bill_record.quantity})")
                        continue
                    
                    # Update inventory
                    inventory.quantity -= item['quantity']
                    inventory.save()
                    
                    # Create dispensing record
                    record = DispensingRecord.objects.create(
                        prescription_detail=detail,
                        store=store,
                        batch=batch,
                        quantity_dispensed=item['quantity'],
                        unit_price=bill_record.unit_price,  # Use price from bill record
                        dispensed_by=request.user
                    )
                    
                    dispensing_records.append(record)
                    
                except PrescriptionDetail.DoesNotExist:
                    errors.append(f"Detail ID {item['detail_id']}: Not found or not paid")
                except Batch.DoesNotExist:
                    errors.append(f"Batch ID {item['batch_id']}: Not found")
                except Inventory.DoesNotExist:
                    errors.append(f"Batch {item['batch_id']}: Not available in this store")
            
            if errors:
                raise ValidationError(errors)
            
            # Update status of all processed details
            for record in dispensing_records:
                detail = record.prescription_detail
                # Calculate total dispensed so far
                total_dispensed = detail.dispensing_records.aggregate(total=Sum('quantity_dispensed'))['total'] or 0
                
                # Check if fully dispensed
                if total_dispensed >= detail.quantity_prescribed:
                    detail.status = 'dispensed'
                    detail.save()
            
            # Update prescription status
            prescription.update_status()
        
        return Response({
            'message': f'Successfully dispensed {len(dispensing_records)} items',
            'records': DispensingRecordSerializer(dispensing_records, many=True).data,
            'errors': errors if errors else None
        }, status=status.HTTP_201_CREATED if not errors else status.HTTP_207_MULTI_STATUS)
        
    except ValidationError as e:
        return Response({'errors': e.messages if hasattr(e, 'messages') else str(e)}, 
                       status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# ========== NEW DISPENSING RECORD VIEWS ==========

@api_view(['GET'])
def patient_prescriptions_list(request):
    """
    Get all patients with active prescriptions for dispensary queue
    GET /api/patient-prescriptions/?store_id=1&status=paid,billed,pending
    """
    store_id = request.query_params.get('store_id')
    status_filter = request.query_params.get('status', 'pending,billed,paid,partly_paid,in_progress')
    
    if not store_id:
        return Response({'error': 'store_id is required'}, status=status.HTTP_400_BAD_REQUEST)
    
    # REMOVE the date filter - show all prescriptions, not just today's
    # Get prescriptions that are NOT dispensed
    prescriptions = Prescription.objects.filter(
        details__isnull=False
    ).exclude(
        status='dispensed'  # Exclude already dispensed
    ).select_related('patient', 'patient__user', 'prescribed_by').distinct()
    
    # Apply status filter - if 'all', show all except dispensed
    if status_filter and status_filter != 'all':
        status_list = status_filter.split(',')
        prescriptions = prescriptions.filter(status__in=status_list)
    
    print(f"Found {prescriptions.count()} prescriptions")  # Debug log
    
    # Group by patient
    patient_dict = {}
    status_priority = {'paid': 0, 'billed': 1, 'partly_paid': 2, 'in_progress': 3, 'pending': 4}
    
    for prescription in prescriptions:
        patient = prescription.patient
        patient_id = patient.id
        patient_number = patient.patient_number
        
        if patient_id not in patient_dict:
            # Get patient name from user
            user = patient.user
            if user.other_name:
                patient_name = f"{user.first_name} {user.other_name} {user.last_name}"
            else:
                patient_name = f"{user.first_name} {user.last_name}"
            
            patient_dict[patient_id] = {
                'id': patient_id,
                'name': patient_name,
                'hospital_number': str(patient_number) if patient_number else str(patient_id),
                'phone': patient.phone or 'N/A',
                'prescriptions': [],
                'status': 'pending'
            }
        
        # Get prescription details
        prescription_details = PrescriptionDetail.objects.filter(
            prescription=prescription
        ).select_related('product')
        
        details_data = []
        for detail in prescription_details:
            details_data.append({
                'id': detail.id,
                'product': detail.product.id,
                'product_name': detail.product.name,
                'quantity_prescribed': detail.quantity_prescribed,
                'status': detail.status,
                'dose': detail.dose,
                'frequency': detail.frequency,
                'duration': detail.duration,
                'remark': detail.remark
            })
        
        # Add prescription to patient
        prescription_data = {
            'id': prescription.id,
            'status': prescription.status,
            'date_prescribed': prescription.date_prescribed,
            'prescribed_by_name': prescription.prescribed_by.get_full_name() if prescription.prescribed_by else 'Unknown',
            'details': details_data
        }
        
        patient_dict[patient_id]['prescriptions'].append(prescription_data)
        
        # Update patient overall status (highest priority status)
        current_priority = status_priority.get(patient_dict[patient_id]['status'], 5)
        new_priority = status_priority.get(prescription.status, 5)
        if new_priority < current_priority:
            patient_dict[patient_id]['status'] = prescription.status
    
    # Convert to list
    patient_list = list(patient_dict.values())
    
    # Sort by status priority
    status_order = {'paid': 0, 'billed': 1, 'partly_paid': 2, 'in_progress': 3, 'pending': 4}
    patient_list.sort(key=lambda x: status_order.get(x['status'], 5))
    
    print(f"Returning {len(patient_list)} patients")  # Debug log
    
    return Response(patient_list)


@api_view(['GET'])
def patient_prescriptions_detail(request, patient_id):
    """
    Get all prescriptions for a specific patient
    GET /api/patient-prescriptions/{patient_id}/?store_id=1
    """
    store_id = request.query_params.get('store_id')
    
    try:
        patient = Patient.objects.select_related('user').get(id=patient_id)
    except Patient.DoesNotExist:
        return Response({'error': 'Patient not found'}, status=status.HTTP_404_NOT_FOUND)
    
    # Get all prescriptions including dispensed (for history)
    prescriptions = Prescription.objects.filter(
        patient_id=patient_id
    ).select_related('prescribed_by').prefetch_related(
        Prefetch('details', queryset=PrescriptionDetail.objects.select_related('product'))
    ).order_by('-date_prescribed')
    
    # Get patient name from user
    user = patient.user
    if user.other_name:
        patient_name = f"{user.first_name} {user.other_name} {user.last_name}"
    else:
        patient_name = f"{user.first_name} {user.last_name}"
    
    result = []
    for prescription in prescriptions:
        # Get prescription details with bill and dispensing info
        details_data = []
        for detail in prescription.details.all():
            # Check if this detail has been billed
            has_bill = detail.bill_records.exists()
            # Check if this detail has been dispensed
            has_dispense = detail.dispensing_records.exists()
            
            # Get the actual status (prioritize dispensed > paid > billed > pending)
            if has_dispense:
                actual_status = 'dispensed'
            elif detail.status == 'paid':
                actual_status = 'paid'
            elif has_bill:
                actual_status = 'billed'
            else:
                actual_status = detail.status
            
            details_data.append({
                'id': detail.id,
                'product': detail.product.id,
                'product_name': detail.product.name,
                'quantity_prescribed': detail.quantity_prescribed,
                'status': actual_status,
                'dose': detail.dose,
                'frequency': detail.frequency,
                'duration': detail.duration,
                'remark': detail.remark
            })
        
        result.append({
            'id': prescription.id,
            'patient_id': patient.id,
            'patient_name': patient_name,
            'hospital_number': str(patient.id),
            'phone': patient.phone or 'N/A',
            'status': prescription.status,
            'date_prescribed': prescription.date_prescribed,
            'prescribed_by_name': prescription.prescribed_by.get_full_name() if prescription.prescribed_by else 'Unknown',
            'details': details_data
        })
    
    return Response(result)

@api_view(['GET'])
def prescription_detail_available_batches(request, detail_id):
    """
    Get available batches for a prescription detail
    GET /api/prescription-details/{detail_id}/available-batches/?store_id=1
    """
    store_id = request.query_params.get('store_id')
    
    if not store_id:
        return Response({'error': 'store_id is required'}, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        detail = PrescriptionDetail.objects.select_related('product').get(id=detail_id)
    except PrescriptionDetail.DoesNotExist:
        return Response({'error': 'Prescription detail not found'}, status=status.HTTP_404_NOT_FOUND)
    
    # Get available batches for this product in the store
    from django.db.models import F
    from django.utils import timezone
    
    batches = Batch.objects.filter(
        brand__product=detail.product,
        inventory__store_id=store_id,
        inventory__quantity__gt=0,
        expiry_date__gte=timezone.now().date()
    ).annotate(
        available_quantity=F('inventory__quantity')
    ).order_by('expiry_date')  # FIFO: earliest expiry first
    
    # Format response
    result = []
    for batch in batches:
        result.append({
            'batch_id': batch.id,
            'batch_no': batch.batch_no,
            'expiry_date': batch.expiry_date,
            'available_quantity': batch.available_quantity,
            'unit_price': batch.brand.selling_price,
            'brand_name': batch.brand.name,
            'is_expiring_soon': batch.expiry_date and (batch.expiry_date - timezone.now().date()).days <= 30
        })
    
    return Response(result)

class DispensingRecordListCreateView(generics.ListCreateAPIView):
    queryset = DispensingRecord.objects.all()
    serializer_class = DispensingRecordSerializer
    
    def get_queryset(self):
        queryset = DispensingRecord.objects.all()
        prescription_id = self.request.query_params.get('prescription_id')
        patient_id = self.request.query_params.get('patient_id')
        store_id = self.request.query_params.get('store_id')
        date_from = self.request.query_params.get('date_from')
        date_to = self.request.query_params.get('date_to')
        
        if prescription_id:
            queryset = queryset.filter(prescription_detail__prescription_id=prescription_id)
        
        if patient_id:
            queryset = queryset.filter(prescription_detail__prescription__patient_id=patient_id)
        
        if store_id:
            queryset = queryset.filter(store_id=store_id)
        
        if date_from:
            queryset = queryset.filter(date_dispensed__date__gte=date_from)
        
        if date_to:
            queryset = queryset.filter(date_dispensed__date__lte=date_to)
        
        return queryset.select_related(
            'prescription_detail', 'prescription_detail__product', 
            'store', 'batch', 'batch__brand', 'dispensed_by'
        ).order_by('-date_dispensed')
    
    def perform_create(self, serializer):
        # Prevent manual creation through this endpoint
        self.permission_denied(self.request, message="Manual creation not allowed")

class DispensingRecordDetailView(generics.RetrieveAPIView):
    queryset = DispensingRecord.objects.all()
    serializer_class = DispensingRecordSerializer
    
    # Prevent updates/deletes to maintain audit trail integrity
    def put(self, request, *args, **kwargs):
        return Response({'error': 'Updates not allowed'}, status=status.HTTP_405_METHOD_NOT_ALLOWED)
    
    def patch(self, request, *args, **kwargs):
        return Response({'error': 'Updates not allowed'}, status=status.HTTP_405_METHOD_NOT_ALLOWED)
    
    def delete(self, request, *args, **kwargs):
        return Response({'error': 'Deletes not allowed'}, status=status.HTTP_405_METHOD_NOT_ALLOWED)

# ========== DISPENSARY DASHBOARD VIEWS ==========
@api_view(['GET'])
def dispensary_queue(request, store_id):
    """Get dispensary queue for a store"""
    try:
        store = PharmacyStore.objects.get(id=store_id)
    except PharmacyStore.DoesNotExist:
        return Response({'error': 'Store not found'}, status=status.HTTP_404_NOT_FOUND)
    
    # Get prescriptions that are ready for dispensing (have billed items)
    ready_prescriptions = Prescription.objects.filter(
        details__status='paid',  # Only show prescriptions with at least one paid item
        status__in=['paid', 'partly_paid', 'in_progress'] 
    ).select_related('patient', 'prescribed_by').prefetch_related(
        Prefetch('details', 
                 queryset=PrescriptionDetail.objects.filter(status='billed').select_related('product'),
                 to_attr='billable_items')
    ).distinct().order_by('date_prescribed')
    
    # Add available batches info to each detail
    result = []
    for prescription in ready_prescriptions:
        prescription_data = PrescriptionSerializer(prescription, context={'store_id': store_id}).data
        # The available_batches will be populated by the serializer
        result.append(prescription_data)
    
    return Response(result)

# ========== UTILITY VIEWS (Unchanged) ==========
@api_view(['GET'])
def pharmacy_dashboard_overview(request):
    total_products = Product.objects.count()
    total_prescriptions = Prescription.objects.count()
    pending_prescriptions = Prescription.objects.filter(status='pending').count()
    low_stock_items = Inventory.objects.filter(quantity__lte=F('batch__brand__reorder_level')).count()
    
    return Response({
        'total_products': total_products,
        'total_prescriptions': total_prescriptions,
        'pending_prescriptions': pending_prescriptions,
        'low_stock_items': low_stock_items
    })

@api_view(['GET'])
def pharmacy_dashboard_store_inventory(request):
    store_id = request.query_params.get('store_id')
    if not store_id:
        return Response({'error': 'Store ID is required'}, status=status.HTTP_400_BAD_REQUEST)
    
    inventory = Inventory.objects.filter(store_id=store_id).select_related(
        'batch', 'batch__brand', 'batch__brand__product'
    )
    serializer = InventorySerializer(inventory, many=True)
    return Response(serializer.data)

@api_view(['GET'])
def product_stock_report(request, pk):
    try:
        product = Product.objects.get(pk=pk)
    except Product.DoesNotExist:
        return Response({'error': 'Product not found'}, status=status.HTTP_404_NOT_FOUND)
    
    inventory_data = Inventory.objects.filter(
        batch__brand__product=product
    ).values(
        'store__name',
        'batch__brand__name',
        'batch__batch_no'
    ).annotate(
        total_quantity=Sum('quantity')
    ).order_by('store__name', 'batch__brand__name')
    
    return Response({
        'product': ProductSerializer(product).data,
        'inventory_breakdown': list(inventory_data),
        'total_stock': product.total_stock_level,
        'total_value': product.total_value
    })

@api_view(['GET'])
def brand_low_stock(request):
    low_stock_brands = Brand.objects.annotate(
        current_stock=Sum('batches__inventory__quantity')
    ).filter(current_stock__lte=F('reorder_level'))
    
    serializer = BrandSerializer(low_stock_brands, many=True)
    return Response(serializer.data)

@api_view(['GET'])
def product_low_stock(request):
    low_stock_products = Product.objects.filter(
        brands__batches__inventory__quantity__lte=F('brands__reorder_level')
    ).distinct()
    
    serializer = ProductSerializer(low_stock_products, many=True)
    return Response(serializer.data)

@api_view(['GET'])
def inventory_by_store(request, store_id):
    try:
        inventory = Inventory.objects.filter(store_id=store_id).select_related(
            'batch', 'batch__brand', 'batch__brand__product'
        )
        
        inventory_data = []
        for item in inventory:
            inventory_data.append({
                'id': item.id,
                'product_name': item.batch.brand.product.name,
                'brand_name': item.batch.brand.name,
                'batch_no': item.batch.batch_no,
                'quantity': item.quantity,
                'is_low_stock': item.is_low_stock,
                'reorder_level': item.batch.brand.reorder_level,
                'last_updated': item.last_updated,
                'expiry_date': item.batch.expiry_date,
                'is_expired': item.batch.is_expired
            })
        
        return Response(inventory_data)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
def stock_dashboard_stats(request):
    total_products = Product.objects.count()
    total_brands = Brand.objects.count()
    
    low_stock_brands = Brand.objects.annotate(
        current_stock=Sum('batches__inventory__quantity')
    ).filter(current_stock__lte=F('reorder_level')).count()
    
    out_of_stock_brands = Brand.objects.annotate(
        current_stock=Sum('batches__inventory__quantity')
    ).filter(current_stock=0).count()
    
    total_value = sum([
        inv.quantity * inv.batch.brand.cost_price 
        for inv in Inventory.objects.select_related('batch', 'batch__brand')
    ])
    
    return Response({
        'total_products': total_products,
        'total_brands': total_brands,
        'low_stock_brands': low_stock_brands,
        'out_of_stock_brands': out_of_stock_brands,
        'total_inventory_value': total_value,
        'healthy_stock_brands': total_brands - low_stock_brands - out_of_stock_brands
    })

@api_view(['GET'])
def available_batches_for_dispensing(request, product_id, store_id):
    """Get available batches for a product in a store for dispensing"""
    try:
        available_batches = Inventory.objects.filter(
            batch__brand__product_id=product_id,
            store_id=store_id,
            quantity__gt=0,
            batch__expiry_date__gte=timezone.now().date()
        ).select_related('batch', 'batch__brand').order_by('batch__expiry_date')
        
        batch_data = []
        for inventory in available_batches:
            batch_data.append({
                'batch_id': inventory.batch.id,
                'batch_no': inventory.batch.batch_no,
                'brand_name': inventory.batch.brand.name,
                'expiry_date': inventory.batch.expiry_date,
                'available_quantity': inventory.quantity,
                'selling_price': inventory.batch.brand.selling_price,
                'is_expiring_soon': inventory.batch.is_expiring_soon
            })
        
        return Response(batch_data)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

# ========== REMOVED VIEWS (no longer needed) ==========
# The following views have been removed:
# - prescription_dispense (old)
# - dispensary_create_from_prescription
# - dispensary_process_dispensing
# - dispensary_update_quantity
# - dispensary_update_batch
# - dispensary_get_available_batches
# - DispensaryListCreateView
# - DispensaryDetailView
# - DispensaryDetailListCreateView
# - DispensaryDetailRetrieveUpdateView