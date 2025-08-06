from rest_framework import serializers
from .models import Resource
from authentication.serializers import UserSerializer
from authentication.models import AuthUser

class ResourceInputSerializer(serializers.Serializer):
    user = serializers.EmailField()
    file_upload = serializers.FileField()
    
    def validate_user(self, value):
        if not AuthUser.objects.filter(email=value).exists():
            raise serializers.ValidationError("User doesn't exist")
        return value
    
    def validate_file_upload(self, value):
        if self.context['method'] == "POST":
            if value.name.split('.')[1] not in Resource.FileTypes.values:
                raise serializers.ValidationError("Invalid file type")
            return value
        
    def create(self, validated_data):
        user = AuthUser.objects.get(email=validated_data['user'])
        file = Resource.objects.create(
            file_name=validated_data['file_upload'].name.split('.')[0],
            user=user,
            file_upload=validated_data['file_upload']
            )
        return file
        
class ResourceOutputSerializer(serializers.ModelSerializer):
    user = UserSerializer()
    file_upload = serializers.SerializerMethodField()
    class Meta:
        model = Resource
        fields = ['file_name', 'uploaded_at', 'file_upload', 'id', 'user']

    def get_file_upload(self, obj):
        if self.context['request']:
            return self.context['request'].build_absolute_uri(obj.file_upload.url)
        return obj.file_upload.url
            