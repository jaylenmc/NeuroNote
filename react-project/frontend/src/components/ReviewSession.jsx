import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiCheck, FiX, FiClock } from 'react-icons/fi';
import './ReviewSession.css';

const ReviewSession = () => {
  const navigate = useNavigate();
  const [decks, setDecks] = useState([]);
  const [selectedDeck, setSelectedDeck] = useState(null);
  const [cards, setCards] = useState([]);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    correct: 0,
    incorrect: 0,
    remaining: 0
  });

  useEffect(() => {
    fetchDecks();
  }, []);

  const fetchDecks = async () => {
    try {
      const token = sessionStorage.getItem('jwt_token');
      if (!token) {
        setError('Please log in to view your decks');
        return;
      }

      const response = await fetch('http://localhost:8000/api/flashcards/deck/', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Failed to fetch decks');
      }

      const data = await response.json();
      setDecks(data);
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  const fetchCards = async (deckId) => {
    try {
      const token = sessionStorage.getItem('jwt_token');
      const response = await fetch(`http://localhost:8000/api/flashcards/cards/${deckId}/`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Failed to fetch cards');
      }

      const data = await response.json();
      setCards(data);
      setStats(prev => ({ ...prev, remaining: data.length }));
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDeckSelect = (deck) => {
    setSelectedDeck(deck);
    fetchCards(deck.id);
  };

  const handleResponse = (isCorrect) => {
    setStats(prev => ({
      ...prev,
      correct: isCorrect ? prev.correct + 1 : prev.correct,
      incorrect: !isCorrect ? prev.incorrect + 1 : prev.incorrect,
      remaining: prev.remaining - 1
    }));

    if (currentCardIndex < cards.length - 1) {
      setCurrentCardIndex(prev => prev + 1);
      setShowAnswer(false);
    } else {
      // Session complete
      navigate('/dashboard');
    }
  };

  if (loading) {
    return (
      <div className="review-session">
        <div className="loading">Loading decks...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="review-session">
        <div className="error">{error}</div>
      </div>
    );
  }

  if (!selectedDeck) {
    return (
      <div className="review-session">
        <div className="deck-selection">
          <h2>Select a Deck to Review</h2>
          <div className="deck-grid">
            {decks.map(deck => (
              <div
                key={deck.id}
                className="deck-card"
                onClick={() => handleDeckSelect(deck)}
              >
                <h3>{deck.title}</h3>
                <p>{deck.description}</p>
                <div className="deck-stats">
                  <span>{deck.card_count} cards</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const currentCard = cards[currentCardIndex];

  return (
    <div className="review-session">
      <div className="review-header">
        <button className="back-button" onClick={() => navigate('/dashboard')}>
          <FiArrowLeft /> Exit Review
        </button>
        <div className="session-stats">
          <div className="stat">
            <FiCheck className="correct" />
            <span>{stats.correct}</span>
          </div>
          <div className="stat">
            <FiX className="incorrect" />
            <span>{stats.incorrect}</span>
          </div>
          <div className="stat">
            <FiClock />
            <span>{stats.remaining} remaining</span>
          </div>
        </div>
      </div>

      <div className="card-container">
        <div className="card">
          <div className="card-content">
            <h3>{currentCard?.question}</h3>
            {showAnswer && (
              <div className="answer">
                <h4>Answer:</h4>
                <p>{currentCard?.answer}</p>
              </div>
            )}
          </div>
          <div className="card-actions">
            {!showAnswer ? (
              <button
                className="show-answer-button"
                onClick={() => setShowAnswer(true)}
              >
                Show Answer
              </button>
            ) : (
              <div className="response-buttons">
                <button
                  className="incorrect-button"
                  onClick={() => handleResponse(false)}
                >
                  <FiX /> Incorrect
                </button>
                <button
                  className="correct-button"
                  onClick={() => handleResponse(true)}
                >
                  <FiCheck /> Correct
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReviewSession; 