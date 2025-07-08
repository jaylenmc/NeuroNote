from django.urls import path
from . import views

urlpatterns = [
    path('deck/', views.DeckCollection.as_view()),
    path('deck/delete/<int:deck_id>', views.DeckCollection.as_view()),
    path('deck/update/<int:deck_id>/<path:user>/', views.DeckCollection.as_view()),

    path('cards/', views.CardCollection.as_view(), name='create-card'),
    path('cards/<int:deck_id>/', views.CardCollection.as_view(), name='get-cards'),
    path('cards/delete/<int:deck_id>/<int:card_id>/', views.CardCollection.as_view()),
    path('cards/update/<int:deck_id>/<int:card_id>/', views.CardCollection.as_view()),

    path('cards/<int:deck_id>/due/', views.DueCardsView.as_view(), name='due-cards'),

    path('review/', views.review_card, name='review-card')
]