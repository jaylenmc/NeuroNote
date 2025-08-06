from rest_framework.views import APIView, Response
from .serializers import ResourceInputSerializer, ResourceOutputSerializer
from rest_framework import status
from .models import Resource
from rest_framework.permissions import IsAuthenticated

class ImportResource(APIView):
    def get(self, request):
        print("Hey i printed")
    
    def post(self, request):
        serializer = ResourceInputSerializer(
            data=request.data, 
            context={'method': request.method}
            )
        if serializer.is_valid():
            file = serializer.save()
            serialized = ResourceOutputSerializer(file, context={'request': request})
            return Response(serialized.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)