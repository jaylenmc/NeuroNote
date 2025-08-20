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
    
    link = serializers.PrimaryKeyRelatedField(
        many=True,
        queryset=LinkUpload.objects.all(),
        required=False
        )
    
    file = serializers.PrimaryKeyRelatedField(
        many=True,
        queryset=FileUpload.objects.all(),
        required=False
        )
    
    def create(self, validated_data):
        pinned_resource = PinnedResourcesDashboard.objects.filter(user=self.context['user']).first()
        if not pinned_resource:
            pinned_resource = PinnedResourcesDashboard.objects.create(user=self.context['user'])
        if 'document' in validated_data:
            pinned_resource.document.add(*validated_data['document'])
        if 'file' in validated_data:
            pinned_resource.file.add(*validated_data['file'])
        if 'link' in validated_data:
            pinned_resource.link.add(*validated_data['link'])
        return pinned_resource

class PinnedResourcesOutputSerializer(serializers.ModelSerializer):
    file = PinnedFileSerializer(many=True)
    link = PinnedLinkSerializer(many=True)
    document = PinnedDocumentSerializer(many=True)
    class Meta:
        model = PinnedResourcesDashboard
        fields = ["file", "link", "document"]