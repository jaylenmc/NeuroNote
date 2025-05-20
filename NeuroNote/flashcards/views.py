from rest_framework.views import APIView
from rest_framework.decorators import api_view, permission_classes
from .models import Deck, Card, ReviewLog
from rest_framework.response import Response
from rest_framework.exceptions import status
from .serializers import DeckSerializer, CardSerializer
from rest_framework.permissions import IsAuthenticated
from authentication.models import AuthUser
from dashboard.models import UserAchievements
from dashboard.services import knowledge_engineer, memory_architect, deck_destroyer
from claude_client.client import tutor
from datetime import datetime

class DeckCollection(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        deck = Deck.objects.filter(user=request.user)
        serialized = DeckSerializer(deck, many=True)

        return Response(serialized.data, status=status.HTTP_200_OK)
    
    def post(self, request):
        title = request.data.get('title')
        user = AuthUser.objects.filter(email=request.user).first()
        subject = request.data.get('subject')

        if Deck.objects.filter(title=title).exists():
            return Response({"Message": "Already have card with title"}, status=status.HTTP_400_BAD_REQUEST)
        else:
            user_collection = Deck(title=title, user=user, subject=subject)
            user_collection.save()
        
        serialized = DeckSerializer(user_collection)

        deck_destroyer(user=user)

        return Response(serialized.data, status=status.HTTP_200_OK)
    
    def delete(self, request ,deck_id):
        id = deck_id
        user = request.user
        deck_collection = Deck.objects.filter(user_id=user)

        if not deck_collection.filter(id=id).exists():
            return Response("Deck does not exists", status=status.HTTP_404_NOT_FOUND)
        deck = deck_collection.filter(id=id).first()
        deck.delete()

        return Response({"Message": 'Deck successfully deleted'}, status=status.HTTP_200_OK)
    
class CardCollection(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        cards = Card.objects.filter(card_deck__user=request.user)
        serialized = CardSerializer(cards, many=True)

        return Response(serialized.data, status=status.HTTP_200_OK)

    def post(self, request):
        question = request.data.get('question')
        answer = request.data.get('answer')
        deck_id = request.data.get('deck_id')
        scheduled_date = request.data.get('scheduled_date')

        user_deck = Deck.objects.filter(user=request.user, id=deck_id).first()

        if Card.objects.filter(card_deck=user_deck, question=question).exists():
            return Response({"Message": "Card already exists"}, status=status.HTTP_406_NOT_ACCEPTABLE)
        
        # Parse the date string to ensure it's in the correct format
        parsed_date = None
        if scheduled_date:
            try:
                parsed_date = datetime.strptime(scheduled_date, '%Y-%m-%d').date()
            except ValueError:
                return Response({"Message": "Invalid date format"}, status=status.HTTP_400_BAD_REQUEST)
        
        user_card = Card.objects.create(
            question=question,
            answer=answer,
            card_deck=user_deck,
            scheduled_date=parsed_date
            )
                
        serialized = CardSerializer(user_card)

        return Response(serialized.data, status=status.HTTP_200_OK)
    
    def delete(self, request, deck_id, card_id):
        deck = Deck.objects.filter(user=request.user, id=deck_id).first()

        if not Card.objects.filter(card_deck=deck, id=card_id).exists():
            return Response({"Message": 'Card doesnt exists'}, status=status.HTTP_404_NOT_FOUND)
        
        card = Card.objects.filter(card_deck=deck, id=card_id).first()
        card.delete()

        return Response({"Message": "Successfully deleted"}, status=status.HTTP_200_OK)
    
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def review_card(request):
    deck_id = request.data.get('deck_id')
    card_id = request.data.get('card_id')

    deck = Deck.objects.filter(user=request.user, id=deck_id).first()
    
    if not deck:
        return Response({"Message": "Deck not found"}, status=status.HTTP_404_NOT_FOUND)

    card = Card.objects.filter(card_deck=deck, id=card_id).first()
    if not card:
        return Response({"Message": "Card not found"}, status=status.HTTP_404_NOT_FOUND)

    try:
        quality = int(request.data.get('quality')) 
    except (TypeError, ValueError):
        return Response({"Message": "Invalid quality rating"}, status=status.HTTP_400_BAD_REQUEST)
    
    card.update_sm21(quality)

    # Assigning Achievements
    user, created = UserAchievements.objects.get_or_create(user=request.user)
    # knowledge_engineer(user=user, deck=deck)
    memory_architect(user=user, deck=deck)

    return Response({"Message": "Card reviewed and updated successfully"}, status=status.HTTP_200_OK)