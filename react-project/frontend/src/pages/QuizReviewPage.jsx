import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { FiArrowLeft, FiChevronRight, FiChevronLeft } from 'react-icons/fi';
import './QuizTakePage.css';

const QuizReviewPage = () => {
  const { quizId } = useParams();
  const navigate = useNavigate();
  const [quizTitle, setQuizTitle] = useState('');
  const [questions, setQuestions] = useState([]);
  const [activeQuestion, setActiveQuestion] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [paceProgress, setPaceProgress] = useState(0);
  const [questionTransition, setQuestionTransition] = useState(false);
  const [ambientPulse, setAmbientPulse] = useState(0);

  // For review, we fetch user answers and correct answers
  useEffect(() => {
    const fetchReview = async () => {
      setLoading(true);
      setError(null);
      try {
        const quizRes = await api.get(`/test/quiz/${quizId}/`);
        setQuizTitle(quizRes.data.topic || 'Untitled Quiz');
        const reviewRes = await api.get(`/test/review/${quizId}/`);
        // reviewRes.data.review is an array of questions with answers and user selections
        setQuestions(reviewRes.data.review || []);
      } catch (err) {
        setError(`Failed to load review: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };
    fetchReview();
  }, [quizId]);

  useEffect(() => {
    setQuestionTransition(true);
    const timer = setTimeout(() => setQuestionTransition(false), 300);
    return () => clearTimeout(timer);
  }, [activeQuestion]);

  useEffect(() => {
    const interval = setInterval(() => {
      setPaceProgress(prev => Math.min(prev + 0.5, 100));
      setAmbientPulse(prev => (prev + 1) % 100);
    }, 100);
    return () => clearInterval(interval);
  }, []);

  const totalQuestions = questions.length;
  const currentQuestion = questions[activeQuestion];

  if (loading) return <div className="quiz-take-bg"><div className="loading">Loading review...</div></div>;
  if (error) return <div className="quiz-take-bg"><div className="error-message">{error}</div></div>;
  if (!currentQuestion) return <div className="quiz-take-bg"><div className="error-message">No review data found.</div></div>;

  return (
    <div className="quiz-take-bg">
      {/* Navbar with back button on left, progress in center, title on right */}
      <nav className="quiz-take-navbar">
        <div className="quiz-take-navbar-left">
          <button className="quiz-take-navbar-back-btn" onClick={() => navigate('/quiz')}>
            <FiArrowLeft style={{ marginRight: 6 }} /> Back
          </button>
        </div>
        <div className="quiz-take-navbar-center-fixed">
          <div className="quiz-take-progress-container">
            <div className="quiz-take-progress-bar">
              <div 
                className="quiz-take-progress-fill" 
                style={{ width: `${((activeQuestion + 1) / totalQuestions) * 100}%` }}
              />
            </div>
            <span className="quiz-take-questions-left">{activeQuestion + 1}/{totalQuestions}</span>
          </div>
        </div>
        <div className="quiz-take-navbar-right">
          <div className="quiz-take-navbar-title">{quizTitle}</div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="quiz-take-main">
        <div className={`quiz-take-question-card${questionTransition ? ' transitioning' : ''}`}> 
          <div className="quiz-take-question-header">Question {activeQuestion + 1}</div>
          <div className="quiz-take-question-prompt">
            {currentQuestion?.question_input}
          </div>
          <div className="quiz-take-options-list">
            {currentQuestion?.answers?.map((answer, oIdx) => {
              const isSelected = answer.is_user_answer;
              const isCorrect = answer.answer_status === 'Correct';
              const isIncorrect = answer.answer_status === 'Incorrect';
              let optionClass = 'quiz-take-option';
              if (isCorrect) optionClass += ' correct';
              else if (isIncorrect) optionClass += ' incorrect';
              else if (isSelected) optionClass += ' selected';
              return (
                <button
                  key={oIdx}
                  className={optionClass}
                  disabled={true}
                  type="button"
                >
                  {answer.answer_input}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Navigation buttons in bottom corners */}
      <button 
        className="quiz-take-nav-btn quiz-take-nav-btn-back"
        onClick={() => setActiveQuestion(q => Math.max(0, q - 1))}
        disabled={activeQuestion === 0}
        title="Previous question"
      >
        <FiChevronLeft />
      </button>
      <button 
        className="quiz-take-nav-btn quiz-take-nav-btn-forward"
        onClick={() => setActiveQuestion(q => Math.min(totalQuestions - 1, q + 1))}
        disabled={activeQuestion === totalQuestions - 1}
        title="Next question"
      >
        <FiChevronRight />
      </button>
    </div>
  );
};

export default QuizReviewPage; 