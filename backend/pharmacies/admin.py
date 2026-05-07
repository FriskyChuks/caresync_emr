from django.contrib import admin
from django.db.models import Sum, F
from django.utils.html import format_html
from django.urls import reverse
from django.utils import timezone
from .models import (
    StoreType, PharmacyStore, DrugsForms, DrugsTypes, Product, Brand, Batch,
    Inventory, Supplier, Supply, StockTransfer, Prescription, PrescriptionDetail,
    DispensingRecord, PrescriptionDetailBill
)


# ========== STORE MANAGEMENT ==========
@admin.register(StoreType)
class StoreTypeAdmin(admin.ModelAdmin):
    list_display = ['id', 'name', 'description']
    search_fields = ['name']
    list_display_links = ['name']


@admin.register(PharmacyStore)
class PharmacyStoreAdmin(admin.ModelAdmin):
    list_display = ['id', 'name', 'store_type', 'is_bulk_store', 'is_active', 'location', 'date_created']
    list_filter = ['store_type', 'is_bulk_store', 'is_active']
    search_fields = ['name', 'location']
    list_editable = ['is_active']
    list_display_links = ['name']
    fieldsets = (
        ('Basic Information', {
            'fields': ('name', 'store_type', 'location')
        }),
        ('Status', {
            'fields': ('is_active', 'is_bulk_store')
        }),
    )


# ========== PRODUCT CATALOG ==========
@admin.register(DrugsForms)
class DrugsFormsAdmin(admin.ModelAdmin):
    list_display = ['id', 'name']
    search_fields = ['name']


@admin.register(DrugsTypes)
class DrugsTypesAdmin(admin.ModelAdmin):
    list_display = ['id', 'name']
    search_fields = ['name']


class BrandInlineAdmin(admin.TabularInline):
    model = Brand
    extra = 0
    fields = ['name', 'barcode', 'cost_price', 'selling_price', 'reorder_level']
    show_change_link = True


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ['id', 'name', 'strength', 'drugstype', 'drugsform', 'category', 'total_stock', 'low_stock_status', 'created_by', 'date_created']
    list_filter = ['category', 'drugstype', 'drugsform', 'date_created']
    search_fields = ['name', 'strength', 'description']
    list_select_related = ['drugstype', 'drugsform', 'created_by']
    inlines = [BrandInlineAdmin]
    readonly_fields = ['date_created', 'total_stock_display']
    
    def total_stock(self, obj):
        total = obj.total_stock_level
        color = 'green' if total > 100 else 'orange' if total > 10 else 'red'
        return format_html(f'<span style="color: {color}; font-weight: bold;">{total}</span>')
    total_stock.short_description = 'Total Stock'
    
    def low_stock_status(self, obj):
        total = obj.total_stock_level
        if total == 0:
            return format_html('<span style="color: red;">⚠️ Out of Stock</span>')
        elif total <= 10:
            return format_html('<span style="color: orange;">⚠️ Low Stock</span>')
        return format_html('<span style="color: green;">✓ In Stock</span>')
    low_stock_status.short_description = 'Stock Status'
    
    def total_stock_display(self, obj):
        return obj.total_stock_level
    total_stock_display.short_description = 'Total Stock Level'


class BatchInlineAdmin(admin.TabularInline):
    model = Batch
    extra = 0
    fields = ['batch_no', 'production_date', 'expiry_date', 'stock_overview']
    readonly_fields = ['stock_overview']
    
    def stock_overview(self, obj):
        if obj.id:
            total = Inventory.objects.filter(batch=obj).aggregate(total=Sum('quantity'))['total'] or 0
            return format_html(f'<strong>{total}</strong> units across stores')
        return '-'
    stock_overview.short_description = 'Stock Overview'


