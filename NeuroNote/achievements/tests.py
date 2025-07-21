from rest_framework.test import APITestCase
from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework import status
from achievements.models import Achievements

class AchievementsTestCase(APITestCase):
    def setUp(self):
        User = get_user_model()
        self.user = User.objects.create_user(email="bob@test.com", password="12345")
        self.achievements = Achievements.objects.create(
            name="Test Achievement",
            description='Test description',
            tier='Bronze'
        )

    def test_get_achievements(self):
        url = reverse('get-achievements')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(len(response.data) > 0, msg=f'Error: {response.data}')
        print(response.data)