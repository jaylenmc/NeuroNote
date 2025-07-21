from rest_framework.test import APITestCase, force_authenticate
from django.urls import reverse
from authentication.models import AuthUser
from rest_framework import status
import json

class ClaudeTestCase(APITestCase):
    def setUp(self):
        self.user = AuthUser.objects.create(email='bob@testmail.com')
        self.client.force_authenticate(user=self.user)

    def test_generate_test(self):
        url = reverse('test-gen')
        response = self.client.post(url, data={"prompt": "Make a quiz for django basics"}, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK, msg=f"Status code error: {response.data}")
        self.assertTrue(isinstance(response.data, dict), msg=f"Response not dict: {response.data}")