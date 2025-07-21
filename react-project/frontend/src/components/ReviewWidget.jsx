import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import ReactDOM from 'react-dom';
import { FiAlertCircle, FiClock, FiCalendar, FiStar, FiBook, FiAlertTriangle, FiChevronDown, FiX, FiPlus, FiEye } from 'react-icons/fi';
import './ReviewWidget.css';
import brainPng from '../assets/brain.png';
import api from '../api/axios';
import { formatDateForDisplay, formatDateTimeForDisplay, convertBackendDateToLocal, isBackendDateToday, isBackendDatePast, isBackendDateFuture, isBackendDateTimeDueToday, isBackendDateTimeOverdue, isBackendDateTimeUpcoming, isBackendDateTimeDueNow, isBackendDateTimeLaterToday, isBackendDateTimeDueSoon, getTimeDifference, getOverdueTimeDifference, formatTimeForCardDisplay } from '../utils/dateUtils';

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

const ReviewWidget = ({ decks = [], selectedDeckId, setSelectedDeckId }) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overdue');
  const [tooltip, setTooltip] = useState(null);
  const [cards, setCards] = useState({
    overdue: [],
    dueNow: [],
    dueSoon: [],
    upcoming: []
  });
  const [allCards, setAllCards] = useState([]);
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
  const [selectedDeck, setSelectedDeck] = useState(null);
  const [includeDueSoon, setIncludeDueSoon] = useState(false);
  const [hoveredTab, setHoveredTab] = useState(null);
  const tabTooltips = {
    overdue: 'Cards that were due for review but haven\'t been studied yet',
    dueNow: 'Cards due for review right now (within grace period)',
    dueSoon: 'Cards due for review in the next hour (optional preview)',
    upcoming: 'Cards scheduled for future review',
  };

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

  const fetchCards = async () => {
    try {
      setLoading(true);
  

      // Fetch cards for each deck
      const allCards = [];
      for (const deck of decks) {
        try {
          const cardsResponse = await api.get(`/flashcards/cards/${deck.id}/`);
          const deckCards = cardsResponse.data;
      
          
          // Handle different possible card response structures
          let cards = [];
          if (Array.isArray(deckCards)) {
            cards = deckCards;
          } else if (deckCards && Array.isArray(deckCards.cards)) {
            cards = deckCards.cards;
          } else if (deckCards && deckCards.results) {
            cards = deckCards.results;
          }
          
          allCards.push(...cards.map(card => ({ ...card, deckTitle: deck.title, deckId: deck.id })));
        } catch (cardErr) {
          console.error(`Error fetching cards for deck ${deck.id}:`, cardErr);
        }
      }
      setAllCards(allCards);

      // Sort cards into categories based on due date
      const sortedCards = {
        overdue: [],
        dueNow: [],
        dueSoon: [],
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
        } else if (isBackendDateTimeDueSoon(card.scheduled_date)) {
          sortedCards.dueSoon.push(card);
        } else if (isBackendDateTimeUpcoming(card.scheduled_date)) {
          sortedCards.upcoming.push(card);
        }
      });

  
      setCards(sortedCards);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching cards:', err);
      setError(err.message);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (decks.length > 0) {
      fetchCards();
    }
  }, [decks]);

  // Filter cards by selected deck
  useEffect(() => {
    if (!selectedDeckId) {
      // Show all cards
      const sortedCards = { overdue: [], dueNow: [], dueSoon: [], upcoming: [] };
      allCards.forEach(card => {
        if (!card.scheduled_date) {
          sortedCards.overdue.push(card);
          return;
        }
        if (isBackendDateTimeOverdue(card.scheduled_date)) {
          sortedCards.overdue.push(card);
        } else if (isBackendDateTimeDueNow(card.scheduled_date)) {
          sortedCards.dueNow.push(card);
        } else if (isBackendDateTimeDueSoon(card.scheduled_date)) {
          sortedCards.dueSoon.push(card);
        } else if (isBackendDateTimeUpcoming(card.scheduled_date)) {
          sortedCards.upcoming.push(card);
        }
      });
      setCards(sortedCards);
    } else {
      // Filter by deck
      const sortedCards = { overdue: [], dueNow: [], dueSoon: [], upcoming: [] };
      
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
        } else if (isBackendDateTimeDueSoon(card.scheduled_date)) {
          sortedCards.dueSoon.push(card);
        } else if (isBackendDateTimeUpcoming(card.scheduled_date)) {
          sortedCards.upcoming.push(card);
        }
      });
      setCards(sortedCards);
    }
  }, [selectedDeckId, allCards]);

  const handleStartReview = () => {
    const dueCards = [...(cards.overdue || []), ...(cards.dueNow || [])];
    
    // Include due soon cards if the toggle is checked (for both all decks and individual decks)
    const shouldIncludeDueSoon = includeDueSoon;
    const totalCards = shouldIncludeDueSoon ? [...dueCards, ...(cards.dueSoon || [])] : dueCards;
    
    if (totalCards.length === 0) {
  
      setError('No cards for review today');
      return;
    }

    // Navigate to the dedicated review session page with selected deck info
    if (selectedDeckId) {
      const selectedDeck = decks.find(d => d.id === selectedDeckId);
  
  
      navigate('/review-session', { state: { selectedDeck, includeDueSoon } });
    } else {
  
  
      navigate('/review-session', { state: { includeDueSoon: shouldIncludeDueSoon } });
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

  // Progress summary calculation
  const totalCards = allCards.length;
  const reviewedToday = allCards.filter(card => card.last_reviewed_today).length;
  const mastered = allCards.filter(card => card.learning_status === 'Mastered').length;
  const leftToday = totalCards - reviewedToday;
  const progressPct = totalCards ? Math.round((reviewedToday / totalCards) * 100) : 0;

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
            Cards due for review right now (within grace period)
          </div>
        )}
      </div>
      <div 
        className="badge due-soon"
        onMouseEnter={() => setTooltip('dueSoon')}
        onMouseLeave={() => setTooltip(null)}
      >
        <FiEye />
        <span>Due Soon: {cards.dueSoon?.length || 0}</span>
        {tooltip === 'dueSoon' && (
          <div className="tooltip">
            Cards due for review in the next hour (optional preview)
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
            Cards scheduled for future review
          </div>
        )}
      </div>
    </div>
    </div>
  );

  const renderCardList = () => (
    <div className="card-preview-section">
      {/* Sticky Tab Bar */}
      <div className="sticky-tab-container enhanced-tab-container">
        {/* Progress summary bar removed */}
        <div className="tab-bar-with-filter enhanced-tab-bar">
          <div className="tab-bar">
            <button 
              className={`tab ${activeTab === 'overdue' ? 'active' : ''}`}
              data-category="overdue"
              onClick={() => setActiveTab('overdue')}
              onMouseEnter={() => setHoveredTab('overdue')}
              onMouseLeave={() => setHoveredTab(null)}
            >
              <span className="tab-icon">⚠️</span>
              <span>Overdue <span className="tab-count animated-count">{cards.overdue?.length || 0}</span></span>
            </button>
            <button 
              className={`tab ${activeTab === 'dueNow' ? 'active' : ''}`}
              data-category="dueNow"
              onClick={() => setActiveTab('dueNow')}
              onMouseEnter={() => setHoveredTab('dueNow')}
              onMouseLeave={() => setHoveredTab(null)}
            >
              <span className="tab-icon">⏰</span>
              <span>Due Now <span className="tab-count animated-count">{cards.dueNow?.length || 0}</span></span>
            </button>
            <button 
              className={`tab ${activeTab === 'dueSoon' ? 'active' : ''}`}
              data-category="dueSoon"
              onClick={() => setActiveTab('dueSoon')}
              onMouseEnter={() => setHoveredTab('dueSoon')}
              onMouseLeave={() => setHoveredTab(null)}
            >
              <span className="tab-icon">👁️</span>
              <span>Due Soon <span className="tab-count animated-count">{cards.dueSoon?.length || 0}</span></span>
            </button>
            <button 
              className={`tab ${activeTab === 'upcoming' ? 'active' : ''}`}
              data-category="upcoming"
              onClick={() => setActiveTab('upcoming')}
              onMouseEnter={() => setHoveredTab('upcoming')}
              onMouseLeave={() => setHoveredTab(null)}
            >
              <span className="tab-icon">📅</span>
              <span>Upcoming <span className="tab-count animated-count">{cards.upcoming?.length || 0}</span></span>
            </button>
          </div>
        </div>
      </div>
      {/* Card Content */}
      <div className="card-content-area">
        {loading ? (
          <div className="loading-container">
            <LoadingSpinner />
          </div>
        ) : (
          <div className="scrollable-card-list">
            {(cards[activeTab] || []).map((card, index) => (
              <div key={card.id} className="card-item" style={{ animationDelay: `${index * 0.1}s` }}>
                <div className="card-deck-top">
                  <span role="img" aria-label="deck">🌍</span> {card.deckTitle}
                </div>
                <div className="card-question-center">
                  {card.question}
                </div>
                <div className="card-due-bottom">
                  <span className="card-due-icon">📅</span>
                  <span className="card-due-date">
                    {formatTimeForCardDisplay(card.scheduled_date, activeTab)}
                  </span>
                </div>
              </div>
            ))}
            {(cards[activeTab] || []).length === 0 && (
              <div className="empty-state">
                <div className="empty-icon">📚</div>
                <h3>No cards in this category</h3>
                <p>All caught up! Check back later for new reviews.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );

  const renderActionPanel = () => {
    const dueCards = (cards.overdue?.length || 0) + (cards.dueNow?.length || 0);
    const dueSoonCards = cards.dueSoon?.length || 0;
    
    // Include due soon cards if the toggle is checked (for both all decks and individual decks)
    const shouldIncludeDueSoon = includeDueSoon;
    const totalCards = shouldIncludeDueSoon ? dueCards + dueSoonCards : dueCards;
    
    return (
      <div className="action-panel">
        <div className="action-panel-header">
          <h2 className="action-panel-title">Start Review Session</h2>
          <p className="action-panel-subtitle">Ready to study? Choose your session type below.</p>
        </div>
        
        <div className="action-buttons">
          <button 
            type="button"
            className="start-review-button"
            onClick={handleStartReview}
          >
            <FiBook className="button-icon" />
            <span>Start Review Session ({totalCards} Cards)</span>
          </button>
        </div>
        
        {/* Show due soon toggle for all deck selections */}
          <div className="review-options">
            <label className="due-soon-toggle">
              <input
                type="checkbox"
                checked={includeDueSoon}
                onChange={(e) => setIncludeDueSoon(e.target.checked)}
              />
              <div className="toggle-content">
                <span className="toggle-label">
                  Include "Due Soon" cards ({dueSoonCards} available)
                </span>
                <span className="toggle-hint">
                  Study ahead - may affect memory retention
                </span>
              </div>
            </label>
          </div>
        
        <div className="session-summary">
          <p className="subtext">
            {selectedDeckId 
              ? shouldIncludeDueSoon 
                ? `Review overdue, due now, and due soon cards for selected deck (${dueCards} + ${dueSoonCards} preview)`
                : `Review overdue and due now cards for selected deck (${dueCards} cards)`
              : shouldIncludeDueSoon 
                ? `Review overdue, due now, and due soon cards (${dueCards} + ${dueSoonCards} preview)`
                : `Review overdue and due now cards (${dueCards} cards)`
            }
          </p>
        </div>
      </div>
    );
  };

  return (
    <div className="review-page-container">
      <div className="review-page-content">
        <div className="review-widget">
          {renderCardList()}
          {renderActionPanel()}
          {showCreateCard && renderCreateCardModal()}
          {showEditDeck && renderEditDeckModal()}
          {showEditCard && renderEditCardModal()}
        </div>
      </div>
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