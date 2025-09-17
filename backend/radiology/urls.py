from django.urls import path
from .import views


urlpatterns = [
    path('request/', views.RadiologyRequestListCreateView.as_view()),
    path('rtest/', views.RadiologyTestListCreateView.as_view()),
    path('rresult/', views.RadiologyResultListCreateView.as_view()),
]