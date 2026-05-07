from django.db import models
from django.utils import timezone
from django.db import transaction
from django.db.models import Sum, Q, F
from django.core.exceptions import ValidationError

from encounters.models import EncounterRoute
from accounts.models import CustomUser
from patients.models import Patient

# ========== STORE MANAGEMENT ==========
class StoreType(models.Model):
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True, null=True)
    def __str__(self): return self.name

class PharmacyStore(models.Model):
    name = models.CharField(max_length=100, unique=True)
    store_type = models.ForeignKey(StoreType, on_delete=models.CASCADE)
    location = models.CharField(max_length=200, blank=True, null=True)
    is_active = models.BooleanField(default=True)
    is_bulk_store = models.BooleanField(default=False)
    date_created = models.DateTimeField(auto_now_add=True)
    def __str__(self): return f"{self.name} ({self.store_type})"

# ========== PRODUCT CATALOG ==========
class DrugsForms(models.Model):
    name = models.CharField(max_length=100, unique=True)
    def __str__(self): return self.name

class DrugsTypes(models.Model):
    name = models.CharField(max_length=100, unique=True)
    def __str__(self): return self.name

class Product(models.Model):
    STATUS_CHOICES = [('drugs', 'Drugs'), ('consumables', 'Consumables')]
    drugstype = models.ForeignKey(DrugsTypes, on_delete=models.CASCADE, related_name="products_drugstype")
    drugsform = models.ForeignKey(DrugsForms, null=True, blank=True, on_delete=models.CASCADE, related_name="products_drugsform")
    category = models.CharField(max_length=100, choices=STATUS_CHOICES, default='drugs')
    name = models.CharField(max_length=100, unique=True)
    strength = models.CharField(max_length=50)
    description = models.TextField(blank=True, null=True)
    date_created = models.DateTimeField(auto_now_add=True)
    created_by = models.ForeignKey(CustomUser, on_delete=models.CASCADE)

    @property
    def total_stock_level(self):
        return Inventory.objects.filter(batch__brand__product=self).aggregate(total=Sum('quantity'))['total'] or 0

    def __str__(self):
        form_name = self.drugsform.name if self.drugsform else ""
        return f"{self.name} {self.strength} {form_name}".strip()

class Brand(models.Model):
    name = models.CharField(max_length=100)
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name="brands")
    barcode = models.CharField(max_length=100, null=True, blank=True)
    cost_price = models.DecimalField(max_digits=10, decimal_places=2)
    selling_price = models.DecimalField(max_digits=10, decimal_places=2)
    unit_of_sale = models.PositiveIntegerField(default=1)
    reorder_level = models.PositiveIntegerField(default=10)
    date_created = models.DateTimeField(auto_now_add=True)
    created_by = models.ForeignKey(CustomUser, on_delete=models.CASCADE)

    class Meta: unique_together = ('name', 'product')

    @property
    def stock_level(self):
        return Inventory.objects.filter(batch__brand=self).aggregate(total=Sum('quantity'))['total'] or 0

    def get_stock_by_store(self, store):
        return Inventory.objects.filter(batch__brand=self, store=store).aggregate(total=Sum('quantity'))['total'] or 0

    def __str__(self): return f"{self.name} - {self.product.name}"

class Batch(models.Model):
    batch_no = models.CharField(max_length=100, unique=True)
    brand = models.ForeignKey(Brand, on_delete=models.CASCADE, related_name="batches")
    production_date = models.DateField(null=True, blank=True)
    expiry_date = models.DateField(null=True, blank=True)
    date_created = models.DateTimeField(auto_now_add=True)
    created_by = models.ForeignKey(CustomUser, on_delete=models.CASCADE)

    @property
    def is_expired(self):
        if not self.expiry_date: return False
        return self.expiry_date < timezone.now().date()

    @property
    def is_expiring_soon(self):
        if not self.expiry_date: return False
        days = (self.expiry_date - timezone.now().date()).days
        return 0 <= days <= 30

    def __str__(self): return f"{self.batch_no} ({self.brand.name})"

