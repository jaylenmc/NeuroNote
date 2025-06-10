import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../auth/AuthContext';
import { useParticles } from '../hooks/useParticles';
import StudyDecks from './StudyDecks';
import { 
    BookOpen, 
    Timer, 
    Target, 
    RefreshCw, 
    BarChart2,
    Volume2,
    VolumeX,
    Moon,
    Sun,
    X,
    ArrowLeft,
} from 'lucide-react';
import { FiEdit2, FiTrash2, FiRefreshCw } from 'react-icons/fi';
import './StudyRoom.css';
import ReviewWidget from './ReviewWidget';

const StudyRoom = () => {
    const navigate = useNavigate();
    const { isDarkMode, toggleTheme } = useTheme();
    const { user } = useAuth();
    const [isStudyMode, setIsStudyMode] = useState(false);
    const [isAmbientSoundOn, setIsAmbientSoundOn] = useState(false);
    const [volume, setVolume] = useState(50);
    const [timeLeft, setTimeLeft] = useState(25 * 60); // 25 minutes in seconds
    const [isTimerRunning, setIsTimerRunning] = useState(false);
    const { particlesContainerRef, particlesLoaded } = useParticles();
    const [currentCard, setCurrentCard] = useState(null);
    const [showAnswer, setShowAnswer] = useState(false);
    const [error, setError] = useState(null);
    const [isFlipped, setIsFlipped] = useState(false);
    const [showTimer, setShowTimer] = useState(false);
    const [showReview, setShowReview] = useState(false);

    // Timer effect
    useEffect(() => {
        let timer;
        if (isTimerRunning && timeLeft > 0) {
            timer = setInterval(() => {
                setTimeLeft(prev => prev - 1);
            }, 1000);
        }
        return () => clearInterval(timer);
    }, [isTimerRunning, timeLeft]);

    // Ambient sound effect
    useEffect(() => {
        const audio = new Audio('/sounds/ambient-nature.mp3');
        audio.loop = true;
        audio.volume = volume / 100;

        if (isAmbientSoundOn) {
            audio.play();
        }

        return () => {
            audio.pause();
            audio.currentTime = 0;
        };
    }, [isAmbientSoundOn, volume]);

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const toggleTimer = () => {
        setShowTimer(!showTimer);
        setShowReview(false); // Hide review when showing timer
    };

    const toggleReview = () => {
        setShowReview(!showReview);
        setShowTimer(false); // Hide timer when showing review
    };

    const resetTimer = () => {
        setTimeLeft(25 * 60);
        setIsTimerRunning(false);
    };

    const handleBackToFlashcards = () => {
        navigate('/dashboard?tab=flashcards');
    };

    const tools = [
        { icon: <BookOpen size={24} />, label: 'Decks', color: '#7c83fd', onClick: () => navigate('/study-room/decks') },
        { icon: <Timer size={24} />, label: 'Timer', color: '#ff6b6b', onClick: toggleTimer },
        { icon: <Target size={24} />, label: 'Focus', color: '#4ecdc4', onClick: () => {} },
        { icon: <FiRefreshCw size={24} />, label: 'Review', color: '#ffd93d', onClick: () => navigate('/review') },
        { icon: <BarChart2 size={24} />, label: 'Progress', color: '#95e1d3', onClick: () => {} }
    ];

    return (
        <div className={`study-room ${isStudyMode ? 'study-mode-active' : ''}`}>
            {isStudyMode && (
                <div ref={particlesContainerRef} className="particles-container" />
            )}
            
            <div className="study-room-header">
                <h1>Study Room</h1>
                <div className="header-controls">
                    <button 
                        className="theme-toggle"
                        onClick={toggleTheme}
                        aria-label="Toggle theme"
                    >
                        {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
                    </button>
                    <button 
                        className="study-mode-toggle"
                        onClick={() => setIsStudyMode(prev => !prev)}
                    >
                        {isStudyMode ? 'Exit Study Mode' : 'Enter Study Mode'}
                    </button>
                </div>
                <button className="back-button" onClick={handleBackToFlashcards}>
                    <ArrowLeft size={20} />
                    Back to Flashcards
                </button>
            </div>

            <div className="study-tools">
                {tools.map((tool, index) => (
                    <div 
                        key={index}
                        className="tool-card glass-card"
                        onClick={tool.onClick}
                        style={{ '--tool-color': tool.color }}
                    >
                        <div className="tool-icon">{tool.icon}</div>
                        <span>{tool.label}</span>
                    </div>
                ))}
            </div>

            <div className="timer-section glass-card">
                <div className={`timer ${isTimerRunning ? 'timer-active' : ''}`}>
                    {formatTime(timeLeft)}
                </div>
                <div className="timer-controls">
                    <button onClick={toggleTimer}>
                        {isTimerRunning ? 'Pause' : 'Start'}
                    </button>
                    <button onClick={resetTimer}>Reset</button>
                </div>
            </div>

            <div className="ambient-sound glass-card">
                <button 
                    onClick={() => setIsAmbientSoundOn(prev => !prev)}
                    className="sound-toggle"
                >
                    {isAmbientSoundOn ? <Volume2 size={20} /> : <VolumeX size={20} />}
                </button>
                {isAmbientSoundOn && (
                    <div className="sound-wave">
                        <div className="sound-wave-bar"></div>
                        <div className="sound-wave-bar"></div>
                        <div className="sound-wave-bar"></div>
                    </div>
                )}
                <input
                    type="range"
                    min="0"
                    max="100"
                    value={volume}
                    onChange={(e) => setVolume(Number(e.target.value))}
                    className="volume-slider"
                />
            </div>

            {isStudyMode && <div className="candle" />}

            <div className="study-content">
                {showTimer && (
                    <div className="tool-card glass-card">
                        <TimerWidget />
                    </div>
                )}
                {showReview && (
                    <div className="tool-card glass-card">
                        <ReviewWidget />
                    </div>
                )}
            </div>
        </div>
    );
};

export default StudyRoom; 