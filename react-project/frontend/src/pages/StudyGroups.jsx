import React, { useState } from 'react';
import { User, Users, Plus, BookOpen, Brain, Laptop, Book, MessageCircle, Mic, Clock, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

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
    statusIcon: <Clock size={16} style={{ color: '#4ECDC4' }} />,
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
    statusIcon: <Mic size={16} style={{ color: '#4ECDC4' }} />,
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
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newRoomName, setNewRoomName] = useState('');
  const [newRoomSubject, setNewRoomSubject] = useState('');
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
        statusIcon: <Clock size={16} style={{ color: '#4ECDC4' }} />,
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

  return (
    <div style={{
      minHeight: '100vh',
      padding: '40px 0',
      background: 'linear-gradient(135deg, #232526 0%, #414345 100%)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
    }}>
      {/* Top Bar: Back + Create Room */}
      <div style={{
        width: '100%',
        maxWidth: 1200,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 36,
        gap: 16,
      }}>
        <button
          style={{
            background: 'rgba(37,37,37,0.7)',
            color: '#4ECDC4',
            border: 'none',
            borderRadius: 12,
            padding: '10px 24px',
            fontWeight: 600,
            fontSize: 17,
            boxShadow: '0 2px 8px #23252655',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            transition: 'background 0.18s, color 0.18s',
          }}
          onClick={() => navigate('/dashboard')}
        >
          <ArrowLeft size={20} style={{ marginRight: 6 }} /> Back to Dashboard
        </button>
        <button
          style={{
            background: 'rgba(37,37,37,0.7)',
            color: '#4ECDC4',
            border: 'none',
            borderRadius: 12,
            padding: '10px 24px',
            fontWeight: 600,
            fontSize: 17,
            boxShadow: '0 2px 8px #23252655',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            transition: 'background 0.18s, color 0.18s',
          }}
          onClick={() => setShowCreateModal(true)}
        >
          <Plus size={20} style={{ marginRight: 6, verticalAlign: 'middle' }} /> Start New Study Room
        </button>
      </div>
      {/* Main Grid */}
      <div style={{
        width: '100%',
        maxWidth: 1200,
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: 32,
        margin: '0 auto',
      }}
      className="study-rooms-grid"
      >
        {/* Active Study Rooms */}
        <div>
          <div style={{ fontWeight: 700, fontSize: 22, marginBottom: 18, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Users size={22} style={{ color: '#4ECDC4' }} /> Active Study Rooms
          </div>
          {activeRooms.map((room, idx) => (
            <div
              key={room.id}
              style={{
                background: 'rgba(255,255,255,0.08)',
                borderRadius: 16,
                boxShadow: '0 4px 24px rgba(78,205,196,0.08)',
                marginBottom: 20,
                padding: 24,
                display: 'flex',
                flexDirection: 'column',
                gap: 12,
                position: 'relative',
                transition: 'transform 0.18s, box-shadow 0.18s',
                cursor: 'pointer',
                border: '1.5px solid rgba(78,205,196,0.13)',
              }}
              className="study-room-card hover-glow"
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: 22 }}>{room.subjectIcon}</span>
                <span style={{ fontWeight: 600, fontSize: 18 }}>{room.name}</span>
                <span style={{
                  background: '#4ECDC4',
                  color: '#fff',
                  borderRadius: 8,
                  fontSize: 13,
                  fontWeight: 500,
                  padding: '2px 10px',
                  marginLeft: 10,
                  display: 'inline-block',
                }}>{room.subject}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  {room.participants.map((p, i) => (
                    <span
                      key={p.name}
                      title={p.name}
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: '50%',
                        background: avatarColors[(i + idx) % avatarColors.length],
                        color: '#fff',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 600,
                        fontSize: 16,
                        marginLeft: i === 0 ? 0 : -10,
                        opacity: p.online ? 1 : 0.5,
                        border: p.online ? '2px solid #4ECDC4' : '2px solid #888',
                        boxShadow: p.online ? '0 0 0 2px #232526' : 'none',
                        transition: 'opacity 0.2s',
                        position: 'relative',
                        zIndex: 10 - i,
                      }}
                    >
                      {p.name[0]}
                      {p.online && (
                        <span style={{
                          position: 'absolute',
                          right: 2,
                          bottom: 2,
                          width: 8,
                          height: 8,
                          background: '#4ECDC4',
                          borderRadius: '50%',
                          border: '1.5px solid #fff',
                          boxShadow: '0 0 4px #4ECDC4',
                        }} />
                      )}
                    </span>
                  ))}
                </span>
                <span style={{ color: '#4ECDC4', fontWeight: 500, fontSize: 14, display: 'flex', alignItems: 'center', gap: 4 }}>
                  {room.statusIcon} {room.status}
                </span>
                <button
                  style={{
                    marginLeft: 'auto',
                    background: 'linear-gradient(90deg, #4ECDC4 0%, #45B7AF 100%)',
                    color: '#fff',
                    border: 'none',
                    borderRadius: 8,
                    padding: '8px 20px',
                    fontWeight: 600,
                    fontSize: 15,
                    cursor: 'pointer',
                    boxShadow: '0 2px 8px #4ECDC455',
                    transition: 'transform 0.15s, box-shadow 0.15s',
                  }}
                  className="join-room-btn"
                  onClick={e => { e.stopPropagation(); /* join logic here */ }}
                >
                  Join Room
                </button>
              </div>
            </div>
          ))}
        </div>
        {/* Recent Rooms */}
        <div>
          <div style={{ fontWeight: 700, fontSize: 22, marginBottom: 18, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Clock size={22} style={{ color: '#888' }} /> Recent Rooms
          </div>
          {mockRecentRooms.map((room, idx) => (
            <div
              key={room.id}
              style={{
                background: 'rgba(255,255,255,0.05)',
                borderRadius: 16,
                boxShadow: '0 2px 12px rgba(100,100,100,0.08)',
                marginBottom: 20,
                padding: 24,
                display: 'flex',
                flexDirection: 'column',
                gap: 12,
                opacity: 0.7,
                border: '1.5px solid #8882',
              }}
              className="study-room-card recent"
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: 22 }}>{room.subjectIcon}</span>
                <span style={{ fontWeight: 600, fontSize: 18 }}>{room.name}</span>
                <span style={{
                  background: '#888',
                  color: '#fff',
                  borderRadius: 8,
                  fontSize: 13,
                  fontWeight: 500,
                  padding: '2px 10px',
                  marginLeft: 10,
                  display: 'inline-block',
                }}>{room.subject}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  {room.participants.map((p, i) => (
                    <span
                      key={p.name}
                      title={p.name}
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: '50%',
                        background: avatarColors[(i + idx) % avatarColors.length],
                        color: '#fff',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 600,
                        fontSize: 16,
                        marginLeft: i === 0 ? 0 : -10,
                        opacity: 0.5,
                        border: '2px solid #888',
                        filter: 'grayscale(1)',
                        zIndex: 10 - i,
                      }}
                    >
                      {p.name[0]}
                    </span>
                  ))}
                </span>
                <span style={{ color: '#888', fontWeight: 500, fontSize: 14, display: 'flex', alignItems: 'center', gap: 4 }}>
                  Last active: {room.lastActive}
                </span>
                <button
                  style={{
                    marginLeft: 'auto',
                    background: 'rgba(136,136,136,0.18)',
                    color: '#fff',
                    border: 'none',
                    borderRadius: 8,
                    padding: '8px 20px',
                    fontWeight: 600,
                    fontSize: 15,
                    cursor: 'pointer',
                    boxShadow: '0 2px 8px #8882',
                    transition: 'transform 0.15s, box-shadow 0.15s',
                  }}
                  className="rejoin-room-btn"
                  onClick={e => { e.stopPropagation(); /* rejoin logic here */ }}
                >
                  Rejoin
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
      {/* Modal for creating a new room (optional, not implemented) */}
      {showCreateModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          background: 'rgba(0,0,0,0.35)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
        }}>
          <div style={{
            background: '#232526',
            borderRadius: 18,
            padding: 40,
            minWidth: 340,
            boxShadow: '0 8px 32px #0008',
            color: '#fff',
            textAlign: 'center',
          }}>
            <h2 style={{ marginBottom: 24 }}>Create a New Study Room</h2>
            <form onSubmit={handleCreateRoom} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              <input
                type="text"
                placeholder="Room Name"
                value={newRoomName}
                onChange={e => setNewRoomName(e.target.value)}
                style={{
                  padding: '12px',
                  borderRadius: 8,
                  border: '1.5px solid #4ECDC4',
                  fontSize: 16,
                  marginBottom: 8,
                  background: 'rgba(255,255,255,0.07)',
                  color: '#fff',
                }}
                required
              />
              <input
                type="text"
                placeholder="Subject"
                value={newRoomSubject}
                onChange={e => setNewRoomSubject(e.target.value)}
                style={{
                  padding: '12px',
                  borderRadius: 8,
                  border: '1.5px solid #4ECDC4',
                  fontSize: 16,
                  marginBottom: 8,
                  background: 'rgba(255,255,255,0.07)',
                  color: '#fff',
                }}
                required
              />
              <button
                type="submit"
                style={{
                  background: 'linear-gradient(90deg, #7C83FD 0%, #4ADEDE 100%)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 10,
                  padding: '12px 32px',
                  fontWeight: 600,
                  fontSize: 18,
                  boxShadow: '0 2px 8px #7C83FD33',
                  cursor: 'pointer',
                  marginTop: 12,
                }}
              >
                Create Room
              </button>
            </form>
            <button
              style={{
                background: 'linear-gradient(90deg, #7C83FD 0%, #4ADEDE 100%)',
                color: '#fff',
                border: 'none',
                borderRadius: 10,
                padding: '12px 32px',
                fontWeight: 600,
                fontSize: 18,
                boxShadow: '0 2px 8px #7C83FD33',
                cursor: 'pointer',
                marginTop: 12,
              }}
              onClick={() => setShowCreateModal(false)}
            >
              Close
            </button>
          </div>
        </div>
      )}
      {/* Responsive styles */}
      <style>{`
        @media (max-width: 900px) {
          .study-rooms-grid {
            grid-template-columns: 1fr !important;
            gap: 0 !important;
          }
          .study-rooms-topbar {
            flex-direction: column !important;
            gap: 18px !important;
            align-items: stretch !important;
          }
        }
        .study-room-card.hover-glow:hover {
          transform: scale(1.03);
          box-shadow: 0 8px 32px #4ECDC455;
        }
        .join-room-btn:hover, .rejoin-room-btn:hover {
          transform: scale(1.06);
          box-shadow: 0 6px 18px #4ECDC455;
        }
      `}</style>
    </div>
  );
};

export default StudyGroups; 