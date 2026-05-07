from rest_framework import serializers
from accounts.models import CustomUser as User
from patients.serializers import PatientSerializer
from .models import (
    LabUnit, Test, SubTest, ReferenceRange,
    TestRequest, TestRequestDetail,
    LabResult, SubTestResult, TestPanel,TEST_REQUEST_STATUS
)

# ✅ LAB UNIT
class LabUnitSerializer(serializers.ModelSerializer):
    class Meta:
        model = LabUnit
        fields = "__all__"


# ✅ REFERENCE RANGE
class ReferenceRangeSerializer(serializers.ModelSerializer):
    class Meta:
        model = ReferenceRange
        fields = ["id", "gender", "age_min", "age_max", "category", "range_value"]


# ✅ SUB TEST
class SubTestSerializer(serializers.ModelSerializer):
    reference_ranges = ReferenceRangeSerializer(many=True, read_only=True)

    class Meta:
        model = SubTest
        fields = [
            "id", "parameter_name", "si_unit", "price",
            "requires_reference_range", "reference_ranges"
        ]


# ✅ TEST
class TestSerializer(serializers.ModelSerializer):
    sub_tests = SubTestSerializer(many=True)
    reference_ranges = ReferenceRangeSerializer(many=True, required=False)

    class Meta:
        model = Test
        fields = [
            "id", "name", "is_complex", "si_unit", "lab_unit",
            "price", "is_active", "remark", "requires_remark",
            "requires_reference_range", "sub_tests", "reference_ranges"
        ]

    def create(self, validated_data):
        sub_tests_data = validated_data.pop("sub_tests", [])
        reference_ranges_data = validated_data.pop("reference_ranges", [])

        test = Test.objects.create(**validated_data)

        # Create subtests
        for sub_test_data in sub_tests_data:
            ref_ranges = sub_test_data.pop("reference_ranges", [])
            sub_test = SubTest.objects.create(test=test, **sub_test_data)
            for ref_data in ref_ranges:
                ReferenceRange.objects.create(sub_test=sub_test, **ref_data)

        # Create test-level reference ranges
        for ref_data in reference_ranges_data:
            ReferenceRange.objects.create(test=test, **ref_data)

        return test


# lab/serializers.py - Update TestRequestDetailSerializer

class TestRequestDetailSerializer(serializers.ModelSerializer):
    test = TestSerializer(read_only=True)
    test_id = serializers.PrimaryKeyRelatedField(
        queryset=Test.objects.all(),
        source="test",
        write_only=True
    )
    sub_tests = SubTestSerializer(many=True, read_only=True)
    sub_test_ids = serializers.PrimaryKeyRelatedField(
        queryset=SubTest.objects.all(),
        many=True,
        write_only=True,
        required=False
    )
    can_enter_results = serializers.SerializerMethodField()
    status_display = serializers.SerializerMethodField()

    class Meta:
        model = TestRequestDetail
        fields = [
            "id",
            "test",
            "test_id",
            "sub_tests",
            "sub_test_ids",
            "status",
            "status_display",
            "mls_comment",  # ✅ Make sure this is included
            "can_enter_results",
        ]
        read_only_fields = ["status"]  # Remove mls_comment from read_only if present

    def get_can_enter_results(self, obj):
        return obj.can_enter_results()
    
    def get_status_display(self, obj):
        return dict(TEST_REQUEST_STATUS).get(obj.status, obj.status)
    

class TestRequestSerializer(serializers.ModelSerializer):
    # Change this line from:
    # details = TestRequestDetailSerializer(many=True, required=False)
    # To:
    details = TestRequestDetailSerializer(many=True, read_only=True)  # ✅ Make it read_only
    
    patient_info = PatientSerializer(source='patient', read_only=True)
    created_by = serializers.SerializerMethodField(read_only=True)
    payment_summary = serializers.SerializerMethodField()

    class Meta:
        model = TestRequest
        fields = [
            "id", "patient", "patient_info", "requested_by", "request_date",
            "status", "notes", "details", "created_by", "payment_summary"
        ]
        # Add 'details' to read_only_fields to be safe
        read_only_fields = ["status", "request_date", "details"]

    def get_created_by(self, obj):
        if obj.requested_by:
            return f"{obj.requested_by.first_name} {obj.requested_by.last_name}"
        return None
    
    def get_payment_summary(self, obj):
        """Get payment status summary across all details"""
        details = obj.details.all()
        if not details:
            return {"total": 0, "paid": 0, "pending_payment": 0, "all_paid": False}
        
        # Statuses that indicate payment is complete
        payment_complete_statuses = ["paid", "in_progress", "completed"]
        paid_count = sum(1 for d in details if d.status in payment_complete_statuses)
        pending_count = details.count() - paid_count
        
        return {
            "total": details.count(),
            "paid": paid_count,
            "pending_payment": pending_count,
            "all_paid": paid_count == details.count()
        }


# ✅ SUB TEST RESULT
class SubTestResultSerializer(serializers.ModelSerializer):
    subtest_name = serializers.CharField(source='sub_test.parameter_name', read_only=True)

    class Meta:
        model = SubTestResult
        fields = [
            "id","sub_test","result_value", "is_critical", "needs_retest","reference_range","subtest_name"
        ]


class LabResultSerializer(serializers.ModelSerializer):
    sub_test_results = SubTestResultSerializer(many=True, read_only=True)
    test_name = serializers.CharField(source='test.name', read_only=True)

    class Meta:
        model = LabResult
        fields = [
            "id","test_request", "detail", "test","result_value","remark","is_critical","test_name",
            "needs_retest","reference_range","validated_by","validated_at","sub_test_results",
        ]


class SubTestResultInputSerializer(serializers.Serializer):
    sub_test = serializers.IntegerField()
    result_value = serializers.CharField(allow_blank=True, allow_null=True, required=False)
    is_critical = serializers.BooleanField(required=False, default=False)
    needs_retest = serializers.BooleanField(required=False, default=False)
    reference_range = serializers.CharField(allow_blank=True, allow_null=True, required=False)

class LabResultInputSerializer(serializers.Serializer):
    test = serializers.IntegerField()
    test_detail = serializers.IntegerField()  # matches your frontend naming
    result_value = serializers.CharField(allow_blank=True, allow_null=True, required=False)
    remark = serializers.CharField(allow_blank=True, allow_null=True, required=False)
    is_critical = serializers.BooleanField(required=False, default=False)
    needs_retest = serializers.BooleanField(required=False, default=False)
    reference_range = serializers.CharField(allow_blank=True, allow_null=True, required=False)
    # optional nested sub-tests
    sub_tests = SubTestResultInputSerializer(many=True, required=False)
    

class LabRequestResultsSerializer(serializers.Serializer):
    request_info = serializers.SerializerMethodField()
    results = LabResultSerializer(many=True)

    def get_request_info(self, obj):
        req: TestRequest = obj["request"]
        return {
            "id": req.id,
            "patient_name": f"{req.patient.user.first_name} {req.patient.user.last_name}" if req.patient else req.walkin_name,
            "patient_id": req.patient.id if req.patient else None,
            "gender": req.patient.user.gender.title if req.patient else None,
            "age": req.patient.age if req.patient else req.patient.date_of_birth,
            "created_at": req.request_date,
            "status": req.status,
            "requested_by":f"{req.requested_by.first_name} {req.requested_by.last_name}"
        }
