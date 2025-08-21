import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sun, Moon, ArrowLeft, BookOpen, HelpCircle, Target, RefreshCcw, BarChart2, MessageCircle, Play, Pause, RotateCcw, Settings, Coffee, Timer, Zap, FileText } from 'lucide-react';
import api from '../api/axios';
import './StudyRoom.css';

const tools = [
  { icon: <BookOpen size={24} color="#7c83fd" />, label: 'Decks', route: '/study-room/decks', color: '#7c83fd' },
  { icon: <HelpCircle size={24} color="#4ecdc4" />, label: 'Quiz', route: '/quiz', color: '#4ecdc4' },
  { icon: <Target size={24} color="#3b82f6" />, label: 'Focus', route: '/focus', color: '#3b82f6' }, // blue
  { icon: <RefreshCcw size={24} color="#ffd93d" />, label: 'Review', route: '/review', color: '#ffd93d' },
  { icon: <BarChart2 size={24} color="#22c55e" />, label: 'Progress', route: '/progress', color: '#22c55e' }, // green
  { icon: <MessageCircle size={24} color="#4ECDC4" />, label: 'Ask NeuroNote', route: '/chat', color: '#06B6D4' },
];

const mockTasks = [
  { id: 1, text: 'Read Chapter 5: Neurotransmitters', done: false },
  { id: 2, text: 'Summarize lecture notes', done: false },
  { id: 3, text: 'Complete flashcard review', done: false },
  { id: 4, text: 'Practice quiz: Synapses', done: false },
];

const mockResources = [
  // Empty resources array - no stock data
];

