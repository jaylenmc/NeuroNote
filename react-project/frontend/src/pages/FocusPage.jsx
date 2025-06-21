import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiCheck, FiX, FiVolume2, FiVolumeX } from 'react-icons/fi';
import { FaFire, FaThumbtack } from 'react-icons/fa';
import './FocusPage.css';

const habitIcons = {
    Meditate: '🧘‍♂️',
    Exercise: '🏃‍♂️',
    Read: '📚',
    Hydrate: '💧',
};

const FocusPage = () => {
    const navigate = useNavigate();
    const [focusTasks, setFocusTasks] = useState([
        { id: 1, text: '', completed: false },
        { id: 2, text: '', completed: false },
        { id: 3, text: '', completed: false },
    ]);
    const [distractions, setDistractions] = useState([]);
    const [distractionInput, setDistractionInput] = useState('');
    const [focusStreak, setFocusStreak] = useState(7); // Example streak
    const [currentQuote, setCurrentQuote] = useState('');
    const [isAmbientSoundOn, setIsAmbientSoundOn] = useState(false);
    const [volume, setVolume] = useState(50);
    const [habits, setHabits] = useState([
        { id: 1, name: 'Meditate', completed: false },
        { id: 2, name: 'Exercise', completed: false },
        { id: 3, name: 'Read', completed: false },
        { id: 4, name: 'Hydrate', completed: false }
    ]);
    const [isFocusMode, setIsFocusMode] = useState(false);
    const [allTasksComplete, setAllTasksComplete] = useState(false);

    const quotes = [
        "Focus on being productive instead of busy.",
        "The key is not to prioritize what's on your schedule, but to schedule your priorities.",
        "Where focus goes, energy flows.",
        "Stay focused, go after your dreams and keep moving toward your goals.",
        "Focus on the journey, not the destination."
    ];

    useEffect(() => {
        setCurrentQuote(quotes[Math.floor(Math.random() * quotes.length)]);
        const quoteInterval = setInterval(() => {
            setCurrentQuote(quotes[Math.floor(Math.random() * quotes.length)]);
        }, 30000);
        return () => clearInterval(quoteInterval);
    }, []);

    useEffect(() => {
        setAllTasksComplete(focusTasks.every(t => t.text && t.completed));
    }, [focusTasks]);

    // Handlers
    const handleTaskChange = (id, value) => {
        setFocusTasks(tasks => tasks.map(t => t.id === id ? { ...t, text: value } : t));
    };
    const handleTaskToggle = (id) => {
        setFocusTasks(tasks => tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
    };
    const handleDistractionSubmit = (e) => {
        e.preventDefault();
        if (distractionInput.trim()) {
            const newDistraction = {
                id: Date.now(),
                text: distractionInput,
                timestamp: new Date().toLocaleTimeString()
            };
            setDistractions([...distractions, newDistraction]);
            setDistractionInput('');
        }
    };
    const toggleHabit = (habitId) => {
        setHabits(habits.map(habit =>
            habit.id === habitId ? { ...habit, completed: !habit.completed } : habit
        ));
    };
    const toggleAmbientSound = () => {
        setIsAmbientSoundOn(!isAmbientSoundOn);
    };

    return (
        <div className={`focus-page ${isFocusMode ? 'focus-mode' : ''}`}>
            <div className="focus-header">
                <button className="back-button" onClick={() => navigate('/study-room')}>
                    <FiArrowLeft /> Back to Study Room
                </button>
                <button 
                    className="focus-mode-toggle"
                    onClick={() => setIsFocusMode(!isFocusMode)}
                >
                    {isFocusMode ? 'Exit Focus Mode' : 'Enter Focus Mode'}
                </button>
            </div>

            <div className="focus-grid-layout">
                {/* Top Left: Focus Streak Widget */}
                <section className="focus-streak-widget">
                    <div className="focus-section-header">
                        <span className="focus-section-bar" />
                        <span className="focus-section-title">Focus Streak</span>
                    </div>
                    <div className="focus-streak-ring-container">
                        <svg className="focus-streak-ring" width="90" height="90">
                            <circle cx="45" cy="45" r="40" stroke="#4EE1C1" strokeWidth="7" fill="none" opacity="0.2" />
                            <circle cx="45" cy="45" r="40" stroke="#4EE1C1" strokeWidth="7" fill="none" strokeDasharray={251.2} strokeDashoffset={251.2 - (focusStreak/30)*251.2} style={{ filter: 'drop-shadow(0 0 12px #4EE1C1)' }} />
                        </svg>
                        <div className="focus-streak-number-glow">
                            <FaFire className="focus-streak-flame" />
                            <span className="focus-streak-number">{focusStreak}</span>
                        </div>
                    </div>
                    <div className="focus-streak-label">🔥 {focusStreak}-Day Focus Streak</div>
                    <div className="focus-streak-subtext">Keep it going!</div>
                </section>

                {/* Top Right: Micro Habit Tracker */}
                <section className="micro-habit-tracker">
                    <div className="focus-section-header">
                        <span className="focus-section-bar" />
                        <span className="focus-section-title">Today's Micro Habits</span>
                    </div>
                    <div className="micro-habits-grid">
                        {habits.map(habit => (
                            <button
                                key={habit.id}
                                className={`micro-habit-card${habit.completed ? ' completed' : ''}`}
                                onClick={() => toggleHabit(habit.id)}
                            >
                                <span className="micro-habit-icon">{habitIcons[habit.name]}</span>
                                <span className="micro-habit-name">{habit.name}</span>
                                {habit.completed && <span className="micro-habit-checkmark"><FiCheck /></span>}
                            </button>
                        ))}
                    </div>
                </section>

                {/* Center: Today's Focus Tasks */}
                <section className="focus-tasks-section">
                    <div className="focus-section-header">
                        <span className="focus-section-bar" />
                        <span className="focus-section-title">Today's Focus Tasks</span>
                    </div>
                    <div className="focus-tasks-card">
                        <FaThumbtack className="focus-tasks-pin" />
                        <ul className="focus-tasks-list">
                            {focusTasks.map(task => (
                                <li key={task.id} className="focus-task-item">
                                    <label className="focus-task-checkbox-label">
                                        <input
                                            type="checkbox"
                                            checked={task.completed}
                                            onChange={() => handleTaskToggle(task.id)}
                                        />
                                        <span className="focus-task-custom-checkbox" />
                                    </label>
                                    <input
                                        type="text"
                                        value={task.text}
                                        onChange={e => handleTaskChange(task.id, e.target.value)}
                                        className="focus-task-input"
                                        placeholder="Task..."
                                    />
                                </li>
                            ))}
                        </ul>
                        {allTasksComplete && <div className="focus-tasks-completed-badge">Completed!</div>}
                    </div>
                </section>

                {/* Bottom: Distraction Log */}
                <section className="distraction-log-section">
                    <div className="focus-section-header">
                        <span className="focus-section-bar" />
                        <span className="focus-section-title">Distraction Log</span>
                    </div>
                    <form onSubmit={handleDistractionSubmit} className="distraction-form-modern">
                        <input
                            type="text"
                            value={distractionInput}
                            onChange={(e) => setDistractionInput(e.target.value)}
                            placeholder="What distracted you?"
                            className="distraction-input-modern"
                        />
                        <button type="submit" className="distraction-log-btn">+ Log Distraction</button>
                    </form>
                    <div className="distraction-list-modern">
                        {distractions.map(distraction => (
                            <div key={distraction.id} className="distraction-item-modern">
                                <span className="distraction-text-modern">{distraction.text}</span>
                                <span className="distraction-time-modern">{distraction.timestamp}</span>
                            </div>
                        ))}
                    </div>
                </section>
            </div>
        </div>
    );
};

export default FocusPage; 