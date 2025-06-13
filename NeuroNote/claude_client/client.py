import anthropic
import os
from django.views.decorators.csrf import csrf_exempt
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status

client = anthropic.Anthropic(
    api_key='REDACTED'
) 

def thinker_ai(prompt: str, user: object):
    print(f'Token amount before call: {user.token_amount}')
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
    print(f'Used Tokens: {message.usage}')
    print(f'Amount left: {user.token_amount}')
    print(f'Type: {message.type}')
   
    return message.content

class NoteTakerAi(APIView):
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        prompt = request.data.get('prompt')
        print(f'This is the prompt: {prompt}')
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
            print(f'This is the message: {text_only}')
            return Response({'Message': text_only}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({'Error': str(e)}, status=status.HTTP_400_BAD_REQUEST)