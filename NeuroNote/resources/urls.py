from django.urls import path
from resources import views

urlpatterns = [
    path('create/', views.ImportResource.as_view(), name='create-resource')
]