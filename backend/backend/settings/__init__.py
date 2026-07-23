from decouple import config

ENV = config("DJANGO_ENV", default="development").lower()

if ENV == "production":
    from .production import *
elif ENV == "staging":
    from .staging import *
else:
    from .local import *