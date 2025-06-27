import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../auth/AuthContext';
import { useParticles } from '../hooks/useParticles';
import StudyDecks from './StudyDecks';
import AskNeuroNote from './AskNeuroNote';
import QuizWidget from './QuizWidget';
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
    MessageSquare,
    HelpCircle,
} from 'lucide-react';
import { FiEdit2, FiTrash2, FiRefreshCw, FiCheck, FiX } from 'react-icons/fi';
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
    const [showAskNeuroNote, setShowAskNeuroNote] = useState(false);
    const [showQuiz, setShowQuiz] = useState(false);
    const [isEditingTimer, setIsEditingTimer] = useState(false);
    const [editHours, setEditHours] = useState(0);
    const [editMinutes, setEditMinutes] = useState(25);
    const [editSeconds, setEditSeconds] = useState(0);
    const timerInputRef = useRef(null);

    // Timer effect
    useEffect(() => {
        let timer;
        if (isTimerRunning && timeLeft > 0) {
            timer = setInterval(() => {
                setTimeLeft(prev => {
                    if (prev <= 1) {
                        setIsTimerRunning(false);
                        return 0;
                    }
                    return prev - 1;
                });
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

    const handleStartTimer = () => {
        if (timeLeft > 0) setIsTimerRunning(true);
    };

    const handlePauseTimer = () => {
        setIsTimerRunning(false);
    };

    const resetTimer = () => {
        setTimeLeft(25 * 60);
        setIsTimerRunning(false);
    };

    const handleBackToFlashcards = () => {
        navigate('/night-owl-flashcards');
    };

    const handleProgressClick = () => {
        navigate('/progress');
    };

    const handleTimerClick = () => {
        setEditHours(Math.floor(timeLeft / 3600));
        setEditMinutes(Math.floor((timeLeft % 3600) / 60));
        setEditSeconds(timeLeft % 60);
        setIsEditingTimer(true);
        setTimeout(() => {
            if (timerInputRef.current) timerInputRef.current.focus();
        }, 0);
    };

    const handleSaveTimer = () => {
        const totalSeconds = Math.max(0, editHours * 3600 + editMinutes * 60 + editSeconds);
        setTimeLeft(totalSeconds);
        setIsEditingTimer(false);
        setIsTimerRunning(false);
    };

    const handleTimerInputKeyDown = (e) => {
        if (e.key === 'Enter') {
            handleInputBlur();
        } else if (e.key === 'Escape') {
            setIsEditingTimer(false);
        }
    };

    const handleInputFocus = (setter) => setter('');

    const handleInputBlur = () => {
        setEditHours(h => h === '' || h === null || isNaN(h) ? 0 : h);
        setEditMinutes(m => m === '' || m === null || isNaN(m) ? 0 : m);
        setEditSeconds(s => s === '' || s === null || isNaN(s) ? 0 : s);
        handleSaveTimer();
    };

    const tools = [
        { icon: <BookOpen size={24} />, label: 'Decks', color: '#7c83fd', onClick: () => navigate('/study-room/decks') },
        { icon: <HelpCircle size={24} />, label: 'Quiz', color: '#ff6b6b', onClick: () => navigate('/quiz') },
        { icon: <Target size={24} />, label: 'Focus', color: '#4ecdc4', onClick: () => navigate('/focus') },
        { icon: <FiRefreshCw size={24} />, label: 'Review', color: '#ffd93d', onClick: () => navigate('/review') },
        { icon: <BarChart2 size={24} />, label: 'Progress', color: '#95e1d3', onClick: handleProgressClick },
        { icon: <MessageSquare size={24} />, label: 'Ask NeuroNote', color: '#6c5ce7', onClick: () => navigate('/chat') }
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
                <div
                    className={`timer ${isTimerRunning ? 'timer-active' : ''}`}
                    style={{ cursor: isEditingTimer ? 'auto' : 'pointer' }}
                    onClick={!isEditingTimer ? handleTimerClick : undefined}
                >
                    {isEditingTimer ? (
                        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', width: '100%' }}>
                            <input
                                ref={timerInputRef}
                                type="number"
                                min="0"
                                max="99"
                                value={editHours === '' ? '' : String(editHours).padStart(2, '0')}
                                onChange={e => setEditHours(e.target.value === '' ? '' : Math.max(0, Math.min(99, Number(e.target.value))))}
                                onFocus={() => handleInputFocus(setEditHours)}
                                onBlur={handleInputBlur}
                                onKeyDown={handleTimerInputKeyDown}
                                style={{ width: 56, textAlign: 'center', fontSize: '3rem', fontFamily: 'inherit', fontWeight: 600, border: 'none', borderBottom: '2px solid #fff', background: 'transparent', color: '#fff', outline: 'none', margin: '0 2px' }}
                                placeholder="00"
                                inputMode="numeric"
                                pattern="[0-9]*"
                                className="timer-edit-input"
                            />
                            <span style={{ fontSize: '1.5rem' }}>:</span>
                            <input
                                type="number"
                                min="0"
                                max="59"
                                value={editMinutes === '' ? '' : String(editMinutes).padStart(2, '0')}
                                onChange={e => setEditMinutes(e.target.value === '' ? '' : Math.max(0, Math.min(59, Number(e.target.value))))}
                                onFocus={() => handleInputFocus(setEditMinutes)}
                                onBlur={handleInputBlur}
                                onKeyDown={handleTimerInputKeyDown}
                                style={{ width: 56, textAlign: 'center', fontSize: '3rem', fontFamily: 'inherit', fontWeight: 600, border: 'none', borderBottom: '2px solid #fff', background: 'transparent', color: '#fff', outline: 'none', margin: '0 2px' }}
                                placeholder="00"
                                inputMode="numeric"
                                pattern="[0-9]*"
                                className="timer-edit-input"
                            />
                            <span style={{ fontSize: '1.5rem' }}>:</span>
                            <input
                                type="number"
                                min="0"
                                max="59"
                                value={editSeconds === '' ? '' : String(editSeconds).padStart(2, '0')}
                                onChange={e => setEditSeconds(e.target.value === '' ? '' : Math.max(0, Math.min(59, Number(e.target.value))))}
                                onFocus={() => handleInputFocus(setEditSeconds)}
                                onBlur={handleInputBlur}
                                onKeyDown={handleTimerInputKeyDown}
                                style={{ width: 56, textAlign: 'center', fontSize: '3rem', fontFamily: 'inherit', fontWeight: 600, border: 'none', borderBottom: '2px solid #fff', background: 'transparent', color: '#fff', outline: 'none', margin: '0 2px' }}
                                placeholder="00"
                                inputMode="numeric"
                                pattern="[0-9]*"
                                className="timer-edit-input"
                            />
                        </div>
                    ) : (
                        <span style={{ display: 'block', width: '100%', textAlign: 'center' }}>{
                            `${String(Math.floor(timeLeft / 3600)).padStart(2, '0')}:` +
                            `${String(Math.floor((timeLeft % 3600) / 60)).padStart(2, '0')}:` +
                            `${String(timeLeft % 60).padStart(2, '0')}`
                        }</span>
                    )}
                </div>
                <div className="timer-controls">
                    {isTimerRunning ? (
                        <button onClick={handlePauseTimer} disabled={isEditingTimer}>Pause</button>
                    ) : (
                        <button onClick={handleStartTimer} disabled={isEditingTimer || timeLeft === 0}>Start</button>
                    )}
                    <button onClick={resetTimer} disabled={isEditingTimer}>Reset</button>
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
                {showQuiz && (
                    <div className="study-content-widget">
                        <QuizWidget />
                    </div>
                )}
                {showReview && (
                    <div className="study-content-widget">
                        <ReviewWidget />
                    </div>
                )}
                {showAskNeuroNote && (
                    <div className="study-content-widget">
                        <AskNeuroNote />
                    </div>
                )}
            </div>
        </div>
    );
};

export default StudyRoom; 