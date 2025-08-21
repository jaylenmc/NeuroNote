from rest_framework import serializers
from .models import FileUpload, LinkUpload, ResourceTypes
from authentication.serializers import UserSerializer
from authentication.models import AuthUser

class ResourceInputSerializer(serializers.Serializer):
    user = serializers.PrimaryKeyRelatedField(
        required=True,
        queryset=AuthUser.objects.all()
    )
    file_upload = serializers.FileField(required=False)
    link_upload = serializers.URLField(required=False)
    resource_type = serializers.CharField(max_length=8)
    title = serializers.CharField(required=False)
    
    def validate_user(self, value):
        if not AuthUser.objects.filter(email=value).exists():
            raise serializers.ValidationError("User doesn't exist")
        return value
    
    def validate_file_upload(self, value):
        if self.context['method'] == "POST":
            content_type = value.content_type.split('/')[1]

            if value.name.split('.')[1] not in FileUpload.FileTypes.values:
                raise serializers.ValidationError("File type not allowed")
            if content_type not in FileUpload.FileTypes.values or content_type != value.name.split('.')[1]:
                raise serializers.ValidationError(f"Invalid content type or doesn't match file suffix, content type: {content_type}")
            return value
        
    def validate_resource_type(self, value):
        if value.lower() not in ResourceTypes.values:
            raise serializers.ValidationError(f"Invalid resource type: {value}")
        return value

    def validate(self, value):
        if not value.get('file_upload') and not value.get('link_upload'):
            raise serializers.ValidationError("Missing link/file upload")
        
        if "link_upload" in value:
            if value['link_upload'] and value['resource_type'] != ResourceTypes.LINK.label:
                raise serializers.ValidationError("Resource type needs to be Link for link upload")

        if "file_upload" in value:
            if value['file_upload'] and value['resource_type'] == ResourceTypes.LINK.label:
                raise serializers.ValidationError("Resource type need to be Textbook or File with file upload")
            
        return value

    def create(self, validated_data):
        if 'file_upload' in validated_data:
            file = FileUpload.objects.create(
                file_name=validated_data['file_upload'].name.split('.')[0],
                file_upload=validated_data['file_upload'],
                user=validated_data['user'],
                resource_type=validated_data['resource_type']
                )
            return file
        
        if 'link_upload' in validated_data:
            link = LinkUpload.objects.create(
                user=validated_data['user'],
                link=validated_data['link_upload'],
                title=validated_data['title'],
                resource_type=validated_data['resource_type']
            )
            return link
                
class FileUploadSerializer(serializers.ModelSerializer):
    file_upload = serializers.SerializerMethodField()
    class Meta:
        model = FileUpload
        fields = ['file_name', 'uploaded_at', 'file_upload', 'id', 'resource_type']

    def get_file_upload(self, obj):
        if 'request' in self.context:
            return self.context['request'].build_absolute_uri(obj.file_upload.url)
        return obj.file_upload.url
    
class LinkUploadSerializer(serializers.ModelSerializer):
    class Meta:
        model = LinkUpload
        fields = ['id', 'title', 'link']

class PinnedLinkSerializer(serializers.ModelSerializer):
    class Meta:
        model = LinkUpload
        fields = ['id', 'title', 'resource_type']

class PinnedFileSerializer(serializers.ModelSerializer):
    class Meta:
        model = FileUpload
        fields = ['id', 'file_name', 'resource_type']