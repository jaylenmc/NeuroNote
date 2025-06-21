from django.urls import path
from . import views

urlpatterns = [
    path('quiz/', views.QuizView.as_view()),
    path('quiz/<int:quiz_id>/', views.QuizView.as_view()),

    path('quiz/question/', views.QuizQuestions.as_view()),
    path('quiz/question/<int:quiz_id>/', views.QuizQuestions.as_view()),
    path('quiz/question/<int:quiz_id>/<int:question_id>/', views.QuizQuestions.as_view()),

    path('quiz/answer/', views.QuizAnswers.as_view()),
    path('quiz/answer/<int:quiz_id>/<int:question_id>/', views.QuizAnswers.as_view()),
    path('quiz/answer/<int:quiz_id>/<int:question_id>/<int:answer_id>/', views.QuizAnswers.as_view()),

    path('review/', views.UserAnswersView.as_view()),
    path('review/<int:quiz_id>/', views.UserAnswersView.as_view())
]