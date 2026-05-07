# billing/utils.py
from decimal import Decimal
from django.db.models import Sum, Count

from .models import Payment, PaymentDetail, Bill, Wallet

def pay_bill(bill: Bill, payer=None, amount=None, method="cash", received_by=None):
    """
    Handles full or partial payment for a bill, automatically using wallet if available.
    
    - bill: Bill instance to pay
    - payer: Patient instance (optional for walk-ins)
    - amount: total cash/other payment (Decimal)
    - method: "cash", "pos", etc.
    - received_by: CustomUser instance recording payment
    """
    if bill.is_paid:
        return {"status": "already_paid", "bill_id": bill.id}

    total_due = bill.total_amount

    wallet_deduction = Decimal("0.00")
    remaining_due = total_due

    # Deduct from wallet first if patient has one
    if bill.patient and hasattr(bill.patient, "wallet"):
        wallet = bill.patient.wallet
        if wallet.can_pay(total_due):
            wallet.deduct(total_due)
            wallet_deduction = total_due
            remaining_due = Decimal("0.00")
        elif wallet.account_balance > 0:
            wallet_deduction = wallet.account_balance
            remaining_due -= wallet_deduction
            wallet.deduct(wallet.account_balance)

    # Handle additional payment (cash, pos, etc.)
    payment_amount = Decimal(amount or remaining_due)
    payment = Payment.objects.create(
        patient=bill.patient,
        payer_name=payer if not bill.patient else None,
        received_by=received_by,
        method=method,
        amount=payment_amount
    )

    PaymentDetail.objects.create(
        payment=payment,
        bill=bill,
        amount_applied=wallet_deduction + payment_amount,
        created_by=received_by
    )

    bill.calculate_total()
    if wallet_deduction + payment_amount >= total_due:
        bill.mark_paid()

    return {"status": "paid" if bill.is_paid else "partial", "bill_id": bill.id}


def total_income():
    """
    Returns the total amount received across all payments.
    """
    return Payment.objects.aggregate(total=Sum("amount"))["total"] or 0

def outstanding_bills():
    """
    Returns the total amount of all unpaid bills.
    """
    return Bill.objects.filter(is_paid=False).aggregate(total=Sum("total_amount"))["total"] or 0

def walk_in_summary():
    """
    Returns total amount and count of walk-in bills.
    """
    return Bill.objects.filter(is_walk_in=True).aggregate(
        total=Sum("total_amount"),
        count=Count("id")
    )
