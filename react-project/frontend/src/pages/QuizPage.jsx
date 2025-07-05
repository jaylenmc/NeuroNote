import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import './QuizPage.css';
import { formatDateForDisplay } from '../utils/dateUtils';

const formatDate = (dateString) => {
    if (!dateString) return '—';
    
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    
    return formatDateForDisplay(dateString);
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
            console.log('Fetching quizzes...');
            const response = await api.get('/test/quiz/');
            console.log('Quizzes response:', response.data);
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
                await api.delete(`/test/quiz/${quizId}/`);
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
                                <th className="quiz-th-center">Quiz Title</th>
                                <th className="quiz-th-center">Questions</th>
                                <th className="quiz-th-center">Score</th>
                                <th className="quiz-th-center">Last Attempt</th>
                                <th className="quiz-th-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {quizzes.map(quiz => {
                                console.log('Rendering quiz:', quiz);
                                return (
                                    <tr key={quiz.id} className="quiz-row">
                                        <td className="quiz-td-center quiz-title">
                                            <span className="quiz-icon">🧠</span>
                                            <div>
                                                <div>{quiz.topic}</div>
                                                {quiz.subject && <div className="quiz-subject-subtitle">{quiz.subject}</div>}
                                            </div>
                                        </td>
                                        <td className="quiz-question-count">{quiz.question_count || 0}</td>
                                        <td className="quiz-td-center">{quiz.last_score !== null && quiz.last_score !== undefined ? `${quiz.last_score}%` : '—'}</td>
                                        <td className="quiz-td-center">{quiz.last_attempt ? formatDate(quiz.last_attempt) : '—'}</td>
                                        <td className="quiz-td-center">
                                            <div className="quiz-actions">
                                                {quiz.last_score !== null && quiz.last_score !== undefined ? (
                                                    <>
                                                        <button 
                                                            className="quiz-action-btn view-btn"
                                                            onClick={() => handleReview(quiz.id)}
                                                        >
                                                            View
                                                        </button>
                                                        <button 
                                                            className="quiz-action-btn start-btn"
                                                            onClick={() => handleTest(quiz.id)}
                                                        >
                                                            Retake
                                                        </button>
                                                    </>
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
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default QuizPage; 