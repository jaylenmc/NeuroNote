from .models import ReviewLog
from django.utils import timezone
from datetime import timedelta

def check_past_week_cards():
    cards = ReviewLog.objects.filter(
        card__last_review_date__gte=timezone.now() - timedelta(days=7)
        ).values_list('card__last_review_date', flat=True)
    print(f'cards: {cards}')

    return cards