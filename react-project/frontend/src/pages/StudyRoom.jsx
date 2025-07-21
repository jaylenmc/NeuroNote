import React, { useState, useEffect, useRef } from 'react';
import { Users, User, UserPlus, LogOut, Info, BookOpen, Brain, MessageCircle, Mic, Clock, FileText, Paperclip, Star, Timer, ChevronLeft, ChevronRight, PenTool, Square, StickyNote, Image, Undo2, Download, Volume2, Bell, Zap, ArrowLeft, Book, Plus, X, MessageSquare, PanelRightClose, PanelRightOpen, Play, Pause, RotateCcw, Smile, Type, Heading1, Heading2, Heading3, Bold, Italic, List, ListOrdered, Maximize2, Minimize2 } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import PomodoroTimer from '../components/PomodoroTimer';
import './StudyRoomPage.css';

const mockParticipants = [
  { name: 'Jaylen', online: true, color: '#4ECDC4' },
  { name: 'Chris', online: true, color: '#FFD93D' },
  { name: 'Dana', online: false, color: '#FF6B6B' },
  { name: 'Ella', online: true, color: '#7C83FD' }
];

const mockFiles = [
  { name: 'BiologyNotes.pdf', type: 'pdf', url: '#' },
  { name: 'ExamTopics.docx', type: 'doc', url: '#' },
  { name: 'Useful Link', type: 'link', url: '#' }
];

const mockPinned = [
  { text: 'Remember to review chapter 5!', author: 'Chris' },
  { text: 'Key formula: E=mc^2', author: 'Jaylen' }
];

const mockMessages = [
  // Removed stock messages - chat will start empty
];

const lastQuizBattleStats = {
  quizTitle: "Biology Midterm Review",
  date: "2024-01-15",
  participants: 4,
  yourScore: 85,
  totalQuestions: 25,
  correctAnswers: 21,
  timeTaken: "18:32",
  rank: 2,
  accuracy: "84%",
  averageScore: 72,
  topScore: 92,
  fastestTime: "12:45"
};

const sampleQuizzes = [
  {
    id: 1,
    title: "Biology Midterm Review",
    subject: "Biology",
    author: "Jaylen",
    questionCount: 25,
    difficulty: "Medium",
    timeLimit: 30,
    participants: 4,
    isActive: true
  },
  {
    id: 2,
    title: "Chemistry Bonding Quiz",
    subject: "Chemistry", 
    author: "Chris",
    questionCount: 15,
    difficulty: "Easy",
    timeLimit: 20,
    participants: 2,
    isActive: false
  },
  {
    id: 3,
    title: "Physics Laws Challenge",
    subject: "Physics",
    author: "Dana",
    questionCount: 30,
    difficulty: "Hard",
    timeLimit: 45,
    participants: 3,
    isActive: true
  },
  {
    id: 4,
    title: "Math Derivatives Test",
    subject: "Mathematics",
    author: "Ella",
    questionCount: 20,
    difficulty: "Medium",
    timeLimit: 25,
    participants: 1,
    isActive: false
  },
  {
    id: 5,
    title: "History WWII Facts",
    subject: "History",
    author: "Jaylen",
    questionCount: 18,
    difficulty: "Easy",
    timeLimit: 15,
    participants: 5,
    isActive: true
  }
];

