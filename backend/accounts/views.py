from rest_framework.generics import *
from .models import *
from rest_framework.generics import ListCreateAPIView
from rest_framework_simplejwt.views import TokenObtainPairView
from .serializers import CustomTokenObtainPairSerializer
from rest_framework import generics

from .serializers import *
from patients.models import *
from patients.serializers import *



class UserCategoryListCreateView(ListCreateAPIView):
    queryset = UserCategory.objects.all()
    serializer_class = UserCategorySerializer


class GenderListCreateView(ListCreateAPIView):
    queryset = Gender.objects.all()
    serializer_class = GenderSerializer


class MaritalStatusListCreatetView(ListCreateAPIView):
    queryset = MaritalStatus.objects.all()
    serializer_class = MaritalStatusSerializer


class ReligionListCreateView(ListCreateAPIView):
    queryset = Religion.objects.all()
    serializer_class = ReligionSerializer

class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer


class FacilityAddressView(generics.RetrieveAPIView):
    # Get the first facility address (you might want to adjust this logic)
    def get_object(self):
        return FacilityAddress.objects.first()
    
    serializer_class = FacilityAddressSerializer


# FOR USER MANAGEMENT
from rest_framework import generics, filters, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Q
from rest_framework.pagination import PageNumberPagination

from .models import CustomUser, UserCategory, Gender
from .serializers import (
    BasicUserSerializer, 
    CustomUserCreateSerializer, 
    DetailedUserSerializer,
    UserCategorySerializer,
    GenderSerializer
)

class StandardResultsSetPagination(PageNumberPagination):
    page_size = 10
    page_size_query_param = 'page_size'
    max_page_size = 100

class UserListView(generics.ListCreateAPIView):
    """
    GET: List all users with search and filter capabilities
    POST: Create a new user with patient profile
    """
    permission_classes = [IsAuthenticated, IsAdminUser]
    pagination_class = StandardResultsSetPagination
    
    def get_queryset(self):
        queryset = CustomUser.objects.all().select_related(
            'user_category', 'gender', 'pharmacy_store', 'lab_unit', 'patient_profile'
        )
        
        # Get query parameters
        search = self.request.query_params.get('search', None)
        user_category = self.request.query_params.get('user_category', None)
        is_active = self.request.query_params.get('is_active', None)
        is_staff = self.request.query_params.get('is_staff', None)
        
        print(f"DEBUG - Search term: {search}")  # Debug log
        print(f"DEBUG - Category filter: {user_category}")  # Debug log
        
        # Apply search across multiple fields
        if search and search.strip():
            queryset = queryset.filter(
                Q(username__icontains=search) |
                Q(first_name__icontains=search) |
                Q(last_name__icontains=search) |
                Q(email__icontains=search) |
                Q(other_name__icontains=search)
            )
            print(f"DEBUG - Search results count: {queryset.count()}")  # Debug log
        
        # Apply category filter
        if user_category:
            if user_category.isdigit():
                queryset = queryset.filter(user_category_id=int(user_category))
            else:
                queryset = queryset.filter(user_category__title__icontains=user_category)
            print(f"DEBUG - Category filter results count: {queryset.count()}")  # Debug log
        
        # Apply active status filter
        if is_active is not None:
            is_active_bool = is_active.lower() == 'true'
            queryset = queryset.filter(is_active=is_active_bool)
        
        # Apply staff filter
        if is_staff is not None:
            is_staff_bool = is_staff.lower() == 'true'
            queryset = queryset.filter(is_staff=is_staff_bool)
        
        return queryset.order_by('-id')
    
    def get_serializer_class(self):
        if self.request.method == 'POST':
            return CustomUserCreateSerializer
        return BasicUserSerializer
    
    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        
        # Apply pagination
        page = self.paginate_queryset(queryset)
        
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

class UserDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    GET: Retrieve user details
    PUT/PATCH: Update user details
    DELETE: Delete user
    """
    permission_classes = [IsAuthenticated, IsAdminUser]
    queryset = CustomUser.objects.all().select_related(
        'user_category', 'gender', 'pharmacy_store', 'lab_unit', 'patient_profile'
    )
    
    def get_serializer_class(self):
        if self.request.method in ['PUT', 'PATCH']:
            # For updates, use a serializer that allows partial updates
            return DetailedUserSerializer
        return DetailedUserSerializer
    
    def destroy(self, request, *args, **kwargs):
        user = self.get_object()
        # Prevent deleting yourself
        if user == request.user:
            return Response(
                {"detail": "You cannot delete your own account."},
                status=status.HTTP_400_BAD_REQUEST
            )
        user.delete()
        return Response(
            {"detail": "User deleted successfully."},
            status=status.HTTP_200_OK
        )


class UserCategoryListView(generics.ListAPIView):
    """List all user categories"""
    permission_classes = [IsAuthenticated]
    queryset = UserCategory.objects.all()
    serializer_class = UserCategorySerializer
    pagination_class = None


class GenderListView(generics.ListAPIView):
    """List all genders"""
    permission_classes = [IsAuthenticated]
    queryset = Gender.objects.all()
    serializer_class = GenderSerializer
    pagination_class = None


class UserStatusToggleView(generics.UpdateAPIView):
    """Toggle user active status"""
    permission_classes = [IsAuthenticated, IsAdminUser]
    queryset = CustomUser.objects.all()
    
    def patch(self, request, *args, **kwargs):
        user = self.get_object()
        # Prevent deactivating yourself
        if user == request.user:
            return Response(
                {"detail": "You cannot deactivate your own account."},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        user.is_active = not user.is_active
        user.save()
        
        return Response({
            "detail": f"User {'activated' if user.is_active else 'deactivated'} successfully.",
            "is_active": user.is_active
        })


class UserStaffToggleView(generics.UpdateAPIView):
    """Toggle user staff status"""
    permission_classes = [IsAuthenticated, IsAdminUser]
    queryset = CustomUser.objects.all()
    
    def patch(self, request, *args, **kwargs):
        user = self.get_object()
        # Prevent removing staff from yourself if you're the only admin
        if user == request.user and user.is_staff:
            admin_count = CustomUser.objects.filter(is_staff=True).count()
            if admin_count == 1:
                return Response(
                    {"detail": "You cannot remove your own staff status as you are the only admin."},
                    status=status.HTTP_400_BAD_REQUEST
                )
        
        user.is_staff = not user.is_staff
        user.save()
        
        return Response({
            "detail": f"Staff status {'granted' if user.is_staff else 'revoked'} successfully.",
            "is_staff": user.is_staff
        })