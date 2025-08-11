from django.urls import path
from resources import views
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('create/', views.ImportResource.as_view(), name='create-resource'),
    path('link/', views.ImportResource.as_view(), name='get-link')
]