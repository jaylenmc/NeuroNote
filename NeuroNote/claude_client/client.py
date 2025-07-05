import anthropic
import re
from django.views.decorators.csrf import csrf_exempt
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from flashcards.models import Card, Deck
from datetime import date
from .services import clean_claude_response

client = anthropic.Anthropic(
    api_key='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'
) 

def thinker_ai(prompt: str, user: object):
    if user.token_amount <= 0:
        return f"Not enough tokens"

    message = client.messages.create(
    model="claude-3-7-sonnet-20250219",
    max_tokens=user.token_amount,
    temperature=1,
    system="You are a educational tutor, only asnwer to educational questions.",
    messages=[
            {
                "role": "user",
                "content": [{"type": "text", "text": prompt}]
            }
        ]
    )
    
    user.token_amount -= (message.usage.output_tokens + message.usage.input_tokens)
    user.save()
   
    return message.content

class NoteTakerAi(APIView):
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        prompt = request.data.get('prompt')

        try:
            message = client.messages.create(
                model="claude-3-haiku-20240307",  # Using the free model
                max_tokens=1000,
                temperature=0.7,
                system="You are a educational tutor. Provide clear and concise answers.",
                messages=[
                    {
                        "role": "user",
                        "content": [{"type": "text", "text": prompt}]
                    }
                ]
            )
            raw_output = message.content

            # Extract only text blocks
            text_only = " ".join(
                block.text for block in raw_output if block.type == "text"
            )
    
            return Response({'Message': text_only}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({'Error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
        
class CardsGen(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        prompt = request.data.get('prompt')
        deck_id = request.data.get('deck_id')
        if not prompt:
            return Response({'Error': 'Prompt is required'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            message = client.messages.create(
                model="claude-3-7-sonnet-20250219",
                max_tokens=1000,
                temperature=0.7,
                system="Generate a list of flashcards based on the prompt. Each card should be separated by '## Card', and each card should follow this format:\n## Card\n**Front**: <front>\n**Back**: <back>. Just respond with the flashcards, no other text.",
                messages=[
                    {
                        "role": "user",
                        "content": [{"type": "text", "text": prompt}]
                    }
                ]
            )

            raw_output = message.content
            text_output = "".join(
                block.text for block in raw_output if getattr(block, 'type', "") == 'text'
            )


            cards = []
            pattern = re.compile(
                r"## Card\s*\d*\s*\*\*Front\*\*:\s*(.+?)\s*\n\*\*Back\*\*:\s*((?:.|\n)*?)(?=\n## Card|\Z)",
                re.MULTILINE
            )
            matches = pattern.findall(text_output)

            for front, back in matches:
                cards.append({
                    'front': front.strip(),
                    'back': back.strip()
                })
            
            for card in cards:
                Card.objects.create(
                    question=card['front'],
                    answer=card['back'],
                    card_deck=Deck.objects.filter(id=deck_id).first(),
                    scheduled_date=date.today()
                )

            return Response({'Cards': cards}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({'Error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
        
def cards_to_quiz(user_answers):
    if not user_answers:
        return {'Error': 'No data provided'}
    
    prompt_text = "\n\n".join(
        f"Question: {user['question_input']}\n"
        f"User answer: {user['answers']['user_answer']}\n"
        f"Correct answer: {user['answers']['correct']}"
        for user in user_answers
    )
    
    try:
        message = client.messages.create(
            model = "claude-3-7-sonnet-20250219",
            max_tokens=1000,
            temperature=0.7,
            system=("Grade the user's answers to the flashcards based on the correct written answers. "
                "Return the response in JSON format in the following format with score being either Correct or Incorrect: "
                "{'question_input': '...', 'score': 'Correct' or 'Incorrect', 'explanation': '...', 'user_answer': '...', 'correct_answer': '...'} — do not reference the user. "
                "Make sure each explanation clearly matches its question."
            ),
            messages=[
                {
                    "role": "user",
                    "content": [{
                        "type": "text", 
                        "text": prompt_text
                        }]
                }
            ]
        )

        print(type(message.content))
        print(message.content)
        cleaned_response = clean_claude_response(message.content)
        return cleaned_response
    except Exception as e:
        return {'Error': str(e)}