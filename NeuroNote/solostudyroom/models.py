from django.db import models
from authentication.models import AuthUser
from folders.models import Folder
from documents.models import Document

class PinnedResources(models.Model):
    user = models.ForeignKey(AuthUser, on_delete=models.CASCADE)
    folder = models.ForeignKey(Folder, on_delete=models.CASCADE)
    document = models.ForeignKey(Document, on_delete=models.CASCADE)