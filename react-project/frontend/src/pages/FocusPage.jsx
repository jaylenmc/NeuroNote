import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiCheck, FiX, FiPlus, FiClock, FiCalendar, FiMusic, FiLock, FiStar } from 'react-icons/fi';
import { FaFire, FaThumbtack, FaPlay, FaPause } from 'react-icons/fa';
import './FocusPage.css';

const FocusPage = () => {
    const navigate = useNavigate();
    
    // Daily Intentions
    const [dailyIntention, setDailyIntention] = useState('');
    
    // Tasks/To-Do List
    const [tasks, setTasks] = useState([
        { id: 1, title: 'Complete flashcards', tag: 'Study', completed: false, dueTime: '10:00 AM' },
        { id: 2, title: 'Review notes', tag: 'Study', completed: false, dueTime: '2:00 PM' },
        { id: 3, title: 'Take a break', tag: 'Break', completed: false, dueTime: '12:00 PM' }
    ]);
    const [newTaskTitle, setNewTaskTitle] = useState('');
    const [newTaskTag, setNewTaskTag] = useState('Study');
    const [showCompleted, setShowCompleted] = useState(false);
    
    // Distraction Journal
    const [distractionNotes, setDistractionNotes] = useState('');
    const [distractionHistory, setDistractionHistory] = useState([]);
    
    // Focus Tracker/Stats
    const [focusStats, setFocusStats] = useState({
        totalFocusTime: 0,
        tasksCompleted: 0,
        focusStreak: 7,
        todayTasks: 3
    });
    
    // Pomodoro Timer
    const [pomodoroTime, setPomodoroTime] = useState(25 * 60); // 25 minutes in seconds
    const [isPomodoroActive, setIsPomodoroActive] = useState(false);
    const [pomodoroRound, setPomodoroRound] = useState(1);
    const [totalRounds, setTotalRounds] = useState(4);
    
    // Focus Mode Lock
    const [isFocusMode, setIsFocusMode] = useState(false);
    
    // Ambient Sound
    const [ambientSound, setAmbientSound] = useState('silence');
    const [isSoundOn, setIsSoundOn] = useState(false);
    
    // Daily Highlight
    const [dailyHighlight, setDailyHighlight] = useState('');
    
    // Task groups
    const todayTasks = tasks.filter(task => !task.completed);
    const completedTasks = tasks.filter(task => task.completed);
    const upcomingTasks = tasks.filter(task => !task.completed && task.dueTime);

    // Handlers
    const handleAddTask = () => {
        if (newTaskTitle.trim()) {
            const newTask = {
                id: Date.now(),
                title: newTaskTitle,
                tag: newTaskTag,
                completed: false,
                dueTime: null
            };
            setTasks([...tasks, newTask]);
            setNewTaskTitle('');
            setNewTaskTag('Study');
        }
    };

    const handleToggleTask = (taskId) => {
        setTasks(tasks.map(task => 
            task.id === taskId ? { ...task, completed: !task.completed } : task
        ));
    };

    const handleDeleteTask = (taskId) => {
        setTasks(tasks.filter(task => task.id !== taskId));
    };

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

    const handlePomodoroToggle = () => {
        setIsPomodoroActive(!isPomodoroActive);
    };

    const handleFocusModeToggle = () => {
        setIsFocusMode(!isFocusMode);
    };

    const handleSaveHighlight = () => {
        // Save daily highlight
        console.log('Daily highlight saved:', dailyHighlight);
    };

    // Pomodoro timer effect
    useEffect(() => {
        let interval;
        if (isPomodoroActive && pomodoroTime > 0) {
            interval = setInterval(() => {
                setPomodoroTime(prev => {
                    if (prev <= 1) {
                        setIsPomodoroActive(false);
                        setPomodoroRound(prev => prev + 1);
                        return 25 * 60; // Reset to 25 minutes
                    }
                    return prev - 1;
                });
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [isPomodoroActive, pomodoroTime]);

    // Format time for display
    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <div className={`focus-page ${isFocusMode ? 'focus-mode' : ''}`}>
            {/* Header */}
            <div className="focus-header">
                <button className="back-button" onClick={() => navigate('/study-room')}>
                    <FiArrowLeft /> Back to Study Room
                </button>
                <button 
                    className="focus-mode-toggle"
                    onClick={handleFocusModeToggle}
                >
                    {isFocusMode ? 'Exit Focus Mode' : 'Enter Focus Mode'}
                </button>
            </div>

            {/* 1. Daily Intentions / Mindset Header */}
            <section className="daily-intentions">
                <div className="intention-container">
                    <h2 className="intention-title">🧘 Today's Focus</h2>
                    <div className="intention-input-wrapper">
                        <input
                            type="text"
                            value={dailyIntention}
                            onChange={(e) => setDailyIntention(e.target.value)}
                            placeholder="Set your intention for today..."
                            className="intention-input"
                        />
                        <span className="intention-icon">🎯</span>
                    </div>
                </div>
            </section>

            <div className="focus-main-grid">
                {/* 2. Tasks / To-Do List Section */}
                <section className="tasks-section">
                    <div className="section-header">
                        <h3>✅ Today's Tasks</h3>
                        <button 
                            className="show-completed-toggle"
                            onClick={() => setShowCompleted(!showCompleted)}
                        >
                            {showCompleted ? 'Hide' : 'Show'} Completed
                        </button>
                    </div>

                    {/* Add new task */}
                    <div className="add-task-form">
                        <input
                            type="text"
                            value={newTaskTitle}
                            onChange={(e) => setNewTaskTitle(e.target.value)}
                            placeholder="Add a new task..."
                            className="task-input"
                        />
                        <select 
                            value={newTaskTag} 
                            onChange={(e) => setNewTaskTag(e.target.value)}
                            className="task-tag-select"
                        >
                            <option value="Study">Study</option>
                            <option value="Break">Break</option>
                            <option value="Exercise">Exercise</option>
                            <option value="Other">Other</option>
                        </select>
                        <button onClick={handleAddTask} className="add-task-btn">
                            <FiPlus />
                        </button>
                    </div>

                    {/* Task list */}
                    <div className="tasks-list">
                        {todayTasks.map(task => (
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
                                    <span className="task-tag">{task.tag}</span>
                                    {task.dueTime && <span className="task-time">{task.dueTime}</span>}
                                </div>
                                <button 
                                    onClick={() => handleDeleteTask(task.id)}
                                    className="delete-task-btn"
                                >
                                    <FiX />
                                </button>
                            </div>
                        ))}
                        
                        {showCompleted && completedTasks.map(task => (
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
                                    <span className="task-tag">{task.tag}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* 3. Distraction Journal */}
                <section className="distraction-journal">
                    <div className="section-header">
                        <h3>📝 Distraction Dump</h3>
                    </div>
                    <div className="distraction-container">
                        <textarea
                            value={distractionNotes}
                            onChange={(e) => setDistractionNotes(e.target.value)}
                            placeholder="Dump your intrusive thoughts here... (e.g., 'Need to check social media', 'Hungry for snacks')"
                            className="distraction-textarea"
                        />
                        <button onClick={handleSaveDistraction} className="save-distraction-btn">
                            Save Note
                        </button>
                    </div>
                    
                    {/* Distraction history */}
                    <div className="distraction-history">
                        <h4>Recent Distractions</h4>
                        <div className="distraction-list">
                            {distractionHistory.slice(0, 5).map(distraction => (
                                <div key={distraction.id} className="distraction-item">
                                    <span className="distraction-text">{distraction.text}</span>
                                    <span className="distraction-time">{distraction.timestamp}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* 4. Focus Tracker / Stats */}
                <section className="focus-stats">
                    <div className="section-header">
                        <h3>📊 Focus Stats</h3>
                    </div>
                    <div className="stats-grid">
                        <div className="stat-card">
                            <div className="stat-icon">⏱️</div>
                            <div className="stat-content">
                                <span className="stat-value">{focusStats.totalFocusTime}h</span>
                                <span className="stat-label">Focus Time Today</span>
                            </div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-icon">✅</div>
                            <div className="stat-content">
                                <span className="stat-value">{focusStats.tasksCompleted}</span>
                                <span className="stat-label">Tasks Completed</span>
                            </div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-icon">🔥</div>
                            <div className="stat-content">
                                <span className="stat-value">{focusStats.focusStreak}</span>
                                <span className="stat-label">Day Streak</span>
                            </div>
                        </div>
                    </div>
                </section>

                {/* 5. Bonus Features */}
                <section className="bonus-features">
                    {/* Pomodoro Timer */}
                    <div className="pomodoro-widget">
                        <div className="section-header">
                            <h3>🌿 Pomodoro Timer</h3>
                        </div>
                        <div className="pomodoro-display">
                            <div className="pomodoro-time">{formatTime(pomodoroTime)}</div>
                            <div className="pomodoro-rounds">🍅 {pomodoroRound}/{totalRounds}</div>
                            <button onClick={handlePomodoroToggle} className="pomodoro-toggle">
                                {isPomodoroActive ? <FaPause /> : <FaPlay />}
                            </button>
                        </div>
                    </div>

                    {/* Ambient Sound */}
                    <div className="ambient-sound">
                        <div className="section-header">
                            <h3>🎵 Focus Vibe</h3>
                        </div>
                        <select 
                            value={ambientSound} 
                            onChange={(e) => setAmbientSound(e.target.value)}
                            className="sound-select"
                        >
                            <option value="silence">Silence</option>
                            <option value="rain">Rain</option>
                            <option value="lofi">Lo-Fi</option>
                            <option value="nature">Nature</option>
                        </select>
                        <button 
                            onClick={() => setIsSoundOn(!isSoundOn)}
                            className={`sound-toggle ${isSoundOn ? 'active' : ''}`}
                        >
                            <FiMusic />
                        </button>
                    </div>

                    {/* Daily Highlight */}
                    <div className="daily-highlight">
                        <div className="section-header">
                            <h3>✨ Today's Win</h3>
                        </div>
                        <textarea
                            value={dailyHighlight}
                            onChange={(e) => setDailyHighlight(e.target.value)}
                            placeholder="What's your biggest win today?"
                            className="highlight-textarea"
                        />
                        <button onClick={handleSaveHighlight} className="save-highlight-btn">
                            <FiStar /> Save Win
                        </button>
                    </div>
                </section>
            </div>
        </div>
    );
};

export default FocusPage; 