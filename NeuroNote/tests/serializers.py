from rest_framework import serializers
from .models import Quiz, Question, Answer

class QuizSerilizer(serializers.ModelSerializer):
    class Meta:
        fields = ['topic', 'subject', 'folder', 'id']
        model = Quiz

class QuestionSerializer(serializers.ModelSerializer):
    class Meta:
        fields = ['question_input', 'question_type', 'id']
        model = Question

class AnswerSerializer(serializers.ModelSerializer):
    class Meta:
        fields = ['answer_input', 'is_correct', 'id']
        model = Answer