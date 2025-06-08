from django.urls import path
from . import views

urlpatterns = [
    path('deck/', views.DeckCollection.as_view()),
    path('deck/delete/<int:deck_id>', views.DeckCollection.as_view()),
    path('cards/', views.CardCollection.as_view()),
    path('cards/<int:deck_id>/', views.CardCollection.as_view()),
    path('cards/delete/<int:deck_id>/<int:card_id>/', views.CardCollection.as_view()),
    path('review/', views.review_card)
]