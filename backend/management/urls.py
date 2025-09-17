# management/urls.py
from django.urls import path
from . import views

urlpatterns = [
    path("users/", views.search_users, name="management-user-search"),               # GET ?q=...
    path("reset-password/", views.reset_user_password, name="management-reset-password"),  # POST
]
