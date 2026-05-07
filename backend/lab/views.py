from rest_framework import generics
from django.db import transaction
from rest_framework.views import APIView
from rest_framework.decorators import api_view
from django.shortcuts import get_object_or_404
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.permissions import AllowAny
from rest_framework import status
from rest_framework.exceptions import ValidationError

from .serializer import *
from .models import *


class LabUnitListCreate(generics.ListCreateAPIView):
    queryset = LabUnit.objects.all()
    serializer_class = LabUnitSerializer

class LabUnitDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = LabUnit.objects.all()
    serializer_class = LabUnitSerializer    

# ---------------- TEST ----------------
class CreateTestAPIView(generics.ListCreateAPIView):
    queryset = Test.objects.all()
    serializer_class = TestSerializer

class TestDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Test.objects.all()
    serializer_class = TestSerializer    


# ---------------- SUBTEST ----------------
class SubTestListCreate(generics.ListCreateAPIView):
    queryset = SubTest.objects.all()
    serializer_class = SubTestSerializer

class SubTestDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = SubTest.objects.all()
    serializer_class = SubTestSerializer

#---------------- REFERENCE RANGE ----------------
class ReferenceRangeListCreate(generics.ListCreateAPIView):
    queryset = ReferenceRange.objects.all()
    serializer_class = ReferenceRangeSerializer

class ReferenceRangeDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = ReferenceRange.objects.all()
    serializer_class = ReferenceRangeSerializer

#---------------- TEST REQUEST ----------------
# ✅ Create TestRequest + Details (single API call)
# lab/views.py - Updated TestRequestCreateView
class TestRequestCreateView(generics.CreateAPIView):
    queryset = TestRequest.objects.all()
    serializer_class = TestRequestSerializer
    permission_classes = [IsAuthenticated]

    @transaction.atomic
    def create(self, request, *args, **kwargs):
        # Extract details from request data
        data = request.data.copy()
        details_data = data.pop("details", [])  # Remove details from main data
        
        # Create serializer without details
        serializer = self.get_serializer(data=data)
        serializer.is_valid(raise_exception=True)
        test_request = serializer.save()
        
        # Create each detail from the extracted details_data
        for detail_data in details_data:
            test_id = detail_data.get("test_id")
            sub_test_ids = detail_data.get("sub_test_ids", [])
            
            # Create the detail
            detail = TestRequestDetail.objects.create(
                test_request=test_request,
                test_id=test_id,
                status="pending"  # Default status
            )
            
            # Add sub-tests if any
            if sub_test_ids:
                detail.sub_tests.set(sub_test_ids)
        
        # Refresh and return the complete object
        refreshed = TestRequest.objects.prefetch_related(
            "details__test",
            "details__sub_tests",
            "patient__user"
        ).get(pk=test_request.id)
        
        output_serializer = self.get_serializer(refreshed)
        return Response(output_serializer.data, status=status.HTTP_201_CREATED)


# ✅ List all TestRequests
class TestRequestListView(generics.ListAPIView):
    queryset = (
        TestRequest.objects
        .select_related("patient__user", "requested_by")
        .prefetch_related("details__test", "details__sub_tests")
        .order_by("-request_date")
    )
    serializer_class = TestRequestSerializer
    permission_classes = [IsAuthenticated]


# ✅ Retrieve single TestRequest (with all nested details)
class TestRequestDetailView(generics.RetrieveAPIView):
    queryset = (
        TestRequest.objects
        .select_related("patient__user", "requested_by")
        .prefetch_related("details__test", "details__sub_tests")
    )
    serializer_class = TestRequestSerializer
    permission_classes = [IsAuthenticated]


