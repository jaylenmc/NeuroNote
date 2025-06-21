import React, { useState, useEffect, useRef, useCallback, memo } from 'react';
import { useNavigate } from 'react-router-dom';
import ReactDOM from 'react-dom';
import { 
    BookOpen, 
    ArrowLeft, 
    Plus, 
    Trash2, 
    X, 
    Star,
    MoreVertical,
    CheckCircle,
    Clock,
    Calendar
} from 'lucide-react';
import './StudyDecks.css';
import brainPng from '../assets/brain.png';

const LoadingSpinner = () => (
  <div style={{
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    margin: '20px auto',
    width: '60px',
    height: '60px',
    position: 'relative'
  }}>
    <img 
      src={brainPng}
      alt="Loading..." 
      className="brain-loader"
      style={{
        width: '100%',
        height: '100%',
        objectFit: 'contain',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0
      }}
    />
  </div>
);

// Memoized Modal Component
const CreateDeckModal = memo(({ showCreateModal, handleCloseModal, handleCreateDeck, newDeck, setNewDeck, titleInputRef }) => {
    const modalContent = (
        <div className={`modal-overlay ${showCreateModal ? 'show' : ''}`} onClick={handleCloseModal}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h3>Create New Deck</h3>
                    <button 
                        className="close-button"
                        onClick={handleCloseModal}
                    >
                        <X size={20} />
                    </button>
                </div>
                <form onSubmit={handleCreateDeck}>
                    <div className="form-group">
                        <label htmlFor="title">Title</label>
                        <input
                            ref={titleInputRef}
                            type="text"
                            id="title"
                            value={newDeck.title}
                            onChange={(e) => setNewDeck(prev => ({ ...prev, title: e.target.value }))}
                            required
                            placeholder="Enter deck title"
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="subject">Subject</label>
                        <input
                            type="text"
                            id="subject"
                            value={newDeck.subject}
                            onChange={(e) => setNewDeck(prev => ({ ...prev, subject: e.target.value }))}
                            required
                            placeholder="Enter subject"
                        />
                    </div>
                    <div className="modal-actions">
                        <button type="button" onClick={handleCloseModal}>Cancel</button>
                        <button type="submit">Create Deck</button>
                    </div>
                </form>
            </div>
        </div>
    );

    return ReactDOM.createPortal(modalContent, document.body);
});

