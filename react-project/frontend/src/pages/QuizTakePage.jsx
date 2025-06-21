import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { FiArrowLeft } from 'react-icons/fi';
import './QuizCreatePage.css';

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

  // Detect review mode by checking if the path ends with /review
  const reviewMode = window.location.pathname.endsWith('/review');

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

  if (loading) return <div className="quiz-create-bg"><div className="loading">Loading quiz...</div></div>;
  if (error) return <div className="quiz-create-bg"><div className="error-message">{error}</div></div>;

  // In review mode, use userAnswersData
  const currentQuestion = reviewMode && userAnswersData 
    ? userAnswersData[activeQuestion] 
    : questions[activeQuestion];

  if (reviewMode && !userAnswersData) {
    return <div className="quiz-create-bg"><div className="error-message">No review data found.</div></div>;
  }

  return (
    <div className="quiz-create-bg quiz-create-scrollbar">
      {/* Navbar with quiz title and progress */}
      <nav className="quiz-create-navbar">
        <div className="quiz-create-navbar-left">
          <div className="quiz-create-navbar-title-static">{quizTitle}</div>
        </div>
        <div className="quiz-create-navbar-center-fixed">
          <span className="quiz-create-navbar-questions-count">{progress}</span>
        </div>
        <div className="quiz-create-navbar-right">
          <button className="quiz-create-navbar-back-btn" onClick={handleBack}>
            <FiArrowLeft style={{ marginRight: 6 }} /> Back
          </button>
        </div>
      </nav>

      <div className="quiz-create-main-layout">
        {/* Sidebar: Question List */}
        <aside className="quiz-create-question-list-nav quiz-create-scrollbar">
          {(reviewMode ? userAnswersData : questions).map((_, idx) => (
            <button
              key={idx}
              className={`quiz-create-question-list-item${activeQuestion === idx ? ' active' : ''}${answers[questions[idx]?.id] !== undefined ? ' answered' : ''}`}
              onClick={() => setActiveQuestion(idx)}
              tabIndex={0}
            >
              {idx + 1}
            </button>
          ))}
        </aside>

        {/* Main Content: Question Viewer */}
        <main className="quiz-create-main-content">
          <div className="quiz-create-section-header">Question {activeQuestion + 1}</div>
          <div className={`quiz-create-question-card fade-slide`}>
            <div className="quiz-create-question-card-top">
              <span className="quiz-create-question-label">Q{activeQuestion + 1}</span>
            </div>
            <div className="quiz-create-question-prompt-view">
              {reviewMode ? currentQuestion?.question_input : currentQuestion?.prompt}
            </div>
            
            {reviewMode ? (
              // Review mode - show user answers data
              <div className="quiz-create-options-list">
                {currentQuestion?.answers?.map((answer, oIdx) => {
                  console.log('Processing answer:', answer);
                  let optionClass = 'quiz-review-option';
                  if (answer.answer_status === 'Correct') {
                    optionClass += ' correct';
                  } else if (answer.answer_status === 'Incorrect') {
                    optionClass += ' incorrect';
                  }
                  console.log('Final class:', optionClass);
                  
                  return (
                    <button
                      key={oIdx}
                      className={optionClass}
                      disabled={true}
                      tabIndex={0}
                      type="button"
                      style={{
                        // Add inline styles as backup
                        ...(answer.answer_status === 'Correct' && {
                          border: '2px solid #4ecb7b',
                          background: 'linear-gradient(135deg, #4ecb7b 0%, #3dbb6b 100%)',
                          color: '#1a1a1a',
                          fontWeight: '700',
                          boxShadow: '0 4px 16px rgba(78, 203, 123, 0.4)'
                        }),
                        ...(answer.answer_status === 'Incorrect' && {
                          border: '2px solid #ff6b6b',
                          background: 'linear-gradient(135deg, #ff6b6b 0%, #ff5252 100%)',
                          color: '#1a1a1a',
                          fontWeight: '700',
                          boxShadow: '0 4px 16px rgba(255, 107, 107, 0.4)'
                        })
                      }}
                    >
                      {answer.answer_input}
                      {answer.answer_status === 'Correct' && (
                        <span style={{ marginLeft: 8, color: '#4ecb7b', fontWeight: 700 }}>(Correct)</span>
                      )}
                      {answer.answer_status === 'Incorrect' && (
                        <span style={{ marginLeft: 8, color: '#ff6b6b', fontWeight: 700 }}>(Your Answer)</span>
                      )}
                    </button>
                  );
                })}
              </div>
            ) : (
              // Test mode - show interactive questions
              currentQuestion?.question_type === 'MC' ? (
                <div className="quiz-create-options-list">
                  {currentQuestion.options.map((opt, oIdx) => {
                    let optionClass = 'quiz-review-option';
                    const selectedAnswerId = currentQuestion.answerIds[oIdx];
                    if (answers[currentQuestion.id] === selectedAnswerId) optionClass += ' selected';
                    
                    return (
                      <button
                        key={oIdx}
                        className={optionClass}
                        onClick={() => handleSelect(activeQuestion, oIdx)}
                        tabIndex={0}
                        type="button"
                      >
                        {opt}
                      </button>
                    );
                  })}
                </div>
              ) : (
                <textarea
                  className="quiz-create-question-prompt"
                  value={answers[currentQuestion.id] || ''}
                  onChange={e => handleWrittenChange(activeQuestion, e.target.value)}
                  placeholder="Type your answer…"
                  rows={3}
                  spellCheck={false}
                  style={{ marginTop: '1.2rem', width: '100%' }}
                />
              )
            )}
          </div>
        </main>
      </div>

      {/* Sticky Footer: Submit */}
      {!reviewMode && (
        <footer className="quiz-create-footer">
          <button
            className="quiz-create-save-btn"
            onClick={handleSubmit}
            disabled={Object.keys(answers).length !== questions.length || submitting}
          >
            {submitting ? 'Submitting...' : 'Submit Quiz'}
          </button>
        </footer>
      )}
    </div>
  );
};

export default QuizTakePage; 