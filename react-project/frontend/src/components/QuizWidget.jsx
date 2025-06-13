import React, { useState, useEffect } from 'react';
import { Check, X, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './QuizWidget.css';

const QuizWidget = () => {
    const [quizzes, setQuizzes] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        fetchQuizzes();
    }, []);

    const fetchQuizzes = async () => {
        try {
            const token = sessionStorage.getItem('jwt_token');
            const response = await fetch('http://127.0.0.1:8000/api/test/quiz/', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json'
                },
                credentials: 'include'
            });

            if (!response.ok) {
                throw new Error('Failed to fetch quizzes');
            }

            const data = await response.json();
            setQuizzes(data);
        } catch (error) {
            console.error('Error fetching quizzes:', error);
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) {
        return (
            <div className="quiz-widget">
                <div className="loading">Loading quizzes...</div>
            </div>
        );
    }

    if (quizzes.length === 0) {
        return (
            <div className="quiz-widget">
                <div className="no-quizzes">
                    <p>No quizzes available</p>
                    <button onClick={() => navigate('/quiz')} className="create-button">
                        Create Quiz
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="quiz-widget">
            <div className="quiz-widget-header">
                <h3>Recent Quizzes</h3>
                <button onClick={() => navigate('/quiz')} className="view-all-button">
                    View All
                </button>
            </div>
            <div className="quiz-widget-list">
                {quizzes.slice(0, 3).map((quiz) => (
                    <div key={quiz.id} className="quiz-widget-item">
                        <h4>{quiz.topic}</h4>
                        {quiz.subject && <span className="subject">{quiz.subject}</span>}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default QuizWidget; 