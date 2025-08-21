from django.db import models
from authentication.models import AuthUser
from folders.models import Folder
from django.utils import timezone

class Quiz(models.Model):
    topic = models.CharField(max_length=255, null=True, default='Untitled')
    subject = models.CharField(max_length=255, null=True, blank=True)
    user = models.ForeignKey(AuthUser, on_delete=models.CASCADE, null=True)
    folder = models.ForeignKey(Folder, on_delete=models.CASCADE, null=True, related_name='quiz')
    is_cards_to_quiz = models.BooleanField(default=False)

class Question(models.Model):
    QUESTION_TYPE_CHOICES = [
        ('MC', 'Multiple Choice'),
        ('WR', 'Written'),
    ]

    quiz = models.ForeignKey(Quiz, on_delete=models.CASCADE, default='No quiz provided')
    question_input = models.TextField(null=True)
    question_type = models.CharField(max_length=2, choices=QUESTION_TYPE_CHOICES, default='MC')

class Answer(models.Model):
    question = models.ForeignKey(Question, on_delete=models.CASCADE, null=True, related_name='answers')
    answer_input = models.TextField(null=True, blank=True)
    is_correct = models.BooleanField(null=True, blank=True)

class UserAnswer(models.Model):
    user = models.ForeignKey(AuthUser, on_delete=models.CASCADE)
    question = models.ForeignKey(Question, on_delete=models.CASCADE)
    selected_answer = models.ForeignKey(Answer, on_delete=models.CASCADE)
    written_answer = models.TextField(null=True, blank=True)

class QuizAttempt(models.Model):
    user = models.ForeignKey(AuthUser, on_delete=models.CASCADE)
    quiz = models.ForeignKey(Quiz, on_delete=models.CASCADE)
    attempted_at = models.DateTimeField(default=timezone.now)
    score = models.FloatField()

    def __str__(self):
        return f"{self.user.email} - {self.quiz.topic} - {self.attempted_at}"