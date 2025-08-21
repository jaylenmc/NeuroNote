import React from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { FiArrowLeft, FiEye, FiRotateCcw, FiCheck, FiX } from 'react-icons/fi';
import './QuizCreatePage.css';

const QuizResultsPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { quizId } = useParams();
  
  // Get results data from navigation state
  const { score, totalQuestions, questions, userAnswers, quizTitle } = location.state || {};

  // Calculate correct answers from score
  const correctAnswers = Math.round((score / 100) * totalQuestions);

  const handleBack = () => {
    navigate('/quiz');
  };

  const handleReview = () => {
    navigate(`/quiz/${quizId}/review`);
  };

  const handleRetake = () => {
    navigate(`/quiz/${quizId}/test`);
  };

  const getScoreColor = (score) => {
    if (score >= 90) return '#4ecb7b'; // Green
    if (score >= 70) return '#a78bfa'; // Purple
    if (score >= 50) return '#fbbf24'; // Yellow
    return '#ff6b6b'; // Red
  };

  const getScoreMessage = (score) => {
    if (score >= 90) return 'Excellent!';
    if (score >= 70) return 'Good job!';
    if (score >= 50) return 'Not bad!';
    return 'Keep practicing!';
  };

  const getWrongQuestions = () => {
    if (!questions || !userAnswers) return [];
    
    return questions.filter((question) => {
      const userAnswer = userAnswers[question.id];
      if (question.question_type === 'MC') {
        // For MC, check if user selected the correct answer
        const correctAnswerId = question.answerIds[question.correctIdx];
        return userAnswer !== correctAnswerId;
      }
      // For WR, consider wrong if no answer provided
      return !userAnswer || !userAnswer.trim();
    });
  };

  const wrongQuestions = getWrongQuestions();

  if (!location.state) {
    return (
      <div className="quiz-create-bg">
        <div className="error-message">No results data found. Please take the quiz first.</div>
      </div>
    );
  }

  return (
    <div className="quiz-create-bg quiz-create-scrollbar">
      {/* Navbar */}
      <nav className="quiz-create-navbar">
        <div className="quiz-create-navbar-left">
          <div className="quiz-create-navbar-title-static">{quizTitle || 'Quiz Results'}</div>
        </div>
        <div className="quiz-create-navbar-center-fixed">
          <span className="quiz-create-navbar-questions-count">Results</span>
        </div>
        <div className="quiz-create-navbar-right">
          <button className="quiz-create-navbar-back-btn" onClick={handleBack}>
            <FiArrowLeft style={{ marginRight: 6 }} /> Back
          </button>
        </div>
      </nav>

      <div className="quiz-create-main-layout">
        <main className="quiz-create-main-content" style={{ maxWidth: '800px', margin: '0 auto' }}>
          {/* Score Overview */}
          <div className="quiz-create-section-header">Quiz Results</div>
          <div className="quiz-create-question-card fade-slide">
            <div style={{ textAlign: 'center', padding: '2rem 0' }}>
              <div style={{ 
                fontSize: '4rem', 
                fontWeight: '700', 
                color: getScoreColor(score),
                marginBottom: '1rem'
              }}>
                {score}%
              </div>
              <div style={{ 
                fontSize: '1.5rem', 
                fontWeight: '600', 
                color: '#f0f0f0',
                marginBottom: '0.5rem'
              }}>
                {getScoreMessage(score)}
              </div>
              <div style={{ 
                fontSize: '1.1rem', 
                color: '#aaa',
                marginBottom: '2rem'
              }}>
                You got {correctAnswers} out of {totalQuestions} questions correct
              </div>
            </div>

            {/* Performance Breakdown */}
            <div style={{ marginBottom: '2rem' }}>
              <h3 style={{ color: '#f0f0f0', marginBottom: '1rem' }}>Performance Breakdown</h3>
              <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                <div style={{ 
                  flex: 1, 
                  background: '#1f2021', 
                  padding: '1rem', 
                  borderRadius: '12px',
                  border: '1.5px solid #232b2f'
                }}>
                  <div style={{ color: '#4ecb7b', fontSize: '1.5rem', fontWeight: '700' }}>
                    {correctAnswers}
                  </div>
                  <div style={{ color: '#aaa', fontSize: '0.9rem' }}>Correct</div>
                </div>
                <div style={{ 
                  flex: 1, 
                  background: '#1f2021', 
                  padding: '1rem', 
                  borderRadius: '12px',
                  border: '1.5px solid #232b2f'
                }}>
                  <div style={{ color: '#ff6b6b', fontSize: '1.5rem', fontWeight: '700' }}>
                    {totalQuestions - correctAnswers}
                  </div>
                  <div style={{ color: '#aaa', fontSize: '0.9rem' }}>Incorrect</div>
                </div>
                <div style={{ 
                  flex: 1, 
                  background: '#1f2021', 
                  padding: '1rem', 
                  borderRadius: '12px',
                  border: '1.5px solid #232b2f'
                }}>
                  <div style={{ color: '#a78bfa', fontSize: '1.5rem', fontWeight: '700' }}>
                    {totalQuestions}
                  </div>
                  <div style={{ color: '#aaa', fontSize: '0.9rem' }}>Total</div>
                </div>
              </div>
            </div>

            {/* Wrong Questions Summary */}
            {wrongQuestions.length > 0 && (
              <div style={{ marginBottom: '2rem' }}>
                <h3 style={{ color: '#f0f0f0', marginBottom: '1rem' }}>
                  Questions to Review ({wrongQuestions.length})
                </h3>
                <div style={{ 
                  background: '#1f2021', 
                  padding: '1rem', 
                  borderRadius: '12px',
                  border: '1.5px solid #ff6b6b'
                }}>
                  <div style={{ color: '#ff6b6b', marginBottom: '0.5rem', fontWeight: '600' }}>
                    You missed {wrongQuestions.length} question{wrongQuestions.length !== 1 ? 's' : ''}
                  </div>
                  <div style={{ color: '#aaa', fontSize: '0.9rem' }}>
                    Review these questions to improve your understanding
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
              <button 
                className="quiz-create-save-btn"
                onClick={handleReview}
                style={{ 
                  background: 'linear-gradient(135deg, #a78bfa 0%, #8b5cf6 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}
              >
                <FiEye /> Review Answers
              </button>
              <button 
                className="quiz-create-save-btn"
                onClick={handleRetake}
                style={{ 
                  background: 'linear-gradient(135deg, #7c83fd 0%, #6366f1 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}
              >
                <FiRotateCcw /> Retake Quiz
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default QuizResultsPage; 