# ✅ Update TestRequest (e.g. mark request as completed, etc.)
class TestRequestUpdateView(generics.UpdateAPIView):
    queryset = TestRequest.objects.all()
    serializer_class = TestRequestSerializer
    permission_classes = [IsAuthenticated]

    @transaction.atomic
    def update(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()

        refreshed = TestRequest.objects.prefetch_related(
            "details__test", "details__sub_tests", "patient__user"
        ).get(pk=instance.id)
        output_serializer = self.get_serializer(refreshed)
        return Response(output_serializer.data)


# lab/views.py - Update TestRequestDetailUpdateView

class TestRequestDetailUpdateView(generics.UpdateAPIView):
    """
    Update a single TestRequestDetail
    Now supports updating status, mls_comment, and other fields
    
    Example payload:
    PATCH /api/lab/test-request-details/5/
    {
        "status": "completed",
        "mls_comment": "Sample hemolyzed, needs recollection"
    }
    """
    queryset = TestRequestDetail.objects.all()
    serializer_class = TestRequestDetailSerializer
    permission_classes = [IsAuthenticated]

    @transaction.atomic
    def update(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        detail = serializer.save()

        # Update parent request status if needed
        parent = detail.test_request
        if parent.details.filter(status="completed").count() == parent.details.count():
            parent.status = "completed"
        elif parent.details.filter(status="billed").exists():
            parent.status = "partly_billed"
        elif parent.details.filter(status="in_progress").exists():
            parent.status = "in_progress"
        parent.save()

        return Response(serializer.data, status=status.HTTP_200_OK)

# SYNC PAYMENT STATUS: Update TestRequestDetail status based on payment (e.g. from billing system)
class SyncPaymentStatusView(APIView):
    """
    Endpoint to sync payment status from bills to TestRequestDetail
    Updates detail.status to 'paid' when bill is fully paid
    """
    permission_classes = [IsAuthenticated]
    
    def post(self, request, *args, **kwargs):
        detail_id = request.data.get("detail_id")
        
        if detail_id:
            detail = get_object_or_404(TestRequestDetail, pk=detail_id)
            self._sync_single_detail(detail)
            return Response({"status": "synced", "detail_status": detail.status})
        
        # Sync all pending/billed details
        details = TestRequestDetail.objects.filter(status__in=["pending", "billed"])
        synced_count = 0
        for detail in details:
            if self._sync_single_detail(detail):
                synced_count += 1
        
        return Response({"message": f"Synced {synced_count} details"})
    
    def _sync_single_detail(self, detail):
        """Sync payment status for a single TestRequestDetail"""
        from bills.models import Bill
        from django.contrib.contenttypes.models import ContentType
        
        # Get the content type for TestRequestDetail
        detail_ct = ContentType.objects.get_for_model(TestRequestDetail)
        
        # Find bills linked to this detail
        bills = Bill.objects.filter(
            content_type=detail_ct,
            object_id=detail.id
        )
        
        if not bills.exists():
            if detail.status not in ["pending", "billed"]:
                detail.status = "pending"
                detail.save(update_fields=["status"])
                return True
            return False
        
        # Check if fully paid
        is_fully_paid = all(bill.status == "paid" for bill in bills)
        
        if is_fully_paid and detail.status in ["pending", "billed"]:
            detail.status = "paid"
            detail.save(update_fields=["status"])
            return True
        elif not is_fully_paid and detail.status == "paid":
            detail.status = "billed"
            detail.save(update_fields=["status"])
            return True
        
        return False


# # ---------------- LAB RESULT ----------------
# -----------------------------------------------------
# GET / POST LabResult (simple result OR parent of sub-results)
# -----------------------------------------------------
class LabResultListCreateView(generics.ListCreateAPIView):
    serializer_class = LabResultSerializer

    def get_queryset(self):
        qs = LabResult.objects.all().select_related("detail", "test")
        test_request = self.request.query_params.get("test_request")
        if test_request:
            qs = qs.filter(test_request=test_request)
        return qs

    def create(self, request, *args, **kwargs):
        detail_id = request.data.get("detail")

        # Ensure no duplicate results for a RequestDetail
        exists = LabResult.objects.filter(detail_id=detail_id).first()
        if exists:
            raise ValidationError("Result already exists for this detail — use UPDATE (PUT).")

        return super().create(request, *args, **kwargs)


# -----------------------------------------------------
# UPDATE LabResult
# -----------------------------------------------------
class LabResultRetrieveUpdateView(generics.RetrieveUpdateAPIView):
    queryset = LabResult.objects.all()
    serializer_class = LabResultSerializer


# -----------------------------------------------------
# CREATE or UPDATE SubTestResult (one-by-one)
# -----------------------------------------------------
class SubTestResultCreateView(generics.CreateAPIView):
    serializer_class = SubTestResultSerializer

    def create(self, request, *args, **kwargs):
        lab_result = request.data.get("lab_result")
        sub_test = request.data.get("sub_test")

        existing = SubTestResult.objects.filter(lab_result=lab_result, sub_test=sub_test).first()

        if existing:
            # Update instead of duplicating
            serializer = self.get_serializer(existing, data=request.data, partial=True)
            serializer.is_valid(raise_exception=True)
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)

        return super().create(request, *args, **kwargs)
    

# MLS Comment Update View (same as before)
class MLSCommentUpdateView(APIView):
    """
    Endpoint for MLS to add/update comments on test results
    """
    permission_classes = [IsAuthenticated]
    
    def patch(self, request, detail_id):
        detail = get_object_or_404(TestRequestDetail, pk=detail_id)
        
        comment = request.data.get("comment", "")
        
        detail.mls_comment = comment
        detail.save(update_fields=["mls_comment"])
        
        return Response({
            "detail_id": detail.id,
            "mls_comment": detail.mls_comment,
            "message": "Comment updated successfully"
        }, status=status.HTTP_200_OK)


# Update LabResultBulkSubmitView - check status instead of payment_status
class LabResultBulkSubmitView(generics.GenericAPIView):
    serializer_class = LabResultInputSerializer
    permission_classes = [IsAuthenticated]

    def post(self, request, *args, **kwargs):
        payload = request.data or {}
        test_request_id = payload.get("test_request")
        validated_by = payload.get("validated_by")
        results = payload.get("results")

        if not test_request_id:
            raise ValidationError({"test_request": "This field is required."})
        if results is None:
            raise ValidationError({"results": "This field is required and must be a list."})
        if not isinstance(results, list):
            raise ValidationError({"results": "Must be a list of result objects."})

        test_request = get_object_or_404(TestRequest, pk=test_request_id)
        saved_results = []
        payment_blocked_items = []

        with transaction.atomic():
            for item in results:
                serializer = LabResultInputSerializer(data=item)
                serializer.is_valid(raise_exception=True)
                data = serializer.validated_data

                detail_id = data.get("test_detail")
                test_id = data.get("test")

                detail = get_object_or_404(TestRequestDetail, pk=detail_id)
                
                # Check if results can be entered (status paid or in_progress)
                if not detail.can_enter_results():
                    payment_blocked_items.append({
                        "detail_id": detail_id,
                        "test_name": detail.test.name,
                        "status": detail.status,
                        "message": f"Cannot enter results - status is {detail.get_status_display()}"
                    })
                    continue
                
                if detail.test.id != test_id:
                    raise ValidationError({"detail": f"Detail {detail_id} does not match test {test_id}."})
                if detail.test_request_id != test_request.id:
                    raise ValidationError({"detail": f"Detail {detail_id} does not belong to test_request {test_request.id}."})

                # Find or create LabResult
                lab_result, created = LabResult.objects.update_or_create(
                    detail_id=detail_id,
                    defaults={
                        "test_request_id": test_request.id,
                        "test_id": test_id,
                        "result_value": data.get("result_value", "") or "",
                        "remark": data.get("remark", "") or "",
                        "is_critical": data.get("is_critical", False),
                        "needs_retest": data.get("needs_retest", False),
                        "reference_range": data.get("reference_range", "") or "",
                        "validated_by_id": validated_by,
                    }
                )

                # Handle nested SubTestResults
                for st in data.get("sub_tests", []):
                    st_id = st.get("sub_test")
                    if not SubTest.objects.filter(pk=st_id).exists():
                        raise ValidationError({"sub_test": f"Invalid sub_test id {st_id}"})

                    SubTestResult.objects.update_or_create(
                        lab_result=lab_result,
                        sub_test_id=st_id,
                        defaults={
                            "result_value": st.get("result_value", "") or "",
                            "is_critical": st.get("is_critical", False),
                            "needs_retest": st.get("needs_retest", False),
                            "reference_range": st.get("reference_range", "") or "",
                        }
                    )

                detail.evaluate_status()  # This will update to in_progress or completed
                saved_results.append(lab_result)

            # Update parent TestRequest status
            test_request.update_status_from_details()

        response_data = {
            "saved_results": LabResultSerializer(saved_results, many=True, context={"request": request}).data,
            "payment_blocked": payment_blocked_items
        }
        
        if payment_blocked_items:
            return Response(response_data, status=status.HTTP_207_MULTI_STATUS)
        
        return Response(response_data, status=status.HTTP_200_OK)
      

class LabResultsSummaryView(generics.RetrieveAPIView):
    """
    Returns:
    - request information
    - all results linked to this request (by the TestRequestDetail foreign key)
    """
    def get(self, request, pk, *args, **kwargs):
        try:
            req = TestRequest.objects.get(pk=pk)
        except TestRequest.DoesNotExist:
            return Response({"detail": "Request not found"}, status=status.HTTP_404_NOT_FOUND)

        # Fetch all results for this request (via `detail__test_request`)
        results = LabResult.objects.filter(detail__test_request=req).select_related(
            "detail", "test"
        ).prefetch_related("sub_test_results")

        serializer = LabRequestResultsSerializer({
            "request": req,
            "results": results
        })

        return Response(serializer.data, status=200)


class PatientLabRequestHistoryView(generics.ListAPIView):
    """
    Returns lab test requests for a patient.
    Optional query param `status` can filter by one or more statuses, comma-separated.
    """
    serializer_class = TestRequestSerializer

    def get_queryset(self):
        pid = self.kwargs.get("patient_id")
        qs = TestRequest.objects.filter(patient_id=pid).prefetch_related("details", "requested_by")

        # Optional status filter
        status_param = self.request.query_params.get("status")
        if status_param:
            statuses = [s.strip() for s in status_param.split(",")]
            qs = qs.filter(status__in=statuses)

        return qs


@api_view(["POST"])
def add_lab_result(request, request_id):
    test_request = get_object_or_404(TestRequest, id=request_id)
    data = request.data.copy()
    data["test_request"] = test_request.id 
    
    serializer = LabResultSerializer(data=data)
    if serializer.is_valid():
        serializer.save(validated_by=request.user if request.user.is_authenticated else None)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    
    # For debugging: log errors
    print(serializer.errors)  
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)



# ---------------- PRINT LAB RESULT PDF ----------------
from django.shortcuts import render, redirect, get_object_or_404
from reportlab.lib.units import mm
from django.shortcuts import get_object_or_404

class PrintLabResultPDF(APIView):
    def get(self, request, request_id):
        try:
            # Fetch the test request
            test_request = get_object_or_404(TestRequest, id=request_id)

            # Fetch ALL results for this request
            lab_results = LabResult.objects.filter(test_request=test_request)\
                                           .select_related("test")

            # Fetch sub test results in one query
            sub_test_results = SubTestResult.objects.filter(
                lab_result__in=lab_results
            ).select_related("sub_test", "lab_result")

            # Facility address block
            address = FacilityAddress.objects.all()

            context = {
                "test_request": test_request,
                "lab_results": lab_results,
                "sub_test_results": sub_test_results,
                "address": address,
            }

            return render(request, "lab/result_print.html", context)

        except Exception as e:
            return Response({"error": str(e)}, status=400)