const StudyDecks = () => {
    const [decks, setDecks] = useState([]);
    const [error, setError] = useState(null);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [newDeck, setNewDeck] = useState({ title: '', subject: '' });
    const [showMenu, setShowMenu] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const titleInputRef = useRef(null);
    const modalRef = useRef(null);

    // Debug modal state
    useEffect(() => {
        console.log('Modal state changed:', showCreateModal);
    }, [showCreateModal]);

    const handleCloseModal = useCallback(() => {
        setShowCreateModal(false);
        setNewDeck({ title: '', subject: '' });
    }, []);

    const handleOpenCreateModal = useCallback(() => {
        setShowCreateModal(true);
        // Focus the input after the modal is shown
        requestAnimationFrame(() => {
            if (titleInputRef.current) {
                titleInputRef.current.focus();
            }
        });
    }, []);

    const handleCreateDeck = useCallback(async (e) => {
        e.preventDefault();
        try {
            const token = sessionStorage.getItem('jwt_token');
            if (!token) {
                setError('Please log in to create a deck');
                return;
            }

            const response = await fetch('http://localhost:8000/api/flashcards/deck/', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify(newDeck)
            });

            if (response.status === 401) {
                setError('Session expired. Please log in again.');
                return;
            }

            if (!response.ok) {
                throw new Error('Failed to create deck');
            }

            handleCloseModal();
            await fetchDecks();
        } catch (err) {
            setError(err.message);
        }
    }, [newDeck, handleCloseModal]);

    const fetchDecks = async () => {
        try {
            setLoading(true);
            const token = sessionStorage.getItem('jwt_token');
            if (!token) {
                setError('Please log in to view your decks');
                setLoading(false);
                return;
            }

            const response = await fetch('http://localhost:8000/api/flashcards/deck/', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                credentials: 'include'
            });

            if (response.status === 401) {
                setError('Session expired. Please log in again.');
                setLoading(false);
                return;
            }

            if (!response.ok) {
                throw new Error('Failed to fetch decks');
            }

            const data = await response.json();
            setDecks(data.decks || []);
            setLoading(false);
        } catch (err) {
            setError(err.message);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDecks();
    }, []);

    const handleDeckClick = (deckId) => {
        navigate(`/study-room/deck/${deckId}`);
    };

    const handleDeleteDeck = async (deckId, e) => {
        e.stopPropagation();
        if (!window.confirm('Are you sure you want to delete this deck?')) return;

        try {
            const token = sessionStorage.getItem('jwt_token');
            if (!token) {
                setError('Please log in to delete a deck');
                return;
            }

            const response = await fetch(`http://localhost:8000/api/flashcards/deck/delete/${deckId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                credentials: 'include'
            });

            if (response.status === 401) {
                setError('Session expired. Please log in again.');
                return;
            }

            if (!response.ok) {
                throw new Error('Failed to delete deck');
            }

            await fetchDecks();
        } catch (err) {
            setError(err.message);
        }
    };

    const getSubjectEmoji = (subject) => {
        const emojiMap = {
            'Biology': '🧬',
            'Chemistry': '🧪',
            'Computer Science': '💻',
            'Mathematics': '📐',
            'Physics': '⚛️',
            'default': '📚'
        };
        return emojiMap[subject] || emojiMap.default;
    };

    const calculateProgress = (deck) => {
        const totalCards = deck.cards?.length || 0;
        const reviewedCards = deck.cards?.filter(card => card.last_review_date)?.length || 0;
        return totalCards > 0 ? (reviewedCards / totalCards) * 100 : 0;
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'Never';
        const date = new Date(dateString);
        return date.toLocaleDateString();
    };

    return (
        <div className="study-decks-container">
            <div className="study-decks-header">
                <button className="back-button" onClick={() => navigate('/study-room')}>
                    <ArrowLeft size={20} />
                    Back
                </button>
                <h2>Your Decks</h2>
                <div className="header-actions">
                    <button className="create-deck-button" onClick={handleOpenCreateModal}>
                        <Plus size={20} />
                        Create Deck
                    </button>
                </div>
            </div>

            {error && <div className="error-message">{error}</div>}
            
            {loading ? (
                <div style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    minHeight: '400px'
                }}>
                    <LoadingSpinner />
                </div>
            ) : (
                <div className="decks-grid">
                    {decks.map((deck) => (
                        <div 
                            key={deck.id} 
                            className="deck-card"
                            onClick={() => handleDeckClick(deck.id)}
                        >
                            <div className="deck-actions">
                                <button 
                                    className="action-button star"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        // Handle star/favorite
                                    }}
                                >
                                    <Star size={18} />
                                </button>
                                <button 
                                    className="action-button"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setShowMenu(showMenu === deck.id ? null : deck.id);
                                    }}
                                >
                                    <MoreVertical size={18} />
                                </button>
                            </div>

                            <div className="deck-icon">
                                {getSubjectEmoji(deck.subject)}
                            </div>

                            <div className="deck-content">
                                <div className="deck-header">
                                    <h3>{deck.title}</h3>
                                </div>
                                <div className="deck-info">
                                    <span className="deck-subject">{deck.subject}</span>
                                    
                                    <div className="deck-stats">
                                        <div className="deck-stat-row">
                                            <span className="deck-stat-label">
                                                <BookOpen size={16} />
                                                Total Cards
                                            </span>
                                            <span>{typeof deck.num_of_cards === 'number' ? deck.num_of_cards : (deck.cards?.length || 0)}</span>
                                        </div>
                                        
                                        <div className="deck-stat-row">
                                            <span className="deck-stat-label">
                                                <CheckCircle size={16} />
                                                Reviewed
                                            </span>
                                            <span>
                                                {deck.cards?.filter((card, idx) => {
                                                    return card.last_review_date;
                                                })?.length || 0}
                                            </span>
                                        </div>

                                        <div className="progress-bar">
                                            <div 
                                                className="progress-fill"
                                                style={{ width: `${calculateProgress(deck)}%` }}
                                            />
                                        </div>

                                        <div className="deck-stat-row">
                                            <span className="deck-stat-label">
                                                <Clock size={16} />
                                                Last Review
                                            </span>
                                            <span>
                                                {formatDate(deck.cards?.[0]?.last_review_date)}
                                            </span>
                                        </div>

                                        <div className="deck-stat-row">
                                            <span className="deck-stat-label">
                                                <Calendar size={16} />
                                                Next Review
                                            </span>
                                            <span>
                                                {formatDate(deck.cards?.[0]?.scheduled_date)}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <CreateDeckModal 
                showCreateModal={showCreateModal}
                handleCloseModal={handleCloseModal}
                handleCreateDeck={handleCreateDeck}
                newDeck={newDeck}
                setNewDeck={setNewDeck}
                titleInputRef={titleInputRef}
            />
        </div>
    );
};

// Add the style element at the end of the file
const style = document.createElement('style');
style.textContent = `
  .brain-loader {
    animation: brainPulse 2s ease-in-out infinite;
    filter: drop-shadow(0 0 10px rgba(255, 255, 255, 0.3));
  }

  @keyframes brainPulse {
    0% {
      transform: scale(1);
      filter: drop-shadow(0 0 5px rgba(255, 255, 255, 0.2));
    }
    50% {
      transform: scale(1.1);
      filter: drop-shadow(0 0 15px rgba(255, 255, 255, 0.5));
    }
    100% {
      transform: scale(1);
      filter: drop-shadow(0 0 5px rgba(255, 255, 255, 0.2));
    }
  }
`;
document.head.appendChild(style);

export default StudyDecks; 