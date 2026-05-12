# radiology/urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'requests', views.InvestigationRequestViewSet, basename='investigation-request')
router.register(r'request-details', views.RequestDetailViewSet, basename='request-detail')
router.register(r'results', views.InvestigationResultViewSet, basename='investigation-result')

urlpatterns = [
    # ============================================================
    # SPECIALIZED ENDPOINTS - MUST COME BEFORE ROUTER
    # ============================================================
    
    # Request listing endpoints
    path('requests/pending/', views.PendingInvestigationRequestsView.as_view(), name='pending-requests'),
    path('requests/today/', views.TodayInvestigationRequestsView.as_view(), name='today-requests'),
    path('patients/<int:patient_id>/requests/', views.PatientInvestigationRequestsView.as_view(), name='patient-requests'),
    
    # Payment Status Sync (NEW)
    path('sync-payment-status/', views.SyncRadiologyPaymentStatusView.as_view(), name='sync-payment-status'),
    
    # Individual Result Submission (NEW - for single detail)
    path('submit-result/<int:detail_id>/', views.SubmitRadiologyResultView.as_view(), name='submit-result'),
    path('get-result/<int:detail_id>/', views.get_radiology_result, name='get-radiology-result'),
    
    # Statistics
    path('statistics/', views.RadiologyStatisticsView.as_view(), name='radiology-statistics'),
    
    # ============================================================
    # ROUTER URLS
    # ============================================================
    path('', include(router.urls)),
    
    # ============================================================
    # UNIT ENDPOINTS
    # ============================================================
    path('units/', views.UnitListCreateView.as_view(), name='unit-list'),
    path('units/<int:pk>/', views.UnitDetailView.as_view(), name='unit-detail'),
    
    # ============================================================
    # INVESTIGATION ENDPOINTS
    # ============================================================
    path('investigations/', views.InvestigationListCreateView.as_view(), name='investigation-list'),
    path('investigations/<int:pk>/', views.InvestigationDetailView.as_view(), name='investigation-detail'),
    path('investigations-update/<int:id>/', views.InvestigationUpdateView.as_view(), name='investigation-update'),

    # ============================================================
    # INVESTIGATION VIEWS ENDPOINTS
    # ============================================================
    path('investigation-views/', views.InvestigationViewListCreateView.as_view(), name='investigation-view-list-create'),
    path('investigation-views/<int:id>/', views.InvestigationViewUpdateView.as_view(), name='investigation-view-update'),

    # ============================================================
    # LEGACY RESULT ENDPOINT (Keep for compatibility)
    # ============================================================
    path('open_investigation_result/<int:detail_id>/', views.open_investigation_result, name='open_investigation_result'),
]