from .base import *

# ------------------------------------------------------------------------------
# PRODUCTION
# ------------------------------------------------------------------------------

DEBUG = False

SECRET_KEY = config("DJANGO_SECRET_KEY")

ALLOWED_HOSTS = config(
    "ALLOWED_HOSTS",
    cast=lambda v: [s.strip() for s in v.split(",")]
)

# ------------------------------------------------------------------------------
# DATABASE (PostgreSQL)
# ------------------------------------------------------------------------------

DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.postgresql",
        "NAME": config("DB_NAME"),
        "USER": config("DB_USER"),
        "PASSWORD": config("DB_PASSWORD"),
        "HOST": config("DB_HOST", default="127.0.0.1"),
        "PORT": config("DB_PORT", default="5432"),
    }
}

# ------------------------------------------------------------------------------
# CORS
# ------------------------------------------------------------------------------

CORS_ALLOWED_ORIGINS = config(
    "CORS_ALLOWED_ORIGINS",
    default="https://caresync.friskytech.com.ng",
    cast=lambda v: [s.strip() for s in v.split(",")]
)

# ------------------------------------------------------------------------------
# CSRF
# ------------------------------------------------------------------------------

CSRF_TRUSTED_ORIGINS = config(
    "CSRF_TRUSTED_ORIGINS",
    default="https://caresync.friskytech.com.ng",
    cast=lambda v: [s.strip() for s in v.split(",")]
)

# ------------------------------------------------------------------------------
# HTTPS
# ------------------------------------------------------------------------------

SECURE_SSL_REDIRECT = True

SESSION_COOKIE_SECURE = True

CSRF_COOKIE_SECURE = True

# ------------------------------------------------------------------------------
# HSTS
# ------------------------------------------------------------------------------

SECURE_HSTS_SECONDS = 31536000

SECURE_HSTS_INCLUDE_SUBDOMAINS = True

SECURE_HSTS_PRELOAD = True

# ------------------------------------------------------------------------------
# PROXY
# ------------------------------------------------------------------------------

SECURE_PROXY_SSL_HEADER = (
    "HTTP_X_FORWARDED_PROTO",
    "https",
)

USE_X_FORWARDED_HOST = True

# ------------------------------------------------------------------------------
# SECURITY HEADERS
# ------------------------------------------------------------------------------

X_FRAME_OPTIONS = "DENY"

SECURE_CONTENT_TYPE_NOSNIFF = True

SECURE_REFERRER_POLICY = "same-origin"

# ------------------------------------------------------------------------------
# COOKIES
# ------------------------------------------------------------------------------

SESSION_COOKIE_HTTPONLY = True

CSRF_COOKIE_HTTPONLY = False

SESSION_COOKIE_SAMESITE = "Lax"

CSRF_COOKIE_SAMESITE = "Lax"

# ------------------------------------------------------------------------------
# EMAIL
# ------------------------------------------------------------------------------

EMAIL_BACKEND = "django.core.mail.backends.smtp.EmailBackend"

EMAIL_HOST = config("EMAIL_HOST", default="")

EMAIL_PORT = config("EMAIL_PORT", default=587, cast=int)

EMAIL_HOST_USER = config("EMAIL_HOST_USER", default="")

EMAIL_HOST_PASSWORD = config("EMAIL_HOST_PASSWORD", default="")

EMAIL_USE_TLS = config("EMAIL_USE_TLS", default=True, cast=bool)

DEFAULT_FROM_EMAIL = config(
    "DEFAULT_FROM_EMAIL",
    default="noreply@caresync.friskytech.com.ng"
)

SERVER_EMAIL = DEFAULT_FROM_EMAIL

# ------------------------------------------------------------------------------
# LOGGING
# ------------------------------------------------------------------------------

LOGGING["root"]["level"] = config(
    "LOG_LEVEL",
    default="INFO"
)