from django.urls import path
from . import views
urlpatterns = [
    path('google/', views.googleApi),
    path('token/refresh/', views.CookieTokenRefreshView.as_view()),
]
