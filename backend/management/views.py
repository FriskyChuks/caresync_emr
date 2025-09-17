# management/views.py
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework import status
from django.db.models import Q
from django.conf import settings
from django.contrib.auth.hashers import make_password
import logging

from accounts.models import CustomUser as User

from .serializers import UserSearchSerializer, ResetPasswordSerializer
from .permissions import IsInUserCategory, allowed_user_categories
from rest_framework.permissions import IsAuthenticated

logger = logging.getLogger(__name__)

@api_view(["GET"])
@allowed_user_categories("developer", "support", "nurse")  # change allowed categories per your needs
@permission_classes([IsAuthenticated, IsInUserCategory])
def search_users(request):
    """
    GET /management/users/?q=<query>
    Returns up to first 50 users matching username/email/first_name/last_name.
    """
    q = request.query_params.get("q", "").strip()
    if not q:
        return Response({"detail": "Query param 'q' is required."}, status=status.HTTP_400_BAD_REQUEST)

    qs = User.objects.filter(
        Q(username__icontains=q) |
        Q(email__icontains=q) |
        Q(first_name__icontains=q) |
        Q(last_name__icontains=q)
    ).order_by("username")[:50]

    serializer = UserSearchSerializer(qs, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)


@api_view(["POST"])
@allowed_user_categories("developer", "support")  # only developer/support allowed to reset
@permission_classes([IsAuthenticated, IsInUserCategory])
def reset_user_password(request):
    """
    POST /management/reset-password/
    Payload: { user_id | username | email, optional new_password }
    If new_password omitted, password is set to server DEFAULT (settings.AUTH_DEFAULT_PASSWORD).
    Password is not returned in response.
    """
    serializer = ResetPasswordSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    data = serializer.validated_data

    # find user
    try:
        if data.get("user_id"):
            user = User.objects.get(pk=data["user_id"])
        elif data.get("username"):
            user = User.objects.get(username=data["username"])
        else:
            user = User.objects.get(email=data["email"])
    except User.DoesNotExist:
        return Response({"detail": "User not found."}, status=status.HTTP_404_NOT_FOUND)

    # decide password: use supplied or default in settings
    new_password = data.get("new_password") or getattr(settings, "AUTH_DEFAULT_PASSWORD", None)
    if not new_password:
        # fallback safety
        return Response({"detail": "No default password configured on server."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    # set password (make sure we hash it)
    user.password = make_password(new_password)
    user.save(update_fields=["password"])

    logger.info("Password reset (to default) for user '%s' by admin '%s'", user.username, request.user.username)

    # Do NOT return the password. Return only a success message.
    return Response({"detail": f"Password for user '{user.username}' has been reset to default."}, status=status.HTTP_200_OK)
