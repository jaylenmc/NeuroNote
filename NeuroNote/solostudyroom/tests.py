from django.test import TestCase
from rest_framework.test import APITestCase
from django.contrib.auth import get_user_model
from documents.models import Document
from resources.models import FileUpload, LinkUpload
from folders.models import Folder
from solostudyroom.models import PinnedResourcesDashboard
from django.core.files.uploadedfile import SimpleUploadedFile
from django.urls import reverse
from rest_framework import status
import tempfile
from django.test import override_settings

@override_settings(MEDIA_ROOT=tempfile.mkdtemp())
class PinnedResourceTestCase(APITestCase):
    @classmethod
    def setUpClass(cls):
        super().setUpClass()
        User = get_user_model()
        cls.user = User.objects.create(email="test@gmail.com")
    
    def setUp(self):
        file = SimpleUploadedFile(
            name="Calc Notes.pdf", 
            content=b"Here are the notes", 
            content_type="content/pdf"
        )

        self.folder = Folder.objects.create(
            name="Comp Sci", 
            user=self.user
        )

        self.document = Document.objects.create(
            title="hello world", 
            notes="Pyhton is a coding language", 
            folder=self.folder, 
            resource_type="Document"
        )

        self.link = LinkUpload.objects.create(
            user=self.user, 
            link="https://www.youtube.com/watch?v=-W89X9GsKyE", 
            resource_type="Link",
            title="Cultural Studies Lecture"
        )

        link = LinkUpload.objects.create(
            user=self.user, 
            link="https://www.youtube.com/watch?v=-W89X9GsyE", 
            resource_type="Link",
            title="Science lab lecture"
        )
        
        self.file = FileUpload.objects.create(
            user=self.user, 
            file_name="Hey Notes", 
            resource_type="PDF", 
            file_upload=file
        )

        self.pinned_resources = PinnedResourcesDashboard.objects.create(
            user=self.user, 
        )
        self.pinned_resources.document.add(self.document)
        self.pinned_resources.link.add(self.link)
        self.pinned_resources.link.add(link)
        self.pinned_resources.file.add(self.file)

        self.client.force_authenticate(user=self.user)

    def test_get_pinned_resources(self):
        print("================ GET TEST ================")
        url = reverse('pinned-resources')
        response = self.client.get(url)
        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
            msg=f"Status code error: {response.data}"
        )
        print(response.data)
    
    def test_post_pinned_resources(self):
        url = reverse('create-pinned-resource')
        data = {
            'resource_type': 'link',
            'link': 'https://www.youtube.com/watch?v=-W89X9GsyE',
            'title': 'Science lab lecture'
        }

        response = self.client.post(url, data=data, format='json')
        self.assertEqual(
            response.status_code,
            status.HTTP_201_CREATED,
            msg=f"Status code error: {response.data}"
        )

        pinned_resource = PinnedResourcesDashboard.objects.filter(
            user=self.user).values_list("document", 'file', 'link')
        
        self.assertTrue(
            pinned_resource.count() > 0,
            msg=f"Pinned resource objects not created: {response.data}"
        )
        print("================ POST TEST ================")
        print(response.data)

    def test_delete_pinned_resources(self):
        test_options = {
            "link": self.link.pk,
            "file": self.file.pk,
            "document": self.document.pk
        }
        
        for key, pk in test_options.items():
            if key == "link":
                print("================ LINK ================")
                url = reverse("delete-resource", args=[pk])
                url = f"{url}?resource_type=link"

                link_before = PinnedResourcesDashboard.objects.get(user=self.user)
                print(f"- Before call: {link_before.link.all()}")

                response = self.client.delete(url, format='json')
                resources = PinnedResourcesDashboard.objects.get(user=self.user)
                print(f"- After call: {resources.link.all()}")

                self.assertEqual(
                    response.status_code,
                    status.HTTP_200_OK,
                    msg=f"Status code error: {response.data}"
                )
                self.assertNotIn(
                    self.link,
                    resources.link.all(),
                    msg=f"Pinned Resource didn't delete: {response.data}"
                )
                print(response.data)
            
            if key == "file":
                print("================ FILE ================")
                url = reverse("delete-resource", args=[pk])
                url = f"{url}?resource_type=file"

                link_before = PinnedResourcesDashboard.objects.get(user=self.user)
                print(f"- Before call: {link_before.file.all()}")

                response = self.client.delete(url, format='json')
                resources = PinnedResourcesDashboard.objects.get(user=self.user)
                print(f"- After call: {resources.file.all()}")

                self.assertEqual(
                    response.status_code,
                    status.HTTP_200_OK,
                    msg=f"Status code error: {response.data}"
                )
                self.assertNotIn(
                    self.file,
                    resources.file.all(),
                    msg=f"Pinned Resource didn't delete: {response.data}"
                )
                print(response.data)

            if key == "document":
                print("================ DOCUMENT ================")
                url = reverse("delete-resource", args=[pk])
                url = f"{url}?resource_type=document"

                link_before = PinnedResourcesDashboard.objects.get(user=self.user)
                print(f"- Before call: {link_before.document.all()}")

                response = self.client.delete(url, format='json')
                resources = PinnedResourcesDashboard.objects.get(user=self.user)
                print(f"- After call: {resources.document.all()}")

                self.assertEqual(
                    response.status_code,
                    status.HTTP_200_OK,
                    msg=f"Status code error: {response.data}"
                )
                self.assertNotIn(
                    self.document,
                    resources.document.all(),
                    msg=f"Pinned Resource didn't delete: {response.data}"
                )
                print(response.data)