# patients/serializers.py
from rest_framework import serializers
from .models import Patient
from encounters.serializers import *
from encounters.models import *
from contacts.serializers import *
import base64
from django.core.files.base import ContentFile
import uuid
import logging

logger = logging.getLogger(__name__)

class PatientSerializer(serializers.ModelSerializer):
    registered_by = serializers.SerializerMethodField(read_only=True)
    marital_status = serializers.SerializerMethodField(read_only=True)
    religion = serializers.SerializerMethodField(read_only=True)
    active_visit = serializers.SerializerMethodField(read_only=True)
    user_info = serializers.SerializerMethodField(read_only=True)

    residential_address_data = serializers.SerializerMethodField(read_only=True)
    permanent_address_data = serializers.SerializerMethodField(read_only=True)
    next_of_kin_data = serializers.SerializerMethodField(read_only=True)

    # Encounter: transfer-related fields
    active_transfer = serializers.SerializerMethodField(read_only=True)
    transfer_request_status = serializers.SerializerMethodField(read_only=True)

    # WALLET INFO
    wallet_balance = serializers.SerializerMethodField(read_only=True)
    
    # Field for accepting base64 encoded photo during create/update
    photo_base64 = serializers.CharField(write_only=True, required=False, allow_blank=True, allow_null=True)
    
    # Make created_by accept ID input
    created_by = serializers.PrimaryKeyRelatedField(
        read_only=False,
        queryset=CustomUser.objects.all(),
        required=False,
        allow_null=True
    )

    photo_url = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = Patient
        exclude = ["user"]
        extra_kwargs = {
            'photo': {'required': False}
        }
    
    def to_internal_value(self, data):
        # Handle case where photo is sent as part of multipart data
        if isinstance(data, dict) and 'photo' in data:
            # If photo is empty or null, remove it to avoid validation issues
            if not data['photo'] or data['photo'] == '':
                data.pop('photo')
        return super().to_internal_value(data)

    def get_user_info(self, obj):
        if obj.user:
            return {
                "id": obj.user.id,
                "first_name": obj.user.first_name,
                "last_name": obj.user.last_name,
                "fullname": f"{obj.user.first_name} {obj.user.last_name}",
                "email": obj.user.email,
                "gender": {
                    "id": obj.user.gender.id,
                    "title": obj.user.gender.title
                } if obj.user.gender else None,
                "is_active": obj.user.is_active,
            }
        return None

    def get_registered_by(self, obj):
        if obj.created_by:
            return {
                "id": obj.created_by.id,
                "first_name": obj.created_by.first_name, 
                "last_name": obj.created_by.last_name,
                "fullname": f"{obj.created_by.first_name} {obj.created_by.last_name}"
            }
        return None

    def get_marital_status(self, obj):
        if obj.marital_status:
            return obj.marital_status.title
        return None

    def get_religion(self, obj):
        if obj.religion:
            return obj.religion.title
        return None

    def get_active_visit(self, obj):
        visit = Visit.objects.filter(patient=obj, visit_status=True).last()
        if visit:
            data = VisitSerializer(visit).data
            # Add room/bed from latest accepted transfer (if any)
            try:
                transfer = TransferRequest.objects.filter(
                    visit=visit, status="accepted"
                ).select_related("assigned_room").order_by("-accepted_at").first()
                if transfer and transfer.assigned_room:
                    data["room"] = transfer.assigned_room.name
                    data["bed_number"] = transfer.assigned_bed_number
                else:
                    data["room"] = None
                    data["bed_number"] = None
            except Exception:
                data["room"] = None
                data["bed_number"] = None
            return data
        return None

    def get_residential_address_data(self, obj):
        address = getattr(obj.user, "residentialaddress", None)
        if address:
            return ResidentialAddressSerializer(address).data
        return None

    def get_permanent_address_data(self, obj):
        addr = getattr(obj.user, "permanentaddress", None)
        return PermanentAddressSerializer(addr).data if addr else None

    def get_next_of_kin_data(self, obj):
        nok = getattr(obj.user, "nextofkin", None)
        return NextOfKinSerializer(nok).data if nok else None

    # ------------------------------
    # transfer-related helper fields
    # ------------------------------
    def get_active_transfer(self, obj):
        """
        Return the most recent pending TransferRequest for this patient (if any).
        Shape is produced by TransferRequestSerializer (in encounters app).
        """
        try:
            # fetch pending transfer requests for this patient (most recent first)
            tr = TransferRequest.objects.filter(visit__patient=obj, status="pending") \
                                         .select_related("to_ward", "from_clinic", "from_ward", "requested_by") \
                                         .order_by("-created_at").first()
            if not tr:
                return None
            return TransferRequestSerializer(tr).data
        except Exception:
            # be defensive: if something goes wrong, return None rather than raising
            return None
        
    def get_transfer_request_status(self, obj):
        """
        Quick status string for the most recent transfer request (pending/accepted/rejected) or None.
        """
        current_vist = Visit.objects.filter(patient=obj, visit_status=True).last()
        if not current_vist:
            return None
        try:
            latest = TransferRequest.objects.filter(visit__patient=obj, visit=current_vist
                                                    ).order_by("-created_at").first()
            return {
                "status":latest.status if latest else None,
                "reason": latest.rejection_reason if latest and latest.status == "rejected" else None,
                "rejection_date": latest.updated_at if latest else None,
                "rejected_by": f"{latest.handled_by.first_name} {latest.handled_by.last_name}" 
                    if latest and latest.status == "rejected" and latest.handled_by else None,
                "ward": latest.to_ward.name if latest and latest.to_ward else None,
            } if latest else None
        except Exception:
            return None

    def get_wallet_balance(self, obj):
        wallet = getattr(obj, "wallet", None)
        return float(wallet.account_balance) if wallet else 0.0

    def validate_photo_base64(self, value):
        """
        Validate base64 image if provided
        """
        if not value:
            return value
        
        # Check if it's a valid base64 image string
        try:
            # Handle both with and without data:image prefix
            if ';base64,' in value:
                format, imgstr = value.split(';base64,')
                # Validate image format
                if not format.startswith('data:image/'):
                    raise serializers.ValidationError("Invalid image format. Must be a valid image.")
                
                # Get file extension
                ext = format.split('/')[-1]
                if ext.lower() not in ['jpeg', 'jpg', 'png', 'gif']:
                    raise serializers.ValidationError("Unsupported image format. Use JPEG, PNG, or GIF.")
            else:
                # Assume it's raw base64 without prefix
                imgstr = value
            
            # Try to decode to validate base64
            base64.b64decode(imgstr)
            
        except Exception as e:
            raise serializers.ValidationError(f"Invalid base64 image: {str(e)}")
        
        return value

    def to_internal_value(self, data):
        """
        Override to ensure photo_base64 is handled properly
        """
        # Make a copy to avoid modifying the original
        data_copy = data.copy() if hasattr(data, 'copy') else dict(data)
        
        # Call parent to get validated data
        validated_data = super().to_internal_value(data_copy)
        
        # If photo_base64 was in the original data, add it back to validated_data
        # so it's available in create/update methods
        if 'photo_base64' in data:
            validated_data['photo_base64'] = data['photo_base64']
        
        logger.debug(f"PatientSerializer.to_internal_value - validated_data keys: {validated_data.keys()}")
        if 'created_by' in validated_data:
            logger.debug(f"created_by value: {validated_data['created_by']}")
        
        return validated_data

    def create(self, validated_data):
        """
        Create patient with optional base64 photo
        """
        logger.debug(f"PatientSerializer.create - validated_data keys: {validated_data.keys()}")
        
        # Remove photo_base64 from validated_data if it exists
        photo_base64 = validated_data.pop('photo_base64', None)
        logger.debug(f"photo_base64 present: {bool(photo_base64)}")
        
        # Handle base64 photo if provided
        if photo_base64:
            try:
                # Process base64 image
                if ';base64,' in photo_base64:
                    format, imgstr = photo_base64.split(';base64,')
                    ext = format.split('/')[-1]
                else:
                    imgstr = photo_base64
                    ext = 'jpg'  # default extension
                
                # Decode and create file
                image_data = base64.b64decode(imgstr)
                
                # Create file name with timestamp to avoid collisions
                file_name = f"patient_photo_{uuid.uuid4().hex[:10]}.{ext}"
                
                # Create ContentFile and add to validated_data
                validated_data['photo'] = ContentFile(image_data, name=file_name)
                logger.debug(f"Photo processed successfully: {file_name}")
                
            except Exception as e:
                logger.error(f"Failed to process image: {str(e)}")
                raise serializers.ValidationError({"photo_base64": f"Failed to process image: {str(e)}"})
        
        logger.debug(f"Final validated_data keys before create: {validated_data.keys()}")
        
        # Now create the patient with the remaining validated_data
        return super().create(validated_data)

    def update(self, instance, validated_data):
        """
        Update patient with optional base64 photo
        """
        logger.debug(f"PatientSerializer.update - validated_data keys: {validated_data.keys()}")
        
        # Remove photo_base64 from validated_data if it exists
        photo_base64 = validated_data.pop('photo_base64', None)
        logger.debug(f"photo_base64 present: {bool(photo_base64)}")
        
        # Handle base64 photo if provided
        if photo_base64:
            try:
                # Process base64 image
                if ';base64,' in photo_base64:
                    format, imgstr = photo_base64.split(';base64,')
                    ext = format.split('/')[-1]
                else:
                    imgstr = photo_base64
                    ext = 'jpg'  # default extension
                
                # Decode and create file
                image_data = base64.b64decode(imgstr)
                
                # Create file name
                file_name = f"patient_photo_{uuid.uuid4().hex[:10]}.{ext}"
                
                # Create ContentFile and add to validated_data
                validated_data['photo'] = ContentFile(image_data, name=file_name)
                logger.debug(f"Photo processed successfully: {file_name}")
                
            except Exception as e:
                logger.error(f"Failed to process image: {str(e)}")
                raise serializers.ValidationError({"photo_base64": f"Failed to process image: {str(e)}"})
        
        logger.debug(f"Final validated_data keys before update: {validated_data.keys()}")
        
        # Now update the patient with the remaining validated_data
        return super().update(instance, validated_data)
    
    def get_photo_url(self, obj):
        if obj.photo and hasattr(obj.photo, 'url'):
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.photo.url)
            return obj.photo.url
        return None


class PatientPhotoSerializer(serializers.ModelSerializer):
    """
    Simple serializer for photo uploads via multipart/form-data
    Keep this for backward compatibility or direct photo uploads
    """
    class Meta:
        model = Patient
        fields = ['photo']