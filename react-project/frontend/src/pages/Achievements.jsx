import React, { useState } from 'react';
import { Trophy, Star, BookOpen, Users, Calendar, Filter, ChevronDown, Lock, Sparkles, Zap, Target, Medal, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

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
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #1e1e2f 0%, #232526 100%)',
      color: '#f5f7fb',
      padding: '40px 24px',
      position: 'relative',
    }}>
      {/* Back Button */}
      <button
        onClick={() => navigate('/dashboard')}
        style={{
          marginBottom: 32,
          background: 'rgba(78,205,196,0.12)',
          border: '1.5px solid #4ECDC4',
          color: '#4ECDC4',
          borderRadius: 12,
          padding: '8px 18px 8px 12px',
          fontWeight: 600,
          fontSize: 16,
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          boxShadow: '0 2px 12px rgba(78,205,196,0.08)',
          cursor: 'pointer',
          zIndex: 10,
          position: 'static',
        }}
      >
        <ArrowLeft size={20} />
        Back to Dashboard
      </button>
      {/* Header Section */}
      <div style={{
        maxWidth: 1200,
        margin: '0 auto 40px',
        padding: '40px',
        background: 'rgba(255,255,255,0.03)',
        borderRadius: 24,
        border: '1.5px solid rgba(78,205,196,0.1)',
        boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
        position: 'relative',
        overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'radial-gradient(circle at top right, rgba(78,205,196,0.1), transparent 70%)',
          pointerEvents: 'none',
        }} />
        
        <div style={{ display: 'flex', alignItems: 'center', gap: 24, marginBottom: 32 }}>
          <div style={{ fontSize: 48 }}>🏆</div>
          <div>
            <h1 style={{ fontSize: 36, fontWeight: 700, marginBottom: 8 }}>Your Achievements</h1>
            <div style={{ fontSize: 18, color: '#888' }}>Memory Architect – Level 3</div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
          <div style={{ flex: 1 }}>
            <div style={{ 
              height: 8, 
              background: 'rgba(255,255,255,0.1)', 
              borderRadius: 4,
              overflow: 'hidden',
            }}>
              <div style={{
                width: `${(unlockedCount / totalCount) * 100}%`,
                height: '100%',
                background: 'linear-gradient(90deg, #4ECDC4, #45B7AF)',
                borderRadius: 4,
                transition: 'width 0.3s ease',
              }} />
            </div>
            <div style={{ marginTop: 8, fontSize: 14, color: '#888' }}>
              {unlockedCount} / {totalCount} Achievements Unlocked
            </div>
          </div>
          <div style={{ display: 'flex', gap: 12 }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 24, fontWeight: 700, color: '#4ECDC4' }}>23</div>
              <div style={{ fontSize: 14, color: '#888' }}>Total XP</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 24, fontWeight: 700, color: '#FFD93D' }}>5</div>
              <div style={{ fontSize: 14, color: '#888' }}>Level</div>
            </div>
          </div>
        </div>
      </div>

      {/* Filter & Sort Bar */}
      <div style={{
        maxWidth: 1200,
        margin: '0 auto 32px',
        display: 'flex',
        gap: 16,
        flexWrap: 'wrap',
      }}>
        <div style={{ display: 'flex', gap: 8, flex: 1 }}>
          {categories.map(category => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              style={{
                background: selectedCategory === category ? 'rgba(78,205,196,0.2)' : 'rgba(255,255,255,0.05)',
                border: '1.5px solid',
                borderColor: selectedCategory === category ? '#4ECDC4' : 'rgba(255,255,255,0.1)',
                borderRadius: 20,
                padding: '8px 16px',
                color: selectedCategory === category ? '#4ECDC4' : '#fff',
                cursor: 'pointer',
                transition: 'all 0.2s',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
              }}
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
        <div style={{ position: 'relative' }}>
          <button
            style={{
              background: 'rgba(255,255,255,0.05)',
              border: '1.5px solid rgba(255,255,255,0.1)',
              borderRadius: 20,
              padding: '8px 16px',
              color: '#fff',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <Filter size={16} />
            Sort by: {selectedSort}
            <ChevronDown size={16} />
          </button>
        </div>
      </div>

      {/* Achievement Grid */}
      <div style={{
        maxWidth: 1200,
        margin: '0 auto',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
        gap: 24,
      }}>
        {mockAchievements.map(achievement => (
          <div
            key={achievement.id}
            style={{
              background: 'rgba(255,255,255,0.03)',
              borderRadius: 16,
              padding: 24,
              border: '1.5px solid',
              borderColor: achievement.unlocked ? achievement.color : 'rgba(255,255,255,0.1)',
              transition: 'all 0.2s',
              cursor: 'pointer',
              position: 'relative',
              overflow: 'hidden',
            }}
            className="achievement-card"
          >
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: `radial-gradient(circle at top right, ${achievement.color}10, transparent 70%)`,
              pointerEvents: 'none',
            }} />
            
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16 }}>
              <div style={{
                width: 48,
                height: 48,
                background: achievement.unlocked ? achievement.color : 'rgba(255,255,255,0.1)',
                borderRadius: 12,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 24,
              }}>
                {achievement.icon}
              </div>
              <div>
                <div style={{ 
                  fontSize: 18, 
                  fontWeight: 600,
                  color: achievement.unlocked ? '#fff' : '#888',
                }}>
                  {achievement.title}
                </div>
                <div style={{ fontSize: 14, color: '#888' }}>
                  {achievement.category}
                </div>
              </div>
            </div>

            <div style={{ fontSize: 14, color: '#888', marginBottom: 16 }}>
              {achievement.description}
            </div>

            {!achievement.unlocked && (
              <div style={{ marginBottom: 16 }}>
                <div style={{ 
                  height: 4, 
                  background: 'rgba(255,255,255,0.1)', 
                  borderRadius: 2,
                  overflow: 'hidden',
                }}>
                  <div style={{
                    width: `${(achievement.progress / achievement.total) * 100}%`,
                    height: '100%',
                    background: achievement.color,
                    borderRadius: 2,
                  }} />
                </div>
                <div style={{ 
                  fontSize: 12, 
                  color: '#888',
                  marginTop: 4,
                  display: 'flex',
                  justifyContent: 'space-between',
                }}>
                  <span>Progress</span>
                  <span>{achievement.progress} / {achievement.total}</span>
                </div>
              </div>
            )}

            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 8,
              color: achievement.unlocked ? achievement.color : '#888',
              fontSize: 14,
            }}>
              {achievement.unlocked ? (
                <>
                  <Medal size={16} />
                  <span>Unlocked {achievement.unlockedDate}</span>
                </>
              ) : (
                <>
                  <Lock size={16} />
                  <span>Locked</span>
                </>
              )}
              <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 4 }}>
                <Zap size={16} />
                <span>{achievement.xp} XP</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add some CSS for animations */}
      <style>{`
        .achievement-card {
          transition: transform 0.2s, box-shadow 0.2s;
        }
        .achievement-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 24px rgba(0,0,0,0.2);
        }
      `}</style>
    </div>
  );
};

export default Achievements; 