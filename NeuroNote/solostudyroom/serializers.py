from rest_framework import serializers
from .models import PinnedResourcesDashboard
from resources.serializers import PinnedFileSerializer, PinnedLinkSerializer
from documents.serializers import PinnedDocumentSerializer
from resources.models import FileUpload, LinkUpload
from documents.models import Document

class PinnedResourcesSerializer(serializers.Serializer):
    document = serializers.PrimaryKeyRelatedField(
        many=True,
        queryset=Document.objects.all(),
        required=False
        )
    
    file = serializers.PrimaryKeyRelatedField(
        many=True,
        queryset=FileUpload.objects.all(),
        required=False
    )
    
    # Link fields
    title = serializers.CharField(required=False)
    resource_type = serializers.CharField(required=False)
    link = serializers.URLField(required=False)

    def validate(self, data):
        # Only validate link fields if we're creating a new link
        if 'link' in data and data['link']:
            required_fields = ['link', 'title', 'resource_type']
            if not all(field in data for field in required_fields):
                raise serializers.ValidationError("When creating a link, all fields (link, title, resource_type) are required.")
            print("pass validated")
        return data
    
    def create(self, validated_data):
        pinned_resource = PinnedResourcesDashboard.objects.filter(user=self.context['user']).first()
        if not pinned_resource:
            pinned_resource = PinnedResourcesDashboard.objects.create(user=self.context['user'])
        print(f"Validated data: {validated_data}")
        if 'document' in validated_data:
            pinned_resource.document.add(*validated_data['document'])
        if 'file' in validated_data:
            pinned_resource.file.add(*validated_data['file'])
        if 'link' in validated_data:
            link = LinkUpload.objects.create(
                title=validated_data['title'],
                link=validated_data['link'],
                resource_type=validated_data['resource_type'],
                user=self.context['user']
            )
            pinned_resource.link.add(link)
        return pinned_resource

class PinnedResourcesOutputSerializer(serializers.ModelSerializer):
    file = PinnedFileSerializer(many=True)
    link = PinnedLinkSerializer(many=True)
    document = PinnedDocumentSerializer(many=True)
    class Meta:
        model = PinnedResourcesDashboard
        fields = ["file", "link", "document"]