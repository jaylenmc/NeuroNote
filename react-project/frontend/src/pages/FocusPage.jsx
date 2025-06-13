import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiCheck, FiX, FiVolume2, FiVolumeX } from 'react-icons/fi';
import './FocusPage.css';

const FocusPage = () => {
    const navigate = useNavigate();
    const [focusTask, setFocusTask] = useState('');
    const [isTaskComplete, setIsTaskComplete] = useState(false);
    const [distractions, setDistractions] = useState([]);
    const [distractionInput, setDistractionInput] = useState('');
    const [focusStreak, setFocusStreak] = useState({ days: 0, minutes: 0 });
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

    const quotes = [
        "Focus on being productive instead of busy.",
        "The key is not to prioritize what's on your schedule, but to schedule your priorities.",
        "Where focus goes, energy flows.",
        "Stay focused, go after your dreams and keep moving toward your goals.",
        "Focus on the journey, not the destination."
    ];

    useEffect(() => {
        // Rotate quotes every 30 seconds
        const quoteInterval = setInterval(() => {
            setCurrentQuote(quotes[Math.floor(Math.random() * quotes.length)]);
        }, 30000);

        // Set initial quote
        setCurrentQuote(quotes[Math.floor(Math.random() * quotes.length)]);

        return () => clearInterval(quoteInterval);
    }, []);

    const handleTaskSubmit = (e) => {
        e.preventDefault();
        if (focusTask.trim()) {
            setIsTaskComplete(false);
        }
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

            <div className="focus-content">
                <div className="focus-main">
                    <div className="focus-task-section">
                        <h2>Today's Focus Task</h2>
                        <form onSubmit={handleTaskSubmit} className="task-form">
                            <input
                                type="text"
                                value={focusTask}
                                onChange={(e) => setFocusTask(e.target.value)}
                                placeholder="What's your main focus today?"
                                className="task-input"
                            />
                            <button type="submit" className="task-submit">Set Task</button>
                        </form>
                        {focusTask && (
                            <div className="task-display">
                                <span className={isTaskComplete ? 'completed' : ''}>
                                    {focusTask}
                                </span>
                                <button
                                    onClick={() => setIsTaskComplete(!isTaskComplete)}
                                    className="complete-button"
                                >
                                    {isTaskComplete ? <FiX /> : <FiCheck />}
                                </button>
                            </div>
                        )}
                    </div>

                    <div className="distraction-log">
                        <h2>Distraction Log</h2>
                        <form onSubmit={handleDistractionSubmit} className="distraction-form">
                            <input
                                type="text"
                                value={distractionInput}
                                onChange={(e) => setDistractionInput(e.target.value)}
                                placeholder="What distracted you?"
                                className="distraction-input"
                            />
                            <button type="submit" className="distraction-submit">Log</button>
                        </form>
                        <div className="distraction-list">
                            {distractions.map(distraction => (
                                <div key={distraction.id} className="distraction-item">
                                    <span className="distraction-text">{distraction.text}</span>
                                    <span className="distraction-time">{distraction.timestamp}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="focus-sidebar">
                    <div className="focus-stats">
                        <h2>Focus Streak</h2>
                        <div className="stats-display">
                            <div className="stat">
                                <span className="stat-value">{focusStreak.days}</span>
                                <span className="stat-label">Days</span>
                            </div>
                            <div className="stat">
                                <span className="stat-value">{focusStreak.minutes}</span>
                                <span className="stat-label">Minutes</span>
                            </div>
                        </div>
                    </div>

                    <div className="focus-quote">
                        <p>{currentQuote}</p>
                    </div>

                    <div className="sound-control">
                        <h2>Ambient Sound</h2>
                        <div className="sound-controls">
                            <button
                                onClick={toggleAmbientSound}
                                className="sound-toggle"
                            >
                                {isAmbientSoundOn ? <FiVolume2 /> : <FiVolumeX />}
                            </button>
                            {isAmbientSoundOn && (
                                <input
                                    type="range"
                                    min="0"
                                    max="100"
                                    value={volume}
                                    onChange={(e) => setVolume(Number(e.target.value))}
                                    className="volume-slider"
                                />
                            )}
                        </div>
                    </div>

                    <div className="habits-tracker">
                        <h2>Micro Habits</h2>
                        <div className="habits-grid">
                            {habits.map(habit => (
                                <button
                                    key={habit.id}
                                    className={`habit-button ${habit.completed ? 'completed' : ''}`}
                                    onClick={() => toggleHabit(habit.id)}
                                >
                                    {habit.name}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FocusPage; 