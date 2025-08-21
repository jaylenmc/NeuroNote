from rest_framework.views import APIView
from .models import Question, Quiz, Answer, UserAnswer, QuizAttempt
from folders.models import Folder
from authentication.models import AuthUser
from rest_framework.response import Response
from .serializers import QuizSerilizer, AnswerSerializer, QuestionSerializer, QuestionReviewSerializer, AnswerReviewSerializer
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from django.utils.timezone import now
from django.db import transaction
from claude_client.client import cards_to_quiz
import re
import json

class QuizView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, quiz_id=None):
        if quiz_id:
            quiz = Quiz.objects.filter(user=request.user, id=quiz_id).first()
            if not quiz:
                return Response({'Detail': 'Quiz not found'}, status=status.HTTP_404_NOT_FOUND)
            serialized = QuizSerilizer(quiz)
            return Response(serialized.data, status=status.HTTP_200_OK)
        else:
            quizzes = Quiz.objects.filter(user=request.user)
            quiz_data = []
            
            for quiz in quizzes:
                question_count = Question.objects.filter(quiz=quiz).count()
                last_attempt = QuizAttempt.objects.filter(user=request.user, quiz=quiz).order_by('-attempted_at').first()
                
                quiz_info = {
                    'id': quiz.id,
                    'topic': quiz.topic,
                    'subject': quiz.subject,
                    'folder': quiz.folder.id if quiz.folder else None,
                    'question_count': question_count,
                    'last_score': round(last_attempt.score, 1) if last_attempt else None,
                    'last_attempt': last_attempt.attempted_at.isoformat() if last_attempt else None
                }
                quiz_data.append(quiz_info)
            
            return Response(quiz_data, status=status.HTTP_200_OK)
    
    def post(self, request):
        quiz_topic = request.data.get('topic')
        quiz_subject = request.data.get('subject')
        question_data = request.data.get('questions')
   

        if Quiz.objects.filter(user=request.user, topic__iexact=quiz_topic).exists():
            return Response({'Message': 'Quiz already exists'}, status=status.HTTP_400_BAD_REQUEST)
        
        with transaction.atomic():
            quiz = Quiz.objects.create(
                user=request.user,
                topic=quiz_topic,
                subject=quiz_subject
            )

            for question in question_data:
                question_obj = Question.objects.create(
                    quiz=quiz,
                    question_input=question['question_input'],
                    question_type=question['question_type']
                )
                
                answer_data = [Answer(
                    question=question_obj,
                    answer_input=ans['answer_input'],
                    is_correct=ans['is_correct']
                ) for ans in question['answers']]
                
                Answer.objects.bulk_create(answer_data)

            return Response({'Message': 'Quiz created successfully'}, status=status.HTTP_200_OK)
    

class QuizQuestions(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, quiz_id=None):
        
        if quiz_id:
            quiz = Quiz.objects.filter(user=request.user, id=quiz_id).first()
            if not quiz:
                return Response({'Detail': 'Quiz not found'}, status=status.HTTP_404_NOT_FOUND)
                
            questions = Question.objects.filter(quiz=quiz)
            
            
            quiz_details_dict = {}

            for question in questions:
                answer = Answer.objects.filter(question=question)
                
                q_serialized = QuestionSerializer(question).data
                quiz_details_dict[q_serialized.get('id')] = AnswerSerializer(answer, many=True).data
            
            
            return Response(quiz_details_dict, status=status.HTTP_200_OK)
        else:
            questions = Question.objects.filter(quiz__user=request.user)
            return Response(QuestionSerializer(questions, many=True).data, status=status.HTTP_200_OK)
    
    def delete(self, request, quiz_id, question_id):
        question = Question.objects.filter(
            quiz__user=request.user,
            quiz__id=quiz_id,
            id=question_id).first()
        if question:
            question.delete()
            return Response({"Message": "Question successfully deleted"}, status=status.HTTP_200_OK)
        return Response({"Message": "Question not found"}, status=status.HTTP_404_NOT_FOUND)
    

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

