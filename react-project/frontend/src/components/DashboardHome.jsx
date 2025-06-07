import React from 'react';
import { User, Flame, BarChart2, Clock, Star, BookOpen, ArrowRight, Sparkles } from 'lucide-react';
import './DashboardHome.css';

const recentDecks = [
  { id: 1, title: 'Biology', subject: 'Biology', emoji: '🧬' },
  { id: 2, title: 'Calculus', subject: 'Math', emoji: '📐' },
  { id: 3, title: 'Chemistry', subject: 'Chemistry', emoji: '🧪' },
];

const nextReviews = [
  { id: 1, question: 'What is mitosis?', deck: 'Biology', due: 'in 2h' },
  { id: 2, question: 'Define derivative.', deck: 'Calculus', due: 'in 3h' },
  { id: 3, question: 'Avogadro number?', deck: 'Chemistry', due: 'in 5h' },
];

export default function DashboardHome() {
  // Placeholder stats
  const user = { name: 'Jaylen', streak: 5, avatar: null };
  const stats = { reviewed: 34, time: 42 };
  const xp = 320, xpMax = 500;

  return (
    <div className="dashboard-home-container">
      {/* Greeting & Streak */}
      <div className="dashboard-row dashboard-greeting glass-card">
        <div className="avatar-area">
          <div className="avatar-circle">
            {user.avatar ? <img src={user.avatar} alt="avatar" /> : <User size={32} />}
          </div>
        </div>
        <div className="greeting-area">
          <div className="greeting-title">🎯 Welcome Back, <b>{user.name}!</b></div>
          <div className="streak-area"><Flame color="#ff9800" /> <span>{user.streak}-day streak</span></div>
        </div>
      </div>

      {/* Stats Today */}
      <div className="dashboard-row dashboard-stats glass-card">
        <div className="stat-block">
          <BarChart2 size={20} />
          <div className="stat-label">Cards Reviewed</div>
          <div className="stat-value">{stats.reviewed}</div>
        </div>
        <div className="stat-block">
          <Clock size={20} />
          <div className="stat-label">Time Studied</div>
          <div className="stat-value">{stats.time} min</div>
        </div>
      </div>

      {/* Recent Decks */}
      <div className="dashboard-row dashboard-recent glass-card">
        <div className="section-title">🗂️ Recent Decks</div>
        <div className="recent-decks-list">
          {recentDecks.map(deck => (
            <div className="recent-deck-card" key={deck.id}>
              <span className="deck-emoji">{deck.emoji}</span>
              <div className="deck-title">{deck.title}</div>
              <div className="deck-subject">{deck.subject}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Next Reviews Due */}
      <div className="dashboard-row dashboard-next glass-card">
        <div className="section-title">⏰ Next Reviews Due</div>
        <div className="next-reviews-list">
          {nextReviews.map(card => (
            <div className="next-review-card" key={card.id}>
              <div className="review-question">{card.question}</div>
              <div className="review-meta">{card.deck} • {card.due}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Streak & XP Progress */}
      <div className="dashboard-row dashboard-xp glass-card">
        <div className="section-title">🌟 Streak & XP Progress</div>
        <div className="xp-bar">
          <div className="xp-fill" style={{ width: `${(xp / xpMax) * 100}%` }} />
        </div>
        <div className="xp-label">XP: {xp} / {xpMax}</div>
      </div>

      {/* Suggested Action */}
      <div className="dashboard-row dashboard-cta glass-card">
        <div className="cta-content">
          <Sparkles size={24} />
          <div className="cta-text">✨ Suggested Action: <b>Review 20 cards now!</b></div>
          <button className="cta-btn">
            Start Reviewing <ArrowRight size={18} />
          </button>
        </div>
      </div>
    </div>
  );
} 