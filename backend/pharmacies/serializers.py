from rest_framework import serializers
from django.db.models import Q, F, Sum
from django.utils import timezone
from .models import (
    StoreType, PharmacyStore, DrugsForms, DrugsTypes, Product, Brand, Batch,
    Inventory, Supplier, Supply, StockTransfer, Prescription, PrescriptionDetail,
    DispensingRecord, PrescriptionDetailBill, StockAdjustmentType, StockAdjustment
)

# ========== UNCHANGED SERIALIZERS (Keep exactly as they were) ==========
class StoreTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = StoreType
        fields = '__all__'

class PharmacyStoreSerializer(serializers.ModelSerializer):
    store_type_name = serializers.CharField(source='store_type.name', read_only=True)
    
    class Meta:
        model = PharmacyStore
        fields = '__all__'

class DrugsFormsSerializer(serializers.ModelSerializer):
    class Meta:
        model = DrugsForms
        fields = '__all__'

class DrugsTypesSerializer(serializers.ModelSerializer):
    class Meta:
        model = DrugsTypes
        fields = '__all__'

class BrandSerializer(serializers.ModelSerializer):
    is_low_stock = serializers.BooleanField(read_only=True)
    total_value = serializers.DecimalField(max_digits=12, decimal_places=2, read_only=True)
    stock_level = serializers.IntegerField(read_only=True)
    batches = serializers.SerializerMethodField()
    store_stock = serializers.SerializerMethodField()
    batches_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Brand
        fields = '__all__'
    
    def get_batches_count(self, obj):
        return obj.batches.count()
    
    def get_store_stock(self, obj):
        store_id = self.context.get('store_id')
        if store_id:
            total_stock = Inventory.objects.filter(
                batch__brand=obj,
                store_id=store_id
            ).aggregate(total=Sum('quantity'))['total']
            return total_stock or 0
        return 0
    
    def get_batches(self, obj):
        store_id = self.context.get('store_id')
        if store_id:
            batches = obj.batches.filter(
                inventory__store_id=store_id,
                inventory__quantity__gt=0,
                expiry_date__gte=timezone.now().date()
            ).order_by('expiry_date')
            
            batches = batches.annotate(
                stock_in_store=F('inventory__quantity')
            )
        else:
            batches = obj.batches.filter(expiry_date__gte=timezone.now().date()).order_by('expiry_date')
        
        return BatchSerializer(batches, many=True).data


class ProductSerializer(serializers.ModelSerializer):
    drugstype_name = serializers.CharField(source='drugstype.name', read_only=True)
    drugsform_name = serializers.CharField(source='drugsform.name', read_only=True)
    total_stock_level = serializers.SerializerMethodField()
    is_low_stock = serializers.SerializerMethodField()
    
    class Meta:
        model = Product
        fields = ['id', 'name', 'strength', 'drugstype', 'drugstype_name', 
                  'drugsform', 'drugsform_name', 'category', 'description',
                  'total_stock_level', 'is_low_stock', 'date_created', 'created_by']
    
    def get_total_stock_level(self, obj):
        # Get store_id from context if provided
        store_id = self.context.get('store_id')
        if store_id:
            total = Inventory.objects.filter(
                batch__brand__product=obj,
                store_id=store_id
            ).aggregate(total=Sum('quantity'))['total'] or 0
        else:
            total = Inventory.objects.filter(
                batch__brand__product=obj
            ).aggregate(total=Sum('quantity'))['total'] or 0
        return total
    
    def get_is_low_stock(self, obj):
        store_id = self.context.get('store_id')
        total = self.get_total_stock_level(obj)
        
        if store_id:
            # Check if any brand has low stock in this store
            low_stock_exists = Brand.objects.filter(
                product=obj,
                batches__inventory__store_id=store_id,
                batches__inventory__quantity__lte=F('reorder_level')
            ).exists()
            return low_stock_exists or total <= 10
        return total <= 10

class BatchSerializer(serializers.ModelSerializer):
    brand_name = serializers.CharField(source='brand.name', read_only=True)
    product_name = serializers.CharField(source='brand.product.name', read_only=True)
    available_quantity = serializers.IntegerField(read_only=True, required=False)
    expiry_status = serializers.SerializerMethodField()
    is_expired = serializers.BooleanField(read_only=True)
    is_expiring_soon = serializers.BooleanField(read_only=True)
    total_stock = serializers.SerializerMethodField()
    stock_by_store = serializers.SerializerMethodField()
    
    class Meta:
        model = Batch
        fields = '__all__'
    
    def get_expiry_status(self, obj):
        if obj.is_expired:
            return 'expired'
        elif obj.is_expiring_soon:
            return 'expiring_soon'
        return 'valid'
    
    def get_total_stock(self, obj):
        return Inventory.objects.filter(batch=obj).aggregate(total=Sum('quantity'))['total'] or 0
    
    def get_stock_by_store(self, obj):
        store_id = self.context.get('store_id')
        if store_id:
            return Inventory.objects.filter(batch=obj, store_id=store_id).aggregate(total=Sum('quantity'))['total'] or 0
        return {}