@admin.register(Brand)
class BrandAdmin(admin.ModelAdmin):
    list_display = ['id', 'name', 'product_name', 'barcode', 'cost_price', 'selling_price', 'markup_percentage', 'reorder_level', 'total_stock', 'stock_status']
    list_filter = ['product__category', 'product__drugstype', 'date_created']
    search_fields = ['name', 'barcode', 'product__name']
    list_select_related = ['product', 'created_by']
    inlines = [BatchInlineAdmin]
    readonly_fields = ['date_created', 'total_stock_display']
    
    def product_name(self, obj):
        return obj.product.name
    product_name.short_description = 'Product'
    product_name.admin_order_field = 'product__name'
    
    def markup_percentage(self, obj):
        if obj.cost_price > 0:
            markup = ((obj.selling_price - obj.cost_price) / obj.cost_price) * 100
            color = 'green' if markup <= 50 else 'orange' if markup <= 100 else 'red'
            return format_html(f'<span style="color: {color};">{markup:.1f}%</span>')
        return '-'
    markup_percentage.short_description = 'Markup'
    
    def total_stock(self, obj):
        total = obj.stock_level
        color = 'green' if total > obj.reorder_level else 'red'
        return format_html(f'<span style="color: {color}; font-weight: bold;">{total}</span>')
    total_stock.short_description = 'Stock'
    
    def stock_status(self, obj):
        total = obj.stock_level
        if total == 0:
            return format_html('<span style="color: red;">🔴 Out of Stock</span>')
        elif total <= obj.reorder_level:
            return format_html('<span style="color: orange;">🟡 Low Stock</span>')
        return format_html('<span style="color: green;">🟢 In Stock</span>')
    stock_status.short_description = 'Status'
    
    def total_stock_display(self, obj):
        total = Inventory.objects.filter(batch__brand=obj).aggregate(total=Sum('quantity'))['total'] or 0
        return f"{total} units"
    total_stock_display.short_description = 'Total Stock'


@admin.register(Batch)
class BatchAdmin(admin.ModelAdmin):
    list_display = ['id', 'batch_no', 'brand_name', 'product_name', 'expiry_date', 'expiry_status', 'total_stock', 'store_count', 'date_created']
    list_filter = ['expiry_date', 'date_created', 'brand__product__category']
    search_fields = ['batch_no', 'brand__name', 'brand__product__name']
    list_select_related = ['brand', 'brand__product', 'created_by']
    readonly_fields = ['date_created', 'is_expired', 'is_expiring_soon']
    
    def brand_name(self, obj):
        return obj.brand.name
    brand_name.short_description = 'Brand'
    brand_name.admin_order_field = 'brand__name'
    
    def product_name(self, obj):
        return obj.brand.product.name
    product_name.short_description = 'Product'
    product_name.admin_order_field = 'brand__product__name'
    
    def expiry_status(self, obj):
        if obj.is_expired:
            return format_html('<span style="color: red;">🔴 Expired</span>')
        elif obj.is_expiring_soon:
            days_left = (obj.expiry_date - timezone.now().date()).days
            return format_html(f'<span style="color: orange;">🟡 Expiring Soon ({days_left} days)</span>')
        return format_html('<span style="color: green;">🟢 Valid</span>')
    expiry_status.short_description = 'Status'
    
    def total_stock(self, obj):
        total = Inventory.objects.filter(batch=obj).aggregate(total=Sum('quantity'))['total'] or 0
        return total
    total_stock.short_description = 'Total Stock'
    
    def store_count(self, obj):
        count = Inventory.objects.filter(batch=obj).count()
        return count
    store_count.short_description = 'Stores'


