from django.db import models
from documents.models import Document
from authentication.models import AuthUser

class ResourceTypes(models.TextChoices):
        TEXTBOOK = "textbook", "Textbook"
        FILE = "file", "File"
        LINK = "link", "Link"

class LinkUpload(models.Model):
    user = models.ForeignKey(AuthUser, on_delete=models.CASCADE, related_name="link_user")
    link = models.URLField(max_length=255)
    title = models.CharField(max_length=255)
    uploaded_at = models.DateTimeField(auto_now_add=True)

    resource_type = models.CharField(default=ResourceTypes.LINK, max_length=8)

class FileUpload(models.Model):
    class FileTypes(models.TextChoices):
        EPUB = "epub", "EPUB"
        MOBI = "mobi", "MOBI"
        AZW3 = "azw3", "AZW3"
        DOCX = "docx", "DOCX"
        PDF = "pdf", "PDF"

    def user_directory_path(instance, filename):
        return f"user_{instance.user.id}/{filename.split('.')[1]}/{filename}"
      
    user = models.ForeignKey(AuthUser, on_delete=models.CASCADE, related_name="file_user")
    file_upload = models.FileField(upload_to=user_directory_path)
    uploaded_at = models.DateTimeField(auto_now_add=True)
    file_name = models.CharField(max_length=255, default='Untitled')

    resource_type = models.CharField(choices=ResourceTypes.choices, max_length=8)
    file_type = models.CharField(choices=FileTypes.choices, max_length=4)
    