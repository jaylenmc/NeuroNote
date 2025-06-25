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

  return (
    <div className="study-groups-page">
      {/* Top Bar: Back + Create Room */}
      <div className="sg-top-bar">
        <button className="sg-nav-btn" onClick={() => navigate('/dashboard')}>
          <ArrowLeft size={20} /> Back to Dashboard
        </button>
        <button className="sg-nav-btn primary" onClick={() => setShowCreateModal(true)}>
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
            <div key={room.id} className="study-room-card active-card">
              <div className="card-header">
                <span className="subject-icon">{room.subjectIcon}</span>
                <span className="room-name">{room.name}</span>
                <span className="subject-tag">{room.subject}</span>
              </div>
              <div className="card-body">
                <div className="participants-stack">
                  {room.participants.map((p, i) => (
                    <div
                      key={p.name}
                      title={p.name}
                      className={`participant-avatar ${p.online ? 'online' : ''}`}
                      style={{ backgroundColor: avatarColors[(i + idx) % avatarColors.length], zIndex: 10 - i }}
                    >
                      {p.name[0]}
                      {p.online && <span className="online-indicator" />}
                    </div>
                  ))}
                </div>
                <div className="room-status">
                  {room.statusIcon}
                  <span>{room.status}</span>
                </div>
              </div>
              <button className="join-room-btn">
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
            <div key={room.id} className="study-room-card recent-card">
                <div className="card-header">
                    <span className="subject-icon">{room.subjectIcon}</span>
                    <span className="room-name">{room.name}</span>
                    <span className="subject-tag">{room.subject}</span>
                </div>
                <div className="card-body">
                    <div className="participants-stack">
                    {room.participants.map((p, i) => (
                        <div
                        key={p.name}
                        title={p.name}
                        className="participant-avatar"
                        style={{ backgroundColor: avatarColors[(i + idx) % avatarColors.length], zIndex: 10 - i }}
                        >
                        {p.name[0]}
                        </div>
                    ))}
                    </div>
                    <div className="room-status">
                    <span>Last active: {room.lastActive}</span>
                    </div>
                </div>
                <button className="join-room-btn">
                    Rejoin
                </button>
            </div>
          ))}
        </div>
      </div>

      {showCreateModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2 className="modal-title">Create New Study Room</h2>
            <form onSubmit={handleCreateRoom}>
              <div className="form-group">
                <label htmlFor="roomName">Room Name</label>
                <input
                  id="roomName"
                  type="text"
                  value={newRoomName}
                  onChange={(e) => setNewRoomName(e.target.value)}
                  placeholder="e.g., Organic Chemistry Midterm Prep"
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="roomSubject">Subject</label>
                <input
                  id="roomSubject"
                  type="text"
                  value={newRoomSubject}
                  onChange={(e) => setNewRoomSubject(e.target.value)}
                  placeholder="e.g., Chemistry"
                  required
                />
              </div>
              <div className="modal-actions">
                <button type="button" className="modal-btn cancel" onClick={() => setShowCreateModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="modal-btn create">
                  Create Room
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