from rest_framework import serializers
from .models import StudyRoom

class StudyRoomSerializer(serializers.ModelSerializer):
    class Meta:
        model = StudyRoom
        fields = ['id', 'name', 'subject', 'created_at']