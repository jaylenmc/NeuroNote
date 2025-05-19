from django.urls import path
from . import views
from rest_framework_simplejwt.views import TokenRefreshView

urlpatterns = [
    path('google/', views.googleApi),
    path('token/refresh/', TokenRefreshView.as_view()),
]
