from django.db import models
from authentication.models import AuthUser

class Folder(models.Model):
    name = models.CharField(max_length=255, default='Untitled')
    user = models.ForeignKey(AuthUser, on_delete=models.CASCADE, null=True)
    content_num = models.IntegerField(default=0)

class SubFolder(models.Model):
    name = models.CharField(max_length=255, default='Untitled')
    folder = models.ForeignKey(Folder, on_delete=models.CASCADE, null=True, related_name='sub_folders')
    user = models.ForeignKey(AuthUser, on_delete=models.CASCADE, null=True)
    content_num = models.IntegerField(default=0)