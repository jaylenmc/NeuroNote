from rest_framework.views import APIView
from .models import Question, Quiz, Answer
from folders.models import Folder
from authentication.models import AuthUser
from rest_framework.response import Response
from .serializers import QuizSerilizer, AnswerSerializer, QuestionSerializer
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from django.core.exceptions import ValidationError

class QuizView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user_p = AuthUser.objects.filter(email=request.user).first()
        quizzes = Quiz.objects.filter(user=user_p)
        serilized = QuizSerilizer(quizzes, many=True)
        print(serilized.data)
        return Response(serilized.data, status=status.HTTP_200_OK)
    
    def post(self, request):
        topic = request.data.get('topic')
        subject = request.data.get('subject')
        folder_id = request.data.get('folder_id')

        if not topic:
            return Response({'Message': 'No topic provided'}, status=status.HTTP_400_BAD_REQUEST)
        
        folder = Folder.objects.filter(user=request.user, id=folder_id).first()

        quiz = Quiz.objects.create(
            topic=topic,
            subject=subject,
            user=request.user,
            folder=folder
        )

        serialized = QuizSerilizer(quiz)
        return Response(serialized.data, status=status.HTTP_200_OK)
    
    def delete(self, request, quiz_id):
        user = AuthUser.objects.filter(email=request.user).first()
        quiz = Quiz.objects.filter(user=user, id=quiz_id).first()
        if quiz:
            quiz.delete()
            return Response({'Detail': 'Quiz deleted successfully'}, status=status.HTTP_200_OK)
        return Response({'Detail': 'Quiz not found'}, status=status.HTTP_404_NOT_FOUND)
    

class QuizQuestions(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, quiz_id):
        user_p = AuthUser.objects.filter(email=request.user).first()
        quiz = Quiz.objects.filter(user=user_p, id=quiz_id).first()
        questions = Question.objects.filter(quiz=quiz)
        quiz_details_dict = {}

        for question in questions:
            answer = Answer.objects.filter(question=question)
            quiz_details_dict[question.question_input] = AnswerSerializer(answer, many=True).data
        
        return Response(quiz_details_dict, status=status.HTTP_200_OK)
    
    def post(self, request):
        question_input = request.data.get('question_input')
        question_type = request.data.get('question_type')
        quiz_id = request.data.get('quiz_id')

        user_p = AuthUser.objects.filter(email=request.user).first()
        quiz = Quiz.objects.filter(user=user_p, id=quiz_id).first()

        if Question.objects.filter(question_input=question_input, question_type=question_type).exists():
            return Response({'Message': 'Already have that question with that question type'}, status=status.HTTP_400_BAD_REQUEST)
        
        question = Question(
            quiz=quiz,
            question_input=question_input,
            question_type=question_type
            )
        
        try:
            question.full_clean()
            question.save()
        except ValidationError as e:
            return Response({'Error': e.message_dict}, status=status.HTTP_400_BAD_REQUEST)
        
        serialized = QuestionSerializer(question).data

        return Response(serialized, status=status.HTTP_200_OK)
    
    def delete(self, request, quiz_id, question_id):
        user_p = AuthUser.objects.filter(email=user).first()
        question = Question.objects.filter(
            quiz__user=user_p,
            quiz__id=quiz_id,
            id=question_id).first()
        question.delete()

        return Response({"Message": "Question successfully deleted"}, status=status.HTTP_200_OK)
    

class QuizAnswers(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, quiz_id, question_id):
        question = Question.objects.filter(
            quiz__user=request.user,
            quiz__id=quiz_id,
            id=question_id
            ).first()
        answers = Answer.objects.filter(question=question)

        return Response(AnswerSerializer(answers, many=True).data, status=status.HTTP_200_OK)
    
    def post(self, request):
        answer_input = request.data.get('answer_input')
        answer_is_correct = request.data.get('answer_is_correct')
        question_id = request.data.get('question_id')
        quiz_id = request.data.get('quiz_id')

        question = Question.objects.filter(
            quiz__user=request.user,
            quiz__id=quiz_id,
            id=question_id,
        ).first()

        answer = Answer.objects.create(
            question=question,
            answer_input=answer_input,
            is_correct=answer_is_correct
        )

        return Response(AnswerSerializer(answer).data, status=status.HTTP_200_OK)
    
    def delete(self, request, quiz_id, question_id, answer_id):
        user_p=AuthUser.objects.filter(email=request.user).first()
        answer = Answer.objects.filter(
            question__quiz__user=user_p,
            question__quiz__id=quiz_id,
            question__id=question_id,
            id=answer_id
            ).first()
        
        answer.delete()
        return Response({"Message": "Successfully deleted"}, status=status.HTTP_200_OK)