class UserAnswersView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, quiz_id):
        questions = Question.objects.filter(quiz__user=request.user, quiz__id=quiz_id).prefetch_related('answers')
        user_answers = UserAnswer.objects.filter(user=request.user, question__in=questions).select_related('selected_answer')

        user_answers_dict = {ua.question_id: ua.selected_answer_id for ua in user_answers}

        review_data = []

        for question in questions:
            answers_data = []
            selected_answer_id = user_answers_dict.get(question.id)

            for answer in question.answers.all():
                answer_status = None
                if answer.is_correct:
                    answer_status = 'Correct'
                elif answer.id == selected_answer_id:
                    answer_status = 'Incorrect'
                
                answer_data = {
                    'answer_input': answer.answer_input,
                    'answer_status': answer_status
                }
                answers_data.append(answer_data)

            review_data.append({
                'question_input': question.question_input,
                'answers': answers_data
            })
            
        serialized = QuestionReviewSerializer(review_data, many=True).data

        last_attempt = QuizAttempt.objects.filter(user=request.user, quiz_id=quiz_id).order_by('-attempted_at').first()
        meta_data = {
        "last_attempt_score": last_attempt.score if last_attempt else None,
        "last_attempt_time": last_attempt.attempted_at if last_attempt else None,
        "review": serialized
        }


        return Response(meta_data, status=status.HTTP_200_OK)
       

    def post(self, request):
        quiz_id = request.data.get('quiz_id')
        question_ids = request.data.get('qa_ids')

        for question_id, answer_id in question_ids.items():
            UserAnswer.objects.update_or_create(
                user=request.user,
                question_id=int(question_id),
                defaults={'selected_answer_id': answer_id}
            )

        answers = UserAnswer.objects.filter(
            user=request.user, 
            question__quiz__id=quiz_id, 
            question__id__in=[int(q_id) for q_id in question_ids.keys()]
            ).select_related('selected_answer', 'question')
        
        total_correct = sum(answer.selected_answer.is_correct for answer in answers)
        total_question = len(question_ids)

        score_raw = (total_correct / total_question) * 100 if total_question > 0 else 0
        score = int(score_raw) if score_raw.is_integer() else round(score_raw, 1)

        QuizAttempt.objects.create(
            user=request.user,
            quiz_id=quiz_id,
            score=score,
            attempted_at=now()
        )

        return Response({'Score': score}, status=status.HTTP_200_OK)
    
class CardsToQuizView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        quiz = Quiz.objects.get(user=request.user, topic='Cards To Quiz')
        questions = Question.objects.filter(quiz=quiz)

        serialized_qestions = QuestionSerializer(questions, many=True).data
        serialized_quiz = QuizSerilizer(quiz).data
        data = {
            'quiz': serialized_quiz,
            'questions': serialized_qestions
        }

        return Response(data, status=status.HTTP_200_OK)

    def post(self, request):
        if not request.data.get('reviewed'):
            qa = request.data.get('qa')
            if not qa:
                return Response({'Message': 'No data provided'}, status=status.HTTP_400_BAD_REQUEST)
            
            if Quiz.objects.filter(user=request.user, topic='Cards To Quiz').exists():
                Quiz.objects.filter(user=request.user, topic='Cards To Quiz').delete()
                        
            with transaction.atomic():
                quiz = Quiz.objects.create(user=request.user, topic='Cards To Quiz', subject='Flashcards Test', is_cards_to_quiz=True)

                for qa_item in qa:
                    question = Question.objects.create(
                        quiz=quiz,
                        question_input=qa_item['question_input'],
                        question_type='WR'
                    )

                    Answer.objects.create(
                        question=question,
                        answer_input=qa_item['correct_answer'],
                        is_correct=True
                    )

            return Response({'Message': 'Quiz created successfully'}, status=status.HTTP_200_OK)
        
        quiz = Quiz.objects.get(user=request.user, topic='Cards To Quiz')
        user_answers = request.data.get('user_answers')
        question_answers = Question.objects.filter(quiz=quiz).prefetch_related('answers')
        data = [{'question_input': question.question_input, 'answers': {'correct': question.answers.get(is_correct=True).answer_input, 'user_answer': None}} for question in question_answers]

        for answer in user_answers:
            for question in data:
                if answer['question_input'] == question['question_input']:
                    question['answers']['user_answer'] = answer['user_answer']

        result = cards_to_quiz(data)

        return Response(result, status=status.HTTP_200_OK)