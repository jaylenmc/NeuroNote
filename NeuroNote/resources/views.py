from rest_framework.views import APIView, Response
from .serializers import ResourceInputSerializer
from rest_framework import status

class ImportResource(APIView):
    def get(self, request):
        ...
    
    def post(self, request):
        serializer = ResourceInputSerializer()
        if serializer.validate(request.data):
            return Response(serializer.validated_data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)