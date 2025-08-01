from rest_framework.test import APITestCase
from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework import status
from .models import Resource
from django.core.files import File
import tempfile

class ResourceTestCase(APITestCase):
    def setUp(self):
        User = get_user_model()
        self.user = User.objects.create(email='test@gmail.com')

        temp_file = tempfile.NamedTemporaryFile(suffix=".pdf", delete=False)
        temp_file.write(b"Question 1: How many days are in a week?")
        wrapped = File(temp_file, name="MathProblems.pdf")
        self.file = Resource.objects.create(
            user=self.user,
            file_name="MathProblems",
            file_upload=wrapped,
        )
        self.client.force_authenticate(self.user)

    def test_resource_post(self):
        url = reverse('create-resource')
        with open('MathProblems.pdf', 'w') as mp:
            mp.write('Question 1: How many days are in a week?')
        with open('MathProblems.pdf', 'rb') as file:
            data = {
                'user': self.user.email,
                'file_upload': file
                }
            response = self.client.post(url, data=data, format='multipart')
            self.assertEqual(
                response.status_code, 
                status.HTTP_200_OK,
                msg=f'Status code error: {response.data}'
            )
            print(response.data)

    def test_resource_get(self):
        url = reverse('get-files', args=['MathProblems'])
        response = self.client.get(url)
        self.assertEqual(
            response.status_code, 
            status.HTTP_200_OK, 
            msg=f"Status code error: {response.data}"
            )
        print(response.data)