# ========== INVENTORY ==========
@admin.register(Inventory)
class InventoryAdmin(admin.ModelAdmin):
    list_display = ['id', 'product_name', 'brand_name', 'batch_no', 'store', 'quantity', 'low_stock_indicator', 'last_updated']
    list_filter = ['store', 'batch__brand__product__category', 'last_updated']
    search_fields = ['batch__batch_no', 'batch__brand__name', 'batch__brand__product__name', 'store__name']
    list_select_related = ['batch', 'batch__brand', 'batch__brand__product', 'store']
    readonly_fields = ['last_updated']
    
    def product_name(self, obj):
        return obj.batch.brand.product.name
    product_name.short_description = 'Product'
    product_name.admin_order_field = 'batch__brand__product__name'
    
    def brand_name(self, obj):
        return obj.batch.brand.name
    brand_name.short_description = 'Brand'
    brand_name.admin_order_field = 'batch__brand__name'
    
    def batch_no(self, obj):
        return obj.batch.batch_no
    batch_no.short_description = 'Batch No'
    batch_no.admin_order_field = 'batch__batch_no'
    
    def low_stock_indicator(self, obj):
        if obj.quantity == 0:
            return format_html('<span style="color: red;">🔴 Out of Stock</span>')
        elif obj.is_low_stock:
            return format_html(f'<span style="color: orange;">🟡 Low Stock ({obj.quantity}/{obj.batch.brand.reorder_level})</span>')
        return format_html('<span style="color: green;">🟢 In Stock</span>')
    low_stock_indicator.short_description = 'Stock Status'


# ========== SUPPLY CHAIN ==========
@admin.register(Supplier)
class SupplierAdmin(admin.ModelAdmin):
    list_display = ['id', 'company_name', 'contact_person', 'contact_phone', 'company_email', 'date_created']
    search_fields = ['company_name', 'contact_person', 'company_email']
    list_filter = ['date_created']


class SupplyInlineAdmin(admin.TabularInline):
    model = Supply
    extra = 0
    fields = ['batch', 'quantity_supplied', 'supply_price', 'date_supplied']
    readonly_fields = ['date_supplied']


@admin.register(Supply)
class SupplyAdmin(admin.ModelAdmin):
    list_display = ['id', 'batch_info', 'supplier_name', 'store', 'quantity_supplied', 'supply_price', 'total_value', 'date_supplied', 'created_by']
    list_filter = ['date_supplied', 'store', 'supplier']
    search_fields = ['batch__batch_no', 'batch__brand__name', 'batch__brand__product__name', 'supplier__company_name']
    list_select_related = ['batch', 'batch__brand', 'supplier', 'store', 'created_by']
    readonly_fields = ['date_supplied']
    
    def batch_info(self, obj):
        return format_html(
            f'<strong>{obj.batch.brand.name}</strong><br><small>{obj.batch.batch_no}</small>'
        )
    batch_info.short_description = 'Batch'
    
    def supplier_name(self, obj):
        return obj.supplier.company_name
    supplier_name.short_description = 'Supplier'
    supplier_name.admin_order_field = 'supplier__company_name'
    
    def total_value(self, obj):
        total = obj.quantity_supplied * obj.supply_price
        return format_html(f'₦{total:,.2f}')
    total_value.short_description = 'Total Value'


# ========== STOCK TRANSFER ==========
@admin.register(StockTransfer)
class StockTransferAdmin(admin.ModelAdmin):
    list_display = ['id', 'batch_info', 'from_store', 'to_store', 'requested_qty', 'honored_qty', 'status_indicator', 'date_requested', 'date_processed']
    list_filter = ['status', 'date_requested', 'from_store', 'to_store']
    search_fields = ['batch__batch_no', 'batch__brand__name', 'request_reason', 'decline_reason']
    list_select_related = ['batch', 'batch__brand', 'from_store', 'to_store', 'requested_by', 'processed_by']
    readonly_fields = ['date_requested', 'date_processed']
    
    def batch_info(self, obj):
        return format_html(
            f'<strong>{obj.batch.brand.name}</strong><br><small>{obj.batch.batch_no}</small>'
        )
    batch_info.short_description = 'Batch'
    
    def requested_qty(self, obj):
        return obj.requested_quantity
    requested_qty.short_description = 'Requested'
    
    def honored_qty(self, obj):
        if obj.status == 'honored':
            return format_html(f'<strong>{obj.honored_quantity}</strong>')
        elif obj.status == 'partially_honored':
            return format_html(f'<span style="color: orange;">{obj.honored_quantity}/{obj.requested_quantity}</span>')
        return '-'
    honored_qty.short_description = 'Honored'
    
    def status_indicator(self, obj):
        colors = {
            'requested': ('blue', '🟡 Requested'),
            'honored': ('green', '✅ Honored'),
            'partially_honored': ('orange', '⚠️ Partially Honored'),
            'declined': ('red', '❌ Declined')
        }
        color, text = colors.get(obj.status, ('gray', obj.status))
        return format_html(f'<span style="color: {color};">{text}</span>')
    status_indicator.short_description = 'Status'


