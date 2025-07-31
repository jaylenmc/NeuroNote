from rest_framework import serializers
from .models import Resource

class ResourceInputSerializer(serializers.Serializer):
    file_type = serializers.CharField()
    
    def validate(self, data):
        print(f"Resource: {[obj for obj in Resource.FileTypes.FILE_TYPES if data['filetype'] in obj]}")
        if data['filetype'] not in Resource.FileTypes.FILE_TYPES:
            raise serializers.ValidationError('File type not allowed')
        return data
    
    def create(validated_data):
        data = Resource.upload_type(validated_data)
        return data