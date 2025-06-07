import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiEdit2, FiTrash2, FiPlus, FiSearch, FiStar, FiClock, FiTag, FiArrowLeft } from 'react-icons/fi';
import './DeckContent.css';

const API_URL = import.meta.env.VITE_API_URL;

export default function DeckContent() {
  const { deckId } = useParams();
  const navigate = useNavigate();
  const [deck, setDeck] = useState(null);
  const [cards, setCards] = useState([]);
  const [search, setSearch] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [newCard, setNewCard] = useState({ question: '', answer: '' });
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(null);

  const jwt = sessionStorage.getItem('jwt_token');

  useEffect(() => {
    fetchDeck();
    fetchCards();
    // eslint-disable-next-line
  }, [deckId]);

  async function fetchDeck() {
    const res = await fetch(`${API_URL}flashcards/deck/`, {
      headers: { Authorization: `Bearer ${jwt}` }
    });
    const data = await res.json();
    setDeck(data.find(d => d.id === parseInt(deckId)));
  }

  async function fetchCards() {
    setLoading(true);
    const res = await fetch(`${API_URL}flashcards/cards/`, {
      headers: { Authorization: `Bearer ${jwt}` }
    });
    const data = await res.json();
    setCards(data.filter(card => card.card_deck === parseInt(deckId)));
    setLoading(false);
  }

  async function handleDeleteCard(cardId) {
    setDeleting(cardId);
    await fetch(`${API_URL}flashcards/cards/delete/${deckId}/${cardId}/`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${jwt}` }
    });
    setCards(cards => cards.filter(c => c.id !== cardId));
    setDeleting(null);
  }

  async function handleAddCard(e) {
    e.preventDefault();
    await fetch(`${API_URL}flashcards/cards/`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${jwt}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        question: newCard.question,
        answer: newCard.answer,
        deck_id: deckId
      })
    });
    setNewCard({ question: '', answer: '' });
    setShowAdd(false);
    fetchCards();
  }

  async function handleDeleteDeck() {
    if (!window.confirm('Are you sure you want to delete this deck?')) return;
    await fetch(`${API_URL}flashcards/deck/delete/${deckId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${jwt}` }
    });
    navigate('/study-room');
  }

  const filteredCards = cards.filter(card =>
    card.question.toLowerCase().includes(search.toLowerCase()) ||
    card.answer.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="deck-content-page">
      {/* Back Button */}
      <button className="deck-back-btn" onClick={() => navigate('/study-room')}><FiArrowLeft /> Back to Decks</button>
      {/* Deck Header */}
      <div className="deck-header">
        <span className="deck-emoji">📘</span>
        <div className="deck-header-info">
          <h1 className="deck-title">{deck?.title || 'Deck'}</h1>
          <div className="deck-subtitle">{cards.length} cards · Last updated 2 days ago</div>
        </div>
        <div className="deck-header-actions">
          <button className="deck-header-btn" title="Edit Deck" onClick={() => alert('Edit deck coming soon!')}><FiEdit2 /></button>
          <button className="deck-header-btn" title="Delete Deck" onClick={handleDeleteDeck}><FiTrash2 /></button>
        </div>
      </div>
      {/* Search Bar */}
      <div className="deck-search-bar">
        <FiSearch className="search-icon" />
        <input
          type="text"
          placeholder="Search cards..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>
      {/* Add Card Button */}
      <button className="add-card-btn" onClick={() => setShowAdd(true)}><FiPlus /> Add New Card</button>
      {/* Card List */}
      <div className="card-list-grid">
        {loading ? <div className="loading">Loading...</div> :
          filteredCards.map(card => (
            <div className="card-preview" key={card.id}>
              <div className="card-front">{card.question}</div>
              <div className="card-divider" />
              <div className="card-back">{card.answer}</div>
              <div className="card-extras">
                <span className="card-extra"><FiStar title="Favorite" /></span>
                <span className="card-extra"><FiClock title="Recently Reviewed" /></span>
                <span className="card-extra"><FiTag title="#biology" /></span>
              </div>
              <div className="card-actions">
                <button className="card-action-btn" title="Edit"><FiEdit2 /></button>
                <button className="card-action-btn" title="Delete" onClick={() => handleDeleteCard(card.id)} disabled={deleting === card.id}><FiTrash2 /></button>
              </div>
            </div>
          ))}
      </div>
      {/* Add Card Modal */}
      {showAdd && (
        <div className="add-card-modal">
          <form className="add-card-form" onSubmit={handleAddCard}>
            <input
              type="text"
              placeholder="Front (question)"
              value={newCard.question}
              onChange={e => setNewCard({ ...newCard, question: e.target.value })}
              required
            />
            <input
              type="text"
              placeholder="Back (answer)"
              value={newCard.answer}
              onChange={e => setNewCard({ ...newCard, answer: e.target.value })}
              required
            />
            <button type="submit" className="add-card-submit"><FiPlus /> Add Card</button>
            <button type="button" className="add-card-cancel" onClick={() => setShowAdd(false)}>Cancel</button>
          </form>
        </div>
      )}
    </div>
  );
} 