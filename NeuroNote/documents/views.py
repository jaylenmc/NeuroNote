from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import Document
from .serializers import DocumentInputSerializer, DocumentOutputSerializer
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404
from rest_framework.decorators import api_view, permission_classes

class DocumentView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, folder_id, doc_id=None):
        if not folder_id:
            return Response({'Message': 'Folder id required'}, status=status.HTTP_400_BAD_REQUEST)
        if doc_id is not None:
            document = get_object_or_404(Document, folder__user=request.user, folder__id=folder_id, id=doc_id)
            serializer = DocumentOutputSerializer(document)
            return Response(serializer.data, status=status.HTTP_200_OK)

        documents = Document.objects.filter(folder__user=request.user, folder__id=folder_id)
        serializer = DocumentOutputSerializer(documents, many=True)
        print(f"Serializer data: {serializer.data}")
        return Response(serializer.data, status=status.HTTP_200_OK)
    
    def post(self, request):        
        serializer = DocumentInputSerializer(data=request.data, context={'user': request.user, 'request': request})
        if serializer.is_valid():
            document = serializer.create(serializer.validated_data)
            serialized_data = DocumentOutputSerializer(document).data
            return Response(serialized_data, status=status.HTTP_200_OK)
        return Response({"Message": serializer.errors}, status=status.HTTP_400_BAD_REQUEST)
    
    def put(self, request, doc_id):
        if not Document.objects.filter(folder__user=request.user, id=doc_id).exists():
            return Response({"Message": "Document doesn't exist"}, status=status.HTTP_404_NOT_FOUND)
        
        serializer = DocumentInputSerializer(data=request.data, context={'user': request.user, 'doc_id': doc_id, 'request': request})
        if serializer.is_valid():
            updated_doc = serializer.update(serializer.validated_data)
            serialized = DocumentOutputSerializer(updated_doc).data
            return Response(serialized, status=status.HTTP_200_OK)
        return Response({"Message": serializer.errors}, status=status.HTTP_400_BAD_REQUEST)
    
    def delete(self, request, folder_id, doc_id):
        delete_count, _ = Document.objects.filter(folder__user=request.user, folder__id=folder_id, id=doc_id).delete()
        if delete_count == 0:
            return Response({"Message": "Document doesn't exist"}, status=status.HTTP_404_NOT_FOUND)
        return Response({'Message': "Document successfully deleted"}, status=status.HTTP_200_OK)