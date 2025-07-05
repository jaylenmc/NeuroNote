from rest_framework.test import APITestCase
from django.contrib.auth import get_user_model
from rest_framework import status
from .models import Card, Deck
from authentication.models import AuthUser
from django.utils import timezone
from datetime import timedelta, datetime
from zoneinfo import ZoneInfo
from django.urls import reverse

class CardTestCase(APITestCase):
    # fixtures = ['initial_data.json']

    def setUp(self):
        User = get_user_model()
        self.user = User.objects.create_user(email='bob@gmail.com', password='12345')
        self.deck = Deck.objects.create(
            user=self.user,
            title='Test Deck',
            subject='Test Subject'
        )
        self.cards = Card.objects.create(
            question='How many days are in a week?',
            answer='7',
            card_deck=self.deck,
            scheduled_date=timezone.now().isoformat()
        )
        # self.user = AuthUser.objects.get(email='jayzilla195@gmail.com')

        self.client.force_authenticate(user=self.user)
        self.url = reverse('get-cards', args=[self.deck.id])

    def test_create_card(self):
        data = {
            'question': 'How many days are in a week?',
            'answer': '7',
            'deck_id': Deck.objects.last().pk,
            'scheduled_date': timezone.now().isoformat()
        }

        for card in Card.objects.all():
            print(card.scheduled_date)

        response = self.client.post(self.url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        print(response.data)

    def test_get_cards(self):
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        print(response.data)