# admin.py
from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import CustomUser, UserCategory, Gender, MaritalStatus, Religion, FacilityAddress

class CustomUserAdmin(UserAdmin):
    list_display = ('username', 'email', 'first_name', 'last_name', 'other_name', 'user_category', 'pharmacy_store', 'lab_unit', 'gender', 'is_active', 'is_staff', 'is_intern')
    list_filter = ('user_category', 'pharmacy_store', 'lab_unit', 'gender', 'is_active', 'is_staff', 'is_intern')
    search_fields = ('username', 'first_name', 'last_name', 'email')
    ordering = ('username',)
    
    # Define fieldsets explicitly without relying on UserAdmin defaults
    fieldsets = (
        (None, {
            'fields': ('username', 'password')
        }),
        ('Personal Information', {
            'fields': ('first_name', 'last_name', 'other_name', 'email', 'gender')
        }),
        ('Professional Information', {
            'fields': ('user_category', 'pharmacy_store', 'lab_unit', 'is_intern')
        }),
        ('Permissions', {
            'fields': ('is_active', 'is_staff', 'is_superuser','is_pharmacy_store_manager', 'groups', 'user_permissions')
        }),
        ('Important Dates', {
            'fields': ('last_login',)  # Only include fields that exist in your model
        }),
    )
    
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('username', 'password1', 'password2'),
        }),
        ('Personal Information', {
            'fields': ('first_name', 'last_name', 'other_name', 'email', 'gender')
        }),
        ('Professional Information', {
            'fields': ('user_category', 'pharmacy_store', 'lab_unit', 'is_intern')
        }),
        ('Permissions', {
            'fields': ('is_active', 'is_staff', 'is_superuser','is_pharmacy_store_manager')
        }),
    )

admin.site.register(CustomUser, CustomUserAdmin)

# Register other models from accounts app
admin.site.register(UserCategory)
admin.site.register(Gender)
admin.site.register(MaritalStatus)
admin.site.register(Religion)
admin.site.register(FacilityAddress)