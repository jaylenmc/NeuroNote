from django.urls import path, include

urlpatterns = [
    path('auth/', include('authentication.urls')),
    path('flashcards/', include('flashcards.urls')),
    path('dashboard/', include('dashboard.urls')),
    path('test/', include('tests.urls')),
    path('tutor/', include('claude_client.urls')),
]
