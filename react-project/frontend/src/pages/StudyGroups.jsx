import React, { useState } from 'react';
import { User, Users, Plus, BookOpen, Brain, Laptop, Book, MessageCircle, Mic, Clock, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './StudyGroups.css';

const initialActiveRooms = [
  {
    id: 1,
    name: 'Chemistry Finals Group',
    subject: 'Chemistry',
    subjectIcon: '🧪',
    participants: [
      { name: 'Jaylen', avatar: '', online: true },
      { name: 'Chris', avatar: '', online: true },
      { name: 'Dana', avatar: '', online: false },
    ],
    status: 'Active now',
    statusIcon: <Clock size={16} />,
    voice: false,
    lastActive: 'now',
  },
  {
    id: 2,
    name: 'React Flashcard Cram',
    subject: 'Programming',
    subjectIcon: '💻',
    participants: [
      { name: 'You', avatar: '', online: true },
      { name: 'Ella', avatar: '', online: true },
    ],
    status: 'Voice Chat',
    statusIcon: <Mic size={16} />,
    voice: true,
    lastActive: 'now',
  },
];

const mockRecentRooms = [
  {
    id: 3,
    name: 'Psych 101 Session',
    subject: 'Psychology',
    subjectIcon: '🧠',
    participants: [
      { name: 'Jaylen', avatar: '', online: false },
      { name: 'Mike', avatar: '', online: false },
    ],
    lastActive: '2 days ago',
  },
];

const avatarColors = ['#4ECDC4', '#FFD93D', '#FF6B6B', '#7C83FD', '#45B7AF', '#6C5CE7'];

const StudyGroups = () => {
  const [showOptionsModal, setShowOptionsModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [newRoomName, setNewRoomName] = useState('');
  const [newRoomSubject, setNewRoomSubject] = useState('');
  const [roomId, setRoomId] = useState('');
  const [activeRooms, setActiveRooms] = useState(initialActiveRooms);
  const navigate = useNavigate();

  const handleCreateRoom = async (e) => {
    e.preventDefault();
    if (!newRoomName.trim() || !newRoomSubject.trim()) return;
    const token = sessionStorage.getItem('jwt_token');
    try {
      const response = await fetch('http://localhost:8000/api/studyroom/rooms/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ name: newRoomName, subject: newRoomSubject }),
        credentials: 'include'
      });
      if (!response.ok) {
        alert('Failed to create room');
        return;
      }
      const data = await response.json();
      // Add new room to activeRooms
      const newRoom = {
        id: data.id || Date.now(),
        name: data.name,
        subject: data.subject,
        subjectIcon: '📚',
        participants: [
          { name: 'You', avatar: '', online: true },
        ],
        status: 'Active now',
        statusIcon: <Clock size={16} />,
        voice: false,
        lastActive: 'now',
      };
      setActiveRooms(prev => [newRoom, ...prev]);
      setShowCreateModal(false);
      navigate(`/study-groups/study-room/?room=${encodeURIComponent(newRoom.name)}&subject=${encodeURIComponent(newRoom.subject)}`);
      setNewRoomName('');
      setNewRoomSubject('');
    } catch (err) {
      alert('Error creating room');
    }
  };

  const handleJoinRoom = async (e) => {
    e.preventDefault();
    if (!roomId.trim()) return;
    const token = sessionStorage.getItem('jwt_token');
    try {
      const response = await fetch(`http://localhost:8000/api/studyroom/rooms/${roomId}/join/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        credentials: 'include'
      });
      if (!response.ok) {
        alert('Failed to join room. Please check the room ID.');
        return;
      }
      const data = await response.json();
      setShowJoinModal(false);
      setRoomId('');
      navigate(`/study-groups/study-room/?room=${encodeURIComponent(data.name)}&subject=${encodeURIComponent(data.subject)}`);
    } catch (err) {
      alert('Error joining room');
    }
  };

      const handleShowOptions = () => {
      console.log("Button clicked, setting showOptionsModal to true");
      setShowOptionsModal(true);
    };

  const handleCreateOption = () => {
    setShowOptionsModal(false);
    setShowCreateModal(true);
  };

  const handleJoinOption = () => {
    setShowOptionsModal(false);
    setShowJoinModal(true);
  };

  console.log("Rendering component, showOptionsModal:", showOptionsModal);

  return (
    <div className="study-groups-page">
      {/* Top Bar: Back + Create Room */}
      <div className="sg-top-bar">
        <button className="sg-nav-btn" onClick={() => navigate('/dashboard')}>
          <ArrowLeft size={20} /> Back to Dashboard
        </button>
        <button className="sg-nav-btn primary" onClick={handleShowOptions}>
          <Plus size={20} /> Start New Study Room
        </button>
      </div>

      {/* Main Grid */}
      <div className="study-rooms-grid">
        {/* Active Study Rooms */}
        <div className="rooms-column">
          <h2 className="column-title">
            <Users size={22} /> Active Study Rooms
          </h2>
          {activeRooms.map((room, idx) => (
            <div key={room.id} className="sg-study-card sg-active-card">
              <div className="sg-card-header">
                <span className="sg-subject-icon">{room.subjectIcon}</span>
                <span className="sg-room-name">{room.name}</span>
                <span className="sg-subject-tag">{room.subject}</span>
              </div>
              <div className="sg-card-body">
                <div className="sg-participants-stack">
                  {room.participants.map((p, i) => (
                    <div
                      key={p.name}
                      title={p.name}
                      className={`sg-participant-avatar ${p.online ? 'online' : ''}`}
                      style={{ backgroundColor: avatarColors[(i + idx) % avatarColors.length], zIndex: 10 - i }}
                    >
                      {p.name[0]}
                      {p.online && <span className="sg-online-indicator" />}
                    </div>
                  ))}
                </div>
                <div className="sg-room-status">
                  {room.statusIcon}
                  <span>{room.status}</span>
                </div>
              </div>
              <button className="sg-join-room-btn">
                  Join Room
              </button>
            </div>
          ))}
        </div>

        {/* Recent Study Rooms */}
        <div className="rooms-column">
          <h2 className="column-title">
            <Clock size={22} /> Recent Study Rooms
          </h2>
          {mockRecentRooms.map((room, idx) => (
            <div key={room.id} className="sg-study-card sg-recent-card">
                <div className="sg-card-header">
                    <span className="sg-subject-icon">{room.subjectIcon}</span>
                    <span className="sg-room-name">{room.name}</span>
                    <span className="sg-subject-tag">{room.subject}</span>
                </div>
                <div className="sg-card-body">
                    <div className="sg-participants-stack">
                    {room.participants.map((p, i) => (
                        <div
                        key={p.name}
                        title={p.name}
                        className="sg-participant-avatar"
                        style={{ backgroundColor: avatarColors[(i + idx) % avatarColors.length], zIndex: 10 - i }}
                        >
                        {p.name[0]}
                        </div>
                    ))}
                    </div>
                    <div className="sg-room-status">
                    <span>Last active: {room.lastActive}</span>
                    </div>
                </div>
                <button className="sg-join-room-btn">
                    Rejoin
                </button>
            </div>
          ))}
        </div>
      </div>

      {showOptionsModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999
        }}>
          <div style={{
            backgroundColor: 'rgba(42, 42, 42, 0.95)',
            backdropFilter: 'blur(10px)',
            borderRadius: '12px',
            padding: '32px',
            maxWidth: '450px',
            width: '100%',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            color: 'white'
          }}>
            <h2 style={{margin: '0 0 24px 0', fontSize: '24px', fontWeight: '700', textAlign: 'center', color: '#4ECDC4'}}>Choose an Option</h2>
            <div style={{display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px'}}>
              <button 
                style={{
                  background: 'rgba(37, 37, 37, 0.7)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255, 255, 255, 0.05)',
                  borderRadius: '12px',
                  padding: '20px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '16px',
                  textAlign: 'left',
                  color: 'white'
                }}
                onClick={handleCreateOption}
              >
                <div style={{
                  fontSize: '2rem',
                  width: '60px',
                  height: '60px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: 'rgba(42, 42, 42, 0.7)',
                  borderRadius: '12px',
                  border: '1px solid rgba(255, 255, 255, 0.05)'
                }}>
                  <Plus size={24} />
                </div>
                <div>
                  <h3 style={{margin: '0 0 8px 0', fontSize: '1.1rem', fontWeight: '600'}}>Create Study Room</h3>
                  <p style={{margin: 0, fontSize: '0.9rem', color: '#888'}}>Start a new study session with a custom name and focus area</p>
                </div>
              </button>
              <button 
                style={{
                  background: 'rgba(37, 37, 37, 0.7)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255, 255, 255, 0.05)',
                  borderRadius: '12px',
                  padding: '20px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '16px',
                  textAlign: 'left',
                  color: 'white'
                }}
                onClick={handleJoinOption}
              >
                <div style={{
                  fontSize: '2rem',
                  width: '60px',
                  height: '60px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: 'rgba(42, 42, 42, 0.7)',
                  borderRadius: '12px',
                  border: '1px solid rgba(255, 255, 255, 0.05)'
                }}>
                  <Users size={24} />
                </div>
                <div>
                  <h3 style={{margin: '0 0 8px 0', fontSize: '1.1rem', fontWeight: '600'}}>Join Study Room</h3>
                  <p style={{margin: 0, fontSize: '0.9rem', color: '#888'}}>Enter a room number to join an existing study session</p>
                </div>
              </button>
            </div>
            <div style={{display: 'flex', gap: '16px', marginTop: '24px'}}>
              <button 
                style={{
                  flex: 1,
                  padding: '12px',
                  borderRadius: '8px',
                  border: 'none',
                  fontSize: '16px',
                  fontWeight: '700',
                  cursor: 'pointer',
                  background: 'rgba(255, 255, 255, 0.1)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  color: 'white'
                }}
                onClick={() => setShowOptionsModal(false)}
              >
                Cancel
              </button>
                         </div>
           </div>
         </div>
       )}

      {showCreateModal && (
         <div style={{
           position: 'fixed',
           top: 0,
           left: 0,
           width: '100vw',
           height: '100vh',
           backgroundColor: 'rgba(0, 0, 0, 0.8)',
           display: 'flex',
           alignItems: 'center',
           justifyContent: 'center',
           zIndex: 9999
         }}>
           <div style={{
             backgroundColor: 'rgba(42, 42, 42, 0.95)',
             backdropFilter: 'blur(10px)',
             borderRadius: '12px',
             padding: '32px',
             maxWidth: '450px',
             width: '100%',
             border: '1px solid rgba(255, 255, 255, 0.1)',
             color: 'white'
           }}>
             <h2 style={{margin: '0 0 24px 0', fontSize: '24px', fontWeight: '700', textAlign: 'center', color: '#4ECDC4'}}>Create New Study Room</h2>
            <form onSubmit={handleCreateRoom}>
               <div style={{marginBottom: '20px'}}>
                 <label style={{display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '8px', color: '#888'}} htmlFor="roomName">Room Name</label>
                <input
                  id="roomName"
                  type="text"
                  value={newRoomName}
                  onChange={(e) => setNewRoomName(e.target.value)}
                  placeholder="e.g., Organic Chemistry Midterm Prep"
                  required
                   style={{
                     width: '100%',
                     padding: '12px',
                     borderRadius: '8px',
                     border: '1px solid rgba(255, 255, 255, 0.1)',
                     fontSize: '16px',
                     background: 'rgba(42, 42, 42, 0.7)',
                     color: '#fff',
                     boxSizing: 'border-box'
                   }}
                />
              </div>
               <div style={{marginBottom: '20px'}}>
                 <label style={{display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '8px', color: '#888'}} htmlFor="roomSubject">Subject/Focus</label>
                <input
                  id="roomSubject"
                  type="text"
                  value={newRoomSubject}
                  onChange={(e) => setNewRoomSubject(e.target.value)}
                  placeholder="e.g., Chemistry"
                  required
                   style={{
                     width: '100%',
                     padding: '12px',
                     borderRadius: '8px',
                     border: '1px solid rgba(255, 255, 255, 0.1)',
                     fontSize: '16px',
                     background: 'rgba(42, 42, 42, 0.7)',
                     color: '#fff',
                     boxSizing: 'border-box'
                   }}
                />
              </div>
               <div style={{display: 'flex', gap: '16px', marginTop: '24px'}}>
                 <button 
                   type="button" 
                   style={{
                     flex: 1,
                     padding: '12px',
                     borderRadius: '8px',
                     border: 'none',
                     fontSize: '16px',
                     fontWeight: '700',
                     cursor: 'pointer',
                     background: 'rgba(255, 255, 255, 0.1)',
                     border: '1px solid rgba(255, 255, 255, 0.1)',
                     color: 'white'
                   }}
                   onClick={() => setShowCreateModal(false)}
                 >
                  Cancel
                </button>
                 <button 
                   type="submit" 
                   style={{
                     flex: 1,
                     padding: '12px',
                     borderRadius: '8px',
                     border: 'none',
                     fontSize: '16px',
                     fontWeight: '700',
                     cursor: 'pointer',
                     background: 'linear-gradient(135deg, #4ECDC4 0%, #45B7AF 100%)',
                     color: '#fff',
                     boxShadow: '0 4px 12px rgba(78, 205, 196, 0.2)'
                   }}
                 >
                  Create Room
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

       {showJoinModal && (
         <div style={{
           position: 'fixed',
           top: 0,
           left: 0,
           width: '100vw',
           height: '100vh',
           backgroundColor: 'rgba(0, 0, 0, 0.8)',
           display: 'flex',
           alignItems: 'center',
           justifyContent: 'center',
           zIndex: 9999
         }}>
           <div style={{
             backgroundColor: 'rgba(42, 42, 42, 0.95)',
             backdropFilter: 'blur(10px)',
             borderRadius: '12px',
             padding: '32px',
             maxWidth: '450px',
             width: '100%',
             border: '1px solid rgba(255, 255, 255, 0.1)',
             color: 'white'
           }}>
             <h2 style={{margin: '0 0 24px 0', fontSize: '24px', fontWeight: '700', textAlign: 'center', color: '#4ECDC4'}}>Join Study Room</h2>
             <form onSubmit={handleJoinRoom}>
               <div style={{marginBottom: '20px'}}>
                 <label style={{display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '8px', color: '#888'}} htmlFor="roomId">Room ID</label>
                 <input
                   id="roomId"
                   type="text"
                   value={roomId}
                   onChange={(e) => setRoomId(e.target.value)}
                   placeholder="Enter the room ID"
                   required
                   style={{
                     width: '100%',
                     padding: '12px',
                     borderRadius: '8px',
                     border: '1px solid rgba(255, 255, 255, 0.1)',
                     fontSize: '16px',
                     background: 'rgba(42, 42, 42, 0.7)',
                     color: '#fff',
                     boxSizing: 'border-box'
                   }}
                 />
               </div>
               <div style={{display: 'flex', gap: '16px', marginTop: '24px'}}>
                 <button 
                   type="button" 
                   style={{
                     flex: 1,
                     padding: '12px',
                     borderRadius: '8px',
                     border: 'none',
                     fontSize: '16px',
                     fontWeight: '700',
                     cursor: 'pointer',
                     background: 'rgba(255, 255, 255, 0.1)',
                     border: '1px solid rgba(255, 255, 255, 0.1)',
                     color: 'white'
                   }}
                   onClick={() => setShowJoinModal(false)}
                 >
                   Cancel
                 </button>
                 <button 
                   type="submit" 
                   style={{
                     flex: 1,
                     padding: '12px',
                     borderRadius: '8px',
                     border: 'none',
                     fontSize: '16px',
                     fontWeight: '700',
                     cursor: 'pointer',
                     background: 'linear-gradient(135deg, #4ECDC4 0%, #45B7AF 100%)',
                     color: '#fff',
                     boxShadow: '0 4px 12px rgba(78, 205, 196, 0.2)'
                   }}
                 >
                   Join Room
                 </button>
               </div>
             </form>
           </div>
         </div>
       )}

      
    </div>
  );
};

export default StudyGroups; 