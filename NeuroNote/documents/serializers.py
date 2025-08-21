from rest_framework import serializers
from .models import Document
from django.db import models
from folders.models import Folder
from django.utils import timezone

class DocumentInputSerializer(serializers.Serializer):
    title = serializers.CharField(allow_blank=True)
    notes = serializers.CharField(allow_blank=True)
    folder_id = serializers.IntegerField(required=True)
    is_published = serializers.BooleanField()
    tag = serializers.CharField(allow_blank=True)
        
    def validate(self, data):
        if data['is_published'] and not data['notes']:
            raise serializers.ValidationError("Notes must contain content when publishing")
        if not Folder.objects.filter(user=self.context['user'], id=data['folder_id']).exists():
            raise serializers.ValidationError("Folder doesn't exist")
        return data

    def create(self, data):
        if self.context['request'].method == "POST":
            folder = Folder.objects.get(user=self.context['user'], id=data['folder_id'])
            document = Document.objects.create(
                title='Untitled' if not data['title'] else data['title'],
                notes=data['notes'],
                folder=folder,
                published=data['is_published'],
                tag=data['tag']
            )
            return document
        return document
    
    def update(self, data):
        if self.context['request'].method == "PUT":
            folder = Folder.objects.get(user=self.context['user'], id=data['folder_id'])
            document = Document.objects.get(folder=folder, id=self.context['doc_id'])
            document.title=data['title']
            document.notes=data['notes']
            document.folder=folder
            document.published=data['is_published']
            document.tag=data['tag']
            return document
        return document
    
class DocumentOutputSerializer(serializers.ModelSerializer):
    class Meta:
        fields = ['tag', 'title', 'notes', 'folder', 'published', 'id', 'saved', 'resource_type']
        model = Document
    
class PinnedDocumentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Document
        fields = ['id', 'title', 'resource_type', 'folder_id']