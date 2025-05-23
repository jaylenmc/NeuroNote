from django.urls import path
from . import views

urlpatterns = [
    path('quiz/', views.QuizView.as_view()),
    path('quiz/<int:id>', views.QuizView.as_view()),
]