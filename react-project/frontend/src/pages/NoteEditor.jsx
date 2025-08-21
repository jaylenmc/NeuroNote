import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import { FiArrowLeft } from 'react-icons/fi';
import './NoteEditor.css';

const NoteEditor = () => {
    const { noteId } = useParams();
    const navigate = useNavigate();
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [saveStatus, setSaveStatus] = useState('Saved');

    const editor = useEditor({
        extensions: [
            StarterKit,
            Placeholder.configure({
                placeholder: 'Start writing here...',
            }),
        ],
        content: content,
        onUpdate: ({ editor }) => {
            setContent(editor.getHTML());
            setSaveStatus('Saving...');
        },
    });

    useEffect(() => {
        // Fetch note data from backend
        const fetchNote = async () => {
            // Replace with your actual API call
            console.log(`Fetching note ${noteId}`);
            // Mock data for now
            const mockNote = { title: 'Sample Note', content: '<p>This is some initial content.</p>' };
            setTitle(mockNote.title);
            setContent(mockNote.content);
            if (editor) {
                editor.commands.setContent(mockNote.content);
            }
        };

        if (noteId) {
            fetchNote();
        }
    }, [noteId, editor]);

    useEffect(() => {
        if (saveStatus === 'Saving...') {
            const timeout = setTimeout(() => {
                // Here you would typically save to the backend
                console.log('Saving to backend:', { title, content });
                setSaveStatus('Saved');
            }, 1500); // Simulate network delay

            return () => clearTimeout(timeout);
        }
    }, [title, content, saveStatus]);

    return (
        <div className="note-editor-container">
            <header className="note-editor-header">
                <button onClick={() => navigate(-1)} className="back-button">
                    <FiArrowLeft />
                </button>
                <div className="save-status">{saveStatus}</div>
            </header>
            <main className="main-editor-area">
                <input
                    type="text"
                    className="note-title-input"
                    value={title}
                    onChange={(e) => {
                        setTitle(e.target.value);
                        setSaveStatus('Saving...');
                    }}
                    placeholder="Untitled Note"
                />
                <div className="editor-wrapper">
                    <EditorContent editor={editor} />
                </div>
            </main>
        </div>
    );
};

export default NoteEditor; 