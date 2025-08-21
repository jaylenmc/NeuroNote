import React, { useState } from 'react';
import { MessageSquare, Send } from 'lucide-react';
import './AskNeuroNote.css';
import api from '../api/axios';

const AskNeuroNote = () => {
    const [question, setQuestion] = useState('');
    const [response, setResponse] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!question.trim()) return;

        setIsLoading(true);
        try {
            const response = await api.post('/notetaker/', { prompt: question });
            setResponse(response.data.content);
        } catch (error) {
            console.error('Error:', error);
            setResponse('Sorry, I encountered an error. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="ask-neuronote">
            <div className="ask-neuronote-header">
                <MessageSquare size={24} />
                <h3>Ask NeuroNote</h3>
            </div>
            
            <div className="ask-neuronote-content">
                {response && (
                    <div className="response-container">
                        <p>{response}</p>
                    </div>
                )}
                
                <form onSubmit={handleSubmit} className="question-form">
                    <input
                        type="text"
                        value={question}
                        onChange={(e) => setQuestion(e.target.value)}
                        placeholder="Ask me anything..."
                        disabled={isLoading}
                    />
                    <button type="submit" disabled={isLoading}>
                        <Send size={20} />
                    </button>
                </form>
            </div>
        </div>
    );
};

export default AskNeuroNote; 