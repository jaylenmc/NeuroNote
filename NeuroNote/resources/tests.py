from rest_framework.test import APITestCase
from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework import status
from .models import Resource
from django.core.files.uploadedfile import SimpleUploadedFile
from django.test import override_settings
from urllib.parse import urlparse
import tempfile
import os
from pathlib import Path
from django.conf import settings
from django.test import TestCase

@override_settings(MEDIA_ROOT=tempfile.gettempdir())
class CreateResourceTestCase(APITestCase):
    def setUp(self):
        User = get_user_model()
        self.user = User.objects.create(email='test@gmail.com')
        self.client.force_authenticate(self.user)

    def test_resource_post(self):
        url = reverse('create-resource')
        file = SimpleUploadedFile("ScienceExamProblems.pdf", b"How many inches are in a cm", content_type="application/pdf")
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

@override_settings(MEDIA_ROOT=tempfile.gettempdir())
class FileServingTestCase(TestCase):
    def setUp(self):
        User = get_user_model()
        self.user = User.objects.create(email="test@gmail.com", password="Testpassword")

        url = reverse('create-resource')
        file = SimpleUploadedFile("ScienceNote.pdf", b"Stock text", content_type="application/pdf")
        data = {
            'file_upload': file,
            'user': self.user.email
        }

        response = self.client.post(url, data=data)
        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
            msg=f"Status code error: {response.data}"
        )

        self.resource = response.data

    def Test_Get_File(self):
        file_url = self.resource['file_upload']  # e.g. 'http://testserver/media/user_1/pdf/ScienceNote_abc123.pdf'
        parsed_url = urlparse(file_url)
        relative_path = Path(parsed_url.path).relative_to(settings.MEDIA_URL)

        # Construct the URL path to GET
        url_path = f"{settings.MEDIA_URL}{relative_path.as_posix()}"
        
        # Check that the file exists on disk (optional debug)
        file_path = os.path.join(settings.MEDIA_ROOT, relative_path.as_posix())
        print(f"File exists on disk: {os.path.exists(file_path)}")
        
        # GET the file URL
        url_path = f"{settings.MEDIA_URL}{relative_path.as_posix()}"

        response = self.client.get(url_path)

        # Assert the file served correctly
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response['Content-Type'], 'application/pdf')
        self.assertTrue(len(response.content) > 0)