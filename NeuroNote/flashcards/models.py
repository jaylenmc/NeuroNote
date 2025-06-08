from django.db import models
from authentication.models import AuthUser
from datetime import date, timedelta
import math

class Deck(models.Model):
    title = models.TextField()
    subject = models.CharField(max_length=255, default="No subject provided")
    num_of_cards = models.IntegerField(default=0)

    user = models.ForeignKey(AuthUser, on_delete=models.CASCADE, null=True)

    
class Card(models.Model):
    question = models.TextField()
    answer = models.TextField()
    card_deck = models.ForeignKey(Deck, on_delete=models.CASCADE)
    correct = models.IntegerField(null=True, blank=True)
    incorrect = models.IntegerField(null=True, blank=True)
    is_overdue = models.BooleanField(default=False)

    repetitions = models.IntegerField(default=0)
    difficulty = models.FloatField(default=5.0)
    stability = models.FloatField(default=1.0)

    last_review_date = models.DateField(null=True, blank=True)
    scheduled_date = models.DateField(null=True, blank=True)
    
    def update_sm21(self, rating):
        today = date.today()

        self.last_review_date = today
       
        elapsed_days = (today - self.last_review_date).days if self.last_review_date else 0
        self.repetitions += 1

        diff_change = 0.1 * (2 - rating) 
        self.difficulty += diff_change
        self.difficulty = max(1.0, min(10.0, self.difficulty)) 
       
        if rating == 0:
            self.stability *= 0.7 
        else:
            retrievability = math.exp(-elapsed_days / self.stability) if self.stability != 0 else 0.01
            gain = (0.1 + 0.1 * rating) * math.exp(1 - retrievability)
            self.stability *= 1 + gain
       
        interval = int(10 * math.log(self.stability + 1)) 
        interval = max(1, min(interval, 365))
        self.scheduled_date = today + timedelta(days=interval) 
    
        ReviewLog.objects.create(card=self)

        self.save()

# Add function to notify user of overdue review days !!

class ReviewLog(models.Model):
    card = models.ForeignKey(Card, on_delete=models.CASCADE)