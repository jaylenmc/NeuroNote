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
import { FiPlus, FiTrash2 } from 'react-icons/fi';
import './StudyDecks.css';
import brainPng from '../assets/brain.png';
import api from '../api/axios';
import { formatDateForDisplay, formatDateTimeForDisplay } from '../utils/dateUtils';

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
            const response = await api.post('/flashcards/deck/', newDeck);
            handleCloseModal();
            await fetchDecks();
        } catch (err) {
            setError(err.message);
        }
    }, [newDeck, handleCloseModal]);

    const fetchDecks = async () => {
        try {
            setLoading(true);
            const response = await api.get('/flashcards/deck/');
            const data = response.data;
            console.log('Raw deck data from API:', data);
            const decksData = data.decks || [];
            console.log('Decks data:', decksData);
            
            // Fetch cards for each deck
            const decksWithCards = await Promise.all(
                decksData.map(async (deck) => {
                    try {
                        const cardsResponse = await api.get(`/flashcards/cards/${deck.id}/`);
                        console.log(`Cards for deck ${deck.title}:`, cardsResponse.data);
                        return {
                            ...deck,
                            cards: cardsResponse.data || []
                        };
                    } catch (err) {
                        console.error(`Error fetching cards for deck ${deck.id}:`, err);
                        return {
                            ...deck,
                            cards: []
                        };
                    }
                })
            );
            
            console.log('Final decks with cards:', decksWithCards);
            setDecks(decksWithCards);
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
            await api.delete(`/flashcards/deck/delete/${deckId}`);
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
        return formatDateForDisplay(dateString);
    };

    // Test the formatDateTimeForDisplay function
    const testDate = "2025-07-01T22:50:51Z";
    console.log('Test formatDateTimeForDisplay:', formatDateTimeForDisplay(testDate));
    console.log('Test formatDateForDisplay:', formatDateForDisplay(testDate));

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
                <div className="studydeck-grid">
                    {decks.map((deck) => (
                        <div
                            key={deck.id}
                            className="studydeck-card"
                            data-status={deck.status || 'in-progress'}
                            onClick={() => handleDeckClick(deck.id)}
                        >
                            {/* Status chip */}
                            <div className={`studydeck-status-chip ${deck.status || 'in-progress'}`}>
                                {deck.statusLabel || 'In Progress'}
                            </div>
                            {/* Icon circle */}
                            <div className="studydeck-icon-circle">
                                <span className="studydeck-icon">{getSubjectEmoji(deck.subject)}</span>
                            </div>
                            {/* Title */}
                            <div className="studydeck-title">{deck.title}</div>
                            {/* Subject tag */}
                            <div className="studydeck-subject">{deck.subject}</div>
                            {/* Metrics */}
                            <div className="studydeck-metrics">
                                <div className="studydeck-metric-row">
                                    <span className="studydeck-metric-label"><BookOpen size={16}/> Cards</span>
                                    <span className="studydeck-metric-value">{deck.cards?.length || 0}</span>
                                </div>
                                <div className="studydeck-metric-row">
                                    <span className="studydeck-metric-label"><CheckCircle size={16}/> Reviewed</span>
                                    <span className="studydeck-metric-value">{deck.cards?.filter(c => c.last_review_date)?.length || 0}</span>
                                </div>
                            </div>
                            {/* Progress bar */}
                            <div className="studydeck-progress-rail">
                                <div
                                    className="studydeck-progress-fill"
                                    style={{ width: `${calculateProgress(deck)}%` }}
                                />
                            </div>
                            {/* Review button */}
                            <button
                                className="studydeck-review-btn"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeckClick(deck.id);
                                }}
                            >
                                <CheckCircle size={18} style={{marginRight: 8}}/> Review Now
                            </button>
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