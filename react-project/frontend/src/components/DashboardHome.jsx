import React, { useState, useEffect } from 'react';
import { useAuth } from '../auth/AuthContext';
import { 
  Trophy, Brain, Users, MessageSquare, Crown, Medal, Sparkles, 
  Flame, Target, Star, CheckCircle, Clock, ChevronRight, Plus,
  Zap, BookOpen, TrendingUp, Award, Rocket, Coffee
} from 'lucide-react';
import './DashboardHome.css';
import { useNavigate } from 'react-router-dom';

const DashboardHome = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    studyStreak: 7,
    xpPoints: 2450,
    level: 5,
    nextLevelXp: 500,
    bonusXp: 50
  });

  // Stock data for demonstration
  const stockAchievements = [
    {
      name: "Knowledge Explorer",
      description: "Completed 10 study sessions",
      type: "knowledge",
      tier: "bronze",
      progress: 80,
      isNew: true
    },
    {
      name: "Streak Master",
      description: "Maintained a 7-day study streak",
      type: "streak",
      tier: "silver",
      progress: 100,
      isNew: false
    },
    {
      name: "Social Butterfly",
      description: "Joined 5 study groups",
      type: "social",
      tier: "gold",
      progress: 60,
      isNew: false
    }
  ];

  const stockCollaborations = [
    {
      name: "Advanced Math Study Group",
      description: "Working on calculus and linear algebra",
      members: [
        { name: "Alex", color: "#FF6B6B" },
        { name: "Sam", color: "#4ECDC4" },
        { name: "Jordan", color: "#45B7AF" }
      ],
      isLive: true
    },
    {
      name: "Computer Science Club",
      description: "Data structures and algorithms",
      members: [
        { name: "Taylor", color: "#FFD93D" },
        { name: "Casey", color: "#6C5CE7" }
      ],
      isLive: false
    }
  ];

  const stockLeaderboard = [
    { name: "Alex", points: 5000, color: "#FFD700" },
    { name: "Sam", points: 4800, color: "#C0C0C0" },
    { name: "Jordan", points: 4500, color: "#CD7F32" },
    { name: "Taylor", points: 4200, color: "#4ECDC4" }
  ];

  const stockChats = [
    {
      name: "Math Help",
      lastMessage: "Can someone explain derivatives?",
      unread: 3,
      activeMembers: 12
    },
    {
      name: "CS Study Group",
      lastMessage: "Let's review sorting algorithms",
      unread: 1,
      activeMembers: 8
    }
  ];

  const stockActivity = [
    {
      message: "Alex earned the 'Knowledge Explorer' badge",
      time: "2m ago",
      color: "#FFD700",
      icon: <Trophy size={20} />
    },
    {
      message: "Sam completed a 2-hour study session",
      time: "15m ago",
      color: "#4ECDC4",
      icon: <Clock size={20} />
    },
    {
      message: "New study group 'Physics Club' created",
      time: "1h ago",
      color: "#6C5CE7",
      icon: <Users size={20} />
    }
  ];

  const [achievements] = useState(stockAchievements);
  const [collaborations] = useState(stockCollaborations);
  const [leaderboard] = useState(stockLeaderboard);
  const [studyChats] = useState(stockChats);
  const [recentActivity] = useState(stockActivity);

  const getUsername = () => {
    if (!user?.email) return 'User';
    return user.email.split('@')[0];
  };

  const getAchievementIcon = (type) => {
    switch (type) {
      case 'knowledge': return <Brain size={24} />;
      case 'streak': return <Flame size={24} />;
      case 'mastery': return <Target size={24} />;
      case 'social': return <Users size={24} />;
      default: return <Trophy size={24} />;
    }
  };

  const getAchievementTier = (tier) => {
    switch (tier) {
      case 'bronze': return '#cd7f32';
      case 'silver': return '#c0c0c0';
      case 'gold': return '#ffd700';
      default: return '#4ecdc4';
    }
  };

  const xpForLevel = (level) => Math.floor(100 * Math.pow(1.5, level - 1));
  const xp = user?.xp || 0;
  const level = user?.level || 1;
  const nextLevelXp = xpForLevel(level);
  const progress = Math.min((xp / nextLevelXp) * 100, 100);

  return (
    <div className="dashboard-home-container">
      {/* Background Elements */}
      <div className="background-blobs">
        <div className="blob blob-1"></div>
        <div className="blob blob-2"></div>
        <div className="blob blob-3"></div>
      </div>

      {/* Welcome Section */}
      <div className="dashboard-greeting">
        <div className="avatar-area">
          <div className="avatar-circle">
            {user?.profile_picture ? (
              <img src={user.profile_picture} alt="Profile" />
            ) : (
              <Brain size={32} className="avatar-icon" />
            )}
            <div className="avatar-glow"></div>
          </div>
        </div>
        <div className="greeting-area">
          <h1 className="greeting-title">
            Welcome back, {getUsername()} 👋
          </h1>
          <p className="greeting-subtitle">Ready to crush your goals today?</p>
          <div className="streak-area">
            <Flame size={20} className="streak-icon" />
            <span className="streak-count">{stats.studyStreak} day streak</span>
            {stats.studyStreak >= 3 && (
              <span className="bonus-badge">
                +{stats.bonusXp} XP Bonus
              </span>
            )}
          </div>
        </div>
      </div>

      {/* XP Progress */}
      <div className="dashboard-xp">
        <div className="section-header">
          <h2><Zap size={24} /> XP Progress</h2>
          <p>Level up your learning journey</p>
        </div>
        <div className="xp-container">
          <div className="xp-ring">
            <svg viewBox="0 0 100 100">
              <circle className="xp-ring-bg" cx="50" cy="50" r="45" />
              <circle 
                className="xp-ring-progress" 
                cx="50" 
                cy="50" 
                r="45"
                style={{
                  strokeDasharray: `${(progress / 100) * 283} 283`
                }}
              />
            </svg>
            <div className="xp-center">
              <span className="xp-level">Level {level}</span>
              <span className="xp-points">{xp} / {nextLevelXp} XP</span>
            </div>
          </div>
          <div className="xp-next">
            <span>{nextLevelXp - xp} XP to Level {level + 1}</span>
          </div>
        </div>
      </div>

      {/* Achievements Section */}
      <div className="dashboard-achievements">
        <div className="section-header">
          <div className="achievements-header">
            <div className="achievements-title">
              <h2><Trophy size={24} /> Achievements</h2>
              <p>Track your learning milestones and accomplishments</p>
            </div>
            <button 
              className="view-achievements-btn"
              onClick={() => navigate('/achievements')}
            >
              View Achievements
            </button>
          </div>
        </div>
        <div className="achievements-grid">
          {achievements.map((achievement, index) => (
            <div key={index} className={`achievement-card ${achievement.isNew ? 'new' : ''}`}>
              <div className="achievement-icon" style={{ background: getAchievementTier(achievement.tier) }}>
                {getAchievementIcon(achievement.type)}
                {achievement.isNew && <Sparkles className="sparkle" />}
              </div>
              <h3>{achievement.name}</h3>
              <p>{achievement.description}</p>
              <div className="achievement-progress">
                <div className="progress-bar">
                  <div 
                    className="progress-fill" 
                    style={{ width: `${achievement.progress}%` }}
                  />
                </div>
                <span>{achievement.progress}%</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Collaborations Section */}
      <div className="dashboard-collaborations">
        <div className="section-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h2 style={{ display: 'flex', alignItems: 'center', gap: 8 }}><Users size={24} /> Study Groups</h2>
            <p>Connect with peers and study together</p>
          </div>
          <button
            className="view-study-groups-btn"
            style={{ marginLeft: 'auto', padding: '8px 16px', borderRadius: '6px', background: '#4ECDC4', color: '#fff', border: 'none', fontWeight: 500, fontSize: '1rem', cursor: 'pointer' }}
            onClick={() => navigate('/study-groups')}
          >
            View Study Groups
          </button>
        </div>
        <div className="collaborations-grid">
          {collaborations.map((collab, index) => (
            <div key={index} className="collaboration-card">
              <div className="collab-header">
                <div className="collab-avatars">
                  {collab.members.map((member, i) => (
                    <div key={i} className="collab-avatar" style={{ background: member.color }}>
                      {member.name[0]}
                    </div>
                  ))}
                </div>
                {collab.isLive && (
                  <span className="live-badge">
                    <Clock size={14} /> Live
                  </span>
                )}
              </div>
              <h3>{collab.name}</h3>
              <p>{collab.description}</p>
              <div className="collab-actions">
                <button className="join-btn">
                  <Users size={16} /> Join Session
                </button>
                <button className="message-btn">
                  <MessageSquare size={16} /> Message
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Leaderboard Section */}
      <div className="dashboard-leaderboard">
        <div className="section-header">
          <h2><Crown size={24} /> Leaderboard</h2>
          <p>Top performers this week</p>
        </div>
        <div className="leaderboard-list">
          {leaderboard.map((entry, index) => (
            <div key={index} className="leaderboard-item">
              <div className="rank-badge" style={{ background: index < 3 ? getAchievementTier(['gold', 'silver', 'bronze'][index]) : '#4ecdc4' }}>
                {index + 1}
              </div>
              <div className="user-avatar" style={{ background: entry.color }}>
                {entry.name[0]}
              </div>
              <div className="user-info">
                <h4>{entry.name}</h4>
                <p>{entry.points} points</p>
              </div>
              {index < 3 && <Medal size={20} color={getAchievementTier(['gold', 'silver', 'bronze'][index])} />}
            </div>
          ))}
        </div>
      </div>

      {/* Study Chat Rooms Section */}
      <div className="dashboard-chats">
        <div className="section-header">
          <h2><MessageSquare size={24} /> Study Chat Rooms</h2>
          <p>Join active study groups and discussions</p>
        </div>
        <div className="chats-grid">
          {studyChats.map((chat, index) => (
            <div key={index} className="chat-card">
              <div className="chat-header">
                <h3>{chat.name}</h3>
                {chat.unread > 0 && (
                  <span className="unread-badge">{chat.unread} new</span>
                )}
              </div>
              <p className="last-message">{chat.lastMessage}</p>
              <div className="chat-meta">
                <span>{chat.activeMembers} active</span>
                <button className="join-chat-btn">
                  <MessageSquare size={16} /> Join Chat
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Activity Feed */}
      <div className="dashboard-activity">
        <div className="section-header">
          <h2><Clock size={24} /> Recent Activity</h2>
          <p>Latest updates from your network</p>
        </div>
        <div className="activity-feed">
          {recentActivity.map((activity, index) => (
            <div key={index} className="activity-item">
              <div className="activity-icon" style={{ background: activity.color }}>
                {activity.icon}
              </div>
              <div className="activity-content">
                <p>{activity.message}</p>
                <span className="activity-time">{activity.time}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DashboardHome; 