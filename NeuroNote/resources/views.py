from rest_framework.views import APIView, Response
from .serializers import ResourceInputSerializer, GetResourceOutputSerializer, ResourceOutputSerializer
from rest_framework import status
from .models import Resource

class ImportResource(APIView):
    def get(self, request, filename=None):
        if filename:
            file = Resource.objects.filter(user=request.user, file_name=filename).first()
            if file:
                serialized = GetResourceOutputSerializer(file, context={'request': request})
                return Response(serialized.data, status=status.HTTP_200_OK)
            return Response({"Message": "File doesn't exist"}, status=status.HTTP_200_OK)
        
        files = Resource.objects.filter(user=request.user)
        if not files.count() == 0:
            serialized = GetResourceOutputSerializer(files, many=True)
            return Response(serialized.data, status=status.HTTP_200_OK)
        return Response({"Message": "No files exist"})
    
    def post(self, request):
        serializer = ResourceInputSerializer(
            data=request.data, 
            context={'method': request.method}
            )
        if serializer.is_valid():
            file = serializer.save()
            serialized = ResourceOutputSerializer(file)
            return Response(serialized.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)