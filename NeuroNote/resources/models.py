from django.db import models
from documents.models import Document
from authentication.models import AuthUser
import os

class Resource(models.Model):
    class FileTypes(models.TextChoices):
        TEXTBOOK = "textbook", "Textbook"
        PDF = "pdf", "PDF"
        LINK = "link", "Link"

    def user_directory_path(instance, filename):
        return f"user_{instance.user.id}/{filename.split('.')[1]}/{filename}"
    
    user = models.ForeignKey(AuthUser, on_delete=models.CASCADE)
    file_upload = models.FileField(upload_to=user_directory_path)
    uploaded_at = models.DateTimeField(auto_now_add=True)
    file_name = models.CharField(max_length=255, default='Untitled')