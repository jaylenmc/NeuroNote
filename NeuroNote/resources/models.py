from django.db import models
from documents.models import Document
from authentication.models import AuthUser

class Resource(models.Model):
    class FileTypes(models.TextChoices):
        TEXTBOOK = "textbook", "Textbook"
        PDF = "pdf", "PDF"
        LINK = "link", "Link"

    file = models.FileField(max_length=255, choices=FileTypes.choices)

    # def upload_type(instance, filedata):
    #     return f'{filedata['user']}/{filedata['filetype']}'

    uploaded_at = models.DateTimeField()