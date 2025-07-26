from django.urls import path
from .views import DocumentView, tag_delete

urlpatterns = [
    path('notes/', DocumentView.as_view(), name='create-document'),
    path('notes/<int:folder_id>/', DocumentView.as_view(), name='get-all-documents'),
    path('notes/update/<int:doc_id>/', DocumentView.as_view(), name='update-document'),
    path('notes/<int:folder_id>/<int:doc_id>/', DocumentView.as_view(), name='get-document'),

    path('notes/tags/del/<int:doc_id>/<int:tag_id>/', tag_delete, name='delete-tag')
]