from rest_framework.test import APITestCase
from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework import status
from .models import FileUpload, LinkUpload
from django.core.files.uploadedfile import SimpleUploadedFile
from django.test import override_settings
from urllib.parse import urlparse
import tempfile
import os
from django.conf import settings
from .models import LinkUpload

from django.test import TestCase, LiveServerTestCase
from selenium.webdriver.firefox.webdriver import WebDriver
from selenium.webdriver.common.by import By

@override_settings(MEDIA_ROOT=tempfile.gettempdir())
class ResourceTestCase(APITestCase):
    @classmethod
    def setUpClass(cls):
        super().setUpClass()
        User = get_user_model()
        cls.user = User.objects.create(email='test@gmail.com')
    
    def setUp(self):
        self.client.force_authenticate(self.user)

        # url = reverse('create-resource')
        # link = "https://www.youtube.com/watch?v=-W89X9GsKyE"
        # file = SimpleUploadedFile("ScienceExamProblems.pdf", b"How many inches are in a cm", content_type="application/pdf")
        # data = {
        #     'user': self.user.email,
        #     'link_upload': link,
        #     'resource_type': "Link",
        #     'title': "Calc Lecture"
        #     }
        # response = self.client.post(url, data=data, format='json')
        # self.assertEqual(
        #     response.status_code, 
        #     status.HTTP_201_CREATED,
        #     msg=f'Post request status code error: {response.data}'
        # )
        # self.file = response.data

    def test_resource_post(self):
        print(f"User: {self.user.pk}")
        url = reverse('create-resource')
        file = SimpleUploadedFile("ScienceExamProblems.pdf", b"How many inches are in a cm", content_type="application/pdf")
        link = "https://www.youtube.com/watch?v=-W89X9GsKyE"
        data = {
            'user': self.user.pk,
            'file_upload': file,
            "resource_type": "File",
            "title": "Cultural Studies Lecture"
            }
        response = self.client.post(url, data=data, format='multipart')
        self.assertEqual(
            response.status_code, 
            status.HTTP_201_CREATED,
            msg=f'Status code error: {response.data}'
        )
        print(response.data)

    def test_link_get(self):
        url = reverse('get-link', args=[self.link['id']])
        response = self.client.get(url)
        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
            msg=f"Get request status code error: {response.data}"
        )
        print(response.data)

    def test_resource_delete(self):
        url = reverse('delete-resource', args=[self.file['id']])
        params = {"resource_type": "Link"}
        link_before = self.file
        response = self.client.delete(url, data=params)

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
            msg=f"Status code error: {response.data}"
        )
        self.assertNotIn(
            link_before['id'],
            LinkUpload.objects.filter(user=self.user),
            msg=f"Link not deleted: {response.data}"
        )
        print(response.data)

# @override_settings(MEDIA_URL='/test/')
# class FileServingTestCase(TestCase):
#     @classmethod
#     def setUpClass(cls):
#         from django.core.files.storage import FileSystemStorage
#         super().setUpClass()
#         cls.temp_media_root = tempfile.mkdtemp()
#         settings.MEDIA_ROOT = cls.temp_media_root

#         Resource._meta.get_field('file_upload').storage = FileSystemStorage(location=cls.temp_media_root)

#         print(f"Test media root: {cls.temp_media_root}")
#         print(f"Test media URL: {settings.MEDIA_URL}")
#         print(f"Using custom file serving approach for tests")

#     @classmethod
#     def tearDownClass(cls):
#         import shutil
#         shutil.rmtree(cls.temp_media_root, ignore_errors=True)
#         super().tearDownClass()

#     def setUp(self):
#         User = get_user_model()
#         self.user = User.objects.create(email="test@gmail.com", password="Testpassword")

#         url = reverse('create-resource')
#         file = SimpleUploadedFile("ReligionNotes.pdf", b"Stock text", content_type="application/pdf")
#         data = {
#             'file_upload': file,
#             'user': self.user.email
#         }

#         response = self.client.post(url, data=data)
#         self.assertEqual(
#             response.status_code,
#             status.HTTP_200_OK,
#             msg=f"Status code error: {response.data}"
#         )

#         self.resource = response.data

        
#     def serve_test_file(self, file_path):
#         """Custom method to serve files from the test media directory"""
#         from django.http import HttpResponse
        
#         if file_path.startswith('/test/'):
#             file_path = file_path[6:]
        
#         full_file_path = os.path.join(self.temp_media_root, file_path.lstrip('/'))
        
#         if not os.path.exists(full_file_path):
#             return HttpResponse(status=404)
        
#         with open(full_file_path, 'rb') as f:
#             content = f.read()
        
#         response = HttpResponse(content, content_type='application/pdf')
#         return response

#     def test_get_file(self):
#         file_url = self.resource['file_upload']
#         print(f"Original file_url: {file_url}")
        
#         parsed_url = urlparse(file_url)
#         print(f"Parsed url components: {parsed_url}")
        
#         file_path = parsed_url.path
#         print(f"File path: {file_path}")
        
#         response = self.serve_test_file(file_path)
        
#         print(f"Response status: {response.status_code}")
#         print(f"Response headers: {dict(response.headers)}")
#         print(f"Response Content: {response.content}")
        
#         if response.status_code != 200:
#             print(f"Response content: {response.content}")
        
#         self.assertEqual(
#             response.status_code, 
#             200,
#             msg=f"Status code error: {response.content}"
#         )
#         self.assertEqual(response['Content-Type'], 'application/pdf')
#         self.assertTrue(len(response.content) > 0)