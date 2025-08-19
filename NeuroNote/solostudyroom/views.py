from django.shortcuts import render
from rest_framework.decorators import APIView
from .models import PinnedResources
from .serializers import PinnedResourcesSerializer
from rest_framework.response import Response
from rest_framework import status
from resources.models import FileUpload, LinkUpload, ResourceTypes
from documents.models import Document
from rest_framework.permissions import IsAuthenticated

class PinnedResourceClass(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request):
        resources = PinnedResources.objects.filter(
            user=request.user
            ).prefetch_related("document", "file", "link").first()
        if resources:
            serialized = PinnedResourcesSerializer(resources)
            return Response(serialized.data, status=status.HTTP_200_OK)
        
    def delete(self, request, obj_id):
        resource_type = request.query_params.get('resource_type')

        if resource_type.lower() not in ResourceTypes.values and resource_type.lower() != Document.ResourceType.DOCUMENT_TYPE:
            return Response({"Error": "Invalid resource type"}, status=status.HTTP_200_OK)

        if resource_type.lower() == ResourceTypes.LINK:
            link_resource = PinnedResources.objects.get(user=request.user)
            link_resource.link.remove(obj_id)
            return Response({"Message": "Link successfully removed"}, status=status.HTTP_200_OK)
        
        if resource_type.lower() == ResourceTypes.FILE:
            file_resource = PinnedResources.objects.get(user=request.user)
            file_resource.file.remove(obj_id)
            return Response({"Message": "File successfully removed"}, status=status.HTTP_200_OK)

        if resource_type.lower() == Document.ResourceType.DOCUMENT_TYPE:
            document_resource = PinnedResources.objects.get(user=request.user)
            document_resource.document.remove(obj_id)
            return Response({"Message": "Document successfully removed"}, status=status.HTTP_200_OK)