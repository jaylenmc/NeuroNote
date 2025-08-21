import React from 'react';
import { FiShare2, FiStar, FiMoreVertical, FiUsers } from 'react-icons/fi';

const Navbar = ({ 
    currentNavIndex, 
    navHistory, 
    getCurrentViewTitle, 
    handleBack, 
    handleForward, 
    handleShare, 
    handleStar, 
    handleSettingsClick, 
    handleCollab, 
    showSettingsDropdown 
}) => {
    return (
        <div className="main-horizontal-navbar">
            <div className="navbar-left">
                <button 
                    className={`action-icon-button ${currentNavIndex <= 0 ? 'disabled' : ''}`}
                    onClick={handleBack}
                    disabled={currentNavIndex <= 0}
                >
                    &lt;
                </button>
                <button 
                    className={`action-icon-button ${currentNavIndex >= navHistory.length - 1 ? 'disabled' : ''}`}
                    onClick={handleForward}
                    disabled={currentNavIndex >= navHistory.length - 1}
                >
                    &gt;
                </button>
                <div className="navbar-title">{getCurrentViewTitle()}</div>
            </div>
            <div className="dashboard-actions">
                <button className="action-icon-button" onClick={handleShare}>
                    <FiShare2 />
                </button>
                <button className="action-icon-button" onClick={handleStar}>
                    <FiStar />
                </button>
                <div className="settings-container">
                    <button className="action-icon-button" onClick={handleSettingsClick}>
                        <FiMoreVertical />
                    </button>
                    {showSettingsDropdown && (
                        <div className="settings-dropdown show">
                            {/* ... existing dropdown content ... */}
                        </div>
                    )}
                </div>
                <button className="action-icon-button" onClick={handleCollab}>
                    <FiUsers />
                </button>
            </div>
        </div>
    );
};

export default Navbar; 