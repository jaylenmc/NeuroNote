from rest_framework.decorators import api_view
from flashcards.models import Card
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework import status
from .models import UserAchievements, Achievements
from authentication.models import AuthUser
from .serializers import AchievementsSerializer

class AchievementsView(APIView):
    def get(self, request):
        acheivements = Achievements.objects.all()
        print(f'acheivements: {acheivements}')
        serializer = AchievementsSerializer(acheivements, many=True)

        return Response(serializer.data, status=status.HTTP_200_OK)