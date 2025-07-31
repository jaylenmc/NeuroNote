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

    // Get real user data from session storage
    const getUserData = () => {
        try {
            const userData = JSON.parse(sessionStorage.getItem('user'));
            return userData || { level: 1, xp: 0 };
        } catch (error) {
            console.error('Error parsing user data:', error);
            return { level: 1, xp: 0 };
        }
    };
    
    const userData = getUserData();
    
    // Use the same XP calculation logic as DashboardHome.jsx
    const xpForLevel = (level) => Math.floor(100 * Math.pow(1.5, level - 1));
    const xp = userData.xp || 0;
    const level = userData.level || 1;
    const nextLevelXp = xpForLevel(level);
    const progress = Math.min((xp / nextLevelXp) * 100, 100);
    
    const userProgress = {
        level: level,
        currentXP: xp,
        xpForNextLevel: nextLevelXp,
        progressPercentage: progress
    };

    const handleStudyRoomClick = () => {
        navigate('/study-room');
    };
    return (
        <div className="nightowl-flashcards-bg">
            <div className="nightowl-flashcards-content">
                <div className="nightowl-header-row">
                    <div>
                        <h1 className="nightowl-header-title">Night Owl Flashcards 🦉</h1>
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
                    <div className="nightowl-level-info">
                        <div className="nightowl-level-badge">
                            <span className="level-number">{userProgress.level}</span>
                            <span className="level-label">Level</span>
                        </div>
                        <div className="nightowl-xp-info">
                            <div className="nightowl-xp-bar">
                                <div 
                                    className="nightowl-xp-fill" 
                                    style={{ width: `${userProgress.progressPercentage}%` }}
                                ></div>
                            </div>
                            <div className="nightowl-xp-label">
                                <span className="current-xp">{userProgress.currentXP}</span>
                                <span className="xp-separator">/</span>
                                <span className="next-level-xp">{userProgress.xpForNextLevel}</span>
                                <span className="xp-label">XP</span>
                            </div>
                        </div>
                    </div>
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
                        <div className="nightowl-panel-icon">🏆</div>
                        <div className="nightowl-panel-value">{reviewProgress.last7Days.incorrect}</div>
                        <div className="nightowl-panel-label">Mastered</div>
                    </div>
                </div>

                <div className="nightowl-chart-container">
                    <div className="chart-header">
                        <h3>Cards Reviewed This Week</h3>
                        <span className="chart-subtitle">Total: 247 cards • Avg: 35/day</span>
                    </div>
                    <div className="chart-content">
                        <div className="chart-bars">
                            {[
                                { day: 'Mon', cards: 28, isToday: false, isBest: false },
                                { day: 'Tue', cards: 35, isToday: false, isBest: false },
                                { day: 'Wed', cards: 42, isToday: false, isBest: true },
                                { day: 'Thu', cards: 31, isToday: false, isBest: false },
                                { day: 'Fri', cards: 38, isToday: false, isBest: false },
                                { day: 'Sat', cards: 25, isToday: false, isBest: false },
                                { day: 'Sun', cards: 48, isToday: true, isBest: false }
                            ].map((data, index) => (
                                <div key={index} className="chart-bar-group">
                                    <div 
                                        className={`chart-bar ${data.isToday ? 'today' : ''} ${data.isBest ? 'best' : ''}`}
                                        style={{ 
                                            height: `${Math.max((data.cards / 60) * 140, 8)}px`,
                                            animationDelay: `${index * 0.1}s`
                                        }}
                                        title={`${data.day}: ${data.cards} cards reviewed${data.isToday ? ' (Today)' : ''}${data.isBest ? ' (Best day!)' : ''}`}
                                    >
                                    </div>
                                    <span className="bar-label">{data.day}</span>
                                    <span className="bar-value">
                                        {data.cards}
                                        {data.isBest && <span className="best-badge">🔥</span>}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

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