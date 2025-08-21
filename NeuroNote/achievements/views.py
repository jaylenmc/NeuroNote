from rest_framework.decorators import api_view
from flashcards.models import Card
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework import status
from .models import UserAchievements, Achievements
from authentication.models import AuthUser
from .serializers import AchievementsSerializer, UserAcheivementsSerializer
from rest_framework.permissions import IsAuthenticated

class AchievementsView(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request):
        if "user_achievements" in request.query_params:
            print(f"User achievements: {request.query_params.get('user_achievements')}")
            if request.query_params.get("user_achievements", "").lower() == 'true':
                user_acheivements = UserAchievements.objects.filter(user=request.user).first()

                if user_acheivements:
                    serialized = UserAcheivementsSerializer(user_acheivements)
                    return Response(serialized.data, status=status.HTTP_200_OK)
                return Response({"Error": "User doesn't have acheivements"}, status=status.HTTP_404_NOT_FOUND)
            
            elif request.query_params.get("user_achievements", "").lower() == 'false':
                acheivements = Achievements.objects.all()
                serializer = AchievementsSerializer(acheivements, many=True)
                return Response(serializer.data, status=status.HTTP_200_OK)
            
            return Response({"Error": "values true or false are only allowed"}, status=status.HTTP_400_BAD_REQUEST)
        
        return Response({"Error": "Must include (user_achievements) in query parameters"})