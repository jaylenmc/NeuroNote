import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiAlertCircle, FiClock, FiCalendar, FiStar, FiBook, FiAlertTriangle } from 'react-icons/fi';
import './ReviewWidget.css';
import brainPng from '../assets/brain.png';

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
    dueToday: [],
    upcoming: []
  });
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
      const token = sessionStorage.getItem('jwt_token');
      if (!token) {
        setError('Please log in to view your decks');
        setLoading(false);
        return;
      }

      // Fetch decks first
      const decksResponse = await fetch('http://localhost:8000/api/flashcards/deck/', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        credentials: 'include'
      });

      if (!decksResponse.ok) {
        if (decksResponse.status === 401) {
          setError('Session expired. Please log in again.');
          navigate('/signin');
          setLoading(false);
          return;
        }
        throw new Error('Failed to fetch decks');
      }

      const data = await decksResponse.json();
      const decks = data.decks || [];
      console.log('Fetched decks:', decks);

      // Fetch cards for each deck
      const allCards = [];
      for (const deck of decks) {
        const cardsResponse = await fetch(`http://localhost:8000/api/flashcards/cards/${deck.id}/`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          credentials: 'include'
        });

        if (!cardsResponse.ok) {
          console.error(`Failed to fetch cards for deck ${deck.id}`);
          continue;
        }

        const deckCards = await cardsResponse.json();
        console.log(`Cards for deck ${deck.id}:`, deckCards);
        allCards.push(...deckCards.map(card => ({ ...card, deckTitle: deck.title })));
      }

      // Sort cards into categories based on due date
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      console.log('Today\'s date:', today.toISOString());

      const sortedCards = {
        overdue: [],
        dueToday: [],
        upcoming: []
      };

      allCards.forEach(card => {
        if (!card.scheduled_date) {
          sortedCards.overdue.push(card);
          return;
        }

        const dueDate = new Date(card.scheduled_date);
        const dueDateOnly = new Date(dueDate.getFullYear(), dueDate.getMonth(), dueDate.getDate());
        console.log('Card scheduled date:', card.scheduled_date, 'Parsed date:', dueDateOnly.toISOString());

        if (dueDateOnly < today) {
          sortedCards.overdue.push(card);
        } else if (dueDateOnly.getTime() === today.getTime()) {
          sortedCards.dueToday.push(card);
        } else {
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

  const handleStartReview = () => {
    const dueCards = [...cards.overdue, ...cards.dueToday];
    
    if (dueCards.length === 0) {
      setError('No cards for review today');
      return;
    }

    // Navigate to the dedicated review session page
    navigate('/review-session');
  };

  const handleCreateCard = async (e) => {
    e.preventDefault();
    try {
      const token = sessionStorage.getItem('jwt_token');
      if (!token) {
        setError('Please log in to create cards');
        return;
      }

      if (!selectedDeck) {
        setError('Please select a deck first');
        return;
      }

      const response = await fetch('http://localhost:8000/api/flashcards/cards/', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
          question: newCardQuestion,
          answer: newCardAnswer,
          deck_id: selectedDeck.id,
          scheduled_date: newCardScheduledDate
        })
      });

      if (!response.ok) {
        if (response.status === 401) {
          setError('Session expired. Please log in again.');
          return;
        }
        throw new Error('Failed to create card');
      }

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
      const token = sessionStorage.getItem('jwt_token');
      if (!token) {
        setError('Please log in to edit deck');
        return;
      }

      const response = await fetch(`http://localhost:8000/api/flashcards/deck/update/${editingDeck.id}/`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
          title: editDeckTitle,
          subject: editDeckSubject
        })
      });

      if (!response.ok) {
        if (response.status === 401) {
          setError('Session expired. Please log in again.');
          return;
        }
        throw new Error('Failed to update deck');
      }

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
      const token = sessionStorage.getItem('jwt_token');
      if (!token) {
        setError('Please log in to edit card');
        return;
      }

      const response = await fetch(`http://localhost:8000/api/flashcards/cards/update/${editingCard.card_deck}/${editingCard.id}/`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
          question: editCardQuestion,
          answer: editCardAnswer,
          scheduled_date: editCardScheduledDate
        })
      });

      if (!response.ok) {
        if (response.status === 401) {
          setError('Session expired. Please log in again.');
          return;
        }
        throw new Error('Failed to update card');
      }

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
    <div className="badge-row">
      <div 
        className="badge overdue"
        onMouseEnter={() => setTooltip('overdue')}
        onMouseLeave={() => setTooltip(null)}
      >
        <FiAlertCircle />
        <span>Overdue: {cards.overdue.length}</span>
        {tooltip === 'overdue' && (
          <div className="tooltip">
            Cards that were due for review but haven't been studied yet
          </div>
        )}
      </div>
      <div 
        className="badge due-today"
        onMouseEnter={() => setTooltip('dueToday')}
        onMouseLeave={() => setTooltip(null)}
      >
        <FiClock />
        <span>Due Today: {cards.dueToday.length}</span>
        {tooltip === 'dueToday' && (
          <div className="tooltip">
            Cards scheduled for review today
          </div>
        )}
      </div>
      <div 
        className="badge upcoming"
        onMouseEnter={() => setTooltip('upcoming')}
        onMouseLeave={() => setTooltip(null)}
      >
        <FiCalendar />
        <span>Upcoming: {cards.upcoming.length}</span>
        {tooltip === 'upcoming' && (
          <div className="tooltip">
            Cards coming up for review in the next few days
          </div>
        )}
      </div>
    </div>
  );

  const renderCardList = () => (
    <div className="card-preview-section">
      <div className="tab-bar">
        <button 
          className={`tab ${activeTab === 'overdue' ? 'active' : ''}`}
          onClick={() => setActiveTab('overdue')}
        >
          Overdue ({cards.overdue.length})
        </button>
        <button 
          className={`tab ${activeTab === 'dueToday' ? 'active' : ''}`}
          onClick={() => setActiveTab('dueToday')}
        >
          Due Today ({cards.dueToday.length})
        </button>
        <button 
          className={`tab ${activeTab === 'upcoming' ? 'active' : ''}`}
          onClick={() => setActiveTab('upcoming')}
        >
          Upcoming ({cards.upcoming.length})
        </button>
      </div>

      <div className="card-list">
        {loading ? (
          <LoadingSpinner />
        ) : (
          cards[activeTab].map((card, index) => (
            <div key={card.id} className="card-item">
              <div className="card-info">
                <h4>{card.question}</h4>
                <div className="card-details">
                  <span className="deck-title">{card.deckTitle}</span>
                  {card.scheduled_date && (
                    <span className="review-date">
                      Next Review: {new Date(card.scheduled_date).toLocaleDateString()}
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
    const totalDue = cards.overdue.length + cards.dueToday.length;
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