function formatTime(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

const phaseMeta = {
  pomodoro: { label: 'Focus', color: '#ef4444', icon: <Timer size={22} /> },
  break: { label: 'Short Break', color: '#10b981', icon: <Coffee size={22} /> },
  longBreak: { label: 'Long Break', color: '#3b82f6', icon: <Zap size={22} /> },
};

const StudyRoom = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isStudyMode, setIsStudyMode] = useState(false);
    const navigate = useNavigate();
  const [tasks, setTasks] = useState(mockTasks);
  const [showPomodoro, setShowPomodoro] = useState(false);
  const [resources, setResources] = useState(mockResources);
  const [showImportModal, setShowImportModal] = useState(false);
  
  // Import modal state
  const [importStep, setImportStep] = useState('select'); // 'select' | 'input' | 'documents'
  const [selectedType, setSelectedType] = useState(null);
  const [importValue, setImportValue] = useState('');
  const [importFile, setImportFile] = useState(null);
  const [importLinkTitle, setImportLinkTitle] = useState('');
  const [userDocuments, setUserDocuments] = useState([]);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [isLoadingDocuments, setIsLoadingDocuments] = useState(false);
  const [userFolders, setUserFolders] = useState([]);
  const [selectedFolder, setSelectedFolder] = useState(null);
  const [isLoadingFolders, setIsLoadingFolders] = useState(false);
  const [importSuccess, setImportSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [pinnedResources, setPinnedResources] = useState({ file: [], link: [], document: [] });
  const [isLoadingPinnedResources, setIsLoadingPinnedResources] = useState(false);
  const [showOverlay, setShowOverlay] = useState(false);
  const [overlayContent, setOverlayContent] = useState(null);
  const [overlayType, setOverlayType] = useState(null);
  const [isLoadingOverlay, setIsLoadingOverlay] = useState(false);

  // Pomodoro timer state
  const [phase, setPhase] = useState('pomodoro');
  const [isRunning, setIsRunning] = useState(false);
  const [pomodoroTime, setPomodoroTime] = useState(25);
  const [breakTime, setBreakTime] = useState(5);
  const [longBreakTime, setLongBreakTime] = useState(15);
  const [longBreakInterval, setLongBreakInterval] = useState(4);
  const [completedPomodoros, setCompletedPomodoros] = useState(0);
  const [showSettings, setShowSettings] = useState(false);
  const [timeLeft, setTimeLeft] = useState(pomodoroTime * 60);

  useEffect(() => {
    setTimeLeft(
      phase === 'pomodoro' ? pomodoroTime * 60 :
      phase === 'break' ? breakTime * 60 :
      longBreakTime * 60
    );
  }, [phase, pomodoroTime, breakTime, longBreakTime]);

    useEffect(() => {
    if (!isRunning) return;
    if (timeLeft <= 0) {
      handleTimerComplete();
      return;
    }
    const interval = setInterval(() => setTimeLeft(t => t - 1), 1000);
    return () => clearInterval(interval);
  }, [isRunning, timeLeft]);

  // Fetch pinned resources on component mount
  useEffect(() => {
    fetchPinnedResources();
  }, []);

  const fetchPinnedResources = async () => {
    try {
      setIsLoadingPinnedResources(true);
      const response = await api.get('/solostudyroom/pinned/');
      if (response.status === 200) {
        setPinnedResources(response.data);
      }
    } catch (error) {
      console.error('Error fetching pinned resources:', error);
      // Set empty pinned resources if there's an error
      setPinnedResources({ file: [], link: [], document: [] });
    } finally {
      setIsLoadingPinnedResources(false);
    }
  };

  const handleTimerComplete = () => {
    if (phase === 'pomodoro') {
      setCompletedPomodoros(c => c + 1);
      if ((completedPomodoros + 1) % longBreakInterval === 0) {
        setPhase('longBreak');
      } else {
        setPhase('break');
      }
    } else {
      setPhase('pomodoro');
    }
    setIsRunning(false);
  };

  const handleStart = () => setIsRunning(true);
  const handlePause = () => setIsRunning(false);
  const handleReset = () => {
    setIsRunning(false);
    setTimeLeft(
      phase === 'pomodoro' ? pomodoroTime * 60 :
      phase === 'break' ? breakTime * 60 :
      longBreakTime * 60
    );
  };
  const handleSkip = () => {
    setIsRunning(false);
    if (phase === 'pomodoro') {
      if ((completedPomodoros + 1) % longBreakInterval === 0) {
        setPhase('longBreak');
      } else {
        setPhase('break');
      }
    } else {
      setPhase('pomodoro');
    }
  };

  const handleTaskToggle = (id) => {
    setTasks(tasks => tasks.map(task =>
      task.id === id ? { ...task, done: !task.done } : task
    ));
  };

  // Settings handlers
  const handleSettingsChange = (setter) => (e) => setter(Number(e.target.value));

  const handlePinToggle = (id) => {
    setResources(resources => resources.map(r =>
      r.id === id ? { ...r, pinned: !r.pinned } : r
    ));
  };

  const resourceTypes = [
    { key: 'note', label: 'Note', icon: <BookOpen color="#7c83fd" size={22} /> },
    { key: 'pdf', label: 'PDF', icon: <FileText color="#f56565" size={22} /> },
    { key: 'textbook', label: 'Textbook', icon: <BookOpen color="#22c55e" size={22} /> },
    { key: 'document', label: 'Document', icon: <BookOpen color="#7c83fd" size={22} /> },
    { key: 'link', label: 'Link', icon: <MessageCircle color="#4ecdc4" size={22} /> },
  ];

  const fetchUserDocuments = async () => {
    try {
      setIsLoadingDocuments(true);
      const response = await api.get('/documents/notes/');
      if (response.status === 200) {
        setUserDocuments(response.data);
      }
    } catch (error) {
      console.error('Error fetching documents:', error);
    } finally {
      setIsLoadingDocuments(false);
    }
  };

  const fetchUserFolders = async () => {
    try {
      setIsLoadingFolders(true);
      const response = await api.get('/folders/user/');
      if (response.status === 200) {
        // The API returns {folders: [...]} structure
        const folders = response.data.folders || [];
        setUserFolders(folders);
      }
    } catch (error) {
      console.error('Error fetching folders:', error);
      setUserFolders([]);
    } finally {
      setIsLoadingFolders(false);
    }
  };

  const fetchFolderDocuments = async (folderId) => {
    try {
      setIsLoadingDocuments(true);
      const response = await api.get(`/documents/notes/${folderId}/`);
      if (response.status === 200) {
        // Ensure we always set an array, even if the response structure is different
        const documents = Array.isArray(response.data) ? response.data : [];
        setUserDocuments(documents);
      }
    } catch (error) {
      console.error('Error fetching documents:', error);
      setUserDocuments([]);
    } finally {
      setIsLoadingDocuments(false);
    }
  };

  const handleFolderSelect = (folder) => {
    setSelectedFolder(folder);
    fetchFolderDocuments(folder.id);
    setImportStep('documents');
  };

  const handleDocumentSelect = async (document) => {
    try {
      // Pin the selected document to the dashboard
      const pinResponse = await api.post('/solostudyroom/pinned/', {
        document: [document.id]
      });
      
      if (pinResponse.status === 201) {
        // Update pinned resources with the new data
        setPinnedResources(pinResponse.data);
        setSuccessMessage('Document pinned successfully!');
        setImportSuccess(true);
        setTimeout(() => setImportSuccess(false), 3000);
        
        // Close modal and reset
        setShowImportModal(false);
        setImportStep('select');
        setSelectedType(null);
        setSelectedDocument(null);
        setSelectedFolder(null);
      }
    } catch (error) {
      console.error('Error pinning document:', error);
      alert('Error pinning document: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleImportResource = async () => {
    try {
      let resourceData = {};
      
      if (selectedType === 'pdf' || selectedType === 'textbook') {
        if (!importFile) {
          alert('Please select a file to upload');
          return;
        }
        
        // Create FormData for file upload to resources module
        const formData = new FormData();
        formData.append('file_upload', importFile);
        
        // Get current user email from session storage
        const user = JSON.parse(sessionStorage.getItem('user') || '{}');
        if (!user.id) {
          alert('User not authenticated');
          return;
        }
        formData.append('user', user.id);
        
        // Set resource type based on selected type
        const resourceType = selectedType === 'pdf' ? 'file' : 'textbook';
        formData.append('resource_type', resourceType);
        
        // Debug: Log what we're sending
        console.log('Uploading file:', {
          fileName: importFile.name,
          fileSize: importFile.size,
          fileType: importFile.type,
          resourceType: resourceType,
          userEmail: user.email
        });
        
        // First, create the file via resources/create/ endpoint
        const response = await api.post('/resources/create/', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        
        if (response.status === 201) {
          console.log('File created successfully:', response.data);
          
          // Now pin the created file to the dashboard via solostudyroom/pinned/
          const pinResponse = await api.post('/solostudyroom/pinned/', {
            file: [response.data.id]
          });
          
          if (pinResponse.status === 201) {
            console.log('File pinned successfully:', pinResponse.data);
            // Update pinned resources with the new data
            setPinnedResources(pinResponse.data);
            setSuccessMessage(`${selectedType.charAt(0).toUpperCase() + selectedType.slice(1)} imported and pinned successfully!`);
            setImportSuccess(true);
            setTimeout(() => setImportSuccess(false), 3000);
          } else {
            console.error('Failed to pin file:', pinResponse);
            alert('File uploaded but failed to pin. Please try again.');
          }
        } else {
          console.error('Failed to create file:', response);
          alert('Failed to upload file. Please check the file type and try again.');
        }
      } else if (selectedType === 'link') {
        if (!importValue.trim()) {
          alert('Please enter a valid link');
          return;
        }
        
        if (!importLinkTitle.trim()) {
          alert('Please enter a title for the link');
          return;
        }
        
        // Pin the link to the dashboard
        const pinResponse = await api.post('/solostudyroom/pinned/', {
          link: importValue.trim(),
          title: importLinkTitle.trim(),
          resource_type: 'link'
        });
        
        if (pinResponse.status === 201) {
          // Update pinned resources with the new data
          setPinnedResources(pinResponse.data);
          setSuccessMessage('Link pinned successfully!');
          setImportSuccess(true);
          setTimeout(() => setImportSuccess(false), 3000);
        }
      } else if (selectedType === 'note') {
        if (!importValue.trim()) {
          alert('Please enter note content');
          return;
        }
        
        // For notes, we'll create a local resource since backend doesn't handle notes yet
        const newResource = {
          id: Date.now(),
          type: 'note',
          title: importValue.substring(0, 50) + (importValue.length > 50 ? '...' : ''),
          content: importValue.trim(),
          pinned: false,
          uploaded_at: new Date().toISOString()
        };
        setResources(prev => [...prev, newResource]);
        alert('Note resource added successfully!');
        setImportSuccess(true);
        setTimeout(() => setImportSuccess(false), 3000);
      }
      
      // Close modal and reset
      setShowImportModal(false);
      setImportStep('select');
      setSelectedType(null);
      setImportValue('');
      setImportFile(null);
      setImportLinkTitle('');
      setSelectedDocument(null);
      setSelectedFolder(null);
      
    } catch (error) {
      console.error('Error importing resource:', error);
      alert('Error importing resource: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleUnpinResource = async (resourceId, resourceType) => {
    try {
      const response = await api.delete(`/solostudyroom/delete/${resourceId}/?resource_type=${resourceType}`);
      if (response.status === 200) {
        setPinnedResources(prev => {
          const newPinned = { ...prev };
          if (resourceType === 'file') {
            newPinned.file = newPinned.file.filter(f => f.id !== resourceId);
          } else if (resourceType === 'link') {
            newPinned.link = newPinned.link.filter(l => l.id !== resourceId);
          } else if (resourceType === 'document') {
            newPinned.document = newPinned.document.filter(d => d.id !== resourceId);
          }
          return newPinned;
        });
        setSuccessMessage(`Resource unpinned successfully!`);
        setImportSuccess(true);
        setTimeout(() => setImportSuccess(false), 3000);
      }
    } catch (error) {
      console.error('Error unpinning resource:', error);
      alert('Error unpinning resource: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleResourceClick = async (resource, resourceType) => {
    try {
      setIsLoadingOverlay(true);
      setOverlayType(resourceType);
      
      if (resourceType === 'document') {
        // Fetch document content from documents module
        const response = await api.get(`/documents/notes/${resource.folder_id}/${resource.id}/`);
        if (response.status === 200) {
          console.log('Document API response:', response.data);
          setOverlayContent(response.data);
          setShowOverlay(true);
        }
      } else if (resourceType === 'link') {
        // Fetch link details from resources module
        const response = await api.get(`/resources/link/${resource.id}/`);
        if (response.status === 200) {
          setOverlayContent(response.data);
          setShowOverlay(true);
        }
      } else if (resourceType === 'file') {
        // For files, we'll use the file_upload URL directly
        setOverlayContent({
          ...resource,
          file_url: resource.file_upload || `/media/${resource.file_upload}`
        });
        setShowOverlay(true);
      }
    } catch (error) {
      console.error('Error fetching resource content:', error);
      alert('Error loading resource: ' + (error.response?.data?.message || error.message));
    } finally {
      setIsLoadingOverlay(false);
    }
  };

  const closeOverlay = () => {
    setShowOverlay(false);
    setOverlayContent(null);
    setOverlayType(null);
  };

    return (
    <div className="study-room">
            <div className="study-room-header">
        <div className="buttons-container">
            <div className="header-left">
            <button className="btn-ghost back-button" onClick={() => navigate('/night-owl-flashcards')}>
                <ArrowLeft size={20} />
                Back to Flashcards
            </button>
            </div>
            <div className="header-right">
                <div className="header-controls">
                    <button className="btn-ghost theme-toggle" onClick={() => setIsDarkMode((d) => !d)} aria-label="Toggle theme">
                        {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
                    </button>
                    <button className="btn-ghost" onClick={() => setShowPomodoro(s => !s)} title="Pomodoro Timer">
                      <Timer size={20} />
                    </button>
                    <button className="btn-ghost study-mode-toggle" onClick={() => setIsStudyMode((s) => !s)}>
                        {isStudyMode ? 'Exit Study Mode' : 'Enter Study Mode'}
                    </button>
                </div>
            </div>
            </div>

        <div className="header-center">
          <h1><span className="leaf-emoji">🌱</span>Study Room</h1>
        </div>
      </div>
      <div className="study-room-subtitle">
        Get started by choosing what study tool you'd like to work with today.
      </div>
      
      {/* Success Message */}
      {importSuccess && (
        <div style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          background: '#10b981',
          color: 'white',
          padding: '12px 20px',
          borderRadius: '8px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          zIndex: 3000,
          animation: 'slideInRight 0.3s ease'
        }}>
          {successMessage}
        </div>
      )}
      
      <div className="study-room-grid">
                {tools.map((tool, index) => (
          <div key={index} className="study-room-card" onClick={() => navigate(tool.route)} style={{ cursor: 'pointer' }}>
            {React.cloneElement(tool.icon, { color: tool.color })}
                        <span>{tool.label}</span>
                    </div>
                ))}
            </div>
      {/* Pinned Notes & Resources Section */}
      <div className="pinned-resources-section">
        <div className="pinned-resources-header">
          <h3>Pinned Notes & Resources</h3>
          <button 
            className="btn-ghost" 
            onClick={() => {
              setShowImportModal(true);
            }} 
            style={{ 
              fontSize: 15, 
              padding: '8px 18px',
              position: 'relative',
              zIndex: 1000,
              cursor: 'pointer',
              pointerEvents: 'auto'
            }}
          >
            Import Resource
          </button>
        </div>
        <div className="pinned-resources-grid">
          {isLoadingPinnedResources ? (
            <div style={{ textAlign: 'center', padding: '20px 0', color: '#a0aec0' }}>
              Loading pinned resources...
            </div>
          ) : pinnedResources.file.length === 0 && pinnedResources.link.length === 0 && pinnedResources.document.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '20px 0', color: '#a0aec0' }}>
              No pinned resources yet. Add some to keep them handy!
            </div>
          ) : (
            <>
              {/* Display pinned files */}
              {pinnedResources.file.map(file => (
                <div key={`file-${file.id}`} className="pinned-resource-card pinned" onClick={() => handleResourceClick(file, 'file')}>
                  <div className="pinned-resource-title">
                    <span className="icon-span" style={{ fontSize: 28, color: '#3b82f6' }}>
                      <FileText size={28} />
                    </span>
                    <span className="title-text" title={file.file_name || file.name || 'Untitled File'}>
                      {file.file_name || file.name || 'Untitled File'}
                    </span>
                  </div>
                  <div className="pinned-resource-actions">
                    <button
                      className="pinned-resource-pin-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleUnpinResource(file.id, 'file');
                      }}
                    >
                      Unpin
                    </button>
                  </div>
                </div>
              ))}
              
              {/* Display pinned links */}
              {pinnedResources.link.map(link => (
                <div key={`link-${link.id}`} className="pinned-resource-card pinned" onClick={() => handleResourceClick(link, 'link')}>
                  <div className="pinned-resource-title">
                    <span className="icon-span" style={{ fontSize: 28, color: '#10b981' }}>
                      <MessageCircle size={28} />
                    </span>
                    <span className="title-text" title={link.title || 'Untitled Link'}>
                      {link.title || 'Untitled Link'}
                    </span>
                  </div>
                  <div className="pinned-resource-actions">
                    <button
                      className="pinned-resource-pin-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleUnpinResource(link.id, 'link');
                      }}
                    >
                      Unpin
                    </button>
                  </div>
                </div>
              ))}
              
              {/* Display pinned documents */}
              {pinnedResources.document.map(doc => (
                <div key={`doc-${doc.id}`} className="pinned-resource-card pinned" onClick={() => handleResourceClick(doc, 'document')}>
                  <div className="pinned-resource-title">
                    <span className="icon-span" style={{ fontSize: 28, color: '#8b5cf6' }}>
                      <BookOpen size={28} />
                    </span>
                    <span className="title-text" title={doc.title || 'Untitled Document'}>
                      {doc.title || 'Untitled Document'}
                    </span>
                  </div>
                  <div className="pinned-resource-actions">
                    <button
                      className="pinned-resource-pin-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleUnpinResource(doc.id, 'document');
                      }}
                    >
                      Unpin
                    </button>
                  </div>
                </div>
              ))}
            </>
          )}
        </div>
                        </div>
      {/* Import Modal (placeholder) */}
      {showImportModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          background: 'rgba(0,0,0,0.55)',
          zIndex: 2000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <div style={{ background: '#23272f', borderRadius: 16, padding: 32, minWidth: 340, color: '#fff', boxShadow: '0 8px 32px rgba(0,0,0,0.25)', maxWidth: 400 }}>
            <h3 style={{ marginTop: 0, fontSize: 20 }}>Import Resource</h3>
            {importStep === 'select' && (
              <>
                <p style={{ color: '#a0aec0', fontSize: 15, marginBottom: 18 }}>Choose the type of resource to import:</p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, marginBottom: 24 }}>
                  {resourceTypes.map(rt => (
                    <button
                      key={rt.key}
                      className="btn-ghost"
                      style={{ minWidth: 90, minHeight: 70, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, fontSize: 15, borderColor: selectedType === rt.key ? '#7c83fd' : '#2d3748', background: selectedType === rt.key ? '#18181b' : 'transparent', fontWeight: 500, cursor: 'pointer' }}
                      onClick={() => { 
                        setSelectedType(rt.key); 
                        if (rt.key === 'document') {
                          fetchUserFolders();
                          setImportStep('folders');
                        } else {
                          setImportStep('input');
                        }
                      }}
                    >
                      {rt.icon}
                      {rt.label}
                    </button>
                  ))}
                </div>
                <button className="btn-ghost" style={{ marginTop: 8 }} onClick={() => setShowImportModal(false)}>Cancel</button>
              </>
            )}
            {importStep === 'input' && selectedType && (
              <>
                <button className="btn-ghost" style={{ position: 'absolute', top: 18, right: 18, fontSize: 22 }} onClick={() => setShowImportModal(false)}>×</button>
                <button className="btn-ghost" style={{ marginBottom: 18 }} onClick={() => { setImportStep('select'); setSelectedType(null); setImportValue(''); setImportFile(null); setImportLinkTitle(''); }}>← Back</button>
                <div style={{ marginBottom: 18 }}>
                  <strong style={{ fontSize: 16 }}>{resourceTypes.find(rt => rt.key === selectedType)?.label}</strong>
                </div>
                {selectedType === 'note' && (
                  <textarea
                    placeholder="Paste or type your note here..."
                    value={importValue}
                    onChange={e => setImportValue(e.target.value)}
                    style={{ width: '100%', minHeight: 80, borderRadius: 8, border: '1px solid #2d3748', background: '#18181b', color: '#fff', padding: 12, marginBottom: 18 }}
                  />
                )}
                {(selectedType === 'pdf' || selectedType === 'textbook') && (
                  <div>
                    <input
                      type="file"
                      accept={selectedType === 'pdf' ? '.pdf' : '.pdf,.doc,.docx,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document'}
                      onChange={e => setImportFile(e.target.files[0])}
                      style={{ marginBottom: 18, color: '#fff' }}
                    />
                    {importFile && (
                      <div style={{ 
                        fontSize: '12px', 
                        color: '#a0aec0', 
                        marginTop: '4px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                      }}>
                        <FileText size={14} />
                        {importFile.name} ({(importFile.size / 1024 / 1024).toFixed(2)} MB)
                      </div>
                    )}
                  </div>
                )}
                {selectedType === 'link' && (
                  <div>
                    <input
                      type="text"
                      placeholder="Enter link title (e.g., 'Neuroscience Basics')"
                      value={importLinkTitle}
                      onChange={e => setImportLinkTitle(e.target.value)}
                      style={{ width: '100%', borderRadius: 8, border: '1px solid #2d3748', background: '#18181b', color: '#fff', padding: 12, marginBottom: 18 }}
                    />
                    <input
                      type="url"
                      placeholder="Paste a link (https://...)"
                      value={importValue}
                      onChange={e => setImportValue(e.target.value)}
                      style={{ width: '100%', borderRadius: 8, border: '1px solid #2d3748', background: '#18181b', color: '#fff', padding: 12, marginBottom: 18 }}
                    />
                  </div>
                )}
                {selectedType === 'textbook' && (
                  <input
                    type="text"
                    placeholder="Enter textbook title or details..."
                    value={importValue}
                    onChange={e => setImportValue(e.target.value)}
                    style={{ width: '100%', borderRadius: 8, border: '1px solid #2d3748', background: '#18181b', color: '#fff', padding: 12, marginBottom: 18 }}
                  />
                )}
                <button className="btn-ghost" style={{ marginTop: 8, width: '100%' }} onClick={handleImportResource}>Import</button>
              </>
            )}
            {importStep === 'folders' && selectedType === 'document' && (
              <>
                <button className="btn-ghost" style={{ position: 'absolute', top: 18, right: 18, fontSize: 22 }} onClick={() => setShowImportModal(false)}>×</button>
                <button className="btn-ghost" style={{ marginBottom: 18 }} onClick={() => { setImportStep('select'); setSelectedType(null); setSelectedFolder(null); }}>← Back</button>
                <div style={{ marginBottom: 18 }}>
                  <strong style={{ fontSize: 16 }}>Select a Folder</strong>
                </div>
                {isLoadingFolders ? (
                  <div style={{ textAlign: 'center', padding: '20px', color: '#a0aec0' }}>
                    Loading your folders...
                  </div>
                ) : userFolders.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '20px', color: '#a0aec0' }}>
                    No folders found. Create some folders first!
                  </div>
                ) : (
                  <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                    {Array.isArray(userFolders) && userFolders.map((folder) => (
                      <div
                        key={folder.id}
                        className="btn-ghost"
                        style={{
                          width: '100%',
                          marginBottom: '8px',
                          textAlign: 'left',
                          padding: '12px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          cursor: 'pointer',
                          borderColor: selectedFolder?.id === folder.id ? '#7c83fd' : '#2d3748',
                          background: selectedFolder?.id === folder.id ? '#18181b' : 'transparent'
                        }}
                        onClick={() => handleFolderSelect(folder)}
                      >
                        <BookOpen color="#7c83fd" size={18} />
                        <span style={{ flex: 1 }}>{folder.name}</span>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
            {importStep === 'documents' && selectedType === 'document' && (
              <>
                <button className="btn-ghost" style={{ position: 'absolute', top: 18, right: 18, fontSize: 22 }} onClick={() => setShowImportModal(false)}>×</button>
                <button className="btn-ghost" style={{ marginBottom: 18 }} onClick={() => { setImportStep('folders'); setSelectedDocument(null); setSelectedFolder(null); }}>← Back</button>
                <div style={{ marginBottom: 18 }}>
                  <strong style={{ fontSize: 16 }}>Select a Document from "{selectedFolder?.name}"</strong>
                </div>
                {isLoadingDocuments ? (
                  <div style={{ textAlign: 'center', padding: '20px', color: '#a0aec0' }}>
                    Loading your documents...
                  </div>
                ) : userDocuments.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '20px', color: '#a0aec0' }}>
                    No documents found in this folder.
                  </div>
                ) : (
                  <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                    {Array.isArray(userDocuments) && userDocuments.map((doc) => (
                      <div
                        key={doc.id}
                        className="btn-ghost"
                        style={{
                          width: '100%',
                          marginBottom: '8px',
                          textAlign: 'left',
                          padding: '12px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          cursor: 'pointer',
                          borderColor: selectedDocument?.id === doc.id ? '#7c83fd' : '#2d3748',
                          background: selectedDocument?.id === doc.id ? '#18181b' : 'transparent'
                        }}
                        onClick={() => handleDocumentSelect(doc)}
                      >
                        <FileText color="#ffd93d" size={18} />
                        <span style={{ flex: 1 }}>{doc.title}</span>
                        {doc.tag && (
                          <span style={{
                            fontSize: '12px',
                            padding: '2px 6px',
                            background: 'rgba(124, 131, 253, 0.15)',
                            color: '#7c83fd',
                            borderRadius: '4px'
                          }}>
                            {doc.tag.title}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}
      {/* Timer & Tasks Panel (toggleable modal) */}
      {showPomodoro && <div className="pomodoro-overlay" />}
      {showPomodoro && (
        <div style={{
          position: 'fixed',
          top: 0,
          right: 0,
          width: '100%',
          maxWidth: 420,
          height: '100vh',
          background: 'rgba(28,28,38,0.98)',
          boxShadow: '-4px 0 32px rgba(0,0,0,0.25)',
          zIndex: 1002,
          padding: '32px 24px',
          overflowY: 'auto',
          borderLeft: '1.5px solid #23272f',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          animation: 'slideInRight 0.25s',
        }}>
          <button className="btn-ghost" style={{ position: 'absolute', top: 18, right: 18, zIndex: 1003 }} onClick={() => setShowPomodoro(false)}>
            ×
          </button>
          <div style={{ width: '100%', maxWidth: 380 }}>
            {/* Pomodoro timer panel content (copy from previous focus-timer-panel) */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                <span style={{ color: phaseMeta[phase].color }}>{phaseMeta[phase].icon}</span>
                <span style={{ color: phaseMeta[phase].color, fontWeight: 600, fontSize: 18 }}>{phaseMeta[phase].label}</span>
                <span style={{ color: '#a0aec0', fontSize: 15, marginLeft: 8 }}>{completedPomodoros} / {longBreakInterval}</span>
              </div>
              <div style={{ fontSize: 44, fontWeight: 700, color: phaseMeta[phase].color, letterSpacing: 2, fontFamily: 'Courier New, monospace', marginBottom: 8 }}>
                {formatTime(timeLeft)}
              </div>
              <div style={{ width: '100%', height: 6, background: 'rgba(255,255,255,0.1)', borderRadius: 3, overflow: 'hidden', marginBottom: 16 }}>
                <div style={{ height: '100%', borderRadius: 3, background: phaseMeta[phase].color, width: `${100 - (timeLeft / (phase === 'pomodoro' ? pomodoroTime * 60 : phase === 'break' ? breakTime * 60 : longBreakTime * 60)) * 100}%`, transition: 'width 0.3s' }} />
                    </div>
              <div style={{ display: 'flex', gap: 12, marginBottom: 8 }}>
                {isRunning ? (
                  <button className="pomodoro-btn" onClick={handlePause}><Pause size={18} />Pause</button>
                ) : (
                  <button className="pomodoro-btn" onClick={handleStart}><Play size={18} />Start</button>
                )}
                <button className="pomodoro-btn" onClick={handleReset}><RotateCcw size={18} />Reset</button>
                <button className="pomodoro-btn" onClick={handleSkip}>Skip</button>
                <button className="pomodoro-btn" onClick={() => setShowSettings(s => !s)}><Settings size={16} /></button>
              </div>
            </div>
            {showSettings && (
              <div className="pomodoro-settings" style={{ margin: '24px auto 0', maxWidth: 340, background: '#18181b', borderRadius: 16, border: '1px solid #23272f', color: '#fff', padding: 24 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
                  <h3 style={{ fontSize: 18, fontWeight: 600, margin: 0 }}>Pomodoro Settings</h3>
                  <button className="pomodoro-btn" style={{ borderRadius: '50%', width: 32, height: 32, padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => setShowSettings(false)}>×</button>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  <label>Focus Time (min)
                    <input type="number" min={1} max={120} value={pomodoroTime} onChange={handleSettingsChange(setPomodoroTime)} style={{ width: '100%', marginTop: 4, padding: 8, borderRadius: 8, border: '1px solid #23272f', background: '#23272f', color: '#fff' }} />
                  </label>
                  <label>Short Break (min)
                    <input type="number" min={1} max={30} value={breakTime} onChange={handleSettingsChange(setBreakTime)} style={{ width: '100%', marginTop: 4, padding: 8, borderRadius: 8, border: '1px solid #23272f', background: '#23272f', color: '#fff' }} />
                  </label>
                  <label>Long Break (min)
                    <input type="number" min={1} max={60} value={longBreakTime} onChange={handleSettingsChange(setLongBreakTime)} style={{ width: '100%', marginTop: 4, padding: 8, borderRadius: 8, border: '1px solid #23272f', background: '#23272f', color: '#fff' }} />
                  </label>
                  <label>Long Break Interval
                    <input type="number" min={1} max={10} value={longBreakInterval} onChange={handleSettingsChange(setLongBreakInterval)} style={{ width: '100%', marginTop: 4, padding: 8, borderRadius: 8, border: '1px solid #23272f', background: '#23272f', color: '#fff' }} />
                  </label>
                </div>
              </div>
            )}
            <div style={{ marginTop: 32 }}>
              <h3 style={{ color: '#fff', fontSize: 18, marginBottom: 12, textAlign: 'left' }}>Today's Focus Tasks</h3>
              <ul className="focus-tasks-list">
                {tasks.map(task => (
                  <li key={task.id} className={`focus-task-item${task.done ? ' checked' : ''}`}>
                    <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', width: '100%' }}>
                      <input
                        type="checkbox"
                        className="focus-task-checkbox"
                        checked={task.done}
                        onChange={() => handleTaskToggle(task.id)}
                      />
                      <span className="focus-task-label">{task.text}</span>
                    </label>
                  </li>
                ))}
              </ul>
            </div>
            </div>
        </div>
      )}
      
      {/* Resource Content Overlay */}
      {showOverlay && (
        <div className="resource-overlay" onClick={closeOverlay}>
          <div className="overlay-content" onClick={(e) => e.stopPropagation()}>
            <div className="overlay-header">
              <h3>
                {overlayType === 'document' && (overlayContent?.title || 'Document Notes')}
                {overlayType === 'link' && 'Link Content'}
                {overlayType === 'file' && 'File Viewer'}
              </h3>
              <button className="close-btn" onClick={closeOverlay}>×</button>
            </div>
            
            {isLoadingOverlay ? (
              <div className="loading-content">
                <div className="spinner"></div>
                <p>Loading content...</p>
              </div>
            ) : (
              <div className="overlay-body">
                {overlayType === 'document' && overlayContent && (
                  <div className="document-content">
                    <div className="notes-content">
                      {console.log('Document overlay content:', overlayContent)}
                      <div dangerouslySetInnerHTML={{ 
                        __html: overlayContent.content || overlayContent.notes || overlayContent.text || 'No content available' 
                      }} />
                    </div>
                    {overlayContent.tag && (
                      <div className="document-tag">
                        <span>Tag: {overlayContent.tag.title}</span>
                      </div>
                    )}
                  </div>
                )}
                
                {overlayType === 'link' && overlayContent && (
                  <div className="link-content">
                    <h4>{overlayContent.title}</h4>
                    <div className="link-url">
                      <a href={overlayContent.link} target="_blank" rel="noopener noreferrer">
                        {overlayContent.link}
                      </a>
                    </div>
                    {overlayContent.link.includes('youtube.com') || overlayContent.link.includes('youtu.be') ? (
                      <div className="video-embed">
                        <iframe
                          src={overlayContent.link.replace('watch?v=', 'embed/')}
                          title={overlayContent.title}
                          width="100%"
                          height="400"
                          frameBorder="0"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                        ></iframe>
                      </div>
                    ) : (
                      <div className="link-preview">
                        <p>Click the link above to view the content</p>
                      </div>
                    )}
                  </div>
                )}
                
                {overlayType === 'file' && overlayContent && (
                  <div className="file-content">
                    <h4>{overlayContent.file_name || 'File'}</h4>
                    <div className="file-viewer">
                      {overlayContent.file_upload && overlayContent.file_upload.includes('.pdf') ? (
                        <iframe
                          src={overlayContent.file_upload}
                          title={overlayContent.file_name}
                          width="100%"
                          height="600"
                          style={{ border: 'none' }}
                        ></iframe>
                      ) : (
                        <div className="file-download">
                          <p>File: {overlayContent.file_name}</p>
                          <a 
                            href={overlayContent.file_upload} 
                            download={overlayContent.file_name}
                            className="download-btn"
                          >
                            Download File
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
      
        </div>
    );
};

export default StudyRoom; 