const personalNotesData = [
  {
    id: 1,
    title: "Biology Chapter 5 - Cell Division",
    content: `<h1>Cell Division Notes</h1>
<p>Key concepts about mitosis and meiosis.</p>
<h2>Mitosis Phases</h2>
<ul>
<li><strong>Prophase:</strong> Chromosomes condense</li>
<li><strong>Metaphase:</strong> Chromosomes align</li>
<li><strong>Anaphase:</strong> Chromosomes separate</li>
<li><strong>Telophase:</strong> New nuclei form</li>
</ul>
<p><em>Remember: PMAT - Prophase, Metaphase, Anaphase, Telophase</em></p>`,
    date: "2024-01-15",
    tags: ["Biology", "Cell Division"]
  },
  {
    id: 2,
    title: "Chemistry - Chemical Bonding",
    content: `<h1>Chemical Bonding</h1>
<p>Understanding ionic and covalent bonds.</p>
<h2>Ionic Bonds</h2>
<ul>
<li>Transfer of electrons</li>
<li>Between metals and non-metals</li>
<li>High melting points</li>
</ul>
<h2>Covalent Bonds</h2>
<ul>
<li>Sharing of electrons</li>
<li>Between non-metals</li>
<li>Lower melting points</li>
</ul>`,
    date: "2024-01-12",
    tags: ["Chemistry", "Bonding"]
  },
  {
    id: 3,
    title: "Physics - Newton's Laws",
    content: `<h1>Newton's Laws of Motion</h1>
<p>Fundamental principles of classical mechanics.</p>
<h2>First Law (Inertia)</h2>
<p>An object at rest stays at rest unless acted upon by an external force.</p>
<h2>Second Law (F = ma)</h2>
<p>Force equals mass times acceleration.</p>
<h2>Third Law (Action-Reaction)</h2>
<p>For every action, there is an equal and opposite reaction.</p>`,
    date: "2024-01-10",
    tags: ["Physics", "Mechanics"]
  },
  {
    id: 4,
    title: "Math - Calculus Derivatives",
    content: `<h1>Derivatives</h1>
<p>Understanding rate of change.</p>
<h2>Basic Rules</h2>
<ul>
<li><strong>Power Rule:</strong> d/dx(x^n) = nx^(n-1)</li>
<li><strong>Product Rule:</strong> d/dx(uv) = u'v + uv'</li>
<li><strong>Chain Rule:</strong> d/dx(f(g(x))) = f'(g(x)) * g'(x)</li>
</ul>
<h3>Common Derivatives</h3>
<ul>
<li>d/dx(sin x) = cos x</li>
<li>d/dx(cos x) = -sin x</li>
<li>d/dx(e^x) = e^x</li>
</ul>`,
    date: "2024-01-08",
    tags: ["Math", "Calculus"]
  },
  {
    id: 5,
    title: "History - World War II",
    content: `<h1>World War II Timeline</h1>
<p>Key events and turning points.</p>
<h2>Major Events</h2>
<ol>
<li><strong>1939:</strong> Germany invades Poland</li>
<li><strong>1941:</strong> Pearl Harbor attack</li>
<li><strong>1944:</strong> D-Day invasion</li>
<li><strong>1945:</strong> Atomic bombs dropped</li>
</ol>
<h3>Key Figures</h3>
<ul>
<li>Winston Churchill</li>
<li>Franklin D. Roosevelt</li>
<li>Adolf Hitler</li>
<li>Joseph Stalin</li>
</ul>`,
    date: "2024-01-05",
    tags: ["History", "WWII"]
  }
];

