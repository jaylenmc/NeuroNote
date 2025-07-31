import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FiSave, FiGlobe, FiTag, FiX, FiList, FiMaximize2, FiMinimize2 } from 'react-icons/fi';
import { FaListOl } from 'react-icons/fa';
import api from '../api/axios';
import './NotesEditorPage.css';

const NotesEditorPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [noteTitle, setNoteTitle] = useState('Untitled Note');
  const [noteTags, setNoteTags] = useState([]);
  const [newTag, setNewTag] = useState('');
  const [showTagInput, setShowTagInput] = useState(false);
  const [isPublished, setIsPublished] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [content, setContent] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [currentDocumentId, setCurrentDocumentId] = useState(null);
  const [currentFolderId, setCurrentFolderId] = useState(null);
  const contentRef = useRef(null);

  // Set content programmatically only when content changes from outside (e.g., loading a doc)
  useEffect(() => {
    if (contentRef.current && contentRef.current.innerHTML !== content) {
      contentRef.current.innerHTML = content;
    }
  }, [content]);

  // Load document if editing
  useEffect(() => {
    const doc = location.state?.document;
    if (doc && doc.id && doc.folder) {
      setCurrentDocumentId(doc.id);
      setCurrentFolderId(doc.folder);
      // Fetch document details from backend
      api.get(`/documents/notes/${doc.folder}/${doc.id}/`).then(response => {
        const d = response.data;
        setNoteTitle(d.title || 'Untitled Note');
        setContent(d.notes || '');
        setNoteTags(d.tag ? [d.tag.title] : []);
        setIsPublished(!!d.published);
      }).catch(err => {
        // fallback to state if backend fails
        setNoteTitle(doc.title || 'Untitled Note');
        setContent(doc.notes || '');
        setNoteTags(doc.tag ? [doc.tag.title] : []);
        setIsPublished(!!doc.published);
      });
    } else if (doc && doc.folder) {
      setCurrentFolderId(doc.folder);
    } else if (location.state?.folderId) {
      setCurrentFolderId(location.state.folderId);
    }
  }, [location.state]);

  // Formatting functions
  const formatText = (cmd, value = null) => {
    document.execCommand(cmd, false, value);
    contentRef.current && setContent(contentRef.current.innerHTML);
  };

  const handleAddTag = () => {
    if (newTag.trim() && !noteTags.includes(newTag.trim())) {
      setNoteTags([newTag.trim()]); // Only allow one tag
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    // Call the tag delete endpoint if we have a document ID
    if (currentDocumentId) {
      // Find the tag ID from the backend response
      api.get(`/documents/notes/${currentFolderId}/${currentDocumentId}/`).then(response => {
        const doc = response.data;
        if (doc.tag) {
          const tagId = doc.tag.id;
          api.delete(`/documents/notes/tags/del/${currentDocumentId}/${tagId}/`).then(() => {
            setNoteTags([]); // Remove the tag from state after successful deletion
          }).catch(error => {
            console.error('Error deleting tag:', error);
          });
        } else {
          setNoteTags([]); // No tag to delete, just update state
        }
      }).catch(error => {
        console.error('Error fetching document for tag deletion:', error);
        setNoteTags([]); // Fallback to just updating state
      });
    } else {
      setNoteTags([]); // No document ID, just update state
    }
  };

  // Save (create or update)
  const handleSave = async (publishedOverride = null) => {
    setIsSaving(true);
    try {
      const documentData = {
        title: noteTitle || 'Untitled Note',
        notes: content,
        folder_id: currentFolderId,
        is_published: publishedOverride !== null ? publishedOverride : isPublished,
        tag: noteTags.length > 0 ? noteTags[0] : ''
      };
      console.log('Document Data:', documentData);
      let response = null;
      if (currentDocumentId) {
        response = await api.put(`/documents/notes/update/${currentDocumentId}/`, documentData);
        } else {
        response = await api.post('/documents/notes/', documentData);
      }
      if (response && response.status === 200) {
        const savedDoc = response.data;
        setCurrentDocumentId(savedDoc.id);
        setCurrentFolderId(savedDoc.folder);
        setNoteTitle(savedDoc.title || 'Untitled Note');
        setContent(savedDoc.notes || '');
        setNoteTags(savedDoc.tag ? [savedDoc.tag.title] : []);
        setIsPublished(!!savedDoc.published);
      }
    } catch (error) {
      console.error('Error saving note:', error);
    } finally {
      setIsSaving(false);
    }
  };

  // Publish toggle
  const handlePublish = async () => {
    const newPublished = !isPublished;
    await handleSave(newPublished);
    // setIsPublished will be updated after save from backend response
  };

  const handleExit = async () => {
    const folderId = currentFolderId || location.state?.document?.folder;
    if (folderId) {
      try {
        const docsResponse = await api.get(`/documents/notes/${folderId}/`);
        const documents = docsResponse.data || [];
        navigate(`/dashboard/folder/${folderId}`, { state: { documents } });
      } catch (err) {
        navigate(`/dashboard/folder/${folderId}`);
      }
    } else {
      navigate('/dashboard');
    }
  };

  return (
    <div className={`notes-editor-rebuilt ${isFullscreen ? 'fullscreen' : ''}`}>  
        <div className="notes-header">
            <div className="title-section">
            <input
              type="text"
              value={noteTitle}
                onChange={e => setNoteTitle(e.target.value)}
              className="notes-title-input"
              placeholder="Untitled Note"
                title={noteTitle}
              />
             {noteTags.length > 0 && (
               <div className="single-tag">
                 <span className="tag-dot">•</span>
                 <span className="tag-text">{noteTags[0]}</span>
                 <button onClick={() => handleRemoveTag(noteTags[0])}><FiX /></button>
               </div>
             )}
             {noteTags.length === 0 && (
               <button className="add-single-tag-btn" onClick={() => setShowTagInput(true)}>
                 <FiTag /> Add Tag
               </button>
             )}
             {showTagInput && (
                <input
                  type="text"
                  value={newTag}
                 onChange={e => setNewTag(e.target.value)}
                 onKeyDown={e => {
                   if (e.key === 'Enter') handleAddTag();
                   else if (e.key === 'Escape') { setShowTagInput(false); setNewTag(''); }
                 }}
                 onBlur={() => { setShowTagInput(false); setNewTag(''); }}
                 className="single-tag-input"
                  placeholder="Add tag..."
                  autoFocus
                />
              )}
            </div>
            <div className="notes-actions">
              <button className={`publish-btn ${isPublished ? 'published' : ''}`} onClick={handlePublish} style={isPublished ? { minWidth: 140, width: 140, maxWidth: 140 } : {}}>
                <FiGlobe size={22} style={{marginRight: 6}} />{isPublished ? 'Published' : 'Publish'}
            </button>
              <button className="save-btn" onClick={() => handleSave()} disabled={isSaving}>
                <FiSave size={22} style={{marginRight: 6}} />{isSaving ? 'Saving...' : 'Save'}
            </button>
              <button className="exit-btn" onClick={handleExit}>
                <FiX size={22} />
              </button>
            </div>
          </div>
      <div className="notes-formatting-toolbar">
        <button className="format-btn" onClick={() => formatText('formatBlock', '<h1>')} title="Heading 1"><span>H1</span></button>
        <button className="format-btn" onClick={() => formatText('formatBlock', '<h2>')} title="Heading 2"><span>H2</span></button>
        <button className="format-btn" onClick={() => formatText('formatBlock', '<h3>')} title="Heading 3"><span>H3</span></button>
        <div className="format-divider"></div>
        <button className="format-btn" onClick={() => formatText('bold')} title="Bold"><span style={{fontWeight:'bold'}}>B</span></button>
        <button className="format-btn" onClick={() => formatText('italic')} title="Italic"><span style={{fontStyle:'italic'}}>I</span></button>
        <div className="format-divider"></div>
        <button className="format-btn" onClick={() => formatText('insertUnorderedList')} title="Bullet List"><FiList size={16} /></button>
        <button className="format-btn" onClick={() => formatText('insertOrderedList')} title="Numbered List"><FaListOl size={16} /></button>
        <div className="formatting-toolbar-right">
          <button className="toolbar-action-btn" onClick={() => {/* TODO: Export handler */}} title="Export">📤 Export</button>
          <button className="toolbar-action-btn" onClick={() => {/* TODO: PDF handler */}} title="Export as PDF">📄 PDF</button>
          <button className="toolbar-action-btn" onClick={() => {/* TODO: Markdown handler */}} title="Export as Markdown">📝 Markdown</button>
          <button className="toolbar-action-btn" onClick={() => {/* TODO: Cards handler */}} title="Create Cards">🃏 Cards</button>
          <button className="fullscreen-btn" onClick={() => setIsFullscreen(f => !f)} title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}>
            {isFullscreen ? <FiMinimize2 size={16} /> : <FiMaximize2 size={16} />}
            </button>
          </div>
        </div>
      <div className="notes-content-area" style={{position: 'relative'}}>
        {!content && !isFocused && (
          <span className="notes-placeholder">
            Start typing notes... Use the toolbar above to format your text.
          </span>
        )}
        <div
          ref={contentRef}
          contentEditable={true}
          className="notes-content-editable"
          onInput={e => setContent(e.currentTarget.innerHTML)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          suppressContentEditableWarning={true}
          style={{ minHeight: 300 }}
        />
      </div>
    </div>
  );
};

export default NotesEditorPage; 