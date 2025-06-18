from django.db import models
from authentication.models import AuthUser

class StudyRoom(models.Model):
    name = models.CharField(max_length=255)
    subject = models.CharField(max_length=255)
    created_at = models.DateField(auto_now_add=True)
    user = models.ForeignKey(AuthUser, on_delete=models.CASCADE)

    def __str__(self):
        return self.name