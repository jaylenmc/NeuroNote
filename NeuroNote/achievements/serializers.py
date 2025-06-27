from rest_framework import serializers
from .models import UserAchievements, Achievements

class AchievementsSerializer(serializers.ModelSerializer):
    class Meta:
        model = Achievements
        fields = ['name', 'description', 'tier', 'family']