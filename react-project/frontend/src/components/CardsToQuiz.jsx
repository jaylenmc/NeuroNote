import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiClock, FiCheck, FiX, FiPlay, FiPause, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import './CardsToQuiz.css';
import api from '../api/axios';

const CardsToQuiz = ({ reviewedCards, onBack }) => {
  const navigate = useNavigate();
  
  // Quiz state
  const [quizQuestions, setQuizQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState({});
  const [quizComplete, setQuizComplete] = useState(false);
  const [quizResults, setQuizResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [timer, setTimer] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [currentResultIndex, setCurrentResultIndex] = useState(0);

  // Initialize quiz from reviewed cards
  useEffect(() => {
    if (reviewedCards && reviewedCards.length > 0) {
      createQuizFromCards();
    }
  }, [reviewedCards]);

  // Timer effect
  useEffect(() => {
    let interval;
    if (!loading && !quizComplete && !isPaused) {
      interval = setInterval(() => {
        setTimer((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [loading, quizComplete, isPaused]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Only handle keyboard shortcuts when not typing in textarea
      if (e.target.tagName === 'TEXTAREA') {
        return;
      }
      
      if (e.code === 'Space' || e.key === ' ') {
        e.preventDefault();
        // Don't prevent spacebar in textarea
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const createQuizFromCards = async () => {
    try {
      setLoading(true);

      // Prepare quiz data from reviewed cards
      const quizData = reviewedCards.map(card => ({
        question_input: card.question,
        correct_answer: card.answer
      }));

      // Create quiz via API
      await api.post('/test/cards-to-quiz/', {
        qa: quizData
      });

      // Fetch the created quiz questions
      const quizResponse = await api.get('/test/cards-to-quiz/');
      setQuizQuestions(quizResponse.data.questions);
      setLoading(false);
    } catch (err) {
      console.error('Error creating quiz:', err);
      setError(err.message);
      setLoading(false);
    }
  };

  const handleAnswerSubmit = (answer) => {
    const currentQuestion = quizQuestions[currentQuestionIndex];
    setUserAnswers(prev => ({
      ...prev,
      [currentQuestion.id]: answer
    }));

    if (currentQuestionIndex < quizQuestions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      submitQuiz();
    }
  };

  const submitQuiz = async () => {
    try {
      setLoading(true);

      // Prepare user answers for submission
      const userAnswersData = Object.entries(userAnswers).map(([questionId, answer]) => {
        const question = quizQuestions.find(q => q.id === parseInt(questionId));
        return {
          question_input: question.question_input,
          user_answer: answer
        };
      });

      // Submit answers for AI grading
      const response = await api.post('/test/cards-to-quiz/', {
        reviewed: true,
        user_answers: userAnswersData
      });

      const results = response.data;
      
      // Handle the response format - it should be an array of graded results
      if (Array.isArray(results)) {
        setQuizResults(results);
      } else if (results.Error) {
        throw new Error(results.Error);
      } else {
        throw new Error('Unexpected response format');
      }
      
      setQuizComplete(true);
      setLoading(false);
    } catch (err) {
      console.error('Error submitting quiz:', err);
      setError(err.message);
      setLoading(false);
    }
  };

  const handlePause = () => {
    setIsPaused(prev => !prev);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading && !quizQuestions.length) {
    return (
      <div className="cards-to-quiz-loading">
        <div className="loading-spinner"></div>
        <p>Creating your quiz...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="cards-to-quiz-error">
        <h2>Error</h2>
        <p>{error}</p>
        <button onClick={onBack}>Back to Review</button>
      </div>
    );
  }

  if (quizComplete && quizResults) {
    return (
      <div className="quiz-take-bg">
        {/* Navbar with back button on left, progress in center, title on right */}
        <nav className="quiz-take-navbar">
          <div className="quiz-take-navbar-left">
            <button className="quiz-take-navbar-back-btn" onClick={onBack}>
              <FiArrowLeft style={{ marginRight: 6 }} /> Back
            </button>
          </div>
          <div className="quiz-take-navbar-center-fixed">
                          <div className="quiz-take-progress-container">
                <div className="quiz-take-progress-bar">
                  <div 
                    className="quiz-take-progress-fill" 
                    style={{ width: `${((currentResultIndex + 1) / quizResults.length) * 100}%` }}
                  />
                </div>
                <span className="quiz-take-questions-left">{currentResultIndex + 1}/{quizResults.length}</span>
              </div>
          </div>
          <div className="quiz-take-navbar-right">
            <div className="quiz-take-navbar-title">Quiz Results</div>
          </div>
        </nav>

        {/* Main Content */}
                  <div className="quiz-take-main">
            <div className="quiz-take-question-card"> 
              <div className="quiz-take-question-header">
                Question {currentResultIndex + 1}
                <div className="score-badge">
                  <span className={`score ${quizResults[currentResultIndex]?.score?.toLowerCase()}`}>
                    {quizResults[currentResultIndex]?.score}
                  </span>
                </div>
              </div>
              <div className="quiz-take-question-prompt">
                {quizResults[currentResultIndex]?.question_input}
              </div>
            
                          {/* Answer Options */}
              <div className="quiz-take-options-list">
                {/* Correct Answer */}
                <div className="quiz-take-option correct">
                  <div className="option-label">Correct Answer:</div>
                  <div className="option-content">{quizResults[currentResultIndex]?.correct_answer}</div>
                </div>
                
                {/* User Answer */}
                <div className={`quiz-take-option ${quizResults[currentResultIndex]?.score?.toLowerCase() === 'correct' ? 'correct' : 'incorrect'}`}>
                  <div className="option-label">Your Answer:</div>
                  <div className="option-content">{quizResults[currentResultIndex]?.user_answer || 'No answer provided'}</div>
                </div>
              </div>
              
              {/* AI Explanation */}
              <div className="ai-explanation-container">
                <h4>Explanation: {quizResults[currentResultIndex]?.explanation}</h4>
              </div>
          </div>
        </div>

        {/* Navigation buttons in bottom corners */}
        <button 
          className="quiz-take-nav-btn quiz-take-nav-btn-back"
          onClick={() => setCurrentResultIndex(q => Math.max(0, q - 1))}
          disabled={currentResultIndex === 0}
          title="Previous question"
        >
          <FiChevronLeft />
        </button>
        <button 
          className="quiz-take-nav-btn quiz-take-nav-btn-forward"
          onClick={() => setCurrentResultIndex(q => Math.min(quizResults.length - 1, q + 1))}
          disabled={currentResultIndex === quizResults.length - 1}
          title="Next question"
        >
          <FiChevronRight />
        </button>
      </div>
    );
  }

  if (!quizQuestions.length) {
    return (
      <div className="cards-to-quiz-empty">
        <h2>No Quiz Available</h2>
        <p>No reviewed cards to create a quiz from.</p>
        <button onClick={onBack}>Back to Review</button>
      </div>
    );
  }

  const currentQuestion = quizQuestions[currentQuestionIndex];
  const userAnswer = userAnswers[currentQuestion.id] || '';

  return (
    <div className="cards-to-quiz">
      {/* Header */}
      <div className="quiz-header">
        <button className="back-btn" onClick={onBack}>
          <FiArrowLeft /> Back to Review
        </button>
        <div className="quiz-progress">
          <div className="progress-bar">
            <div 
              className="progress-fill" 
              style={{width: `${((currentQuestionIndex + 1) / quizQuestions.length) * 100}%`}}
            />
          </div>
          <div className="progress-text">
            Question {currentQuestionIndex + 1} of {quizQuestions.length}
          </div>
        </div>
        <div className="quiz-timer">
          <FiClock /> {formatTime(timer)}
          <button className="pause-btn" onClick={handlePause} title={isPaused ? 'Resume' : 'Pause'}>
            {isPaused ? <FiPlay /> : <FiPause />}
          </button>
        </div>
      </div>

      {/* Scrollable Content Area */}
      <div className="quiz-content">
        {/* Question */}
        <div className="question-container">
          <div className="question-card">
            <h3>Question {currentQuestionIndex + 1}</h3>
            <p className="question-text">{currentQuestion.question_input}</p>
          </div>
        </div>

        {/* Answer Input */}
        <div className="answer-container">
          <div className="answer-input-section">
            <h4>Your Answer:</h4>
            <textarea
              className="answer-textarea"
              value={userAnswer}
              onChange={(e) => setUserAnswers(prev => ({
                ...prev,
                [currentQuestion.id]: e.target.value
              }))}
              placeholder="Type your answer here..."
              rows={6}
            />
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="quiz-navigation">
        <div className="nav-left">
          {currentQuestionIndex > 0 && (
            <button 
              className="nav-btn prev-btn"
              onClick={() => setCurrentQuestionIndex(prev => prev - 1)}
            >
              Previous
            </button>
          )}
        </div>
        
        <div className="nav-right">
          <button 
            className="nav-btn next-btn"
            onClick={() => handleAnswerSubmit(userAnswer)}
            disabled={!userAnswer.trim()}
          >
            {currentQuestionIndex === quizQuestions.length - 1 ? 'Submit Quiz' : 'Next Question'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CardsToQuiz; 