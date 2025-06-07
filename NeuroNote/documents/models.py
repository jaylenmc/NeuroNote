from django.db import models
from folders.models import Folder

class Document(models.Model):
    title = models.CharField(max_length=255, default="Untitled")
    notes = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    folder = models.ForeignKey(Folder, on_delete=models.CASCADE, related_name='document')