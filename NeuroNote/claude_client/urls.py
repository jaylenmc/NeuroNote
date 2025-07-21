from django.urls import path
from . import client

urlpatterns = [
    path('thinker/', client.thinker_ai),
    path('notetaker/', client.NoteTakerAi.as_view()),
    path('cardsgen/', client.CardsGen.as_view()),
    path('testgen/', client.generate_quiz, name='test-gen')
]