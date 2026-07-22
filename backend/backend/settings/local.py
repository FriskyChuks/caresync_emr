from .base import *

# ------------------------------------------------------------------------------
# DEVELOPMENT
# ------------------------------------------------------------------------------

DEBUG = True

SECRET_KEY = config(
    "DJANGO_SECRET_KEY",
    default="django-insecure-change-me"
)

ALLOWED_HOSTS = [
    "localhost",
    "127.0.0.1",
]

# ------------------------------------------------------------------------------
# DATABASE (MySQL)
# ------------------------------------------------------------------------------

DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.mysql",
        "NAME": config("DB_NAME", default="caresync"),
        "USER": config("DB_USER", default="root"),
        "PASSWORD": config("DB_PASSWORD", default=""),
        "HOST": config("DB_HOST", default="127.0.0.1"),
        "PORT": config("DB_PORT", default="3306"),
        "OPTIONS": {
            "charset": "utf8mb4",
        },
    }
}

# ------------------------------------------------------------------------------
# CORS
# ------------------------------------------------------------------------------

CORS_ALLOWED_ORIGINS = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
]

CSRF_TRUSTED_ORIGINS = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]

# ------------------------------------------------------------------------------
# EMAIL
# ------------------------------------------------------------------------------

EMAIL_BACKEND = "django.core.mail.backends.console.EmailBackend"

# ------------------------------------------------------------------------------
# DEVELOPMENT SECURITY
# ------------------------------------------------------------------------------

SESSION_COOKIE_SECURE = False
CSRF_COOKIE_SECURE = False
SECURE_SSL_REDIRECT = False

# ------------------------------------------------------------------------------
# STATIC FILES
# ------------------------------------------------------------------------------

STATICFILES_DIRS = [
    BASE_DIR / "static",
]

INTERNAL_IPS = [
    "127.0.0.1",
]