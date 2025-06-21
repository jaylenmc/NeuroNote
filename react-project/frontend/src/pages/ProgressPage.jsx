import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import './ProgressPage.css';

const ProgressPage = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const xpForLevel = (level) => Math.floor(100 * Math.pow(1.5, level - 1));
    const currentLevel = user?.level || 1;
    const currentXP = user?.xp || 0;
    const nextLevelXP = xpForLevel(currentLevel);
    const xpToNextLevel = nextLevelXP - currentXP;

    // Mock data for weekly XP
    const weeklyXP = [
        { day: 'Mon', xp: 120, streak: true },
        { day: 'Tue', xp: 80, streak: false },
        { day: 'Wed', xp: 150, streak: true },
        { day: 'Thu', xp: 90, streak: false },
        { day: 'Fri', xp: 200, streak: true },
        { day: 'Sat', xp: 60, streak: false },
        { day: 'Sun', xp: 180, streak: true }
    ];

    // Mock data for skill mastery
    const skillMastery = [
        { subject: 'Biology', mastery: 80 },
        { subject: 'History', mastery: 60 },
        { subject: 'Math', mastery: 90 }
    ];

    // Mock stats
    const stats = {
        quizzesCompleted: 12,
        cardsReviewed: 240
    };

    const handleBack = () => {
        navigate('/study-room');
    };

    const calculateProgress = () => (currentXP / nextLevelXP) * 100;

    const getEncouragement = () => {
        if (xpToNextLevel < 100) {
            return "You're 2 sessions away from leveling up! 💪";
        }
        return "You're in the top 10% of focus streaks this week! 🌟";
    };

    return (
        <div className="progress-page no-navbar">
            <div className="progress-header">
                <div className="header-left">
                    <button className="back-button" onClick={handleBack}>
                        ← Back to Study Room
                    </button>
                    <h1>🎯 Learning Progress</h1>
                </div>
            </div>

            <div className="progress-grid">
                {/* Level & XP Section */}
                <div className="progress-card level-card">
                    <div className="level-info">
                        <h2>🎖️ Level {currentLevel} — {currentXP} XP</h2>
                        <p className="next-level">🔜 {xpToNextLevel} XP to Level {currentLevel + 1}</p>
                    </div>
                    <div className="progress-ring">
                        <svg viewBox="0 0 100 100">
                            <circle
                                className="progress-ring-circle-bg"
                                cx="50"
                                cy="50"
                                r="45"
                            />
                            <circle
                                className="progress-ring-circle"
                                cx="50"
                                cy="50"
                                r="45"
                                style={{
                                    strokeDasharray: `${calculateProgress()} 283`
                                }}
                            />
                        </svg>
                        <div className="progress-ring-content">
                            <span className="progress-number">{currentXP} / {nextLevelXP}</span>
                            <span className="progress-label">XP</span>
                        </div>
                    </div>
                </div>

                {/* Weekly XP Breakdown */}
                <div className="progress-card xp-breakdown">
                    <h2>Weekly XP Breakdown</h2>
                    <div className="xp-bars">
                        {weeklyXP.map((day, index) => (
                            <div key={index} className="xp-bar-container">
                                {day.streak && <span className="streak-indicator">🔥</span>}
                                <div className="xp-bar">
                                    <div 
                                        className="xp-bar-fill"
                                        style={{ height: `${(day.xp / 200) * 100}%` }}
                                    />
                                </div>
                                <span className="xp-bar-label">{day.day}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Stats Section */}
                <div className="progress-card stats-card">
                    <h2>Learning Stats</h2>
                    <div className="stats-grid">
                        <div className="stat-item">
                            <div className="stat-icon">💡</div>
                            <div className="stat-info">
                                <span className="stat-value">{stats.quizzesCompleted}</span>
                                <span className="stat-label">Quizzes Completed</span>
                            </div>
                            <div className="stat-progress">
                                <div className="stat-progress-bar" style={{ width: '60%' }} />
                            </div>
                        </div>
                        <div className="stat-item">
                            <div className="stat-icon">🧠</div>
                            <div className="stat-info">
                                <span className="stat-value">{stats.cardsReviewed}</span>
                                <span className="stat-label">Cards Reviewed</span>
                            </div>
                            <div className="stat-progress">
                                <div className="stat-progress-bar" style={{ width: '80%' }} />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Skill Mastery */}
                <div className="progress-card mastery-card">
                    <h2>Skill Mastery</h2>
                    <div className="mastery-chart">
                        {skillMastery.map((skill, index) => (
                            <div key={index} className="mastery-item">
                                <div className="mastery-info">
                                    <span className="mastery-subject">{skill.subject}</span>
                                    <span className="mastery-percentage">{skill.mastery}%</span>
                                </div>
                                <div className="mastery-bar">
                                    <div 
                                        className="mastery-progress"
                                        style={{ width: `${skill.mastery}%` }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Encouragement Card */}
                <div className="progress-card encouragement-card">
                    <h2>Keep Going! 💫</h2>
                    <p className="encouragement-message">{getEncouragement()}</p>
                    <div className="quote">
                        "Progress, not perfection."
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProgressPage; 