import React, { useState, useEffect } from 'react';
import { FiPlus, FiTrash2, FiEdit2 } from 'react-icons/fi';
import './QuizView.css';

const QuizView = ({ quiz, onClose }) => {
    const [questions, setQuestions] = useState({});
    const [isLoading, setIsLoading] = useState(true);
    const [showNewQuestionModal, setShowNewQuestionModal] = useState(false);
    const [newQuestion, setNewQuestion] = useState({
        question_input: '',
        question_type: 'MC',
        answers: [
            { answer_input: '', is_correct: false }
        ]
    });
    const [editingQuestion, setEditingQuestion] = useState(null);
    const [notification, setNotification] = useState({ show: false, message: '' });

    const showNotification = (message) => {
        setNotification({ show: true, message });
        setTimeout(() => {
            setNotification({ show: false, message: '' });
        }, 3000);
    };

    const fetchQuizQuestions = async () => {
        try {
            console.log('Fetching questions for quiz:', quiz.id);
            const token = sessionStorage.getItem('jwt_token');
            
            // First get all questions for this quiz
            const questionsResponse = await fetch(`${import.meta.env.VITE_API_URL}test/quiz/question/${quiz.id}/`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!questionsResponse.ok) {
                console.error('Failed to fetch questions');
                return;
            }

            const questionsData = await questionsResponse.json();
            console.log('Questions data:', questionsData);

            // Transform the data and fetch answers for each question
            const transformedQuestions = {};
            
            // For each question in the quiz
            for (const [questionId, answers] of Object.entries(questionsData)) {
                // Get the question object to get its details
                const questionResponse = await fetch(`${import.meta.env.VITE_API_URL}test/quiz/question/`, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });

                if (!questionResponse.ok) {
                    console.error('Failed to fetch question details');
                    continue;
                }

                const allQuestions = await questionResponse.json();
                const question = allQuestions.find(q => q.id === parseInt(questionId));

                if (!question) {
                    console.error('Question not found:', questionId);
                    continue;
                }

                // Only add questions that have answers
                if (answers && answers.length > 0) {
                    transformedQuestions[question.question_input] = answers.map(answer => ({
                        id: answer.id,
                        answer_input: answer.answer_input,
                        is_correct: answer.is_correct,
                        question_type: question.question_type || 'MC'
                    }));
                }
            }

            console.log('Final transformed questions:', transformedQuestions);
            setQuestions(transformedQuestions);
        } catch (error) {
            console.error('Error fetching questions:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        console.log('QuizView mounted with quiz:', quiz); // Debug log
        if (quiz && quiz.id) {
            fetchQuizQuestions();
        }
    }, [quiz.id]);

    const handleAddAnswer = () => {
        setNewQuestion(prev => ({
            ...prev,
            answers: [...prev.answers, { answer_input: '', is_correct: false }]
        }));
    };

    const handleRemoveAnswer = (index) => {
        setNewQuestion(prev => ({
            ...prev,
            answers: prev.answers.filter((_, i) => i !== index)
        }));
    };

    const handleAnswerChange = (index, field, value) => {
        setNewQuestion(prev => ({
            ...prev,
            answers: prev.answers.map((answer, i) => 
                i === index ? { ...answer, [field]: value } : answer
            )
        }));
    };

    const handleCreateQuestion = async () => {
        try {
            // Validate question
            if (!newQuestion.question_input.trim()) {
                showNotification('Please enter a question');
                return;
            }

            // Validate answers
            if (newQuestion.answers.length === 0) {
                showNotification('Please add at least one answer');
                return;
            }

            if (newQuestion.answers.some(answer => !answer.answer_input.trim())) {
                showNotification('Please fill in all answers');
                return;
            }

            if (!newQuestion.answers.some(answer => answer.is_correct)) {
                showNotification('Please mark at least one answer as correct');
                return;
            }

            // Create the question
            const token = sessionStorage.getItem('jwt_token');
            const questionResponse = await fetch(`${import.meta.env.VITE_API_URL}test/quiz/question/`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    question_input: newQuestion.question_input,
                    question_type: newQuestion.question_type,
                    quiz_id: quiz.id
                })
            });

            if (!questionResponse.ok) {
                const errorText = await questionResponse.text();
                showNotification('Failed to create question: ' + errorText);
                return;
            }

            const questionData = await questionResponse.json();
            
            // Create answers
            const createdAnswers = [];
            for (const answer of newQuestion.answers) {
                const answerResponse = await fetch(`${import.meta.env.VITE_API_URL}test/quiz/answer/`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        answer_input: answer.answer_input,
                        answer_is_correct: answer.is_correct,
                        question_id: questionData.id,
                        quiz_id: quiz.id
                    })
                });

                if (!answerResponse.ok) {
                    const errorText = await answerResponse.text();
                    showNotification('Failed to create answer: ' + errorText);
                } else {
                    const answerData = await answerResponse.json();
                    createdAnswers.push(answerData);
                }
            }

            // Update questions state with the new question and answers
            setQuestions(prev => ({
                ...prev,
                [newQuestion.question_input]: createdAnswers
            }));

            // Reset form and close modal
            setNewQuestion({
                question_input: '',
                question_type: 'MC',
                answers: [{ answer_input: '', is_correct: false }]
            });
            setShowNewQuestionModal(false);
            showNotification('Question added successfully');
        } catch (error) {
            console.error('Error creating question:', error);
            showNotification('Error creating question: ' + error.message);
        }
    };

    const handleDeleteQuestion = async (questionInput) => {
        try {
            const token = sessionStorage.getItem('jwt_token');
            
            // First get all questions to find the correct question ID
            const questionsResponse = await fetch(`${import.meta.env.VITE_API_URL}test/quiz/question/`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!questionsResponse.ok) {
                showNotification('Failed to fetch questions');
                return;
            }

            const allQuestions = await questionsResponse.json();
            const question = allQuestions.find(q => q.question_input === questionInput);

            if (!question) {
                showNotification('Question not found');
                return;
            }

            const response = await fetch(`${import.meta.env.VITE_API_URL}test/quiz/question/${quiz.id}/${question.id}/`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const newQuestions = { ...questions };
                delete newQuestions[questionInput];
                setQuestions(newQuestions);
                showNotification('Question deleted successfully');
            } else {
                const errorText = await response.text();
                showNotification('Failed to delete question: ' + errorText);
            }
        } catch (error) {
            console.error('Error deleting question:', error);
            showNotification('Error deleting question');
        }
    };

    const handleDeleteAnswer = async (questionInput, answerId) => {
        try {
            const token = sessionStorage.getItem('jwt_token');
            const questionId = Object.keys(questions).indexOf(questionInput) + 1;
            const response = await fetch(`${import.meta.env.VITE_API_URL}test/quiz/answer/${quiz.id}/${questionId}/${answerId}/`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                setQuestions(prev => ({
                    ...prev,
                    [questionInput]: prev[questionInput].filter(answer => answer.id !== answerId)
                }));
                showNotification('Answer deleted successfully');
            } else {
                const errorText = await response.text();
                showNotification('Failed to delete answer: ' + errorText);
            }
        } catch (error) {
            console.error('Error deleting answer:', error);
            showNotification('Error deleting answer');
        }
    };

    return (
        <div className="quiz-view">
            <div className="quiz-header">
                <h2>{quiz.topic}</h2>
                <span className="quiz-subject">{quiz.subject}</span>
                <button className="close-btn" onClick={onClose}>×</button>
            </div>

            {notification.show && (
                <div className="notification">
                    {notification.message}
                </div>
            )}

            {isLoading ? (
                <div className="loading">Loading questions...</div>
            ) : (
                <div className="questions-list">
                    {console.log('Current questions state:', questions)} {/* Debug log */}
                    {Object.keys(questions).length === 0 ? (
                        <div className="empty-state">
                            <div className="empty-state-message">
                                <h3>This quiz is empty</h3>
                                <p>Add questions to get started</p>
                            </div>
                            <div className="empty-state-actions">
                                <button 
                                    className="add-question-btn"
                                    onClick={() => setShowNewQuestionModal(true)}
                                >
                                    <FiPlus /> Add Question
                                </button>
                            </div>
                        </div>
                    ) : (
                        <>
                            {Object.entries(questions).map(([questionInput, answers]) => {
                                console.log('Rendering question:', { questionInput, answers }); // Debug log
                                
                                if (!answers || !Array.isArray(answers) || answers.length === 0) {
                                    console.log('Skipping invalid question:', questionInput); // Debug log
                                    return null;
                                }

                                const questionType = answers[0]?.question_type || 'MC';
                                
                                return (
                                    <div key={questionInput} className="question-item">
                                        <div className="question-header">
                                            <h3>{questionInput}</h3>
                                            <div className="question-actions">
                                                <button 
                                                    className="delete-question-btn"
                                                    onClick={() => handleDeleteQuestion(questionInput)}
                                                >
                                                    <FiTrash2 /> Delete Question
                                                </button>
                                            </div>
                                        </div>
                                        
                                        <div className="answers-list">
                                            {questionType === 'WR' ? (
                                                <div className="written-answer-box">
                                                    <textarea
                                                        placeholder="Enter your answer here..."
                                                        className="answer-input"
                                                        rows={3}
                                                    />
                                                </div>
                                            ) : (
                                                answers.map(answer => (
                                                    <div key={answer.id} className="answer-item">
                                                        <span className={`answer-text ${answer.is_correct ? 'correct' : ''}`}>
                                                            {answer.answer_input}
                                                        </span>
                                                        <button 
                                                            className="delete-btn"
                                                            onClick={() => handleDeleteAnswer(questionInput, answer.id)}
                                                        >
                                                            <FiTrash2 />
                                                        </button>
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                            <div className="add-question-section">
                                <button 
                                    className="add-question-btn"
                                    onClick={() => setShowNewQuestionModal(true)}
                                >
                                    <FiPlus /> Add Question
                                </button>
                            </div>
                        </>
                    )}
                </div>
            )}

            {showNewQuestionModal && (
                <div className="modal-overlay show">
                    <div className="modal-content question-modal">
                        <h3>Create New Question</h3>
                        <div className="question-form">
                            {/* Question Input */}
                            <div className="form-group">
                                <label>Question</label>
                                <textarea
                                    value={newQuestion.question_input}
                                    onChange={(e) => setNewQuestion(prev => ({ ...prev, question_input: e.target.value }))}
                                    placeholder="Enter your question"
                                    rows={3}
                                    className="question-input"
                                />
                            </div>

                            {/* Question Type Selection */}
                            <div className="form-group">
                                <label>Question Type</label>
                                <div className="question-type-options">
                                    <label className="radio-option">
                                        <input
                                            type="radio"
                                            value="MC"
                                            checked={newQuestion.question_type === 'MC'}
                                            onChange={(e) => {
                                                setNewQuestion(prev => ({
                                                    ...prev,
                                                    question_type: e.target.value,
                                                    answers: e.target.value === 'MC' ? 
                                                        [{ answer_input: '', is_correct: false }] : 
                                                        [{ answer_input: '', is_correct: true }]
                                                }));
                                            }}
                                        />
                                        <span>Multiple Choice</span>
                                    </label>
                                    <label className="radio-option">
                                        <input
                                            type="radio"
                                            value="WR"
                                            checked={newQuestion.question_type === 'WR'}
                                            onChange={(e) => {
                                                setNewQuestion(prev => ({
                                                    ...prev,
                                                    question_type: e.target.value,
                                                    answers: [{ answer_input: '', is_correct: true }]
                                                }));
                                            }}
                                        />
                                        <span>Written</span>
                                    </label>
                                </div>
                            </div>

                            {/* Answers Section */}
                            <div className="answers-section">
                                <label>Answers</label>
                                {newQuestion.question_type === 'MC' ? (
                                    // Multiple Choice Answers
                                    <div className="mc-answers">
                                        {newQuestion.answers.map((answer, index) => (
                                            <div key={index} className="answer-row">
                                                <input
                                                    type="radio"
                                                    name="correct-answer"
                                                    checked={answer.is_correct}
                                                    onChange={() => {
                                                        setNewQuestion(prev => ({
                                                            ...prev,
                                                            answers: prev.answers.map((a, i) => ({
                                                                ...a,
                                                                is_correct: i === index
                                                            }))
                                                        }));
                                                    }}
                                                    className="correct-answer-radio"
                                                />
                                                <input
                                                    type="text"
                                                    value={answer.answer_input}
                                                    onChange={(e) => handleAnswerChange(index, 'answer_input', e.target.value)}
                                                    placeholder={`Answer ${index + 1}`}
                                                    className="answer-input"
                                                />
                                                {newQuestion.answers.length > 1 && (
                                                    <button
                                                        className="remove-answer-btn"
                                                        onClick={() => handleRemoveAnswer(index)}
                                                    >
                                                        ×
                                                    </button>
                                                )}
                                            </div>
                                        ))}
                                        <button
                                            className="add-answer-btn"
                                            onClick={handleAddAnswer}
                                        >
                                            + Add Answer
                                        </button>
                                    </div>
                                ) : (
                                    // Written Answer
                                    <div className="written-answer">
                                        <textarea
                                            value={newQuestion.answers[0].answer_input}
                                            onChange={(e) => handleAnswerChange(0, 'answer_input', e.target.value)}
                                            placeholder="Enter the correct answer"
                                            rows={3}
                                            className="answer-input"
                                        />
                                    </div>
                                )}
                            </div>

                            <div className="modal-actions">
                                <button 
                                    className="create-btn" 
                                    onClick={handleCreateQuestion}
                                >
                                    Create Question
                                </button>
                                <button 
                                    className="cancel-btn" 
                                    onClick={() => setShowNewQuestionModal(false)}
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default QuizView; 