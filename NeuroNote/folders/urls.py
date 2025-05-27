from django.urls import path
from .views import FolderView

urlpatterns = [
   path('user/', FolderView.as_view()),
   path('user/<int:id>/', FolderView.as_view())
]