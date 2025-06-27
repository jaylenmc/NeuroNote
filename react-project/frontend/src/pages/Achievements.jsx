import React, { useState, useEffect } from 'react';
import { Trophy, Star, BookOpen, Users, Calendar, Filter, ChevronDown, Lock, Sparkles, Zap, Target, Medal, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './Achievements.css';
import { makeAuthenticatedRequest } from '../utils/api';

const sortOptions = ["Most Recent", "Hardest", "Locked/Unlocked", "Type"];

const Achievements = () => {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedSort, setSelectedSort] = useState("Most Recent");
  const [achievements, setAchievements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAchievements = async () => {
      setLoading(true);
      setError(null);
      try {
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/';
        const response = await makeAuthenticatedRequest(`${apiUrl}achievements/user/`);
        if (!response) throw new Error('No response from server');
        if (!response.ok) throw new Error(await response.text());
        const data = await response.json();
        setAchievements(data);
      } catch (err) {
        setError(err.message || 'Failed to fetch achievements');
      } finally {
        setLoading(false);
      }
    };
    fetchAchievements();
  }, []);

  // Generate categories from achievement families
  const getCategories = () => {
    const families = [...new Set(achievements.map(a => a.family).filter(Boolean))];
    return ["All", "General", ...families];
  };

  const categories = getCategories();

  // Filter achievements based on selected category
  const filteredAchievements = selectedCategory === "All" 
    ? achievements 
    : selectedCategory === "General"
    ? achievements.filter(achievement => !achievement.family || achievement.family === "General")
    : achievements.filter(achievement => achievement.family === selectedCategory);

  const unlockedCount = achievements.filter(a => a.unlocked).length;
  const totalCount = achievements.length;

  const getCategoryIcon = (category) => {
    switch (category) {
      case "All": return <Trophy size={16} />;
      case "General": return <Star size={16} />;
      case "Flashcards": return <BookOpen size={16} />;
      case "Study Groups": return <Users size={16} />;
      case "Quizzes": return <Target size={16} />;
      case "Consistency": return <Calendar size={16} />;
      default: return <Star size={16} />;
    }
  };

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
                style={{width: `${totalCount ? (unlockedCount / totalCount) * 100 : 0}%`}}
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
              {getCategoryIcon(category)}
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
        {loading && <div>Loading achievements...</div>}
        {error && <div style={{color: 'red'}}>Error: {error}</div>}
        {!loading && !error && filteredAchievements.map(achievement => (
          <div
            key={achievement.id || achievement.name}
            className={`achievement-card ${achievement.unlocked ? 'unlocked' : 'locked'}`}
            style={{'--achievement-color': achievement.unlocked ? (achievement.color || '#4ECDC4') : '#444'}}
          >
            <div className="card-bg-glow" />

            <div className="card-content">
                <div className="card-icon">{achievement.icon || '🏆'}</div>
                <h3 className="card-title">{achievement.title || achievement.name}</h3>
                <p className="card-description">{achievement.description}</p>

                <div className="card-progress-bar-container">
                    <div 
                        className="card-progress-bar-fill"
                        style={{width: `${achievement.total ? (achievement.progress / achievement.total) * 100 : 0}%`}}
                    />
                </div>
                <div className="card-progress-label">
                    {achievement.progress} / {achievement.total}
                </div>

                <div className="card-footer">
                    <span className="card-category">{achievement.category || achievement.tier || achievement.family || ''}</span>
                    <span className="card-xp">
                        <Sparkles size={14} /> {achievement.xp || ''} XP
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