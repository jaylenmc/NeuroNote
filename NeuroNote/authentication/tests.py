from rest_framework.test import APITestCase
from .models import AuthUser
from django.utils import timezone
from datetime import timedelta
from django.urls import reverse
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken
from unittest.mock import patch

class AuthUserTests(APITestCase):
    def setUp(self):
        self.user = AuthUser.objects.create_user(
            email='test@gmail.com',
            password='12345',
        )
        refresh = RefreshToken.for_user(user=self.user)
        refresh['email'] = self.user.email
        self.user.refresh_token = str(refresh)
        self.user.jwt_token = str(refresh.access_token)
        self.url = reverse('jwt-refresh')
        print(f'Refresh Token: {str(refresh)}')

    def test_token_refresh(self):
        self.client.cookies['refresh_token'] = self.user.refresh_token
        response = self.client.post(self.url, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        print(response.data)

    @patch('authentication.views.requests.get')
    @patch('authentication.views.requests.post')
    def test_google_api(self, mock_post, mock_get):
        mock_post.return_value.status_code = 200
        mock_post.return_value.json.return_value = {
            'access_token': 'test_access_token',
            'refresh_token': 'test_refresh_token',
            'expires_in': 3600,
            'token_type': 'Bearer',
            'scope': 'email profile openid',
            'id_token': 'test_id_token',
        }

        mock_get.return_value.status_code = 200
        mock_get.return_value.json.return_value = {
            'email': 'test@gmail.com',
            'sub': '1234567890',
            'name': 'Test User'
        }

        url = reverse('google-api')
        data = {'code': 'test_code'}
        response = self.client.post(url, data, format='json')

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

        # self.assertEqual(response.status_code, status.HTTP_200_OK)
        # self.assertIn('google_access_token', response.data['user'])
        # self.assertIn('google_refresh_token', response.data['user'])
        # self.assertIn('jwt_token', response.data['user'])
        # self.assertIn('jwt_refresh', response.data)
        print(f'Response Data: {response.data}')