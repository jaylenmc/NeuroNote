from rest_framework import serializers
from .models import Deck, Card

class DeckSerializer(serializers.ModelSerializer):
    class Meta:
        model = Deck
        fields = ['title', 'subject', 'num_of_cards', 'id']

class CardSerializer(serializers.ModelSerializer):
    class Meta:
        model = Card
        fields = '__all__'