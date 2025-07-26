import React from 'react';
import { FiFileText, FiEdit2, FiPlus, FiUpload, FiGrid, FiList } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import deckIcon from '../assets/deck.svg';
import testIcon from '../assets/test.svg';
import { formatDateForDisplay } from '../utils/dateUtils';
import './FolderView.css';

const FolderView = ({
    selectedFolder,
    viewMode,
    setViewMode,
    showNewItemDropdown,
    setShowNewItemDropdown,
    handleAddItem,
    handleDeckClick,
    handleQuizClick,
    handleContextMenu,
    getFolderItemCount
}) => {
    const navigate = useNavigate();
    
    const handleCreateDocument = () => {
        // Create a new document and redirect to notes editor
        const newDocument = {
            id: Date.now(),
            title: 'Untitled Document',
            type: 'document',
            created_at: new Date().toISOString()
        };
        // Navigate to notes editor with document data and folderId
        navigate('/notes-editor', { state: { openNotes: true, document: newDocument, folderId: selectedFolder.id } });
    };
    if (!selectedFolder) return null;

    const renderFolderItems = (folder) => {
        if (!folder.items || folder.items.length === 0) {
            return (
                <div className="empty-state">
                    <div className="empty-state-content">
                        <div className="empty-state-icon">📁</div>
                        <h3>This folder is empty</h3>
                        <p>Create your first document, deck, or quiz to get started</p>
                        <div className="empty-state-actions">
                            <button 
                                className="empty-state-btn primary"
                                onClick={handleCreateDocument}
                            >
                                <FiFileText /> Create Document
                            </button>
                            <button 
                                className="empty-state-btn"
                                onClick={() => handleAddItem(folder.id, 'deck')}
                            >
                                <img src={deckIcon} alt="deck" /> Import Deck
                            </button>
                            <button 
                                className="empty-state-btn"
                                onClick={() => handleAddItem(folder.id, 'quiz')}
                            >
                                <img src={testIcon} alt="quiz" /> Import Quiz
                            </button>
                        </div>
                    </div>
                </div>
            );
        }

        return (
            <div className={`folderview-items ${viewMode}`}>
                {folder.items.map(item => (
                    <div 
                        key={item.id} 
                        className={`folderview-item ${item.type}`}
                        onClick={(e) => {
                            if (item.type === 'document') {
                                // Navigate to notes editor with existing document, include folder id in state
                                navigate('/notes-editor', { state: { openNotes: true, document: { ...item, folder: selectedFolder.id } } });
                            } else if (item.type === 'deck') {
                                handleDeckClick(item.id, e);
                            } else if (item.type === 'quiz') {
                                handleQuizClick(item.id, e);
                            }
                        }}
                        onContextMenu={(e) => handleContextMenu(e, item.type, item.id)}
                    >
                        <div className="item-icon">
                            {item.type === 'document' && <FiFileText />}
                            {item.type === 'deck' && <img src={deckIcon} alt="deck" />}
                            {item.type === 'quiz' && <img src={testIcon} alt="quiz" />}
                        </div>
                        <div className="item-content">
                            <h4 className="item-title">
                                {item.type === 'document' ? item.title : 
                                 item.type === 'deck' ? item.name : item.topic}
                            </h4>
                            {item.type === 'document' && item.tag && (
                              <div className="item-tags">
                                <span className="item-tag">{item.tag.title}</span>
                              </div>
                            )}
                            {item.type === 'deck' && (
                              <p className="item-subtitle">{`${item.cardCount || 0} cards`}</p>
                            )}
                            {item.type === 'quiz' && (
                              <p className="item-subtitle">{item.subject}</p>
                            )}
                        </div>
                        <div className="item-actions">
                            <button className="item-action-btn">
                                <FiEdit2 />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        );
    };

    return (
        <div className="folder-view">
            <div className="folder-header">
                <div className="folder-info">
                    <h2>{selectedFolder.name}</h2>
                    <p>{getFolderItemCount(selectedFolder)} items</p>
                </div>
                <div className="folder-actions">
                    <div className="view-mode-toggle">
                        <button 
                            className={`view-mode-btn ${viewMode === 'grid' ? 'active' : ''}`}
                            onClick={() => setViewMode('grid')}
                        >
                            <FiGrid />
                        </button>
                        <button 
                            className={`view-mode-btn ${viewMode === 'list' ? 'active' : ''}`}
                            onClick={() => setViewMode('list')}
                        >
                            <FiList />
                        </button>
                    </div>
                    <div className="new-item-container">
                        <button 
                            className="new-item-btn"
                            onClick={() => setShowNewItemDropdown(!showNewItemDropdown)}
                        >
                            <FiPlus /> New
                        </button>
                        {showNewItemDropdown && (
                            <div className="new-item-dropdown">
                                <button onClick={handleCreateDocument}>
                                    <FiFileText /> Document
                                </button>
                                <button onClick={() => handleAddItem(selectedFolder.id, 'deck')}>
                                    <img src={deckIcon} alt="deck" /> Import Deck
                                </button>
                                <button onClick={() => handleAddItem(selectedFolder.id, 'quiz')}>
                                    <img src={testIcon} alt="quiz" /> Import Quiz
                                </button>
                                <button onClick={() => document.getElementById('file-upload').click()}>
                                    <FiUpload /> Upload File
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
            {renderFolderItems(selectedFolder)}
        </div>
    );
};

export default FolderView; 