const StudyRoom = () => {
  const [activeTab, setActiveTab] = useState('notes');
  const [showRightTab, setShowRightTab] = useState('files');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [chatMessage, setChatMessage] = useState('');
  const [showRightSidebar, setShowRightSidebar] = useState(true);
  const [messages, setMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [typingUsers, setTypingUsers] = useState([]);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [notesContent, setNotesContent] = useState('');
  const [currentFormat, setCurrentFormat] = useState('paragraph');
  const [isPersonalNotes, setIsPersonalNotes] = useState(false);
  const [selectedNoteId, setSelectedNoteId] = useState(null);
  const [showNotesList, setShowNotesList] = useState(false);
  const [isNotesFullscreen, setIsNotesFullscreen] = useState(false);
  const [showQuizSelection, setShowQuizSelection] = useState(false);
  const ws = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();
  const chatMessagesRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const notesTextareaRef = useRef(null);

  // Get room name from URL query param (?room=roomname) or fallback
  const searchParams = new URLSearchParams(location.search);
  const roomName = searchParams.get('room') || 'biologymidterm';
  const roomSubject = searchParams.get('subject') || '';

  // Auto-scroll to bottom of chat
  useEffect(() => {
    if (chatMessagesRef.current) {
      chatMessagesRef.current.scrollTop = chatMessagesRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  // Update contenteditable div when notesContent changes
  useEffect(() => {
    if (notesTextareaRef.current && notesTextareaRef.current.innerHTML !== notesContent) {
      notesTextareaRef.current.innerHTML = notesContent;
    }
  }, [notesContent]);

  useEffect(() => {
    const wsUrl = `ws://127.0.0.1:8000/ws/chat/${roomName}/`;
    ws.current = new window.WebSocket(wsUrl);

    ws.current.onopen = () => {
      console.log('Connected to chat');
    };
    ws.current.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.message) {
        // Check if this message already exists (to prevent duplicates)
        setMessages((prev) => {
          const messageExists = prev.some(msg => 
            msg.text === data.message && 
            msg.time === new Date().toLocaleTimeString()
          );
          
          if (messageExists) {
            return prev; // Don't add duplicate
          }
          
          // Add message from other users only
          return [...prev, { 
            user: data.user || 'Other', 
            text: data.message, 
            time: new Date().toLocaleTimeString(),
            isOwn: false,
            isEmoji: data.isEmoji || false
          }];
        });
        
        // Hide typing indicator when message is received
        setIsTyping(false);
      } else if (data.type === 'typing') {
        // Handle typing indicator from other users
        if (data.user !== 'You') {
          setIsTyping(true);
          // Clear typing indicator after 3 seconds
          setTimeout(() => setIsTyping(false), 3000);
        }
      }
    };
    ws.current.onclose = () => {
      console.log('Disconnected from chat');
    };
    return () => {
      ws.current && ws.current.close();
    };
  }, [roomName]);

  const handleSendMessage = () => {
    if (chatMessage.trim() && ws.current && ws.current.readyState === 1) {
      const messageText = chatMessage;
      const messageTime = new Date().toLocaleTimeString();
      
      // Add message to local state immediately for better UX
      const tempMessage = {
        user: 'You',
        text: messageText,
        time: messageTime,
        isOwn: true,
        isEmoji: false,
        temp: true // Mark as temporary
      };
      
      setMessages((prev) => [...prev, tempMessage]);
      setChatMessage('');
      
      // Send to WebSocket
      ws.current.send(JSON.stringify({ message: messageText }));
      
      // Add emoji reaction animation
      setTimeout(() => {
        const emojiReaction = document.createElement('div');
        emojiReaction.className = 'emoji-reaction';
        emojiReaction.textContent = '✨';
        emojiReaction.style.position = 'absolute';
        emojiReaction.style.right = '20px';
        emojiReaction.style.bottom = '100px';
        emojiReaction.style.fontSize = '24px';
        emojiReaction.style.zIndex = '1000';
        document.body.appendChild(emojiReaction);
        
        setTimeout(() => {
          document.body.removeChild(emojiReaction);
        }, 1000);
      }, 100);
    }
  };

  const handleTyping = (e) => {
    setChatMessage(e.target.value);
    
    // Send typing indicator to other users
    if (ws.current && ws.current.readyState === 1) {
      // Clear previous timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      
      // Send typing indicator
      ws.current.send(JSON.stringify({ 
        type: 'typing', 
        user: 'You',
        isTyping: true 
      }));
      
      // Set timeout to stop typing indicator after 2 seconds of no typing
      typingTimeoutRef.current = setTimeout(() => {
        if (ws.current && ws.current.readyState === 1) {
          ws.current.send(JSON.stringify({ 
            type: 'typing', 
            user: 'You',
            isTyping: false 
          }));
        }
      }, 2000);
    }
  };

  const addEmojiReaction = (emoji) => {
    if (ws.current && ws.current.readyState === 1) {
      const messageTime = new Date().toLocaleTimeString();
      
      // Add emoji message to local state immediately
      const tempMessage = {
        user: 'You',
        text: emoji,
        time: messageTime,
        isOwn: true,
        isEmoji: true,
        temp: true
      };
      
      setMessages((prev) => [...prev, tempMessage]);
      
      // Send emoji through WebSocket
      ws.current.send(JSON.stringify({ message: emoji }));
    }
    setShowEmojiPicker(false);
  };

  const emojis = ['🚀', '📚', '💡', '🎯', '🔥', '⭐', '💪', '🎉', '🤔', '👏'];

  const selectNote = (noteId) => {
    const selectedNote = personalNotesData.find(note => note.id === noteId);
    if (selectedNote) {
      setSelectedNoteId(noteId);
      setNotesContent(selectedNote.content);
      setShowNotesList(false);
    }
  };

  const backToNotesList = () => {
    setShowNotesList(true);
    setSelectedNoteId(null);
    setNotesContent('');
  };

  const toggleFullscreen = () => {
    setIsNotesFullscreen(!isNotesFullscreen);
  };

  const handleQuizBattle = () => {
    setShowQuizSelection(true);
  };

  const selectQuiz = (quizId) => {
    console.log(`Selected quiz: ${quizId}`);
    setShowQuizSelection(false);
    // Here you would start the quiz battle
  };

  const closeQuizSelection = () => {
    setShowQuizSelection(false);
  };

  const toggleNotesMode = () => {
    setIsPersonalNotes(!isPersonalNotes);
    if (!isPersonalNotes) {
      // Switching to personal notes
      setShowNotesList(true);
      setSelectedNoteId(null);
      setNotesContent('');
    } else {
      // Switching to collaborative notes
      setShowNotesList(false);
      setSelectedNoteId(null);
      setNotesContent('');
    }
  };

  const formatText = (format) => {
    if (!notesTextareaRef.current) return;
    
    const textarea = notesTextareaRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = notesContent.substring(start, end);
    const beforeText = notesContent.substring(0, start);
    const afterText = notesContent.substring(end);
    
    let formattedText = '';
    let newCursorPos = start;
    
    switch (format) {
      case 'h1':
        formattedText = `<h1>${selectedText || 'Heading 1'}</h1>`;
        newCursorPos = start + 4;
        break;
      case 'h2':
        formattedText = `<h2>${selectedText || 'Heading 2'}</h2>`;
        newCursorPos = start + 4;
        break;
      case 'h3':
        formattedText = `<h3>${selectedText || 'Heading 3'}</h3>`;
        newCursorPos = start + 4;
        break;
      case 'bold':
        formattedText = `<strong>${selectedText || 'bold text'}</strong>`;
        newCursorPos = start + 8;
        break;
      case 'italic':
        formattedText = `<em>${selectedText || 'italic text'}</em>`;
        newCursorPos = start + 4;
        break;
      case 'list':
        formattedText = `<ul><li>${selectedText || 'list item'}</li></ul>`;
        newCursorPos = start + 4;
        break;
      case 'ordered-list':
        formattedText = `<ol><li>${selectedText || 'ordered item'}</li></ol>`;
        newCursorPos = start + 4;
        break;
      default:
        formattedText = selectedText;
    }
    
    const newContent = beforeText + formattedText + afterText;
    setNotesContent(newContent);
    setCurrentFormat(format);
    
    // Set cursor position after formatting
    setTimeout(() => {
      if (notesTextareaRef.current) {
        notesTextareaRef.current.focus();
        notesTextareaRef.current.setSelectionRange(newCursorPos, newCursorPos);
      }
    }, 0);
  };

  return (
    <div className={`study-room-main ${isNotesFullscreen ? 'notes-fullscreen' : ''}`}>
      {/* Left Sidebar */}
      <div className="study-room-sidebar">
        <div className="study-room-header">
          <span className="study-room-title">🧬</span>
          <span className="study-room-title-text">{roomName}</span>
          {roomSubject && <span className="study-room-title-tag">{roomSubject}</span>}
        </div>
        <div className="study-room-participants">
          {mockParticipants.map((p, i) => (
            <div key={p.name} className="study-room-participant">
              <span 
                className="study-room-avatar" 
                title={p.name}
                data-user={p.name}
              >
                {p.name[0]}
                <span className={`study-room-status ${p.online ? 'online' : 'offline'}`} />
              </span>
              <span className="study-room-name">{p.name}</span>
              <span className={`study-room-status-text${!p.online ? ' offline' : ''}`}>
                {p.online ? 'Online' : 'Offline'}
              </span>
            </div>
          ))}
        </div>
        <div className="study-room-actions">
          <button className="study-room-action-button" title="Room Info"><Info size={18} /></button>
          <button className="study-room-action-button" title="Invite People"><UserPlus size={18} /></button>
          <button className="study-room-action-button" title="Leave Room" onClick={() => navigate('/study-groups')}><LogOut size={18} /></button>
        </div>
      </div>

      {/* Center Collaboration Area */}
      <div className="study-room-center">
        {/* Tabs */}
        <div className="study-room-tabs">
          <TabBtn active={activeTab === 'notes'} onClick={() => setActiveTab('notes')} icon={<BookOpen size={18} />}>Notes</TabBtn>
          <TabBtn active={activeTab === 'whiteboard'} onClick={() => setActiveTab('whiteboard')} icon={<PenTool size={18} />}>Whiteboard</TabBtn>
          <TabBtn active={activeTab === 'review'} onClick={() => setActiveTab('review')} icon={<Brain size={18} />}>Review</TabBtn>
        </div>
        {/* Tab Content */}
        <div className="study-room-tab-content">
          {activeTab === 'notes' && (
            <div className="study-room-notes-content">
              <div className="study-room-notes-main">
                <div className="study-room-notes-header">
                  {isPersonalNotes && selectedNoteId && !showNotesList ? (
                    <button 
                      className="back-to-notes-btn"
                      onClick={backToNotesList}
                    >
                      <ChevronLeft size={16} />
                      Back to Notes
                    </button>
                  ) : (
                    <div></div>
                  )}
                  <div className="study-room-notes-title-center">
                    {isPersonalNotes && selectedNoteId && !showNotesList 
                      ? personalNotesData.find(note => note.id === selectedNoteId)?.title
                      : (isPersonalNotes ? 'Personal Notes' : 'Collaborative Notes')
                    }
                  </div>
                  <div className="study-room-notes-header-actions">
                    <button 
                      className="study-room-fullscreen-button"
                      onClick={toggleFullscreen}
                      title={isNotesFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
                    >
                      {isNotesFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
                    </button>
                    <button 
                      className={`study-room-notes-toggle-button ${isPersonalNotes ? 'active' : ''}`}
                      onClick={toggleNotesMode}
                      title={isPersonalNotes ? 'Switch to Collaborative Notes' : 'Switch to Personal Notes'}
                    >
                      {isPersonalNotes ? <Users size={16} /> : <User size={16} />}
                      {isPersonalNotes ? 'Collaborative' : 'Personal'}
                    </button>
                  </div>
                </div>

                {/* Personal Notes List View */}
                {isPersonalNotes && showNotesList && (
                  <div className="study-room-personal-notes-list">
                    <div className="study-room-notes-list-header">
                      <h3>My Notes</h3>
                      <span className="notes-count">{personalNotesData.length} notes</span>
                    </div>
                    <div className="study-room-notes-grid">
                      {personalNotesData.map((note) => (
                        <div 
                          key={note.id} 
                          className="study-room-note-card"
                          onClick={() => selectNote(note.id)}
                        >
                          <div className="note-card-header">
                            <h4>{note.title}</h4>
                            <span className="note-date">{note.date}</span>
                          </div>
                          <div className="note-card-content">
                            {note.content.replace(/<[^>]*>/g, '').substring(0, 120)}...
                          </div>
                          <div className="note-card-tags">
                            {note.tags.map((tag, index) => (
                              <span key={index} className="note-tag">{tag}</span>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Selected Note View or Collaborative Notes */}
                {(!isPersonalNotes || (isPersonalNotes && selectedNoteId && !showNotesList)) && (
                  <>

                    
                    {/* Text Formatting Toolbar */}
                    <div className="study-room-formatting-toolbar">
                      <div className="formatting-toolbar-left">
                        <button 
                          className={`format-btn ${currentFormat === 'h1' ? 'active' : ''}`}
                          onClick={() => formatText('h1')}
                          title="Heading 1"
                        >
                          <Heading1 size={16} />
                        </button>
                        <button 
                          className={`format-btn ${currentFormat === 'h2' ? 'active' : ''}`}
                          onClick={() => formatText('h2')}
                          title="Heading 2"
                        >
                          <Heading2 size={16} />
                        </button>
                        <button 
                          className={`format-btn ${currentFormat === 'h3' ? 'active' : ''}`}
                          onClick={() => formatText('h3')}
                          title="Heading 3"
                        >
                          <Heading3 size={16} />
                        </button>
                        <div className="format-divider"></div>
                        <button 
                          className={`format-btn ${currentFormat === 'bold' ? 'active' : ''}`}
                          onClick={() => formatText('bold')}
                          title="Bold"
                        >
                          <Bold size={16} />
                        </button>
                        <button 
                          className={`format-btn ${currentFormat === 'italic' ? 'active' : ''}`}
                          onClick={() => formatText('italic')}
                          title="Italic"
                        >
                          <Italic size={16} />
                        </button>
                        <div className="format-divider"></div>
                        <button 
                          className={`format-btn ${currentFormat === 'list' ? 'active' : ''}`}
                          onClick={() => formatText('list')}
                          title="Bullet List"
                        >
                          <List size={16} />
                        </button>
                        <button 
                          className={`format-btn ${currentFormat === 'ordered-list' ? 'active' : ''}`}
                          onClick={() => formatText('ordered-list')}
                          title="Numbered List"
                        >
                          <ListOrdered size={16} />
                        </button>
                      </div>
                      <div className="formatting-toolbar-right">
                        <button className="study-room-notes-action-button"><Download size={16} /> Export</button>
                        <button className="study-room-notes-action-button"><FileText size={16} /> PDF</button>
                        <button className="study-room-notes-action-button"><Book size={16} /> Markdown</button>
                      </div>
                    </div>
                    
                    <div
                      ref={notesTextareaRef}
                      contentEditable={true}
                      onInput={(e) => setNotesContent(e.currentTarget.innerHTML)}
                      placeholder="Start typing notes together... Use the toolbar above to format your text."
                      className="study-room-notes-textarea"
                    />
                  </>
                )}
              </div>
            </div>
          )}
          {activeTab === 'whiteboard' && (
            <div className="study-room-whiteboard-content">
              <div className="study-room-whiteboard-title">🧑‍🏫</div>
              <div>Whiteboard coming soon (Excalidraw/Fabric.js integration)</div>
              <div className="study-room-whiteboard-actions">
                <button className="study-room-whiteboard-action-button"><PenTool size={16} /> Pen</button>
                <button className="study-room-whiteboard-action-button"><Square size={16} /> Shape</button>
                <button className="study-room-whiteboard-action-button"><StickyNote size={16} /> Sticky</button>
                <button className="study-room-whiteboard-action-button"><Image size={16} /> Image</button>
                <button className="study-room-whiteboard-action-button"><Undo2 size={16} /> Undo</button>
                <button className="study-room-whiteboard-action-button"><Download size={16} /> Save</button>
              </div>
            </div>
          )}
          {activeTab === 'review' && (
            <div className="study-room-review-content">
              
              {/* Last Quiz Battle Stats */}
              <div className="last-quiz-stats">
                <div className="stats-header">
                  <h3>Last Quiz Battle Results</h3>
                  <span className="stats-date">{lastQuizBattleStats.date}</span>
                </div>
                <div className="stats-content">
                  <div className="stats-main">
                    <div className="stats-quiz-title">{lastQuizBattleStats.quizTitle}</div>
                    <div className="stats-score-section">
                      <div className="score-display">
                        <div className="score-number">{lastQuizBattleStats.yourScore}</div>
                        <div className="score-label">Your Score</div>
                      </div>
                      <div className="score-details">
                        <div className="score-detail">
                          <span className="detail-label">Rank:</span>
                          <span className="detail-value rank-2">#{lastQuizBattleStats.rank}</span>
                        </div>
                        <div className="score-detail">
                          <span className="detail-label">Accuracy:</span>
                          <span className="detail-value">{lastQuizBattleStats.accuracy}</span>
                        </div>
                        <div className="score-detail">
                          <span className="detail-label">Time:</span>
                          <span className="detail-value">{lastQuizBattleStats.timeTaken}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="stats-breakdown">
                    <div className="breakdown-item">
                      <div className="breakdown-label">Questions</div>
                      <div className="breakdown-value">{lastQuizBattleStats.correctAnswers}/{lastQuizBattleStats.totalQuestions}</div>
                    </div>
                    <div className="breakdown-item">
                      <div className="breakdown-label">Participants</div>
                      <div className="breakdown-value">{lastQuizBattleStats.participants}</div>
                    </div>
                    <div className="breakdown-item">
                      <div className="breakdown-label">Top Score</div>
                      <div className="breakdown-value">{lastQuizBattleStats.topScore}</div>
                    </div>
                    <div className="breakdown-item">
                      <div className="breakdown-label">Avg Score</div>
                      <div className="breakdown-value">{lastQuizBattleStats.averageScore}</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="study-room-review-actions">
                <div className="review-action-item">
                  <button className="study-room-review-action-button" onClick={handleQuizBattle}>
                    <div className="review-action-icon">⚔️</div>
                    <div className="review-action-content">
                      <div className="review-action-title">Quiz Battle</div>
                      <div className="review-action-description">Compete in real-time with others!</div>
                    </div>
                  </button>
                </div>
                <div className="review-action-item">
                  <button className="study-room-review-action-button">
                    <div className="review-action-icon">🧠</div>
                    <div className="review-action-content">
                      <div className="review-action-title">Review Cards</div>
                      <div className="review-action-description">Practice solo at your own pace.</div>
                    </div>
                  </button>
                </div>
                <div className="review-action-item">
                  <button className="study-room-review-action-button">
                    <div className="review-action-icon">🏆</div>
                    <div className="review-action-content">
                      <div className="review-action-title">Leaderboard</div>
                      <div className="review-action-description">See how you rank.</div>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Right Panel */}
      {showRightSidebar ? (
        <div className="study-room-right">
          {/* Toggle Button */}
          <button
            onClick={() => setShowRightSidebar(false)}
            className="study-room-toggle-button"
          >
            <PanelRightClose size={18} />
          </button>

          {/* Tabs/Sections */}
          <div className="study-room-right-tabs">
            <button className={`study-room-right-tab-btn${showRightTab === 'files' ? ' active' : ''}`} onClick={() => setShowRightTab('files')}><Paperclip size={16} /> Files</button>
            <button className={`study-room-right-tab-btn${showRightTab === 'chat' ? ' active' : ''}`} onClick={() => setShowRightTab('chat')}><MessageCircle size={16} /> Chat</button>
            <button className={`study-room-right-tab-btn${showRightTab === 'timer' ? ' active' : ''}`} onClick={() => setShowRightTab('timer')}><Timer size={16} /> Timer</button>
          </div>

          {/* Tab Content */}
          <div className="study-room-right-content">
            {showRightTab === 'files' && (
              <div className="study-room-files-content">
                <div className="study-room-files-title">Shared Files</div>
                {mockFiles.map((file, i) => (
                  <div key={i} className="study-room-file-item">
                    <FileText size={18} className="study-room-file-icon" />
                    <span className="study-room-file-name">{file.name}</span>
                  </div>
                ))}
              </div>
            )}

            {showRightTab === 'chat' && (
              <div className="study-room-chat-content">
                <div className="study-room-chat-title">Chat</div>
                <div className="study-room-chat-messages" ref={chatMessagesRef}>
                  {messages.map((msg, i) => (
                    <div 
                      key={i} 
                      className={`study-room-chat-message ${msg.isOwn ? 'sending' : ''}`}
                      data-user={msg.isOwn ? 'You' : 'Other'}
                    >
                      <div className="study-room-chat-message-text">
                        {msg.isEmoji ? (
                          <span className="emoji-reaction" style={{ fontSize: '24px' }}>{msg.text}</span>
                        ) : (
                          msg.text
                        )}
                      </div>
                    </div>
                  ))}
                  {isTyping && (
                    <div className="typing-indicator">
                      <div className="typing-dot"></div>
                      <div className="typing-dot"></div>
                      <div className="typing-dot"></div>
                      <span style={{ marginLeft: '8px', fontSize: '12px', color: 'rgba(245, 247, 251, 0.6)' }}>
                        Someone is typing...
                      </span>
                    </div>
                  )}
                </div>
                <div className="study-room-chat-input">
                  <input
                    type="text"
                    value={chatMessage}
                    onChange={handleTyping}
                    placeholder="Type a message..."
                    onKeyDown={e => { if (e.key === 'Enter') handleSendMessage(); }}
                  />
                  <button onClick={() => setShowEmojiPicker(!showEmojiPicker)}>
                    <Smile size={16} />
                  </button>
                  <button onClick={handleSendMessage}>
                    <MessageCircle size={16} />
                  </button>
                </div>
                {showEmojiPicker && (
                  <div style={{
                    position: 'absolute',
                    bottom: '80px',
                    right: '20px',
                    background: 'rgba(37, 37, 37, 0.95)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(124, 131, 253, 0.2)',
                    borderRadius: '12px',
                    padding: '12px',
                    display: 'grid',
                    gridTemplateColumns: 'repeat(5, 1fr)',
                    gap: '8px',
                    zIndex: 1000
                  }}>
                    {emojis.map((emoji, i) => (
                      <button
                        key={i}
                        onClick={() => addEmojiReaction(emoji)}
                        style={{
                          background: 'none',
                          border: 'none',
                          fontSize: '20px',
                          cursor: 'pointer',
                          padding: '4px',
                          borderRadius: '4px',
                          transition: 'all 0.2s ease'
                        }}
                        onMouseEnter={(e) => e.target.style.transform = 'scale(1.2)'}
                        onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {showRightTab === 'timer' && (
              <div className="study-room-timer-content">
                <PomodoroTimer />
              </div>
            )}
          </div>
        </div>
      ) : (
        <button
          onClick={() => setShowRightSidebar(true)}
          className="study-room-toggle-button closed"
        >
          <PanelRightOpen size={18} />
        </button>
      )}

      {/* Quiz Selection Modal */}
      {showQuizSelection && (
        <div className="quiz-selection-overlay">
          <div className="quiz-selection-modal">
            <div className="quiz-selection-header">
              <h2>Select a Quiz Battle</h2>
              <button className="quiz-selection-close" onClick={closeQuizSelection}>
                <X size={20} />
              </button>
            </div>
            <div className="quiz-selection-content">
              <div className="quiz-selection-grid">
                {sampleQuizzes.map((quiz) => (
                  <div 
                    key={quiz.id} 
                    className={`quiz-card ${quiz.isActive ? 'active' : 'inactive'}`}
                    onClick={() => quiz.isActive && selectQuiz(quiz.id)}
                  >
                    <div className="quiz-card-header">
                      <h3>{quiz.title}</h3>
                      <span className={`quiz-status ${quiz.isActive ? 'active' : 'inactive'}`}>
                        {quiz.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    <div className="quiz-card-details">
                      <div className="quiz-detail">
                        <span className="quiz-label">Subject:</span>
                        <span className="quiz-value">{quiz.subject}</span>
                      </div>
                      <div className="quiz-detail">
                        <span className="quiz-label">Author:</span>
                        <span className="quiz-value">{quiz.author}</span>
                      </div>
                      <div className="quiz-detail">
                        <span className="quiz-label">Questions:</span>
                        <span className="quiz-value">{quiz.questionCount}</span>
                      </div>
                      <div className="quiz-detail">
                        <span className="quiz-label">Difficulty:</span>
                        <span className={`quiz-difficulty ${quiz.difficulty.toLowerCase()}`}>
                          {quiz.difficulty}
                        </span>
                      </div>
                      <div className="quiz-detail">
                        <span className="quiz-label">Time Limit:</span>
                        <span className="quiz-value">{quiz.timeLimit} min</span>
                      </div>
                      <div className="quiz-detail">
                        <span className="quiz-label">Participants:</span>
                        <span className="quiz-value">{quiz.participants}</span>
                      </div>
                    </div>
                    {quiz.isActive && (
                      <button className="quiz-join-button">
                        Join Battle
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

function TabBtn({ active, onClick, icon, children }) {
  return (
    <button
      onClick={onClick}
      className={`study-room-tab-btn ${active ? 'active' : ''}`}
    >
      {icon} {children}
    </button>
  );
}

export default StudyRoom;