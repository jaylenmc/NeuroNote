import React, { useState } from 'react';
import { useAuth } from '../auth/AuthContext';
import { FiBook, FiLayers, FiCheckSquare } from 'react-icons/fi';
import Calendar from './Calendar';
import './Dashboard.css';

function Dashboard() {
    const { user, logout } = useAuth();
    const [activeTab, setActiveTab] = useState('notes');

    return (
        <div className="dashboard-container">
            {/* Left Sidebar */}
            <div className="dashboard-sidebar">
                <div className="sidebar-top">
                    <div className="workspace-header">
                        <h2 className="neuronote-title">NEURONOTE</h2>
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

                <div className="sidebar-bottom">
                    <div className="user-profile">
                        <div className="user-avatar">
                            {user?.email?.charAt(0).toUpperCase()}
                        </div>
                        <div className="user-info">
                            <div className="user-email">{user?.email}</div>
                            <div className="workspace-name">Personal</div>
                        </div>
                    </div>
                    <button onClick={logout} className="logout-button">
                        Sign Out
                    </button>
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
                    <div className="content-section">
                        <h2>Scheduled Flashcards</h2>
                        <div className="flashcards-container">
                            <div className="calendar-section">
                                <Calendar />
                            </div>
                            <div className="scheduled-cards">
                                {/* Scheduled cards for selected date will appear here */}
                            </div>
                        </div>
                    </div>
                )}
                {activeTab === 'quizzes' && (
                    <div className="content-section">
                        <h2>My Quizzes</h2>
                        {/* Quizzes content will go here */}
                    </div>
                )}
            </div>
        </div>
    );
}

export default Dashboard; 