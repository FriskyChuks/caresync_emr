from django.urls import path
from .import views

urlpatterns = [
    # path('',views.get_post),
    path('usergroup/',views.UserCategoryListCreateView.as_view()),
    path('gender/',views.GenderListCreateView.as_view()),
    path('marital_status',views.MaritalStatusListCreatetView.as_view()),
    path('religion/',views.ReligionListCreateView.as_view()),
    # path('patients/',views.PatientRegisterView.as_view()),
   
]