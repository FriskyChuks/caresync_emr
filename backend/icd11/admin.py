from django.contrib import admin
from django.urls import reverse
from django.utils.html import format_html
from django.utils import timezone
from django.db.models import Count, Q
from .models import (
    ICD11Chapter, ICD11Block, ICD11Category, ICD11Grouping,
    ICD11Diagnosis, ICD11DiagnosisHistory
)


class ICD11GroupingInline(admin.TabularInline):
    """Inline admin for groupings"""
    model = ICD11Grouping
    extra = 0
    fields = ['grouping_type', 'grouping_value']
    readonly_fields = ['grouping_type', 'grouping_value']
    can_delete = False
    max_num = 5
    
    def has_add_permission(self, request, obj=None):
        return False
    
    def has_delete_permission(self, request, obj=None):
        return False


class ICD11CategoryInlineForChapter(admin.TabularInline):
    """Inline admin for categories under chapters"""
    model = ICD11Category
    extra = 0
    fields = ['code', 'title', 'depth_in_kind', 'is_leaf', 'is_residual']
    readonly_fields = ['code', 'title', 'depth_in_kind', 'is_leaf', 'is_residual']
    can_delete = False
    show_change_link = True
    fk_name = 'chapter'
    
    def has_add_permission(self, request, obj=None):
        return False
    
    def has_delete_permission(self, request, obj=None):
        return False
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related('chapter')[:50]


class ICD11CategoryInlineForBlock(admin.TabularInline):
    """Inline admin for categories under blocks"""
    model = ICD11Category
    extra = 0
    fields = ['code', 'title', 'depth_in_kind', 'is_leaf', 'is_residual']
    readonly_fields = ['code', 'title', 'depth_in_kind', 'is_leaf', 'is_residual']
    can_delete = False
    show_change_link = True
    fk_name = 'block'
    
    def has_add_permission(self, request, obj=None):
        return False
    
    def has_delete_permission(self, request, obj=None):
        return False
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related('block')[:50]


class ICD11DiagnosisHistoryInline(admin.TabularInline):
    """Inline admin for diagnosis history"""
    model = ICD11DiagnosisHistory
    extra = 0
    fields = ['field_name', 'old_value', 'new_value', 'changed_by', 'changed_date']
    readonly_fields = ['field_name', 'old_value', 'new_value', 'changed_by', 'changed_date']
    can_delete = False
    max_num = 0
    
    def has_add_permission(self, request, obj=None):
        return False
    
    def has_delete_permission(self, request, obj=None):
        return False


