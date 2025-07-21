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
        self.deck = Deck.objects.bulk_create([
            Deck(
                user=self.user,
                title='Test Deck',
                subject='Test Subject'
            ),
            Deck(
                user=self.user,
                title='Test Deck2',
                subject='Test Subject2'
            )
        ])

        self.cards = Card.objects.bulk_create([
            Card(
                question='How many days are in a week',
                answer='7',
                card_deck=self.deck[1],
                scheduled_date=(timezone.now() + timedelta(hours=2)).isoformat()
            ),
            Card(
                question='What is cultural studies?',
                answer='The study of everyday life',
                card_deck=self.deck[1],
                scheduled_date=(timezone.now() + timedelta(hours=2)).isoformat()
            ),
            Card(
                question='How many people are in the world?',
                answer='Billions',
                card_deck=self.deck[0]
            ),
            Card(
                question='How do you make pizza?',
                answer='With dough and sauce',
                card_deck=self.deck[0]
            ),
        ])

        self.client.force_authenticate(user=self.user)

    def test_update_deck(self):
        url = reverse('delete-update-cards', args=[self.deck[1].pk])
        data = {
            'title': 'Updated test title'
        }
        response = self.client.put(url, data)
        self.assertNotEqual(self.deck[1].title, response.data['title'])
        self.assertEqual(self.deck[1].subject, response.data['subject'])
        print(response.data)

    def test_create_card(self):
        url = reverse('get-create-cards')
        data = {
            'question': 'how many days are in a week',
            'answer': '7',
            'deck_id': Deck.objects.last().pk,
            'scheduled_date': timezone.now().isoformat()
        }

        response = self.client.post(url, data, format='json')        
        self.assertNotEqual(response.status_code, status.HTTP_200_OK, f"Error: {response.data}")
        print(response.data)

    # For gathering all cards for review
    def test_get_cards(self):
        url = reverse('due-cards')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK, f'Status code error: {response.data}')
        # self.assertNotIn(self.cards[1].pk, [obj['id'] for obj in response.data], f'Card not found: {response.data}')
        print(response.data)

    # For delete single cards and in bulk
    def test_delete_cards(self):
        # url = reverse('delete-cards', args=[self.deck[0].pk, self.cards[2].pk])
        # response = self.client.delete(url)

        # cards = Card.objects.filter(card_deck=self.deck[0].pk).values_list('id', flat=True)
        # self.assertEqual(response.status_code, status.HTTP_200_OK, f'Status code error: {response.data}')
        # self.assertNotIn(self.cards[2].pk, list(cards), f'Error: {response.data}')
        # print(response.data)

        url = reverse('delete-cards', args=[self.deck[0].pk, self.cards[2].pk])
        url_query = f'{url}?bulk_delete=2, 3, no'
        response = self.client.delete(url_query, format='json')

        self.assertEqual(response.status_code, status.HTTP_200_OK, f'Status code error: {response.data}')
        ids = Card.objects.filter(card_deck__user=self.user).values_list('id', flat=True)
        self.assertNotIn(self.cards[2].pk, list(ids), f'Found in error: {response.data}')
        print(response.data)

    def test_due_cards(self):
        url = reverse('due-cards', args=[self.deck[0].pk])
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

    def test_review_cards(self):
        url = reverse('review-card')
        data = {
            'quality': 5,
            'deck_id': self.deck[1].pk,
            'card_id': self.cards[0].pk
        }

        response = self.client.put(url, data)
        self.assertEqual(response.status_code, status.HTTP_200_OK, f'Status code error: {response.data}')
        print(response.data)