# ========== INVENTORY ==========
class Inventory(models.Model):
    batch = models.ForeignKey(Batch, on_delete=models.CASCADE, related_name="inventory")
    store = models.ForeignKey(PharmacyStore, on_delete=models.CASCADE, related_name="inventory")
    quantity = models.PositiveIntegerField(default=0)
    last_updated = models.DateTimeField(auto_now=True)

    class Meta: 
        unique_together = ('batch', 'store')
        verbose_name_plural = "Inventories"

    @property
    def is_low_stock(self): return self.quantity <= self.batch.brand.reorder_level
    def __str__(self): return f"{self.batch.brand.name} - {self.store.name}: {self.quantity}"

# ========== SUPPLY CHAIN ==========
class Supplier(models.Model):
    contact_person = models.CharField(max_length=100)
    contact_phone = models.CharField(max_length=15)
    company_name = models.CharField(max_length=200, unique=True)  
    company_email = models.EmailField()
    company_url = models.URLField(unique=True, null=True, blank=True)
    company_address = models.CharField(max_length=100, blank=True, null=True)
    date_created = models.DateTimeField(auto_now_add=True)
    created_by = models.ForeignKey(CustomUser, on_delete=models.CASCADE)
    def __str__(self): return self.company_name

class Supply(models.Model):
    batch = models.ForeignKey(Batch, on_delete=models.CASCADE, related_name="supplies")
    supplier = models.ForeignKey(Supplier, on_delete=models.CASCADE, related_name="supplies")
    store = models.ForeignKey(PharmacyStore, on_delete=models.CASCADE, related_name="supplies")
    quantity_supplied = models.PositiveIntegerField()
    supply_price = models.DecimalField(max_digits=10, decimal_places=2)
    date_supplied = models.DateField(auto_now_add=True)
    created_by = models.ForeignKey(CustomUser, on_delete=models.CASCADE)

    def save(self, *args, **kwargs):
        is_new = self.pk is None
        print("self.store.id", self.store.id)
        print("self.store", self.store)
        super().save(*args, **kwargs)
        if is_new:
            inventory, created = Inventory.objects.get_or_create(
                batch=self.batch, store_id=self.store.id,
                defaults={'quantity': self.quantity_supplied}
            )
            if not created:
                inventory.quantity += self.quantity_supplied
                inventory.save()

    def __str__(self): return f"{self.batch.batch_no} - {self.supplier.company_name}"


