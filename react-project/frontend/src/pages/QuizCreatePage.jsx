import React, { useState, useRef } from 'react';
import { FiPlusCircle, FiTrash2, FiCheckCircle, FiEye, FiArrowLeft, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import api from '../api/axios';
import { useAuth } from '../auth/AuthContext';
import './QuizTakePage.css';

const initialQuestion = () => ({
    prompt: '',
    options: ['', '', ''],
    correct: 0,
    image: null,
    question_type: 'MC',
});

const QuizCreatePage = () => {
    const { user } = useAuth();
    const [title, setTitle] = useState('');
    const [editingTitle, setEditingTitle] = useState(false);
    const titleInputRef = useRef(null);
    const [questions, setQuestions] = useState([initialQuestion()]);
    const [activeQuestion, setActiveQuestion] = useState(0);
    const [saving, setSaving] = useState(false);
    const [showSaved, setShowSaved] = useState(false);
    const [saveError, setSaveError] = useState(null);
    const [previewMode, setPreviewMode] = useState(false);
    const [questionTypeDropdown, setQuestionTypeDropdown] = useState(false);

    // Progress indicator
    const progress = `${activeQuestion + 1}/${questions.length}`;

    // Question logic
    const handleTitleChange = (e) => setTitle(e.target.value);
    const handleTitleBlur = () => setEditingTitle(false);
    const handleTitleKeyDown = (e) => {
        if (e.key === 'Enter') setEditingTitle(false);
    };
    const handleTitleClick = () => {
        setEditingTitle(true);
        setTimeout(() => {
            if (titleInputRef.current) titleInputRef.current.focus();
        }, 0);
    };
    const handleQuestionPromptChange = (idx, value) => {
        setQuestions(qs => qs.map((q, i) => i === idx ? { ...q, prompt: value } : q));
    };
    const handleOptionChange = (qIdx, oIdx, value) => {
        setQuestions(qs => qs.map((q, i) => i === qIdx ? {
            ...q,
            options: q.options.map((opt, j) => j === oIdx ? value : opt)
        } : q));
    };
    const handleAddOption = (qIdx) => {
        setQuestions(qs => qs.map((q, i) => i === qIdx ? {
            ...q,
            options: [...q.options, '']
        } : q));
    };
    const handleRemoveOption = (qIdx, oIdx) => {
        setQuestions(qs => qs.map((q, i) => i === qIdx ? {
            ...q,
            options: q.options.filter((_, j) => j !== oIdx),
            correct: q.correct >= oIdx ? Math.max(0, q.correct - 1) : q.correct
        } : q));
    };
    const handleSetCorrect = (qIdx, oIdx) => {
        setQuestions(qs => qs.map((q, i) => i === qIdx ? { ...q, correct: oIdx } : q));
    };
    const handleAddQuestion = () => {
        setQuestions(qs => [...qs, initialQuestion()]);
        setActiveQuestion(questions.length);
    };
    const handleRemoveQuestion = (idx) => {
        const newQuestions = questions.filter((_, i) => i !== idx);
        setQuestions(newQuestions);
        setActiveQuestion(Math.max(0, idx - 1));
    };
    const handleQuestionTypeChange = (idx, value) => {
        setQuestions(qs => qs.map((q, i) => i === idx ? { ...q, question_type: value } : q));
    };

    // Save logic
    const handleSaveQuiz = async () => {
        setSaving(true);
        setSaveError(null);
        try {
            const transformedQuestions = questions.map(q => ({
                question_input: q.prompt,
                question_type: q.question_type,
                answers: q.question_type === 'MC' ? q.options.map((opt, idx) => ({
                    answer_input: opt,
                    is_correct: q.correct === idx
                })) : []
            }));
            await api.post('/test/quiz/', {
                topic: title || 'Untitled Quiz',
                questions: transformedQuestions
            });
            setShowSaved(true);
            setTimeout(() => setShowSaved(false), 1200);
        } catch (err) {
            setSaveError('Failed to save quiz. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    const handlePreview = () => setPreviewMode(!previewMode);
    const handleBack = () => window.history.back();
    const handlePreviousQuestion = () => {
        if (activeQuestion > 0) setActiveQuestion(activeQuestion - 1);
    };
    const handleNextQuestion = () => {
        if (activeQuestion < questions.length - 1) setActiveQuestion(activeQuestion + 1);
    };

    const currentQuestion = questions[activeQuestion];

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
                    {editingTitle ? (
                        <input
                            ref={titleInputRef}
                            className="quiz-take-navbar-title-input"
                            type="text"
                            value={title}
                            onChange={handleTitleChange}
                            onBlur={handleTitleBlur}
                            onKeyDown={handleTitleKeyDown}
                            maxLength={40}
                            autoFocus
                            style={{
                                background: 'transparent',
                                border: 'none',
                                outline: 'none',
                                color: '#f5f5f5',
                                fontSize: '1.3rem',
                                fontWeight: '600',
                                textAlign: 'center',
                                width: '100%'
                            }}
                        />
                    ) : (
                        <div
                            className="quiz-take-navbar-title editable"
                            tabIndex={0}
                            onClick={handleTitleClick}
                            onKeyDown={e => { if (e.key === 'Enter') handleTitleClick(); }}
                            title="Click to edit quiz name"
                        >
                            {title || 'Untitled Quiz'}
                        </div>
                    )}
                </div>
                <div className="quiz-take-navbar-right">
                    <span className="quiz-take-questions-left">{progress}</span>
                </div>
            </nav>

            {/* Main Content */}
            <div className="quiz-take-main" style={{ paddingBottom: '100px' }}>
                <div className="quiz-take-question-card">
                    <div className="quiz-take-question-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span>Question {activeQuestion + 1}</span>
                        <div style={{ position: 'relative' }}>
                            <button 
                                style={{ 
                                    background: 'rgba(191,196,204,0.1)', 
                                    border: '1px solid rgba(191,196,204,0.2)', 
                                    color: '#bfc4cc', 
                                    width: '32px',
                                    height: '32px',
                                    borderRadius: '50%',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '0.8rem',
                                    fontWeight: '600',
                                    transition: 'all 0.2s ease'
                                }}
                                onClick={() => setQuestionTypeDropdown(prev => !prev)}
                            >
                                {currentQuestion.question_type}
                            </button>
                            {questionTypeDropdown && (
                                <div style={{
                                    position: 'absolute',
                                    top: '100%',
                                    right: 0,
                                    background: 'rgba(30,32,36,0.95)',
                                    border: '1px solid rgba(191,196,204,0.2)',
                                    borderRadius: '8px',
                                    padding: '8px 0',
                                    marginTop: '4px',
                                    zIndex: 10,
                                    minWidth: '140px',
                                    boxShadow: '0 4px 20px rgba(0,0,0,0.3)'
                                }}>
                                    <button 
                                        style={{
                                            background: 'none',
                                            border: 'none',
                                            color: '#bfc4cc',
                                            padding: '8px 16px',
                                            width: '100%',
                                            textAlign: 'left',
                                            cursor: 'pointer',
                                            fontSize: '0.9rem',
                                            transition: 'background 0.2s ease'
                                        }}
                                        onClick={() => {
                                            handleQuestionTypeChange(activeQuestion, 'MC');
                                            setQuestionTypeDropdown(false);
                                        }}
                                        onMouseEnter={(e) => e.target.style.background = 'rgba(191,196,204,0.1)'}
                                        onMouseLeave={(e) => e.target.style.background = 'none'}
                                    >
                                        Multiple Choice
                                    </button>
                                    <button 
                                        style={{
                                            background: 'none',
                                            border: 'none',
                                            color: '#bfc4cc',
                                            padding: '8px 16px',
                                            width: '100%',
                                            textAlign: 'left',
                                            cursor: 'pointer',
                                            fontSize: '0.9rem',
                                            transition: 'background 0.2s ease'
                                        }}
                                        onClick={() => {
                                            handleQuestionTypeChange(activeQuestion, 'WR');
                                            setQuestionTypeDropdown(false);
                                        }}
                                        onMouseEnter={(e) => e.target.style.background = 'rgba(191,196,204,0.1)'}
                                        onMouseLeave={(e) => e.target.style.background = 'none'}
                                    >
                                        Written
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                    <textarea
                        className="quiz-take-question-prompt"
                        value={currentQuestion.prompt}
                        onChange={e => handleQuestionPromptChange(activeQuestion, e.target.value)}
                        placeholder="Type your question prompt…"
                        rows={2}
                        spellCheck={false}
                        style={{ 
                            outline: 'none', 
                            border: 'none', 
                            background: 'transparent',
                            resize: 'none'
                        }}
                    />
                    {currentQuestion.question_type === 'MC' && (
                        <div className="quiz-take-options-list">
                            {currentQuestion.options.map((opt, oIdx) => (
                                <div key={oIdx} className={`quiz-take-option${currentQuestion.correct === oIdx ? ' selected' : ''}`}
                                    onClick={() => handleSetCorrect(activeQuestion, oIdx)}
                                    style={{ display: 'flex', alignItems: 'center', gap: 8 }}
                                >
                                    <input
                                        type="text"
                                        value={opt}
                                        onChange={e => handleOptionChange(activeQuestion, oIdx, e.target.value)}
                                        placeholder={`Option ${String.fromCharCode(65 + oIdx)}`}
                                        spellCheck={false}
                                        style={{ 
                                            flex: 1, 
                                            background: 'transparent', 
                                            border: 'none', 
                                            color: 'inherit', 
                                            fontSize: '1.1rem',
                                            outline: 'none'
                                        }}
                                    />
                                    {currentQuestion.correct === oIdx && (
                                        <FiCheckCircle style={{ color: '#5fffd7', marginLeft: 4 }} />
                                    )}
                                    {currentQuestion.options.length > 2 && (
                                        <button style={{ 
                                            background: 'none', 
                                            border: 'none', 
                                            color: '#bfc4cc', 
                                            cursor: 'pointer',
                                            padding: '4px',
                                            borderRadius: '4px',
                                            marginLeft: 4 
                                        }} onClick={e => { e.stopPropagation(); handleRemoveOption(activeQuestion, oIdx); }}>
                                            <FiTrash2 />
                                        </button>
                                    )}
                                </div>
                            ))}
                            <button style={{ 
                                background: 'rgba(191,196,204,0.1)', 
                                border: '1px solid rgba(191,196,204,0.2)', 
                                color: '#bfc4cc', 
                                padding: '12px 16px',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                fontSize: '1rem',
                                transition: 'all 0.2s ease'
                            }} onClick={() => handleAddOption(activeQuestion)}>
                                <FiPlusCircle /> Add Option
                            </button>
                        </div>
                    )}
                </div>
                <button style={{ 
                    background: 'rgba(191,196,204,0.1)', 
                    border: '1px solid rgba(191,196,204,0.2)', 
                    color: '#bfc4cc', 
                    padding: '12px 16px',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    fontSize: '1rem',
                    marginTop: 24,
                    transition: 'all 0.2s ease'
                }} onClick={handleAddQuestion}>
                    <FiPlusCircle /> Add Question
                </button>
            </div>

            {/* Save/Preview Footer */}
            <footer style={{ 
                position: 'fixed', 
                bottom: 0, 
                left: 0, 
                width: '100vw', 
                zIndex: 20, 
                background: 'rgba(30,32,36,0.95)', 
                backdropFilter: 'blur(15px)',
                borderTop: '1px solid rgba(191,196,204,0.1)',
                padding: '1rem 2rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                    <span style={{ color: '#bfc4cc', fontWeight: 500 }}>📝 {questions.length} Questions</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <button className="quiz-take-navbar-back-btn" onClick={handleSaveQuiz} disabled={saving}>
                        {saving ? 'Saving…' : 'Save Draft'}
                    </button>
                    <button className="quiz-take-navbar-back-btn" onClick={handlePreview}>
                        <FiEye /> Preview
                    </button>
                </div>
                {showSaved && <div style={{ color: '#5fffd7', marginLeft: 16 }}>✔ Quiz Saved!</div>}
                {saveError && <div style={{ color: '#e05a5a', marginLeft: 16 }}>{saveError}</div>}
            </footer>

            {/* Preview Modal (placeholder) */}
            {previewMode && (
                <div className="quiz-create-preview-modal">
                    <div className="quiz-create-preview-content">
                        <button className="quiz-create-preview-close" onClick={handlePreview}>×</button>
                        <h2>Quiz Preview (Coming Soon)</h2>
                        <p>This will show a test version of your quiz in dark mode.</p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default QuizCreatePage; 