import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiSend, FiMic, FiPaperclip, FiClock, FiBookmark, FiSettings, FiTrash2 } from 'react-icons/fi';
import './ChatPage.css';

const ChatPage = () => {
    const navigate = useNavigate();
    const [messages, setMessages] = useState([
        {
            id: 1,
            content: "Hello! I'm your AI-powered study assistant. How can I help you today?",
            type: 'ai',
            timestamp: new Date(Date.now() - 60000).toISOString(),
            avatar: '🤖'
        }
    ]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [isSidePanelOpen, setIsSidePanelOpen] = useState(false);
    const [currentSubject, setCurrentSubject] = useState('Biology');
    const [currentFocus, setCurrentFocus] = useState('Chapter 3: Cell Biology');
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
            id: Date.now(),
            content: input,
            type: 'user',
            timestamp: new Date().toISOString(),
            avatar: '👤'
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
                id: Date.now() + 1,
                content: data.Message,
                type: 'ai',
                timestamp: new Date().toISOString(),
                avatar: '🤖'
            };

            setMessages(prev => [...prev, aiMessage]);
        } catch (error) {
            console.error('Error sending message:', error);
            setMessages(prev => [...prev, {
                id: Date.now() + 1,
                content: 'Sorry, I encountered an error. Please try again.',
                type: 'ai',
                timestamp: new Date().toISOString(),
                avatar: '🤖'
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

    const handleClearChat = () => {
        setMessages([{
            id: Date.now(),
            content: "Hello! I'm your AI-powered study assistant. How can I help you today?",
            type: 'ai',
            timestamp: new Date().toISOString(),
            avatar: '🤖'
        }]);
    };

    const formatTime = (timestamp) => {
        return new Date(timestamp).toLocaleTimeString([], { 
            hour: '2-digit', 
            minute: '2-digit' 
        });
    };

    const formatMessage = (content) => {
        return content.split('\n').map((paragraph, index) => (
            <React.Fragment key={index}>
                {paragraph}
                {index < content.split('\n').length - 1 && <br />}
            </React.Fragment>
        ));
    };

    const quickPrompts = [
        { title: "Summarize this note", icon: "📘", prompt: "Can you summarize the key points of this note..." },
        { title: "Explain a flashcard", icon: "❓", prompt: "Can you explain this flashcard concept in detail..." },
        { title: "Make a 5-question quiz", icon: "🧪", prompt: "Create a 5-question quiz based on..." }
    ];

    const handlePromptClick = (prompt) => {
        setInput(prompt.prompt);
        inputRef.current?.focus();
    };

    return (
        <div className="chat-page">
            {/* Top Section - Page Header Card */}
            <div className="page-header-card">
                <div className="header-content">
                    <div className="header-left">
                        <button 
                            className="back-button"
                            onClick={() => navigate('/study-room')}
                        >
                            <FiArrowLeft /> Back
                        </button>
                        <div className="header-title-section">
                            <div className="header-icon">💬</div>
                            <div className="header-text">
                                <h1 className="page-title">Ask NeuroNote</h1>
                                <p className="page-subtitle">Your AI-powered study assistant.</p>
                            </div>
                        </div>
                    </div>
                    <div className="header-actions">
                        <button 
                            className="action-button"
                            onClick={handleClearChat}
                            title="Clear chat"
                        >
                            <FiTrash2 />
                        </button>
                        <button 
                            className="action-button"
                            onClick={() => setIsSidePanelOpen(!isSidePanelOpen)}
                            title="Chat tools"
                        >
                            ☰
                        </button>
                    </div>
                </div>
            </div>

           

            {/* Middle Section - Chat Interface Card */}
            <div className="chat-interface-card">
                <div className="messages-container">
                    {messages.map((message) => (
                        <div key={message.id} className={`message ${message.type}`}>
                            <div className="message-bubble">
                                <div className="message-content">
                                    {formatMessage(message.content)}
                                </div>
                                <div className="message-timestamp">
                                    {formatTime(message.timestamp)}
                                </div>
                                <div className="message-actions">
                                    <button 
                                        className="message-action-btn"
                                        onClick={() => handleCopy(message.content)}
                                        title="Copy message"
                                    >
                                        📋
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                    
                    {isTyping && (
                        <div className="message ai">
                            <div className="message-bubble">
                                <div className="typing-indicator">
                                    <span>AI is thinking</span>
                                    <div className="typing-dots">
                                        <span></span>
                                        <span></span>
                                        <span></span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>
            </div>

            {/* Bottom Section - Input Bar Card */}
            <div className="input-bar-card">
                <div className="input-container">
                    <div className="input-wrapper">
                        <textarea
                            ref={inputRef}
                            className="message-input"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyPress={handleKeyPress}
                            placeholder="Ask me anything..."
                            rows="1"
                        />
                        <div className="input-actions">
                            <button className="input-action-btn" title="Attach file">
                                <FiPaperclip />
                            </button>
                            <button className="input-action-btn" title="Voice input">
                                <FiMic />
                            </button>
                            <button 
                                className="send-button"
                                onClick={handleSend}
                                disabled={!input.trim()}
                                title="Send message"
                            >
                                <FiSend />
                            </button>
                        </div>
                    </div>
                    <div className="input-helper">
                        Press Enter to send, Shift+Enter for new line
                    </div>
                </div>
            </div>

            {/* Side Panel */}
            <div className={`side-panel ${isSidePanelOpen ? 'open' : ''}`}>
                <div className="side-panel-header">
                    <h3>Chat Tools</h3>
                    <button 
                        className="close-panel"
                        onClick={() => setIsSidePanelOpen(false)}
                    >
                        ✕
                    </button>
                </div>
                
                <div className="side-panel-content">
                    <div className="panel-section">
                        <h4>Study Context</h4>
                        <div className="study-context">
                            <div className="context-item">
                                <strong>Current Subject:</strong>
                                <span>{currentSubject}</span>
                            </div>
                            <div className="context-item">
                                <strong>Current Focus:</strong>
                                <span>{currentFocus}</span>
                            </div>
                            <div className="context-item">
                                <strong>Session Time:</strong>
                                <span>45 minutes</span>
                            </div>
                        </div>
                    </div>

                    <div className="panel-section">
                        <h4>Quick Prompts</h4>
                        <div className="prompt-templates">
                            {quickPrompts.map((prompt, index) => (
                                <button
                                    key={index}
                                    className="prompt-template"
                                    onClick={() => handlePromptClick(prompt)}
                                >
                                    {prompt.icon} {prompt.title}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="panel-section">
                        <h4>Recent Conversations</h4>
                        <div className="chat-history">
                            <div className="history-item">
                                <FiClock />
                                <span>Biology Q&A</span>
                            </div>
                            <div className="history-item">
                                <FiClock />
                                <span>Math Help</span>
                            </div>
                            <div className="history-item">
                                <FiClock />
                                <span>Study Tips</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Overlay for side panel */}
            {isSidePanelOpen && (
                <div 
                    className="side-panel-overlay"
                    onClick={() => setIsSidePanelOpen(false)}
                />
            )}
        </div>
    );
};

export default ChatPage; 