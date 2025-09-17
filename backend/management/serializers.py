# management/serializers.py
from rest_framework import serializers

from accounts.models import CustomUser as User

class UserSearchSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ("id", "username", "email", "first_name", "last_name", "is_active", "user_category")


class ResetPasswordSerializer(serializers.Serializer):
    user_id = serializers.IntegerField(required=False)
    username = serializers.CharField(required=False, allow_blank=True)
    email = serializers.EmailField(required=False, allow_blank=True)
    # NOTE: we will use DEFAULT password set server-side; new_password optional if you want custom,
    # but per your requirement we will set to default password in the codebase.
    new_password = serializers.CharField(required=False, allow_blank=True)

    def validate(self, attrs):
        if not (attrs.get("user_id") or attrs.get("username") or attrs.get("email")):
            raise serializers.ValidationError("Provide user_id or username or email to identify the user.")
        new_password = attrs.get("new_password")
        if new_password and len(new_password) < 8:
            raise serializers.ValidationError("new_password must be at least 8 characters long.")
        return attrs
