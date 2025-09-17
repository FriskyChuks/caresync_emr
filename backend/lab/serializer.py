from rest_framework import serializers
from .models import (
    LabUnit, Test, SubTest, ReferenceRange, TestRequest,
    LabResult, SubTestResult, TestPanel
)

class LabUnitSerializer(serializers.ModelSerializer):
    class Meta:
        model = LabUnit
        fields = '__all__'



#oga abdul
class ReferenceRangeSerializer(serializers.ModelSerializer):
    class Meta:
        model = ReferenceRange
        fields = '__all__'




class SubTestSerializer(serializers.ModelSerializer):
    reference_ranges = ReferenceRangeSerializer(many=True, required=False)

    class Meta:
        model = SubTest
        fields = ['id', 'parameter_name', 'si_unit', 'price', 'requires_reference_range', 'reference_ranges']

class TestSerializer(serializers.ModelSerializer):
    sub_tests = SubTestSerializer(many=True)
    reference_ranges = ReferenceRangeSerializer(many=True, required=False)

    class Meta:
        model = Test
        fields = [
            'id',                    # ✅ include id
            'name',
            'is_complex',
            'si_unit',
            'lab_unit',
            'price',
            'is_active',
            'remark',
            'requires_remark',
            'requires_reference_range',
            'sub_tests',
            'reference_ranges',
        ]
    def create(self, validated_data):
        sub_tests_data = validated_data.pop('sub_tests')
        reference_ranges_data = validated_data.pop('reference_ranges', [])

        test = Test.objects.create(**validated_data)

        for sub_test_data in sub_tests_data:
            ref_ranges = sub_test_data.pop('reference_ranges', [])
            sub_test = SubTest.objects.create(test=test, **sub_test_data)

            for ref_data in ref_ranges:
                ReferenceRange.objects.create(sub_test=sub_test, **ref_data)

        for ref_data in reference_ranges_data:
            ReferenceRange.objects.create(test=test, **ref_data)

        return test




class TestRequestSerializer(serializers.ModelSerializer):
    class Meta:
        model = TestRequest
        fields = '__all__'

#oga abdul
class SubTestResultSerializer(serializers.ModelSerializer):
#   reference_range = ReferenceRangeSerializer(read_only=True)
    sub_test_name = serializers.CharField(source='sub_test.parameter_name', read_only=True)

    class Meta:
        model = SubTestResult
        exclude = ['lab_result']



#oga abdul
class LabResultSerializer(serializers.ModelSerializer):
    sub_test_results = SubTestResultSerializer(many=True, required=False)

    class Meta:
        model = LabResult
        fields = ['id', 'test_request', 'test', 'reference_range', 'result_value',
            'remark', 'validated_by', 'result_date', 'is_critical', 'needs_retest', 'sub_test_results']
        read_only_fields = ['result_date', 'validated_by']

    def create(self, validated_data):
        sub_tests_data = validated_data.pop('sub_test_results', [])
        user = self.context['request'].user
        validated_data['validated_by'] = self.context['request'].user if self.context['request'].user.is_authenticated else None


        lab_result = LabResult.objects.create(**validated_data)

        for sub_test_data in sub_tests_data:
            SubTestResult.objects.create(lab_result=lab_result, **sub_test_data)

        return lab_result


#mine1
# class LabResultSerializer(serializers.ModelSerializer):
#     sub_test_results = SubTestResultSerializer(many=True, required=False)
#     reference_range_detail = ReferenceRangeSerializer(source='reference_range', read_only=True)

#     class Meta:
#         model = LabResult
#         fields = [
#             'id', 'test_request', 'test', 'reference_range', 'reference_range_detail',
#             'result_value', 'remark', 'validated_by', 'result_date',
#             'is_critical', 'needs_retest', 'sub_test_results'
#         ]
#         read_only_fields = ['result_date', 'validated_by']

#mine2
# class LabResultSerializer(serializers.ModelSerializer):
#     sub_test_results = SubTestResultSerializer(many=True, required=False)
#     # +++ NEW: Nest the reference range details +++
#     reference_range = ReferenceRangeSerializer(read_only=True)

#     class Meta:
#         model = LabResult
#         fields = ['id', 'test_request', 'test', 'result_value',
#                   'remark', 'validated_by', 'result_date', 'is_critical', 
#                   'needs_retest', 'sub_test_results', 'reference_range'] # Include reference_range
    

class TestPanelSerializer(serializers.ModelSerializer):
    class Meta:
        model = TestPanel
        fields = '__all__'
