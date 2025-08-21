import React from 'react';
import { FiHome, FiBook, FiPlus, FiSettings, FiLogOut, FiAward, FiUsers } from 'react-icons/fi';
import closedFolderIcon from '../assets/ClosedFolder.svg';
import openFolderIcon from '../assets/OpenFolder.svg';

const Sidebar = ({
    user,
    showDropdown,
    setShowDropdown,
    logout,
    navigate,
    location,
    folders,
    selectedFolder,
    activeView,
    expandedFolders,
    setShowNewFolderModal,
    handleFolderClick,
    toggleFolder,
    setSidebarContextMenu
}) => {
    return (
        <div className={`dashboard-sidebar ${activeView === 'dashboard' ? 'dashboard-home-active' : ''}`}>
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
                    className={`nav-item ${location.pathname === '/dashboard' ? 'active' : ''}`}
                    onClick={() => navigate('/dashboard')}
                >
                    <FiHome className="nav-icon" />
                    <span>Home</span>
                </div>
                <div 
                    className={`nav-item ${location.pathname === '/night-owl-flashcards' ? 'active' : ''}`}
                    onClick={() => navigate('/night-owl-flashcards')}
                >
                    <FiBook className="nav-icon" />
                    <span>Flashcards</span>
                </div>
                <div 
                    className={`nav-item ${location.pathname === '/achievements' ? 'active' : ''}`}
                    onClick={() => navigate('/achievements')}
                >
                    <FiAward className="nav-icon" />
                    <span>Achievements</span>
                </div>
                <div 
                    className={`nav-item ${location.pathname === '/study-groups' ? 'active' : ''}`}
                    onClick={() => navigate('/study-groups')}
                >
                    <FiUsers className="nav-icon" />
                    <span>Study Groups</span>
                </div>
                <div className="folders-section">
                    <div className="folders-header">
                        <h3>Folders</h3>
                        <button className="create-folder-btn" onClick={() => setShowNewFolderModal(true)}>
                            <FiPlus />
                        </button>
                    </div>
                    <div className="folders-list">
                        {folders.map(folder => (
                            <div key={folder.id}>
                                <div 
                                    className={`folder-item ${selectedFolder?.id === folder.id && activeView === 'folder' ? 'active' : ''}`}
                                    onClick={(e) => handleFolderClick(folder.id, e)}
                                    onContextMenu={(e) => {
                                        e.preventDefault();
                                        setSidebarContextMenu({ show: true, x: e.clientX, y: e.clientY, folderId: folder.id });
                                    }}
                                >
                                    <button 
                                        className={`folder-expand-btn ${expandedFolders[folder.id] ? 'expanded' : ''}`}
                                        onClick={(e) => toggleFolder(folder.id, e)}
                                    >
                                        &gt;
                                    </button>
                                    <img 
                                        src={expandedFolders[folder.id] ? openFolderIcon : closedFolderIcon} 
                                        alt="folder" 
                                        className="folder-icon"
                                    />
                                    <span className="folder-name" title={folder.name}>{folder.name}</span>
                                </div>
                                {expandedFolders[folder.id] && (
                                    <div className={`folder-contents ${expandedFolders[folder.id] ? 'expanded' : ''}`}>
                                        {/* Render subfolders first, directly under folder-contents */}
                                        {folder.sub_folders && folder.sub_folders.map(subfolder => (
                                            <div key={subfolder.id} className="subfolder-item">
                                                <div 
                                                    className={`folder-item subfolder ${selectedFolder?.id === subfolder.id && activeView === 'folder' ? 'active' : ''}`}
                                                    onClick={(e) => { console.log('Subfolder click:', subfolder.id); handleFolderClick(subfolder.id, e); }}
                                                    onContextMenu={(e) => {
                                                        e.preventDefault();
                                                        setSidebarContextMenu({ show: true, x: e.clientX, y: e.clientY, folderId: subfolder.id });
                                                    }}
                                                    style={{ fontSize: '12px' }}
                                                >
                                                    <button
                                                        className={`folder-expand-btn${expandedFolders[subfolder.id] ? ' expanded' : ''}`}
                                                        onClick={(e) => { e.stopPropagation(); toggleFolder(subfolder.id, e); }}
                                                    >
                                                        {expandedFolders[subfolder.id] ? 'v' : '>'}
                                                    </button>
                                                    <img 
                                                        src={expandedFolders[subfolder.id] ? openFolderIcon : closedFolderIcon} 
                                                        alt="subfolder" 
                                                        className="folder-icon"
                                                        style={{ width: '14px', height: '14px' }}
                                                    />
                                                    <span className="folder-name" title={subfolder.name}>
                                                        {subfolder.name.length > 10 ? subfolder.name.slice(0, 7) + '...' : subfolder.name}
                                                    </span>
                                                </div>
                                                {expandedFolders[subfolder.id] && (
                                                    <div className={`folder-contents expanded`}>
                                                        {/* Recursively render subfolders and items for this subfolder */}
                                                        {subfolder.sub_folders && subfolder.sub_folders.map(childSubfolder => (
                                                            <div key={childSubfolder.id} className="subfolder-item">
                                                                <div 
                                                                    className={`folder-item subfolder ${selectedFolder?.id === childSubfolder.id && activeView === 'folder' ? 'active' : ''}`}
                                                                    onClick={(e) => { console.log('Subfolder click:', childSubfolder.id); handleFolderClick(childSubfolder.id, e); }}
                                                                    onContextMenu={(e) => {
                                                                        e.preventDefault();
                                                                        setSidebarContextMenu({ show: true, x: e.clientX, y: e.clientY, folderId: childSubfolder.id });
                                                                    }}
                                                                    style={{ fontSize: '12px' }}
                                                                >
                                                                    <img 
                                                                        src={closedFolderIcon} 
                                                                        alt="subfolder" 
                                                                        className="folder-icon"
                                                                        style={{ width: '14px', height: '14px' }}
                                                                    />
                                                                    <span className="folder-name" title={childSubfolder.name}>
                                                                        {childSubfolder.name.length > 10 ? childSubfolder.name.slice(0, 7) + '...' : childSubfolder.name}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        ))}
                                                        {/* Render items for this subfolder if any */}
                                                        {subfolder.items && subfolder.items.length > 0 && renderFolderItems(subfolder)}
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                        {/* Render folder items (documents, decks, etc.) but do NOT show empty state in sidebar */}
                                        {folder.items && folder.items.length > 0 && renderFolderItems(folder)}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Sidebar; 