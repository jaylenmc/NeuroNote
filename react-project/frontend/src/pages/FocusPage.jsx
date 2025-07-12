import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiCheck, FiX, FiPlus, FiClock, FiEdit3 } from 'react-icons/fi';
import './FocusPage.css';

const MOTIVATION_QUOTES = [
    "Small steps every day lead to big results.",
    "Stay focused and never give up!",
    "Progress, not perfection.",
    "You are capable of amazing things.",
    "Discipline is the bridge between goals and accomplishment."
];

const FocusPage = () => {
    const navigate = useNavigate();
    // Daily Intentions
    const [dailyIntention, setDailyIntention] = useState('');
    const [isIntentionStamped, setIsIntentionStamped] = useState(false);
    const [isEditingIntention, setIsEditingIntention] = useState(false);
    // Tasks/To-Do List
    const [tasks, setTasks] = useState([]);
    const [newTaskTitle, setNewTaskTitle] = useState('');
    const [newTaskTags, setNewTaskTags] = useState([]);
    const [tagInput, setTagInput] = useState('');
    const [newTaskTime, setNewTaskTime] = useState('');
    const [showCompleted, setShowCompleted] = useState(false);
    // Distraction Journal
    const [distractionNotes, setDistractionNotes] = useState('');
    const [distractionHistory, setDistractionHistory] = useState([]);
    // Focus Stats
    const [focusStats, setFocusStats] = useState({
        totalFocusTime: 0,
        tasksCompleted: 0,
        focusStreak: 7,
        todayTasks: 3,
        breakTime: 0
    });
    // Focus Mode Lock
    const [isFocusMode, setIsFocusMode] = useState(false);
    // Task groups
    const todayTasks = tasks.filter(task => !task.completed);
    const completedTasks = tasks.filter(task => task.completed);
    // Progress
    const percentComplete = tasks.length > 0 ? Math.round((completedTasks.length / tasks.length) * 100) : 0;
    // Tag logic (same as before)
    const [tagColor, setTagColor] = useState('#7c83fd');
    const [tagColors, setTagColors] = useState({});
    const handleTagInputChange = (e) => setTagInput(e.target.value);
    const handleTagInputKeyDown = (e) => {
        if (e.key === 'Enter' || e.key === ',' || e.key === ' ') {
            e.preventDefault();
            const value = tagInput.trim().replace(/,$/, '');
            if (value && !newTaskTags.includes(value)) {
                setNewTaskTags([...newTaskTags, value]);
                setTagColors({ ...tagColors, [value]: tagColor });
            }
            setTagInput('');
        } else if (e.key === 'Backspace' && tagInput === '' && newTaskTags.length > 0) {
            setNewTaskTags(newTaskTags.slice(0, -1));
        }
    };
    const handleRemoveTag = (tag) => {
        setNewTaskTags(newTaskTags.filter(t => t !== tag));
        const newColors = { ...tagColors };
        delete newColors[tag];
        setTagColors(newColors);
    };
    const getTagColor = (tag) => {
        const lower = tag.toLowerCase();
        if (lower === 'study') return '#7c83fd';
        if (lower === 'break') return '#22c55e';
        if (lower === 'exercise') return '#fbbf24';
        if (lower === 'other') return '#ef4444';
        let hash = 0; for (let i = 0; i < tag.length; i++) hash = tag.charCodeAt(i) + ((hash << 5) - hash);
        const h = hash % 360; return `hsl(${h}, 70%, 80%)`;
    };
    // Handlers (same as before)
    const handleAddTask = () => {
        if (newTaskTitle.trim()) {
            const newTask = {
                id: Date.now(),
                title: newTaskTitle,
                tags: newTaskTags,
                completed: false,
                dueTime: newTaskTime || null
            };
            setTasks([...tasks, newTask]);
            setNewTaskTitle('');
            setNewTaskTags([]);
            setTagInput('');
            setNewTaskTime('');
        }
    };
    const handleToggleTask = (taskId) => setTasks(tasks.map(task => task.id === taskId ? { ...task, completed: !task.completed } : task));
    const handleDeleteTask = (taskId) => setTasks(tasks.filter(task => task.id !== taskId));
    const handleSaveDistraction = () => {
        if (distractionNotes.trim()) {
            const newDistraction = {
                id: Date.now(),
                text: distractionNotes,
                timestamp: new Date().toLocaleTimeString(),
                label: 'General'
            };
            setDistractionHistory([newDistraction, ...distractionHistory]);
            setDistractionNotes('');
        }
    };
    // Goal card logic
    const randomQuote = MOTIVATION_QUOTES[Math.floor(Math.random() * MOTIVATION_QUOTES.length)];
    // Layout
    return (
        <div className={`focus-page ${isFocusMode ? 'focus-mode' : ''}`}>
            <div className="focus-header">
                <button className="back-button" onClick={() => navigate('/study-room')}>
                    <FiArrowLeft /> Back to Study Room
                </button>
                <button className="focus-mode-toggle" onClick={() => setIsFocusMode(!isFocusMode)}>
                    {isFocusMode ? 'Exit Focus Mode' : 'Enter Focus Mode'}
                </button>
            </div>
            <div className="focus-space-header">
                <h1 className="focus-space-title">🌱 Focus Space</h1>
                <div className="focus-space-desc">Set your intention, track your tasks, and stay distraction-free.</div>
            </div>
            {/* Horizontal stats card under header */}
            <section className="stats-card horizontal">
                <div className="stats-widgets horizontal">
                    <div className="stat-widget">
                        <div className="stat-label">⏰ Focus Time</div>
                        <div className="stat-value">{focusStats.totalFocusTime}h</div>
                    </div>
                    <div className="stat-widget">
                        <div className="stat-label">🎯 Tasks Completed</div>
                        <div className="stat-value">{focusStats.tasksCompleted}</div>
                    </div>
                    <div className="stat-widget">
                        <div className="stat-label">🔥 Day Streak</div>
                        <div className="stat-value">{focusStats.focusStreak}</div>
                    </div>
                    <div className="stat-widget">
                        <div className="stat-label">☕️ Break Time</div>
                        <div className="stat-value">{focusStats.breakTime}m</div>
                    </div>
                </div>
            </section>
            <div className="focus-main-2col-grid">
                {/* Left column: Goal + Tasks */}
                <div className="focus-main-left">
                    {/* Goal Card */}
                    <section className="goal-card">
                        <h3 className="goal-heading">What’s your main goal today?</h3>
                        {!isIntentionStamped ? (
                            <form className="goal-stamp-form" onSubmit={e => { e.preventDefault(); if (dailyIntention.trim()) { setIsIntentionStamped(true); setIsEditingIntention(false); } }}>
                                <textarea
                                    className={`goal-textarea${dailyIntention ? '' : ' empty'}`}
                                    value={dailyIntention}
                                    onChange={e => setDailyIntention(e.target.value)}
                                    placeholder="Type your main focus for today..."
                                    rows={2}
                                />
                                <button type="submit" className="goal-stamp-btn">Stamp It</button>
                                {!dailyIntention && <div className="goal-quote">{randomQuote}</div>}
                            </form>
                        ) : (
                            <div className="stamped-goal-card">
                                <div className="stamped-goal-content">
                                    <span className="stamp-icon">🏷️</span>
                                    <span className="stamped-goal-text">{dailyIntention}</span>
                                    <button className="goal-edit-btn" onClick={() => setIsEditingIntention(true)}><FiEdit3 /></button>
                                </div>
                                <div className="stamped-goal-timestamp">
                                    Stamped on {new Date().toLocaleDateString()} at {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </div>
                            </div>
                        )}
                        {/* Inline edit for stamped goal */}
                        {isIntentionStamped && isEditingIntention && (
                            <form className="goal-stamp-form" onSubmit={e => { e.preventDefault(); if (dailyIntention.trim()) setIsEditingIntention(false); }}>
                                <textarea
                                    className="goal-textarea"
                                    value={dailyIntention}
                                    onChange={e => setDailyIntention(e.target.value)}
                                    rows={2}
                                    autoFocus
                                />
                                <div className="goal-edit-actions">
                                    <button type="submit" className="goal-stamp-btn"><FiCheck /></button>
                                    <button type="button" className="goal-cancel-btn" onClick={() => setIsEditingIntention(false)}><FiX /></button>
                                </div>
                            </form>
                        )}
                    </section>
                    {/* Tasks Card */}
                    <section className="tasks-card">
                        <div className="tasks-progress-label">Task Completion</div>
                        <div className="tasks-progress-bar">
                            <div className="tasks-progress-fill" style={{ width: percentComplete + '%' }}></div>
                        </div>
                        <div className="section-header">
                            <h3>✅ Daily Tasks</h3>
                            <button className="show-completed-toggle" onClick={() => setShowCompleted(!showCompleted)}>
                                {showCompleted ? 'Hide' : 'Show'} Completed
                            </button>
                        </div>
                        {/* Add new task */}
                        <div className="add-task-form modern-task-form">
                            <input
                                type="text"
                                value={newTaskTitle}
                                onChange={(e) => setNewTaskTitle(e.target.value)}
                                placeholder="Add a new task..."
                                className="task-input"
                            />
                            <div className="task-input-row">
                                <div className="tag-input-group">
                                    <div className="tags-list">
                                        {newTaskTags.map(tag => (
                                            <span
                                                key={tag}
                                                className="tag-pill"
                                                style={{ background: tagColors[tag] || getTagColor(tag), color: '#23242b' }}
                                            >
                                                {tag}
                                                <button type="button" className="remove-tag-btn" onClick={() => handleRemoveTag(tag)}>
                                                    ×
                                                </button>
                                            </span>
                                        ))}
                                        <input
                                            type="text"
                                            className="tag-input"
                                            value={tagInput}
                                            onChange={handleTagInputChange}
                                            onKeyDown={handleTagInputKeyDown}
                                            placeholder={newTaskTags.length === 0 ? 'Add tag...' : ''}
                                        />
                                        <input
                                            type="color"
                                            value={tagColor}
                                            onChange={e => setTagColor(e.target.value)}
                                            style={{ width: 28, height: 28, border: 'none', background: 'none', marginLeft: 6, cursor: 'pointer' }}
                                            title="Pick tag color"
                                        />
                                    </div>
                                </div>
                                <div className="time-input-group">
                                    <div className="time-input-wrapper" style={{ position: 'relative' }}>
                                        <label style={{ width: '100%', display: 'flex', alignItems: 'center', position: 'relative' }}>
                                            <input
                                                type="time"
                                                value={newTaskTime}
                                                onChange={e => setNewTaskTime(e.target.value)}
                                                className="task-time-input modern"
                                                style={{ width: '100%' }}
                                            />
                                            <span className="time-input-icon" style={{ cursor: 'pointer', pointerEvents: 'auto', position: 'absolute', right: '0.8rem', top: '50%', transform: 'translateY(-50%)', color: '#7c83fd', fontSize: '1.2em', zIndex: 2 }}
                                                onClick={e => {
                                                    e.preventDefault();
                                                    e.stopPropagation();
                                                    e.target.previousSibling && e.target.previousSibling.focus();
                                                }}
                                            ><FiClock /></span>
                                        </label>
                                    </div>
                                </div>
                                <button onClick={handleAddTask} className="add-task-btn modern">
                                    <FiPlus />
                                </button>
                            </div>
                        </div>
                        {/* Task list */}
                        <div className="tasks-list">
                            {showCompleted
                                ? (
                                    completedTasks.length === 0 ? (
                                        <div className="tasks-empty-state">
                                            <div className="empty-icon">📋</div>
                                            <div className="empty-title">No completed tasks yet</div>
                                            <div className="empty-desc">Mark tasks as complete to see them here.</div>
                                        </div>
                                    ) : completedTasks.map(task => (
                                        <div key={task.id} className="task-item completed">
                                            <label className="task-checkbox">
                                                <input
                                                    type="checkbox"
                                                    checked={task.completed}
                                                    onChange={() => handleToggleTask(task.id)}
                                                />
                                                <span className="checkmark"></span>
                                            </label>
                                            <div className="task-content">
                                                <span className="task-title">{task.title}</span>
                                                <div className="task-tags-row">
                                                    {task.tags && task.tags.map(tag => (
                                                        <span key={tag} className="tag-pill" style={{ background: getTagColor(tag), color: '#23242b', marginRight: 4 }}>{tag}</span>
                                                    ))}
                                                </div>
                                                {task.dueTime && <span className="task-time">{task.dueTime}</span>}
                                            </div>
                                            <button 
                                                onClick={() => handleDeleteTask(task.id)}
                                                className="delete-task-btn"
                                            >
                                                <FiX />
                                            </button>
                                        </div>
                                    ))
                                ) : (
                                    todayTasks.length === 0 ? (
                                        <div className="tasks-empty-state">
                                            <div className="empty-icon">📝</div>
                                            <div className="empty-title">No tasks yet</div>
                                            <div className="empty-desc">Add a new task to get started!</div>
                                        </div>
                                    ) : todayTasks.map(task => (
                                        <div key={task.id} className="task-item">
                                            <label className="task-checkbox">
                                                <input
                                                    type="checkbox"
                                                    checked={task.completed}
                                                    onChange={() => handleToggleTask(task.id)}
                                                />
                                                <span className="checkmark"></span>
                                            </label>
                                            <div className="task-content">
                                                <span className="task-title">{task.title}</span>
                                                <div className="task-tags-row">
                                                    {task.tags && task.tags.map(tag => (
                                                        <span key={tag} className="tag-pill" style={{ background: getTagColor(tag), color: '#23242b', marginRight: 4 }}>{tag}</span>
                                                    ))}
                                                </div>
                                                {task.dueTime && <span className="task-time">{task.dueTime}</span>}
                                            </div>
                                            <button 
                                                onClick={() => handleDeleteTask(task.id)}
                                                className="delete-task-btn"
                                            >
                                                <FiX />
                                            </button>
                                        </div>
                                    ))
                                )
                            }
                        </div>
                    </section>
                </div>
                {/* Right column: Distraction Log only */}
                <div className="focus-main-right">
                    {/* Distraction Log Card */}
                    <section className="distraction-card with-margin">
                        <div className="section-header">
                            <h3>🚫 Distraction Log</h3>
                        </div>
                        <div className="distraction-add-row">
                            <input
                                type="text"
                                value={distractionNotes}
                                onChange={e => setDistractionNotes(e.target.value)}
                                placeholder="Add a distraction..."
                                className="distraction-input"
                            />
                            <button onClick={handleSaveDistraction} className="save-distraction-btn">
                                <FiPlus />
                            </button>
                        </div>
                        <div className="distraction-list sticky-style">
                            {distractionHistory.slice(0, 8).map(distraction => (
                                <div key={distraction.id} className="distraction-item sticky-note-card">
                                    <span className="distraction-text">{distraction.text}</span>
                                    <span className="distraction-time">{distraction.timestamp}</span>
                                </div>
                            ))}
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
};

export default FocusPage; 