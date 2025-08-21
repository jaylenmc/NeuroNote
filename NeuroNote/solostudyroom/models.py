from django.db import models
from authentication.models import AuthUser
from documents.models import Document
from resources.models import FileUpload, LinkUpload

class PinnedResourcesDashboard(models.Model):
    user = models.ForeignKey(AuthUser, on_delete=models.CASCADE)
    document = models.ManyToManyField(Document, blank=True)
    file = models.ManyToManyField(FileUpload, blank=True)
    link = models.ManyToManyField(LinkUpload, blank=True)