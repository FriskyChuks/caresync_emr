from django.contrib import admin
from .models import Patient, PatientNumberSequence


@admin.register(Patient)
class PatientAdmin(admin.ModelAdmin):

    list_display = (
        'patient_number',
        'full_name',
        'phone',
        'status',
        'is_emergency',
        'date_created',
        'created_by',
    )

    list_filter = (
        'status',
        'is_emergency',
        'date_created',
        'marital_status',
        'religion',
    )

    search_fields = (
        'patient_number',
        'phone',
        'user__first_name',
        'user__last_name',
        'user__other_name',
        'old_pid',
    )

    readonly_fields = (
        'patient_number',
        'date_created',
        'age_display',
        'full_name',
    )

    ordering = ('-date_created',)

    fieldsets = (
        ("Patient Identity", {
            'fields': (
                'patient_number',
                'user',
                'old_pid',
                'photo',
            )
        }),

        ("Personal Information", {
            'fields': (
                'date_of_birth',
                'age',
                'phone',
                'occupation',
                'status',
            )
        }),

        ("Medical & Social Info", {
            'fields': (
                'marital_status',
                'religion',
                'is_emergency',
            )
        }),

        ("Audit Info", {
            'fields': (
                'created_by',
                'date_created',
            )
        }),

        ("Computed", {
            'fields': (
                'full_name',
                'age_display',
            )
        }),
    )


@admin.register(PatientNumberSequence)
class PatientNumberSequenceAdmin(admin.ModelAdmin):

    list_display = (
        'year',
        'last_number',
    )

    search_fields = ('year',)

    ordering = ('-year',)

    readonly_fields = ('year',)