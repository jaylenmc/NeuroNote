import json
from channels.generic.websocket import WebsocketConsumer
from asgiref.sync import async_to_sync
from channels.generic.websocket import AsyncWebsocketConsumer

class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.room_name = self.scope['url_route']['kwargs']['room_name']
        self.room_group_name = f'chat_{self.room_name}'

        await self.channel_layer.group_add(self.room_group_name, self.channel_name)

        await self.accept()

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(self.room_group_name, self.channel_name)
    
    async def receive(self, text_data):
        text_data_json = json.loads(text_data)
        
        # Handle different message types
        if 'message' in text_data_json:
            message = text_data_json['message']
            await self.channel_layer.group_send(
                self.room_group_name, 
                {
                    'type': 'chat.message', 
                    'message': message,
                    'user': text_data_json.get('user', 'Other')
                }
            )
        elif 'type' in text_data_json and text_data_json['type'] == 'typing':
            # Handle typing indicators
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'typing.indicator',
                    'user': text_data_json.get('user', 'Other'),
                    'isTyping': text_data_json.get('isTyping', False)
                }
            )

    async def chat_message(self, event):
        message = event['message']
        user = event.get('user', 'Other')
        await self.send(text_data=json.dumps({
            'message': message,
            'user': user
        }))

    async def typing_indicator(self, event):
        user = event['user']
        isTyping = event['isTyping']
        await self.send(text_data=json.dumps({
            'type': 'typing',
            'user': user,
            'isTyping': isTyping
        }))