class StockTransfer(models.Model):
    TRANSFER_STATUS = (
        ('requested', 'Requested'), 
        ('honored', 'Honored'),
        ('partially_honored', 'Partially Honored'), 
        ('declined', 'Declined')
    )
    
    # New fields - Product and Brand (optional)
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name="transfer_requests")
    brand = models.ForeignKey(Brand, on_delete=models.SET_NULL, null=True, blank=True, related_name="transfer_requests")
    
    # Batch becomes optional (only set when honored)
    batch = models.ForeignKey(Batch, on_delete=models.SET_NULL, null=True, blank=True, related_name="transfers")
    
    # Store relations
    from_store = models.ForeignKey(PharmacyStore, on_delete=models.CASCADE, related_name="transfers_out")
    to_store = models.ForeignKey(PharmacyStore, on_delete=models.CASCADE, related_name="transfers_in")
    
    # Quantities
    requested_quantity = models.PositiveIntegerField()
    honored_quantity = models.PositiveIntegerField(default=0)
    
    # Status and reasons
    status = models.CharField(max_length=20, choices=TRANSFER_STATUS, default='requested')
    request_reason = models.TextField(blank=True, null=True)
    decline_reason = models.TextField(blank=True, null=True)
    
    # Timestamps and users
    date_requested = models.DateTimeField(auto_now_add=True)
    date_processed = models.DateTimeField(null=True, blank=True)
    requested_by = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name="transfer_requests")
    processed_by = models.ForeignKey(CustomUser, on_delete=models.SET_NULL, null=True, blank=True, related_name="processed_transfers")

    class Meta:
        ordering = ['-date_requested']

    def clean(self):
        if self.from_store == self.to_store:
            raise ValidationError("Source and destination stores cannot be the same.")
        
        # If brand is specified, ensure it belongs to the product
        if self.brand and self.brand.product != self.product:
            raise ValidationError("Selected brand does not belong to the selected product.")

    def honor_transfer(self, honored_quantity, batch_id, processed_by_user, notes=None):
        """
        Honor the transfer request with a specific batch
        """
        if self.status != 'requested':
            return False, "Transfer has already been processed"
        
        if honored_quantity <= 0:
            return False, "Honored quantity must be greater than 0"
        
        if honored_quantity > self.requested_quantity:
            return False, "Honored quantity cannot exceed requested quantity"
        
        try:
            batch = Batch.objects.get(id=batch_id)
        except Batch.DoesNotExist:
            return False, "Selected batch does not exist"
        
        # Verify batch belongs to the requested product
        if batch.brand.product != self.product:
            return False, "Selected batch does not match the requested product"
        
        # If a specific brand was requested, verify batch matches
        if self.brand and batch.brand != self.brand:
            return False, f"Selected batch brand ({batch.brand.name}) does not match requested brand ({self.brand.name})"
        
        # Check stock availability at source store
        source_inventory = Inventory.objects.filter(batch=batch, store=self.from_store).first()
        if not source_inventory or source_inventory.quantity < honored_quantity:
            available = source_inventory.quantity if source_inventory else 0
            return False, f"Insufficient stock in {self.from_store.name}. Available: {available} units"
        
        try:
            with transaction.atomic():
                # Decrease stock from source store
                source_inventory.quantity -= honored_quantity
                source_inventory.save()
                
                # Increase stock at destination store
                destination_inventory, created = Inventory.objects.get_or_create(
                    batch=batch, 
                    store=self.to_store,
                    defaults={'quantity': honored_quantity}
                )
                if not created:
                    destination_inventory.quantity += honored_quantity
                    destination_inventory.save()
                
                # Update transfer record
                self.batch = batch
                self.honored_quantity = honored_quantity
                self.status = 'partially_honored' if honored_quantity < self.requested_quantity else 'honored'
                self.date_processed = timezone.now()
                self.processed_by = processed_by_user
                if notes:
                    self.request_reason = notes
                self.save()
                
                return True, "Transfer completed successfully"
        except Exception as e:
            return False, f"Error processing transfer: {str(e)}"

    def decline_transfer(self, decline_reason, processed_by_user):
        """
        Decline the transfer request
        """
        if self.status != 'requested':
            return False, "Transfer has already been processed"
        
        if not decline_reason or not decline_reason.strip():
            return False, "Decline reason is required"
        
        self.status = 'declined'
        self.decline_reason = decline_reason
        self.date_processed = timezone.now()
        self.processed_by = processed_by_user
        self.save()
        
        return True, "Transfer declined successfully"

    def __str__(self):
        brand_info = f" - {self.brand.name}" if self.brand else ""
        return f"Transfer #{self.id}: {self.product.name}{brand_info} ({self.requested_quantity} units) from {self.from_store.name} to {self.to_store.name}"


# ========== Inventory Adjustment (Audit Trail) ==========
class StockAdjustmentType(models.Model):
    """Types of stock adjustments"""
    name = models.CharField(max_length=100, unique=True)  # Expired, Damaged, Count Mismatch, etc.
    code = models.CharField(max_length=20, unique=True)   # EXP, DAM, MIS, etc.
    direction = models.CharField(max_length=10, choices=[('in', 'Stock In'), ('out', 'Stock Out')], default='out')
    description = models.TextField(blank=True, null=True)
    is_active = models.BooleanField(default=True)
    
    class Meta:
        ordering = ['name']
        verbose_name = "Stock Adjustment Type"
        verbose_name_plural = "Stock Adjustment Types"
    
    def __str__(self):
        return self.name


