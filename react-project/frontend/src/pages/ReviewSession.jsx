import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FiClock, FiShuffle, FiPause, FiPlay, FiArrowLeft, FiSkipForward } from 'react-icons/fi';
import './ReviewSession.css';

const ReviewSession = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // State for review session
  const [reviewCards, setReviewCards] = useState([]);
  const [currentReviewCardIndex, setCurrentReviewCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [sessionComplete, setSessionComplete] = useState(false);
  const [timer, setTimer] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Color map for underlines
  const ratingColors = [
    '#9E9E9E', // 0 - Blackout
    '#F44336', // 1 - Unfamiliar
    '#FF9800', // 2 - Familiar
    '#FFC107', // 3 - Difficulty
    '#8BC34A', // 4 - Hesitation
    '#4CAF50', // 5 - Perfect
  ];

  // Initialize review session
  useEffect(() => {
    const initializeReviewSession = async () => {
      try {
        setLoading(true);
        const token = sessionStorage.getItem('jwt_token');
        if (!token) {
          setError('Please log in to start a review session');
          navigate('/signin');
          return;
        }

        // Fetch all cards for review
        const cards = await fetchReviewCards(token);
        if (cards.length === 0) {
          setError('No cards for review today');
          setTimeout(() => navigate('/study-room'), 2000);
          return;
        }

        setReviewCards(cards);
        setCurrentReviewCardIndex(0);
        setIsFlipped(false);
        setSessionComplete(false);
        setTimer(0);
        setIsPaused(false);
        setLoading(false);
      } catch (err) {
        console.error('Error initializing review session:', err);
        setError(err.message);
        setLoading(false);
      }
    };

    initializeReviewSession();
  }, [navigate]);

  // Timer effect
  useEffect(() => {
    let interval;
    if (!loading && !sessionComplete && !isPaused) {
      interval = setInterval(() => {
        setTimer((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [loading, sessionComplete, isPaused]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.code === 'Space' || e.key === ' ') {
        e.preventDefault();
        setIsFlipped((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    const handleKeyPress = (e) => {
      const rating = parseInt(e.key);
      if (rating >= 0 && rating <= 5) {
        handleRatingSelect(rating);
      }
    };
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  const fetchReviewCards = async (token) => {
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
        throw new Error('Session expired. Please log in again.');
      }
      throw new Error('Failed to fetch decks');
    }

    const data = await decksResponse.json();
    const decks = data.decks || [];

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
      allCards.push(...deckCards.map(card => ({ ...card, deckTitle: deck.title })));
    }

    // Sort cards into categories based on due date
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const dueCards = [];
    allCards.forEach(card => {
      if (!card.scheduled_date) {
        dueCards.push(card);
        return;
      }

      const dueDate = new Date(card.scheduled_date);
      const dueDateOnly = new Date(dueDate.getFullYear(), dueDate.getMonth(), dueDate.getDate());

      if (dueDateOnly <= today) {
        dueCards.push(card);
      }
    });

    return dueCards;
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
        
        setSessionComplete(true);
      } catch (err) {
        console.error('Error updating cards:', err);
        setError('Failed to update cards. Please try again.');
      }
    }
  };

  const handleShuffle = () => {
    setReviewCards((prev) => [...prev].sort(() => Math.random() - 0.5));
    setCurrentReviewCardIndex(0);
    setIsFlipped(false);
  };

  const handlePause = () => {
    setIsPaused((prev) => !prev);
  };

  const handleEndSession = () => {
    navigate('/review');
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="review-session-loading">
        <div className="loading-spinner"></div>
        <p>Loading review session...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="review-session-error">
        <h2>Error</h2>
        <p>{error}</p>
        <button onClick={() => navigate('/study-room')}>Back to Study Room</button>
      </div>
    );
  }

  if (!reviewCards.length) {
    return (
      <div className="review-session-empty">
        <h2>No Cards for Review</h2>
        <p>You don't have any cards due for review today.</p>
        <button onClick={() => navigate('/study-room')}>Back to Study Room</button>
      </div>
    );
  }

  const currentCard = reviewCards[currentReviewCardIndex];

  return (
    <div className="review-session">
      {sessionComplete ? (
        <div className="session-complete">
          <div className="complete-content">
            <h2>Session Complete!</h2>
            <p>You've finished reviewing all cards in this session.</p>
            <div className="session-stats">
              <div className="stat">
                <span className="stat-label">Cards Reviewed:</span>
                <span className="stat-value">{reviewCards.length}</span>
              </div>
              <div className="stat">
                <span className="stat-label">Time Spent:</span>
                <span className="stat-value">{formatTime(timer)}</span>
              </div>
            </div>
            <button className="end-session-btn" onClick={handleEndSession}>
              <FiArrowLeft /> Back to Study Room
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* Header with Progress and Timer */}
          <div className="review-header">
            <button className="end-session-btn" onClick={handleEndSession}>
              <FiArrowLeft /> End Session
            </button>
            <div className="progress-section">
              <div className="progress-bar">
                <div 
                  className="progress-fill" 
                  style={{width: `${((currentReviewCardIndex + 1) / reviewCards.length) * 100}%`}}
                />
              </div>
              <div className="progress-text">
                Card {currentReviewCardIndex + 1} of {reviewCards.length}
              </div>
            </div>
            <div className="timer-section">
              <div className="timer">
                <FiClock /> {formatTime(timer)}
                <button className="pause-btn" onClick={handlePause} title={isPaused ? 'Resume' : 'Pause'}>
                  {isPaused ? <FiPlay /> : <FiPause />}
                </button>
              </div>
            </div>
          </div>

          {/* Flashcard */}
          <div className="flashcard-container">
            <button className="shuffle-btn" onClick={handleShuffle} title="Shuffle Cards">
              <FiShuffle />
            </button>
            
            <div 
              className={`flashcard ${isFlipped ? 'flipped' : ''}`}
              onClick={() => setIsFlipped(!isFlipped)}
              tabIndex={0}
              onKeyDown={(e) => (e.key === ' ' || e.key === 'Enter') && setIsFlipped(!isFlipped)}
            >
              <div className="flashcard-inner">
                <div className="flashcard-front">
                  <h3>Question</h3>
                  <p>{currentCard.question}</p>
                </div>
                <div className="flashcard-back">
                  <h3>Answer</h3>
                  <p>{currentCard.answer}</p>
                </div>
              </div>
            </div>

            <button className="skip-btn" onClick={handleNextReviewCard} title="Skip Card">
              <FiSkipForward />
            </button>
          </div>

          <div className="flip-hint">
            Click or press Space to flip
          </div>

          {/* Rating Controls */}
          <div className="rating-controls">
            {[5, 4, 3, 2, 1, 0].map((rating) => (
              <button
                key={rating}
                className={`rating-btn rating-${rating}`}
                onClick={() => handleRatingSelect(rating)}
                style={{ borderBottomColor: ratingColors[rating] }}
              >
                <div className="rating-value">{rating}</div>
                <div className="rating-label">
                  {rating === 5 && 'Perfect Recall'}
                  {rating === 4 && 'Correct with Hesitation'}
                  {rating === 3 && 'Correct with Difficulty'}
                  {rating === 2 && 'Incorrect but Familiar'}
                  {rating === 1 && 'Incorrect and Unfamiliar'}
                  {rating === 0 && 'Complete Blackout'}
                </div>
              </button>
            ))}
          </div>

          <div className="rating-hint">
            Press number keys 0-5 to rate quickly
          </div>
        </>
      )}
    </div>
  );
};

export default ReviewSession; 