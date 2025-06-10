import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiAlertCircle, FiClock, FiCalendar, FiStar, FiBook, FiAlertTriangle, FiShuffle, FiPause, FiPlay, FiArrowLeft } from 'react-icons/fi';
import ReactDOM from 'react-dom';
import './ReviewWidget.css';

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
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewCards, setReviewCards] = useState([]);
  const [currentReviewCardIndex, setCurrentReviewCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [showAnswer, setShowAnswer] = useState(false);
  const [userAnswer, setUserAnswer] = useState('');
  const [selectedDeck, setSelectedDeck] = useState(null);
  const [sessionComplete, setSessionComplete] = useState(false);
  const [timer, setTimer] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [confettiOpacity, setConfettiOpacity] = useState(0);
  const [pendingRatings, setPendingRatings] = useState([]);
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
    if (showReviewModal) {
      const handleKeyPress = (e) => {
        const rating = parseInt(e.key);
        if (rating >= 0 && rating <= 5) {
          handleRatingSelect(rating);
        }
      };
      window.addEventListener('keydown', handleKeyPress);
      return () => window.removeEventListener('keydown', handleKeyPress);
    }
  }, [showReviewModal]);

  const fetchCards = async () => {
    try {
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
          return;
        }
        throw new Error('Failed to fetch decks');
      }

      const decks = await decksResponse.json();
      console.log('Fetched decks:', decks);
      setLoading(false);

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

    setShowReviewModal(true);
    setReviewCards(dueCards);
    setCurrentReviewCardIndex(0);
    setIsFlipped(false);
    setShowAnswer(false);
    setUserAnswer('');
    setSelectedDeck(null);
    setSessionComplete(false);
    setTimer(0);
    setIsPaused(false);
    setShowConfetti(false);
    setConfettiOpacity(0);
    setPendingRatings([]);
  };

  const handleRatingSelect = async (rating) => {
    const currentCard = reviewCards[currentReviewCardIndex];
    try {
      const token = sessionStorage.getItem('jwt_token');
      if (!token) {
        setError('Please log in to review cards');
        return;
      }

      const response = await fetch('http://localhost:8000/api/flashcards/review/', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
          deck_id: currentCard.card_deck,
          card_id: currentCard.id,
          quality: rating
        })
      });

      if (!response.ok) {
        throw new Error('Failed to update card review');
      }

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
    } catch (err) {
      console.error('Error updating card review:', err);
      setError('Failed to update card review. Please try again.');
    }
  };

  const handleNextReviewCard = async () => {
    if (currentReviewCardIndex < reviewCards.length - 1) {
      setCurrentReviewCardIndex(currentReviewCardIndex + 1);
      setIsFlipped(false);
      setShowAnswer(false);
      setUserAnswer('');
    } else {
      // Update last review date for all cards in the session
      try {
        const token = sessionStorage.getItem('jwt_token');
        if (!token) {
          setError('Please log in to update cards');
          return;
        }

        const today = new Date().toISOString().split('T')[0];
        const updateData = reviewCards.map(card => ({
          deck_id: card.card_deck,
          card_id: card.id,
          last_review_Date: today
        }));

        const response = await fetch('http://localhost:8000/api/flashcards/cards/update/', {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          credentials: 'include',
          body: JSON.stringify({
            update_ids: updateData
          })
        });

        if (!response.ok) {
          throw new Error('Failed to update cards');
        }
        
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
        fetchCards(); // Refresh the cards list
      } catch (err) {
        console.error('Error updating cards:', err);
        setError('Failed to update cards. Please try again.');
      }
    }
  };

  const handleShuffle = () => {
    setReviewCards((prev) => [...prev].sort(() => Math.random() - 0.5));
    setCurrentReviewCardIndex(0);
  };

  const handlePause = () => {
    setIsPaused((prev) => !prev);
  };

  const handleCloseReviewModal = () => {
    setShowReviewModal(false);
    setReviewCards([]);
    setCurrentReviewCardIndex(0);
    setIsFlipped(false);
    setShowAnswer(false);
    setUserAnswer('');
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const renderReviewModal = () => {
    if (!reviewCards.length) return null;
    const currentCard = reviewCards[currentReviewCardIndex];
    return ReactDOM.createPortal(
      <div className="review-modal-overlay">
        <div className="review-modal">
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
                onClick={handleCloseReviewModal}
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
              <div className="review-header" style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                <div className="deck-title" style={{fontWeight: 600, fontSize: '1.2rem', color: '#fff', display: 'flex', alignItems: 'center', gap: 8}}>
                  <FiBook className="deck-icon" />
                  Review Session
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

              <div className="rating-options" style={{
                margin: '20px auto',
                maxWidth: '800px',
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '8px',
                padding: '0 16px'
              }}>
                {[5,4,3,2,1,0].map((val) => (
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
        <div className="loading">Loading decks...</div>
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
        {cards[activeTab].map((card, index) => (
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
        ))}
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
      {showReviewModal && renderReviewModal()}
      {renderCreateCardModal()}
      {showEditDeck && renderEditDeckModal()}
      {showEditCard && renderEditCardModal()}
    </div>
  );
};

export default ReviewWidget; 