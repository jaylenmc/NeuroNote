import React from 'react';
import { FiPlay, FiPause, FiRotateCcw, FiSettings } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import blackboardBg from '../assets/Blackboard.png';
import { formatDateForDisplay } from '../utils/dateUtils';
import './FlashcardsNightOwl.css';

const FlashcardsDashboard = ({
    selectedReview,
    setSelectedReview,
    dueTodayCount,
    upcomingCards,
    reviewProgress,
    isTransitioning
}) => {
    const navigate = useNavigate();

    const handleStudyRoomClick = () => {
        navigate('/study-room');
    };
    return (
        <div className="nightowl-flashcards-bg">
            <div className="nightowl-flashcards-content">
                <div className="nightowl-header-row">
                    <div>
                        <h1 className="nightowl-header-title">Night Owl Flashcards</h1>
                        <p className="nightowl-header-sub">Study smarter, not harder</p>
                    </div>
                    <button 
                        className="nightowl-studyroom-btn"
                        onClick={handleStudyRoomClick}
                    >
                        🎓 Study Room
                    </button>
                </div>

                <div className="nightowl-status-widget">
                    <div className="nightowl-xp-moon">🌙</div>
                    <div className="nightowl-xp-bar">
                        <div 
                            className="nightowl-xp-fill" 
                            style={{ width: `${reviewProgress.last7Days.accuracy}%` }}
                        ></div>
                    </div>
                    <div className="nightowl-xp-label">{reviewProgress.last7Days.accuracy}% Accuracy</div>
                </div>

                <div className="nightowl-panel-grid">
                    <div className="nightowl-panel">
                        <div className="nightowl-panel-icon">📚</div>
                        <div className="nightowl-panel-value">{dueTodayCount}</div>
                        <div className="nightowl-panel-label">Due Today</div>
                    </div>
                    <div className="nightowl-panel">
                        <div className="nightowl-panel-icon">⏰</div>
                        <div className="nightowl-panel-value">{upcomingCards.length}</div>
                        <div className="nightowl-panel-label">Upcoming</div>
                    </div>
                    <div className="nightowl-panel">
                        <div className="nightowl-panel-icon">✅</div>
                        <div className="nightowl-panel-value">{reviewProgress.last7Days.correct}</div>
                        <div className="nightowl-panel-label">Correct</div>
                    </div>
                    <div className="nightowl-panel">
                        <div className="nightowl-panel-icon">❌</div>
                        <div className="nightowl-panel-value">{reviewProgress.last7Days.incorrect}</div>
                        <div className="nightowl-panel-label">Incorrect</div>
                    </div>
                </div>

                <div className="nightowl-tools-grid">
                    <button 
                        className="nightowl-tool-btn"
                        onClick={() => setSelectedReview('due-today')}
                        disabled={dueTodayCount === 0}
                    >
                        <FiPlay /> Start Due Today ({dueTodayCount})
                    </button>
                    <button 
                        className="nightowl-tool-btn"
                        onClick={() => setSelectedReview('upcoming')}
                        disabled={upcomingCards.length === 0}
                    >
                        <FiPlay /> Review Upcoming ({upcomingCards.length})
                    </button>
                    <button 
                        className="nightowl-tool-btn"
                        onClick={handleStudyRoomClick}
                    >
                        🎓 Study Room
                    </button>
                    <button className="nightowl-tool-btn">
                        <FiSettings /> Settings
                    </button>
                </div>

                {reviewProgress.needsReview.length > 0 && (
                    <div className="nightowl-sticky">
                        <h3>Needs Review</h3>
                        <div style={{ marginTop: '12px' }}>
                            {reviewProgress.needsReview.map((topic, index) => (
                                <div key={index} style={{ 
                                    display: 'flex', 
                                    justifyContent: 'space-between', 
                                    marginBottom: '8px',
                                    padding: '8px 0',
                                    borderBottom: '1px solid rgba(255,255,255,0.1)'
                                }}>
                                    <span>{topic.topic}</span>
                                    <span style={{ color: 'var(--nightowl-accent)' }}>{topic.count} cards</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {upcomingCards.length > 0 && (
                    <div className="upcoming-review-widget">
                        <h3 className="upcoming-review-widget-title">Upcoming Cards</h3>
                        <div className="upcoming-review-widget-content">
                            {upcomingCards.slice(0, 5).map((card, index) => (
                                <div key={index} className="upcoming-review-item">
                                    <div className="upcoming-review-item-question">
                                        <strong>Q:</strong> {card.question.substring(0, 50)}...
                                    </div>
                                    <div className="upcoming-review-item-date">
                                        Due: {formatDateForDisplay(card.scheduled_date)}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {isTransitioning && (
                <div className="transition-overlay">
                    <div className="transition-spinner"></div>
                </div>
            )}
        </div>
    );
};

export default FlashcardsDashboard; 