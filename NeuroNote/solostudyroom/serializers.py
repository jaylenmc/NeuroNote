from rest_framework import serializers
from .models import PinnedResources
from resources.serializers import PinnedFileSerializer, PinnedLinkSerializer
from documents.serializers import PinnedDocumentSerializer

# Understand why just putting in the attribute names in the field worked instead of called individual serializers
class PinnedResourcesSerializer(serializers.ModelSerializer):
    file = PinnedFileSerializer(many=True)
    link = PinnedLinkSerializer(many=True)
    document = PinnedDocumentSerializer(many=True)
    class Meta:
        model = PinnedResources
        fields = ["file", "link", "document"]