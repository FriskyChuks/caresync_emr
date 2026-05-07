from django.urls import path
from .views import *


urlpatterns = [

    path("obstetric-history/", ObstetricHistoryListCreateView.as_view(), name="obstetric-history-list"),
    path("obstetric-history/<int:pk>/", ObstetricHistoryRetrieveUpdateView.as_view(), name="obstetric-history-detail"),

    path("menstrual-history/",MenstrualGynecologicalHistoryListCreateView.as_view(),name="menstrual-history-list"),
    path("menstrual-history/<int:pk>/", MenstrualGynecologicalHistoryRetrieveUpdateView.as_view(), name="menstrual-history-detail"),

    path("medical-history/",MedicalFamilyHistoryListCreateView.as_view(),name="medical-history-list"),
    path("medical-history/<int:pk>/",MedicalFamilyHistoryRetrieveUpdateView.as_view(), name="medical-history-detail"),

    path("current-pregnancy/",CurrentPregnancyListCreateView.as_view(),name="current-pregnancy-list"),
    path("current-pregnancy/<int:pk>/", CurrentPregnancyRetrieveUpdateView.as_view(),name="current-pregnancy-detail"),

    path("antenatal-vitals/",AntenatalVitalsListCreateView.as_view(),name="antenatal-vitals-list"),
    path("antenatal-vitals/<int:pk>/",  AntenatalVitalsRetrieveUpdateDestroyView.as_view(),name="antenatal-vitals-detail"),

    # ANC Revisit
    path("anc-revisit/", ANCReVisitListCreateView.as_view(),name="anc_revisit_list_create"),
    path("anc-revisit/<int:pk>/", ANCReVisitDetailView.as_view(), name="anc_revisit_detail"),


    # Ultrasound
    path("ultrasound/", UltrasoundRecordListCreateView.as_view(), name="ultrasound_list_create"),
    path("ultrasound/<int:pk>/", UltrasoundRecordDetailView.as_view(), name="ultrasound_detail"),

    # Delivery Record
    path("delivery/", DeliveryRecordListCreateView.as_view(), name="delivery_list_create"),
    path("delivery/<int:pk>/", DeliveryRecordDetailView.as_view(), name="delivery_detail"),
]
