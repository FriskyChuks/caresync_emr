from django.apps import AppConfig


class EncountersConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'encounters'

    def ready(self):
        # import signals so they get registered
        from . import signals  # noqa