class ICD11ChapterAdmin(admin.ModelAdmin):
    list_display = ['chapter_no', 'code', 'title_preview', 'block_count', 'category_count', 'view_blocks_link', 'view_categories_link']
    list_display_links = ['chapter_no', 'title_preview']
    search_fields = ['title', 'code', 'chapter_no']
    list_filter = ['chapter_no']
    list_per_page = 50
    ordering = ['chapter_order', 'chapter_no']
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('chapter_no', 'code', 'title')
        }),
        ('Statistics', {
            'fields': ('block_count_display', 'category_count_display'),
            'classes': ('collapse',)
        }),
    )
    
    readonly_fields = ['block_count_display', 'category_count_display']
    
    def title_preview(self, obj):
        """Show truncated title"""
        return obj.title[:80] + '...' if len(obj.title) > 80 else obj.title
    title_preview.short_description = 'Title'
    
    def block_count_display(self, obj):
        """Display block count"""
        count = obj.blocks.count()
        return format_html('<span style="font-weight: bold; color: #2c3e50;">{}</span>', count)
    block_count_display.short_description = 'Number of Blocks'
    
    def category_count_display(self, obj):
        """Display category count"""
        count = obj.categories.count()
        return format_html('<span style="font-weight: bold; color: #27ae60;">{}</span>', count)
    category_count_display.short_description = 'Number of Categories'
    
    def block_count(self, obj):
        """Display block count with link"""
        count = obj.blocks.count()
        url = reverse('admin:icd11_icd11block_changelist') + f'?chapter__id__exact={obj.id}'
        return format_html('<a href="{}" style="color: #2980b9;">{}</a>', url, count)
    block_count.short_description = 'Blocks'
    
    def category_count(self, obj):
        """Display category count with link"""
        count = obj.categories.count()
        url = reverse('admin:icd11_icd11category_changelist') + f'?chapter__id__exact={obj.id}'
        return format_html('<a href="{}" style="color: #27ae60;">{}</a>', url, count)
    category_count.short_description = 'Categories'
    
    def view_blocks_link(self, obj):
        """Link to view blocks in this chapter"""
        url = reverse('admin:icd11_icd11block_changelist') + f'?chapter__id__exact={obj.id}'
        return format_html('<a href="{}" class="button">📦 View Blocks</a>', url)
    view_blocks_link.short_description = 'Blocks'
    
    def view_categories_link(self, obj):
        """Link to view categories in this chapter"""
        url = reverse('admin:icd11_icd11category_changelist') + f'?chapter__id__exact={obj.id}'
        return format_html('<a href="{}" class="button">🏷️ View Categories</a>', url)
    view_categories_link.short_description = 'Categories'
    
    inlines = [ICD11CategoryInlineForChapter]
    
    def get_queryset(self, request):
        queryset = super().get_queryset(request)
        return queryset.annotate(
            block_count=Count('blocks', distinct=True),
            category_count=Count('categories', distinct=True)
        )


class ICD11BlockAdmin(admin.ModelAdmin):
    list_display = ['block_id', 'title_preview', 'chapter_link', 'parent_block_link', 'depth_in_kind', 'category_count', 'is_residual', 'view_categories_link']
    list_display_links = ['block_id', 'title_preview']
    search_fields = ['title', 'block_id']
    list_filter = ['chapter__chapter_no', 'depth_in_kind', 'is_residual']
    list_per_page = 50
    ordering = ['depth_in_kind', 'block_id']
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('block_id', 'title', 'chapter', 'parent_block')
        }),
        ('Classification Details', {
            'fields': ('depth_in_kind', 'is_residual')
        }),
        ('Statistics', {
            'fields': ('category_count_display',),
            'classes': ('collapse',)
        }),
    )
    
    readonly_fields = ['category_count_display']
    
    def title_preview(self, obj):
        """Show truncated title"""
        return obj.title[:60] + '...' if len(obj.title) > 60 else obj.title
    title_preview.short_description = 'Title'
    
    def chapter_link(self, obj):
        """Link to the chapter"""
        if obj.chapter:
            url = reverse('admin:icd11_icd11chapter_change', args=[obj.chapter.id])
            return format_html('<a href="{}" style="color: #2980b9;">Chapter {}</a>', url, obj.chapter.chapter_no)
        return '-'
    chapter_link.short_description = 'Chapter'
    
    def parent_block_link(self, obj):
        """Link to parent block"""
        if obj.parent_block:
            url = reverse('admin:icd11_icd11block_change', args=[obj.parent_block.id])
            return format_html('<a href="{}">{}</a>', url, obj.parent_block.block_id)
        return '-'
    parent_block_link.short_description = 'Parent Block'
    
    def category_count_display(self, obj):
        """Display category count"""
        count = obj.categories.count()
        return format_html('<span style="font-weight: bold; color: #27ae60;">{}</span>', count)
    category_count_display.short_description = 'Number of Categories'
    
    def category_count(self, obj):
        """Display category count with link"""
        count = obj.categories.count()
        url = reverse('admin:icd11_icd11category_changelist') + f'?block__id__exact={obj.id}'
        return format_html('<a href="{}" style="color: #27ae60;">{}</a>', url, count)
    category_count.short_description = 'Categories'
    
    def view_categories_link(self, obj):
        """Link to view categories in this block"""
        url = reverse('admin:icd11_icd11category_changelist') + f'?block__id__exact={obj.id}'
        return format_html('<a href="{}" class="button">🏷️ View Categories</a>', url)
    view_categories_link.short_description = 'Categories'
    
    inlines = [ICD11CategoryInlineForBlock]
    
    def get_queryset(self, request):
        queryset = super().get_queryset(request)
        return queryset.select_related('chapter', 'parent_block').annotate(
            category_count=Count('categories', distinct=True)
        )


