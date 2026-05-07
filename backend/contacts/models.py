from django.db import models
from accounts.models import *
from django_countries.fields import CountryField


class Continent(models.Model):
    title = models.CharField(max_length=50)

    def __str__(self):
        return self.title 

class Country(models.Model):
    title = models.CharField(max_length=50)
    continent = models.ForeignKey(Continent,on_delete=models.CASCADE ,related_name='country_continent')

    def __str__(self):
        return self.title

class State(models.Model):
    title = models.CharField(max_length=50)
    country = models.ForeignKey(Country,on_delete=models.CASCADE)

    def __str__(self):
        return self.title


class LocalGovernmentArea(models.Model):
    title = models.CharField(max_length=100)
    state = models.ForeignKey(State,on_delete=models.CASCADE, null=True, blank=True)

    def __str__(self):
        return self.title


class ResidentialAddress(models.Model):
    user = models.OneToOneField(CustomUser, on_delete=models.CASCADE)
    country = models.ForeignKey(State, on_delete=models.CASCADE, null=True,blank=True, related_name="residental_country")
    national_id = models.IntegerField(null=True, blank=True)
    state_of_origin = models.ForeignKey(State, on_delete=models.SET_NULL, null=True,blank=True)
    local_government_area = models.ForeignKey(LocalGovernmentArea, on_delete=models.SET_NULL, null=True,blank=True)
    address = models.CharField(max_length=500)
    town = models.CharField(max_length=100)

    def __str__(self):
        return f"{self.user} | {self.address}, {self.state_of_origin}"

class PermanentAddress(models.Model):
    user = models.OneToOneField(CustomUser, on_delete=models.CASCADE)
    address = models.CharField(max_length=100)
    state_of_residence = models.ForeignKey(State, on_delete=models.SET_NULL, null=True, blank=True)
    local_government_area_of_residence = models.ForeignKey(LocalGovernmentArea, on_delete=models.SET_NULL, null=True, blank=True)
    town = models.CharField(max_length=100)
    

    def __str__(self):
        return f"{self.user} | {self.address}, {self.state_of_residence}"

class NextOfKin(models.Model):
    user = models.OneToOneField(CustomUser, on_delete=models.CASCADE)
    full_names = models.CharField(max_length=50)
    phone_no = models.CharField(max_length=15) 
    address = models.CharField(max_length=150)
    email = models.EmailField(blank=True, null=True)  

    def __str__(self):
        return f"{self.user} | {self.full_names} ({self.phone_no})"
