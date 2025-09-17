# management/permissions.py
from rest_framework import permissions

def allowed_user_categories(*categories):
    """
    Decorator to attach allowed_categories to a view function.
    Usage:
      @allowed_user_categories("developer", "support")
      def my_view(...):
          ...
    """
    lower = [c.lower() for c in categories]

    def decorator(view_func):
        setattr(view_func, "allowed_categories", lower)
        return view_func
    return decorator


class IsInUserCategory(permissions.BasePermission):
    """
    Permission that allows access if request.user.user_category is in the view's
    allowed_categories (case-insensitive), or if user is superuser.
    Works for function-based views (walks __wrapped__ chain if needed).
    """

    message = "You do not have permission to perform this action."

    def _get_allowed_categories_from_view(self, view):
        # try to find attribute on wrapper chain
        candidate = getattr(view, "allowed_categories", None)
        if candidate is not None:
            return candidate
        # unwrap decorated functions
        func = getattr(view, "__wrapped__", None)
        visited = set()
        while func and func not in visited:
            candidate = getattr(func, "allowed_categories", None)
            if candidate is not None:
                return candidate
            visited.add(func)
            func = getattr(func, "__wrapped__", None)
        return None

    def has_permission(self, request, view):
        user = request.user
        if not (user and user.is_authenticated):
            return False

        # superusers bypass category checks
        if getattr(user, "is_superuser", False):
            return True

        allowed = self._get_allowed_categories_from_view(view)
        if not allowed:
            # safer to deny by default if no categories were set
            return False

        user_cat = getattr(user, "user_category", None)
        if not user_cat:
            return False

        return str(user_cat).lower() in [c.lower() for c in allowed]
