import React, { useState, useEffect, useRef } from 'react';
import { Users, UserPlus, LogOut, Info, BookOpen, Brain, MessageCircle, Mic, Clock, FileText, Paperclip, Star, Timer, ChevronLeft, ChevronRight, PenTool, Square, StickyNote, Image, Undo2, Download, Volume2, Bell, Zap, ArrowLeft, Book, Plus, X, MessageSquare, PanelRightClose, PanelRightOpen, Play, Pause, RotateCcw, Smile } from 'lucide-react';
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

const StudyRoom = () => {
  const [activeTab, setActiveTab] = useState('notes');
  const [showRightTab, setShowRightTab] = useState('files');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showComments, setShowComments] = useState(true);
  const [chatMessage, setChatMessage] = useState('');
  const [showRightSidebar, setShowRightSidebar] = useState(true);
  const [messages, setMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [typingUsers, setTypingUsers] = useState([]);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const ws = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();
  const chatMessagesRef = useRef(null);
  const typingTimeoutRef = useRef(null);

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

  return (
    <div className="study-room-main">
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
                <button 
                  onClick={() => setShowComments(!showComments)}
                  className={`study-room-comments-toggle ${showComments ? 'active' : ''}`}
                >
                  <MessageSquare size={16} />
                  {showComments ? 'Hide Comments' : 'Show Comments'}
                </button>
                <div className="study-room-notes-header">
                  <div className="study-room-notes-title">Collaborative Notes</div>
                </div>
                <textarea
                  placeholder="Start typing notes together..."
                  className="study-room-notes-textarea"
                />
                <div className="study-room-notes-actions">
                  <button className="study-room-notes-action-button"><Download size={16} /> Export</button>
                  <button className="study-room-notes-action-button"><FileText size={16} /> PDF</button>
                  <button className="study-room-notes-action-button"><Book size={16} /> Markdown</button>
                </div>
              </div>
              {showComments && (
                <div className="study-room-comments-sidebar">
                  <div className="study-room-comments-title">Comments</div>
                  <div className="study-room-comment">💬 Dana: Can we clarify this term?</div>
                  <div className="study-room-comment">💬 Chris: Add more examples here.</div>
                </div>
              )}
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
              <div className="study-room-review-title">📚</div>
              <div>Review flashcards/quiz together (coming soon)</div>
              <div className="study-room-review-actions">
                <button className="study-room-review-action-button"><Zap size={16} /> Quiz Battle</button>
                <button className="study-room-review-action-button"><BookOpen size={16} /> All Cards</button>
                <button className="study-room-review-action-button"><Star size={16} /> Assign</button>
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

const iconBtnStyle = {
  background: 'rgba(255,255,255,0.07)',
  color: '#4ECDC4',
  border: 'none',
  borderRadius: 10,
  padding: '10px 14px',
  fontWeight: 600,
  fontSize: 15,
  boxShadow: '0 2px 8px #23254622',
  cursor: 'pointer',
  transition: 'background 0.18s, color 0.18s',
  display: 'flex',
  alignItems: 'center',
  gap: 6,
};

const miniBtnStyle = {
  background: 'rgba(255,255,255,0.07)',
  color: '#4ECDC4',
  border: 'none',
  borderRadius: 8,
  padding: '8px 14px',
  fontWeight: 600,
  fontSize: 14,
  boxShadow: '0 2px 8px #23254622',
  cursor: 'pointer',
  transition: 'background 0.18s, color 0.18s',
  display: 'flex',
  alignItems: 'center',
  gap: 6,
};

function rightTabBtn(active) {
  return {
    background: active ? 'rgba(78,205,196,0.13)' : 'rgba(255,255,255,0.07)',
    color: active ? '#4ECDC4' : '#f5f7fb',
    border: 'none',
    borderRadius: 8,
    padding: '8px 14px',
    fontWeight: 600,
    fontSize: 14,
    boxShadow: '0 2px 8px #23254622',
    cursor: 'pointer',
    transition: 'background 0.18s, color 0.18s',
    display: 'flex',
    alignItems: 'center',
    gap: 6,
  };
}

export default StudyRoom; 