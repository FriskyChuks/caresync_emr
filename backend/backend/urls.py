from django.contrib import admin
from django.urls import path,include
from accounts.views import CustomTokenObtainPairView
from rest_framework_simplejwt.views import TokenRefreshView

urlpatterns = [
    path('admin/', admin.site.urls),
    path('accountapi/',include('accounts.urls')),
    path('contactsapi/',include('contacts.urls')),
    path('encounterapi/',include('encounters.urls')),
    path('consultationapi/',include('consultations.urls')),
    path('labapi/',include('lab.urls')),
    path('radiologyapi/',include('radiology.urls')),
    path('triageapi/',include('triages.urls')),
    path('management/',include('management.urls')),
    path('locationsapi/',include('locations.urls')),
    path('patientsapi/',include('patients.urls')),


    path("auth/jwt/create/", CustomTokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("auth/jwt/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    path("auth/", include("djoser.urls")),
    path("auth/", include("djoser.urls.jwt")),
]
