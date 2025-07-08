from django.db import models
from authentication.models import AuthUser
from django.utils import timezone 
from datetime import timedelta
import math
from .utils import reward_xp

MINUTE   = 60                     
HOUR     = 60 * MINUTE
DAY      = 24 * HOUR

class Deck(models.Model):
    title = models.TextField()
    subject = models.CharField(max_length=255, default="No subject provided")
    num_of_cards = models.IntegerField(default=0)

    user = models.ForeignKey(AuthUser, on_delete=models.CASCADE, null=True)

    
class Card(models.Model):
    question = models.TextField()
    answer = models.TextField()
    card_deck = models.ForeignKey(Deck, on_delete=models.CASCADE)

    repetitions = models.IntegerField(default=0)
    difficulty = models.FloatField(default=5.0)
    stability = models.FloatField(default=1440.0)
    learning_status = models.CharField(max_length=255, default="Unseen")

    last_review_date = models.DateTimeField(null=True, blank=True)
    scheduled_date = models.DateTimeField(null=True, blank=True)
    
    def update_sm21(self, rating):
        now_utc = timezone.now()

        # 1. Elapsed time
        elapsed_minutes = 0
        if self.last_review_date:
            elapsed_minutes = (now_utc - self.last_review_date).total_seconds() / 60.0

        # 2. Difficulty adjustment
        diff_change = 0.1 * (2 - rating)
        self.difficulty = max(1.0, min(10.0, self.difficulty + diff_change))

        # 3. Stability and interval
        if rating == 0:
            self.stability *= 0.7
            interval_min = 30  # Retry quickly

        elif rating == 1:
            retrievability = max(math.exp(-elapsed_minutes / self.stability), 0.1)
            self.stability *= 0.8 * retrievability
            self.stability = max(self.stability, 10.0)  # Minimum floor
            interval_min = max(
                5,
                min(int(self.stability * (retrievability + 0.1) * 1.2), 480)  # cap at 8h
            )

        elif rating == 2:
            retrievability = max(math.exp(-elapsed_minutes / self.stability), 0.1)
            self.stability *= 0.9 * retrievability
            self.stability = max(self.stability, 10.0)
            interval_min = max(
                10,
                min(int(self.stability * (retrievability + 0.2) * 1.3), 1440)  # cap at 24h
            )

        else:
            retrievability = max(math.exp(-elapsed_minutes / self.stability), 0.1)
            gain = (0.1 + 0.1 * rating) * math.exp(1 - retrievability)
            self.stability *= (1 + gain)
            interval_min = int(max(
                10,
                min(self.stability * 1.3, 365 * DAY // MINUTE)  # cap at 1 year
            ))

        # 4. Schedule next review
        self.scheduled_date = now_utc + timedelta(minutes=interval_min)

        # 5. Bookkeeping
        self.last_review_date = now_utc
        self.repetitions += 1

        # 6. Learning status
        if interval_min < 10 * MINUTE and self.difficulty > 5.5:
            self.learning_status = "Struggling"
        elif interval_min > 45 * DAY // MINUTE and self.difficulty <= 4.0:
            self.learning_status = "Mastered"
        else:
            self.learning_status = "In Progress"

        # 7. Save + log
        reward_xp(self.card_deck.user, rating)
        ReviewLog.objects.create(card=self)
        self.save()

class ReviewLog(models.Model):
    card = models.ForeignKey(Card, on_delete=models.CASCADE)