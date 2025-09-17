from django.urls import path
from .import views


urlpatterns = [
    path('clerking/', views.ClerkingListCreateView.as_view()),
    path('notes/', views.NoteTypeListCreateView.as_view()),
    ]

