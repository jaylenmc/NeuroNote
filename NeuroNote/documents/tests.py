from rest_framework.test import APITestCase
from django.contrib.auth import get_user_model
from folders.models import Folder
from django.urls import reverse
from rest_framework import status
from .models import Document, Tag

class DocumentTestCase(APITestCase):
    def setUp(self):
        User = get_user_model()
        self.user = User.objects.create(email="bob@test.com")
        self.folder = Folder.objects.create(
            name='test_folder',
            user=self.user
        )

        self.document = Document.objects.create(
            title = 'Cultural Studies 8/17/25',
            notes = 'Subjectivity\nIts about how to make money online and come to a conclusion about subjectivity and how us as a collective can collaborate together\nBut actually the aliens are coming to America',
            folder = self.folder,
            published = False
        )
        self.tag = Tag.objects.create(title='Tuesday Exam Prep', document=self.document)
        self.client.force_authenticate(user=self.user)

    def test_document_create(self):
        url = reverse('create-document')
        data = {
            'title': 'Cultural Studies 8/17/25',
            'notes': 'Subjectivity\nIts about how to make money online and come to a conclusion about subjectivity and how us as a collective can collaborate together\nBut actually the aliens are coming to America',
            'folder_id': self.folder.pk,
            'tag': 'Difficult Subject',
            'is_published': False
        }
        response = self.client.post(url, data=data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK, msg=f"Status code error: {response.data}")
        self.assertTrue(Document.objects.filter(folder__user=self.user), msg=f"Document not created: {response.data}")
        self.assertTrue(Tag.objects.filter(title='Difficult Subject', document=response.data['id']), msg=f"Tag not created: {response.data}")
        print(response.data)

    def test_document_get(self):
        url = reverse('get-all-documents', args=[self.folder.pk])

        response = self.client.get(url, format='json')
        self.assertEqual(
            response.status_code, status.HTTP_200_OK, 
            msg=f"Status code error: {response.data}"
            )
        print(response.data)

    def test_document_update(self):
        url = reverse('update-document', args=[self.document.pk])
        data = {
            'title': 'Updated title',
            'notes': 'Subjectivity\nIts about how to make money online and come to a conclusion about subjectivity and how us as a collective can collaborate together\nBut actually the aliens are coming to America',
            'folder_id': self.folder.pk,
            'tag': 'Test tag',
            'is_published': True
        }
        prev_tag = self.tag.title
        response = self.client.put(url, data=data, format='json')
        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK, 
            msg=f"Status code error: {response.data}"
            )
        self.assertNotEqual(
            response.data['title'], self.document.title,
            msg=f"Document didn't update: {response.data}"
            )
        self.assertNotEqual(
            Tag.objects.get(title='Test tag', document=response.data['id']).title,
            prev_tag, 
            msg=f"Tag not updated: {response.data}"
            )
        print(response.data)

    def test_tag_delete(self):
        url = reverse('delete-tag', args=[self.document.pk, self.tag.pk])
        tag = self.tag.title
        response = self.client.delete(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK, msg=f"Status code error: {response.data}")
        self.assertFalse(Tag.objects.filter(title=tag, document=self.document), msg=f"Tag not deleted: {response.data}")
        print(response.data)