class ICD11CategoryAdmin(admin.ModelAdmin):
    list_display = ['code', 'title_preview', 'chapter_link', 'block_link', 'parent_code_link', 'depth_in_kind', 'is_leaf_badge', 'is_residual_badge', 'grouping_badges']
    list_display_links = ['code', 'title_preview']
    search_fields = ['code', 'title']
    list_filter = ['chapter__chapter_no', 'depth_in_kind', 'is_leaf', 'is_residual', 'block__block_id']
    list_per_page = 100
    ordering = ['code']
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('code', 'title', 'chapter', 'block', 'parent_category')
        }),
        ('Classification Details', {
            'fields': ('depth_in_kind', 'is_leaf', 'is_residual')
        }),
        ('Statistics', {
            'fields': ('child_count_display', 'grouping_count_display'),
            'classes': ('collapse',)
        }),
    )
    
    readonly_fields = ['child_count_display', 'grouping_count_display']
    
    def title_preview(self, obj):
        """Show truncated title"""
        max_len = 80
        return obj.title[:max_len] + '...' if len(obj.title) > max_len else obj.title
    title_preview.short_description = 'Title'
    
    def chapter_link(self, obj):
        """Link to the chapter"""
        if obj.chapter:
            url = reverse('admin:icd11_icd11chapter_change', args=[obj.chapter.id])
            return format_html('<a href="{}" style="color: #2980b9;">Chapter {}</a>', url, obj.chapter.chapter_no)
        return '-'
    chapter_link.short_description = 'Chapter'
    
    def block_link(self, obj):
        """Link to the block"""
        if obj.block:
            url = reverse('admin:icd11_icd11block_change', args=[obj.block.id])
            return format_html('<a href="{}">{}</a>', url, obj.block.block_id)
        return '-'
    block_link.short_description = 'Block'
    
    def parent_code_link(self, obj):
        """Link to parent category"""
        if obj.parent_category:
            url = reverse('admin:icd11_icd11category_change', args=[obj.parent_category.id])
            return format_html('<a href="{}">{}</a>', url, obj.parent_category.code)
        return '-'
    parent_code_link.short_description = 'Parent'
    
    def is_leaf_badge(self, obj):
        """Display leaf status as badge"""
        if obj.is_leaf:
            return format_html('<span style="background-color: #27ae60; color: white; padding: 2px 8px; border-radius: 12px; font-size: 11px;">✓ LEAF</span>')
        return format_html('<span style="background-color: #95a5a6; color: white; padding: 2px 8px; border-radius: 12px; font-size: 11px;">HAS CHILDREN</span>')
    is_leaf_badge.short_description = 'Leaf Status'
    
    def is_residual_badge(self, obj):
        """Display residual status as badge"""
        if obj.is_residual:
            return format_html('<span style="background-color: #e67e22; color: white; padding: 2px 8px; border-radius: 12px; font-size: 11px;">⚠️ RESIDUAL</span>')
        return format_html('<span style="background-color: #3498db; color: white; padding: 2px 8px; border-radius: 12px; font-size: 11px;">STANDARD</span>')
    is_residual_badge.short_description = 'Type'
    
    def grouping_badges(self, obj):
        """Display grouping information as badges"""
        groupings = obj.groupings.all()
        if groupings:
            badges = []
            for g in groupings:
                colors = {
                    'grouping1': '#3498db',
                    'grouping2': '#9b59b6',
                    'grouping3': '#e74c3c',
                    'grouping4': '#f39c12',
                    'grouping5': '#1abc9c'
                }
                color = colors.get(g.grouping_type, '#95a5a6')
                badges.append(format_html(
                    '<span style="background-color: {}; color: white; padding: 2px 6px; margin: 2px; border-radius: 10px; font-size: 10px; display: inline-block;">{}</span>',
                    color, g.grouping_value[:20]
                ))
            return format_html(' '.join(badges))
        return '-'
    grouping_badges.short_description = 'Groupings'
    
    def child_count_display(self, obj):
        """Display number of child categories"""
        count = obj.children.count()
        if count > 0:
            url = reverse('admin:icd11_icd11category_changelist') + f'?parent_category__id__exact={obj.id}'
            return format_html('<a href="{}" style="font-weight: bold; color: #2980b9;">{} child categories</a>', url, count)
        return format_html('<span style="color: #7f8c8d;">No children</span>')
    child_count_display.short_description = 'Children'
    
    def grouping_count_display(self, obj):
        """Display number of groupings"""
        count = obj.groupings.count()
        if count > 0:
            return format_html('<span style="font-weight: bold; color: #8e44ad;">{} groupings</span>', count)
        return '-'
    grouping_count_display.short_description = 'Groupings'
    
    inlines = [ICD11GroupingInline]
    
    def get_queryset(self, request):
        queryset = super().get_queryset(request)
        return queryset.select_related('chapter', 'block', 'parent_category').prefetch_related('groupings', 'children')
    
    actions = ['mark_as_leaf', 'mark_as_non_leaf', 'export_selected']
    
    def mark_as_leaf(self, request, queryset):
        """Mark selected categories as leaf nodes"""
        updated = queryset.update(is_leaf=True)
        self.message_user(request, f'✅ {updated} categories marked as leaf nodes.')
    mark_as_leaf.short_description = "Mark selected as leaf nodes"
    
    def mark_as_non_leaf(self, request, queryset):
        """Mark selected categories as non-leaf nodes"""
        updated = queryset.update(is_leaf=False)
        self.message_user(request, f'✅ {updated} categories marked as non-leaf nodes.')
    mark_as_non_leaf.short_description = "Mark selected as non-leaf nodes"
    
    def export_selected(self, request, queryset):
        """Export selected categories as CSV"""
        import csv
        from django.http import HttpResponse
        
        response = HttpResponse(content_type='text/csv')
        response['Content-Disposition'] = 'attachment; filename="icd11_export.csv"'
        
        writer = csv.writer(response)
        writer.writerow(['Code', 'Title', 'Chapter', 'Block', 'Parent Code', 'Depth', 'Is Leaf', 'Is Residual'])
        
        for obj in queryset.select_related('chapter', 'block', 'parent_category'):
            writer.writerow([
                obj.code,
                obj.title,
                f"Chapter {obj.chapter.chapter_no}" if obj.chapter else '',
                obj.block.block_id if obj.block else '',
                obj.parent_category.code if obj.parent_category else '',
                obj.depth_in_kind,
                'Yes' if obj.is_leaf else 'No',
                'Yes' if obj.is_residual else 'No'
            ])
        
        self.message_user(request, f'📊 Exported {queryset.count()} categories.')
        return response
    export_selected.short_description = "Export selected as CSV"


