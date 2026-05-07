from django.urls import path
from .views import *

urlpatterns = [
    path("ent-clerking/",ENTRegistrationView.as_view(), name="ent-clerking"),
    # GET full clerking
    path("ent-clerking-details/<int:pk>/",ENTClerkingDetailView.as_view()),
    path("ent-clerking-update/<int:pk>/", ENTRegistrationDetailView.as_view()),
    # UPDATE per section
    path("otologic-history/<int:pk>/",OtologicHistoryView.as_view()),
    path("ear-examination/<int:pk>/",EarExaminationView.as_view()),
]

