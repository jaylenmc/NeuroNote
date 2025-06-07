from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import Document
from .serializers import DocumentSerializer
from folders.models import Folder
from rest_framework.permissions import IsAuthenticated

class DocumentView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, folder_id=None, doc_id=None):
        if folder_id and doc_id:
            paper = Document.objects.filter(folder__user=request.user, folder__id=folder_id, id=doc_id).first()
            serializer = DocumentSerializer(paper)
            return Response(serializer.data, status=status.HTTP_200_OK)
        elif folder_id:
            papers = Document.objects.filter(folder__user=request.user, folder__id=folder_id)
            serializer = DocumentSerializer(papers, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response({'error': 'Invalid request'}, status=status.HTTP_400_BAD_REQUEST)
    
    def post(self, request):        
        title = request.data['title']
        notes = request.data['notes']
        folder_id = request.data['folder_id']

        folder = Folder.objects.filter(user=request.user, id=folder_id).first()
        paper = Document.objects.create(
            title=title,
            notes=notes,
            folder=folder
        )

        serializer = DocumentSerializer(paper).data
        return Response(serializer, status=status.HTTP_200_OK)
    
    def delete(self, request, folder_id, doc_id):
        paper = Document.objects.filter(folder__user=request.user, folder__id=folder_id, id=doc_id).first()
        paper.delete()

        return Response({'Message': "Document successfully deleted"}, status=status.HTTP_200_OK)