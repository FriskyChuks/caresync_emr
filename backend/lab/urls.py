from django.urls import path
from .views import *

urlpatterns = [
    path('lab-units/', LabUnitListCreate.as_view(), name='labunit-list'),
    path("lab-units/<int:pk>/", LabUnitDetailView.as_view(), name="labunit-detail"),

    path('tests/create/', CreateTestAPIView.as_view(), name='create-test'),
    path("tests/<int:pk>/", TestDetailView.as_view(), name="test-detail"),

    path('sub-tests/', SubTestListCreate.as_view(), name='subtest-list'),
    path("sub-tests/<int:pk>/", SubTestDetailView.as_view(), name="subtest-detail"),

    path('reference-ranges/', ReferenceRangeListCreate.as_view(), name='referencerange-list'),
    path("reference-ranges/<int:pk>/", ReferenceRangeDetailView.as_view(), name="ref-detail"),

    path('test-requests/', TestRequestListCreate.as_view(), name='testrequest-list'),
    path("test-requests/<int:pk>/", TestRequestDetailView.as_view(), name="request-detail"),

    path('lab-results/', LabResultCreateView.as_view(), name='labresult-list'),
    path("lab-results/<int:pk>/", LabResultDetailView.as_view(), name="labresult-detail"),

    path('subtest-results/', SubTestResultListCreate.as_view(), name='subtestresult-list'),
    path("sub-test-results/<int:pk>/", SubTestResultDetailView.as_view(), name="subtestresult-detail"),

    path('test-panels/', TestPanelListCreate.as_view(), name='testpanel-list'),
    path("test-panels/<int:pk>/", TestPanelDetailView.as_view(), name="testpanel-detail"),
]



    