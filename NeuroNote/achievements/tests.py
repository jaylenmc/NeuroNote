from rest_framework.test import APITestCase
from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework import status
from achievements.models import Achievements, UserAchievements

class AchievementsTestCase(APITestCase):
    fixtures = ['achievements/fixtures/Achievements.json']
    @classmethod
    def setUpClass(cls):
        super().setUpClass()
        User = get_user_model()
        cls.user = User.objects.create(email="james@test.com")

    def setUp(self):
        self.user_achievements = UserAchievements.objects.create(user=self.user)
        first_achievement = Achievements.objects.filter().first()
        self.user_achievements.achievements.add(first_achievement)
        self.client.force_authenticate(user=self.user)

    def test_get_achievements(self):
        url = reverse('get-achievements')
        url = f"{url}?user_achievements=True"

        response = self.client.get(url)
        self.assertEqual(
            response.status_code, 
            status.HTTP_200_OK,
            msg=f"Status code error: {response.data}"
            )
        
        print("========== GET TEST ==========")
        print(response.data)