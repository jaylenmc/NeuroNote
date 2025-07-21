from django.urls import path
from . import views

urlpatterns = [
    path('user/', views.AchievementsView.as_view(), name='get-achievements')
]
