import React, { useState, useEffect } from 'react';
import { FiGrid, FiList, FiTrash2, FiPlus, FiShare2 } from 'react-icons/fi';
import ReactDOM from 'react-dom';
import api from '../api/axios';
import './ReviewCards.css';

const Modal = ({ isOpen, onClose, children }) => {
  if (!isOpen) return null;

  return ReactDOM.createPortal(
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        {children}
      </div>
    </div>,
    document.body
  );
};

const ReviewCards = () => {
  const [viewMode, setViewMode] = useState('grid');
  const [decks, setDecks] = useState([]);
  const [selectedDeck, setSelectedDeck] = useState(null);
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showNewDeckModal, setShowNewDeckModal] = useState(false);
  const [newDeck, setNewDeck] = useState({
    title: '',
    subject: ''
  });

  // Debug log for modal state
  useEffect(() => {
    console.log('Modal state changed:', showNewDeckModal);
  }, [showNewDeckModal]);

  // Fetch all decks when component mounts
  useEffect(() => {
    fetchDecks();
  }, []);

  const fetchDecks = async () => {
    try {
      const response = await api.get('/flashcards/deck/');
      console.log('API Response:', response.data);
      
      if (Array.isArray(response.data)) {
        setDecks(response.data);
      } else if (response.data && typeof response.data === 'object') {
        const decksArray = Object.values(response.data).find(value => Array.isArray(value));
        if (decksArray) {
          setDecks(decksArray);
        } else {
          setDecks([]);
          setError('Invalid response format from server');
        }
      } else {
        setDecks([]);
        setError('Invalid response format from server');
      }
      
      setLoading(false);
    } catch (err) {
      console.error('Error fetching decks:', err);
      setError('Failed to fetch decks');
      setLoading(false);
      setDecks([]);
    }
  };

  const openNewDeckModal = () => {
    console.log('Opening modal...');
    setShowNewDeckModal(true);
  };

  const closeNewDeckModal = () => {
    setShowNewDeckModal(false);
    setNewDeck({ title: '', subject: '' });
  };

  const handleCreateDeck = async (e) => {
    e.preventDefault();
    try {
      const response = await api.post('/flashcards/deck/', {
        title: newDeck.title.trim(),
        subject: newDeck.subject.trim()
      });
      if (response.data) {
        setDecks(prevDecks => [...prevDecks, response.data]);
        closeNewDeckModal();
      }
    } catch (err) {
      console.error('Error creating deck:', err);
      setError(err.response?.data?.Message || 'Failed to create deck');
    }
  };

  const handleDeleteDeck = async (deckId) => {
    if (window.confirm('Are you sure you want to delete this deck?')) {
      try {
        await api.delete(`/flashcards/deck/delete/${deckId}`);
        setDecks(prevDecks => prevDecks.filter(deck => deck.id !== deckId));
      } catch (err) {
        console.error('Error deleting deck:', err);
        setError('Failed to delete deck');
      }
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Never';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  if (loading) {
    return <div className="loading">Loading decks...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  if (!Array.isArray(decks)) {
    console.error('Decks is not an array:', decks);
    return <div className="error">Error: Invalid data format</div>;
  }

  return (
    <div className="review-cards-container">
      <div className="flashcards-section">
        <div className="flashcards-header">
          <button 
            className="add-deck-btn"
            onClick={openNewDeckModal}
            type="button"
          >
            <FiPlus /> Add Deck
          </button>
          <div className="view-toggle">
            <button 
              className={`view-toggle-btn ${viewMode === 'grid' ? 'active' : ''}`}
              onClick={() => setViewMode('grid')}
            >
              <FiGrid />
            </button>
            <button 
              className={`view-toggle-btn ${viewMode === 'list' ? 'active' : ''}`}
              onClick={() => setViewMode('list')}
            >
              <FiList />
            </button>
          </div>
        </div>

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        <div className={`flashcards-${viewMode}`}>
          {decks.map(deck => (
            <div key={deck.id} className="flashcard-item">
              <div className="deck-header">
                <h3>{deck.title}</h3>
                <div className="deck-actions">
                  <button className="action-btn share" title="Share">
                    <FiShare2 />
                  </button>
                  <button 
                    className="action-btn delete" 
                    title="Delete"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteDeck(deck.id);
                    }}
                  >
                    <FiTrash2 />
                  </button>
                </div>
              </div>
              <div className="deck-info">
                <span className="subject">{deck.subject}</span>
                <span className="card-count">{deck.card_count || 0} cards</span>
                <span className="last-studied">Last studied: {formatDate(deck.last_studied)}</span>
              </div>
              <div className="progress-section">
                <div className="progress-label">
                  <span>Mastery</span>
                  <span>{deck.mastery || 0}%</span>
                </div>
                <div className="progress-bar">
                  <div 
                    className="progress-fill"
                    style={{ width: `${deck.mastery || 0}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {showNewDeckModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>Create New Deck</h2>
            <form onSubmit={handleCreateDeck}>
              <div className="form-group">
                <label htmlFor="title">Title</label>
                <input
                  type="text"
                  id="title"
                  value={newDeck.title}
                  onChange={(e) => setNewDeck(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Enter deck title"
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="subject">Subject</label>
                <input
                  type="text"
                  id="subject"
                  value={newDeck.subject}
                  onChange={(e) => setNewDeck(prev => ({ ...prev, subject: e.target.value }))}
                  placeholder="Enter subject"
                  required
                />
              </div>
              <div className="modal-buttons">
                <button type="submit" className="submit-btn">
                  <FiPlus /> Create
                </button>
                <button 
                  type="button" 
                  className="cancel-btn"
                  onClick={closeNewDeckModal}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReviewCards; 