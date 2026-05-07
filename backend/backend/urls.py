from accounts.views import CustomTokenObtainPairView
from rest_framework_simplejwt.views import TokenRefreshView

from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('admin/', admin.site.urls),

    # API Endpoints
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
    path('clerkingapi/',include('clerking.urls')),
    path('pharmacyapi/',include('pharmacies.urls')),
    path('billsapi/', include('bills.urls')),
    path('servicesapi/', include('services.urls')),
    path('appointmentapi/', include('appointments.urls')),
    path('icd11api/', include('icd11.urls')),

    # Speciality Clinics
    path('anc_specialtyapi/', include('anc_specialty.urls')),
    path('entapi/', include('ent_specialty.urls')),

    # Djoser and JWT Authentication
    path("auth/jwt/create/", CustomTokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("auth/jwt/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    path("auth/", include("djoser.urls")),
    path("auth/", include("djoser.urls.jwt")),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
