from django.urls import path
from . import views
urlpatterns = [
    path('google/', views.googleApi, name='google-api'),
    path('token/refresh/', views.CookieTokenRefreshView.as_view(), name='jwt-refresh'),
]