# ========== PRESCRIPTION MANAGEMENT ==========
class PrescriptionDetailInlineAdmin(admin.TabularInline):
    model = PrescriptionDetail
    extra = 0
    fields = ['product', 'quantity_prescribed', 'status', 'remark']
    readonly_fields = ['status']
    can_delete = False


@admin.register(Prescription)
class PrescriptionAdmin(admin.ModelAdmin):
    list_display = ['id', 'patient_link', 'prescribed_by', 'date_prescribed', 'item_count', 'status_indicator', 'billed_amount']
    list_filter = ['status', 'date_prescribed']
    search_fields = ['patient__first_name', 'patient__last_name', 'patient__hospital_number', 'prescribed_by__email']
    list_select_related = ['patient', 'prescribed_by', 'encounter']
    inlines = [PrescriptionDetailInlineAdmin]
    readonly_fields = ['date_prescribed']
    
    def patient_link(self, obj):
        url = reverse('admin:patients_patient_change', args=[obj.patient.id])
        return format_html(f'<a href="{url}">{obj.patient}</a>')
    patient_link.short_description = 'Patient'
    
    def item_count(self, obj):
        count = obj.details.count()
        return count
    item_count.short_description = 'Items'
    
    def status_indicator(self, obj):
        colors = {
            'pending': ('gray', '⏳ Pending'),
            'in_progress': ('blue', '🔄 In Progress'),
            'billed': ('orange', '💰 Billed'),
            'partly_paid': ('yellow', '💳 Partly Paid'),
            'paid': ('green', '✅ Paid'),
            'dispensed': ('green', '🎁 Dispensed'),
            'cancelled': ('red', '❌ Cancelled')
        }
        color, text = colors.get(obj.status, ('gray', obj.status))
        return format_html(f'<span style="color: {color}; font-weight: bold;">{text}</span>')
    status_indicator.short_description = 'Status'
    
    def billed_amount(self, obj):
        # Calculate total billed amount from bill records
        total = PrescriptionDetailBill.objects.filter(
            prescription_detail__prescription=obj
        ).aggregate(total=Sum('total_price'))['total']
        if total:
            return format_html(f'₦{total:,.2f}')
        return '₦0.00'
    billed_amount.short_description = 'Billed Amount'


@admin.register(PrescriptionDetail)
class PrescriptionDetailAdmin(admin.ModelAdmin):
    list_display = ['id', 'prescription_id', 'product_name', 'quantity_prescribed', 'dispensed_qty', 'status_indicator', 'remark']
    list_filter = ['status', 'prescription__date_prescribed']
    search_fields = ['product__name', 'prescription__patient__first_name', 'prescription__patient__last_name']
    list_select_related = ['prescription', 'product']
    readonly_fields = ['status']
    
    def product_name(self, obj):
        return obj.product.name
    product_name.short_description = 'Product'
    product_name.admin_order_field = 'product__name'
    
    def dispensed_qty(self, obj):
        total = obj.dispensing_records.aggregate(total=Sum('quantity_dispensed'))['total'] or 0
        return format_html(f'{total}/{obj.quantity_prescribed}')
    dispensed_qty.short_description = 'Dispensed'
    
    def status_indicator(self, obj):
        colors = {
            'pending': ('gray', '⏳ Pending'),
            'billed': ('orange', '💰 Billed'),
            'paid': ('green', '✅ Paid'),
            'dispensed': ('green', '🎁 Dispensed'),
            'cancelled': ('red', '❌ Cancelled')
        }
        color, text = colors.get(obj.status, ('gray', obj.status))
        return format_html(f'<span style="color: {color};">{text}</span>')
    status_indicator.short_description = 'Status'


