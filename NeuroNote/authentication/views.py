from rest_framework.decorators import api_view
from rest_framework.response import Response
import requests
from django.conf import settings
from .models import AuthUser
from .serializers import UserSerializer
from django.utils import timezone
from datetime import datetime, timedelta, timezone as dt_timezone
from zoneinfo import ZoneInfo
from django.contrib.auth import login, logout
from rest_framework import status
from dashboard.models import UserAchievements, Achievements

@api_view(['POST'])
def googleApi(request):
    code = request.data.get('code')
    error = request.data.get('error')

    if not code or error:
        print(f"Missing code or error: code={code}, error={error}")
        return Response(f"Missing code or received error: {error}", status=status.HTTP_400_BAD_REQUEST)

    # if request.session['state'] != request.GET.get('state'):
    #     Response("States dont match", status=400)

    # authorization_url = f'https://accounts.google.com/o/oauth2/v2/auth?client_id=708025289440-pnb51jsd3pnbjdpv302lmjs03rt4v0i2.apps.googleusercontent.com&redirect_uri=http://127.0.0.1:8000/api/auth/google/&response_type=code&scope=email%20profile%20openid&access_type=offline&prompt=consent'

    try:
        data = {
            'grant_type': 'authorization_code',
            'code': code,
            'redirect_uri': settings.REDIRECT_URI,
            'client_id': settings.GOOGLE_CLIENT_ID,
            'client_secret': settings.GOOGLE_CLIENT_SECRET,
        }
        print(f'The data: {data}')
        
        access_token_url = 'https://oauth2.googleapis.com/token/'
        response = requests.post(access_token_url, data=data)
        user_data = response.json()
        
        if 'error' in user_data:
            print("Google OAuth error:", user_data)
            return Response({"error": user_data.get('error_description', 'Unknown error')}, status=status.HTTP_400_BAD_REQUEST)
        
        user_access_token = user_data.get('access_token')
        user_expires_in = datetime.now(dt_timezone.utc) + timedelta(seconds=user_data.get('expires_in'))
        user_refresh_token = user_data.get('refresh_token')

    except requests.exceptions.RequestException as e:
        return Response({"error": f"Error getting access token: {str(e)}"}, status=status.HTTP_400_BAD_REQUEST)
    
    header = {
        'Authorization': f'Bearer {user_access_token}'
    }
    user_info_response = requests.get('https://www.googleapis.com/oauth2/v3/userinfo', headers=header)

    if user_info_response.status_code != 200:
        return Response(f"Error getting user info: {user_info_response.text}", status=status.HTTP_400_BAD_REQUEST)
    
    user_info = user_info_response.json()
    email = user_info.get('email')

    user = AuthUser.objects.filter(email=email).first()

    if not user:
        user = AuthUser.objects.create_user(
            email=email,
            last_login=timezone.now(),
            access_token=user_access_token,
            access_token_expires_at=user_expires_in,
            refresh_token=user_refresh_token,
            )
    else:
        user.email = email
        user.access_token = user_access_token
        user.last_login=timezone.now()
        user.access_token_expires_at = user_expires_in
        if user_refresh_token:
            user.refresh_token = user_refresh_token
        user.save()

    login(request, user)
    # Assign first login achievement to user
    user_achiev, create = UserAchievements.objects.get_or_create(user=user)
    achievement = Achievements.objects.filter(name="The Journey Begins").first()
    user_achiev.achievements.add(achievement)

    data_serialized = UserSerializer(user)
    
    try:
        if is_token_expired(user):
            access_token = refreshAccessToken(user)
            if isinstance(access_token, Response):
                return access_token
    except Exception as e:
        return Response({'detail': str(e)}, status=status.HTTP_400_BAD_REQUEST)
    
    return Response(data_serialized.data, status=200)

def is_token_expired(user):
    current_time = datetime.now(dt_timezone.utc)
    refresh_threshold = timedelta(minutes=5)
    return current_time >= (user.access_token_expires_at - refresh_threshold)
        
def refreshAccessToken(user):
    refresh_token_url = 'https://oauth2.googleapis.com/token'
    data = {
        'client_id': settings.GOOGLE_CLIENT_ID,
        'client_secret': settings.GOOGLE_CLIENT_SECRET,
        'grant_type': 'refresh_token',
        'refresh_token': user.refresh_token,
    }

    try:
        response = requests.post(refresh_token_url, data=data)
        token_info = response.json()

        if token_info.get('error') == "invalid_grant":
            logout(user)
            return Response({'Detail': 'Login expired. Please sign in again.'}, status=status.HTTP_401_UNAUTHORIZED)
        elif token_info.get('error'):
            return Response({'Detail': f'Error during new access token process: {token_info['error_description']}'}, status=status.HTTP_400_BAD_REQUEST)

        user.access_token = token_info['access_token']
        user.access_token_expires_at = datetime.now(dt_timezone.utc) + timedelta(seconds=token_info['expires_in'])
        user.save()

        return token_info['access_token']
    except Exception as e:
        return Response({"detail": f"Error refreshing access token: {str(e)}"}, status=status.HTTP_400_BAD_REQUEST)