import React, { useState } from 'react';
import { FiClock, FiBook, FiLock, FiUnlock, FiTrendingUp } from 'react-icons/fi';
import './ReviewCardsDashboard.css';

const ReviewCardsDashboard = ({ onStartReview }) => {
  // Mock data - replace with actual data from your backend
  const weeklyStats = {
    cardsReviewed: 245,
    timeStudied: '12h 45m',
    accuracy: 85,
    streak: 7,
    dailyProgress: [
      { day: 'Mon', count: 35 },
      { day: 'Tue', count: 42 },
      { day: 'Wed', count: 28 },
      { day: 'Thu', count: 45 },
      { day: 'Fri', count: 38 },
      { day: 'Sat', count: 32 },
      { day: 'Sun', count: 25 }
    ]
  };

  const upcomingReviews = [
    {
      id: 1,
      deck: 'Biology Basics',
      card: 'What is the powerhouse of the cell?',
      scheduledDate: new Date(),
      isLocked: false
    },
    {
      id: 2,
      deck: 'Chemistry Fundamentals',
      card: 'What is the atomic number of Carbon?',
      scheduledDate: new Date(Date.now() + 86400000), // tomorrow
      isLocked: true
    },
    {
      id: 3,
      deck: 'Physics Principles',
      card: 'What is Newton\'s First Law?',
      scheduledDate: new Date(Date.now() + 172800000), // day after tomorrow
      isLocked: true
    }
  ];

  return (
    <div className="review-dashboard">
      {/* Upcoming Reviews Widget */}
      <div className="upcoming-reviews-widget">
        <h2>Upcoming Reviews</h2>
        <div className="upcoming-cards">
          {upcomingReviews.map(review => (
            <div 
              key={review.id} 
              className={`review-card ${review.isLocked ? 'locked' : ''}`}
              onClick={() => !review.isLocked && onStartReview(review)}
            >
              <div className="card-header">
                <span className="deck-name">{review.deck}</span>
                {review.isLocked ? (
                  <FiLock className="lock-icon" />
                ) : (
                  <FiUnlock className="lock-icon" />
                )}
              </div>
              <div className="card-content">
                <p className="card-question">{review.card}</p>
                <span className="review-date">
                  {review.isLocked 
                    ? `Available ${review.scheduledDate.toLocaleDateString()}`
                    : 'Available Now'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Weekly Stats Widget */}
      <div className="stats-widget">
        <h2>Weekly Review Stats</h2>
        <div className="stats-grid">
          <div className="stat-card">
            <FiBook className="stat-icon" />
            <div className="stat-content">
              <span className="stat-value">{weeklyStats.cardsReviewed}</span>
              <span className="stat-label">Cards Reviewed</span>
            </div>
          </div>
          <div className="stat-card">
            <FiClock className="stat-icon" />
            <div className="stat-content">
              <span className="stat-value">{weeklyStats.timeStudied}</span>
              <span className="stat-label">Time Studied</span>
            </div>
          </div>
          <div className="stat-card">
            <FiTrendingUp className="stat-icon" />
            <div className="stat-content">
              <span className="stat-value">{weeklyStats.accuracy}%</span>
              <span className="stat-label">Accuracy</span>
            </div>
          </div>
          <div className="stat-card">
            <FiBook className="stat-icon" />
            <div className="stat-content">
              <span className="stat-value">{weeklyStats.streak}</span>
              <span className="stat-label">Day Streak</span>
            </div>
          </div>
        </div>
        <div className="weekly-progress">
          <h3>Daily Progress</h3>
          <div className="progress-bars">
            {weeklyStats.dailyProgress.map((day, index) => (
              <div key={index} className="progress-bar-container">
                <div 
                  className="progress-bar"
                  style={{ height: `${(day.count / 50) * 100}%` }}
                />
                <span className="day-label">{day.day}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReviewCardsDashboard; 