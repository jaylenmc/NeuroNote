import React, { useState, useEffect } from 'react';
import { FiSave, FiX } from 'react-icons/fi';
import './DocumentEditor.css';

const DocumentEditor = ({ folderId, onClose, documentId = null }) => {
    const [title, setTitle] = useState('');
    const [notes, setNotes] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (documentId) {
            // Fetch existing document if editing
            fetchDocument();
        }
    }, [documentId]);

    const fetchDocument = async () => {
        try {
            const token = sessionStorage.getItem('jwt_token');
            const response = await fetch(`${import.meta.env.VITE_API_URL}documents/notes/${folderId}/${documentId}/`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (response.ok) {
                const data = await response.json();
                setTitle(data.title);
                setNotes(data.notes);
            }
        } catch (error) {
            console.error('Error fetching document:', error);
        }
    };

    const handleSave = async () => {
        setIsLoading(true);
        try {
            const token = sessionStorage.getItem('jwt_token');
            const response = await fetch(`${import.meta.env.VITE_API_URL}documents/notes/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    title,
                    notes,
                    folder_id: folderId,
                    id: documentId // Include ID if updating existing document
                })
            });

            if (response.ok) {
                onClose();
            }
        } catch (error) {
            console.error('Error saving document:', error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="document-editor">
            <div className="document-header">
                <input
                    type="text"
                    className="document-title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Untitled"
                />
                <div className="document-actions">
                    <button 
                        className="save-btn"
                        onClick={handleSave}
                        disabled={isLoading}
                    >
                        <FiSave /> Save
                    </button>
                    <button 
                        className="close-btn"
                        onClick={onClose}
                    >
                        <FiX />
                    </button>
                </div>
            </div>
            <textarea
                className="document-notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Start writing your notes here..."
            />
        </div>
    );
};

export default DocumentEditor; 