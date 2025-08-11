from rest_framework import serializers
from .models import Resource, FileUpload, LinkUpload
from authentication.serializers import UserSerializer
from authentication.models import AuthUser

class ResourceInputSerializer(serializers.Serializer):
    user = serializers.EmailField()
    file_upload = serializers.FileField(required=False)
    link_upload = serializers.URLField(required=False)
    resource_type = serializers.CharField(max_length=8)
    title = serializers.CharField()
    
    def validate_user(self, value):
        if not AuthUser.objects.filter(email=value).exists():
            raise serializers.ValidationError("User doesn't exist")
        return value
    
    def validate_file_upload(self, value):
        if self.context['method'] == "POST":
            content_type = value.content_type.split('/')[1]

            if content_type not in Resource.FileTypes.values or content_type != value.name.split('.')[1]:
                raise serializers.ValidationError(f"Invalid content type or doesn't match file suffix, content type: {content_type}")
            if value.name.split('.')[1] not in Resource.FileTypes.values:
                raise serializers.ValidationError("Invalid file type")
            
            return value
        
    def validate_resource_type(self, value):
        print(f"Resource: {Resource.ResourceTypes.labels}")
        if value not in Resource.ResourceTypes.labels:
            raise serializers.ValidationError(f"Invalid resource type: {value}")
        return value

    def validate(self, value):
        if not value.get('file_upload') and not value.get('link_upload'):
            raise serializers.ValidationError("Missing link/file upload")
        return value

    def create(self, validated_data):
        user = AuthUser.objects.get(email=validated_data['user'])
        if 'file_upload' in validated_data:
            resource, _ = Resource.objects.get_or_create(
                user=user,
                resource_type=validated_data['resource_type']
                )
            FileUpload.objects.create(
                file_name=validated_data['file_upload'].name.split('.')[0],
                file_upload=validated_data['file_upload'],
                user=user,
                resource=resource
                )
            return resource
        
        if 'link_upload' in validated_data:
            print(f"Validated: {validated_data}")
            resource, _ = Resource.objects.get_or_create(
                user=user,
                resource_type=validated_data['resource_type']
            )
            LinkUpload.objects.create(
                link=validated_data['link_upload'],
                title=validated_data['title'],
                resource=resource
            )
            return resource
        

class ResourceOutputSerializer(serializers.ModelSerializer):
    user = UserSerializer()
    class Meta:
        model = Resource
        fields = ['id', 'user', 'resource_type']
        
class FileUploadSerializer(serializers.ModelSerializer):
    file_upload = serializers.SerializerMethodField()
    resource = ResourceOutputSerializer()
    class Meta:
        model = FileUpload
        fields = ['file_name', 'uploaded_at', 'file_upload', 'id', 'resource']

    def get_file_upload(self, obj):
        if self.context['request']:
            return self.context['request'].build_absolute_uri(obj.file_upload.url)
        return obj.file_upload.url
    
class LinkUploadSerialzier(serializers.ModelSerializer):
    resource = ResourceOutputSerializer()
    class Meta:
        model = LinkUpload
        fields = ['link', 'id', 'title', 'resource']
        
class ResourceFileOutputSerializer(serializers.ModelSerializer):
    user = UserSerializer()
    file = FileUploadSerializer()
    class Meta:
        model = Resource
        fields = ['file', 'id', 'user']