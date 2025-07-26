from django.db import models
from folders.models import Folder

class Document(models.Model):
    title = models.CharField(max_length=255, default="Untitled")
    notes = models.TextField()
    saved = models.DateTimeField(auto_now_add=True)
    folder = models.ForeignKey(Folder, on_delete=models.CASCADE, related_name='document')
    published = models.BooleanField(default=False)

class Tag(models.Model):
    title = models.CharField(max_length=255, null=True)
    document = models.OneToOneField(Document, on_delete=models.CASCADE, related_name='tag')