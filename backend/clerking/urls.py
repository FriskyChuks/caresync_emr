from django.urls import path
from .views import *

urlpatterns = [
    path("notetype/", NoteTypeListCreateView.as_view(), name="note-type"),
    path("notetype/<int:pk>/", NoteTypeDetailView.as_view(), name="notetype-detail"),

    path("note/", NoteListCreateView.as_view(), name="note"),
    path("note/<int:pk>/", NoteDetailView.as_view(), name="note-detail"),
    path("note/update/<int:pk>/", NoteRetrieveUpdateView.as_view(), name="note-detail"),
    path('patient_notes/<int:patient_id>/', patient_notes, name='patient_notes'),

]