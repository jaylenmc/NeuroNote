import React from 'react';

const NewFolderModal = ({ 
    showNewFolderModal, 
    newFolderName, 
    setNewFolderName, 
    setShowNewFolderModal, 
    handleCreateFolder 
}) => {
    if (!showNewFolderModal) return null;

    return (
        <div className="dashboard-modal-overlay">
            <div className="dashboard-modal">
                <h2>Create New Folder</h2>
                <input
                    type="text"
                    value={newFolderName}
                    onChange={(e) => setNewFolderName(e.target.value)}
                    placeholder="Enter folder name..."
                    className="dashboard-modal-input"
                />
                <div className="dashboard-modal-actions">
                    <button 
                        onClick={() => setShowNewFolderModal(false)} 
                        className="dashboard-modal-btn cancel"
                    >
                        Cancel
                    </button>
                    <button 
                        type="button" 
                        onClick={() => { 
                            console.log('Create button clicked'); 
                            handleCreateFolder(); 
                        }} 
                        className="dashboard-modal-btn create"
                    >
                        Create
                    </button>
                </div>
            </div>
        </div>
    );
};

export default NewFolderModal; 