class ICD11GroupingAdmin(admin.ModelAdmin):
    list_display = ['category_link', 'grouping_type_colored', 'grouping_value', 'created_at']
    list_filter = ['grouping_type']
    search_fields = ['category__code', 'category__title', 'grouping_value']
    list_per_page = 50
    
    def category_link(self, obj):
        """Link to the category"""
        if obj.category:
            url = reverse('admin:icd11_icd11category_change', args=[obj.category.id])
            return format_html('<a href="{}" style="font-weight: bold;">{}</a>', url, obj.category.code)
        return '-'
    category_link.short_description = 'Category Code'
    
    def grouping_type_colored(self, obj):
        """Display grouping type with color"""
        colors = {
            'grouping1': '#3498db',
            'grouping2': '#9b59b6',
            'grouping3': '#e74c3c',
            'grouping4': '#f39c12',
            'grouping5': '#1abc9c'
        }
        color = colors.get(obj.grouping_type, '#95a5a6')
        display_name = dict(ICD11Grouping.GROUPING_CHOICES).get(obj.grouping_type, obj.grouping_type)
        return format_html(
            '<span style="background-color: {}; color: white; padding: 2px 8px; border-radius: 12px; font-size: 11px;">{}</span>',
            color, display_name
        )
    grouping_type_colored.short_description = 'Grouping Type'
    
    def get_queryset(self, request):
        queryset = super().get_queryset(request)
        return queryset.select_related('category')


