# accounts/models.py
from django.db import models
from django.contrib.auth.base_user import BaseUserManager
from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin

# REMOVE these imports - they cause circular dependency
# from pharmacies.models import PharmacyStore
# from lab.models import LabUnit

class CustomUserManager(BaseUserManager):
    def create_superuser(self, first_name, last_name, password, **otherfields):
        otherfields.setdefault('is_staff', True)
        otherfields.setdefault('is_superuser', True)
        otherfields.setdefault('is_active', True)
        if otherfields.get('is_staff') is not True:
            raise ValueError('Superuser must be assigned to is_staff = True')
        if otherfields.get('is_superuser') is not True:
            raise ValueError('Superuser must be assigned to is_superuser = True')
       
        return self.create_user(first_name, last_name, password, **otherfields)
       
    def create_user(self, first_name, last_name, password, **otherfields):
        if not first_name:
            raise ValueError('You must provide a first name')
        if not last_name:
            raise ValueError('You must provide a last name')
        
        # Filter otherfields to only include valid CustomUser model fields
        valid_fields = {}
        model_field_names = [field.name for field in self.model._meta.get_fields()]
        
        for key, value in otherfields.items():
            if key in model_field_names:
                valid_fields[key] = value
        
        user = self.model(
            first_name=first_name, 
            last_name=last_name, 
            **valid_fields
        )
        user.set_password(password)
        user.save()
        return user

class UserCategory(models.Model):
    title = models.CharField(max_length=100, unique=True)
    def __str__(self):
        return self.title

class Gender(models.Model):
    title = models.CharField(max_length=10)
    def __str__(self):
        return self.title

class MaritalStatus(models.Model):
    title = models.CharField(max_length=20)
    def __str__(self):
        return self.title

class Religion(models.Model):
    title = models.CharField(max_length=20)
    def __str__(self):
        return self.title

class CustomUser(AbstractBaseUser, PermissionsMixin):
    first_name = models.CharField(max_length=200)
    last_name = models.CharField(max_length=200)
    other_name = models.CharField(max_length=100, blank=True, null=True)
    username = models.CharField(max_length=100, unique=True)
    email = models.EmailField(unique=True, blank=True, null=True)
    gender = models.ForeignKey(Gender, on_delete=models.SET_NULL, null=True, blank=True)
    user_category = models.ForeignKey(UserCategory, on_delete=models.CASCADE, null=True, blank=True)
    
    # Use string references to avoid circular imports
    pharmacy_store = models.ForeignKey(
        'pharmacies.PharmacyStore',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='pharmacy_users'
    )
    lab_unit = models.ForeignKey(
        'lab.LabUnit',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='lab_users'
    )
    
    is_active = models.BooleanField(default=False)
    is_staff = models.BooleanField(default=False)
    is_intern = models.BooleanField(default=False)
    is_pharmacy_store_manager = models.BooleanField(default=False)
    
    USERNAME_FIELD = 'username'
    REQUIRED_FIELDS = ['first_name', 'last_name']
    objects = CustomUserManager()
    
    def __str__(self):
        return f"{self.first_name} {self.last_name}"
    
    def get_full_name(self):
        """Return the full name of the user"""
        if self.other_name:
            return f"{self.first_name} {self.other_name} {self.last_name}"
        return f"{self.first_name} {self.last_name}"
    
    def get_short_name(self):
        """Return the short name of the user"""
        return self.first_name
    
    @property
    def current_store_id(self):
        """Backward compatibility property - returns pharmacy_store id if exists"""
        return self.pharmacy_store.id if self.pharmacy_store else None

class FacilityAddress(models.Model):
    facility_name = models.CharField(max_length=225)
    sub_name = models.CharField(max_length=225, null=True, blank=True)
    address = models.CharField(max_length=225)
    phone1 = models.CharField(max_length=14)
    phone2 = models.CharField(max_length=14, null=True, blank=True)
    email = models.EmailField(null=True, blank=True)
    website = models.URLField()

    def __str__(self):
        return f'Phone 1: {self.facility_name} | email: {self.email}'