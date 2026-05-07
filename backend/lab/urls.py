from django.urls import path
from .views import *
from .import views

urlpatterns = [
    # ---------------- LAB UNIT ----------------
    path('lab-units/', LabUnitListCreate.as_view(), name='labunit-list'),
    path("lab-units/<int:pk>/", LabUnitDetailView.as_view(), name="labunit-detail"),

    # ---------------- TEST ----------------
    path('tests/create/', CreateTestAPIView.as_view(), name='create-test'),
    path("tests/<int:pk>/", TestDetailView.as_view(), name="test-detail"),

    path('sub-tests/', SubTestListCreate.as_view(), name='subtest-list'),
    path("sub-tests/<int:pk>/", SubTestDetailView.as_view(), name="subtest-detail"),

    # ---------------- REFERENCE RANGE ----------------
    path('reference-ranges/', ReferenceRangeListCreate.as_view(), name='referencerange-list'),
    path("reference-ranges/<int:pk>/", ReferenceRangeDetailView.as_view(), name="ref-detail"),

    # ---------------- TEST REQUEST ----------------
    path("test-requests/", views.TestRequestListView.as_view(), name="test-request-list"),
    path("test-requests/create/", views.TestRequestCreateView.as_view(), name="test-request-create"),
    path("test-requests/<int:pk>/", views.TestRequestDetailView.as_view(), name="test-request-detail"),
    path("test-requests/<int:pk>/update/", views.TestRequestUpdateView.as_view(), name="test-request-update"),
    path("test-request-details/<int:pk>/", views.TestRequestDetailUpdateView.as_view(), name="test-request-detail-update"),
    
    path('patient-requests/<int:patient_id>/', views.PatientLabRequestHistoryView.as_view(), name='patient-lab-history'),
    path("add-results/<int:request_id>/", views.add_lab_result, name="add_lab_result"),

    # ---------------- LAB RESULT ----------------
    path("lab-results/", LabResultListCreateView.as_view()),
    path("lab-results/<int:pk>/", LabResultRetrieveUpdateView.as_view()),
    path("sub-test-results/", SubTestResultCreateView.as_view()),
    path("lab-results/bulk-submit/", LabResultBulkSubmitView.as_view(), name="labresult-bulk-submit"),

    # ---------------- RESULT SUMMARY ----------------
    path("results-summary/by-request/<int:pk>/", LabResultsSummaryView.as_view()),

    # ---------------- PRINT LAB RESULT PDF ----------------
    path("pdf_result/<int:request_id>/print/", PrintLabResultPDF.as_view()),
]



    