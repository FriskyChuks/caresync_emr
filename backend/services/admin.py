from django.contrib import admin

from .models import ServiceCategory, Service, ServiceRequest, ServiceRequestDetail

@admin.register(ServiceCategory)
class ServiceCategoryAdmin(admin.ModelAdmin):
    list_display = ('name', 'description')
    search_fields = ('name',)
    ordering = ('name',)

admin.site.register(Service, admin.ModelAdmin)
admin.site.register(ServiceRequest, admin.ModelAdmin)
admin.site.register(ServiceRequestDetail, admin.ModelAdmin)
class ServiceAdmin(admin.ModelAdmin):
    list_display = ('name', 'category', 'price', 'is_active')
    list_filter = ('category', 'is_active')
    search_fields = ('name', 'category__name')
    ordering = ('category__name', 'name')
