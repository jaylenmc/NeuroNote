import React, { useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { FiBell, FiSettings, FiCheck, FiClock, FiAlertCircle, FiGrid, FiList, FiTrendingUp, FiPlus, FiTrash2, FiEdit2, FiBook, FiHelpCircle, FiX, FiArrowRight, FiShuffle, FiPause, FiLayers, FiType, FiRotateCcw, FiArrowLeft, FiPlay, FiCalendar, FiSkipForward, FiStar, FiUser, FiLogOut, FiHome, FiAward, FiShare2, FiMoreVertical, FiUsers, FiFileText, FiFolder, FiSearch, FiFilter, FiSave, FiGlobe, FiTag } from 'react-icons/fi';
import { Line, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import api from '../api/axios';
import './ReviewCards.css';
import Confetti from 'react-confetti';
import { formatDateForDisplay, formatDateTimeForDisplay, convertBackendDateToLocal, isBackendDateToday, isBackendDatePast, isBackendDateFuture, isBackendDateTimeDueToday, isBackendDateTimeOverdue, isBackendDateTimeUpcoming, isBackendDateTimeDueNow, isBackendDateTimeLaterToday, getTimeDifference } from '../utils/dateUtils';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const confettiStyles = `
  @keyframes dropConfetti {
    0% {
      transform: translateY(-100%);
    }
    100% {
      transform: translateY(0);
    }
  }
`;

const styleSheet = document.createElement("style");
styleSheet.innerText = confettiStyles;
document.head.appendChild(styleSheet);

const ReviewCards = ({ onViewModeChange }) => {
  const navigate = useNavigate();
  const [cards, setCards] = useState([]);
  const [decks, setDecks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [streak, setStreak] = useState(0);
  const [notificationPreference, setNotificationPreference] = useState('email');
  const [showSettings, setShowSettings] = useState(false);
  const [viewMode, setViewMode] = useState('cards');
  const [selectedDeck, setSelectedDeck] = useState(null);
  const [showMetrics, setShowMetrics] = useState(false);
  const [showCreateDeck, setShowCreateDeck] = useState(false);
  const [newDeckTitle, setNewDeckTitle] = useState('');
  const [newDeckSubject, setNewDeckSubject] = useState('');
  const [showCreateCard, setShowCreateCard] = useState(false);
  const [newCardQuestion, setNewCardQuestion] = useState('');
  const [newCardAnswer, setNewCardAnswer] = useState('');
  const [newCardScheduledDate, setNewCardScheduledDate] = useState('');
  const [metrics, setMetrics] = useState({
    cardsReviewed: [],
    retentionRate: [],
    deckPerformance: []
  });
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState('');
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [currentReviewCardIndex, setCurrentReviewCardIndex] = useState(0);
  const [reviewCards, setReviewCards] = useState([]);
  const [isFlipped, setIsFlipped] = useState(false);
  const [reviewMode, setReviewMode] = useState('multiple-choice');
  const [userAnswer, setUserAnswer] = useState('');
  const [showAnswer, setShowAnswer] = useState(false);
  const [timer, setTimer] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [confettiOpacity, setConfettiOpacity] = useState(1);
  const [userRating, setUserRating] = useState(null);
  const [showRatingOptions, setShowRatingOptions] = useState(false);
  const [pendingRatings, setPendingRatings] = useState([]);
  const [sessionComplete, setSessionComplete] = useState(false);
  const [editCardModal, setEditCardModal] = useState(false);
  const [editCardData, setEditCardData] = useState({ id: null, question: '', answer: '', scheduled_date: '' });

  // Color map for underlines
  const ratingColors = [
    '#9E9E9E', // 0 - Blackout
    '#F44336', // 1 - Unfamiliar
    '#FF9800', // 2 - Familiar
    '#FFC107', // 3 - Difficulty
    '#8BC34A', // 4 - Hesitation
    '#4CAF50', // 5 - Perfect
  ];

  useEffect(() => {
    fetchCards();
    fetchDecks();
    fetchMetrics();
  }, []);

  useEffect(() => {
    let interval;
    if (showReviewModal && !isPaused) {
      interval = setInterval(() => {
        setTimer((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [showReviewModal, isPaused]);

  useEffect(() => {
    if (!showReviewModal) return;
    const handleKeyDown = (e) => {
      if (e.code === 'Space' || e.key === ' ') {
        e.preventDefault();
        setIsFlipped((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showReviewModal]);

  useEffect(() => {
    if (onViewModeChange) {
      onViewModeChange(viewMode, selectedDeck);
    }
  }, [viewMode, selectedDeck]);

  useEffect(() => {
    if (showRatingOptions) {
      const handleKeyPress = (e) => {
        const rating = parseInt(e.key);
        if (rating >= 0 && rating <= 5) {
          handleRatingSelect(rating);
        }
      };
      window.addEventListener('keydown', handleKeyPress);
      return () => window.removeEventListener('keydown', handleKeyPress);
    }
  }, [showRatingOptions]);

  const fetchCards = async () => {
    try {
      // Fetch all decks
      const decksResponse = await api.get('/flashcards/deck/');
      const decksData = decksResponse.data;
      setDecks(decksData);
      // Then fetch cards for each deck
      const allCards = [];
      for (const deck of decksData) {
        const cardsResponse = await api.get(`/flashcards/cards/${deck.id}/`);
        const cardsData = cardsResponse.data;
        allCards.push(...cardsData);
      }
      setCards(allCards);
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  const fetchDecks = async () => {
    try {
      const response = await api.get('flashcards/deck');
        setDecks(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching decks:', error);
      setError('Failed to load decks');
      setLoading(false);
    }
  };

  const fetchMetrics = async () => {
    try {
      const mockData = {
        cardsReviewed: {
          labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
          data: [12, 19, 15, 25, 22, 30, 28]
        },
        retentionRate: {
          labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
          data: [85, 88, 82, 90, 87, 92, 89]
        },
        deckPerformance: {
          labels: decks.map(deck => deck.title),
          data: [75, 82, 68, 90, 85]
        }
      };
      setMetrics(mockData);
    } catch (err) {
      console.error('Error fetching metrics:', err);
    }
  };

  const showNotificationMessage = (message) => {
    setNotificationMessage(message);
    setShowNotification(true);
    setTimeout(() => {
      setShowNotification(false);
    }, 3000);
  };

  const createDeck = async (e) => {
    e.preventDefault();
    try {
      const response = await api.post('flashcards/deck/', {
        title: newDeckTitle,
        subject: newDeckSubject
      });
      setShowCreateDeck(false);
      setNewDeckTitle('');
      setNewDeckSubject('');
      fetchDecks();
      showNotificationMessage('Deck created successfully');
    } catch (error) {
      console.error('Error creating deck:', error);
      showNotificationMessage('Failed to create deck. Please try again.');
    }
  };

  const createCard = async (e) => {
    e.preventDefault();
    if (!selectedDeck) {
      showNotificationMessage('Please select a deck first');
      return;
    }

    try {
      const response = await api.post('flashcards/cards/', {
        question: newCardQuestion,
        answer: newCardAnswer,
        deck_id: selectedDeck.id,
        scheduled_date: newCardScheduledDate
      });
      setShowCreateCard(false);
      setNewCardQuestion('');
      setNewCardAnswer('');
      setNewCardScheduledDate('');
      fetchCards();
      showNotificationMessage('Card created successfully');
    } catch (error) {
      console.error('Error creating card:', error);
      showNotificationMessage('Failed to create card. Please try again.');
    }
  };

  const deleteDeck = async (deckId) => {
    try {
      const deckToDelete = decks.find(deck => deck.id === deckId);
      await api.delete(`flashcards/deck/delete/${deckId}`);
      setDecks(decks.filter(deck => deck.id !== deckId));
      if (selectedDeck?.id === deckId) {
        setSelectedDeck(null);
        setViewMode('decks');
      }
      showNotificationMessage(`${deckToDelete.title} deleted!`);
    } catch (err) {
      console.error('Error deleting deck:', err);
      showNotificationMessage('Failed to delete deck. Please try again.');
    }
  };

  const deleteCard = async (deckId, cardId) => {
      try {
      await api.delete(`flashcards/cards/delete/${deckId}/${cardId}/`);
      setCards(cards.filter(card => card.id !== cardId));
      showNotificationMessage('Card deleted');
      } catch (err) {
      console.error('Error deleting card:', err);
      showNotificationMessage('Failed to delete card. Please try again.');
    }
  };

  const handleDeckClick = (deck) => {
    setSelectedDeck(deck);
    setViewMode('deck-details');
  };

  const getCardsByStatus = () => {
    const overdue = [];
    const dueNow = [];
    const laterToday = [];
    const upcoming = [];

    cards.forEach(card => {
      if (!card.scheduled_date) {
        overdue.push(card);
        return;
      }

      if (isBackendDateTimeOverdue(card.scheduled_date)) {
        overdue.push(card);
      } else if (isBackendDateTimeDueNow(card.scheduled_date)) {
        dueNow.push(card);
      } else if (isBackendDateTimeLaterToday(card.scheduled_date)) {
        laterToday.push(card);
      } else if (isBackendDateTimeUpcoming(card.scheduled_date)) {
        upcoming.push(card);
      }
    });

    return { overdue, dueNow, laterToday, upcoming };
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(255, 255, 255, 0.1)'
        },
        ticks: {
          color: '#888'
        }
      },
      x: {
        grid: {
          color: 'rgba(255, 255, 255, 0.1)'
        },
        ticks: {
          color: '#888'
        }
      }
    }
  };

  const renderDeckDetails = () => {
    const deckCards = cards.filter(card => card.card_deck === selectedDeck.id);

  return (
      <div className="deck-details">
        <div className="deck-details-header">
          <button className="back-button" onClick={() => setViewMode('decks')}>
            ← Back to Decks
          </button>
          <h2>{selectedDeck.title}</h2>
          <div className="deck-actions">
            <button 
              className="action-button create"
              onClick={() => setShowCreateCard(true)}
            >
              <FiPlus /> Create Card
            </button>
            <button 
              className="action-button delete"
              onClick={() => deleteDeck(selectedDeck.id)}
            >
              <FiTrash2 /> Delete Deck
            </button>
          </div>
        </div>
        <div className="deck-stats">
          <div className="stat-card">
            <span className="stat-value">{deckCards.length}</span>
            <span className="stat-label">Total Cards</span>
          </div>
          <div className="stat-card">
            <span className="stat-value">
              {deckCards.filter(card => new Date(card.scheduled_date) <= new Date()).length}
            </span>
            <span className="stat-label">Due Cards</span>
          </div>
          <div className="stat-card">
            <span className="stat-value">
              {deckCards.length > 0 ? Math.round((deckCards.filter(card => card.last_reviewed).length / deckCards.length) * 100) : 0}%
            </span>
            <span className="stat-label">Completion Rate</span>
          </div>
        </div>
        <div className="deck-cards-grid">
          {deckCards.map(card => (
            <div key={card.id} className="deck-card-item">
              <div className="card-content">
                <h3>{card.question}</h3>
                <p>{card.answer}</p>
                <span className="due-date">
                  Due: {card.scheduled_date ? formatDateTimeForDisplay(card.scheduled_date) : 'Not scheduled'}
                </span>
                <span className="last-review-date">
                  Last reviewed: {card.last_review_date ? formatDateTimeForDisplay(card.last_review_date) : 'Never'}
                </span>
              </div>
              <div className="card-actions">
                <button 
                  className="action-button delete"
                  onClick={() => deleteCard(selectedDeck.id, card.id)}
                >
                  <FiTrash2 /> Delete
                </button>
                <button
                  className="action-button edit"
                  onClick={() => openEditCardModal(card)}
                >
                  <FiEdit2 /> Edit
                </button>
              </div>
            </div>
          ))}
          {deckCards.length === 0 && (
            <div className="no-cards">No cards in this deck yet. Create your first card to get started!</div>
          )}
        </div>
      </div>
    );
  };

  const getDeckCardCount = (deckId) => {
    return cards.filter(card => card.card_deck === deckId).length;
  };

  const renderModals = () => {
    return ReactDOM.createPortal(
      <>
        {showNotification && (
          <div className="notification">
            {notificationMessage}
          </div>
        )}

        {showCreateDeck && (
          <div className="modal-overlay show">
            <div className="modal-content">
              <h3>Create New Deck</h3>
              <input
                type="text"
                className="folder-input"
                value={newDeckTitle}
                onChange={(e) => setNewDeckTitle(e.target.value)}
                placeholder="Enter deck title"
                autoFocus
              />
              <input
                type="text"
                className="folder-input"
                value={newDeckSubject}
                onChange={(e) => setNewDeckSubject(e.target.value)}
                placeholder="Enter subject"
              />
              <div className="modal-actions">
              <button 
                  className="create-btn" 
                  onClick={createDeck}
                  disabled={!newDeckTitle.trim() || !newDeckSubject.trim()}
              >
                  Create
              </button>
              <button 
                  className="cancel-btn" 
                  onClick={() => {
                    setShowCreateDeck(false);
                    setNewDeckTitle('');
                    setNewDeckSubject('');
                  }}
              >
                  Cancel
              </button>
              </div>
            </div>
          </div>
        )}

        {showCreateCard && (
          <div className="modal-overlay show">
            <div className="modal-content">
              <h3>Create New Card</h3>
              <input
                type="text"
                className="folder-input"
                value={newCardQuestion}
                onChange={(e) => setNewCardQuestion(e.target.value)}
                placeholder="Enter question"
                autoFocus
              />
              <input
                type="text"
                className="folder-input"
                value={newCardAnswer}
                onChange={(e) => setNewCardAnswer(e.target.value)}
                placeholder="Enter answer"
              />
              <input
                type="date"
                className="folder-input"
                value={newCardScheduledDate}
                onChange={(e) => setNewCardScheduledDate(e.target.value)}
              />
              <div className="modal-actions">
                <button 
                  className="create-btn" 
                  onClick={createCard}
                  disabled={!newCardQuestion.trim() || !newCardAnswer.trim()}
                >
                  Create
                </button>
                <button 
                  className="cancel-btn" 
                  onClick={() => {
                    setShowCreateCard(false);
                    setNewCardQuestion('');
                    setNewCardAnswer('');
                    setNewCardScheduledDate('');
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
            </div>
          )}

        {showSettings && (
          <div className="modal-overlay show">
            <div className="modal-content">
              <h3>Notification Preferences</h3>
              <div className="notification-options">
                <button
                  className={`notification-option ${notificationPreference === 'email' ? 'active' : ''}`}
                  onClick={() => setNotificationPreference('email')}
                >
                  Email Notifications
                </button>
                <button 
                  className={`notification-option ${notificationPreference === 'phone' ? 'active' : ''}`}
                  onClick={() => setNotificationPreference('phone')}
                >
                  Phone Notifications
                </button>
                <button 
                  className={`notification-option ${notificationPreference === 'none' ? 'active' : ''}`}
                  onClick={() => setNotificationPreference('none')}
                >
                  No Notifications
                </button>
              </div>
              <div className="modal-actions">
                <button 
                  className="cancel-btn" 
                  onClick={() => setShowSettings(false)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
        {editCardModal && (
          <div className="modal-overlay show">
            <div className="modal-content">
              <h3>Edit Card</h3>
              <form onSubmit={handleEditCardSubmit}>
                <input
                  type="text"
                  className="folder-input"
                  name="question"
                  value={editCardData.question}
                  onChange={handleEditCardChange}
                  placeholder="Edit question"
                  autoFocus
                />
                <input
                  type="text"
                  className="folder-input"
                  name="answer"
                  value={editCardData.answer}
                  onChange={handleEditCardChange}
                  placeholder="Edit answer"
                />
                <input
                  type="date"
                  className="folder-input"
                  name="scheduled_date"
                  value={editCardData.scheduled_date}
                  onChange={handleEditCardChange}
                />
                <div className="modal-actions">
                  <button 
                    className="create-btn" 
                    type="submit"
                    disabled={!editCardData.question.trim() || !editCardData.answer.trim()}
                  >
                    Save
                  </button>
                  <button 
                    className="cancel-btn" 
                    type="button"
                    onClick={() => { setEditCardModal(false); setEditCardData({ id: null, question: '', answer: '', scheduled_date: '' }); }}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </>,
      document.body
    );
  };

  const handleCloseReviewModal = () => {
    setShowReviewModal(false);
    setReviewCards([]);
    setCurrentReviewCardIndex(0);
    setIsFlipped(false);
    setShowAnswer(false);
    setUserAnswer('');
  };

  const handleNextReviewCard = () => {
    if (currentReviewCardIndex < reviewCards.length - 1) {
      setCurrentReviewCardIndex(currentReviewCardIndex + 1);
      setIsFlipped(false);
      setShowAnswer(false);
      setUserAnswer('');
    } else {
      setShowReviewModal(false);
      setReviewCards([]);
      setCurrentReviewCardIndex(0);
      setIsFlipped(false);
      setShowAnswer(false);
      setUserAnswer('');
      setShowConfetti(true);
      setConfettiOpacity(1);
      setTimeout(() => setConfettiOpacity(0), 3500);
      setTimeout(() => setShowConfetti(false), 4000);
      showNotificationMessage('Review session complete!');
    }
  };

  const handleCardFlip = () => {
    setIsFlipped(!isFlipped);
  };

  const handleAnswerSubmit = () => {
    setShowAnswer(true);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleShuffle = () => {
    setReviewCards((prev) => [...prev].sort(() => Math.random() - 0.5));
    setCurrentReviewCardIndex(0);
  };

  const handlePause = () => {
    setIsPaused((prev) => !prev);
  };

  const handleRatingSelect = (rating) => {
    const currentCard = reviewCards[currentReviewCardIndex];
    setPendingRatings(prev => ([
      ...prev,
      {
        deck_id: currentCard.card_deck,
        card_id: currentCard.id,
        quality: rating
      }
    ]));
    // If last card, mark session complete
    if (currentReviewCardIndex === reviewCards.length - 1) {
      setSessionComplete(true);
    } else {
      handleNextReviewCard();
    }
  };

  // Helper to update metrics.cardsReviewed with new review dates
  const updateCardsReviewedGraph = (reviewedDates) => {
    // reviewedDates is a list of date strings (e.g., ['2024-06-01', ...])
    // We'll count how many reviews per day for the last 7 days
    const today = new Date();
    const last7 = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      last7.push(d.toISOString().slice(0, 10));
    }
    // If reviewedDates is empty or undefined, fill with zeros
    const counts = last7.map(dateStr => reviewedDates ? reviewedDates.filter(d => d === dateStr).length : 0);
    setMetrics(prev => ({
      ...prev,
      cardsReviewed: {
        ...prev.cardsReviewed,
        labels: last7.map(d => new Date(d).toLocaleDateString('en-US', { weekday: 'short' })),
        data: counts
      }
    }));
  };

  // Send all ratings to backend when user clicks Go Home
  const handleGoHome = async () => {
    try {
      let allReviewedDates = [];
      for (const rating of pendingRatings) {
        const res = await api.put('flashcards/review/', rating);
        if (res.data && res.data.reviewed_dates) {
          allReviewedDates = allReviewedDates.concat(res.data.reviewed_dates);
        }
      }
      // Always update the graph, even if no reviews (will show all zeros)
      updateCardsReviewedGraph(allReviewedDates);
      setSessionComplete(false);
      setShowReviewModal(false);
      setReviewCards([]);
      setCurrentReviewCardIndex(0);
      setIsFlipped(false);
      setShowAnswer(false);
      setUserAnswer('');
      setPendingRatings([]);
      setShowConfetti(true);
      setConfettiOpacity(1);
      setTimeout(() => setConfettiOpacity(0), 3500);
      setTimeout(() => setShowConfetti(false), 4000);
      showNotificationMessage('Review session complete!');
    } catch (error) {
      console.error('Error submitting ratings:', error);
      showNotificationMessage('Failed to save ratings');
    }
  };

  const startReviewSession = (deck) => {
    // Get all cards that are overdue or due now
    const dueCards = cards.filter(card => {
      if (!card.scheduled_date) return true;
      return isBackendDateTimeOverdue(card.scheduled_date) || isBackendDateTimeDueNow(card.scheduled_date);
    });

    // If there are no cards due, show a notification
    if (dueCards.length === 0) {
      showNotificationMessage('No cards due for review now!');
      return;
    }

    // Navigate to the dedicated review session page with deck info
    if (deck) {
      navigate('/review-session', { state: { selectedDeck: deck } });
    } else {
      navigate('/review-session');
    }
  };

  const renderMyFlashcardsContent = () => {
    return (
      <div className="my-flashcards-content">
        <div className="metrics-container">
          <div className="metrics-grid">
            <div className="metric-card">
              <h3>Cards Reviewed</h3>
              <div className="chart-container">
                <Line
                  data={{
                    labels: metrics.cardsReviewed.labels,
                    datasets: [{
                      data: metrics.cardsReviewed.data,
                      borderColor: '#4CAF50',
                      tension: 0.4
                    }]
                  }}
                  options={chartOptions}
                />
              </div>
            </div>
            <div className="metric-card">
              <h3>Retention Rate</h3>
              <div className="chart-container">
                <Line
                  data={{
                    labels: metrics.retentionRate.labels,
                    datasets: [{
                      data: metrics.retentionRate.data,
                      borderColor: '#2196F3',
                      tension: 0.4
                    }]
                  }}
                  options={chartOptions}
                />
              </div>
            </div>
            <div className="metric-card">
              <h3>Deck Performance</h3>
              <div className="chart-container">
                <Bar
                  data={{
                    labels: metrics.deckPerformance.labels,
                    datasets: [{
                      data: metrics.deckPerformance.data,
                      backgroundColor: '#9C27B0'
                    }]
                  }}
                  options={chartOptions}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="decks-section">
          <div className="decks-header">
            <h2>My Decks</h2>
            <button 
              className="create-folder-btn"
              onClick={() => {
                setShowCreateDeck(true);
                setNewDeckTitle('');
                setNewDeckSubject('');
              }}
            >
              <FiPlus />
            </button>
          </div>
          <div className="decks-grid">
            {decks.map(deck => (
              <div 
                key={deck.id} 
                className="deck-card"
                onClick={() => handleDeckClick(deck)}
              >
                <h3>{deck.title}</h3>
                <p className="deck-subject">{deck.subject}</p>
                <div className="deck-stats">
                  <span>{getDeckCardCount(deck.id)} cards</span>
                </div>
                <div className="deck-actions" style={{position: 'static', marginTop: '24px', display: 'flex', gap: '0.5rem', justifyContent: 'flex-end'}}>
                  <button 
                    className="action-button"
                    onClick={e => { e.stopPropagation(); startReviewSession(deck); }}
                  >
                    Start Session
                  </button>
                  <button 
                    className="action-button delete"
                    onClick={e => { e.stopPropagation(); deleteDeck(deck.id); }}
                  >
                    <FiTrash2 />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderReviewCardsContent = () => {
    const upcomingCards = cards.filter(card => {
      return isBackendDateTimeUpcoming(card.scheduled_date);
    }).sort((a, b) => {
      const localA = convertBackendDateToLocal(a.scheduled_date);
      const localB = convertBackendDateToLocal(b.scheduled_date);
      return new Date(localA) - new Date(localB);
    });

    const { overdue, dueNow, laterToday, upcoming } = getCardsByStatus();

    return (
      <div className="review-cards-content">
            <div className="upcoming-reviews-widget">
              <h2>Upcoming Reviews</h2>
              <div className="upcoming-cards">
            {upcomingCards.slice(0, 3).map(card => {
              const deck = decks.find(d => d.id === card.card_deck || d.id === card.deck);
              return (
                <div 
                  key={card.id} 
                  className="review-card"
                  onClick={() => startReviewSession(deck)}
                >
                    <div className="card-header">
                    <span className="deck-name">{deck?.title || 'Unknown Deck'}</span>
                      <FiClock className="clock-icon" />
                    </div>
                    <div className="card-content">
                      <p className="card-question">{card.question}</p>
                      <span className="review-date">
                      Due: {formatDateTimeForDisplay(card.scheduled_date)}
                      </span>
                    </div>
                  </div>
              );
            })}
            {upcomingCards.length === 0 && (
              <div className="no-upcoming-cards">
                No upcoming reviews
              </div>
            )}
          </div>
        </div>

        <div className="cards-sections">
          <div className="cards-section overdue">
            <div className="section-header">
              <FiAlertCircle className="section-icon" />
              <h2>Overdue</h2>
              <span className="card-count">{overdue.length}</span>
            </div>
            <div className="cards-container">
              {overdue.slice(0, 3).map(card => (
                <div key={card.id} className="study-card overdue">
                  <div className="card-content">
                    <h3>{card.question}</h3>
                    <p>{card.answer}</p>
                    <span className="due-date">
                      Due at {formatDateTimeForDisplay(card.scheduled_date)}
                    </span>
                  </div>
                </div>
              ))}
              {overdue.length > 3 && (
                <div className="view-more">
                  <button>View {overdue.length - 3} more cards</button>
                </div>
              )}
            </div>
          </div>

          <div className="cards-section due-now">
            <div className="section-header">
              <FiClock className="section-icon" />
              <h2>Due Now (next hour)</h2>
              <span className="card-count">{dueNow.length}</span>
            </div>
            <div className="cards-container">
              {dueNow.slice(0, 3).map(card => (
                <div key={card.id} className="study-card due-now">
                  <div className="card-content">
                    <h3>{card.question}</h3>
                    <p>{card.answer}</p>
                    <span className="due-date">
                      Due {getTimeDifference(card.scheduled_date)}
                    </span>
                  </div>
                </div>
              ))}
              {dueNow.length > 3 && (
                <div className="view-more">
                  <button>View {dueNow.length - 3} more cards</button>
                </div>
              )}
            </div>
          </div>

          <div className="cards-section later-today">
            <div className="section-header">
              <FiCalendar className="section-icon" />
              <h2>Later Today</h2>
              <span className="card-count">{laterToday.length}</span>
            </div>
            <div className="cards-container">
              {laterToday.slice(0, 3).map(card => (
                <div key={card.id} className="study-card later-today">
                  <div className="card-content">
                    <h3>{card.question}</h3>
                    <p>{card.answer}</p>
                    <span className="due-date">
                      Scheduled at {formatDateTimeForDisplay(card.scheduled_date)}
                    </span>
                  </div>
                </div>
              ))}
              {laterToday.length > 3 && (
                <div className="view-more">
                  <button>View {laterToday.length - 3} more cards</button>
                </div>
              )}
            </div>
          </div>

          <div className="cards-section upcoming">
            <div className="section-header">
              <FiBell className="section-icon" />
              <h2>Upcoming</h2>
              <span className="card-count">{upcoming.length}</span>
            </div>
            <div className="cards-container">
              {upcoming.slice(0, 3).map(card => (
                <div key={card.id} className="study-card upcoming">
                  <div className="card-content">
                    <h3>{card.question}</h3>
                    <p>{card.answer}</p>
                    <span className="due-date">
                      Scheduled for {formatDateTimeForDisplay(card.scheduled_date)}
                    </span>
                  </div>
                </div>
              ))}
              {upcoming.length > 3 && (
                <div className="view-more">
                  <button>View {upcoming.length - 3} more cards</button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Always show rating options, dark background, colored underline
  function renderReviewModal() {
    if (!reviewCards.length) return null;
    const currentCard = reviewCards[currentReviewCardIndex];
    return ReactDOM.createPortal(
      <div className="review-modal-overlay">
        <div className="review-modal">
          {/* If session is complete, show only the session complete content */}
          {sessionComplete ? (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%',
              minHeight: 400,
              textAlign: 'center',
              padding: '48px 0'
            }}>
              <h2 style={{color: '#4CAF50', marginBottom: 16}}>Session Complete!</h2>
              <p style={{color: '#fff', marginBottom: 32}}>You've finished reviewing all cards in this session.</p>
              <button 
                onClick={handleGoHome}
                style={{
                  background: '#4CAF50',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 8,
                  padding: '16px 32px',
                  fontWeight: 600,
                  fontSize: 18,
                  cursor: 'pointer'
                }}
              >
                Go Home
              </button>
            </div>
          ) : (
            <>
              {/* Header with Deck Info, Progress, and Timer */}
              <div className="review-header" style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                <div className="deck-title" style={{fontWeight: 600, fontSize: '1.2rem', color: '#fff', display: 'flex', alignItems: 'center', gap: 8}}>
                  <FiBook className="deck-icon" />
                  {selectedDeck ? selectedDeck.title : 'Review Session'}
                </div>
                <div className="progress-bar">
                  <div className="progress-fill" style={{width: `${((currentReviewCardIndex + 1) / reviewCards.length) * 100}%`}} />
                </div>
                <div className="timer" style={{color: '#fff', fontWeight: 500, fontSize: '1rem', display: 'flex', alignItems: 'center', gap: 4}}>
                  <FiClock /> {formatTime(timer)}
                </div>
              </div>
              <div className="progress-text" style={{textAlign: 'center', color: '#fff', margin: '12px 0 16px 0', fontWeight: 500}}>
                Card {currentReviewCardIndex + 1} of {reviewCards.length}
              </div>

              {/* Card Viewer */}
              <div className="card-viewer" style={{margin: '32px 0'}}>
                <div className={`card ${isFlipped ? 'flipped' : ''}`} onClick={() => setIsFlipped((prev) => !prev)}>
                  <div className="card-inner">
                    <div className="card-front">{currentCard.question}</div>
                    <div className="card-back">{currentCard.answer}</div>
                  </div>
                </div>
              </div>
              <div className="flip-hint" style={{textAlign: 'center', color: '#aaa', marginTop: 8, fontSize: 14}}>
                Click or press Space to flip
              </div>

              {/* Rating Options - Always visible, dark background, colored underline */}
              <div className="rating-options" style={{
                margin: '20px auto',
                maxWidth: '800px',
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '8px',
                padding: '0 16px'
              }}>
                {[5,4,3,2,1,0].map((val, idx) => (
                  <button
                    key={val}
                    className={`rating-btn rating-${val}`}
                    onClick={() => handleRatingSelect(val)}
                    style={{
                      background: '#222',
                      color: '#fff',
                      border: '1px solid #444',
                      borderRadius: 8,
                      padding: '12px',
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      minHeight: '80px',
                      boxShadow: '0 1px 4px rgba(0,0,0,0.10)',
                      position: 'relative',
                      fontWeight: 500
                    }}
                  >
                    <div className="rating-value" style={{fontSize: '1.5rem', fontWeight: 'bold'}}>{val}</div>
                    <div className="rating-label">
                      {val === 5 && 'Perfect Recall'}
                      {val === 4 && 'Correct with Hesitation'}
                      {val === 3 && 'Correct with Difficulty'}
                      {val === 2 && 'Incorrect but Familiar'}
                      {val === 1 && 'Incorrect and Unfamiliar'}
                      {val === 0 && 'Complete Blackout'}
                    </div>
                    <div style={{
                      width: '80%',
                      height: 5,
                      background: ratingColors[val],
                      borderRadius: 3,
                      marginTop: 8
                    }} />
                  </button>
                ))}
              </div>
              <div className="rating-hint" style={{textAlign: 'center', color: '#aaa', marginTop: 8, fontSize: 14}}>
                Press number keys 0-5 to rate quickly
              </div>

              {/* Session Controls */}
              <div className="session-controls" style={{display: 'flex', justifyContent: 'center', gap: 16, marginTop: 16}}>
                <button className="control-btn" style={{background: '#333', color: '#fff', border: 'none', borderRadius: 8, padding: '10px 20px', fontWeight: 500, fontSize: 15, display: 'flex', alignItems: 'center', gap: 8}} onClick={handleShuffle}><FiShuffle /> Shuffle</button>
                <button className="control-btn" style={{background: '#333', color: '#fff', border: 'none', borderRadius: 8, padding: '10px 20px', fontWeight: 500, fontSize: 15, display: 'flex', alignItems: 'center', gap: 8}} onClick={handlePause}>{isPaused ? <FiPlay /> : <FiPause />} {isPaused ? 'Resume' : 'Pause'}</button>
                <button className="control-btn" style={{background: '#222', color: '#fff', border: 'none', borderRadius: 8, padding: '10px 20px', fontWeight: 500, fontSize: 15, display: 'flex', alignItems: 'center', gap: 8}} onClick={handleCloseReviewModal}><FiArrowLeft /> End Session</button>
              </div>
            </>
          )}
        </div>
      </div>,
      document.body
    );
  }

  // Open edit modal with card data
  const openEditCardModal = (card) => {
    setEditCardData({
      id: card.id,
      question: card.question,
      answer: card.answer,
      scheduled_date: card.scheduled_date || ''
    });
    setEditCardModal(true);
  };

  // Handle edit form changes
  const handleEditCardChange = (e) => {
    const { name, value } = e.target;
    setEditCardData(prev => ({ ...prev, [name]: value }));
  };

  // Submit edit
  const handleEditCardSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('flashcards/cards/', {
        question: editCardData.question,
        answer: editCardData.answer,
        deck_id: selectedDeck.id,
        scheduled_date: editCardData.scheduled_date,
        card_id: editCardData.id // backend should use this to update if exists
      });
      setEditCardModal(false);
      setEditCardData({ id: null, question: '', answer: '', scheduled_date: '' });
      fetchCards();
      showNotificationMessage('Card updated successfully');
    } catch (error) {
      console.error('Error updating card:', error);
      showNotificationMessage('Failed to update card. Please try again.');
    }
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  return (
    <div className="study-room">
      {showConfetti && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          pointerEvents: 'none',
          zIndex: 999999,
          opacity: confettiOpacity,
          transition: 'opacity 0.5s',
          transform: 'translateY(-100%)',
          animation: 'dropConfetti 0.5s forwards'
        }}>
          <Confetti
            width={window.innerWidth}
            height={window.innerHeight}
            numberOfPieces={200}
            gravity={0.3}
            initialVelocityY={10}
          />
        </div>
      )}
      {renderModals()}
      {viewMode !== 'deck-details' && (
        <>
          <div className="study-room-header">
            <div className="header-left">
              <div className="streak-container">
                <div className="streak-count">
                  <span className="streak-number">{streak}</span>
                  <span className="streak-label">Day Streak</span>
                </div>
                <div className="streak-progress">
                  <div className="streak-progress-bar" style={{ width: `${(streak % 7) * 14.28}%` }}></div>
                </div>
              </div>
              <div className="view-controls">
                <button 
                  className={`view-toggle-btn ${viewMode === 'cards' ? 'active' : ''}`}
                  onClick={() => setViewMode('cards')}
                >
                  <FiList /> Review Cards
                </button>
                <button 
                  className={`view-toggle-btn ${viewMode === 'decks' ? 'active' : ''}`}
                  onClick={() => setViewMode('decks')}
                >
                  <FiGrid /> My Flashcards
                </button>
              </div>
            </div>
            <div className="header-right">
              <button 
                className="settings-button"
                onClick={() => setShowSettings(!showSettings)}
              >
                <FiSettings />
              </button>
            </div>
          </div>
        </>
      )}
      {viewMode === 'deck-details' && selectedDeck
        ? renderDeckDetails()
        : (
          <>
            {viewMode === 'decks' && renderMyFlashcardsContent()}
            {viewMode === 'cards' && renderReviewCardsContent()}
          </>
      )}
    </div>
  );
};

export default ReviewCards; 