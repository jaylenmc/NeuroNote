from rest_framework.decorators import api_view
from flashcards.models import Card
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework import status
from .models import UserAchievements, Achievements
from authentication.models import AuthUser
from .serializers import AchievementsSerializer
from rest_framework.permissions import IsAuthenticated

class AchievementsView(APIView):
    # permission_classes = [IsAuthenticated]
    def get(self, request):
        acheivements = Achievements.objects.all()
        serializer = AchievementsSerializer(acheivements, many=True)

        return Response(serializer.data, status=status.HTTP_200_OK)