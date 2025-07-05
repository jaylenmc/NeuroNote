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
    stability = models.FloatField(default=1.0)
    learning_status = models.CharField(max_length=255, default="Unseen")

    last_review_date = models.DateTimeField(null=True, blank=True)
    scheduled_date = models.DateTimeField(null=True, blank=True)
    
    def update_sm21(self, rating):
        now_utc = timezone.now()

        # ────────────────────────────
        # 1.  Time elapsed (in minutes)
        # ────────────────────────────
        if self.last_review_date:
            elapsed_minutes = (now_utc - self.last_review_date).total_seconds() // MINUTE
        else:
            elapsed_minutes = 0

        self.last_review_date = now_utc
        self.repetitions += 1

        # ────────────────────────────
        # 2.  Difficulty & Stability
        # ────────────────────────────
        diff_change = 0.1 * (2 - rating)
        self.difficulty = max(1.0, min(10.0, self.difficulty + diff_change))

        if rating == 0:
            self.stability *= 0.7
        else:
            # NOTE: stability is now in *minutes*
            retrievability = math.exp(-elapsed_minutes / self.stability) if self.stability else 0.01
            gain = (0.1 + 0.1 * rating) * math.exp(1 - retrievability)
            self.stability *= (1 + gain)

        # ────────────────────────────
        # 3.  Next-interval (minutes)
        # ────────────────────────────
        if rating == 0:
            interval_min = 30                    # 30-minute immediate retry
        else:
            # base 10-minute logarithmic schedule, cap at 365 days
            interval_min = int(10 * math.log(self.stability + 1))
            interval_min = max(30, min(interval_min, 365 * DAY // MINUTE))

        self.scheduled_date = now_utc + timedelta(minutes=interval_min)

        # ────────────────────────────
        # 4.  Status labels (now minute-aware)
        # ────────────────────────────
        if interval_min < 10 * MINUTE and self.difficulty > 5.5:
            self.learning_status = "Struggling"
        elif interval_min > 45 * DAY // MINUTE and self.difficulty <= 4.0:
            self.learning_status = "Mastered"
        else:
            self.learning_status = "In Progress"

        reward_xp(self.card_deck.user, rating)
        ReviewLog.objects.create(card=self)
        self.save()

class ReviewLog(models.Model):
    card = models.ForeignKey(Card, on_delete=models.CASCADE)