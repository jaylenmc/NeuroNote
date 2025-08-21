from django.urls import path
from .views import DocumentView

urlpatterns = [
    path('notes/', DocumentView.as_view(), name='create-document'),
    path('notes/<int:folder_id>/', DocumentView.as_view(), name='get-all-documents'),
    path('notes/update/<int:doc_id>/', DocumentView.as_view(), name='update-document'),
    path('notes/<int:folder_id>/<int:doc_id>/', DocumentView.as_view(), name='get-document'),
]