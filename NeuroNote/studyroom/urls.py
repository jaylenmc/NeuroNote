from django.urls import path
from . import views

urlpatterns = [
    path('rooms/', views.StudyRoomView.as_view()),
    path('rooms/<int:room_id>/', views.StudyRoomView.as_view()),
]