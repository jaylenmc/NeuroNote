import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiAlertCircle, FiClock, FiCalendar, FiStar, FiBook, FiAlertTriangle, FiChevronDown, FiX } from 'react-icons/fi';
import './ReviewWidget.css';
import brainPng from '../assets/brain.png';
import api from '../api/axios';
import { formatDateForDisplay, formatDateTimeForDisplay, convertBackendDateToLocal, isBackendDateToday, isBackendDatePast, isBackendDateFuture, isBackendDateTimeDueToday, isBackendDateTimeOverdue, isBackendDateTimeUpcoming, isBackendDateTimeDueNow, isBackendDateTimeLaterToday, getTimeDifference } from '../utils/dateUtils';

const LoadingSpinner = () => (
  <div style={{
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    margin: '20px auto',
    width: '60px',
    height: '60px',
    position: 'relative',
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

const ReviewWidget = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overdue');
  const [tooltip, setTooltip] = useState(null);
  const [cards, setCards] = useState({
    overdue: [],
    dueNow: [],
    laterToday: [],
    upcoming: []
  });
  const [allCards, setAllCards] = useState([]);
  const [decks, setDecks] = useState([]);
  const [selectedDeckId, setSelectedDeckId] = useState(null);
  const [showDeckDropdown, setShowDeckDropdown] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newCardQuestion, setNewCardQuestion] = useState('');
  const [newCardAnswer, setNewCardAnswer] = useState('');
  const [newCardScheduledDate, setNewCardScheduledDate] = useState('');
  const [showCreateCard, setShowCreateCard] = useState(false);
  const [showEditDeck, setShowEditDeck] = useState(false);
  const [showEditCard, setShowEditCard] = useState(false);
  const [editingDeck, setEditingDeck] = useState(null);
  const [editingCard, setEditingCard] = useState(null);
  const [editDeckTitle, setEditDeckTitle] = useState('');
  const [editDeckSubject, setEditDeckSubject] = useState('');
  const [editCardQuestion, setEditCardQuestion] = useState('');
  const [editCardAnswer, setEditCardAnswer] = useState('');
  const [editCardScheduledDate, setEditCardScheduledDate] = useState('');

  // Color map for underlines
  const ratingColors = [
    '#9E9E9E', // 0 - Blackout
    '#F44336', // 1 - Unfamiliar
    '#FF9800', // 2 - Familiar
    '#FFC107', // 3 - Difficulty
    '#8BC34A', // 4 - Hesitation
    '#4CAF50', // 5 - Perfect
  ];

  const showNotificationMessage = (message) => {
    setError(message);
    setTimeout(() => setError(null), 3000);
  };

  useEffect(() => {
    fetchCards();
  }, []);

  const fetchCards = async () => {
    try {
      setLoading(true);
      // Fetch decks first
      const decksResponse = await api.get('/flashcards/deck/');
      const data = decksResponse.data;
      const decks = data.decks || [];
      setDecks(decks);
      console.log('Fetched decks:', decks);

      // Fetch cards for each deck
      const allCards = [];
      for (const deck of decks) {
        const cardsResponse = await api.get(`/flashcards/cards/${deck.id}/`);
        const deckCards = cardsResponse.data;
        console.log(`Cards for deck ${deck.id}:`, deckCards);
        allCards.push(...deckCards.map(card => ({ ...card, deckTitle: deck.title, deckId: deck.id })));
      }
      setAllCards(allCards);

      // Sort cards into categories based on due date
      const sortedCards = {
        overdue: [],
        dueNow: [],
        laterToday: [],
        upcoming: []
      };

      allCards.forEach(card => {
        if (!card.scheduled_date) {
          sortedCards.overdue.push(card);
          return;
        }

        if (isBackendDateTimeOverdue(card.scheduled_date)) {
          sortedCards.overdue.push(card);
        } else if (isBackendDateTimeDueNow(card.scheduled_date)) {
          sortedCards.dueNow.push(card);
        } else if (isBackendDateTimeLaterToday(card.scheduled_date)) {
          sortedCards.laterToday.push(card);
        } else if (isBackendDateTimeUpcoming(card.scheduled_date)) {
          sortedCards.upcoming.push(card);
        }
      });

      console.log('Sorted cards:', sortedCards);
      setCards(sortedCards);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching cards:', err);
      setError(err.message);
      setLoading(false);
    }
  };

  // Filter cards by selected deck
  useEffect(() => {
    if (!selectedDeckId) {
      // Show all cards
      const sortedCards = { overdue: [], dueNow: [], laterToday: [], upcoming: [] };
      allCards.forEach(card => {
        if (!card.scheduled_date) {
          sortedCards.overdue.push(card);
          return;
        }
        if (isBackendDateTimeOverdue(card.scheduled_date)) {
          sortedCards.overdue.push(card);
        } else if (isBackendDateTimeDueNow(card.scheduled_date)) {
          sortedCards.dueNow.push(card);
        } else if (isBackendDateTimeLaterToday(card.scheduled_date)) {
          sortedCards.laterToday.push(card);
        } else if (isBackendDateTimeUpcoming(card.scheduled_date)) {
          sortedCards.upcoming.push(card);
        }
      });
      setCards(sortedCards);
    } else {
      // Filter by deck
      const sortedCards = { overdue: [], dueNow: [], laterToday: [], upcoming: [] };
      
      allCards.filter(card => {
        const cardDeckId = card.card_deck || card.deckId;
        return Number(cardDeckId) === Number(selectedDeckId);
      }).forEach(card => {
        if (!card.scheduled_date) {
          sortedCards.overdue.push(card);
          return;
        }
        if (isBackendDateTimeOverdue(card.scheduled_date)) {
          sortedCards.overdue.push(card);
        } else if (isBackendDateTimeDueNow(card.scheduled_date)) {
          sortedCards.dueNow.push(card);
        } else if (isBackendDateTimeLaterToday(card.scheduled_date)) {
          sortedCards.laterToday.push(card);
        } else if (isBackendDateTimeUpcoming(card.scheduled_date)) {
          sortedCards.upcoming.push(card);
        }
      });
      setCards(sortedCards);
    }
  }, [selectedDeckId, allCards]);

  const handleStartReview = () => {
    console.log('handleStartReview called');
    console.log('cards state:', cards);
    console.log('selectedDeckId:', selectedDeckId);
    console.log('decks:', decks);
    
    const dueCards = [...(cards.overdue || []), ...(cards.dueNow || [])];
    console.log('dueCards:', dueCards);
    
    if (dueCards.length === 0) {
      console.log('No due cards found, setting error');
      setError('No cards for review today');
      return;
    }

    // Navigate to the dedicated review session page with selected deck info
    if (selectedDeckId) {
      const selectedDeck = decks.find(d => d.id === selectedDeckId);
      console.log(`Starting review session for deck: ${selectedDeck.title} (ID: ${selectedDeck.id})`);
      console.log('Navigating to /review-session with state:', { selectedDeck });
      navigate('/review-session', { state: { selectedDeck } });
    } else {
      console.log('Starting review session for all decks');
      console.log('Navigating to /review-session without state');
      navigate('/review-session');
    }
  };

  const handleCreateCard = async (e) => {
    e.preventDefault();
    try {
      if (!selectedDeck) {
        setError('Please select a deck first');
        return;
      }

      const response = await api.post('/flashcards/cards/', {
          question: newCardQuestion,
          answer: newCardAnswer,
          deck_id: selectedDeck.id,
          scheduled_date: newCardScheduledDate
      });

      setNewCardQuestion('');
      setNewCardAnswer('');
      setNewCardScheduledDate('');
      setShowCreateCard(false);
      fetchCards(); // Refresh the cards list
    } catch (err) {
      console.error('Error creating card:', err);
      setError(err.message);
    }
  };

  const renderCreateCardModal = () => {
    if (!showCreateCard) return null;
    return ReactDOM.createPortal(
      <div className="modal-overlay">
        <div className="modal-content">
          <h2>Create New Card</h2>
          <form onSubmit={handleCreateCard}>
            <div className="form-group">
              <label htmlFor="question">Question:</label>
              <textarea
                id="question"
                value={newCardQuestion}
                onChange={(e) => setNewCardQuestion(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="answer">Answer:</label>
              <textarea
                id="answer"
                value={newCardAnswer}
                onChange={(e) => setNewCardAnswer(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="scheduledDate">Scheduled Review Date:</label>
              <input
                type="date"
                id="scheduledDate"
                value={newCardScheduledDate}
                onChange={(e) => setNewCardScheduledDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]} // Set min date to today
              />
            </div>
            <div className="modal-actions">
              <button type="submit" className="submit-button">Create Card</button>
              <button 
                type="button" 
                className="cancel-button"
                onClick={() => {
                  setShowCreateCard(false);
                  setNewCardQuestion('');
                  setNewCardAnswer('');
                  setNewCardScheduledDate('');
                  setSelectedDeck(null);
                }}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>,
      document.body
    );
  };

  const handleEditDeck = async (e) => {
    e.preventDefault();
    try {
      const response = await api.put(`/flashcards/deck/update/${editingDeck.id}/`, {
          title: editDeckTitle,
          subject: editDeckSubject
      });

      setShowEditDeck(false);
      setEditingDeck(null);
      fetchCards(); // Refresh the cards list
    } catch (err) {
      console.error('Error updating deck:', err);
      setError(err.message);
    }
  };

  const handleEditCard = async (e) => {
    e.preventDefault();
    try {
      const response = await api.put(`/flashcards/cards/update/${editingCard.card_deck}/${editingCard.id}/`, {
          question: editCardQuestion,
          answer: editCardAnswer,
          scheduled_date: editCardScheduledDate
      });

      setShowEditCard(false);
      setEditingCard(null);
      fetchCards(); // Refresh the cards list
    } catch (err) {
      console.error('Error updating card:', err);
      setError(err.message);
    }
  };

  const renderEditDeckModal = () => {
    if (!showEditDeck || !editingDeck) return null;
    return ReactDOM.createPortal(
      <div className="modal-overlay">
        <div className="modal-content">
          <h2>Edit Deck</h2>
          <form onSubmit={handleEditDeck}>
            <div className="form-group">
              <label htmlFor="editDeckTitle">Title:</label>
              <input
                type="text"
                id="editDeckTitle"
                value={editDeckTitle}
                onChange={(e) => setEditDeckTitle(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="editDeckSubject">Subject:</label>
              <input
                type="text"
                id="editDeckSubject"
                value={editDeckSubject}
                onChange={(e) => setEditDeckSubject(e.target.value)}
                required
              />
            </div>
            <div className="modal-actions">
              <button type="submit" className="submit-button">Save Changes</button>
              <button 
                type="button" 
                className="cancel-button"
                onClick={() => {
                  setShowEditDeck(false);
                  setEditingDeck(null);
                }}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>,
      document.body
    );
  };

  const renderEditCardModal = () => {
    if (!showEditCard || !editingCard) return null;
    return ReactDOM.createPortal(
      <div className="modal-overlay">
        <div className="modal-content">
          <h2>Edit Card</h2>
          <form onSubmit={handleEditCard}>
            <div className="form-group">
              <label htmlFor="editCardQuestion">Question:</label>
              <textarea
                id="editCardQuestion"
                value={editCardQuestion}
                onChange={(e) => setEditCardQuestion(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="editCardAnswer">Answer:</label>
              <textarea
                id="editCardAnswer"
                value={editCardAnswer}
                onChange={(e) => setEditCardAnswer(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="editCardScheduledDate">Scheduled Review Date:</label>
              <input
                type="date"
                id="editCardScheduledDate"
                value={editCardScheduledDate}
                onChange={(e) => setEditCardScheduledDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
              />
            </div>
            <div className="modal-actions">
              <button type="submit" className="submit-button">Save Changes</button>
              <button 
                type="button" 
                className="cancel-button"
                onClick={() => {
                  setShowEditCard(false);
                  setEditingCard(null);
                }}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>,
      document.body
    );
  };

  if (loading) {
    return (
      <div className="review-widget">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="review-widget">
        <div className="error">{error}</div>
      </div>
    );
  }

  const renderSummaryBadges = () => (
    <div className="badge-row-with-filter">
    <div className="badge-row">
      <div 
        className="badge overdue"
        onMouseEnter={() => setTooltip('overdue')}
        onMouseLeave={() => setTooltip(null)}
      >
        <FiAlertCircle />
        <span>Overdue: {cards.overdue?.length || 0}</span>
        {tooltip === 'overdue' && (
          <div className="tooltip">
            Cards that were due for review but haven't been studied yet
          </div>
        )}
      </div>
      <div 
        className="badge due-now"
        onMouseEnter={() => setTooltip('dueNow')}
        onMouseLeave={() => setTooltip(null)}
      >
        <FiClock />
        <span>Due Now: {cards.dueNow?.length || 0}</span>
        {tooltip === 'dueNow' && (
          <div className="tooltip">
            Cards due for review in the next hour
          </div>
        )}
      </div>
      <div 
        className="badge later-today"
        onMouseEnter={() => setTooltip('laterToday')}
        onMouseLeave={() => setTooltip(null)}
      >
        <FiCalendar />
        <span>Later Today: {cards.laterToday?.length || 0}</span>
        {tooltip === 'laterToday' && (
          <div className="tooltip">
            Cards scheduled for later today
          </div>
        )}
      </div>
      <div 
        className="badge upcoming"
        onMouseEnter={() => setTooltip('upcoming')}
        onMouseLeave={() => setTooltip(null)}
      >
        <FiCalendar />
        <span>Upcoming: {cards.upcoming?.length || 0}</span>
        {tooltip === 'upcoming' && (
          <div className="tooltip">
            Cards coming up for review in the next few days
          </div>
        )}
        </div>
      </div>
      <div className="badge-row-filter">
        {renderDeckDropdown()}
      </div>
    </div>
  );

  // Dropdown UI for deck filter
  const renderDeckDropdown = () => (
    <div className="deck-dropdown-container">
      <button
        className="deck-dropdown-toggle"
        onClick={() => setShowDeckDropdown((prev) => !prev)}
      >
        <span role="img" aria-label="deck">📁</span>
        {selectedDeckId
          ? (decks.find(d => d.id === selectedDeckId)?.title || 'Unknown Deck')
          : 'All Decks'}
        <FiChevronDown style={{ marginLeft: 6 }} />
      </button>
      {showDeckDropdown && (
        <div className="deck-dropdown-menu">
          <div
            className={`deck-dropdown-item${selectedDeckId === null ? ' selected' : ''}`}
            onClick={() => { setSelectedDeckId(null); setShowDeckDropdown(false); }}
          >
            📁 All Decks
          </div>
          {decks.map(deck => (
            <div
              key={deck.id}
              className={`deck-dropdown-item${selectedDeckId === deck.id ? ' selected' : ''}`}
              onClick={() => { setSelectedDeckId(deck.id); setShowDeckDropdown(false); }}
            >
              📦 {deck.title}
            </div>
          ))}
        </div>
      )}
      {selectedDeckId && (
        <button
          className="clear-deck-filter"
          onClick={() => setSelectedDeckId(null)}
          title="Clear Filter"
        >
          <FiX />
        </button>
      )}
    </div>
  );

  const renderCardList = () => (
    <div className="card-preview-section">
      <div className="tab-bar-with-filter">
      <div className="tab-bar">
        <button 
          className={`tab ${activeTab === 'overdue' ? 'active' : ''}`}
          onClick={() => setActiveTab('overdue')}
        >
          Overdue ({cards.overdue?.length || 0})
        </button>
        <button 
          className={`tab ${activeTab === 'dueNow' ? 'active' : ''}`}
          onClick={() => setActiveTab('dueNow')}
        >
          Due Now ({cards.dueNow?.length || 0})
        </button>
        <button 
          className={`tab ${activeTab === 'laterToday' ? 'active' : ''}`}
          onClick={() => setActiveTab('laterToday')}
        >
          Later Today ({cards.laterToday?.length || 0})
        </button>
        <button 
          className={`tab ${activeTab === 'upcoming' ? 'active' : ''}`}
          onClick={() => setActiveTab('upcoming')}
        >
          Upcoming ({cards.upcoming?.length || 0})
        </button>
      </div>
      </div>
      <div className="card-list">
        {loading ? (
          <LoadingSpinner />
        ) : (
          (cards[activeTab] || []).map((card, index) => (
            <div key={card.id} className="card-item">
              <div className="card-info">
                <h4>{card.question}</h4>
                <div className="card-details">
                  <span className="deck-title">{card.deckTitle}</span>
                  {card.scheduled_date && (
                    <span className="review-date">
                      {activeTab === 'overdue' && `Due at ${formatDateTimeForDisplay(card.scheduled_date)}`}
                      {activeTab === 'dueNow' && `Due ${getTimeDifference(card.scheduled_date)}`}
                      {activeTab === 'laterToday' && `Scheduled at ${formatDateTimeForDisplay(card.scheduled_date)}`}
                      {activeTab === 'upcoming' && `Scheduled for ${formatDateTimeForDisplay(card.scheduled_date)}`}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );

  const renderActionPanel = () => {
    const totalDue = (cards.overdue?.length || 0) + (cards.dueNow?.length || 0);
    return (
      <div className="action-panel">
        <div className="action-buttons">
        <button 
            type="button"
          className="start-review-button"
          onClick={handleStartReview}
        >
          Start Review Session ({totalDue} Due Cards)
        </button>
        </div>
        <p className="subtext">Get back on track in 5 minutes</p>
      </div>
    );
  };

  return (
    <div className="review-widget">
      {renderSummaryBadges()}
      {renderCardList()}
      {renderActionPanel()}
      {showCreateCard && renderCreateCardModal()}
      {showEditDeck && renderEditDeckModal()}
      {showEditCard && renderEditCardModal()}
    </div>
  );
};

// Add the style element at the end of the file
const style = document.createElement('style');
style.textContent = `
  .glass-n {
    position: relative;
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .glass-n span {
    font-size: 48px;
    font-weight: bold;
    color: transparent;
    background: linear-gradient(
      90deg,
      rgba(255, 255, 255, 0) 0%,
      rgba(255, 255, 255, 0.8) 50%,
      rgba(255, 255, 255, 0) 100%
    );
    background-size: 200% 100%;
    background-clip: text;
    -webkit-background-clip: text;
    animation: shimmer 2s infinite;
    text-shadow: 0 0 10px rgba(255, 255, 255, 0.3);
    position: relative;
  }

  .glass-n span::before {
    content: 'N';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    color: rgba(255, 255, 255, 0.1);
    text-shadow: 0 0 20px rgba(255, 255, 255, 0.2);
  }

  @keyframes shimmer {
    0% {
      background-position: -200% 0;
    }
    100% {
      background-position: 200% 0;
    }
  }

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

export default ReviewWidget; 