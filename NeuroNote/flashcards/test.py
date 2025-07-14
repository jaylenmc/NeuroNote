from rest_framework.test import APITestCase
from django.contrib.auth import get_user_model
from rest_framework import status
from .models import Card, Deck
from authentication.models import AuthUser
from django.utils import timezone
from datetime import timedelta, datetime
from zoneinfo import ZoneInfo
from django.urls import reverse
from freezegun import freeze_time


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
        self.user = AuthUser.objects.get(email=self.user.email)
        self.deck = Deck.objects.all()

        self.client.force_authenticate(user=self.user)

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
        self.url = reverse('get-all-cards')
        print(f'User card: {self.cards}')
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        print(response.data)

    def test_due_cards(self):
        url = reverse('due-cards', args=[self.deck.id])
        response = self.client.get(url, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        print(f'response data: {response.data}')

    def test_review_card_times(self):
        card = Card.objects.get(id=self.cards.id)
        print(f'Before update: {card.scheduled_date}')

        with freeze_time("2025-07-07 20:40:51+00:00"):
            card.update_sm21(rating=1)
            print('--------------------------------')
            print(f'After update 1: {card.scheduled_date}')
            print(f'Stability: {card.stability}')

        with freeze_time("2025-07-09 20:41:00+00:00"):
            card.refresh_from_db()
            card.update_sm21(rating=1)
            print('--------------------------------')
            print(f'After update 2: {card.scheduled_date}')
            print(f'Stability: {card.stability}')

        with freeze_time("2025-07-10 20:41:00+00:00"):
            card.refresh_from_db()
            card.update_sm21(rating=1)
            print('--------------------------------')
            print(f'After update 2: {card.scheduled_date}')
            print(f'Stability: {card.stability}')