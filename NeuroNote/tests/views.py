from rest_framework.views import APIView
from .models import Quiz
from rest_framework.response import Response
from .serializers import QuizSerilizer
from rest_framework import status

class QuizView(APIView):
    def get(self, request):
        user = request.user
        quizzes = Quiz.objects.filter(user=user)
        serilized = QuizSerilizer(quizzes, many=True)
        return Response(serilized.data, status=status.HTTP_200_OK)
    
    def post(self, request):
        question = request.data.get('question')
        answer = request.data.get('answer')
        topic = request.data.get('topic')
        quiz_obj = Quiz.objects.create(
            user=request.user,
            question=question,
            answer=answer,
            topic=topic                           
        )
        serialized = QuizSerilizer(quiz_obj)
        print(serialized.data)
        return Response(serialized.data, status=status.HTTP_200_OK)
    
    def delete(self, request, id):
        user = request.user
        quiz = Quiz.objects.filter(user=user, id=id).first()
        if quiz:
            quiz.delete()
            return Response({'Detail': 'Quiz deleted successfully'}, status=status.HTTP_200_OK)
        return Response({'Detail': 'Quiz not found'}, status=status.HTTP_404_NOT_FOUND)