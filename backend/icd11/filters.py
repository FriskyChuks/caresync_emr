from django_filters import rest_framework as filters
from .models import ICD11Category


class CategoryFilter(filters.FilterSet):
    """Filter set for categories"""
    min_depth = filters.NumberFilter(field_name='depth_in_kind', lookup_expr='gte')
    max_depth = filters.NumberFilter(field_name='depth_in_kind', lookup_expr='lte')
    chapter_no = filters.CharFilter(field_name='chapter__chapter_no')
    block_id = filters.CharFilter(field_name='block__block_id')
    parent_code = filters.CharFilter(field_name='parent_category__code')
    is_leaf = filters.BooleanFilter()
    is_residual = filters.BooleanFilter()
    code_startswith = filters.CharFilter(field_name='code', lookup_expr='startswith')
    code_endswith = filters.CharFilter(field_name='code', lookup_expr='endswith')
    
    class Meta:
        model = ICD11Category
        fields = [
            'min_depth', 'max_depth', 'chapter_no', 'block_id',
            'parent_code', 'is_leaf', 'is_residual',
            'code_startswith', 'code_endswith'
        ]