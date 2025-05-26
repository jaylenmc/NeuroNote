from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from claude_client.client import ask_free_ai

@api_view(['POST'])
def free_ai_question(request):
    """
    Endpoint to handle free AI questions
    """
    try:
        question = request.data.get('question')
        if not question:
            return Response(
                {'error': 'Question is required'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        response = ask_free_ai(question)
        return Response({'response': response}, status=status.HTTP_200_OK)
    
    except Exception as e:
        return Response(
            {'error': str(e)}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        ) 