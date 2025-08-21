from django.shortcuts import render
from rest_framework.decorators import APIView
from .models import PinnedResourcesDashboard
from .serializers import PinnedResourcesOutputSerializer, PinnedResourcesSerializer
from rest_framework.response import Response
from rest_framework import status
from resources.models import FileUpload, LinkUpload, ResourceTypes
from documents.models import Document
from rest_framework.permissions import IsAuthenticated

class PinnedResourceClass(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request):
        resources = PinnedResourcesDashboard.objects.filter(
            user=request.user
            ).prefetch_related("document", "file", "link").first()
        if not resources:
            resources = PinnedResourcesDashboard.objects.create(user=request.user)

        serialized = PinnedResourcesOutputSerializer(resources)
        return Response(serialized.data, status=status.HTTP_200_OK)
    
    def post(self, request):
        request_data = PinnedResourcesSerializer(data=request.data, context={"user": request.user})
        if request_data.is_valid():
            saved_instance = request_data.save()
            serialized = PinnedResourcesOutputSerializer(saved_instance)
            return Response(serialized.data, status=status.HTTP_201_CREATED)
        return Response({"Error": request_data.errors}, status=status.HTTP_400_BAD_REQUEST)
    
    def delete(self, request, obj_id):
        # Add resource_type error handling
        resource_type = request.query_params.get('resource_type')

        if resource_type.lower() not in ResourceTypes.values and resource_type.lower() != Document.ResourceType.DOCUMENT_TYPE:
            return Response({"Error": "Invalid resource type"}, status=status.HTTP_200_OK)

        if resource_type.lower() == ResourceTypes.LINK:
            link_resource = PinnedResourcesDashboard.objects.filter(user=request.user).first()

            if not link_resource:
                return Response({"Error": "User doesn't have pinned resource dashboard"}, status=status.HTTP_404_NOT_FOUND)
            if not link_resource.link.filter(id=obj_id).exists():
                return Response({"Error": "Link doesn't exist"}, status=status.HTTP_404_NOT_FOUND)
            
            link_resource.link.remove(obj_id)
            return Response({"Message": "Link successfully removed"}, status=status.HTTP_200_OK)
        
        if resource_type.lower() == ResourceTypes.FILE:
            file_resource = PinnedResourcesDashboard.objects.filter(user=request.user).first()

            if not file_resource:
                return Response({"Error": "User doesn't have pinned resource dashboard"}, status=status.HTTP_404_NOT_FOUND)
            if not file_resource.file.filter(id=obj_id).exists():
                return Response({"Error": "File doesn't exist"}, status=status.HTTP_404_NOT_FOUND)
            
            file_resource.file.remove(obj_id)
            return Response({"Message": "File successfully removed"}, status=status.HTTP_200_OK)

        if resource_type.lower() == Document.ResourceType.DOCUMENT_TYPE:
            document_resource = PinnedResourcesDashboard.objects.filter(user=request.user).first()

            if not document_resource:
                return Response({"Error": "User doesn't have pinned resource dashboard"}, status=status.HTTP_404_NOT_FOUND)
            if not document_resource.document.filter(id=obj_id).exists():
                return Response({"Error": "Document doesn't exist"}, status=status.HTTP_404_NOT_FOUND)
            
            document_resource.document.remove(obj_id)
            return Response({"Message": "Document successfully removed"}, status=status.HTTP_200_OK)