from rest_framework.serializers import ModelSerializer
from .models import Document

class DocumentSerializer(ModelSerializer):
    class Meta:
        fields = ['id', 'title', 'notes', 'created_at', 'folder']
        model = Document