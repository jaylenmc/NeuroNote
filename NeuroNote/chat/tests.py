import pytest
from channels.testing import WebsocketCommunicator
from django.test import TransactionTestCase
from NeuroNote.asgi import application

@pytest.mark.asyncio
class TestChatConsumer(TransactionTestCase):
    async def test_chat_messafe_broadcast(self):
        communicator_1 = WebsocketCommunicator(application, 'ws/chat/testroom/')
        communicator_2 = WebsocketCommunicator(application, 'ws/chat/testroom/')

        connected_1, _ = await communicator_1.connect()
        connected_2, _ = await communicator_2.connect()

        assert connected_1 and connected_2

        await communicator_1.send_json_to({"message": "hello"})

        response_1 = await communicator_1.receive_json_from()
        response_2 = await communicator_2.receive_json_from()

        assert response_1['message'] == 'hello'
        assert response_2['message'] == 'hello'

        await communicator_1.disconnect()
        await communicator_2.disconnect()