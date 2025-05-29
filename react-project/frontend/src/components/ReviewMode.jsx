import React, { useState, useEffect } from 'react';
import { 
  FiArrowLeft, 
  FiClock, 
  FiCheck, 
  FiX, 
  FiHelpCircle, 
  FiArrowRight, 
  FiBook,
  FiShuffle,
  FiPause,
  FiPlay,
  FiRotateCcw,
  FiType,
  FiList,
  FiLayers
} from 'react-icons/fi';
import './ReviewMode.css';

const ReviewMode = ({ review, onBack }) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [timer, setTimer] = useState(0);
  const [reviewMode, setReviewMode] = useState('flashcard'); // 'flashcard', 'multiple-choice', 'typing', 'spaced'
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isShuffled, setIsShuffled] = useState(false);
  const [stats, setStats] = useState({
    correct: 0,
    incorrect: 0,
    skipped: 0,
    total: 20 // This should come from the actual deck size
  });

  // Sample cards data
  const sampleCards = [
    { question: "What is the capital of France?", answer: "Paris" },
    { question: "What is the largest planet in our solar system?", answer: "Jupiter" },
    { question: "Who painted the Mona Lisa?", answer: "Leonardo da Vinci" },
    { question: "What is the chemical symbol for gold?", answer: "Au" },
    { question: "What is the square root of 144?", answer: "12" }
  ];

  // Timer effect
  useEffect(() => {
    let interval;
    if (!isPaused) {
      interval = setInterval(() => {
        setTimer(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPaused]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e) => {
      switch(e.code) {
        case 'Space':
          setIsFlipped(prev => !prev);
          break;
        case 'KeyR':
          handleResponse('correct');
          break;
        case 'KeyW':
          handleResponse('incorrect');
          break;
        case 'KeyU':
          handleResponse('skipped');
          break;
        case 'KeyS':
          handleResponse('skipped');
          break;
        case 'Escape':
          onBack();
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleResponse = (type) => {
    setStats(prev => ({
      ...prev,
      [type]: prev[type] + 1,
      total: prev.total
    }));
    setIsFlipped(false);
    // Move to next card
    setCurrentCardIndex(prev => prev + 1);
  };

  const toggleShuffle = () => {
    setIsShuffled(prev => !prev);
    // Implement shuffle logic here
  };

  return (
    <div className="review-modal-overlay">
      <div className="review-modal">
        <div className="review-mode">
          {/* Header with Deck Info and Progress */}
          <div className="review-header">
            <div className="deck-info">
              <div className="deck-header">
                <div className="deck-title">
                  <FiBook className="deck-icon" />
                  Sample Deck
                </div>
                <div className="timer">
                  <FiClock /> {formatTime(timer)}
                </div>
              </div>
              <div className="progress-bar">
                <div className="progress-remaining" />
                <div 
                  className="progress-fill"
                  style={{ width: `${(currentCardIndex / stats.total) * 100}%` }}
                />
              </div>
            </div>
          </div>

          <div className="progress-text">
            Card {currentCardIndex + 1} of {stats.total}
          </div>

          {/* Review Mode Selector */}
          <div className="review-mode-selector">
            <button 
              className={`mode-btn ${reviewMode === 'flashcard' ? 'active' : ''}`}
              onClick={() => setReviewMode('flashcard')}
            >
              <FiLayers /> Flashcard
            </button>
            <button 
              className={`mode-btn ${reviewMode === 'multiple-choice' ? 'active' : ''}`}
              onClick={() => setReviewMode('multiple-choice')}
            >
              <FiList /> Multiple Choice
            </button>
            <button 
              className={`mode-btn ${reviewMode === 'typing' ? 'active' : ''}`}
              onClick={() => setReviewMode('typing')}
            >
              <FiType /> Typing
            </button>
            <button 
              className={`mode-btn ${reviewMode === 'spaced' ? 'active' : ''}`}
              onClick={() => setReviewMode('spaced')}
            >
              <FiRotateCcw /> Spaced
            </button>
          </div>

          {/* Card Viewer */}
          <div className="card-viewer" onClick={() => setIsFlipped(prev => !prev)}>
            <div className={`card ${isFlipped ? 'flipped' : ''}`}>
              <div className="card-inner">
                <div className="card-front">
                  {sampleCards[currentCardIndex % sampleCards.length].question}
                </div>
                <div className="card-back">
                  {sampleCards[currentCardIndex % sampleCards.length].answer}
                </div>
              </div>
            </div>
            <div className="flip-hint">Click or press Space to flip</div>
          </div>

          {/* Response Buttons */}
          <div className="response-buttons">
            <button 
              className="response-btn correct"
              onClick={() => handleResponse('correct')}
            >
              <FiCheck /> Right
            </button>
            <button 
              className="response-btn unsure"
              onClick={() => handleResponse('skipped')}
            >
              <FiHelpCircle /> Unsure
            </button>
            <button 
              className="response-btn wrong"
              onClick={() => handleResponse('incorrect')}
            >
              <FiX /> Wrong
            </button>
            <button 
              className="response-btn skip"
              onClick={() => handleResponse('skipped')}
            >
              <FiArrowRight /> Skip
            </button>
          </div>

          {/* Session Controls */}
          <div className="session-controls">
            <button 
              className="control-btn"
              onClick={toggleShuffle}
            >
              <FiShuffle /> Shuffle
            </button>
            <button 
              className="control-btn"
              onClick={() => setIsPaused(prev => !prev)}
            >
              {isPaused ? <FiPlay /> : <FiPause />} {isPaused ? 'Resume' : 'Pause'}
            </button>
            <button 
              className="control-btn"
              onClick={onBack}
            >
              <FiArrowLeft /> End Session
            </button>
          </div>

          {/* Stats Display */}
          <div className="stats-display">
            <div className="stat">
              <span className="stat-value">{stats.correct}</span>
              <span className="stat-label">Correct</span>
            </div>
            <div className="stat">
              <span className="stat-value">{stats.incorrect}</span>
              <span className="stat-label">Incorrect</span>
            </div>
            <div className="stat">
              <span className="stat-value">{stats.skipped}</span>
              <span className="stat-label">Skipped</span>
            </div>
            <div className="stat">
              <span className="stat-value">
                {Math.round((stats.correct / (stats.correct + stats.incorrect + stats.skipped)) * 100)}%
              </span>
              <span className="stat-label">Accuracy</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReviewMode; 