from django.urls import path
from .views import DocumentView

urlpatterns = [
    path('notes/', DocumentView.as_view()),
    path('notes/<int:folder_id>/', DocumentView.as_view()),
    path('notes/<int:folder_id>/<int:doc_id>/', DocumentView.as_view()),
]