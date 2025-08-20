from rest_framework.views import APIView, Response
from .serializers import LinkUploadSerializer, FileUploadSerializer, ResourceInputSerializer
from rest_framework import status
from .models import LinkUpload, ResourceTypes, FileUpload
from rest_framework.permissions import IsAuthenticated

class ImportResource(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request, id):
        if id:
            link = LinkUpload.objects.filter(user=request.user, id=id).first()
            if link:
                serialzed = LinkUploadSerializer(link)
                return Response(serialzed.data, status=status.HTTP_200_OK)
            return Response({"Error": "Link doesn't exist"}, status=status.HTTP_404_NOT_FOUND)

        links = LinkUpload.objects.filter(user=request.user)
        if links:
            serialized = LinkUploadSerializer(links, many=True)
            return Response(serialized.data, status=status.HTTP_200_OK)
        return Response({"Error": "User has no links"}, status=status.HTTP_404_NOT_FOUND)

    def post(self, request):
        print(f"Request data in resources: {request.data}")
        serializer = ResourceInputSerializer(
            data=request.data, 
            context={'method': request.method}
            )
        if serializer.is_valid():
            resource = serializer.save()

            if resource.resource_type.lower() == ResourceTypes.FILE.value:
                serialized = FileUploadSerializer(resource, context={'request': request})
                return Response(serialized.data, status=status.HTTP_201_CREATED)
            
            if resource.resource_type.lower() == ResourceTypes.LINK.value:
                serialized = LinkUploadSerializer(resource, context={"request": request})
                return Response(serialized.data, status=status.HTTP_201_CREATED)
            
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    def delete(self, request, id):
        resource = request.data.get('resource_type').lower()
        if resource not in ResourceTypes.values:
            return Response({"Error": "Invalid resource type"}, status=status.HTTP_400_BAD_REQUEST)
        
        if resource == ResourceTypes.LINK.value:
            link = LinkUpload.objects.filter(user=request.user, id=id).first()
            if link:
                link.delete()
                return Response({"Message": "Link successfully deleted"}, status=status.HTTP_200_OK)
            return Response({"Error": "Link not found"}, status=status.HTTP_404_NOT_FOUND)
        
        if resource in ResourceTypes.values and resource != ResourceTypes.LINK.value:
            file = FileUpload.objects.filter(user=request.user, id=id).first()
            if file:
                file.delete()
                return Response({"Message": "File successfully deleted"}, status=status.HTTP_200_OK)
            return Response({"Error": "File not found"}, status=status.HTTP_404_NOT_FOUND)