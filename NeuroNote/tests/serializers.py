from rest_framework import serializers
from .models import Quiz

class QuizSerilizer(serializers.ModelSerializer):
    class Meta:
        fields = '__all__'
        model = Quiz