from pathlib import Path
from datetime import timedelta
from decouple import config

# ------------------------------------------------------------------------------
# PATHS
# ------------------------------------------------------------------------------

BASE_DIR = Path(__file__).resolve().parent.parent.parent

# ------------------------------------------------------------------------------
# CORE
# ------------------------------------------------------------------------------

SECRET_KEY = config("DJANGO_SECRET_KEY")

DEBUG = config("DEBUG", default=False, cast=bool)

ALLOWED_HOSTS = config(
    "ALLOWED_HOSTS",
    default="localhost,127.0.0.1",
    cast=lambda v: [s.strip() for s in v.split(",")]
)

AUTH_DEFAULT_PASSWORD = config(
    "AUTH_DEFAULT_PASSWORD",
    default="pass"
)

# ------------------------------------------------------------------------------
# APPLICATIONS
# ------------------------------------------------------------------------------

DJANGO_APPS = [
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
]

THIRD_PARTY_APPS = [
    "rest_framework",
    "corsheaders",
    "django_filters",
    "djoser",
    "django_countries",
]

LOCAL_APPS = [
    "accounts",
    "contacts",
    "patients",
    "lab",
    "consultations",
    "home",
    "pharmacies",
    "radiology",
    "triages",
    "encounters",
    "management",
    "appointments",
    "locations",
    "bills",
    "services",
    "clerking",
    "icd11",
    "anc_specialty",
    "ent_specialty",
]

INSTALLED_APPS = DJANGO_APPS + THIRD_PARTY_APPS + LOCAL_APPS

# ------------------------------------------------------------------------------
# MIDDLEWARE
# ------------------------------------------------------------------------------

MIDDLEWARE = [
    "django.middleware.security.SecurityMiddleware",

    "corsheaders.middleware.CorsMiddleware",

    "django.contrib.sessions.middleware.SessionMiddleware",

    "django.middleware.common.CommonMiddleware",

    "django.middleware.csrf.CsrfViewMiddleware",

    "django.contrib.auth.middleware.AuthenticationMiddleware",

    "django.contrib.messages.middleware.MessageMiddleware",

    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]

# ------------------------------------------------------------------------------
# URLS / WSGI
# ------------------------------------------------------------------------------

ROOT_URLCONF = "backend.urls"

WSGI_APPLICATION = "backend.wsgi.application"

ASGI_APPLICATION = "backend.asgi.application"

# ------------------------------------------------------------------------------
# TEMPLATES
# ------------------------------------------------------------------------------

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [
            BASE_DIR / "templates",
        ],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.debug",
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]

# ------------------------------------------------------------------------------
# AUTH
# ------------------------------------------------------------------------------

AUTH_USER_MODEL = "accounts.CustomUser"

AUTH_PASSWORD_VALIDATORS = [
    {
        "NAME":
        "django.contrib.auth.password_validation.UserAttributeSimilarityValidator",
    },
]

# ------------------------------------------------------------------------------
# INTERNATIONALIZATION
# ------------------------------------------------------------------------------

LANGUAGE_CODE = "en-us"

TIME_ZONE = "UTC"

USE_I18N = True

USE_TZ = True

# ------------------------------------------------------------------------------
# STATIC / MEDIA
# ------------------------------------------------------------------------------

STATIC_URL = "/static/"
MEDIA_URL = "/media/"

# Source static files (CSS, JS, images you create)
STATICFILES_DIRS = [
    BASE_DIR / "static",
]

# Where collectstatic outputs files
STATIC_ROOT = Path(
    config(
        "STATIC_ROOT",
        default=BASE_DIR / "staticfiles",
    )
)

# Uploaded media files
MEDIA_ROOT = Path(
    config(
        "MEDIA_ROOT",
        default=BASE_DIR / "media",
    )
)

# ------------------------------------------------------------------------------
# DEFAULT PK
# ------------------------------------------------------------------------------

DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"

# ------------------------------------------------------------------------------
# DJANGO REST FRAMEWORK
# ------------------------------------------------------------------------------

REST_FRAMEWORK = {

    "DEFAULT_RENDERER_CLASSES": [
        "rest_framework.renderers.JSONRenderer",
    ],

    "DEFAULT_PARSER_CLASSES": [
        "rest_framework.parsers.JSONParser",
    ],

    "DEFAULT_AUTHENTICATION_CLASSES": [
        "rest_framework_simplejwt.authentication.JWTAuthentication",
    ],

    "DEFAULT_PERMISSION_CLASSES": [
        "rest_framework.permissions.IsAuthenticatedOrReadOnly",
    ],

    "DEFAULT_FILTER_BACKENDS": [
        "django_filters.rest_framework.DjangoFilterBackend",
    ],
}

# ------------------------------------------------------------------------------
# SIMPLE JWT
# ------------------------------------------------------------------------------

SIMPLE_JWT = {

    "ACCESS_TOKEN_LIFETIME": timedelta(minutes=30),

    "REFRESH_TOKEN_LIFETIME": timedelta(days=1),

    "AUTH_HEADER_TYPES": (
        "CARESYNC",
    ),
}

# ------------------------------------------------------------------------------
# DJOSER
# ------------------------------------------------------------------------------

DJOSER = {

    "LOGIN_FIELD": "username",

    "SERIALIZERS": {

        "user_create":
        "accounts.serializers.CustomUserCreateSerializer",

        "user":
        "accounts.serializers.BasicUserSerializer",

        "current_user":
        "accounts.serializers.BasicUserSerializer",
    },
}

# ------------------------------------------------------------------------------
# LOGGING
# ------------------------------------------------------------------------------

LOGGING = {

    "version": 1,

    "disable_existing_loggers": False,

    "formatters": {

        "verbose": {

            "format":
            "{levelname} {asctime} {module} {message}",

            "style": "{",
        },
    },

    "handlers": {

        "console": {

            "class": "logging.StreamHandler",

            "formatter": "verbose",
        },
    },

    "root": {

        "handlers": [
            "console",
        ],

        "level": config(
            "LOG_LEVEL",
            default="INFO",
        ),
    },
}