class InventorySerializer(serializers.ModelSerializer):
    batch_details = BatchSerializer(source='batch', read_only=True)
    store_name = serializers.CharField(source='store.name', read_only=True)
    product_name = serializers.CharField(source='batch.brand.product.name', read_only=True)
    brand_name = serializers.CharField(source='batch.brand.name', read_only=True)
    is_low_stock = serializers.BooleanField(read_only=True)
    
    class Meta:
        model = Inventory
        fields = '__all__'

class SupplierSerializer(serializers.ModelSerializer):
    class Meta:
        model = Supplier
        fields = '__all__'

class SupplySerializer(serializers.ModelSerializer):
    batch_details = BatchSerializer(source='batch', read_only=True)
    supplier_name = serializers.CharField(source='supplier.company_name', read_only=True)
    store_name = serializers.CharField(source='store.name', read_only=True)
    
    class Meta:
        model = Supply
        fields = '__all__'

# serializers.py - Update StockTransferSerializer

class StockTransferSerializer(serializers.ModelSerializer):
    from_store_name = serializers.CharField(source='from_store.name', read_only=True)
    to_store_name = serializers.CharField(source='to_store.name', read_only=True)
    requested_by_name = serializers.CharField(source='requested_by.get_full_name', read_only=True)
    processed_by_name = serializers.CharField(source='processed_by.get_full_name', read_only=True)
    
    # Product and Brand details
    product_name = serializers.CharField(source='product.name', read_only=True)
    product_strength = serializers.CharField(source='product.strength', read_only=True)
    brand_name = serializers.CharField(source='brand.name', read_only=True, allow_null=True)
    
    # Batch details (only when honored)
    batch_details = BatchSerializer(source='batch', read_only=True)
    batch_no = serializers.CharField(source='batch.batch_no', read_only=True, allow_null=True)
    
    class Meta:
        model = StockTransfer
        fields = '__all__'
        read_only_fields = ('date_requested', 'date_processed', 'processed_by', 'honored_quantity', 'batch')

class StockTransferCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating transfer requests (no batch required)"""
    
    class Meta:
        model = StockTransfer
        fields = ['product', 'brand', 'from_store', 'to_store', 'requested_quantity', 'request_reason', 'requested_by']
    
    def validate(self, data):
        # Brand validation if provided
        if data.get('brand') and data['brand'].product != data['product']:
            raise serializers.ValidationError({
                'brand': 'Selected brand does not belong to the selected product'
            })
        
        # Prevent self-transfer
        if data['from_store'] == data['to_store']:
            raise serializers.ValidationError({
                'to_store': 'Source and destination stores cannot be the same'
            })
        
        return data
    
    def create(self, validated_data):
        return StockTransfer.objects.create(**validated_data)


class HonorTransferSerializer(serializers.Serializer):
    """Serializer for honoring a transfer request"""
    honored_quantity = serializers.IntegerField(min_value=1)
    batch_id = serializers.IntegerField(min_value=1)
    notes = serializers.CharField(required=False, allow_blank=True)


class DeclineTransferSerializer(serializers.Serializer):
    """Serializer for declining a transfer request"""
    decline_reason = serializers.CharField(required=True)


# ========== Inventory Adjustment Serializers (unchanged) ==========

class StockAdjustmentTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = StockAdjustmentType
        fields = '__all__'

class StockAdjustmentSerializer(serializers.ModelSerializer):
    adjustment_type_name = serializers.CharField(source='adjustment_type.name', read_only=True)
    adjustment_type_code = serializers.CharField(source='adjustment_type.code', read_only=True)
    direction = serializers.CharField(source='adjustment_type.direction', read_only=True)
    
    batch_no = serializers.CharField(source='batch.batch_no', read_only=True)
    brand_name = serializers.CharField(source='batch.brand.name', read_only=True)
    product_name = serializers.CharField(source='batch.brand.product.name', read_only=True)
    store_name = serializers.CharField(source='store.name', read_only=True)
    
    created_by_name = serializers.CharField(source='created_by.get_full_name', read_only=True)
    
    class Meta:
        model = StockAdjustment
        fields = '__all__'
        read_only_fields = ('reference_number', 'total_value', 'date_created')


class StockAdjustmentCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = StockAdjustment
        fields = ['adjustment_type', 'batch', 'store', 'quantity', 'unit_cost', 'reason', 'notes']
    
    def validate(self, data):
        # Validate quantity is positive
        if data['quantity'] <= 0:
            raise serializers.ValidationError({'quantity': 'Quantity must be greater than 0'})
        
        # Validate unit cost
        if data['unit_cost'] <= 0:
            raise serializers.ValidationError({'unit_cost': 'Unit cost must be greater than 0'})
        
        # Check if user has permission to adjust stock at this store
        request = self.context.get('request')
        user = request.user
        
        if not self._can_adjust_stock(user, data['store']):
            raise serializers.ValidationError({
                'store': 'You do not have permission to adjust stock at this store'
            })
        
        # For outgoing adjustments, check sufficient stock
        adjustment_type = data['adjustment_type']
        batch = data['batch']
        store = data['store']
        
        if adjustment_type.direction == 'out':
            from .models import Inventory
            try:
                inventory = Inventory.objects.get(batch=batch, store=store)
                if inventory.quantity < data['quantity']:
                    raise serializers.ValidationError({
                        'quantity': f'Insufficient stock. Available: {inventory.quantity}, Requested: {data["quantity"]}'
                    })
            except Inventory.DoesNotExist:
                raise serializers.ValidationError({
                    'quantity': 'No stock found for this batch at the selected store'
                })
        
        return data
    
    def _can_adjust_stock(self, user, store):
        """Check if user can adjust stock at the given store"""
        # Superusers and staff can adjust any store
        if user.is_superuser or user.is_staff:
            return True
        
        # Must be a pharmacy store manager
        if not user.is_pharmacy_store_manager:
            return False
        
        # Manager can only adjust stock at their assigned store
        if user.pharmacy_store and user.pharmacy_store.id == store.id:
            return True
        
        # Admin/manager category users can adjust any store
        if hasattr(user, 'user_category') and user.user_category:
            if user.user_category.title.lower() in ['admin', 'manager']:
                return True
        
        return False  

# ========== UPDATED PRESCRIPTION SERIALIZERS ==========
class PrescriptionDetailSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source='product.name', read_only=True)
    product_strength = serializers.CharField(source='product.strength', read_only=True)
    available_batches = serializers.SerializerMethodField()
    dispensed_quantity = serializers.SerializerMethodField()
    dispensing_records = serializers.SerializerMethodField()
    bill_records = serializers.SerializerMethodField()  # New field
    billed_batch_info = serializers.SerializerMethodField()  # New field
    
    class Meta:
        model = PrescriptionDetail
        fields = '__all__'
    
    def get_available_batches(self, obj):
        """Get available batches for this product"""
        request = self.context.get('request')
        store_id = self.context.get('store_id') or (request.query_params.get('store_id') if request else None)
        
        if not store_id or obj.status != 'billed':
            return []
        
        available_batches = Batch.objects.filter(
            brand__product=obj.product,
            inventory__store_id=store_id,
            inventory__quantity__gt=0,
            expiry_date__gt=timezone.now().date()
        ).annotate(
            available_quantity=F('inventory__quantity')
        ).order_by('expiry_date')
        
        serializer = BatchSerializer(available_batches, many=True)
        return serializer.data
    
    def get_dispensed_quantity(self, obj):
        total = obj.dispensing_records.aggregate(total=Sum('quantity_dispensed'))['total'] or 0
        return total
    
    def get_dispensing_records(self, obj):
        """Return dispensing records for this detail"""
        records = obj.dispensing_records.all().order_by('-date_dispensed')
        from .serializers import DispensingRecordSimpleSerializer
        return DispensingRecordSimpleSerializer(records, many=True).data
    
    def get_bill_records(self, obj):
        """Return bill records for this detail"""
        records = obj.bill_records.all().order_by('-date_created')
        return PrescriptionDetailBillSerializer(records, many=True).data
    
    def get_billed_batch_info(self, obj):
        """Get the batch that was billed for this detail"""
        # First check if there are any dispensing records (already dispensed)
        latest_record = obj.dispensing_records.order_by('-date_dispensed').first()
        if latest_record:
            return {
                'batch': BatchSerializer(latest_record.batch).data,
                'brand': BrandSerializer(latest_record.batch.brand).data,
                'unit_price': str(latest_record.unit_price),
                'quantity': latest_record.quantity_dispensed,
                'status': 'dispensed',
                'date': latest_record.date_dispensed,
                'source': 'dispensing'
            }
        
        # If not dispensed, check for bill records
        latest_bill_record = obj.bill_records.order_by('-date_created').first()
        if latest_bill_record:
            return {
                'batch': BatchSerializer(latest_bill_record.batch).data,
                'brand': BrandSerializer(latest_bill_record.batch.brand).data,
                'unit_price': str(latest_bill_record.unit_price),
                'quantity': latest_bill_record.quantity,
                'status': obj.status,  # This will be 'paid' or 'partly_paid'
                'date': latest_bill_record.date_created,
                'bill_id': latest_bill_record.bill_id,
                'source': 'bill'
            }
        
        return None


class PrescriptionDetailCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = PrescriptionDetail
        exclude = ['prescription']

class PrescriptionSerializer(serializers.ModelSerializer):
    details = PrescriptionDetailSerializer(many=True, read_only=True)
    patient_name = serializers.CharField(source='patient.full_name', read_only=True)
    prescribed_by_name = serializers.CharField(source='prescribed_by.get_full_name', read_only=True)
    
    class Meta:
        model = Prescription
        fields = ['id', 'patient', 'encounter', 'prescribed_by', 'date_prescribed', 
                  'status', 'notes', 'details', 'prescribed_by_name', 'patient_name']

class PrescriptionCreateSerializer(serializers.ModelSerializer):
    details = PrescriptionDetailCreateSerializer(many=True)
    
    class Meta:
        model = Prescription
        fields = ['patient', 'encounter', 'prescribed_by', 'notes', 'details']
    
    def create(self, validated_data):
        details_data = validated_data.pop('details', [])
        prescription = Prescription.objects.create(**validated_data)
        
        for detail_data in details_data:
            PrescriptionDetail.objects.create(prescription=prescription, **detail_data)
        
        return prescription
    

class PrescriptionDetailBillSerializer(serializers.ModelSerializer):
    batch_details = BatchSerializer(source='batch', read_only=True)
    bill_id = serializers.IntegerField(source='bill.id', read_only=True)
    
    class Meta:
        model = PrescriptionDetailBill
        fields = ['id', 'batch_details', 'quantity', 'unit_price', 'total_price', 
                  'date_created', 'bill_id']

# ========== NEW DISPENSING RECORD SERIALIZERS ==========
class DispensingRecordSimpleSerializer(serializers.ModelSerializer):
    """Simplified serializer for dispensing records to avoid recursion"""
    batch_details = BatchSerializer(source='batch', read_only=True)
    store_name = serializers.CharField(source='store.name', read_only=True)
    
    class Meta:
        model = DispensingRecord
        fields = ['id', 'quantity_dispensed', 'unit_price', 'total_price', 
                  'date_dispensed', 'batch_details', 'store_name']


class DispensingRecordSerializer(serializers.ModelSerializer):
    prescription_detail_info = PrescriptionDetailSerializer(source='prescription_detail', read_only=True)
    store_name = serializers.CharField(source='store.name', read_only=True)
    batch_details = BatchSerializer(source='batch', read_only=True)
    dispensed_by_name = serializers.CharField(source='dispensed_by.get_full_name', read_only=True)
    product_name = serializers.CharField(source='prescription_detail.product.name', read_only=True)
    
    class Meta:
        model = DispensingRecord
        fields = '__all__'
        read_only_fields = ['total_price', 'date_dispensed', 'dispensed_by']


# Optional: Add a serializer for bills if you want to store batch info
class BillMetadataSerializer(serializers.Serializer):
    """For storing batch information in bill metadata"""
    prescription_detail_id = serializers.IntegerField()
    batch_id = serializers.IntegerField()
    batch_no = serializers.CharField()
    brand_id = serializers.IntegerField()
    brand_name = serializers.CharField()
    quantity = serializers.IntegerField()
    unit_price = serializers.DecimalField(max_digits=10, decimal_places=2)
    total_price = serializers.DecimalField(max_digits=12, decimal_places=2)

class DispenseItemSerializer(serializers.Serializer):
    """Serializer for dispensing individual items"""
    detail_id = serializers.IntegerField()
    batch_id = serializers.IntegerField()
    quantity = serializers.IntegerField(min_value=1)

class DispenseRequestSerializer(serializers.Serializer):
    """Serializer for dispensing request"""
    store_id = serializers.IntegerField()
    items = DispenseItemSerializer(many=True)

# ========== RETAINED BUT MARKED FOR REMOVAL (commented out) ==========
# The following serializers are no longer needed:
# - DispensarySerializer
# - DispensaryCreateSerializer
# - DispensaryDetailSerializer
# - BatchSelectionSerializer