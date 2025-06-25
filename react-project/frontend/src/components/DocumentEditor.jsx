import React, { useState, useEffect, useRef } from 'react';
import { FiSave, FiX, FiPlus, FiTrash2 } from 'react-icons/fi';
import './DocumentEditor.css';

const DEFAULT_BLOCK = { type: 'paragraph', content: '' };

const DocumentEditor = ({ folderId, onClose, documentId = null }) => {
    const [title, setTitle] = useState('');
    const [blocks, setBlocks] = useState([{ ...DEFAULT_BLOCK }]);
    const [isLoading, setIsLoading] = useState(false);
    const blockRefs = useRef([]);

    useEffect(() => {
        if (documentId) {
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
                // Parse blocks from saved notes (fallback to single block)
                try {
                    const parsed = JSON.parse(data.notes);
                    if (Array.isArray(parsed)) setBlocks(parsed);
                    else setBlocks([{ ...DEFAULT_BLOCK, content: data.notes }]);
                } catch {
                    setBlocks([{ ...DEFAULT_BLOCK, content: data.notes }]);
                }
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
                    notes: JSON.stringify(blocks),
                    folder_id: folderId,
                    id: documentId
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

    const handleBlockChange = (idx, value) => {
        setBlocks(blocks => blocks.map((b, i) => i === idx ? { ...b, content: value } : b));
    };

    const handleBlockType = (idx, type) => {
        setBlocks(blocks => blocks.map((b, i) => i === idx ? { ...b, type } : b));
    };

    const handleAddBlock = (idx) => {
        setBlocks(blocks => [
            ...blocks.slice(0, idx + 1),
            { ...DEFAULT_BLOCK },
            ...blocks.slice(idx + 1)
        ]);
        setTimeout(() => {
            blockRefs.current[idx + 1]?.focus();
        }, 0);
    };

    const handleDeleteBlock = (idx) => {
        if (blocks.length === 1) return;
        setBlocks(blocks => blocks.filter((_, i) => i !== idx));
    };

    const handleKeyDown = (e, idx) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleAddBlock(idx);
        } else if (e.key === 'Backspace' && blocks[idx].content === '' && blocks.length > 1) {
            e.preventDefault();
            handleDeleteBlock(idx);
            setTimeout(() => {
                blockRefs.current[Math.max(0, idx - 1)]?.focus();
            }, 0);
        }
    };

    const renderBlock = (block, idx) => {
        const blockProps = {
            ref: el => (blockRefs.current[idx] = el),
            className: `notion-block notion-block-${block.type}`,
            value: block.content,
            onChange: e => handleBlockChange(idx, e.target.value),
            onKeyDown: e => handleKeyDown(e, idx),
            placeholder: block.type === 'paragraph' ? 'Type "/" for blocks...' : `Heading ${block.type[1]}`,
            spellCheck: true,
            autoFocus: false
        };
        if (block.type === 'h1') return <input type="text" {...blockProps} style={{ fontSize: '2rem', fontWeight: 700, margin: '18px 0 8px 0' }} />;
        if (block.type === 'h2') return <input type="text" {...blockProps} style={{ fontSize: '1.5rem', fontWeight: 600, margin: '16px 0 6px 0' }} />;
        if (block.type === 'h3') return <input type="text" {...blockProps} style={{ fontSize: '1.2rem', fontWeight: 600, margin: '14px 0 4px 0' }} />;
        return <textarea rows={1} {...blockProps} style={{ margin: '8px 0', fontSize: '1rem', fontWeight: 400, resize: 'none', background: 'none', border: 'none', color: '#fff', lineHeight: 1.7 }} />;
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
            <div className="notion-blocks-container">
                {blocks.map((block, idx) => (
                    <div className="notion-block-row" key={idx}>
                        {renderBlock(block, idx)}
                        <button className="notion-block-plus" onClick={() => handleAddBlock(idx)} title="Add block">
                            <FiPlus />
                        </button>
                        {blocks.length > 1 && (
                            <button className="notion-block-delete" onClick={() => handleDeleteBlock(idx)} title="Delete block">
                                <FiTrash2 />
                            </button>
                        )}
                        {/* Block type switcher (optional, could be a dropdown or / menu) */}
                        <div className="notion-block-type-switcher">
                            <button onClick={() => handleBlockType(idx, 'paragraph')}>T</button>
                            <button onClick={() => handleBlockType(idx, 'h1')}>H1</button>
                            <button onClick={() => handleBlockType(idx, 'h2')}>H2</button>
                            <button onClick={() => handleBlockType(idx, 'h3')}>H3</button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default DocumentEditor; 