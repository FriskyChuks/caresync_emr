from django.urls import path
from . import views

app_name = "services"

urlpatterns = [
    path("", views.ServiceListView.as_view(), name="service-list"),
    path("categories/", views.ServiceCategoryListView.as_view(), name="category-list"),
    path("categories/<int:pk>/services/", views.ServicesByCategoryView.as_view(), name="services-by-category"),
    path("create/", views.ServiceCreateView.as_view(), name="service-create"),
    path('requests/', views.ServiceRequestListCreateView.as_view(), name='service-request-list-create'),
    path('uncompleted_requests/<int:pid>/', views.get_uncompleted_service_requests, name='uncompleted-service-requests'),
    path('search/', views.service_search, name='service-search'),
    path('patient_service_requests/<patient>/', views.get_patient_service_requests, name='patient_service_requests'),
]