@admin.register(PrescriptionDetailBill)
class PrescriptionDetailBillAdmin(admin.ModelAdmin):
    list_display = ['id', 'prescription_detail_link', 'bill_link', 'batch_info', 'quantity', 'unit_price', 'total_price', 'date_created']
    list_filter = ['date_created']
    search_fields = ['prescription_detail__product__name', 'batch__batch_no', 'bill__id']
    list_select_related = ['prescription_detail', 'prescription_detail__product', 'batch', 'batch__brand', 'bill']
    readonly_fields = ['date_created']
    
    def prescription_detail_link(self, obj):
        url = reverse('admin:pharmacies_prescriptiondetail_change', args=[obj.prescription_detail.id])
        return format_html(f'<a href="{url}">{obj.prescription_detail.product.name}</a>')
    prescription_detail_link.short_description = 'Item'
    
    def bill_link(self, obj):
        url = reverse('admin:bills_bill_change', args=[obj.bill.id])
        return format_html(f'<a href="{url}">Bill #{obj.bill.id}</a>')
    bill_link.short_description = 'Bill'
    
    def batch_info(self, obj):
        return format_html(
            f'<strong>{obj.batch.brand.name}</strong><br><small>{obj.batch.batch_no}</small>'
        )
    batch_info.short_description = 'Batch'
    
    def unit_price(self, obj):
        return format_html(f'₦{obj.unit_price:,.2f}')
    unit_price.short_description = 'Unit Price'
    
    def total_price(self, obj):
        return format_html(f'<strong>₦{obj.total_price:,.2f}</strong>')
    total_price.short_description = 'Total'


# ========== DISPENSING AUDIT ==========
@admin.register(DispensingRecord)
class DispensingRecordAdmin(admin.ModelAdmin):
    list_display = ['id', 'prescription_detail_info', 'store', 'batch_info', 'quantity_dispensed', 'unit_price', 'total_price', 'dispensed_by', 'date_dispensed']
    list_filter = ['date_dispensed', 'store']
    search_fields = ['prescription_detail__product__name', 'batch__batch_no', 'dispensed_by__email']
    list_select_related = ['prescription_detail', 'prescription_detail__product', 'store', 'batch', 'batch__brand', 'dispensed_by']
    readonly_fields = ['date_dispensed', 'dispensed_by']
    
    def prescription_detail_info(self, obj):
        url = reverse('admin:pharmacies_prescriptiondetail_change', args=[obj.prescription_detail.id])
        patient_name = obj.prescription_detail.prescription.patient.full_name
        return format_html(
            f'<a href="{url}">{obj.prescription_detail.product.name}</a><br><small>{patient_name}</small>'
        )
    prescription_detail_info.short_description = 'Item'
    
    def batch_info(self, obj):
        return format_html(
            f'<strong>{obj.batch.brand.name}</strong><br><small>{obj.batch.batch_no}</small>'
        )
    batch_info.short_description = 'Batch'
    
    def unit_price(self, obj):
        return format_html(f'₦{obj.unit_price:,.2f}')
    unit_price.short_description = 'Unit Price'
    
    def total_price(self, obj):
        return format_html(f'<strong>₦{obj.total_price:,.2f}</strong>')
    total_price.short_description = 'Total'
    
    def has_add_permission(self, request):
        return False  # Dispensing records are created programmatically only
    
    def has_delete_permission(self, request, obj=None):
        return False  # Audit trail - cannot delete
    
    def has_change_permission(self, request, obj=None):
        return False  # Audit trail - cannot modify