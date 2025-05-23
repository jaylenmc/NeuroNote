from django.db import models
from authentication.models import AuthUser

class Quiz(models.Model):
    topic = models.CharField(max_length=255, null=True, blank=True)
    question = models.TextField(null=True, blank=True)
    answer = models.TextField(null=True, blank=True)
    user = models.ForeignKey(AuthUser, on_delete=models.CASCADE, null=True)