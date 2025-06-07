from django.urls import path, include

urlpatterns = [
    path('auth/', include('authentication.urls')),
    path('flashcards/', include('flashcards.urls')),
    path('achievements/', include('achievements.urls')),
    path('test/', include('tests.urls')),
    path('tutor/', include('claude_client.urls')),
    path('folders/', include('folders.urls')),
    path('documents/', include('documents.urls')),
]
