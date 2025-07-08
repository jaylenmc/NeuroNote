import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiArrowLeft } from 'react-icons/fi';
import ReviewWidget from '../components/ReviewWidget';
import DeckDropdown from '../components/DeckDropdown';
import api from '../api/axios';
import './ReviewPage.css';

const ReviewPage = () => {
  const navigate = useNavigate();
  // Deck dropdown state
  const [decks, setDecks] = useState([]);
  const [selectedDeckId, setSelectedDeckId] = useState(null);
  const [showDeckDropdown, setShowDeckDropdown] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchDecks = async () => {
    try {
      console.log('Fetching decks in ReviewPage...');
      const decksResponse = await api.get('/flashcards/deck/');
      console.log('Raw decks response:', decksResponse);
      
      // Handle different possible response structures
      let decks = [];
      if (decksResponse.data && Array.isArray(decksResponse.data)) {
        decks = decksResponse.data;
      } else if (decksResponse.data && Array.isArray(decksResponse.data.decks)) {
        decks = decksResponse.data.decks;
      } else if (decksResponse.data && decksResponse.data.results) {
        decks = decksResponse.data.results;
      }
      
      console.log('Processed decks in ReviewPage:', decks);
      setDecks(decks);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching decks in ReviewPage:', err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDecks();
  }, []);

  return (
    <div className="review-page">
      <div className="review-header">
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
      <div className="review-session-title-block">
        <h2 className="review-session-title">Review Session</h2>
        <p className="review-session-subtitle">Start a focused review session for your selected deck or all decks.</p>
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