from .models import Achievements, UserAchievements
from flashcards.models import Card, Deck

def knowledge_engineer(user, deck):
    cards = Card.objects.filter(card_deck=deck)
    reviewed_cards = cards.filter(last_review_date__isnull = False)
    if not user.achievements.filter(name="Knowledge Engineer").exists() and len(reviewed_cards) == len(cards) and len(cards) >= 10:
        achievement = Achievements.objects.filter(name="Knowledge Engineer").first()
        user.achievements.add(achievement)

def memory_architect(user, deck):
    cards = Card.objects.filter(card_deck=deck, last_review_date__isnull=False).first()
    if cards and not user.achievements.filter(name="Memory Architect"):
        achievement = Achievements.objects.filter(name="Memory Architect").first()
        user.achievements.add(achievement)

def deck_destroyer(user):
    user_decks = Deck.objects.filter(user=user).count()
    if user_decks >= 10:
        user_achieve = UserAchievements.objects.filter(user=user).first()
        user_achieve.achievements.add(Achievements.objects.filter(name="Deck Destroyer").first())