class StockAdjustment(models.Model):
    """Record of stock adjustments (expired, damaged, count mismatches, etc.)"""
    
    adjustment_type = models.ForeignKey(StockAdjustmentType, on_delete=models.PROTECT, related_name='adjustments')
    batch = models.ForeignKey(Batch, on_delete=models.CASCADE, related_name='adjustments')
    store = models.ForeignKey(PharmacyStore, on_delete=models.CASCADE, related_name='adjustments')
    
    quantity = models.PositiveIntegerField()
    unit_cost = models.DecimalField(max_digits=10, decimal_places=2, help_text="Cost at time of adjustment")
    total_value = models.DecimalField(max_digits=12, decimal_places=2)
    
    reason = models.TextField()
    reference_number = models.CharField(max_length=100, unique=True, blank=True)
    
    created_by = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='created_adjustments')
    date_created = models.DateTimeField(auto_now_add=True)
    
    notes = models.TextField(blank=True, null=True)
    
    class Meta:
        ordering = ['-date_created']
        verbose_name = "Stock Adjustment"
        verbose_name_plural = "Stock Adjustments"
    
    def save(self, *args, **kwargs):
        # Auto-calculate total value
        if self.quantity and self.unit_cost:
            self.total_value = self.quantity * self.unit_cost
        
        # Generate reference number if not provided
        if not self.reference_number:
            from datetime import datetime
            prefix = self.adjustment_type.code
            date_str = datetime.now().strftime('%Y%m%d')
            last = StockAdjustment.objects.filter(reference_number__startswith=f"{prefix}-{date_str}").count()
            self.reference_number = f"{prefix}-{date_str}-{last + 1:04d}"
        
        super().save(*args, **kwargs)
        
        # Process the adjustment immediately after saving
        self._process_adjustment()
    
    def _process_adjustment(self):
        """Process the adjustment - update inventory immediately"""
        from django.db import transaction
        from .models import Inventory
        
        try:
            with transaction.atomic():
                inventory = Inventory.objects.select_for_update().get(
                    batch=self.batch,
                    store=self.store
                )
                
                if self.adjustment_type.direction == 'out':
                    # Removing stock
                    if inventory.quantity < self.quantity:
                        raise ValueError(f"Insufficient stock. Available: {inventory.quantity}, Requested: {self.quantity}")
                    
                    inventory.quantity -= self.quantity
                else:
                    # Adding stock (for returns or initial stock)
                    inventory.quantity += self.quantity
                
                inventory.save()
                
        except Inventory.DoesNotExist:
            # If inventory doesn't exist, create it for incoming adjustments
            if self.adjustment_type.direction == 'in':
                Inventory.objects.create(
                    batch=self.batch,
                    store=self.store,
                    quantity=self.quantity
                )
            else:
                raise ValueError(f"Inventory record not found for batch {self.batch.batch_no} at store {self.store.name}")
        except Exception as e:
            raise ValueError(f"Error processing adjustment: {str(e)}")
    
    def __str__(self):
        return f"{self.reference_number} - {self.adjustment_type.name}: {self.quantity} units"


# ========== PRESCRIPTION MANAGEMENT (SINGLE SOURCE OF TRUTH) ==========
class Prescription(models.Model):
    PRESCRIPTION_STATUS = (
        ('pending', 'Pending'),           # New prescription
        ('in_progress', 'In Progress'),    # Being processed
        ('billed', 'Billed'),              # All items billed
        ('partly_paid', 'Partly Paid'),    # Some items paid
        ('paid', 'Paid'),                  # All items paid
        ('dispensed', 'Dispensed'),        # Fully dispensed
        ('cancelled', 'Cancelled')         # Cancelled
    )
    
    patient = models.ForeignKey(Patient, on_delete=models.CASCADE, related_name="prescriptions")
    encounter = models.ForeignKey(EncounterRoute, on_delete=models.SET_NULL, null=True, blank=True)
    prescribed_by = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name="prescriptions")
    date_prescribed = models.DateTimeField(auto_now_add=True)
    status = models.CharField(max_length=20, choices=PRESCRIPTION_STATUS, default='pending')
    notes = models.TextField(blank=True, null=True)

    def update_status(self):
        """Update prescription status based on its details"""
        details = self.details.all()
        if not details.exists():
            return
        
        # Check if all details are dispensed
        all_dispensed = all(detail.status == 'dispensed' for detail in details)
        if all_dispensed:
            self.status = 'dispensed'
            self.save(update_fields=['status'])
            return
        
        # Check if any detail is paid (ready for dispensing)
        any_paid = any(detail.status == 'paid' for detail in details)
        if any_paid:
            self.status = 'paid'
            self.save(update_fields=['status'])
            return
        
        # Check if all details are billed
        all_billed = all(detail.status in ['billed', 'paid', 'dispensed'] for detail in details)
        if all_billed:
            self.status = 'billed'
            self.save(update_fields=['status'])
            return
        
        # Check if any detail is billed
        any_billed = any(detail.status in ['billed', 'paid', 'dispensed'] for detail in details)
        if any_billed:
            self.status = 'in_progress'
            self.save(update_fields=['status'])
            return
        
        self.status = 'pending'
        self.save(update_fields=['status'])

    def __str__(self): return f"Rx #{self.id} - {self.patient}"

