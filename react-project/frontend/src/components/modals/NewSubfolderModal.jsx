import React from 'react';

const NewSubfolderModal = ({ 
    showNewSubfolderModal, 
    newSubfolderName, 
    setNewSubfolderName, 
    setShowNewSubfolderModal, 
    handleCreateSubfolder 
}) => {
    if (!showNewSubfolderModal) return null;

    return (
        <div className="dashboard-modal-overlay">
            <div className="dashboard-modal">
                <h2>Create Subfolder</h2>
                <input
                    type="text"
                    value={newSubfolderName}
                    onChange={e => setNewSubfolderName(e.target.value)}
                    placeholder="Enter subfolder name..."
                    className="dashboard-modal-input"
                />
                <div className="dashboard-modal-actions">
                    <button 
                        onClick={() => setShowNewSubfolderModal(false)} 
                        className="dashboard-modal-btn cancel"
                    >
                        Cancel
                    </button>
                    <button 
                        onClick={handleCreateSubfolder} 
                        className="dashboard-modal-btn create"
                    >
                        Create
                    </button>
                </div>
            </div>
        </div>
    );
};

export default NewSubfolderModal; 