import React, { useState } from 'react';
import { useAuth } from '../auth/AuthContext';
import { FiBook, FiLayers, FiCheckSquare, FiSettings, FiLogOut } from 'react-icons/fi';
import Calendar from './Calendar';
import DeckManager from './DeckManager';
import UpcomingReviews from './UpcomingReviews';
import './Dashboard.css';

function Dashboard() {
    const { user, logout } = useAuth();
    const [activeTab, setActiveTab] = useState('notes');
    const [flashcardTab, setFlashcardTab] = useState('dashboard');
    const [showDropdown, setShowDropdown] = useState(false);

    return (
        <div className="dashboard-container">
            {/* Left Sidebar */}
            <div className="dashboard-sidebar">
                <div className="sidebar-top">
                    <div className="workspace-header">
                        <div className="user-profile" onClick={() => setShowDropdown(!showDropdown)}>
                            <div className="user-avatar">
                                {user?.email?.charAt(0).toUpperCase()}
                            </div>
                            <div className="user-info">
                                <div className="user-email">{user?.email}</div>
                                <div className="workspace-name">Personal</div>
                            </div>
                        </div>
                        {showDropdown && (
                            <div className="profile-dropdown">
                                <div className="dropdown-menu">
                                    <button className="dropdown-item">
                                        <FiSettings className="dropdown-icon" />
                                        Settings
                                    </button>
                                    <div className="dropdown-divider"></div>
                                    <button className="logout-button" onClick={logout}>
                                        <FiLogOut className="dropdown-icon" />
                                        Log out of NeuroNote
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <div className="sidebar-content">
                    <div 
                        className={`nav-item ${activeTab === 'notes' ? 'active' : ''}`}
                        onClick={() => setActiveTab('notes')}
                    >
                        <FiBook className="nav-icon" />
                        <span>Notes</span>
                    </div>

                    <div 
                        className={`nav-item ${activeTab === 'flashcards' ? 'active' : ''}`}
                        onClick={() => setActiveTab('flashcards')}
                    >
                        <FiLayers className="nav-icon" />
                        <span>Flashcards</span>
                    </div>

                    <div 
                        className={`nav-item ${activeTab === 'quizzes' ? 'active' : ''}`}
                        onClick={() => setActiveTab('quizzes')}
                    >
                        <FiCheckSquare className="nav-icon" />
                        <span>Quizzes</span>
                    </div>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="dashboard-content">
                {activeTab === 'notes' && (
                    <div className="content-section">
                        <h2>My Notes</h2>
                        {/* Notes content will go here */}
                    </div>
                )}
                {activeTab === 'flashcards' && (
                    <div className="notion-center-container">
                        <div className="calendar-upcoming-row">
                            <div className="calendar-widget">
                                <Calendar />
                            </div>
                            <UpcomingReviews />
                        </div>
                        <div className="flashcard-tabs">
                            <button 
                                className={`flashcard-tab ${flashcardTab === 'dashboard' ? 'active' : ''}`}
                                onClick={() => setFlashcardTab('dashboard')}
                            >
                                Dashboard
                            </button>
                            <button 
                                className={`flashcard-tab ${flashcardTab === 'decks' ? 'active' : ''}`}
                                onClick={() => setFlashcardTab('decks')}
                            >
                                Decks
                            </button>
                            <button 
                                className={`flashcard-tab ${flashcardTab === 'statistics' ? 'active' : ''}`}
                                onClick={() => setFlashcardTab('statistics')}
                            >
                                Statistics
                            </button>
                        </div>
                        <div className="flashcard-content">
                            {flashcardTab === 'dashboard' && (
                                <div className="dashboard-tab">
                                    {/* You can add dashboard-specific content here if needed */}
                                </div>
                            )}
                            {flashcardTab === 'decks' && (
                                <div className="decks-tab">
                                    <DeckManager />
                                </div>
                            )}
                            {flashcardTab === 'statistics' && (
                                <div className="statistics-tab">
                                    <h2>Statistics</h2>
                                    <p>Coming soon...</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}
                {activeTab === 'quizzes' && (
                    <div className="content-section">
                        <h2>Quizzes</h2>
                        <p>Coming soon...</p>
                    </div>
                )}
            </div>
        </div>
    );
}

export default Dashboard; 