class PrescriptionDetail(models.Model):
    DETAIL_STATUS = (
        ('pending', 'Pending'),      # Prescribed, not yet billed
        ('billed', 'Billed'),         # Billed, awaiting payment
        ('paid', 'Paid'),             # Paid, ready to dispense
        ('dispensed', 'Dispensed'),   # Dispensed
        ('cancelled', 'Cancelled')    # Cancelled
    )
    
    prescription = models.ForeignKey(Prescription, on_delete=models.CASCADE, related_name='details')
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    dose = models.CharField(max_length=100)
    frequency = models.CharField(max_length=255)
    duration = models.IntegerField()
    quantity_prescribed = models.PositiveIntegerField()
    status = models.CharField(max_length=20, choices=DETAIL_STATUS, default='pending')
    remark = models.TextField(blank=True, null=True)

    class Meta:
        verbose_name = "Prescription Detail"

    def __str__(self): return f"{self.product.name} - {self.quantity_prescribed}"


class PrescriptionDetailBill(models.Model):
    """Links PrescriptionDetail to Bill and stores batch information at billing time"""
    prescription_detail = models.ForeignKey(
        'PrescriptionDetail', 
        on_delete=models.CASCADE, 
        related_name='bill_records'
    )
    bill = models.ForeignKey(
        'bills.Bill', 
        on_delete=models.CASCADE, 
        related_name='pharmacy_records'
    )
    batch = models.ForeignKey(
        'Batch', 
        on_delete=models.CASCADE,
        related_name='bill_records'
    )
    quantity = models.PositiveIntegerField()
    unit_price = models.DecimalField(max_digits=10, decimal_places=2)
    total_price = models.DecimalField(max_digits=12, decimal_places=2)
    date_created = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        unique_together = ('prescription_detail', 'bill', 'batch')
        verbose_name = "Prescription Detail Bill"
        verbose_name_plural = "Prescription Detail Bills"
        ordering = ['-date_created']
    
    def __str__(self):
        return f"{self.prescription_detail.product.name} - {self.batch.batch_no} (Bill #{self.bill.id})"
    
    def save(self, *args, **kwargs):
        # Auto-calculate total price if not set
        if not self.total_price:
            self.total_price = self.quantity * self.unit_price
        super().save(*args, **kwargs)

# ========== DISPENSING AUDIT TRAIL ==========
class DispensingRecord(models.Model):
    """Records what was actually dispensed (pure audit trail)"""
    prescription_detail = models.ForeignKey(PrescriptionDetail, on_delete=models.CASCADE, 
                                           related_name='dispensing_records')
    store = models.ForeignKey(PharmacyStore, on_delete=models.CASCADE)
    batch = models.ForeignKey(Batch, on_delete=models.CASCADE)
    quantity_dispensed = models.PositiveIntegerField()
    unit_price = models.DecimalField(max_digits=10, decimal_places=2)
    total_price = models.DecimalField(max_digits=12, decimal_places=2)
    dispensed_by = models.ForeignKey(CustomUser, on_delete=models.CASCADE)
    date_dispensed = models.DateTimeField(auto_now_add=True)
    bill_reference = models.CharField(max_length=100, blank=True, null=True)  # Link to bills app
    
    def save(self, *args, **kwargs):
        self.total_price = self.quantity_dispensed * self.unit_price
        super().save(*args, **kwargs)
    
    def __str__(self): return f"{self.quantity_dispensed} of {self.prescription_detail.product.name}"