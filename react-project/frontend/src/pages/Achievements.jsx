import React, { useState } from 'react';
import { Trophy, Star, BookOpen, Users, Calendar, Filter, ChevronDown, Lock, Sparkles, Zap, Target, Medal, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './Achievements.css';

// Mock data for achievements
const mockAchievements = [
  {
    id: 1,
    title: "Flashcard Fiend",
    description: "Reviewed 100 cards in a week",
    icon: "📚",
    category: "Flashcards",
    progress: 100,
    total: 100,
    unlocked: true,
    unlockedDate: "2024-03-15",
    xp: 500,
    color: "#4ECDC4"
  },
  {
    id: 2,
    title: "Group Study Guru",
    description: "Participated in 5 study groups",
    icon: "👥",
    category: "Study Groups",
    progress: 3,
    total: 5,
    unlocked: false,
    xp: 750,
    color: "#FFD93D"
  },
  {
    id: 3,
    title: "Quiz Master",
    description: "Scored 90% or higher in 10 quizzes",
    icon: "🎯",
    category: "Quizzes",
    progress: 7,
    total: 10,
    unlocked: false,
    xp: 1000,
    color: "#FF6B6B"
  },
  {
    id: 4,
    title: "Consistency King",
    description: "Studied for 7 days straight",
    icon: "🔥",
    category: "Consistency",
    progress: 5,
    total: 7,
    unlocked: false,
    xp: 600,
    color: "#7C83FD"
  },
  // Add more mock achievements...
];

const categories = ["All", "Flashcards", "Study Groups", "Quizzes", "Consistency"];
const sortOptions = ["Most Recent", "Hardest", "Locked/Unlocked", "Type"];

const Achievements = () => {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedSort, setSelectedSort] = useState("Most Recent");
  const navigate = useNavigate();

  const unlockedCount = mockAchievements.filter(a => a.unlocked).length;
  const totalCount = mockAchievements.length;

  return (
    <div className="achievements-page">
      {/* Back Button */}
      <button
        onClick={() => navigate('/dashboard')}
        className="back-to-dashboard-btn"
      >
        <ArrowLeft size={20} />
        Back to Dashboard
      </button>

      {/* Header Section */}
      <div className="achievements-header">
        <div className="header-gradient-bg" />
        
        <div className="header-title-section">
          <div className="header-icon">🏆</div>
          <div>
            <h1 className="header-title">Your Achievements</h1>
            <div className="header-subtitle">Memory Architect – Level 3</div>
          </div>
        </div>

        <div className="header-progress-section">
          <div className="progress-bar-container">
            <div 
                className="progress-bar-fill"
                style={{width: `${(unlockedCount / totalCount) * 100}%`}}
            />
          </div>
          <div className="progress-label">
            {unlockedCount} / {totalCount} Achievements Unlocked
          </div>

          <div className="header-stats">
              <div className="stat-item">
                  <div className="stat-value" style={{color: '#4ECDC4'}}>23</div>
                  <div className="stat-label">Total XP</div>
              </div>
              <div className="stat-item">
                  <div className="stat-value" style={{color: '#FFD93D'}}>5</div>
                  <div className="stat-label">Level</div>
              </div>
          </div>
        </div>
      </div>

      {/* Filter & Sort Bar */}
      <div className="filter-sort-bar">
        <div className="category-filters">
          {categories.map(category => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`category-btn ${selectedCategory === category ? 'active' : ''}`}
            >
              {category === "All" && <Trophy size={16} />}
              {category === "Flashcards" && <BookOpen size={16} />}
              {category === "Study Groups" && <Users size={16} />}
              {category === "Quizzes" && <Target size={16} />}
              {category === "Consistency" && <Calendar size={16} />}
              {category}
            </button>
          ))}
        </div>
        <div className="sort-menu">
          <button className="sort-btn">
            <Filter size={16} />
            Sort by: {selectedSort}
            <ChevronDown size={16} />
          </button>
        </div>
      </div>

      {/* Achievement Grid */}
      <div className="achievement-grid">
        {mockAchievements.map(achievement => (
          <div
            key={achievement.id}
            className={`achievement-card ${achievement.unlocked ? 'unlocked' : 'locked'}`}
            style={{'--achievement-color': achievement.unlocked ? achievement.color : '#444'}}
          >
            <div className="card-bg-glow" />
            
            {!achievement.unlocked && (
                <div className="lock-overlay">
                    <Lock size={48} />
                </div>
            )}

            <div className="card-content">
                <div className="card-icon">{achievement.icon}</div>
                <h3 className="card-title">{achievement.title}</h3>
                <p className="card-description">{achievement.description}</p>

                <div className="card-progress-bar-container">
                    <div 
                        className="card-progress-bar-fill"
                        style={{width: `${(achievement.progress / achievement.total) * 100}%`}}
                    />
                </div>
                <div className="card-progress-label">
                    {achievement.progress} / {achievement.total}
                </div>

                <div className="card-footer">
                    <span className="card-category">{achievement.category}</span>
                    <span className="card-xp">
                        <Sparkles size={14} /> {achievement.xp} XP
                    </span>
                </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Achievements; 