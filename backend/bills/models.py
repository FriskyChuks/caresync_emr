from decimal import Decimal
from django.db import models, transaction
from django.contrib.contenttypes.models import ContentType
from django.contrib.contenttypes.fields import GenericForeignKey

from accounts.models import CustomUser
from patients.models import Patient
from encounters.models import EncounterRoute

# ============================================================
# BILL MODEL
# ============================================================

class Bill(models.Model):
    STATUS = [
        ('pending', 'Pending'),
        ('partly_paid', 'Partly Paid'),
        ('paid', 'Paid'),
        ('cancelled', 'Cancelled'),
    ]

    patient = models.ForeignKey(
        Patient, on_delete=models.SET_NULL, null=True, blank=True
    )
    encounter = models.ForeignKey(
        EncounterRoute, on_delete=models.SET_NULL, null=True, blank=True
    )

    # Generic link (LabRequest, Prescription, RadiologyRequest, ServiceRequest)
    content_type = models.ForeignKey(
        ContentType, on_delete=models.CASCADE, null=True, blank=True
    )
    object_id = models.PositiveIntegerField(null=True, blank=True)
    source = GenericForeignKey("content_type", "object_id")

    description = models.CharField(max_length=255, blank=True, null=True)
    amount = models.DecimalField(max_digits=12, decimal_places=2, default=0.00)
    amount_paid = models.DecimalField(max_digits=12, decimal_places=2, default=0.00)
    balance = models.DecimalField(max_digits=12, decimal_places=2, default=0.00)

    status = models.CharField(
        max_length=15, choices=STATUS, default="pending"
    )
    created_by = models.ForeignKey(
        CustomUser, on_delete=models.SET_NULL, null=True, blank=True, related_name="bills_created"
    )
    date_created = models.DateTimeField(auto_now_add=True)
    last_updated = models.DateTimeField(auto_now=True)

    def __str__(self):
        if self.patient:
            return f"{self.patient} — ₦{self.amount} | {self.date_created.strftime('%Y-%m-%d')}"
        return f"Non-patient Bill — ₦{self.amount} | {self.date_created.strftime('%Y-%m-%d')}"

    # ----------------------------
    # Helpers
    # ----------------------------

    def update_service_item_status(self):
        """
        When a bill is paid, update the status of the source item
        This is a generic method that works for any service type
        """
        if not self.source:
            return
        
        source = self.source
        
        # Handle different content types
        if hasattr(source, 'status'):
            # For PrescriptionDetail, Lab TestRequestDetail, Radiology RequestDetail
            if self.balance <= 0:  # Fully paid
                source.status = 'paid'
            elif self.amount_paid > 0:  # Partially paid
                source.status = 'partly_paid'
            else:
                source.status = 'billed'
            
            source.save(update_fields=['status'])
            
            # Update parent if it exists (Prescription, LabRequest, RadiologyRequest)
            if hasattr(source, 'prescription'):
                # For pharmacy
                source.prescription.update_status()
            elif hasattr(source, 'test_request'):
                # For lab
                source.test_request.update_status_from_details()
            elif hasattr(source, 'request'):
                # For radiology
                if hasattr(source.request, 'update_overall_status'):
                    source.request.update_overall_status()
                elif hasattr(source.request, 'update_status_from_details'):
                    source.request.update_status_from_details()
    
    def update_totals(self):
        """Recalculate amount paid, balance, and status."""
        total_paid = sum(d.amount for d in self.payment_details.all())
        self.amount_paid = Decimal(total_paid)
        self.balance = Decimal(self.amount) - self.amount_paid

        old_status = self.status
        
        if self.balance <= 0:
            self.status = "paid"
        elif 0 < self.balance < self.amount:
            self.status = "partly_paid"
        else:
            self.status = "pending"

        self.save(update_fields=["amount_paid", "balance", "status"])
        
        # If status changed to paid, update prescription status
        if old_status != self.status and self.status == 'paid':
            self.update_prescription_status()
    
    def update_prescription_status(self):
        """Update linked prescription details to 'paid' status"""
        from pharmacies.models import PrescriptionDetailBill
        
        bill_records = PrescriptionDetailBill.objects.filter(bill=self)
        for bill_record in bill_records:
            detail = bill_record.prescription_detail
            if detail.status != 'dispensed':
                detail.status = 'paid'
                detail.save(update_fields=['status'])
                if hasattr(detail.prescription, 'update_status'):
                    detail.prescription.update_status()

    @property
    def total_payments(self):
        return sum(d.amount for d in self.payment_details.all())


