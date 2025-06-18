from rest_framework.views import APIView
from .models import StudyRoom
from .serializers import StudyRoomSerializer
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated

class StudyRoomView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, room_id=None):
        if room_id:
            room = StudyRoom.objects.filter(user=request.user, id=room_id).first()
            serialized = StudyRoomSerializer(room).data

            return Response(serialized, status=status.HTTP_200_OK)
        
        rooms = StudyRoom.objects.filter(user=request.user)
        serialized = StudyRoomSerializer(rooms, many=True).data

        return Response(serialized, status=status.HTTP_200_OK)
        
    def post(self, request):
        name = request.data.get('name')
        subject = request.data.get('subject')

        if not name or not subject:
            return Response({'error': 'Name and subject are required'}, status=status.HTTP_400_BAD_REQUEST)
        
        room = StudyRoom.objects.create(
            name=name,
            subject=subject,
            user=request.user
        )

        serialized = StudyRoomSerializer(room).data

        return Response(serialized, status=status.HTTP_201_CREATED)

    def put(self, request, room_id):
        room = StudyRoom.objects.filter(user=request.user, id=room_id).first()

        if not room:
            return Response({"Error": "Room not found"}, status=status.HTTP_404_NOT_FOUND)
        
        room.name = request.data.get('name', room.name)
        room.subject = request.data.get('subject', room.subject)
        room.save()

        return Response({"Message": "Room updated successfully"}, status=status.HTTP_200_OK)
    
    def delete(self, request, room_id):
        room = StudyRoom.objects.filter(user=request.user, id=room_id).first()

        if not room:
            return Response({"Error": "Room not found"}, status=status.HTTP_404_NOT_FOUND)
        
        room.delete()

        return Response({"Message": "Room deleted successfully"}, status=status.HTTP_200_OK)