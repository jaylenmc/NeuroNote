import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './QuizPage.css';

const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    
    return date.toLocaleDateString();
};

const QuizPage = () => {
    const [quizzes, setQuizzes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState('quizzes');
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
                    className={`quiz-tab ${activeTab === 'quizzes' ? 'active' : ''}`}
                    onClick={() => setActiveTab('quizzes')}
                >
                    📚 Quizzes
                </button>
                <button 
                    className={`quiz-tab ${activeTab === 'review' ? 'active' : ''}`}
                    onClick={() => setActiveTab('review')}
                >
                    🔍 Review
                </button>
            </div>

            {!Array.isArray(quizzes) || quizzes.length === 0 ? (
                <div className="no-quizzes">
                    <h2>No Quizzes Yet</h2>
                    <p>Create your first quiz to start testing your knowledge!</p>
                    <button className="create-button" onClick={handleCreateQuiz}>Create Quiz</button>
                </div>
            ) : (
                <div className="quiz-table-container">
                    <table className="quiz-table">
                        <thead>
                            <tr>
                                <th>Quiz Title</th>
                                <th>Questions</th>
                                <th>Score</th>
                                <th>Last Attempt</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {quizzes.map(quiz => (
                                <tr key={quiz.id} className="quiz-row">
                                    <td className="quiz-title">
                                        <span className="quiz-icon">🧠</span>
                                        {quiz.topic}
                                    </td>
                                    <td>{quiz.question_count || 0}</td>
                                    <td>{quiz.last_score ? `${quiz.last_score}%` : '—'}</td>
                                    <td>{quiz.last_attempt ? formatDate(quiz.last_attempt) : '—'}</td>
                                    <td className="quiz-actions">
                                        {quiz.last_score ? (
                                            <button 
                                                className="quiz-action-btn view-btn"
                                                onClick={() => handleReview(quiz.id)}
                                            >
                                                View
                                            </button>
                                        ) : (
                                            <button 
                                                className="quiz-action-btn start-btn"
                                                onClick={() => handleTest(quiz.id)}
                                            >
                                                Start
                                            </button>
                                        )}
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
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default QuizPage; 