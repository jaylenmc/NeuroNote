import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiArrowLeft } from 'react-icons/fi';
import { FaBrain } from 'react-icons/fa';
import api from '../api/axios';
import './QuizPage.css';
import { formatDateForDisplay } from '../utils/dateUtils';

const motivationalQuotes = [
  "Test your knowledge, grow your mind.",
  "Every quiz is a step toward mastery.",
  " Challenge yourself, discover your potential.",
  "Knowledge is power, testing is growth!",
  "Quiz now, remember forever."
];

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

const getProgressColor = (score) => {
  if (score >= 80) return 'excellent';
  if (score >= 60) return 'good';
  return 'poor';
};

const ProgressRing = ({ score, size = 50 }) => {
  const radius = (size - 8) / 2;
  const circumference = 2 * Math.PI * radius;
  
  // Calculate the stroke-dashoffset based on the actual score
  let strokeDashoffset;
  if (score !== null && score !== undefined && score >= 0) {
    // Convert score to a value between 0 and 1, then calculate the offset
    const progress = score / 100;
    strokeDashoffset = circumference * (1 - progress);
  } else {
    // For empty quizzes or invalid scores, show empty circle
    strokeDashoffset = circumference;
  }
  
  const progressClass = score !== null && score !== undefined && score >= 0
    ? getProgressColor(score) 
    : 'empty';

  return (
    <div className="quiz-progress-ring" title={`Completed ${score || 0}%`}>
      <svg width={size} height={size}>
        <circle
          className="bg"
          cx={size / 2}
          cy={size / 2}
          r={radius}
        />
        <circle
          className={`progress ${progressClass}`}
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
        />
      </svg>
      <div className="quiz-progress-text">
        {score !== null && score !== undefined && score >= 0 ? `${score}%` : '—'}
      </div>
    </div>
  );
};

