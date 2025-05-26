from django.urls import path
from views import FolderView

urlpatterns = [
   path('folder/', FolderView.as_view()) 
]