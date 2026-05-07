from decimal import Decimal
from django.db import transaction
from django.core.exceptions import ValidationError

from .models import Bill, Payment, PaymentDetail, Wallet


@transaction.atomic
def create_bill(patient, amount, description, created_by, source=None, encounter=None):
    """✅ Create a new bill for any service (lab, pharmacy, etc.)."""
    return Bill.objects.create(
        patient=patient,
        amount=Decimal(amount),
        balance=Decimal(amount),
        description=description,
        created_by=created_by,
        source=source,
        encounter=encounter,
    )


@transaction.atomic
def process_payment(bill, amount, payment_method, created_by, action=None, notes=None):
    """
    ✅ Handles payment for a single bill (cash, transfer, POS, or wallet).
    """
    if not bill:
        raise ValidationError("Bill instance is required.")
    if Decimal(amount) <= 0:
        raise ValidationError("Invalid payment amount.")

    action = action or ("invoice" if payment_method == "wallet" else "receipt")

    # --- Wallet Handling ---
    if payment_method == "wallet":
        wallet = getattr(bill.patient, "wallet", None)
        if not wallet:
            raise ValidationError("Patient wallet not found.")
        if not wallet.can_pay(amount):
            raise ValidationError("Insufficient wallet balance.")
        wallet.deduct(amount)

    # --- Record Payment + Detail ---
    payment = Payment.objects.create(
        patient=bill.patient,
        action=action,
        payment_method=payment_method,
        amount_paid=Decimal(amount),
        created_by=created_by,
        notes=notes,
    )

    PaymentDetail.objects.create(
        payment=payment,
        bill=bill,
        amount=Decimal(amount),
        created_by=created_by,
        description=bill.description or "Service payment",
    )

    bill.update_totals()
    return payment


@transaction.atomic
def cashier_receive_payment(
            patient=None,bills_data=None,payment_method=None,
            created_by=None,notes="",walk_in=False,
        ):
    """
    ✅ Handles cashier payments.
    - Works for both registered patients and true walk-ins.
    - Supports wallet deduction when applicable.
    - `walk_in` only marks how the payment originated.
    """

    if not bills_data:
        raise ValidationError("No bills provided.")

    total_amount = sum(Decimal(str(b["amount"])) for b in bills_data)
    if total_amount <= 0:
        raise ValidationError("Invalid total amount.")

    # --- Wallet handling (only if patient + wallet) ---
    if payment_method == "wallet":
        if not patient:
            raise ValidationError("Wallet payment requires a registered patient.")

        wallet = getattr(patient, "wallet", None)
        if not wallet:
            raise ValidationError("Patient wallet not found.")

        if not wallet.can_pay(total_amount):
            raise ValidationError("Insufficient wallet balance.")

        wallet.deduct(total_amount)

    # --- Create Payment record ---
    payment = Payment.objects.create(
        patient=patient,  # can be None for true walk-ins
        action="receipt" if payment_method != "wallet" else "invoice",
        payment_method=payment_method,
        amount_paid=total_amount,
        created_by=created_by,
        notes=notes or ("Walk-in payment" if walk_in else "Cashier payment"),
        walk_in=walk_in,  # 🔹 track cashier-originated payments
    )

    # --- Record each bill payment ---
    for b in bills_data:
        bill_id = b.get("id")
        amt = Decimal(str(b["amount"]))

        try:
            # Allow bills without patient filter for walk-ins
            bill = (
                Bill.objects.get(pk=bill_id)
                if patient is None
                else Bill.objects.get(pk=bill_id, patient=patient)
            )
        except Bill.DoesNotExist:
            continue

        PaymentDetail.objects.create(
            payment=payment,
            bill=bill,
            amount=amt,
            description=f"Payment for {bill.description or 'bill'}",
            created_by=created_by,
        )

        bill.update_totals()

    return payment


@transaction.atomic
def deposit_to_wallet(patient, amount, created_by, payment_method="cash"):
    """✅ Deposit funds into a patient’s wallet."""
    if Decimal(amount) <= 0:
        raise ValidationError("Invalid deposit amount.")

    wallet, _ = Wallet.objects.get_or_create(
        patient=patient, defaults={"account_balance": Decimal(0), "created_by": created_by}
    )
    wallet.account_balance += Decimal(amount)
    wallet.save(update_fields=["account_balance"])

    payment = Payment.objects.create(
        patient=patient,
        action="deposit",
        payment_method=payment_method,
        amount_paid=Decimal(amount),
        created_by=created_by,
        notes="Wallet deposit",
    )
    return payment