const QuizPage = () => {
    const [quizzes, setQuizzes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState('quizzes');
    const [quoteIdx, setQuoteIdx] = useState(0);
    const [showGenerateModal, setShowGenerateModal] = useState(false);
    const [generating, setGenerating] = useState(false);
    const [decks, setDecks] = useState([]);
    const [selectedDeck, setSelectedDeck] = useState('');
    const [questionCount, setQuestionCount] = useState(10);
    const navigate = useNavigate();

    useEffect(() => {
        fetchQuizzes();
        fetchDecks();
    }, []);

    useEffect(() => {
        const interval = setInterval(() => {
            setQuoteIdx(idx => (idx + 1) % motivationalQuotes.length);
        }, 4000);
        return () => clearInterval(interval);
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

    const fetchDecks = async () => {
        try {
            const response = await api.get('/flashcards/decks/');
            setDecks(response.data);
        } catch (error) {
            console.error('Error fetching decks:', error);
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

    const handleGenerateQuiz = () => {
        setShowGenerateModal(true);
    };

    const handleGenerateSubmit = async () => {
        if (!selectedDeck) {
            alert('Please select a deck');
            return;
        }

        try {
            setGenerating(true);
            const response = await api.post('/test/generate-quiz/', {
                deck_id: selectedDeck,
                question_count: questionCount
            });
            
            // Refresh quizzes list
            await fetchQuizzes();
            setShowGenerateModal(false);
            setSelectedDeck('');
            setQuestionCount(10);
        } catch (error) {
            console.error('Error generating quiz:', error);
            alert('Failed to generate quiz. Please try again.');
        } finally {
            setGenerating(false);
        }
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

    const getQuizType = (questionCount) => {
        if (questionCount <= 5) return '~2 min quiz';
        if (questionCount <= 10) return '~5 min quiz';
        if (questionCount <= 20) return '~10 min quiz';
        return '~15 min quiz';
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
                <div className="quiz-header-left">
                    <button className="back-button" onClick={handleBack}>
                        <FiArrowLeft /> Back to Study Room
                    </button>
                </div>
                <div className="quiz-header-right">
                    <button className="generate-button" onClick={handleGenerateQuiz}>
                        <span style={{ color: 'white' }}>🎲</span> Generate Quiz
                    </button>
                <button className="create-button" onClick={handleCreateQuiz}>
                        <span style={{ color: 'white' }}>➕</span> Create New Quiz
                </button>
            </div>
            </div>

            <div className="quiz-session-title-block">
                <div className="quiz-title-container">
                    <div className="quiz-title-content">
                        <h2 className="quiz-session-title">
                          📝 Quiz Center
                        </h2>
                        <p className="quiz-session-subtitle">
                            {motivationalQuotes[quoteIdx]}
                        </p>
                    </div>
                </div>
            </div>

            <div className="quiz-content">
            {!Array.isArray(quizzes) || quizzes.length === 0 ? (
                <div className="no-quizzes">
                    <h2>No Quizzes Yet</h2>
                    <p>Create your first quiz to start testing your knowledge!</p>
                        <div className="no-quizzes-actions">
                            <button className="generate-button" onClick={handleGenerateQuiz}>Generate Quiz</button>
                    <button className="create-button" onClick={handleCreateQuiz}>Create Quiz</button>
                        </div>
                </div>
            ) : (
                <div className="quiz-table-container">
                    <table className="quiz-table">
                        <thead>
                            <tr>
                                <th className="quiz-th-center">Quiz Title</th>
                                <th className="quiz-th-center">Questions</th>
                                    <th className="quiz-th-center">Progress</th>
                                <th className="quiz-th-center">Last Attempt</th>
                                <th className="quiz-th-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                                {quizzes.map((quiz, index) => {
                                console.log('Rendering quiz:', quiz);
                                return (
                                        <tr key={quiz.id} className="quiz-row" style={{
                                            animation: `fadeInUp 0.4s ease ${index * 0.1}s both`
                                        }}>
                                        <td className="quiz-td-center quiz-title">
                                            <span className="quiz-icon">🧠</span>
                                            <div>
                                                <div>{quiz.topic}</div>
                                                    <div className="quiz-subject-subtitle">
                                                        {getQuizType(quiz.question_count || 0)}
                                                    </div>
                                                    <div className="quiz-category-tag">
                                                        Flashcards Test
                                                    </div>
                                            </div>
                                        </td>
                                        <td className="quiz-question-count">{quiz.question_count || 0}</td>
                                            <td className="quiz-td-center">
                                                <ProgressRing score={quiz.last_score} />
                                            </td>
                                        <td className="quiz-td-center">{quiz.last_attempt ? formatDate(quiz.last_attempt) : '—'}</td>
                                        <td className="quiz-td-center">
                                            <div className="quiz-actions">
                                                {quiz.last_score !== null && quiz.last_score !== undefined ? (
                                                    <>
                                                        <button 
                                                            className="quiz-action-btn view-btn"
                                                            onClick={() => handleReview(quiz.id)}
                                                        >
                                                                👁️ View
                                                        </button>
                                                        <button 
                                                            className="quiz-action-btn start-btn"
                                                            onClick={() => handleTest(quiz.id)}
                                                        >
                                                                ▶️ Retake
                                                        </button>
                                                    </>
                                                ) : (
                                                    <button 
                                                        className="quiz-action-btn start-btn"
                                                        onClick={() => handleTest(quiz.id)}
                                                    >
                                                            ▶️ Start
                                                    </button>
                                                )}
                                                <button 
                                                    className="quiz-action-btn edit-btn"
                                                    onClick={() => handleEdit(quiz.id)}
                                                >
                                                        ✏️ Edit
                                                </button>
                                                <button 
                                                    className="quiz-action-btn delete-btn"
                                                    onClick={() => handleDelete(quiz.id)}
                                                >
                                                        🗑️ Delete
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

            {/* Generate Quiz Modal */}
            {showGenerateModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h3>Generate Quiz from Flashcards</h3>
                        <p>Select a deck and we'll automatically create a quiz from your flashcards.</p>
                        
                        <div className="modal-form">
                            <div className="form-group">
                                <label>Select Deck:</label>
                                <select 
                                    value={selectedDeck} 
                                    onChange={(e) => setSelectedDeck(e.target.value)}
                                    className="modal-select"
                                >
                                    <option value="">Choose a deck...</option>
                                    {decks.map(deck => (
                                        <option key={deck.id} value={deck.id}>
                                            {deck.name} ({deck.card_count || 0} cards)
                                        </option>
                                    ))}
                                </select>
                            </div>
                            
                            <div className="form-group">
                                <label>Number of Questions:</label>
                                <select 
                                    value={questionCount} 
                                    onChange={(e) => setQuestionCount(parseInt(e.target.value))}
                                    className="modal-select"
                                >
                                    <option value={5}>5 questions (~2 min)</option>
                                    <option value={10}>10 questions (~5 min)</option>
                                    <option value={15}>15 questions (~8 min)</option>
                                    <option value={20}>20 questions (~10 min)</option>
                                </select>
                            </div>
                        </div>
                        
                        <div className="modal-actions">
                            <button className="modal-btn cancel-btn" onClick={() => setShowGenerateModal(false)}>
                                Cancel
                            </button>
                            <button 
                                className="modal-btn confirm-btn generate-confirm-btn" 
                                onClick={handleGenerateSubmit}
                                disabled={generating || !selectedDeck}
                            >
                                {generating ? 'Generating...' : 'Generate Quiz'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default QuizPage; 