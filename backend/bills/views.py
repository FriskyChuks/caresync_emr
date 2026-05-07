from rest_framework import generics, status,filters
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.db import transaction
from django.core.exceptions import ValidationError
from django.contrib.contenttypes.models import ContentType
from django.db.models import Sum, Count, DecimalField, F, ExpressionWrapper
from decimal import Decimal

from .models import Bill, Payment, PaymentDetail, Wallet
from .serializers import (
    BillSerializer,
    PaymentSerializer,
    PaymentDetailSerializer,
    WalletSerializer,
)
from .services import *
from lab.models import TestRequestDetail
from pharmacies.models import PrescriptionDetail, PrescriptionDetailBill, Batch
from radiology.models import RequestDetail
from patients.models import Patient
from services.models import *
from encounters.views import get_active_encounter as active_encounter

# ---------------------------------------------------------------------
# 💰 BILL VIEWS
# ---------------------------------------------------------------------


class BillListCreateView(generics.ListCreateAPIView):
    queryset = Bill.objects.select_related("patient", "created_by").all()
    serializer_class = BillSerializer
    permission_classes = [IsAuthenticated]

    # Updated MODEL_HANDLERS - now uses PrescriptionDetail
    MODEL_HANDLERS = {
        # Lab models
        "labrequest": "handle_lab_request",
        "requestdetail": "handle_lab_request",
        "testrequestdetail": "handle_lab_request",
        "labrequestdetail": "handle_lab_request",
        
        # Radiology models
        "radiologyrequest": "handle_radiology_request",
        "radiologyrequestdetail": "handle_radiology_request",
        "requestdetail": "handle_radiology_request",

        # Pharmacy models - updated to use PrescriptionDetail
        "prescriptiondetail": "handle_pharmacy_request",  # ← Changed from dispensarydetail
        "prescription": "handle_pharmacy_request",        # Keep as fallback
    }

    # In BillListCreateView, update handle_lab_request method:
    def handle_lab_request(self, object_id, amount, description, request, encounter=None):
        """Handle Lab TestRequestDetail billing"""
        detail = TestRequestDetail.objects.select_related(
            "test_request", "test"
        ).get(pk=object_id)
        parent_request = detail.test_request

        bill = create_bill(
            patient=parent_request.patient,
            amount=amount,
            description=description,
            created_by=request.user,
            source=detail,
            encounter=active_encounter(parent_request.patient)
        )

        # Update status to 'billed' instead of 'billed' (bill created)
        # This indicates bill exists but not yet paid
        if detail.status == "pending":
            detail.status = "billed"
            detail.save(update_fields=["status"])
        
        parent_request.update_status_from_details()

        return bill

    def handle_radiology_request(self, object_id, amount, description, request, encounter=None):
        """Handle Radiology RequestDetail billing"""
        detail = RequestDetail.objects.select_related(
            "request", "investigation"
        ).get(pk=object_id)
        parent_request = detail.request

        bill = create_bill(
            patient=parent_request.patient,
            amount=amount,
            description=description,
            created_by=request.user,
            source=detail,
            encounter = active_encounter(parent_request.patient)
        )

        detail.status = "billed"
        detail.save(update_fields=["status"])
        
        if hasattr(parent_request, 'update_overall_status'):
            parent_request.update_overall_status()
        elif hasattr(parent_request, 'update_status_from_details'):
            parent_request.update_status_from_details()

        return bill

    def handle_pharmacy_request(self, object_id, amount, description, request, encounter=None):
        """Handle Pharmacy billing - Stores batch information in PrescriptionDetailBill"""
        try:            
            print(f"\n💰 [PHARMACY BILLING] Processing detail ID: {object_id}")            
            # Get the source item data from the request
            # The source array is in request.data['source']
            source_items = request.data.get('source', [])
            
            # Find the specific item that matches this object_id
            current_item = None
            for item in source_items:
                if item.get('object_id') == object_id:
                    current_item = item
                    break
            
            # Extract batch data from the item
            batch_id = None
            quantity = 0
            unit_price = 0
            
            if current_item:
                batch_id = current_item.get('batch_id')
                quantity = current_item.get('quantity', 0)
                unit_price = current_item.get('unit_price', 0)
                print(f"💰 Found item data - Batch ID: {batch_id}, Quantity: {quantity}, Unit Price: {unit_price}")
            else:
                print("⚠️ Could not find matching source item in request")
            
            # Get PrescriptionDetail with related data
            detail = PrescriptionDetail.objects.select_related(
                "prescription", 
                "prescription__patient",
                "product"
            ).get(pk=object_id)
            
            parent_prescription = detail.prescription
            patient = parent_prescription.patient
            
            print(f"💰 Patient: {patient.id}, Product: {detail.product.name}")
            
            # Create the bill
            bill = create_bill(
                patient=patient,
                amount=amount,
                description=description or f"Pharmacy: {detail.product.name}",
                created_by=request.user,
                source=detail,
                encounter=encounter or active_encounter(patient)
            )
            
            # If batch_id provided, create the pharmacy bill record
            if batch_id:
                try:
                    batch = Batch.objects.select_related('brand').get(id=batch_id)
                    
                    # Create the linking record
                    bill_record = PrescriptionDetailBill.objects.create(
                        prescription_detail=detail,
                        bill=bill,
                        batch=batch,
                        quantity=quantity,
                        unit_price=unit_price,
                        total_price=amount
                    )
                    print(f"✅ Created bill record: {bill_record}")
                    
                except Batch.DoesNotExist:
                    print(f"⚠️ Batch {batch_id} not found, continuing without batch record")
            else:
                print("⚠️ No batch_id provided, continuing without batch record")
            
            # Update detail status to 'billed'
            detail.status = 'billed'
            detail.save(update_fields=['status'])
            
            # Update parent prescription status
            if hasattr(parent_prescription, 'update_status'):
                parent_prescription.update_status()
            
            print(f"✅ Bill #{bill.id} created successfully")
            return bill
            
        except PrescriptionDetail.DoesNotExist:
            raise Exception(f"PrescriptionDetail with ID {object_id} not found")
        except Exception as e:
            print(f"❌ Error: {str(e)}")
            raise

    def handle_generic_source(self, model_name, object_id, amount, description, request):
        """Handle generic sources using ContentType"""
        try:
            content_type = ContentType.objects.get(model=model_name)
            source_instance = content_type.get_object_for_this_type(pk=object_id)
        except ContentType.DoesNotExist:
            raise Exception(f"Invalid content type: {model_name}")

        bill = create_bill(
            patient=source_instance.patient if hasattr(source_instance, 'patient') else None,
            amount=amount,
            description=description,
            created_by=request.user,
            source=source_instance,
        )

        # Update source instance's status if applicable
        if hasattr(source_instance, "details"):
            details = source_instance.details.all()
            billed_count = details.filter(status="billed").count()
            total_count = details.count()

            if billed_count == 0:
                source_instance.status = "pending"
            elif billed_count < total_count:
                source_instance.status = "partly_billed"
            else:
                source_instance.status = "billed"
            source_instance.save(update_fields=["status"])
            
        elif hasattr(source_instance, "status"):
            source_instance.status = "billed"
            source_instance.save(update_fields=["status"])

        return bill

    @transaction.atomic
    def create(self, request, *args, **kwargs):
        """
        Intelligent multi-source billing system.
        Now supports PrescriptionDetail for pharmacy billing.
        """
        data = request.data
        patient_id = data.get("patient")
        description = data.get("description", "Service Billing")
        source_items = data.get("source", [])

        if not patient_id or not source_items:
            return Response(
                {"error": "Patient and source items are required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        total_amount = Decimal("0.00")
        created_bills = []
        failed_items = []

        for item in source_items:
            try:
                model_name = item.get("content_type")
                object_id = item.get("object_id")
                amount = Decimal(str(item.get("amount", 0)))
                desc = item.get("description", description)

                if not model_name or not object_id:
                    failed_items.append({"error": "Missing model or object_id"})
                    continue

                # Check if we have a specific handler for this model
                handler_name = self.MODEL_HANDLERS.get(model_name)
                
                if handler_name:
                    # Use specific handler
                    handler_method = getattr(self, handler_name)
                    bill = handler_method(object_id, amount, desc, request)
                    created_bills.append(bill)
                    total_amount += amount
                    
                else:
                    # Use generic handler
                    bill = self.handle_generic_source(model_name, object_id, amount, desc, request)
                    created_bills.append(bill)
                    total_amount += amount

            except PrescriptionDetail.DoesNotExist:
                error_msg = f"PrescriptionDetail with ID {object_id} not found"
                print(f"Error: {error_msg}")
                failed_items.append({
                    "object_id": object_id, 
                    "model_name": model_name,
                    "error": error_msg
                })
            except Exception as e:
                error_msg = str(e)
                print(f"Error processing {model_name} with ID {object_id}: {error_msg}")
                failed_items.append({
                    "object_id": object_id, 
                    "model_name": model_name,
                    "error": error_msg
                })

        # Final structured response
        return Response(
            {
                "message": f"{len(created_bills)} bill(s) created successfully.",
                "total_amount": float(total_amount),
                "failed_items": failed_items,
                "successful_items": len(created_bills),
            },
            status=status.HTTP_201_CREATED,
        )

    @classmethod
    def register_model_handler(cls, model_name, handler_method_name):
        """
        Class method to dynamically register new model handlers.
        Usage: BillListCreateView.register_model_handler('servicerequest', 'handle_service_request')
        """
        cls.MODEL_HANDLERS[model_name] = handler_method_name


class CashierBillListView(generics.ListAPIView):
    """
    💳 Returns bills categorized by payment status for the Cash Officer.
    Supports:
      - ?status=pending|partly_paid|paid|cancelled|all
      - ?patient=<id> to filter by patient
    """
    serializer_class = BillSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ["patient__user__first_name", "patient__user__last_name", "description"]
    ordering_fields = ["date_created", "amount", "status"]
    ordering = ["-date_created"]

    def get_queryset(self):
        status_param = self.request.query_params.get("status", "").lower()
        patient_id = self.request.query_params.get("patient", None)

        queryset = Bill.objects.select_related("patient", "created_by")

        # 🎯 Filter by patient if provided
        if patient_id:
            queryset = queryset.filter(patient__id=patient_id)

        # 🎯 Filter by status if provided
        if status_param in ["pending", "partly_paid", "paid", "cancelled"]:
            queryset = queryset.filter(status=status_param)

        return queryset

    

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def cashier_bill_summary(request):
    """
    💳 Returns aggregate totals for the Cashier dashboard.
    """
    totals = Bill.objects.aggregate(
        total_bills=Count("id"),
        total_billed=Sum("amount", default=Decimal(0)),
        total_paid=Sum("amount_paid", default=Decimal(0)),
        total_balance=Sum("balance", default=Decimal(0))
    )

    return Response({
        "total_bills": totals["total_bills"] or 0,
        "total_billed": str(totals["total_billed"] or "0.00"),
        "total_paid": str(totals["total_paid"] or "0.00"),
        "total_balance": str(totals["total_balance"] or "0.00"),
    })


class BillDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Bill.objects.select_related("patient", "created_by").all()
    serializer_class = BillSerializer
    permission_classes = [IsAuthenticated]

# --------------------------------------------------------------------
# CASHIER BILL & PROCESS PAYMENT

@api_view(["POST"])
@permission_classes([IsAuthenticated])
@transaction.atomic
def bill_and_pay_pending_services(request):
    """
    Cashier bills and pays pending service requests in one action.
    Supports multiple payment methods, including wallet.

    Payload:
    {
        "patient": <id>,
        "source": [
            {"request_id": 1, "details": [2,3]},
            {"request_id": 2, "details": [7]}
        ],
        "payment_method": "cash" | "wallet" | "pos" | "transfer",
        "notes": "Optional notes"
    }
    """
    patient_id = request.data.get("patient")
    source_items = request.data.get("source", [])
    payment_method = request.data.get("payment_method")
    notes = request.data.get("notes", "")

    if not patient_id or not source_items or not payment_method:
        return Response(
            {"error": "Patient, source items, and payment method are required"},
            status=400,
        )

    try:
        patient = Patient.objects.get(pk=patient_id)
    except Patient.DoesNotExist:
        return Response({"error": "Patient not found"}, status=404)

    bills_data = []
    failed_items = []

    # Iterate over each request + selected details
    for item in source_items:
        request_id = item.get("request_id")
        detail_ids = item.get("details", [])

        # Allow pending or in_progress requests
        try:
            request_obj = ServiceRequest.objects.get(
                pk=request_id,
                patient=patient,
                status__in=["pending", "in_progress"],
            )
        except ServiceRequest.DoesNotExist:
            failed_items.append(
                {
                    "request_id": request_id,
                    "reason": "Request not found or already completed",
                }
            )
            continue

        for detail_id in detail_ids:
            try:
                detail = request_obj.details.get(pk=detail_id, status="pending")
            except ServiceRequestDetail.DoesNotExist:
                failed_items.append(
                    {
                        "request_id": request_id,
                        "detail_id": detail_id,
                        "reason": "Detail not found or already processed",
                    }
                )
                continue

            amount = detail.total_amount
            if amount <= 0:
                failed_items.append(
                    {
                        "request_id": request_id,
                        "detail_id": detail_id,
                        "reason": "Invalid amount",
                    }
                )
                continue

            # ✅ Create the bill
            try:
                bill = create_bill(
                    patient=patient,
                    amount=Decimal(amount),
                    description=str(detail),
                    created_by=request.user,
                    source=detail,
                )
                bills_data.append({"id": bill.id, "amount": amount})

                # Mark detail as completed
                detail.status = "completed"
                detail.save(update_fields=["status"])
            except Exception as e:
                failed_items.append(
                    {
                        "request_id": request_id,
                        "detail_id": detail_id,
                        "error": str(e),
                    }
                )
                continue

        # ✅ Update request overall status dynamically
        total = request_obj.details.count()
        completed = request_obj.details.filter(status="completed").count()

        if completed == total:
            request_obj.status = "completed"
        elif completed > 0:
            request_obj.status = "in_progress"
        else:
            request_obj.status = "pending"
        request_obj.save(update_fields=["status"])

    if not bills_data:
        return Response(
            {"error": "No valid bills to process", "failed": failed_items},
            status=400,
        )

    # ✅ Process payment for all bills
    try:
        payment = cashier_receive_payment(
            patient=patient,
            bills_data=[{"id": b["id"], "amount": b["amount"]} for b in bills_data],
            payment_method=payment_method,
            created_by=request.user,
            notes=notes or f"Cashier bill & pay via {payment_method}",
        )
    except ValidationError as e:
        return Response({"error": str(e)}, status=400)

    serializer = PaymentSerializer(payment)
    return Response(
        {
            "message": f"{len(bills_data)} bill(s) created and paid successfully",
            "failed": failed_items,
            "payment": serializer.data,
        },
        status=201,
    )

# ---------------------------------------------------------------------
# 💵 PAYMENT VIEWS
# ---------------------------------------------------------------------

# HELPER FUNCTION
def update_prescription_status_on_payment(bill):
    """Update prescription detail status when a bill is paid"""
    from pharmacies.models import PrescriptionDetailBill, PrescriptionDetail
    
    # Get all PrescriptionDetailBill records for this bill
    bill_records = PrescriptionDetailBill.objects.filter(bill=bill)
    
    for bill_record in bill_records:
        detail = bill_record.prescription_detail
        # Only update if not already dispensed
        if detail.status != 'dispensed':
            detail.status = 'paid'
            detail.save(update_fields=['status'])
            
            # Update parent prescription status
            if hasattr(detail.prescription, 'update_status'):
                detail.prescription.update_status()

# bills/views.py - Update PaymentListCreateView

class PaymentListCreateView(generics.ListCreateAPIView):
    queryset = Payment.objects.select_related("patient", "created_by").prefetch_related("details").all()
    serializer_class = PaymentSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        payment = serializer.save(created_by=self.request.user)
        
        # If this is a receipt (payment against bills), update bill statuses
        if payment.action == 'receipt' and payment.payment_method != 'wallet':
            # Update each bill's totals and prescription status
            for detail in payment.details.all():
                if detail.bill:
                    detail.bill.update_totals()
                    # Update prescription status for pharmacy items
                    update_prescription_status_on_payment(detail.bill)
        
        # If this is a wallet payment (auto-deduction)
        elif payment.action == 'invoice':
            for detail in payment.details.all():
                if detail.bill:
                    detail.bill.update_totals()
                    # Update prescription status for pharmacy items
                    update_prescription_status_on_payment(detail.bill)


class PaymentDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Payment.objects.select_related("patient", "created_by").prefetch_related("details").all()
    serializer_class = PaymentSerializer
    permission_classes = [IsAuthenticated]


# ------------------------------------------------------------
# WALK-IN PAYMENT PROCESSING SERVICE
# ------------------------------------------------------------
# views/cashier_views.py


@api_view(["POST"])
@permission_classes([IsAuthenticated])
@transaction.atomic
def walkin_payment_view(request):
    """
    💵 Cashier handles a direct (walk-in) payment.
    Can be for a true walk-in (no patient) or a registered patient.

    Payload:
    {
        "patient": <id or null>,
        "services": [
            {"description": "Consultation", "amount": 5000},
            {"description": "Lab test", "amount": 1500}
        ],
        "payment_method": "cash" | "pos" | "transfer" | "wallet",
        "notes": "optional text",
        "is_walkin": true
    }
    """
    print("walkin_payment_view called", request.data)
    data = request.data
    patient_id = data.get("patient")
    services = data.get("services", [])
    payment_method = data.get("payment_method")
    notes = data.get("notes", "")
    is_walkin = data.get("is_walkin", True)

    # --- Validate input ---
    if not services or not isinstance(services, list):
        return Response({"error": "At least one service must be provided."}, status=400)

    if not payment_method:
        return Response({"error": "Payment method is required."}, status=400)

    patient = None
    if patient_id:
        try:
            patient = Patient.objects.get(pk=patient_id)
        except Patient.DoesNotExist:
            return Response({"error": "Patient not found."}, status=404)

    # --- Validate & compute total ---
    bills_data = []
    total_amount = Decimal("0.00")

    for s in services:
        desc = s.get("description")
        amt = s.get("amount")
        if not desc or amt is None:
            return Response({"error": "Each service must include description and amount."}, status=400)
        try:
            amt = Decimal(str(amt))
        except:
            return Response({"error": f"Invalid amount format for '{desc}'."}, status=400)
        if amt <= 0:
            return Response({"error": f"Invalid amount for '{desc}'."}, status=400)

        total_amount += amt
        bills_data.append({"description": desc, "amount": amt})

    # --- Create bills for each service ---
    created_bills = []
    for item in bills_data:
        bill = Bill.objects.create(
            patient=patient,
            description=item["description"],
            amount=item["amount"],
            balance=0,
            status="paid",
            created_by=request.user,
        )
        created_bills.append({"id": bill.id, "amount": item["amount"]})

    # --- Process single payment ---
    try:
        payment = cashier_receive_payment(
            patient=patient,
            bills_data=created_bills,
            payment_method=payment_method,
            created_by=request.user,
            notes=notes or f"Walk-in payment ({payment_method})",
            walk_in=is_walkin,
        )
    except ValidationError as e:
        return Response({"error": str(e)}, status=400)

    serializer = PaymentSerializer(payment)
    return Response(
        {
            "message": "Walk-in payment recorded successfully.",
            "total": total_amount,
            "payment": serializer.data,
        },
        status=201,
    )

    
# ---------------------------------------------------------------------
# 🧾 PAYMENT DETAIL VIEWS
# ---------------------------------------------------------------------

class PaymentDetailListCreateView(generics.ListCreateAPIView):
    queryset = PaymentDetail.objects.select_related("bill", "payment", "created_by").all()
    serializer_class = PaymentDetailSerializer
    permission_classes = [IsAuthenticated]

    @transaction.atomic
    def perform_create(self, serializer):
        instance = serializer.save(created_by=self.request.user)
        if instance.bill:
            instance.bill.update_totals()


class PaymentDetailItemView(generics.RetrieveUpdateDestroyAPIView):
    queryset = PaymentDetail.objects.select_related("bill", "payment", "created_by").all()
    serializer_class = PaymentDetailSerializer
    permission_classes = [IsAuthenticated]


@api_view(["POST"])
@permission_classes([IsAuthenticated])
@transaction.atomic
def pay_bill(request, bill_id):
    """💵 Single bill payment endpoint."""
    try:
        bill = Bill.objects.select_related("patient").get(pk=bill_id)
    except Bill.DoesNotExist:
        return Response({"error": "Bill not found."}, status=status.HTTP_404_NOT_FOUND)

    amount = request.data.get("amount")
    payment_method = request.data.get("payment_method")
    notes = request.data.get("notes", "")

    try:
        payment = process_payment(
            bill=bill,
            amount=amount,
            payment_method=payment_method,
            created_by=request.user,
            notes=notes,
        )
        serializer = PaymentSerializer(payment)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    except ValidationError as e:
        return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
@transaction.atomic
def cashier_process_receipt(request):
    """💵 Multi-bill payment (cashier)."""
    patient_id = request.data.get("patient")
    bills_data = request.data.get("bills", [])
    payment_method = request.data.get("payment_method")
    notes = request.data.get("notes", "")

    try:
        patient = Patient.objects.get(pk=patient_id)
        payment = cashier_receive_payment(
            patient=patient,
            bills_data=bills_data,
            payment_method=payment_method,
            created_by=request.user,
            notes=notes,
        )
        
        # Update prescription status for all paid bills
        for bill_data in bills_data:
            bill_id = bill_data.get("id")
            if bill_id:
                try:
                    bill = Bill.objects.get(pk=bill_id)
                    update_prescription_status_on_payment(bill)
                except Bill.DoesNotExist:
                    pass
        
        serializer = PaymentSerializer(payment)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    except Patient.DoesNotExist:
        return Response({"error": "Patient not found."}, status=status.HTTP_404_NOT_FOUND)
    except ValidationError as e:
        return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)


# ---------------------------------------------------------------------
# 🪙 WALLET VIEWS
# ---------------------------------------------------------------------

class WalletListView(generics.ListAPIView):
    queryset = Wallet.objects.select_related("patient").all()
    serializer_class = WalletSerializer
    permission_classes = [IsAuthenticated]


class WalletDetailView(generics.RetrieveAPIView):
    queryset = Wallet.objects.select_related("patient").all()
    serializer_class = WalletSerializer
    permission_classes = [IsAuthenticated]


@api_view(["POST"])
@permission_classes([IsAuthenticated])
@transaction.atomic
def wallet_deposit(request, pk):
    """Deposit funds into patient wallet using Wallet service."""
    try:
        wallet = Wallet.objects.select_related("patient").get(pk=pk)
    except Wallet.DoesNotExist:
        return Response({"error": "Wallet not found."}, status=status.HTTP_404_NOT_FOUND)

    try:
        amount = float(request.data.get("amount", 0))
    except (TypeError, ValueError):
        return Response({"error": "Invalid deposit amount."}, status=status.HTTP_400_BAD_REQUEST)

    if amount <= 0:
        return Response({"error": "Deposit amount must be greater than zero."}, status=status.HTTP_400_BAD_REQUEST)

    try:
        deposit_to_wallet(wallet.patient, amount, created_by=request.user, payment_method="wallet_deposit")
    except ValidationError as e:
        return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

    return Response({"message": f"₦{amount} deposited successfully."}, status=status.HTTP_201_CREATED)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_patient_bill_records(request, patient):
    from encounters.models import Visit
    visit = Visit.objects.filter(patient=patient, visit_status=True).latest('date_created')
    bills = Bill.objects.filter(patient=patient, encounter__visit__id=visit.id)
    serializer = BillSerializer(bills, many=True)
    data = serializer.data

    return Response(data)