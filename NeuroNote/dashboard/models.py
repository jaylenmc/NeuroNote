from django.db import models
from authentication.models import AuthUser

class Achievements(models.Model):
    name = models.CharField(unique=True, max_length=255, null=True)
    description = models.TextField(null=True)
    tier = models.CharField(max_length=255, blank=True, null=True)
    family = models.CharField(max_length=255, blank=True, null=True)
    
    def __str__(self):
        return self.name or "Unnamed Achievement"

class Badge(models.Model):
    name = models.CharField(max_length=255, unique=True, null=True)
    description = models.TextField(null=True)

    def __str__(self):
        return self.name

class UserAchievements(models.Model):
    user = models.OneToOneField(AuthUser, on_delete=models.CASCADE)
    achievements = models.ManyToManyField(Achievements)
    badges = models.ManyToManyField(Badge)

    def __str__(self):
        return self.user.email