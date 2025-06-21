import React, { useState, useRef } from 'react';
import { FiPlusCircle, FiTrash2, FiCheckCircle, FiEye, FiImage, FiArrowLeft } from 'react-icons/fi';
import api from '../api/axios';
import { useAuth } from '../auth/AuthContext';
import './QuizCreatePage.css';

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
    const [description, setDescription] = useState('');
    const [tags, setTags] = useState([]);
    const [tagInput, setTagInput] = useState('');
    const [questions, setQuestions] = useState([initialQuestion()]);
    const [activeQuestion, setActiveQuestion] = useState(0);
    const [saving, setSaving] = useState(false);
    const [showSaved, setShowSaved] = useState(false);
    const [saveError, setSaveError] = useState(null);
    const [previewMode, setPreviewMode] = useState(false);

    // Progress indicator
    const progress = `${activeQuestion + 1}/${questions.length}`;

    // Tag logic
    const handleTagInput = (e) => setTagInput(e.target.value);
    const handleTagKeyDown = (e) => {
        if ((e.key === 'Enter' || e.key === ',') && tagInput.trim()) {
            e.preventDefault();
            if (!tags.includes(tagInput.trim())) {
                setTags([...tags, tagInput.trim()]);
            }
            setTagInput('');
        } else if (e.key === 'Backspace' && !tagInput && tags.length) {
            setTags(tags.slice(0, -1));
        }
    };
    const removeTag = (idx) => setTags(tags.filter((_, i) => i !== idx));

    // Question logic
    const handleTitleChange = (e) => setTitle(e.target.value);
    const handleTitleBlur = () => setEditingTitle(false);
    const handleTitleKeyDown = (e) => {
        if (e.key === 'Enter') {
            setEditingTitle(false);
        }
    };
    const handleTitleClick = () => {
        setEditingTitle(true);
        setTimeout(() => {
            if (titleInputRef.current) titleInputRef.current.focus();
        }, 0);
    };
    const handleDescriptionChange = (e) => setDescription(e.target.value);
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
            // Transform questions data to match backend format
            const transformedQuestions = questions.map(q => ({
                question_input: q.prompt,
                question_type: q.question_type,
                answers: q.question_type === 'MC' ? q.options.map((opt, idx) => ({
                    answer_input: opt,
                    is_correct: q.correct === idx
                })) : []
            }));

            // Send bulk request to create quiz with all questions and answers
            const response = await api.post('/test/quiz/', {
                topic: title || 'Untitled Quiz',
                subject: description || '',
                questions: transformedQuestions
            });

            console.log('Quiz created successfully:', response.data);
            setShowSaved(true);
            setTimeout(() => setShowSaved(false), 1200);
        } catch (err) {
            console.error('Error saving quiz:', err);
            setSaveError('Failed to save quiz. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    const handlePreview = () => setPreviewMode(!previewMode);
    const handleBack = () => window.history.back();

    return (
        <div className="quiz-create-bg quiz-create-scrollbar">
            {/* Navbar with editable title and fixed center progress */}
            <nav className="quiz-create-navbar">
                <div className="quiz-create-navbar-left">
                    {editingTitle ? (
                        <input
                            ref={titleInputRef}
                            className="quiz-create-navbar-title-input"
                            type="text"
                            value={title}
                            onChange={handleTitleChange}
                            onBlur={handleTitleBlur}
                            onKeyDown={handleTitleKeyDown}
                            maxLength={40}
                            autoFocus
                        />
                    ) : (
                        <div
                            className="quiz-create-navbar-title-static editable"
                            tabIndex={0}
                            onClick={handleTitleClick}
                            onKeyDown={e => { if (e.key === 'Enter') handleTitleClick(); }}
                            title="Click to edit quiz name"
                        >
                            {title || 'Untitled Quiz'}
                        </div>
                    )}
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
                    {questions.map((_, idx) => (
                        <button
                            key={idx}
                            className={`quiz-create-question-list-item${activeQuestion === idx ? ' active' : ''}`}
                            onClick={() => setActiveQuestion(idx)}
                            tabIndex={0}
                        >
                            {idx + 1}
                        </button>
                    ))}
                </aside>

                {/* Main Content: Question Editor */}
                <main className="quiz-create-main-content">
                    <div className="quiz-create-section-header">Question {activeQuestion + 1}</div>
                    <div className={`quiz-create-question-card fade-slide`}>
                        <div className="quiz-create-question-card-top">
                            <span className="quiz-create-question-label">Q{activeQuestion + 1}</span>
                            <div className="quiz-create-question-actions">
                                <span className="quiz-create-tooltip">
                                    <FiImage className="quiz-create-tool-icon" />
                                    <span className="quiz-create-tooltip-text">Add image (coming soon)</span>
                                </span>
                                {questions.length > 1 && (
                                    <span className="quiz-create-tooltip">
                                        <button className="quiz-create-tool-icon-btn" onClick={e => { e.stopPropagation(); handleRemoveQuestion(activeQuestion); }}>
                                            <FiTrash2 className="quiz-create-tool-icon" />
                                        </button>
                                        <span className="quiz-create-tooltip-text">Delete question</span>
                                    </span>
                                )}
                            </div>
                        </div>
                        <div className="quiz-create-question-type-row">
                            <label className="quiz-create-question-type-label">Type:</label>
                            <select
                                className="quiz-create-question-type-select"
                                value={questions[activeQuestion].question_type}
                                onChange={e => handleQuestionTypeChange(activeQuestion, e.target.value)}
                            >
                                <option value="MC">Multiple Choice</option>
                                <option value="WR">Written</option>
                            </select>
                        </div>
                        <textarea
                            className="quiz-create-question-prompt"
                            value={questions[activeQuestion].prompt}
                            onChange={e => handleQuestionPromptChange(activeQuestion, e.target.value)}
                            placeholder="Type your question prompt…"
                            rows={2}
                            spellCheck={false}
                        />
                        {questions[activeQuestion].question_type === 'MC' && (
                            <div className="quiz-create-options-list">
                                {questions[activeQuestion].options.map((opt, oIdx) => (
                                    <div key={oIdx} className={`quiz-create-option-line${questions[activeQuestion].correct === oIdx ? ' selected' : ''}`}
                                        onClick={() => handleSetCorrect(activeQuestion, oIdx)}
                                    >
                                        <input
                                            className="quiz-create-option-input"
                                            type="text"
                                            value={opt}
                                            onChange={e => handleOptionChange(activeQuestion, oIdx, e.target.value)}
                                            placeholder={`Option ${String.fromCharCode(65 + oIdx)}`}
                                            spellCheck={false}
                                        />
                                        {questions[activeQuestion].correct === oIdx && (
                                            <FiCheckCircle className="quiz-create-option-correct-icon" />
                                        )}
                                        {questions[activeQuestion].options.length > 2 && (
                                            <button className="quiz-create-tool-icon-btn" onClick={e => { e.stopPropagation(); handleRemoveOption(activeQuestion, oIdx); }}>
                                                <FiTrash2 className="quiz-create-tool-icon" />
                                            </button>
                                        )}
                                    </div>
                                ))}
                                <button className="quiz-create-add-option" onClick={() => handleAddOption(activeQuestion)}>
                                    <FiPlusCircle className="quiz-create-plus-icon" /> Add Option
                                </button>
                            </div>
                        )}
                    </div>
                    <button className="quiz-create-add-question-btn" onClick={handleAddQuestion}>
                        <FiPlusCircle className="quiz-create-plus-icon" /> Add Question
                    </button>
                </main>
            </div>

            {/* Save/Preview Footer */}
            <footer className="quiz-create-footer">
                <div className="quiz-create-footer-left">
                    <span className="quiz-create-footer-count">📝 {questions.length} Questions</span>
                </div>
                <div className="quiz-create-footer-right">
                    <button className="quiz-create-save-btn" onClick={handleSaveQuiz} disabled={saving}>
                        {saving ? 'Saving…' : 'Save Draft'}
                    </button>
                    <button className="quiz-create-preview-btn" onClick={handlePreview}>
                        <FiEye /> Preview
                    </button>
                </div>
                {showSaved && <div className="quiz-create-saved-feedback">✔ Quiz Saved!</div>}
                {saveError && <div className="quiz-create-saved-feedback" style={{background:'#e05a5a', color:'#fff'}}>{saveError}</div>}
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