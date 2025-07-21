import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FiSave, FiGlobe, FiTag, FiX, FiMenu } from 'react-icons/fi';
import { useAuth } from '../auth/AuthContext';
import Block from '../components/Block';
import Sidebar from '../components/Sidebar';
import ContextMenu from '../components/ContextMenu';
import NewFolderModal from '../components/modals/NewFolderModal';
import api from '../api/axios';
import '../components/NotesEditor.css';
import '../components/Dashboard.css';
import './NotesEditorPage.css';

const NotesEditorPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  
  // State for notes editor
  const [isNotesMode, setIsNotesMode] = useState(true);
  const [showSidebar, setShowSidebar] = useState(false);
  const [folders, setFolders] = useState([]);
  const [selectedFolder, setSelectedFolder] = useState(null);
  const [expandedFolders, setExpandedFolders] = useState({});
  const [showDropdown, setShowDropdown] = useState(false);
  const [sidebarContextMenu, setSidebarContextMenu] = useState({ show: false, x: 0, y: 0, folderId: null });
  const [showNewFolderModal, setShowNewFolderModal] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [noteTitle, setNoteTitle] = useState('Untitled Note');
  const [noteContent, setNoteContent] = useState('');
  const [noteTags, setNoteTags] = useState([]);
  const [newTag, setNewTag] = useState('');
  const [showTagInput, setShowTagInput] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isPublished, setIsPublished] = useState(false);
  const [blocks, setBlocks] = useState([
    { id: '1', type: 'paragraph', content: '', checked: false }
  ]);
  const [activeBlockId, setActiveBlockId] = useState('1');
  const [showBlockMenu, setShowBlockMenu] = useState({ blockId: null, x: 0, y: 0 });
  const [hoveredBlockId, setHoveredBlockId] = useState(null);
  const [selectedMenuIndex, setSelectedMenuIndex] = useState(0);
  const [editingBlocks, setEditingBlocks] = useState(new Set());
  const blockRefs = React.useRef({});
  const [justAddedBlockId, setJustAddedBlockId] = useState(null);
  const [formatBar, setFormatBar] = useState({ show: false, x: 0, y: 0 });
  const formatBarRef = React.useRef(null);

  // Initialize from navigation state
  useEffect(() => {
    if (location.state?.document) {
      const document = location.state.document;
      setNoteTitle(document.title || 'Untitled Note');
      // Clear the state to prevent re-initialization
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state, navigate, location.pathname]);

  // Fetch folders for sidebar
  const fetchFolders = async () => {
    try {
      const response = await api.get('/folders/user/');
      if (!response) return;
      const foldersData = response.data;
      
      const foldersWithCounts = (foldersData.folders || foldersData).map(folder => {
        return {
          ...folder,
          documentCount: folder.content_num || 0,
          deckCount: 0,
          quizCount: 0,
          sub_folders: folder.sub_folders || []
        };
      });
      setFolders(foldersWithCounts);
    } catch (error) {
      console.error('Error fetching folders:', error);
    }
  };

  // Sidebar functions
  const handleFolderClick = async (folderId, e) => {
    e.stopPropagation();
    const folder = folders.find(f => f.id === folderId);
    if (folder) {
      setSelectedFolder(folder);
      // Navigate to dashboard with folder selected
      navigate('/dashboard', { state: { selectedFolderId: folderId } });
    }
  };

  const toggleFolder = async (folderId, e) => {
    e.stopPropagation();
    setExpandedFolders(prev => ({
      ...prev,
      [folderId]: !prev[folderId]
    }));
  };

  const handleCreateFolder = async (name, parentId = null) => {
    if (name.trim()) {
      try {
        const body = parentId
          ? { name: name.trim(), folder_id: parentId }
          : { name: name.trim() };
        const response = await api.post('/folders/user/', body);
        
        if (response.status === 200 || response.status === 201) {
          await fetchFolders(); // Refresh folders
        }
      } catch (error) {
        console.error('Error creating folder:', error);
      }
    }
  };

  const handleDeleteFolder = async (folderId) => {
    try {
      await api.delete(`/folders/user/${folderId}/`);
      await fetchFolders(); // Refresh folders
      setSidebarContextMenu({ show: false, x: 0, y: 0, folderId: null });
    } catch (error) {
      console.error('Error deleting folder:', error);
    }
  };

  // Load folders on mount
  useEffect(() => {
    fetchFolders();
  }, []);

  // Notes editor functions
  const createNewBlock = (afterId, type = 'paragraph') => {
    const newBlock = {
      id: Date.now().toString(),
      type,
      content: '',
      checked: false
    };
    
    setBlocks(prevBlocks => {
      const index = prevBlocks.findIndex(b => b.id === afterId);
      const newBlocks = [...prevBlocks];
      newBlocks.splice(index + 1, 0, newBlock);
      return newBlocks;
    });
    
    setJustAddedBlockId(newBlock.id);
    setActiveBlockId(newBlock.id);
  };

  const updateBlockContent = (blockId, content) => {
    setBlocks(prevBlocks =>
      prevBlocks.map(block =>
        block.id === blockId ? { ...block, content } : block
      )
    );
  };

  const updateBlockType = (blockId, newType) => {
    setBlocks(prevBlocks =>
      prevBlocks.map(block =>
        block.id === blockId ? { ...block, type: newType } : block
      )
    );
  };

  const deleteBlock = (blockId) => {
    setBlocks(prevBlocks => {
      const newBlocks = prevBlocks.filter(block => block.id !== blockId);
      if (newBlocks.length === 0) {
        newBlocks.push({ id: Date.now().toString(), type: 'paragraph', content: '', checked: false });
      }
      return newBlocks;
    });
  };

  const handleBlockKeyDown = (e, blockId, blockType) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      createNewBlock(blockId);
    }
  };

  const handleBlockMenuClick = (e, blockId) => {
    e.preventDefault();
    setShowBlockMenu({
      blockId,
      x: e.clientX,
      y: e.clientY
    });
  };

  const handleBlockMenuClose = () => {
    setShowBlockMenu({ blockId: null, x: 0, y: 0 });
    setSelectedMenuIndex(0);
  };

  const handleBlockMenuKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedMenuIndex(prev => 
        prev < 4 ? prev + 1 : 0
      );
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedMenuIndex(prev => 
        prev > 0 ? prev - 1 : 4
      );
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const blockTypes = ['paragraph', 'h1', 'h2', 'h3', 'checklist'];
      const selectedType = blockTypes[selectedMenuIndex];
      updateBlockType(showBlockMenu.blockId, selectedType);
      handleBlockMenuClose();
    } else if (e.key === 'Escape') {
      handleBlockMenuClose();
    }
  };

  const handleSelection = (e, blockId) => {
    const selection = window.getSelection();
    if (selection.toString().length > 0) {
      const range = selection.getRangeAt(0);
      const rect = range.getBoundingClientRect();
      setFormatBar({
        show: true,
        x: rect.left + rect.width / 2,
        y: rect.top - 40
      });
    } else {
      setFormatBar({ show: false, x: 0, y: 0 });
    }
  };

  const formatSelection = (cmd, value = null) => {
    if (cmd === 'bold') {
      document.execCommand('bold', false, null);
    } else if (cmd === 'italic') {
      document.execCommand('italic', false, null);
    } else if (cmd === 'hiliteColor') {
      document.execCommand('hiliteColor', false, value);
    }
    setFormatBar({ show: false, x: 0, y: 0 });
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Implementation for saving note
      setLastSaved(new Date());
      // You can add a notification system here
      console.log('Note saved successfully');
    } catch (error) {
      console.error('Error saving note:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handlePublish = async () => {
    try {
      // Implementation for publishing note
      setIsPublished(true);
      console.log('Note published successfully');
    } catch (error) {
      console.error('Error publishing note:', error);
    }
  };

  const handleAddTag = (e) => {
    if (newTag.trim() && !noteTags.includes(newTag.trim())) {
      setNoteTags([...noteTags, newTag.trim()]);
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setNoteTags(noteTags.filter(tag => tag !== tagToRemove));
  };

  const formatLastSaved = () => {
    if (!lastSaved) return 'Not saved';
    const now = new Date();
    const diff = now - lastSaved;
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return lastSaved.toLocaleDateString();
  };

  const handleExitNotesMode = () => {
    navigate('/dashboard');
  };

  const blockTypes = [
    { type: 'paragraph', label: 'Text', icon: '¶' },
    { type: 'h1', label: 'Heading 1', icon: 'H1' },
    { type: 'h2', label: 'Heading 2', icon: 'H2' },
    { type: 'h3', label: 'Heading 3', icon: 'H3' },
    { type: 'checklist', label: 'Checklist', icon: '☐' }
  ];

  const blockMenuRef = useRef(null);

  return (
    <div className={`notes-editor-page ${showSidebar ? 'with-sidebar' : ''}`}>
      {showSidebar && (
        <Sidebar
          user={user}
          showDropdown={showDropdown}
          setShowDropdown={setShowDropdown}
          logout={logout}
          navigate={navigate}
          location={location}
          folders={folders}
          selectedFolder={selectedFolder}
          activeView="notes"
          expandedFolders={expandedFolders}
          setShowNewFolderModal={setShowNewFolderModal}
          handleFolderClick={handleFolderClick}
          toggleFolder={toggleFolder}
          setSidebarContextMenu={setSidebarContextMenu}
        />
      )}
      <div className="notes-editor">
        <div className="notes-header">
          <div className="notes-title-section">
            <button 
              className="sidebar-toggle-btn"
              onClick={() => setShowSidebar(!showSidebar)}
              title="Toggle Sidebar"
            >
              <FiMenu />
            </button>
            <input
              type="text"
              value={noteTitle}
              onChange={(e) => setNoteTitle(e.target.value)}
              className="notes-title-input"
              placeholder="Untitled Note"
            />
            <div className="notes-status">
              {isSaving ? (
                <span className="saving-indicator">Saving...</span>
              ) : (
                <span className="last-saved">{formatLastSaved()}</span>
              )}
            </div>
          </div>
          <div className="notes-actions">
            <div className="tags-section">
              {noteTags.map(tag => (
                <span key={tag} className="tag">
                  {tag}
                  <button onClick={() => handleRemoveTag(tag)}>
                    <FiX />
                  </button>
                </span>
              ))}
              {showTagInput ? (
                <input
                  type="text"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleAddTag(e);
                    } else if (e.key === 'Escape') {
                      setShowTagInput(false);
                      setNewTag('');
                    }
                  }}
                  onBlur={() => {
                    setShowTagInput(false);
                    setNewTag('');
                  }}
                  className="tag-input"
                  placeholder="Add tag..."
                  autoFocus
                />
              ) : (
                <button 
                  className="add-tag-btn"
                  onClick={() => setShowTagInput(true)}
                >
                  <FiTag /> Add Tag
                </button>
              )}
            </div>
            <button 
              className={`publish-btn ${isPublished ? 'published' : ''}`}
              onClick={handlePublish}
            >
              <FiGlobe />
              {isPublished ? 'Published' : 'Publish'}
            </button>
            <button className="save-btn" onClick={handleSave}>
              <FiSave /> Save
            </button>
            <button className="exit-btn" onClick={handleExitNotesMode}>
              <FiX />
            </button>
          </div>
        </div>

        <div className="notes-content">
          <div className="blocks-container">
            {blocks.map((block, index) => (
              <Block
                key={block.id}
                block={block}
                index={index}
                blocks={blocks}
                activeBlockId={activeBlockId}
                hoveredBlockId={hoveredBlockId}
                editingContent=""
                blockTypes={blockTypes}
                onBlockChange={() => {}}
                onBlockBlur={() => {}}
                onBlockKeyDown={handleBlockKeyDown}
                onBlockMenuClick={handleBlockMenuClick}
                onMouseEnter={setHoveredBlockId}
                onMouseLeave={() => setHoveredBlockId(null)}
                createNewBlock={createNewBlock}
                deleteBlock={deleteBlock}
                updateBlockContent={updateBlockContent}
                setActiveBlockId={setActiveBlockId}
                setEditingBlockId={() => {}}
                setEditingContent={() => {}}
                setHoveredBlockId={setHoveredBlockId}
                blockRefs={blockRefs}
              />
            ))}
          </div>
        </div>

        {/* Block Type Menu */}
        {showBlockMenu.blockId && (
          <div
            ref={blockMenuRef}
            className="block-type-menu"
            style={{
              position: 'absolute',
              left: showBlockMenu.x,
              top: showBlockMenu.y,
              zIndex: 1000,
              background: '#232323',
              borderRadius: 8,
              boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
              padding: '8px 0',
              minWidth: 150
            }}
            onKeyDown={handleBlockMenuKeyDown}
          >
            {blockTypes.map((blockType, index) => (
              <button
                key={blockType.type}
                className={`block-type-option ${selectedMenuIndex === index ? 'selected' : ''}`}
                onClick={() => {
                  updateBlockType(showBlockMenu.blockId, blockType.type);
                  handleBlockMenuClose();
                }}
                onMouseEnter={() => setSelectedMenuIndex(index)}
              >
                <span className="block-type-icon">{blockType.icon}</span>
                <span className="block-type-label">{blockType.label}</span>
              </button>
            ))}
          </div>
        )}

        {/* Floating Format Bar */}
        {formatBar.show && (
          <div
            ref={formatBarRef}
            style={{
              position: 'absolute',
              left: formatBar.x,
              top: formatBar.y,
              zIndex: 2000,
              background: '#232323',
              borderRadius: 8,
              boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
              padding: '6px 12px',
              display: 'flex',
              gap: 12,
              alignItems: 'center',
              border: '1px solid #444',
            }}
          >
            <button 
              onClick={() => formatSelection('bold')} 
              style={{
                fontWeight: 'bold', 
                background: 'none', 
                border: 'none', 
                color: '#fff', 
                cursor: 'pointer', 
                fontSize: 18
              }}
            >
              B
            </button>
            <button 
              onClick={() => formatSelection('italic')} 
              style={{
                fontStyle: 'italic', 
                background: 'none', 
                border: 'none', 
                color: '#fff', 
                cursor: 'pointer', 
                fontSize: 18
              }}
            >
              I
            </button>
            <button 
              onClick={() => formatSelection('hiliteColor', 'rgba(255,250,205,0.5)')} 
              style={{
                background: 'rgba(255,250,205,0.5)', 
                border: 'none', 
                color: '#232323', 
                cursor: 'pointer', 
                fontSize: 18, 
                borderRadius: 4, 
                padding: '0 8px'
              }}
            >
              H
            </button>
          </div>
        )}
      </div>

      <NewFolderModal
        showNewFolderModal={showNewFolderModal}
        newFolderName={newFolderName}
        setNewFolderName={setNewFolderName}
        setShowNewFolderModal={setShowNewFolderModal}
        handleCreateFolder={handleCreateFolder}
      />

      <ContextMenu
        sidebarContextMenu={sidebarContextMenu}
        setSidebarContextMenu={setSidebarContextMenu}
        handleDeleteFolder={handleDeleteFolder}
      />
    </div>
  );
};

export default NotesEditorPage; 