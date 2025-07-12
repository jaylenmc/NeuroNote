import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiArrowLeft } from 'react-icons/fi';
import { FaBrain } from 'react-icons/fa';
import ReviewWidget from '../components/ReviewWidget';
import DeckDropdown from '../components/DeckDropdown';
import api from '../api/axios';
import './ReviewPage.css';
import { useAuth } from '../auth/AuthContext';

const motivationalQuotes = [
  "Let’s sharpen your memory.",
  "Time to master your decks.",
  "🧠 Boosting recall one card at a time.",
  "Stay consistent, see results!",
  "Review now, remember forever."
];

const ReviewPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  // Deck dropdown state
  const [decks, setDecks] = useState([]);
  const [selectedDeckId, setSelectedDeckId] = useState(null);
  const [showDeckDropdown, setShowDeckDropdown] = useState(false);
  const [loading, setLoading] = useState(true);
  const [quoteIdx, setQuoteIdx] = useState(0);
  const userName = user?.email ? user.email.split('@')[0] : 'User';

  useEffect(() => {
    const fetchDecks = async () => {
      try {
        const decksResponse = await api.get('/flashcards/deck/');
        let decks = [];
        if (decksResponse.data && Array.isArray(decksResponse.data)) {
          decks = decksResponse.data;
        } else if (decksResponse.data && Array.isArray(decksResponse.data.decks)) {
          decks = decksResponse.data.decks;
        } else if (decksResponse.data && decksResponse.data.results) {
          decks = decksResponse.data.results;
        }
        setDecks(decks);
        setLoading(false);
      } catch (err) {
        setLoading(false);
      }
    };
    fetchDecks();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setQuoteIdx(idx => (idx + 1) % motivationalQuotes.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="review-page">
      <div className="review-header enhanced-review-header">
        <button className="back-button" onClick={() => navigate('/study-room')}>
          <FiArrowLeft /> Back to Study Room
        </button>
        <div className="review-header-right">
          <DeckDropdown
            decks={decks}
            selectedDeckId={selectedDeckId}
            setSelectedDeckId={setSelectedDeckId}
            showDeckDropdown={showDeckDropdown}
            setShowDeckDropdown={setShowDeckDropdown}
          />
        </div>
      </div>
      <div className="review-session-title-block enhanced-title-block">
        <div className="review-greeting">Welcome back, {userName} <span className="wave">👋</span></div>
        <h2 className="review-session-title gradient-title">
          <FaBrain className="brain-icon" /> Review Session
        </h2>
        <p className="review-session-subtitle dynamic-quote">{motivationalQuotes[quoteIdx]}</p>
      </div>
      <div className="review-content">
        <ReviewWidget 
          decks={decks}
          selectedDeckId={selectedDeckId}
          setSelectedDeckId={setSelectedDeckId}
        />
      </div>
    </div>
  );
};

export default ReviewPage; 