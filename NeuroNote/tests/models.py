from django.db import models

class Quiz(models.Model):
    topic = models.CharField(max_length=255, null=True, blank=True)
    question = models.TextField(null=True, blank=True)
    answer = models.TextField(null=True, blank=True)