class ICD11DiagnosisAdmin(admin.ModelAdmin):
    list_display = ['id', 'patient_link', 'category_link', 'diagnosis_type_badge', 'status_badge', 'diagnosed_date', 'is_confirmed_badge', 'actions_buttons']
    list_display_links = ['id', 'patient_link']
    search_fields = ['patient__first_name', 'patient__last_name', 'patient__mrn', 'category__code', 'category__title', 'notes']
    list_filter = ['diagnosis_type', 'status', 'is_confirmed', 'diagnosed_date']
    list_per_page = 50
    ordering = ['-diagnosed_date']
    
    fieldsets = (
        ('Patient & Encounter Information', {
            'fields': ('patient', 'encounter_route')
        }),
        ('Diagnosis Details', {
            'fields': ('category', 'diagnosis_type', 'status', 'severity', 'notes', 'clinical_description')
        }),
        ('Clinical Information', {
            'fields': ('diagnosed_by', 'diagnosed_date', 'resolved_date'),
            'classes': ('collapse',)
        }),
        ('Confirmation Details', {
            'fields': ('is_confirmed', 'confirmed_by', 'confirmed_date'),
            'classes': ('collapse',)
        }),
        ('Tracking', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    readonly_fields = ['created_at', 'updated_at']
    
    def patient_link(self, obj):
        """Link to the patient"""
        if obj.patient:
            url = reverse('admin:patients_patient_change', args=[obj.patient.id])
            return format_html('<a href="{}" style="font-weight: bold;">{}</a>', url, obj.patient)
        return '-'
    patient_link.short_description = 'Patient'
    
    def category_link(self, obj):
        """Link to the ICD-11 category"""
        if obj.category:
            url = reverse('admin:icd11_icd11category_change', args=[obj.category.id])
            return format_html('<a href="{}">{}</a>', url, obj.category.code)
        return '-'
    category_link.short_description = 'ICD-11 Code'
    
    def diagnosis_type_badge(self, obj):
        """Display diagnosis type with color"""
        colors = {
            'primary': '#2ecc71',
            'secondary': '#3498db',
            'complication': '#e74c3c',
            'comorbidity': '#f39c12',
            'provisional': '#95a5a6',
            'differential': '#9b59b6',
            'rule_out': '#e67e22'
        }
        color = colors.get(obj.diagnosis_type, '#95a5a6')
        display_name = dict(ICD11Diagnosis.DIAGNOSIS_TYPES).get(obj.diagnosis_type, obj.diagnosis_type)
        return format_html(
            '<span style="background-color: {}; color: white; padding: 2px 8px; border-radius: 12px; font-size: 11px;">{}</span>',
            color, display_name
        )
    diagnosis_type_badge.short_description = 'Type'
    
    def status_badge(self, obj):
        """Display status with color"""
        colors = {
            'active': '#2ecc71',
            'resolved': '#95a5a6',
            'ruled_out': '#e74c3c',
            'inactive': '#7f8c8d'
        }
        color = colors.get(obj.status, '#95a5a6')
        display_name = dict(ICD11Diagnosis.DIAGNOSIS_STATUS).get(obj.status, obj.status)
        return format_html(
            '<span style="background-color: {}; color: white; padding: 2px 8px; border-radius: 12px; font-size: 11px;">{}</span>',
            color, display_name.upper()
        )
    status_badge.short_description = 'Status'
    
    def is_confirmed_badge(self, obj):
        """Display confirmation status as badge"""
        if obj.is_confirmed:
            return format_html('<span style="background-color: #27ae60; color: white; padding: 2px 8px; border-radius: 12px; font-size: 11px;">✓ CONFIRMED</span>')
        return format_html('<span style="background-color: #e74c3c; color: white; padding: 2px 8px; border-radius: 12px; font-size: 11px;">⚠ PENDING</span>')
    is_confirmed_badge.short_description = 'Confirmed'
    
    def actions_buttons(self, obj):
        """Display action buttons"""
        buttons = []
        if obj.status == 'active' and not obj.is_confirmed:
            url = reverse('admin:icd11_icd11diagnosis_confirm', args=[obj.id])
            buttons.append(format_html('<a href="{}" class="button" style="background-color: #27ae60; margin-right: 5px;">✓ Confirm</a>', url))
        if obj.status == 'active':
            url = reverse('admin:icd11_icd11diagnosis_resolve', args=[obj.id])
            buttons.append(format_html('<a href="{}" class="button" style="background-color: #e67e22;">✓ Resolve</a>', url))
        return format_html(''.join(buttons)) if buttons else '-'
    actions_buttons.short_description = 'Actions'
    
    inlines = [ICD11DiagnosisHistoryInline]
    
    def get_queryset(self, request):
        queryset = super().get_queryset(request)
        return queryset.select_related('patient', 'category', 'encounter_route', 'diagnosed_by', 'confirmed_by')
    
    actions = ['confirm_selected', 'resolve_selected', 'export_selected_diagnoses']
    
    def confirm_selected(self, request, queryset):
        """Confirm selected diagnoses"""
        for diagnosis in queryset.filter(is_confirmed=False):
            diagnosis.confirm(request.user)
        count = queryset.filter(is_confirmed=True).count()
        self.message_user(request, f'✅ {count} diagnoses confirmed.')
    confirm_selected.short_description = "Confirm selected diagnoses"
    
    def resolve_selected(self, request, queryset):
        """Resolve selected diagnoses"""
        for diagnosis in queryset.filter(status='active'):
            diagnosis.resolve(request.user)
        count = queryset.filter(status='resolved').count()
        self.message_user(request, f'✅ {count} diagnoses resolved.')
    resolve_selected.short_description = "Resolve selected diagnoses"
    
    def export_selected_diagnoses(self, request, queryset):
        """Export selected diagnoses as CSV"""
        import csv
        from django.http import HttpResponse
        
        response = HttpResponse(content_type='text/csv')
        response['Content-Disposition'] = 'attachment; filename="icd11_diagnoses_export.csv"'
        
        writer = csv.writer(response)
        writer.writerow([
            'ID', 'Patient', 'ICD-11 Code', 'Diagnosis Title', 'Type', 
            'Status', 'Severity', 'Diagnosed By', 'Diagnosed Date', 
            'Resolved Date', 'Confirmed', 'Confirmed By', 'Notes'
        ])
        
        for obj in queryset.select_related('patient', 'category', 'diagnosed_by', 'confirmed_by'):
            writer.writerow([
                obj.id,
                str(obj.patient),
                obj.category.code,
                obj.category.title[:100],
                obj.get_diagnosis_type_display(),
                obj.get_status_display(),
                obj.severity or '',
                str(obj.diagnosed_by) if obj.diagnosed_by else '',
                obj.diagnosed_date.strftime('%Y-%m-%d %H:%M') if obj.diagnosed_date else '',
                obj.resolved_date.strftime('%Y-%m-%d %H:%M') if obj.resolved_date else '',
                'Yes' if obj.is_confirmed else 'No',
                str(obj.confirmed_by) if obj.confirmed_by else '',
                obj.notes[:200] or ''
            ])
        
        self.message_user(request, f'📊 Exported {queryset.count()} diagnoses.')
        return response
    export_selected_diagnoses.short_description = "Export selected as CSV"
    
    def get_urls(self):
        from django.urls import path
        from django.shortcuts import get_object_or_404, redirect
        from django.contrib import messages
        
        urls = super().get_urls()
        custom_urls = [
            path('<int:diagnosis_id>/confirm/', self.admin_site.admin_view(self.confirm_diagnosis), name='icd11_icd11diagnosis_confirm'),
            path('<int:diagnosis_id>/resolve/', self.admin_site.admin_view(self.resolve_diagnosis), name='icd11_icd11diagnosis_resolve'),
        ]
        return custom_urls + urls
    
    def confirm_diagnosis(self, request, diagnosis_id):
        """Custom view to confirm a diagnosis"""
        diagnosis = get_object_or_404(ICD11Diagnosis, id=diagnosis_id)
        if not diagnosis.is_confirmed:
            diagnosis.confirm(request.user)
            messages.success(request, f'Diagnosis {diagnosis.id} has been confirmed.')
        else:
            messages.warning(request, f'Diagnosis {diagnosis.id} is already confirmed.')
        return redirect('admin:icd11_icd11diagnosis_changelist')
    
    def resolve_diagnosis(self, request, diagnosis_id):
        """Custom view to resolve a diagnosis"""
        diagnosis = get_object_or_404(ICD11Diagnosis, id=diagnosis_id)
        if diagnosis.status == 'active':
            diagnosis.resolve(request.user)
            messages.success(request, f'Diagnosis {diagnosis.id} has been resolved.')
        else:
            messages.warning(request, f'Diagnosis {diagnosis.id} is already resolved or inactive.')
        return redirect('admin:icd11_icd11diagnosis_changelist')


class ICD11DiagnosisHistoryAdmin(admin.ModelAdmin):
    list_display = ['diagnosis_link', 'field_name', 'old_value_truncated', 'new_value_truncated', 'changed_by', 'changed_date']
    list_filter = ['field_name', 'changed_date']
    search_fields = ['diagnosis__patient__first_name', 'diagnosis__patient__last_name', 'field_name', 'old_value', 'new_value']
    list_per_page = 50
    ordering = ['-changed_date']
    
    def diagnosis_link(self, obj):
        """Link to the diagnosis"""
        if obj.diagnosis:
            url = reverse('admin:icd11_icd11diagnosis_change', args=[obj.diagnosis.id])
            return format_html('<a href="{}">Diagnosis #{}</a>', url, obj.diagnosis.id)
        return '-'
    diagnosis_link.short_description = 'Diagnosis'
    
    def old_value_truncated(self, obj):
        """Truncated old value"""
        if obj.old_value:
            return obj.old_value[:100] + '...' if len(obj.old_value) > 100 else obj.old_value
        return '-'
    old_value_truncated.short_description = 'Old Value'
    
    def new_value_truncated(self, obj):
        """Truncated new value"""
        if obj.new_value:
            return obj.new_value[:100] + '...' if len(obj.new_value) > 100 else obj.new_value
        return '-'
    new_value_truncated.short_description = 'New Value'
    
    def get_queryset(self, request):
        queryset = super().get_queryset(request)
        return queryset.select_related('diagnosis', 'changed_by')
    
    def has_add_permission(self, request):
        return False
    
    def has_delete_permission(self, request, obj=None):
        return False
    
    def has_change_permission(self, request, obj=None):
        return False


# Register all models with custom admin classes
admin.site.register(ICD11Chapter, ICD11ChapterAdmin)
admin.site.register(ICD11Block, ICD11BlockAdmin)
admin.site.register(ICD11Category, ICD11CategoryAdmin)
admin.site.register(ICD11Grouping, ICD11GroupingAdmin)
admin.site.register(ICD11Diagnosis, ICD11DiagnosisAdmin)
admin.site.register(ICD11DiagnosisHistory, ICD11DiagnosisHistoryAdmin)

# Customize admin site header
admin.site.site_header = 'ICD-11 Classification System'
admin.site.site_title = 'ICD-11 Admin Portal'
admin.site.index_title = 'Welcome to ICD-11 Management'