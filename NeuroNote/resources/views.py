from rest_framework.views import APIView, Response
from .serializers import ResourceInputSerializer, ResourceOutputSerializer, LinkUploadSerialzier, FileUploadSerializer
from rest_framework import status
from .models import LinkUpload, Resource
from rest_framework.permissions import IsAuthenticated

class ImportResource(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request):
        # if id:
        #     link = Resource.objects.get(user=request.user, link__id=id)
        #     if link:
        #         serialzed = ResourceLinkOutputSerializer(link)
        #         return Response(serialzed.data, status=status.HTTP_200_OK)
        #     return Response({"Error": "Link doesn't exist"}, status=status.HTTP_404_NOT_FOUND)

        links = Resource.objects.filter(user=request.user).select_related("link").first()
        print(f"Linkw: {links.link}")
        print(f"Links: {links}")
        if links.count() > 0:
            serialized = ResourceOutputSerializer(links)
            return Response(serialized.data, status=status.HTTP_200_OK)
        return Response({"Error": "User has no links"}, status=status.HTTP_404_NOT_FOUND)

    def post(self, request):
        serializer = ResourceInputSerializer(
            data=request.data, 
            context={'method': request.method}
            )
        if serializer.is_valid():
            resource = serializer.save()
            print(f"Resource: {resource}")

            if resource.file_resource:
                serialized = FileUploadSerializer(resource, context={'request': request})
                return Response(serialized.data, status=status.HTTP_201_CREATED)
            
            if resource.link_resource:
                serialized = FileUploadSerializer(resource, context={"request": request})
                return Response(serialized.data, status=status.HTTP_201_CREATED)
            
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)