from rest_framework import serializers
from .models import Folder, SubFolder

class SubFolderSerializer(serializers.ModelSerializer):
    class Meta:
        fields = ['id', 'name', 'content_num']
        model = SubFolder

class FolderSerializer(serializers.ModelSerializer):
    sub_folders = SubFolderSerializer(many=True, read_only=True)
    class Meta:
        fields = ['id', 'name', 'content_num', 'sub_folders']
        model = Folder