# ============================================================
# PAYMENT MODELS
# ============================================================

PAY_ACTION = (
    ("deposit", "Deposit"),    # Money entering wallet
    ("invoice", "Invoice"),    # Auto-deduction (no cash exchange)
    ("receipt", "Receipt"),    # Direct cash/POS/transfer by cashier
)

PAYMENT_METHODS = (
    ("cash", "Cash"),
    ("transfer", "Transfer"),
    ("pos", "POS"),
    ("wallet", "Wallet"),
    ("wallet_deposit", "Wallet Deposit"),
)


class Payment(models.Model):
    """Represents a single payment transaction (deposit, invoice, or receipt)."""
    amount_paid = models.DecimalField(max_digits=20, decimal_places=2, default=0.00)
    action = models.CharField(max_length=20, choices=PAY_ACTION)
    payment_method = models.CharField(max_length=20, choices=PAYMENT_METHODS, blank=True, null=True)

    patient = models.ForeignKey(Patient, on_delete=models.CASCADE, null=True, blank=True)
    walk_in = models.BooleanField(default=False)  # 🔹 True for true walk-ins
    created_by = models.ForeignKey(CustomUser, on_delete=models.SET_NULL, null=True, blank=True)

    reference = models.CharField(max_length=100, blank=True, null=True)
    notes = models.TextField(blank=True, null=True)

    date_created = models.DateTimeField(auto_now_add=True)
    last_updated = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.get_action_display()} — ₦{self.amount_paid} ({self.patient})"

    @property
    def is_deposit(self):
        return self.action == "deposit"

    @property
    def is_receipt(self):
        return self.action == "receipt"

    @property
    def is_invoice(self):
        return self.action == "invoice"


class PaymentDetail(models.Model):
    """Breakdown of what each payment was applied to."""
    payment = models.ForeignKey(Payment, on_delete=models.CASCADE, related_name="details")
    bill = models.ForeignKey(Bill, on_delete=models.SET_NULL, null=True, blank=True, related_name="payment_details")

    description = models.CharField(max_length=255, blank=True, null=True)
    amount = models.DecimalField(max_digits=20, decimal_places=2, default=0.00)

    created_by = models.ForeignKey(CustomUser, on_delete=models.SET_NULL, null=True, blank=True)
    date_created = models.DateTimeField(auto_now_add=True)
    last_updated = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.bill or self.description} — ₦{self.amount}"


# ============================================================
# WALLET MODEL
# ============================================================

class Wallet(models.Model):
    """Stores patient wallet balance and supports deposits/deductions."""
    patient = models.OneToOneField(Patient, on_delete=models.CASCADE, related_name='wallet')
    account_balance = models.DecimalField(max_digits=12, decimal_places=2, default=0.00)
    created_by = models.ForeignKey(CustomUser, on_delete=models.SET_NULL, null=True, blank=True)
    date_created = models.DateTimeField(auto_now_add=True)
    last_updated = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.patient} Wallet: ₦{self.account_balance}"

    # ----------------------------
    # Wallet actions
    # ----------------------------
    def deposit(self, amount):
        """Deposit funds into wallet and log a payment record."""
        self.account_balance += amount
        self.save(update_fields=['account_balance'])
        Payment.objects.create(
            patient=self.patient,
            created_by=self.created_by,
            amount_paid=amount,
            payment_method="wallet_deposit",
            action="deposit",
            notes="Wallet deposit",
        )

    def can_pay(self, amount):
        return self.account_balance >= amount

    @transaction.atomic
    def deduct(self, amount, bill=None, created_by=None):
        """Deduct from wallet and automatically record Payment + PaymentDetail."""
        if not self.can_pay(amount):
            return False

        self.account_balance -= amount
        self.save(update_fields=['account_balance'])

        payment = Payment.objects.create(
            patient=self.patient,
            created_by=created_by or self.created_by,
            amount_paid=amount,
            payment_method="wallet",
            action="invoice",
            notes="Auto-deduction from wallet",
        )

        if bill:
            PaymentDetail.objects.create(
                payment=payment,
                bill=bill,
                amount=amount,
                description=f"Auto invoice for {bill.description or bill}",
                created_by=created_by or self.created_by,
            )
            bill.update_totals()

        return True
