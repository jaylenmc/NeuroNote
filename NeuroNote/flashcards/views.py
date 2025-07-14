from rest_framework.views import APIView
from rest_framework.decorators import api_view, permission_classes
from .models import Deck, Card, ReviewLog
from rest_framework.response import Response
from rest_framework.exceptions import status
from .serializers import DeckSerializer, CardSerializer
from rest_framework.permissions import IsAuthenticated
from authentication.models import AuthUser
from achievements.models import UserAchievements
from achievements.services import knowledge_engineer, memory_architect, deck_destroyer
from django.utils import timezone
from folders.models import Folder
from .services import check_past_week_cards, num_of_cards
from zoneinfo import ZoneInfo

class DeckCollection(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        decks = Deck.objects.filter(user=request.user)
        for deck in decks:
            deck.num_of_cards = num_of_cards(deck)
            deck.save()

        user = AuthUser.objects.filter(email=request.user.email).first()
        serialized = DeckSerializer(decks, many=True)

        data = {
            'decks': serialized.data,
            'xp': user.xp,
            'level': user.level
        }

        return Response(data, status=status.HTTP_200_OK)
    
    def post(self, request):
        title = request.data.get('title')
        user = AuthUser.objects.filter(email=request.user.email).first()
        subject = request.data.get('subject')

        if Deck.objects.filter(title=title).exists():
            return Response({"Message": "Already have card with title"}, status=status.HTTP_400_BAD_REQUEST)
        else:
            user_collection = Deck(title=title, user=user, subject=subject)
            user_collection.save()
        
        serialized = DeckSerializer(user_collection)

        deck_destroyer(user=user)

        return Response(serialized.data, status=status.HTTP_200_OK)
    
    def put(self, request, deck_id):
        deck = Deck.objects.filter(user=request.user, id=deck_id).first()
        if not deck:
            return Response({"Message": "Deck does not exist"}, status=status.HTTP_404_NOT_FOUND)
        
        title = request.data.get('title')
        subject = request.data.get('subject')

        deck.title = title
        deck.subject = subject
        deck.save()

        serialized = DeckSerializer(deck)

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

    def get(self, request, deck_id=None):
        if not deck_id:
            try:
                cards = Card.objects.filter(card_deck__user=request.user)
                return Response(CardSerializer(CardSerializer(cards), many=True).data, status=status.HTTP_200_OK)
            except AttributeError as e:
                import traceback
                print(traceback.format_exc())
                return Response({f"Message: Attribute error - {e}"}, status=status.HTTP_404_NOT_FOUND)
            except Exception as e:
                return Response({f"Message: Error occured - {e}"}, status=status.HTTP_400_BAD_REQUEST)
        
        cards = Card.objects.filter(card_deck__user=request.user, card_deck__id=deck_id)
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
        
        user_card = Card.objects.create(
            question=question,
            answer=answer,
            card_deck=user_deck,
            scheduled_date=scheduled_date
            )
                
        serialized = CardSerializer(user_card)
        return Response(serialized.data, status=status.HTTP_200_OK)
    
    def put(self, request, deck_id, card_id):
        card = Card.objects.filter(card_deck__user=request.user, card_deck__id=deck_id, id=card_id).first()

        if not card:
            return Response({"Message": "Card does not exist"}, status=status.HTTP_404_NOT_FOUND)
        
        question = request.data.get('question')
        answer = request.data.get('answer')
        scheduled_date = request.data.get('scheduled_date')

        if question:
            card.question = question

        if answer:
            card.answer = answer

        if scheduled_date is not None:
            card.scheduled_date = scheduled_date
        else:
            card.scheduled_date = None

        card.save()

        serialized = CardSerializer(card)

        return Response(serialized.data, status=status.HTTP_200_OK)
    
    def delete(self, request, deck_id, card_id):
        deck = Deck.objects.filter(user=request.user, id=deck_id).first()

        if not Card.objects.filter(card_deck=deck, id=card_id).exists():
            return Response({"Message": 'Card doesnt exists'}, status=status.HTTP_404_NOT_FOUND)
        
        card = Card.objects.filter(card_deck=deck, id=card_id).first()
        card.delete()

        return Response({"Message": "Successfully deleted"}, status=status.HTTP_200_OK)
    
@api_view(['PUT'])
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

    reviewed_cards = check_past_week_cards()
    finalized_data = {
        'Message': 'Card reviewed and updated successfully',
        'reviewed_dates': reviewed_cards,
    }
    return Response(finalized_data, status=status.HTTP_200_OK)

class DueCardsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, deck_id):
        """Get only due cards for a specific deck"""
        if not Deck.objects.filter(user=request.user, id=deck_id).exists():
            return Response({"Message": "Deck not found"}, status=status.HTTP_404_NOT_FOUND)
        
        today = timezone.now()
  
        due_cards = Card.objects.filter(
            card_deck__user=request.user,
            card_deck__id=deck_id
        ).filter(
            scheduled_date__lte=today
        ) | Card.objects.filter(
            card_deck__user=request.user,
            card_deck__id=deck_id,
            scheduled_date__isnull=True
        )
        serialized = CardSerializer(due_cards, many=True)
        return Response(serialized.data, status=status.HTTP_200_OK)