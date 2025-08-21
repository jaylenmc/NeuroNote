from django.urls import path
from . import views

urlpatterns = [
    path('deck/', views.DeckCollection.as_view(), name='get-decks'),
    path('deck/<int:deck_id>/', views.DeckCollection.as_view(), name='delete-update-cards'),

    path('cards/', views.CardCollection.as_view(), name='get-create-cards'),
    path('cards/<int:deck_id>/', views.CardCollection.as_view(), name='get-cards'),
    path('cards/delete/<int:deck_id>/<int:card_id>/', views.CardCollection.as_view(), name='delete-cards'),
    path('cards/update/<int:deck_id>/<int:card_id>/', views.CardCollection.as_view()),

    path('cards/due/', views.DueCardsView.as_view(), name='due-cards'),

    path('review/', views.review_card, name='review-card')
]