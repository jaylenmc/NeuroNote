import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './QuizPage.css';

const QuizPage = () => {
    const [quizzes, setQuizzes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState('review');
    const navigate = useNavigate();

    useEffect(() => {
        fetchQuizzes();
    }, []);

    const fetchQuizzes = async () => {
        try {
            setLoading(true);
            setError(null);
            const token = sessionStorage.getItem('jwt_token');
            const response = await axios.get('http://127.0.0.1:8000/api/test/quiz/', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json'
                },
                credentials: 'include'
            });
            setQuizzes(Array.isArray(response.data) ? response.data : []);
        } catch (error) {
            console.error('Error fetching quizzes:', error);
            setError('Failed to load quizzes. Please try again later.');
            setQuizzes([]);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (quizId) => {
        if (window.confirm('Are you sure you want to delete this quiz?')) {
            try {
                const token = sessionStorage.getItem('jwt_token');
                await axios.delete(`http://127.0.0.1:8000/api/test/quiz/${quizId}/`, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Accept': 'application/json'
                    },
                    credentials: 'include'
                });
                setQuizzes(quizzes.filter(quiz => quiz.id !== quizId));
            } catch (error) {
                console.error('Error deleting quiz:', error);
                setError('Failed to delete quiz. Please try again.');
            }
        }
    };

    const handleCreateQuiz = () => {
        navigate('/quiz/create');
    };

    const handleReview = (quizId) => {
        navigate(`/quiz/${quizId}/review`);
    };

    const handleTest = (quizId) => {
        navigate(`/quiz/${quizId}/test`);
    };

    const handleEdit = (quizId) => {
        navigate(`/quiz/${quizId}/edit`);
    };

    const handleBack = () => {
        navigate('/study-room');
    };

    const calculateMastery = (quiz) => {
        // This would be replaced with actual mastery calculation logic
        return Math.floor(Math.random() * 100);
    };

    const getMasteryColor = (mastery) => {
        if (mastery >= 80) return '#4EE1C1';
        if (mastery >= 60) return '#A78BFA';
        return '#FF6B6B';
    };

    if (loading) {
        return (
            <div className="quiz-page">
                <div className="loading">Loading quizzes...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="quiz-page">
                <div className="error-message">
                    <h2>Error</h2>
                    <p>{error}</p>
                    <button onClick={fetchQuizzes}>Try Again</button>
                </div>
            </div>
        );
    }

    return (
        <div className="quiz-page">
            <div className="quiz-header">
                <div className="header-left">
                    <button className="back-button" onClick={handleBack}>
                        ← Back to Study Room
                    </button>
                    <h1>🧠 Quiz Center</h1>
                </div>
                <button className="create-button" onClick={handleCreateQuiz}>
                    <span>+</span> Create New Quiz
                </button>
            </div>

            <div className="quiz-tabs">
                <button 
                    className={`quiz-tab ${activeTab === 'review' ? 'active' : ''}`}
                    onClick={() => setActiveTab('review')}
                >
                    🔍 Review Quizzes
                </button>
                <button 
                    className={`quiz-tab ${activeTab === 'test' ? 'active' : ''}`}
                    onClick={() => setActiveTab('test')}
                >
                    ✍️ Test Myself
                </button>
                <button 
                    className={`quiz-tab ${activeTab === 'edit' ? 'active' : ''}`}
                    onClick={() => setActiveTab('edit')}
                >
                    ✏️ Edit Quizzes
                </button>
                <button 
                    className={`quiz-tab ${activeTab === 'deleted' ? 'active' : ''}`}
                    onClick={() => setActiveTab('deleted')}
                >
                    🗑️ Deleted Quizzes
                </button>
            </div>

            {!Array.isArray(quizzes) || quizzes.length === 0 ? (
                <div className="no-quizzes">
                    <h2>No Quizzes Yet</h2>
                    <p>Create your first quiz to start testing your knowledge!</p>
                    <button onClick={handleCreateQuiz}>Create Quiz</button>
                </div>
            ) : (
                <div className="quiz-grid">
                    {quizzes.map(quiz => {
                        const mastery = calculateMastery(quiz);
                        return (
                            <div key={quiz.id} className="quiz-card">
                                <div className="quiz-info">
                                    <h3>
                                        <span>🧠</span>
                                        {quiz.topic}
                                    </h3>
                                    <div className="subject">{quiz.subject}</div>
                                    <div className="quiz-stats">
                                        <span>📊 Mastery: {mastery}%</span>
                                        <span>📅 Last reviewed: 2 days ago</span>
                                    </div>
                                    <div className="mastery-bar">
                                        <div 
                                            className="mastery-progress" 
                                            style={{ 
                                                width: `${mastery}%`,
                                                background: `linear-gradient(90deg, ${getMasteryColor(mastery)}, ${getMasteryColor(mastery)}80)`
                                            }}
                                        />
                                    </div>
                                </div>
                                <div className="quiz-actions">
                                    <button 
                                        className="quiz-action-btn review-btn"
                                        onClick={() => handleReview(quiz.id)}
                                    >
                                        Review
                                    </button>
                                    <button 
                                        className="quiz-action-btn test-btn"
                                        onClick={() => handleTest(quiz.id)}
                                    >
                                        Test
                                    </button>
                                    <button 
                                        className="quiz-action-btn edit-btn"
                                        onClick={() => handleEdit(quiz.id)}
                                    >
                                        Edit
                                    </button>
                                    <button 
                                        className="quiz-action-btn delete-btn"
                                        onClick={() => handleDelete(quiz.id)}
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default QuizPage; 