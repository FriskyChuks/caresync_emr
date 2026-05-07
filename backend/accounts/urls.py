from django.urls import path
from .import views

urlpatterns = [
    # path('',views.get_post),
    path('usergroup/',views.UserCategoryListCreateView.as_view()),
    path('gender/',views.GenderListCreateView.as_view()),
    path('marital_status',views.MaritalStatusListCreatetView.as_view()),
    path('religion/',views.ReligionListCreateView.as_view()),
    path('facility-info/', views.FacilityAddressView.as_view(), name='facility-info'),


    # User Management Endpoints
    path('users/', views.UserListView.as_view(), name='user-list'),
    path('users/<int:pk>/', views.UserDetailView.as_view(), name='user-detail'),
    path('users/<int:pk>/toggle-status/', views.UserStatusToggleView.as_view(), name='user-toggle-status'),
    path('users/<int:pk>/toggle-staff/', views.UserStaffToggleView.as_view(), name='user-toggle-staff'),
    
    # Lookup Endpoints
    # path('api/usergroup/', views.UserCategoryListView.as_view(), name='usergroup-list'),
    # path('api/gender/', views.GenderListView.as_view(), name='gender-list'),
    
    # Djoser URLs (keep these for auth)
    # path('auth/', include('djoser.urls')),
    # path('auth/', include('djoser.urls.jwt')),
   
]


