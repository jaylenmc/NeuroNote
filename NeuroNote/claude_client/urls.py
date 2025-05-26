from django.urls import path
from . import client

urlpatterns = [
    path('notetaker/', client.notetaker_ai),
    path('thinker/', client.thinker_ai),
]