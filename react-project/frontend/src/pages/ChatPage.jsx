import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './ChatPage.css';

const ChatPage = () => {
    const navigate = useNavigate();
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [isContextOpen, setIsContextOpen] = useState(false);
    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = async () => {
        if (!input.trim()) return;

        const userMessage = {
            content: input,
            type: 'user',
            timestamp: new Date().toISOString()
        };

        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsTyping(true);

        try {
            const token = sessionStorage.getItem('jwt_token');
            const response = await fetch('http://127.0.0.1:8000/api/tutor/notetaker/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json'
                },
                body: JSON.stringify({ 
                    prompt: input.trim()
                }),
                credentials: 'include'
            });

            if (!response.ok) {
                throw new Error('Failed to get response');
            }

            const data = await response.json();
            
            const aiMessage = {
                content: data.Message,
                type: 'ai',
                timestamp: new Date().toISOString()
            };

            setMessages(prev => [...prev, aiMessage]);
        } catch (error) {
            console.error('Error sending message:', error);
            setMessages(prev => [...prev, {
                content: 'Sorry, I encountered an error. Please try again.',
                type: 'ai',
                timestamp: new Date().toISOString()
            }]);
        } finally {
            setIsTyping(false);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const handleCopy = (content) => {
        navigator.clipboard.writeText(content);
    };

    const formatTime = (timestamp) => {
        return new Date(timestamp).toLocaleTimeString([], { 
            hour: '2-digit', 
            minute: '2-digit' 
        });
    };

    const formatMessage = (content) => {
        // Split content by newlines and wrap each paragraph in a div
        return content.split('\n').map((paragraph, index) => (
            <React.Fragment key={index}>
                {paragraph}
                {index < content.split('\n').length - 1 && <br />}
            </React.Fragment>
        ));
    };

    return (
        <div className="chat-page">
            <div className="chat-container">
                <div className="chat-header">
                    <div className="header-left">
                        <button 
                            className="back-button"
                            onClick={() => navigate('/study-room')}
                        >
                            ← Back to Study Room
                        </button>
                        <div className="chat-title">
                            <div className="ai-brain-icon">
                                🧠
                            </div>
                            <span>NeuroNote Chat</span>
                        </div>
                    </div>
                    <button 
                        className="action-button"
                        onClick={() => setIsContextOpen(!isContextOpen)}
                    >
                        {isContextOpen ? '✕' : '☰'}
                    </button>
                </div>

                <div className="chat-messages">
                    {messages.map((message, index) => (
                        <div key={index} className={`message ${message.type}`}>
                            <div className="message-content">
                                {formatMessage(message.content)}
                            </div>
                            <div className="message-time">
                                {formatTime(message.timestamp)}
                            </div>
                            <div className="message-actions">
                                <button 
                                    className="action-button"
                                    onClick={() => handleCopy(message.content)}
                                    title="Copy message"
                                >
                                    📋
                                </button>
                            </div>
                        </div>
                    ))}
                    {isTyping && (
                        <div className="typing-indicator">
                            <div className="typing-dot"></div>
                            <div className="typing-dot"></div>
                            <div className="typing-dot"></div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                <div className="chat-input-container">
                    <div className="chat-input-wrapper">
                        <input
                            ref={inputRef}
                            className="chat-input"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyPress={handleKeyPress}
                            placeholder="Ask NeuroNote anything..."
                        />
                        <button 
                            className="send-button"
                            onClick={handleSend}
                            disabled={!input.trim()}
                        >
                            ➤
                        </button>
                    </div>
                </div>
            </div>

            <div className={`context-drawer ${isContextOpen ? 'open' : ''}`}>
                <div className="context-header">
                    <h3>Chat Context</h3>
                    <button 
                        className="close-drawer"
                        onClick={() => setIsContextOpen(false)}
                    >
                        ✕
                    </button>
                </div>
                <div className="context-content">
                    <p>Chat history and context will appear here.</p>
                </div>
            </div>
        </div>
    );
};

export default ChatPage; 