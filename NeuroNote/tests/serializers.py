from rest_framework import serializers
from .models import Quiz, Question, Answer, UserAnswer

class QuizSerilizer(serializers.ModelSerializer):
    class Meta:
        fields = ['topic', 'subject', 'folder', 'id']
        model = Quiz

class QuestionSerializer(serializers.ModelSerializer):
    class Meta:
        fields = ['question_input', 'question_type', 'id']
        model = Question

class AnswerSerializer(serializers.ModelSerializer):
    question_input = serializers.CharField(source='question.question_input', read_only=True)
    question_type = serializers.CharField(source='question.question_type', read_only=True)
    question = serializers.IntegerField(source='question.id', read_only=True)
    
    class Meta:
        fields = ['answer_input', 'is_correct', 'id', 'question_input', 'question_type', 'question']
        model = Answer

class AnswerReviewSerializer(serializers.Serializer):
    answer_input = serializers.CharField()
    answer_status = serializers.CharField(allow_null=True)


class QuestionReviewSerializer(serializers.Serializer):
    question_input = serializers.CharField()
    answers = AnswerReviewSerializer(many=True)