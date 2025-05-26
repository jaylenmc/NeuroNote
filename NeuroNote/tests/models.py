from django.db import models
from authentication.models import AuthUser

class Quiz(models.Model):
    topic = models.CharField(max_length=255, null=True)
    subject = models.CharField(max_length=255, null=True, blank=True)
    user = models.ForeignKey(AuthUser, on_delete=models.CASCADE, null=True)


class Question(models.Model):
    quiz = models.ForeignKey(Quiz, on_delete=models.CASCADE, null=True)
    question_input = models.TextField(null=True)

class Answer(models.Model):
    question = models.OneToOneField(Question, on_delete=models.CASCADE, null=True)
    answer_input = models.TextField(null=True)
