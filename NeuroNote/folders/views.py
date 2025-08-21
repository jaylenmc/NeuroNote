from rest_framework.views import APIView
from .models import Folder, SubFolder
from .serializers import FolderSerializer, SubFolderSerializer
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from .services import check_content_num
from authentication.models import AuthUser

class FolderView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self,request, folder_id=None):
        if folder_id:
            sub_folder = SubFolder.objects.filter(user=request.user, folder_id=folder_id)
            serialized = SubFolderSerializer(sub_folder, many=True)

            return Response({'sub_folders': serialized.data}, status=status.HTTP_200_OK)
        
        folders = Folder.objects.filter(user=request.user)

        for folder in folders:
            folder.content_num = check_content_num(folder)
            folder.save()

        serialized = FolderSerializer(folders, many=True)

        return Response({'folders': serialized.data}, status=status.HTTP_200_OK)
    
    def post(self, request):
        name = request.data.get('name')
        folder_id = request.data.get('folder_id')
        if not name:
            return Response({'Message': 'Name not provided'})
        
        if folder_id:
            sub_folder = SubFolder.objects.create(name=name, user=request.user, folder_id=folder_id)
            serialized = SubFolderSerializer(sub_folder)

            return Response({'sub_folder': serialized.data}, status=status.HTTP_200_OK)
        
        folder = Folder.objects.create(name=name, user=request.user)
        serialized = FolderSerializer(folder)

        return Response({'folder': serialized.data}, status=status.HTTP_200_OK)
    
    def delete(self, request, id):
        folder = Folder.objects.filter(user=request.user, id=id).first()
        folder.delete()

        return Response({'Message': 'Folder succssesfully deleted'})