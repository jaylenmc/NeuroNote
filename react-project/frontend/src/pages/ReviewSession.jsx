import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FiClock, FiShuffle, FiPause, FiPlay, FiArrowLeft, FiSkipForward, FiCheck, FiX, FiRotateCcw } from 'react-icons/fi';
import CardsToQuiz from '../components/CardsToQuiz';
import api from '../api/axios';
import { jwtDecode } from 'jwt-decode';
import { isBackendDateTimeOverdue, isBackendDateTimeDueNow, isBackendDateTimeDueSoon } from '../utils/dateUtils';
import './ReviewSession.css';

function isTokenExpired(token) {
  if (!token) return true;
  try {
    const { exp } = jwtDecode(token);
    if (!exp) return true;
    return Date.now() >= exp * 1000;
  } catch {
    return true;
  }
}

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
  
  // State for selected deck (from URL state or query params)
  const [selectedDeck, setSelectedDeck] = useState(null);
  
  // State for quiz feature
  const [showQuiz, setShowQuiz] = useState(false);
  const [reviewedCardsForQuiz, setReviewedCardsForQuiz] = useState([]);
  const [includeDueSoon, setIncludeDueSoon] = useState(false);
  
  // State to track card ratings
  const [cardRatings, setCardRatings] = useState({});

  // Color map for underlines
  const ratingColors = [
    '#9E9E9E', // 0 - Blackout
    '#F44336', // 1 - Unfamiliar
    '#FF9800', // 2 - Familiar
    '#FFC107', // 3 - Difficulty
    '#8BC34A', // 4 - Hesitation
    '#4CAF50', // 5 - Perfect
  ];

  // Helper function to fetch deck details
  const fetchDeckDetails = async (deckId, token) => {
    try {
      const response = await api.get(`/flashcards/deck/${deckId}/`);
      if (response.status === 200) {
        const deckData = response.data;

        return deckData;
      }
    } catch (err) {
      
    }
    return null;
  };

  // Helper function to refresh token
  const refreshToken = async () => {
    try {
      const refresh = sessionStorage.getItem('refresh_token');
      if (!refresh) {
        throw new Error('No refresh token available');
      }
      
      const response = await api.post('/auth/token/refresh/', { refresh });
      sessionStorage.setItem('jwt_token', response.data.access);
      return true;
    } catch (error) {
      
      return false;
    }
  };

  // Proactive token check and refresh before anything else
  useEffect(() => {
    const checkAndRefreshToken = async () => {
      const access = sessionStorage.getItem('jwt_token');
      const refresh = sessionStorage.getItem('refresh_token');
      
      if (!access && !refresh) {
        navigate('/signin');
        return;
      }
      
      if (isTokenExpired(access) && refresh) {
        const success = await refreshToken();
        if (!success) {
          sessionStorage.removeItem('jwt_token');
          sessionStorage.removeItem('refresh_token');
          navigate('/signin');
        }
      } else if (isTokenExpired(access)) {
        navigate('/signin');
      }
    };
    checkAndRefreshToken();
  }, [navigate]);

  // Initialize review session
  useEffect(() => {
    const initializeReviewSession = async () => {
      try {
        setLoading(true);

        
        // Get selected deck from location state or query params
        const deckFromState = location.state?.selectedDeck;
        const deckFromQuery = new URLSearchParams(location.search).get('deck');
        const includeDueSoonFromState = location.state?.includeDueSoon || false;
        
        setIncludeDueSoon(includeDueSoonFromState);
        
        let deckToUse = null;
        
        if (deckFromState) {
  
          setSelectedDeck(deckFromState);
          deckToUse = deckFromState;
        } else if (deckFromQuery) {
          // If deck ID is passed via query param, fetch deck details
          try {
            const token = sessionStorage.getItem('jwt_token');
            const deckData = await fetchDeckDetails(deckFromQuery, token);
            if (deckData) {
      
              setSelectedDeck(deckData);
              deckToUse = deckData;
            }
          } catch (err) {
            
          }
        } else {
  
        }
        
        const token = sessionStorage.getItem('jwt_token');
        if (!token) {
          setError('Please log in to start a review session');
          navigate('/signin');
          return;
        }
        
        // Fetch cards with the deck information


        const cards = await fetchReviewCards(token, deckToUse, includeDueSoonFromState);
        
        
        if (!cards || cards.length === 0) {
  
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
        
        setError(err.message);
        setLoading(false);
      }
    };
    initializeReviewSession();
  }, [navigate, location.state, location.search]);

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
      // Don't handle keyboard shortcuts when quiz is shown
      if (showQuiz) {
        return;
      }
      if (e.code === 'Space' || e.key === ' ') {
        e.preventDefault();
        setIsFlipped((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showQuiz]);

  useEffect(() => {
    const handleKeyPress = (e) => {
      // Don't handle keyboard shortcuts when quiz is shown
      if (showQuiz) {
        return;
      }
      const rating = parseInt(e.key);
      if (rating >= 0 && rating <= 5) {
        handleRatingSelect(rating);
      }
    };
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [showQuiz]);

  const fetchReviewCards = async (token, deckToUse = null, includeDueSoonParam = null) => {
    try {
      const deckId = deckToUse?.id || selectedDeck?.id;
      const shouldIncludeDueSoon = includeDueSoonParam !== null ? includeDueSoonParam : includeDueSoon;
      
      if (!deckId) {


        // Use the new backend endpoint that handles due cards across all decks
        const params = shouldIncludeDueSoon ? { due_soon: 'true' } : {};

        
        try {
          const response = await api.get('/flashcards/cards/due/', { params });
          
          if (response.data && response.data.length > 0) {
    
            // Shuffle the cards for random review order
            return response.data.sort(() => Math.random() - 0.5);
          } else {
    
            return [];
          }
        } catch (error) {
          
          
          // If it's a 401 error, try to refresh token and retry
          if (error.response?.status === 401) {
            const refreshSuccess = await refreshToken();
            if (refreshSuccess) {
              try {
                const retryResponse = await api.get('/flashcards/cards/due/', { params });
                
                if (retryResponse.data && retryResponse.data.length > 0) {
          
                  return retryResponse.data.sort(() => Math.random() - 0.5);
                } else {
          
                  return [];
                }
              } catch (retryError) {
                
              }
            }
          }
          
          return [];
        }
      }

      // For specific deck, we need to fetch all cards and filter them based on includeDueSoon
      const response = await api.get(`/flashcards/cards/${deckId}/`);
      const allCards = response.data;

      if (!allCards || allCards.length === 0) {

        return [];
      }

      // Filter cards based on due status
      const dueCards = allCards.filter(card => {
        if (!card.scheduled_date) return true; // Unscheduled cards are always due
        
        const isOverdue = isBackendDateTimeOverdue(card.scheduled_date);
        const isDueNow = isBackendDateTimeDueNow(card.scheduled_date);
        const isDueSoon = isBackendDateTimeDueSoon(card.scheduled_date);
        
        if (isOverdue || isDueNow) return true;
        if (shouldIncludeDueSoon && isDueSoon) return true;
        
        return false;
      });


      if (!dueCards || dueCards.length === 0) {

        return [];
      }

      // Shuffle the cards for random review order
      const shuffledCards = dueCards.sort(() => Math.random() - 0.5);
      return shuffledCards;
    } catch (error) {
      
      
      // If it's a 401 error, try to refresh token and retry
      if (error.response?.status === 401) {
        const refreshSuccess = await refreshToken();
        if (refreshSuccess) {
          try {
            const deckId = deckToUse?.id || selectedDeck?.id;
            if (!deckId) {
              // Retry fetching all due cards using the new endpoint
              const params = shouldIncludeDueSoon ? { due_soon: 'true' } : {};
              try {
                const response = await api.get('/flashcards/cards/due/', { params });
                
                if (response.data && response.data.length > 0) {
                  return response.data.sort(() => Math.random() - 0.5);
                } else {
                  return [];
                }
              } catch (retryError) {
                
                return [];
              }
            }
            
            // Retry fetching all cards for specific deck
            const response = await api.get(`/flashcards/cards/${deckId}/`);
            const allCards = response.data;
            
            if (!allCards || allCards.length === 0) {
              return [];
            }
            
            const dueCards = allCards.filter(card => {
              if (!card.scheduled_date) return true;
              
              const isOverdue = isBackendDateTimeOverdue(card.scheduled_date);
              const isDueNow = isBackendDateTimeDueNow(card.scheduled_date);
              const isDueSoon = isBackendDateTimeDueSoon(card.scheduled_date);
              
              if (isOverdue || isDueNow) return true;
              if (shouldIncludeDueSoon && isDueSoon) return true;
              
              return false;
            });
            
            if (!dueCards || dueCards.length === 0) {
              return [];
            }
            
            return dueCards.sort(() => Math.random() - 0.5);
          } catch (retryError) {
            
          }
        }
      }
      
      return [];
    }
  };

  const handleRatingSelect = async (rating) => {
    if (!reviewCards[currentReviewCardIndex] || sessionComplete) return;

    const currentCard = reviewCards[currentReviewCardIndex];
    
    try {
      // Use the card's deck ID instead of selectedDeck.id
      const deckId = selectedDeck?.id || currentCard.card_deck;
      
      const response = await api.put('/flashcards/review/', {
        card_id: currentCard.id,
        quality: rating,
        deck_id: deckId
      });

      if (response.status === 200) {
        // Update the card with new review data
        const updatedCard = response.data;
        setReviewCards(prev => 
          prev.map(card => 
            card.id === currentCard.id ? { ...card, ...updatedCard } : card
          )
        );
        
        // Update the cardRatings state to track ratings for quiz
        setCardRatings(prev => ({
          ...prev,
          [currentCard.id]: rating
        }));
        

      }
    } catch (error) {
      
      // If it's a 401 error, try to refresh the token
      if (error.response?.status === 401) {
        try {
          const refresh = sessionStorage.getItem('refresh_token');
          if (refresh) {
            const refreshResponse = await api.post('/auth/token/refresh/', { refresh });
            sessionStorage.setItem('jwt_token', refreshResponse.data.access);
            // Retry the rating submission
            const deckId = selectedDeck?.id || currentCard.card_deck;
            const retryResponse = await api.put('/flashcards/review/', {
              card_id: currentCard.id,
              quality: rating,
              deck_id: deckId
            });
            
            if (retryResponse.status === 200) {
              const updatedCard = retryResponse.data;
              setReviewCards(prev => 
                prev.map(card => 
                  card.id === currentCard.id ? { ...card, ...updatedCard } : card
                )
              );
              
              setCardRatings(prev => ({
                ...prev,
                [currentCard.id]: rating
              }));
              
      
            }
          } else {
            setError('Session expired. Please log in again.');
            setTimeout(() => navigate('/signin'), 2000);
            return;
          }
        } catch (refreshError) {
          
          setError('Session expired. Please log in again.');
          setTimeout(() => navigate('/signin'), 2000);
          return;
        }
      }
    }

    // Move to next card
    handleNextReviewCard();
  };

  const handleNextReviewCard = async () => {
    if (currentReviewCardIndex < reviewCards.length - 1) {
      setCurrentReviewCardIndex(currentReviewCardIndex + 1);
      setIsFlipped(false);
    } else {
      // Session is complete - the backend has already updated the scheduled_date
      // through the update_sm21 method when each card was rated
      setSessionComplete(true);
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

  const handleTakeQuiz = () => {
    // Filter cards to only include those that have been reviewed with ratings > 0
    const reviewedCardsWithRatings = reviewCards.filter(card => {
      const rating = cardRatings[card.id];
      return rating && rating > 0;
    });
    
    // Only proceed if we have cards to quiz
    if (reviewedCardsWithRatings.length === 0) {
      setError('No cards with ratings higher than 0 available for quiz. Please review some cards first.');
      return;
    }
    
    setReviewedCardsForQuiz(reviewedCardsWithRatings);
    setShowQuiz(true);
  };

  const handleBackFromQuiz = () => {
    setShowQuiz(false);
    setReviewedCardsForQuiz([]);
    navigate('/study-room');
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
        <button onClick={handleEndSession}>Back to Study Room</button>
      </div>
    );
  }

  const currentCard = reviewCards[currentReviewCardIndex];

  return (
    <div className="review-session">
      {showQuiz ? (
        <CardsToQuiz 
          reviewedCards={reviewedCardsForQuiz} 
          onBack={handleBackFromQuiz}
        />
      ) : sessionComplete ? (
        <div className="session-complete">
          <div className="complete-content">
            <h2>Session Complete!</h2>
            <p>
              {selectedDeck 
                ? `You've finished reviewing all cards in the ${selectedDeck.title} deck.`
                : "You've finished reviewing all cards in this session."
              }
            </p>
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
            <div className="session-actions">
              <button className="end-session-btn" onClick={handleEndSession}>
                <FiArrowLeft /> Back to Study Room
              </button>
              <button 
                className="take-quiz-btn" 
                onClick={handleTakeQuiz}
                disabled={Object.keys(cardRatings).filter(id => cardRatings[id] > 0).length === 0}
              >
                Take Quiz ({Object.keys(cardRatings).filter(id => cardRatings[id] > 0).length} cards)
              </button>
            </div>
          </div>
        </div>
      ) : (
        <>
          {/* Header with Progress and Timer */}
          <div className="review-header">
            <div className="header-left">
              <button className="end-session-btn" onClick={handleEndSession}>
                <FiArrowLeft /> Back to Study Room
              </button>
            </div>
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
                onClick={() => {
          
                  handleRatingSelect(rating);
                }}
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