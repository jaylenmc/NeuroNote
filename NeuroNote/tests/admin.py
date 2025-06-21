from django.contrib import admin
from tests.models import Quiz, Question, Answer, QuizAttempt

admin.site.register(Quiz)
admin.site.register(Question)
admin.site.register(Answer)
admin.site.register(QuizAttempt)