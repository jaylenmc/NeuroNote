from django.contrib import admin
from .models import Deck, Card, ReviewLog

class ReviewLogAdmin(admin.ModelAdmin):
    list_display = ['card']
    fields = ['reviewed_at', 'rating', 'stability', 'difficulty', 'scheduled_review']
    
admin.site.register((Deck, Card))
admin.site.register(ReviewLog, ReviewLogAdmin)