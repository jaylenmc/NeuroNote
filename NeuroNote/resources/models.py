from django.db import models
from documents.models import Document
from authentication.models import AuthUser

class Resource(models.Model):
    class FileTypes(models.TextChoices):
        EPUB = "epub", "epub"
        MOBI = "mobi", "mobi"
        AZW3 = "azw3", "azw3"
        DOCX = "docx", "docx"
        PDF = "pdf", "PDF"
        LINK = "link", "Link"

    class ResourceTypes(models.TextChoices):
        TEXTBOOK = "textbook", "Textbook"
        PDF = "pdf", "PDF"
        LINK = "link", "Link"
    
    user = models.ForeignKey(AuthUser, on_delete=models.CASCADE)
    resource_type = models.CharField(max_length=8)

class FileUpload(models.Model):
    def user_directory_path(instance, filename):
        return f"user_{instance.user.id}/{filename.split('.')[1]}/{filename}"
      
    user = models.ForeignKey(AuthUser, on_delete=models.CASCADE, related_name="file_user")
    file_upload = models.FileField(upload_to=user_directory_path)
    uploaded_at = models.DateTimeField(auto_now_add=True)
    file_name = models.CharField(max_length=255, default='Untitled')
    resource = models.ForeignKey(Resource, on_delete=models.CASCADE, null=True, related_name="file_resource")

class LinkUpload(models.Model):
    link = models.URLField(max_length=255)
    title = models.CharField(max_length=255)
    resource = models.ForeignKey(Resource, on_delete=models.CASCADE, null=True, related_name="link_resource")