from rest_framework.test import APITestCase
from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework import status

class ResourceTestCase(APITestCase):
    def setUp(self):
        User = get_user_model()
        self.user = User.objects.create(email='test@gmail.com')
        self.client.force_authenticate(self.user)

    def test_resource_post(self):
        url = reverse('create-resource')
        data = {'filetype': 'Textbook',}
        response = self.client.post(url, data=data)
        self.assertEqual(
            response.status_code, 
            status.HTTP_200_OK,
            msg=f'Status code error: {response.data}'
        )
        print(response.data)