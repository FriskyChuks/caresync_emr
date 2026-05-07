from django.urls import path
from . import views

urlpatterns = [
    # ==================== CHAPTERS ====================
    path('chapters/', views.ChapterListAPIView.as_view(), name='chapter-list'),
    path('chapters/<str:chapter_no>/', views.ChapterDetailAPIView.as_view(), name='chapter-detail'),
    path('chapters/<str:chapter_no>/blocks/', views.ChapterBlocksAPIView.as_view(), name='chapter-blocks'),
    path('chapters/<str:chapter_no>/categories/', views.ChapterCategoriesAPIView.as_view(), name='chapter-categories'),
    
    # ==================== BLOCKS ====================
    path('blocks/', views.BlockListAPIView.as_view(), name='block-list'),
    path('blocks/<str:block_id>/', views.BlockDetailAPIView.as_view(), name='block-detail'),
    path('blocks/<str:block_id>/categories/', views.BlockCategoriesAPIView.as_view(), name='block-categories'),
    
    # ==================== CATEGORIES ====================
    path('categories/', views.CategoryListAPIView.as_view(), name='category-list'),
    path('categories/<str:code>/', views.CategoryDetailAPIView.as_view(), name='category-detail'),
    path('categories/<str:code>/path/', views.category_path, name='category-path'),
    path('categories/<str:code>/descendants/', views.category_descendants, name='category-descendants'),
    
    # ==================== HIERARCHY ====================
    path('hierarchy/<str:chapter_no>/', views.hierarchy_view, name='hierarchy'),
    
    # ==================== SEARCH ====================
    path('search/', views.search_categories, name='search'),
    path('autocomplete/', views.autocomplete, name='autocomplete'),
    
    # ==================== DIAGNOSES ====================
    path('diagnoses/', views.DiagnosisListCreateAPIView.as_view(), name='diagnosis-list'),
    path('diagnoses/<int:pk>/', views.DiagnosisDetailAPIView.as_view(), name='diagnosis-detail'),
    path('diagnoses/<int:pk>/resolve/', views.resolve_diagnosis, name='diagnosis-resolve'),
    path('diagnoses/<int:pk>/confirm/', views.confirm_diagnosis, name='diagnosis-confirm'),
    path('diagnoses/<int:pk>/history/', views.diagnosis_history, name='diagnosis-history'),
    path('patients/<int:patient_id>/diagnoses/summary/', views.patient_diagnosis_summary, name='patient-diagnosis-summary'),
]