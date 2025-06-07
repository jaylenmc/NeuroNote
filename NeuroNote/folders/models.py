from django.db import models
from authentication.models import AuthUser

class Folder(models.Model):
    name = models.CharField(max_length=255, default='Untitled')
    user = models.ForeignKey(AuthUser, on_delete=models.CASCADE, null=True)
    content_num = models.IntegerField(default=0)