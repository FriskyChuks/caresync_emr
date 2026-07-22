from django.urls import path
from .views import *

urlpatterns = [
    # ========== STORE TYPES (Unchanged) ==========
    path('store-types/', StoreTypeListCreateView.as_view(), name='store-type-list'),
    path('store-types/<int:pk>/', StoreTypeDetailView.as_view(), name='store-type-detail'),
    
    # ========== PHARMACY STORES (Unchanged) ==========
    path('pharmacy-stores/', PharmacyStoreListCreateView.as_view(), name='pharmacy-store-list'),
    path('pharmacy-stores/<int:pk>/', PharmacyStoreDetailView.as_view(), name='pharmacy-store-detail'),
    path('pharmacy-stores/bulk-stores/', pharmacy_store_bulk_stores, name='pharmacy-store-bulk-stores'),
    path('pharmacy-stores/outlets/', pharmacy_store_outlets, name='pharmacy-store-outlets'),
    
    # ========== DRUGS FORMS (Unchanged) ==========
    path('drugs-forms/', DrugsFormsListCreateView.as_view(), name='drugs-forms-list'),
    path('drugs-forms/<int:pk>/', DrugsFormsDetailView.as_view(), name='drugs-forms-detail'),
    
    # ========== DRUGS TYPES (Unchanged) ==========
    path('drugs-types/', DrugsTypesListCreateView.as_view(), name='drugs-types-list'),
    path('drugs-types/<int:pk>/', DrugsTypesDetailView.as_view(), name='drugs-types-detail'),
    
    # ========== PRODUCTS (Unchanged) ==========
    path('products/', ProductListCreateView.as_view(), name='product-list'),
    path('products/<int:pk>/', ProductDetailView.as_view(), name='product-detail'),
    path('products/<int:pk>/brands/', product_brands, name='product-brands'),
    path('products/<int:pk>/inventory/', product_inventory, name='product-inventory'),
    path('products/<int:pk>/stock-report/', product_stock_report, name='product-stock-report'),
    path('products/<int:pk>/available-brands/<int:store_id>/', product_available_brands, name='product-available-brands'),
    
    # ========== BRANDS (Unchanged) ==========
    path('brands/', BrandListCreateView.as_view(), name='brand-list'),
    path('brands/<int:pk>/', BrandDetailView.as_view(), name='brand-detail'),
    path('brands/low-stock/', brand_low_stock, name='brand-low-stock'),
    
    # ========== BATCHES (Unchanged) ==========
    path('batches/', BatchListCreateView.as_view(), name='batch-list'),
    path('batches/<int:pk>/', BatchDetailView.as_view(), name='batch-detail'),
    
    # ========== INVENTORY (Unchanged) ==========
    path('inventory/', InventoryListCreateView.as_view(), name='inventory-list'),
    path('inventory/<int:pk>/', InventoryDetailView.as_view(), name='inventory-detail'),
    path('inventory/low-stock/', inventory_low_stock, name='inventory-low-stock'),
    path('inventory/store/<int:store_id>/', inventory_by_store, name='inventory-by-store'),

    
    # Stock Adjustment URLs - simplified (no approval endpoints)
    path('adjustment-types/', StockAdjustmentTypeListCreateView.as_view(), name='adjustment-types'),
    path('adjustments/', StockAdjustmentListCreateView.as_view(), name='stock-adjustments'),
    path('adjustments/<int:pk>/', StockAdjustmentDetailView.as_view(), name='stock-adjustment-detail'),
    
    # ========== SUPPLIERS (Unchanged) ==========
    path('suppliers/', SupplierListCreateView.as_view(), name='supplier-list'),
    path('suppliers/<int:pk>/', SupplierDetailView.as_view(), name='supplier-detail'),
    
    # ========== SUPPLY (Unchanged) ==========
    path('supplies/', SupplyListCreateView.as_view(), name='supply-list'),
    path('supplies/<int:pk>/', SupplyDetailView.as_view(), name='supply-detail'),
    
    # ========== STOCK TRANSFERS ==========
    path('stock-transfers/', StockTransferListCreateView.as_view(), name='stock-transfer-list'),
    path('stock-transfers/<int:pk>/', StockTransferDetailView.as_view(), name='stock-transfer-detail'),
    path('stock-transfers/<int:pk>/honor/', honor_transfer, name='honor-transfer'),
    path('stock-transfers/<int:pk>/decline/', decline_transfer, name='decline-transfer'),
    path('stock-transfers/<int:pk>/available-batches/', AvailableBatchesForTransferView.as_view(), name='available-batches'),
    
    # ========== PRESCRIPTIONS (UPDATED - kept same URLs but new functionality) ==========
    path('prescriptions/', PrescriptionListCreateView.as_view(), name='prescription-list'),
    path('prescriptions/<int:pk>/', PrescriptionDetailView.as_view(), name='prescription-detail'),
    # New endpoints (added, not replaced)
    path('prescriptions/patient/<int:patient_id>/grouped/', patient_prescriptions_grouped, name='patient-prescriptions-grouped'),
    path('prescriptions/<int:pk>/bill-items/', prescription_bill_items, name='prescription-bill-items'),
    path('prescriptions/<int:pk>/dispense-items/', prescription_dispense_items, name='prescription-dispense-items'),
    # REMOVED: old dispense endpoint - path('prescriptions/<int:pk>/dispense/', prescription_dispense, name='prescription-dispense'),
    
    # ========== DISPENSING RECORDS (NEW - replaces dispensary endpoints) ==========
    path('dispensing-records/', DispensingRecordListCreateView.as_view(), name='dispensing-record-list'),
    path('dispensing-records/<int:pk>/', DispensingRecordDetailView.as_view(), name='dispensing-record-detail'),
    path('dispensary/queue/<int:store_id>/', dispensary_queue, name='dispensary-queue'),
    
    # Dispensary-specific endpoints (added, not replacements)
    path('patient-prescriptions/', patient_prescriptions_list, name='patient-prescriptions-list'),
    path('patient-prescriptions/<int:patient_id>/', patient_prescriptions_detail, name='patient-prescriptions-detail'),
    path('prescription-details/<int:detail_id>/available-batches/', prescription_detail_available_batches, name='prescription-detail-batches'),
    path('prescriptions/<int:pk>/billed-items/', prescription_billed_items, name='prescription-billed-items'),
    
    # ========== DASHBOARD (Unchanged) ==========
    path('dashboard/overview/', pharmacy_dashboard_overview, name='pharmacy-dashboard-overview'),
    path('dashboard/store-inventory/', pharmacy_dashboard_store_inventory, name='pharmacy-dashboard-store-inventory'),
    path('dashboard/stock-stats/', stock_dashboard_stats, name='stock-dashboard-stats'),
    
    # ========== UTILITY & REPORTS (Unchanged) ==========
    path('products/low-stock/', product_low_stock, name='product-low-stock'),
    path('available-batches/<int:product_id>/<int:store_id>/', available_batches_for_dispensing, name='available-batches'),
]