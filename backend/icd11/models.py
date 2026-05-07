from django.db import models
from django.conf import settings
from django.utils import timezone


class ICD11Chapter(models.Model):
    code = models.CharField(max_length=10, blank=True, null=True)
    title = models.CharField(max_length=500)
    chapter_no = models.CharField(max_length=10, db_index=True)
    chapter_order = models.IntegerField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['chapter_order', 'code']
        db_table = 'icd11_chapters'
        verbose_name = 'ICD-11 Chapter'
        verbose_name_plural = 'ICD-11 Chapters'
    
    def __str__(self):
        return f"Chapter {self.chapter_no}: {self.title[:50]}"


class ICD11Block(models.Model):
    block_id = models.CharField(max_length=100, db_index=True, unique=True)
    title = models.CharField(max_length=500)
    chapter = models.ForeignKey(ICD11Chapter, on_delete=models.CASCADE, related_name='blocks')
    parent_block = models.ForeignKey('self', on_delete=models.CASCADE, null=True, blank=True, related_name='children')
    depth_in_kind = models.IntegerField(default=1)
    is_residual = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['depth_in_kind', 'block_id']
        db_table = 'icd11_blocks'
        verbose_name = 'ICD-11 Block'
        verbose_name_plural = 'ICD-11 Blocks'
    
    def __str__(self):
        return f"{self.block_id}: {self.title[:50]}"


class ICD11Category(models.Model):
    code = models.CharField(max_length=50, db_index=True, unique=True)
    title = models.CharField(max_length=500)
    chapter = models.ForeignKey(ICD11Chapter, on_delete=models.CASCADE, related_name='categories')
    block = models.ForeignKey(ICD11Block, on_delete=models.SET_NULL, null=True, blank=True, related_name='categories')
    parent_category = models.ForeignKey('self', on_delete=models.SET_NULL, null=True, blank=True, related_name='children')
    depth_in_kind = models.IntegerField(default=1)
    is_leaf = models.BooleanField(default=False)
    is_residual = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['depth_in_kind', 'code']
        db_table = 'icd11_categories'
        verbose_name = 'ICD-11 Category'
        verbose_name_plural = 'ICD-11 Categories'
        indexes = [
            models.Index(fields=['code']),
            models.Index(fields=['depth_in_kind']),
            models.Index(fields=['is_leaf']),
        ]
    
    def __str__(self):
        return f"{self.code}: {self.title[:100]}"


class ICD11Grouping(models.Model):
    GROUPING_CHOICES = [
        ('grouping1', 'Primary Grouping'),
        ('grouping2', 'Secondary Grouping'),
        ('grouping3', 'Tertiary Grouping'),
        ('grouping4', 'Quaternary Grouping'),
        ('grouping5', 'Quinary Grouping'),
    ]
    
    category = models.ForeignKey(ICD11Category, on_delete=models.CASCADE, related_name='groupings')
    grouping_type = models.CharField(max_length=20, choices=GROUPING_CHOICES)
    grouping_value = models.CharField(max_length=100)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        unique_together = ['category', 'grouping_type']
        db_table = 'icd11_groupings'
        verbose_name = 'ICD-11 Grouping'
        verbose_name_plural = 'ICD-11 Groupings'
    
    def __str__(self):
        return f"{self.category.code} -> {self.grouping_value}"


# FOR PATIENT DIAGNOSIS
class ICD11Diagnosis(models.Model):
    DIAGNOSIS_TYPES = [
        ('primary', 'Primary Diagnosis'),
        ('secondary', 'Secondary Diagnosis'),
        ('complication', 'Complication'),
        ('comorbidity', 'Comorbidity'),
        ('provisional', 'Provisional Diagnosis'),
        ('differential', 'Differential Diagnosis'),
        ('rule_out', 'Rule Out'),
    ]
    
    DIAGNOSIS_STATUS = [
        ('active', 'Active'),
        ('resolved', 'Resolved'),
        ('ruled_out', 'Ruled Out'),
        ('inactive', 'Inactive'),
    ]
    
    # Relationships
    category = models.ForeignKey(
        ICD11Category, 
        on_delete=models.PROTECT,
        related_name='diagnoses'
    )
    patient = models.ForeignKey(
        'patients.Patient',
        on_delete=models.CASCADE,
        related_name='diagnoses'
    )
    encounter_route = models.ForeignKey(
        'encounters.EncounterRoute',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='diagnoses'
    )
    
    # Diagnosis details
    diagnosis_type = models.CharField(max_length=20, choices=DIAGNOSIS_TYPES, default='primary')
    status = models.CharField(max_length=20, choices=DIAGNOSIS_STATUS, default='active')
    notes = models.TextField(blank=True, null=True)
    clinical_description = models.TextField(blank=True, null=True)
    severity = models.CharField(max_length=50, blank=True, null=True)
    
    # Metadata
    diagnosed_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='diagnoses_made'
    )
    diagnosed_date = models.DateTimeField(default=timezone.now)
    resolved_date = models.DateTimeField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    # Tracking
    is_confirmed = models.BooleanField(default=False)
    confirmed_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='diagnoses_confirmed'
    )
    confirmed_date = models.DateTimeField(blank=True, null=True)
    
    class Meta:
        ordering = ['-diagnosed_date']
        indexes = [
            models.Index(fields=['patient', 'encounter_route']),
            models.Index(fields=['status']),
            models.Index(fields=['diagnosis_type']),
            models.Index(fields=['diagnosed_date']),
        ]
        db_table = 'icd11_diagnoses'
        verbose_name = 'ICD-11 Diagnosis'
        verbose_name_plural = 'ICD-11 Diagnoses'
    
    def __str__(self):
        return f"{self.patient} - {self.category.code}: {self.category.title[:50]}"
    
    def resolve(self, user=None):
        self.status = 'resolved'
        self.resolved_date = timezone.now()
        if user:
            self.confirmed_by = user
        self.save()
    
    def confirm(self, user):
        self.is_confirmed = True
        self.confirmed_by = user
        self.confirmed_date = timezone.now()
        self.save()


class ICD11DiagnosisHistory(models.Model):
    diagnosis = models.ForeignKey(ICD11Diagnosis, on_delete=models.CASCADE, related_name='history')
    changed_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True)
    changed_date = models.DateTimeField(auto_now_add=True)
    field_name = models.CharField(max_length=100)
    old_value = models.TextField(blank=True, null=True)
    new_value = models.TextField(blank=True, null=True)
    
    class Meta:
        ordering = ['-changed_date']
        db_table = 'icd11_diagnosis_history'
        verbose_name = 'ICD-11 Diagnosis History'
        verbose_name_plural = 'ICD-11 Diagnosis Histories'
    
    def __str__(self):
        return f"{self.diagnosis} - {self.field_name} changed by {self.changed_by}"