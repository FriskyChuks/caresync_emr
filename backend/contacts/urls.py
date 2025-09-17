from django.urls import path
from .views import (

    ContinentListCreateView,
    ContinentDetailView,
    CountryListCreateView,
    CountryDetailView,
    StateListCreateView,
    StateDetailView,
    LGAListCreateView,
    LGADetailView,
    ResidentialAddressListCreateView, ResidentialAddressDetailView,
    PermanentAddressListCreateView, PermanentAddressDetailView,
    NextOfKinListCreateView, NextOfKinDetailView,
)

urlpatterns = [
    # Continents
    path("continents/", ContinentListCreateView.as_view(), name="continent-list"),
    path("continents/<int:pk>/", ContinentDetailView.as_view(), name="continent-detail"),

    # Countries
    path("countries/", CountryListCreateView.as_view(), name="country-list"),
    path("countries/<int:pk>/", CountryDetailView.as_view(), name="country-detail"),

    # States
    path("states/", StateListCreateView.as_view(), name="state-list"),
    path("states/<int:pk>/", StateDetailView.as_view(), name="state-detail"),

    # LGAs
    path("lgas/", LGAListCreateView.as_view(), name="lga-list"),
    path("lgas/<int:pk>/", LGADetailView.as_view(), name="lga-detail"),


    path("residential-address/", ResidentialAddressListCreateView.as_view(), name="residential-list"),
    path("residential-address/<int:pk>/", ResidentialAddressDetailView.as_view(), name="residential-detail"),

    # Permanent Address
    path("permanent-address/", PermanentAddressListCreateView.as_view(), name="permanent-list"),
    path("permanent-address/<int:pk>/", PermanentAddressDetailView.as_view(), name="permanent-detail"),

    # Next of Kin
    path("next-of-kin/", NextOfKinListCreateView.as_view(), name="nextofkin-list"),
    path("next-of-kin/<int:pk>/", NextOfKinDetailView.as_view(), name="nextofkin-detail"),
]
