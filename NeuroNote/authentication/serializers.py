from rest_framework import serializers
from .models import AuthUser

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = AuthUser
        fields = '__all__'