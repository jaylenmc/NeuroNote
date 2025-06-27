import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { FiArrowLeft, FiChevronRight, FiEdit3, FiSmile, FiMeh, FiFrown, FiClock, FiCheckCircle, FiXCircle, FiChevronLeft } from 'react-icons/fi';
import './QuizTakePage.css';

const QuizTakePage = () => {
  const { quizId } = useParams();
  const navigate = useNavigate();
  const [quizTitle, setQuizTitle] = useState('');
  const [questions, setQuestions] = useState([]);
  const [activeQuestion, setActiveQuestion] = useState(0);
  const [answers, setAnswers] = useState({}); // { questionId: answerId }
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [userAnswersData, setUserAnswersData] = useState(null); // For review mode
  
  // Animation and interaction states
  const [isIdle, setIsIdle] = useState(false);
  const [streakCount, setStreakCount] = useState(0);
  const [lastActivity, setLastActivity] = useState(Date.now());
  const [questionTransition, setQuestionTransition] = useState(false);
  const [ambientPulse, setAmbientPulse] = useState(0);
  
  // New UI enhancement states
  const [notes, setNotes] = useState({}); // { questionId: note }
  const [confidence, setConfidence] = useState({}); // { questionId: confidence }
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [currentNote, setCurrentNote] = useState('');
  const [showConfidenceMeter, setShowConfidenceMeter] = useState(false);
  const [paceProgress, setPaceProgress] = useState(0);
  const [visitedQuestions, setVisitedQuestions] = useState(new Set()); // Track visited questions
  const [showTooltip, setShowTooltip] = useState(false);
  
  const idleTimeoutRef = useRef(null);
  const ambientIntervalRef = useRef(null);
  const [flipExplanation, setFlipExplanation] = useState(false);
  const correctOptionRef = useRef(null);
  const tooltipTimeout = useRef();

  // Detect review mode by checking if the path ends with /review
  const reviewMode = window.location.pathname.endsWith('/review');

  // Move currentQuestion declaration above useEffect
  const currentQuestion = reviewMode && userAnswersData 
    ? userAnswersData[activeQuestion] 
    : questions[activeQuestion];

  // Idle detection and ambient effects
  useEffect(() => {
    const handleActivity = () => {
      setLastActivity(Date.now());
      setIsIdle(false);
      if (idleTimeoutRef.current) {
        clearTimeout(idleTimeoutRef.current);
      }
      idleTimeoutRef.current = setTimeout(() => setIsIdle(true), 10000);
    };

    // Ambient pulse effect
    ambientIntervalRef.current = setInterval(() => {
      setAmbientPulse(prev => (prev + 1) % 100);
    }, 100);

    // Pace progress simulation
    const paceInterval = setInterval(() => {
      setPaceProgress(prev => Math.min(prev + 0.5, 100));
    }, 1000);

    // Track user activity
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
    events.forEach(event => document.addEventListener(event, handleActivity));
    
    handleActivity(); // Initialize

    return () => {
      events.forEach(event => document.removeEventListener(event, handleActivity));
      if (idleTimeoutRef.current) clearTimeout(idleTimeoutRef.current);
      if (ambientIntervalRef.current) clearInterval(ambientIntervalRef.current);
      clearInterval(paceInterval);
    };
  }, []);

  // Question transition effect
  useEffect(() => {
    setQuestionTransition(true);
    const timer = setTimeout(() => setQuestionTransition(false), 300);
    return () => clearTimeout(timer);
  }, [activeQuestion]);

  // Track when user navigates away from a question without answering
  useEffect(() => {
    if (activeQuestion > 0 && questions[activeQuestion - 1]?.id) {
      const previousQuestion = questions[activeQuestion - 1];
      if (!answers[previousQuestion.id]) {
        setVisitedQuestions(prev => new Set([...prev, previousQuestion.id]));
      }
    }
  }, [activeQuestion, questions, answers]);

  // Handle note taking
  const handleNoteClick = () => {
    const currentQuestionId = reviewMode && userAnswersData ? userAnswersData[activeQuestion]?.id : questions[activeQuestion]?.id;
    setCurrentNote(notes[currentQuestionId] || '');
    setShowNoteModal(true);
  };

  const handleSaveNote = () => {
    const currentQuestionId = reviewMode && userAnswersData ? userAnswersData[activeQuestion]?.id : questions[activeQuestion]?.id;
    setNotes(prev => ({ ...prev, [currentQuestionId]: currentNote }));
    setShowNoteModal(false);
  };

  const handleConfidenceSelect = (level) => {
    const currentQuestionId = reviewMode && userAnswersData ? userAnswersData[activeQuestion]?.id : questions[activeQuestion]?.id;
    setConfidence(prev => ({ ...prev, [currentQuestionId]: level }));
    setShowConfidenceMeter(false);
  };

  useEffect(() => {
    const fetchQuiz = async () => {
      setLoading(true);
      setError(null);
      // Clear previous answers when loading a new quiz
      setAnswers({});
      try {
        console.log('Fetching quiz with ID:', quizId);
        console.log('Review mode:', reviewMode);
        
        // Test API connectivity first
        try {
          const testResponse = await api.get('/test/quiz/');
          console.log('API connectivity test successful:', testResponse.data);
        } catch (testErr) {
          console.error('API connectivity test failed:', testErr);
          setError(`API connection failed: ${testErr.message}. Please make sure the Django server is running.`);
          setLoading(false);
          return;
        }
        
        // Fetch quiz meta
        console.log('Making API call to:', `/test/quiz/${quizId}/`);
        const quizRes = await api.get(`/test/quiz/${quizId}/`);
        console.log('Quiz response:', quizRes.data);
        setQuizTitle(quizRes.data.topic || 'Untitled Quiz');
        
        if (reviewMode) {
          // In review mode, fetch user answers for this specific quiz
          console.log('Making API call to:', `/test/review/${quizId}/`);
          const userAnswersRes = await api.get(`/test/review/${quizId}/`);
          console.log('Review data received:', userAnswersRes.data);
          setUserAnswersData(userAnswersRes.data.review || []);
        } else {
          // In test mode, fetch questions and answers
          console.log('Making API call to:', `/test/quiz/question/${quizId}/`);
          const qRes = await api.get(`/test/quiz/question/${quizId}/`);
          console.log('Questions response:', qRes.data);
          
          // Check if there are any questions
          if (!qRes.data || Object.keys(qRes.data).length === 0) {
            setError('This quiz has no questions. Please add some questions to the quiz first.');
            setLoading(false);
            return;
          }
          
          // qRes.data: { questionId: [answers] }
          const questionList = Object.entries(qRes.data).map(([questionId, answersArr]) => {
            if (!answersArr.length) return null;
            const q = answersArr[0];
            return {
              id: parseInt(questionId),
              prompt: q.question_input,
              question_type: q.question_type,
              options: answersArr.map(a => a.answer_input),
              correctIdx: answersArr.findIndex(a => a.is_correct),
              answerIds: answersArr.map(a => a.id),
              allAnswers: answersArr, // Save all answers for review mode
            };
          }).filter(Boolean);
          console.log('Processed questions:', questionList);
          setQuestions(questionList);
        }
      } catch (err) {
        console.error('Error details:', {
          message: err.message,
          response: err.response?.data,
          status: err.response?.status,
          url: err.config?.url
        });
        setError(`Failed to load quiz: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };
    fetchQuiz();
  }, [quizId, reviewMode]);

  const progress = reviewMode 
    ? `${activeQuestion + 1}/${userAnswersData?.length || 0}`
    : `${activeQuestion + 1}/${questions.length}`;

  const totalQuestions = reviewMode ? (userAnswersData?.length || 0) : questions.length;
  const currentConfidence = confidence[currentQuestion?.id];

  // Check if there are any visited but unanswered questions
  const hasUnansweredVisitedQuestions = !reviewMode && questions.length > 0 && 
    questions.some(q => visitedQuestions.has(q.id) && !answers[q.id]);

  // Get list of unanswered visited questions for tooltip (as numbers)
  const unansweredList = questions
    .filter(q => visitedQuestions.has(q.id) && !answers[q.id])
    .map(q => questions.findIndex(question => question.id === q.id) + 1);

  const getUnansweredQuestionsList = () => {
    if (reviewMode) return '';
    if (unansweredList.length === 1) {
      return (
        <>Question <button className="quiz-take-tooltip-jump" onClick={() => setActiveQuestion(unansweredList[0] - 1)}>{unansweredList[0]}</button> not answered</>
      );
    }
    return (
      <>
        Questions {unansweredList.map((num, i) => (
          <button
            key={num}
            className="quiz-take-tooltip-jump"
            onClick={() => setActiveQuestion(num - 1)}
          >
            {num}
          </button>
        )).reduce((prev, curr) => [prev, ', ', curr])} not answered
      </>
    );
  };

  const handleSelect = (qIdx, oIdx) => {
    const q = questions[qIdx];
    const selectedAnswerId = q.answerIds[oIdx];
    setAnswers(a => ({ ...a, [q.id]: selectedAnswerId }));
  };

  const handleWrittenChange = (qIdx, value) => {
    const q = questions[qIdx];
    // For written answers, we'll need to handle this differently
    // For now, we'll store the text value and handle it during submission
    setAnswers(a => ({ ...a, [q.id]: value }));
  };

  const handleBack = () => navigate('/quiz');

  const handleSubmit = async () => {
    setSubmitting(true);
    
    try {
      // Prepare qa_ids for the new backend format
      const qa_ids = {};
      questions.forEach((question) => {
        const userAnswer = answers[question.id];
        if (userAnswer !== undefined) {
          if (question.question_type === 'MC') {
            // For MC, userAnswer is already the answerId
            qa_ids[question.id] = userAnswer;
          } else if (question.question_type === 'WR') {
            // For written answers, we need to find or create an answer
            // For now, we'll skip written answers as they need special handling
            console.log('Written answer handling not implemented yet');
          }
        }
      });

      // Submit all answers at once using the new UserAnswersView POST method
      const token = sessionStorage.getItem('jwt_token');
      const response = await api.post('/test/review/', {
        quiz_id: parseInt(quizId),
        qa_ids: qa_ids
      }, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        },
        credentials: 'include'
      });

      console.log('Quiz submitted successfully:', response.data);
      
      // Navigate to results page with score data
      navigate(`/quiz/${quizId}/results`, {
        state: {
          score: response.data.Score,
          totalQuestions: questions.length,
          questions,
          userAnswers: answers,
          quizTitle
        }
      });
    } catch (err) {
      console.error('Error submitting quiz:', err);
      setError('Failed to submit quiz. Please try again.');
      setSubmitting(false);
    }
  };

  useEffect(() => {
    if (correctOptionRef.current && currentQuestion) {
      const rect = correctOptionRef.current.getBoundingClientRect();
      // If the right edge + bubble width > window width, flip
      if (rect.right + 340 > window.innerWidth) {
        setFlipExplanation(true);
      } else {
        setFlipExplanation(false);
      }
    }
  }, [currentQuestion, activeQuestion]);

  const handleTooltipEnter = () => {
    clearTimeout(tooltipTimeout.current);
    setShowTooltip(true);
  };
  const handleTooltipLeave = () => {
    tooltipTimeout.current = setTimeout(() => setShowTooltip(false), 250);
  };

  if (loading) return <div className="quiz-review-bg"><div className="loading">Loading quiz...</div></div>;
  if (error) return <div className="quiz-review-bg"><div className="error-message">{error}</div></div>;

  if (reviewMode && !userAnswersData) {
    return <div className="quiz-review-bg"><div className="error-message">No review data found.</div></div>;
  }

  // --- MONOCHROME REVIEW UI ---
  if (reviewMode) {
    const totalQuestions = userAnswersData?.length || 0;
    const progressPercent = totalQuestions ? ((activeQuestion + 1) / totalQuestions) * 100 : 0;
    // Timer placeholder (implement if available)
    const timerDisplay = currentQuestion?.time_taken ? `${currentQuestion.time_taken}s` : '';
    
    // Calculate ambient pulse effect
    const pulseOpacity = 0.03 + (Math.sin(ambientPulse * 0.1) * 0.02);
    const pulseScale = 1 + (Math.sin(ambientPulse * 0.05) * 0.02);
    
    // Get current question data
    const currentQuestionId = userAnswersData?.[activeQuestion]?.id;
    const currentNote = notes[currentQuestionId] || '';
    const currentConfidence = confidence[currentQuestionId];
    
    return (
      <div className="quiz-review-bg">
        {/* Enhanced themed background */}
        <div className="quiz-review-gradient-bg" />
        <div 
          className="quiz-review-ambient-pulse"
          style={{
            opacity: pulseOpacity,
            transform: `scale(${pulseScale})`,
          }}
        />
        <div className="quiz-review-noise-overlay" />
        
        {/* Top Floating Bar */}
        <div className={`quiz-review-topbar${isIdle ? ' idle' : ''}${streakCount > 2 ? ' streak' : ''}`}>
          <button
            className="quiz-review-topbar-back-btn"
            onClick={() => navigate('/quiz')}
            aria-label="Back to Quiz List"
          >
            <FiArrowLeft />
            <span>Back</span>
          </button>
          <div className="quiz-review-topbar-progress">
            <div className="quiz-review-progress-bar">
              <div 
                className="quiz-review-progress-fill" 
                style={{ 
                  width: `${progressPercent}%`,
                  animationDelay: `${ambientPulse * 0.01}s`
                }} 
              />
            </div>
          </div>
          <div className="quiz-review-topbar-title">{quizTitle}</div>
          <div className="quiz-review-topbar-timer">{timerDisplay}</div>
        </div>

        {/* Main Body */}
        <div className={`quiz-review-main${questionTransition ? ' transitioning' : ''}`}>
          {/* Question header with type icon and note button */}
          <div className="quiz-review-question-header">
            <div className="quiz-review-question-type">
              <FiCheckCircle className="question-type-icon" />
              <span>Multiple Choice</span>
            </div>
            <button 
              className="quiz-review-note-btn"
              onClick={handleNoteClick}
              aria-label="Add note"
            >
              <FiEdit3 />
              {currentNote && <span className="note-indicator" />}
            </button>
          </div>
          
          <div className="quiz-review-question">{currentQuestion?.question_input}</div>
          <div className="quiz-review-subtext">Question {activeQuestion + 1} of {totalQuestions}</div>
          
          {/* Pace indicator */}
          <div className="quiz-review-pace-indicator">
            <FiClock />
            <div className="pace-bar">
              <div 
                className="pace-fill" 
                style={{ width: `${paceProgress}%` }}
              />
            </div>
            <span>Pace: {Math.round(paceProgress)}%</span>
          </div>
          
          <div className="quiz-review-options">
            {currentQuestion?.answers?.map((answer, oIdx) => {
              const isSelected = answer.is_user_answer;
              const isCorrect = answer.answer_status === 'Correct';
              const isIncorrect = answer.answer_status === 'Incorrect';
              
              let optionClass = 'quiz-review-option';
              if (isCorrect) {
                optionClass += ' correct';
              } else if (isIncorrect) {
                optionClass += ' incorrect';
              } else if (isSelected) {
                optionClass += ' selected';
              }
              
              if (isCorrect) {
                return (
                  <div
                    key={oIdx}
                    className={optionClass}
                    style={{ position: 'relative', animationDelay: `${oIdx * 0.1}s` }}
                  >
                    {(isSelected || isCorrect || isIncorrect) && <span className="quiz-review-option-dot" />}
                    {answer.answer_input}
                    {typeof answer.answer_status === 'string' && (
                      <span className="quiz-review-feedback-row">
                        <span className="quiz-review-feedback-icon correct">✓</span>
                      </span>
                    )}
                    <div className="quiz-review-explanation below">
                      <div className="explanation-header">
                        <FiCheckCircle className="explanation-icon" />
                        <span>Explanation</span>
                      </div>
                      <p>This question tests your understanding of the core concepts. Review the material if you found it challenging.</p>
                    </div>
                  </div>
                );
              }
  return (
                <button
                  key={oIdx}
                  className={optionClass}
                  disabled
                  type="button"
                  style={{ animationDelay: `${oIdx * 0.1}s` }}
                >
                  {(isSelected || isCorrect || isIncorrect) && <span className="quiz-review-option-dot" />}
                  {answer.answer_input}
                  {typeof answer.answer_status === 'string' && (
                    <span className="quiz-review-feedback-row">
                      {isCorrect ? (
                        <span className="quiz-review-feedback-icon correct">✓</span>
                      ) : isIncorrect ? (
                        <span className="quiz-review-feedback-icon incorrect">✗</span>
                      ) : null}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
          
          {/* Confidence meter */}
          {!currentConfidence && (
            <div className="quiz-review-confidence-meter">
              <p>How confident were you with this answer?</p>
              <div className="confidence-options">
                <button 
                  className="confidence-btn"
                  onClick={() => handleConfidenceSelect('low')}
                >
                  <FiFrown />
                  <span>Not sure</span>
                </button>
                <button 
                  className="confidence-btn"
                  onClick={() => handleConfidenceSelect('medium')}
                >
                  <FiMeh />
                  <span>Somewhat</span>
                </button>
                <button 
                  className="confidence-btn"
                  onClick={() => handleConfidenceSelect('high')}
                >
                  <FiSmile />
                  <span>Very confident</span>
                </button>
              </div>
            </div>
          )}
          
          {/* Current confidence display */}
          {currentConfidence && (
            <div className="quiz-review-confidence-display">
              <span>Confidence: </span>
              {currentConfidence === 'high' && <FiSmile className="confidence-icon high" />}
              {currentConfidence === 'medium' && <FiMeh className="confidence-icon medium" />}
              {currentConfidence === 'low' && <FiFrown className="confidence-icon low" />}
            </div>
          )}
        </div>

        {/* Bottom Bar */}
        <div className="quiz-review-bottom">
          <button
            className="quiz-review-bottom-btn"
            onClick={() => setActiveQuestion(q => Math.max(0, q - 1))}
            disabled={activeQuestion === 0}
            aria-label="Previous Question"
          >
            <FiArrowLeft />
          </button>
          <button
            className="quiz-review-bottom-btn next"
            onClick={() => setActiveQuestion(q => Math.min(totalQuestions - 1, q + 1))}
            disabled={activeQuestion === totalQuestions - 1}
            aria-label="Next Question"
            style={{ 
              visibility: activeQuestion < totalQuestions - 1 ? 'visible' : 'hidden',
              animationDelay: '0.2s'
            }}
          >
            <FiChevronRight />
          </button>
        </div>

        {/* Note Modal */}
        {showNoteModal && (
          <div className="quiz-review-note-modal-overlay" onClick={() => setShowNoteModal(false)}>
            <div className="quiz-review-note-modal" onClick={e => e.stopPropagation()}>
              <h3>Add Note</h3>
              <textarea
                value={currentNote}
                onChange={(e) => setCurrentNote(e.target.value)}
                placeholder="Write your thoughts about this question..."
                rows={4}
              />
              <div className="note-modal-actions">
                <button onClick={() => setShowNoteModal(false)}>Cancel</button>
                <button onClick={handleSaveNote} className="save-btn">Save Note</button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="quiz-take-bg">
      {/* Navbar with back button on left, progress in center, title on right */}
      <nav className="quiz-take-navbar">
        <div className="quiz-take-navbar-left">
          <button className="quiz-take-navbar-back-btn" onClick={handleBack}>
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
        <div className="quiz-take-question-card">
          {/* Warning indicator if there are visited but unanswered questions */}
          {hasUnansweredVisitedQuestions && (
            <div
              className="quiz-take-warning-indicator"
              onMouseEnter={handleTooltipEnter}
              onMouseLeave={handleTooltipLeave}
            >
              <span>!</span>
              <div
                className={`quiz-take-tooltip${showTooltip ? ' visible' : ''}`}
                onMouseEnter={handleTooltipEnter}
                onMouseLeave={handleTooltipLeave}
              >
                <div className="quiz-take-tooltip-arrow"></div>
                <div className="quiz-take-tooltip-content">
                  {getUnansweredQuestionsList()}
                </div>
              </div>
            </div>
          )}
          
          <div className="quiz-take-question-header">Question {activeQuestion + 1}</div>
          <div className="quiz-take-question-prompt">
              {reviewMode ? currentQuestion?.question_input : currentQuestion?.prompt}
            </div>
            
          <div className="quiz-take-pace-display">
            <span className="quiz-take-pace-label">Pace:</span>
            <span className="quiz-take-pace-number">{Math.round(paceProgress)}</span>
          </div>
          
          <div className="quiz-take-options-list">
            {reviewMode ? (
              // Review mode - show user answers data
              currentQuestion?.answers?.map((answer, oIdx) => {
                const isSelected = answer.is_user_answer;
                const isCorrect = answer.answer_status === 'Correct';
                const isIncorrect = answer.answer_status === 'Incorrect';
                
                let optionClass = 'quiz-take-option';
                if (isCorrect) {
                    optionClass += ' correct';
                } else if (isIncorrect) {
                    optionClass += ' incorrect';
                } else if (isSelected) {
                  optionClass += ' selected';
                  }
                  
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
              })
            ) : (
              // Test mode - show interactive questions
              currentQuestion?.options?.map((option, oIdx) => {
                    const selectedAnswerId = currentQuestion.answerIds[oIdx];
                const isSelected = answers[currentQuestion.id] === selectedAnswerId;
                
                let optionClass = 'quiz-take-option';
                if (isSelected) {
                  optionClass += ' selected';
                }
                    
                    return (
                      <button
                        key={oIdx}
                        className={optionClass}
                        onClick={() => handleSelect(activeQuestion, oIdx)}
                        type="button"
                      >
                    {option}
                      </button>
                    );
              })
            )}
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
      
      {/* Show submit button on last question, otherwise show next arrow */}
      {!reviewMode && activeQuestion === totalQuestions - 1 ? (
          <button
          className="quiz-take-nav-btn quiz-take-nav-btn-submit"
            onClick={handleSubmit}
          disabled={submitting || Object.keys(answers).length < questions.length}
          title={Object.keys(answers).length < questions.length ? 'Answer all questions to submit' : 'Submit quiz'}
        >
          {submitting ? '...' : '✓'}
        </button>
      ) : (
        <button 
          className="quiz-take-nav-btn quiz-take-nav-btn-forward"
          onClick={() => setActiveQuestion(q => Math.min(totalQuestions - 1, q + 1))}
          disabled={activeQuestion === totalQuestions - 1}
          title="Next question"
        >
          <FiChevronRight />
          </button>
      )}
    </div>
  );
};

export default QuizTakePage; 