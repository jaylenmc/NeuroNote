import anthropic
import os

client = anthropic.Anthropic(
    api_key=os.environ.get("ANTHROPIC_API_KEY")
) 

def tutor(prompt: str, user: object):
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