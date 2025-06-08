import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiEdit2, FiTrash2, FiPlus, FiSearch, FiStar, FiClock, FiTag, FiArrowLeft, FiX } from 'react-icons/fi';
import './DeckContent.css';

const API_URL = import.meta.env.VITE_API_URL;

export default function DeckContent() {
  const { deckId } = useParams();
  const navigate = useNavigate();
  const [deck, setDeck] = useState(null);
  const [cards, setCards] = useState([]);
  const [search, setSearch] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [newCard, setNewCard] = useState({ question: '', answer: '', tags: [] });
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(null);
  const [theme, setTheme] = useState('dark');
  const [openCardId, setOpenCardId] = useState(null);
  const [badgeTooltip, setBadgeTooltip] = useState(null);
  const [showPreview, setShowPreview] = useState(false);
  const [newTag, setNewTag] = useState('');
  const MAX_CHARS = 500;

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
    if (!deckId) return; // Guard against undefined deckId
    setLoading(true);
    const res = await fetch(`${API_URL}flashcards/cards/${deckId}/`, {
      headers: { Authorization: `Bearer ${jwt}` }
    });
    const data = await res.json();
    setCards(data);
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
    setNewCard({ question: '', answer: '', tags: [] });
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

  // Memoized modal handlers
  const handleAddTag = useCallback((e) => {
    if (e.key === 'Enter' && newTag.trim()) {
      e.preventDefault();
      setNewCard(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag('');
    }
  }, [newTag]);

  const handleRemoveTag = useCallback((tagToRemove) => {
    setNewCard(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  }, []);

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Enter' && e.metaKey) {
      handleAddCard(e);
    }
  }, [handleAddCard]);

  const CreateDeckModal = useMemo(() => {
    if (!showAdd) return null;
    return (
      <div className={`modal-overlay${showAdd ? ' show' : ''}`} onClick={() => setShowAdd(false)}>
        <div className="modal-content" onClick={e => e.stopPropagation()}>
          <div className="modal-header">
            <h3>Add New Card</h3>
            <button className="close-button" onClick={() => setShowAdd(false)}>
              <FiX size={20} />
            </button>
          </div>

          <div className="preview-toggle">
            <button 
              className={!showPreview ? 'active' : ''} 
              onClick={() => setShowPreview(false)}
            >
              Edit
            </button>
            <button 
              className={showPreview ? 'active' : ''} 
              onClick={() => setShowPreview(true)}
            >
              Preview
            </button>
          </div>

          {!showPreview ? (
            <form onSubmit={handleAddCard} onKeyDown={handleKeyDown}>
              <div className="form-group">
                <label htmlFor="question">Question</label>
                <textarea
                  id="question"
                  value={newCard.question}
                  onChange={(e) => setNewCard(prev => ({ ...prev, question: e.target.value }))}
                  placeholder="Enter your question here..."
                  maxLength={MAX_CHARS}
                  required
                />
                <div className="char-counter">
                  {newCard.question.length}/{MAX_CHARS}
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="answer">Answer</label>
                <textarea
                  id="answer"
                  value={newCard.answer}
                  onChange={(e) => setNewCard(prev => ({ ...prev, answer: e.target.value }))}
                  placeholder="Enter your answer here..."
                  maxLength={MAX_CHARS}
                  required
                />
                <div className="char-counter">
                  {newCard.answer.length}/{MAX_CHARS}
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="tags">Tags</label>
                <div className="tags-input">
                  {newCard.tags.map(tag => (
                    <span key={tag} className="tag">
                      {tag}
                      <button type="button" onClick={() => handleRemoveTag(tag)}>
                        <FiX size={14} />
                      </button>
                    </span>
                  ))}
                  <input
                    type="text"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyDown={handleAddTag}
                    placeholder="Add tags (press Enter)"
                    style={{ border: 'none', background: 'transparent', flex: 1 }}
                  />
                </div>
              </div>

              <div className="modal-actions">
                <button type="button" className="cancel-button" onClick={() => setShowAdd(false)}>
                  Cancel
                </button>
                <button type="submit" className="save-button">
                  <FiPlus size={18} />
                  Save Card
                </button>
              </div>
            </form>
          ) : (
            <div className="card-preview">
              <div className="card-preview-front">
                <div className="card-preview-label">Question</div>
                <div className="card-preview-content">
                  {newCard.question || 'No question entered'}
                </div>
                {newCard.tags.length > 0 && (
                  <div className="card-preview-tags">
                    {newCard.tags.map(tag => (
                      <span key={tag} className="card-preview-tag">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <div className="card-preview-back">
                <div className="card-preview-label">Answer</div>
                <div className="card-preview-content">
                  {newCard.answer || 'No answer entered'}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }, [showAdd, showPreview, newCard, newTag, handleAddTag, handleRemoveTag, handleKeyDown, setShowAdd, handleAddCard, MAX_CHARS]);

  return (
    <div className="deck-content-page">
      {/* Back Button */}
      <button className="deck-back-btn" onClick={() => navigate('/study-room/decks')}><FiArrowLeft /> Back to Decks</button>
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
        <input
          type="text"
          placeholder="Search cards..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <FiSearch className="search-icon" />
      </div>
      {/* Add Card Button */}
      <button className="add-card-btn" onClick={() => setShowAdd(true)}><FiPlus /> Add New Card</button>
      {/* Card List */}
      <div className="card-list-grid cards-grid">
        {loading ? <div className="loading">Loading...</div> :
          filteredCards.map(card => {
            const reps = card.repetitions || 0;
            const correct = card.correct || 0;
            const incorrect = card.incorrect || 0;
            let ribbonColorClass = '', ribbonTooltip = '';
            if (reps >= 5) {
              ribbonColorClass = 'ribbon-dark-pink';
              ribbonTooltip = "Mastered: You've reviewed this card enough times to master it!";
            } else if (reps >= 1 && incorrect > correct) {
              ribbonColorClass = 'ribbon-soft-red';
              ribbonTooltip = 'Struggling: More incorrect than correct answers.';
            } else if (reps === 0) {
              ribbonColorClass = 'ribbon-soft-blue';
              ribbonTooltip = 'Unseen: You have not reviewed this card yet.';
            } else if (reps === 1) {
              ribbonColorClass = 'ribbon-warm-amber';
              ribbonTooltip = 'Needs Repetition: Seen, but needs more review.';
            } else if (reps === 2 || reps === 3) {
              ribbonColorClass = 'ribbon-muted-purple';
              ribbonTooltip = 'In Progress: Partially reviewed.';
            }
            const showTooltip = badgeTooltip && badgeTooltip.cardId === card.id;
            let ribbonBackground = '#18181b';
            let arrowColor = '#18181b';
            if (ribbonColorClass === 'ribbon-soft-blue') {
              ribbonBackground = 'linear-gradient(100deg, #60a5fa 60%, #38bdf8 100%)';
              arrowColor = '#38bdf8';
            }
            if (ribbonColorClass === 'ribbon-warm-amber') {
              ribbonBackground = 'linear-gradient(100deg, #fbbf24 60%, #f59e42 100%)';
              arrowColor = '#f59e42';
            }
            if (ribbonColorClass === 'ribbon-soft-red') {
              ribbonBackground = 'linear-gradient(100deg, #f87171 60%, #f43f5e 100%)';
              arrowColor = '#f43f5e';
            }
            if (ribbonColorClass === 'ribbon-dark-pink') {
              ribbonBackground = 'linear-gradient(100deg, #a21caf 60%, #db2777 100%)';
              arrowColor = '#db2777';
            }
            if (ribbonColorClass === 'ribbon-muted-purple') {
              ribbonBackground = 'linear-gradient(100deg, #a78bfa 60%, #7c3aed 100%)';
              arrowColor = '#7c3aed';
            }
            return (
              <div
                className={`card-preview card-theme-${theme} ${ribbonColorClass}`}
                key={card.id}
                onClick={e => {
                  if (e.target.closest('.card-action-btn')) return;
                  setOpenCardId(openCardId === card.id ? null : card.id);
                }}
              >
                {/* Ribbon and tooltip wrapper */}
                <div
                  className="ribbon-tooltip-wrapper"
                  onMouseEnter={e => {
                    // Only set if not already showing for this card
                    if (!badgeTooltip || badgeTooltip.cardId !== card.id) {
                      setBadgeTooltip({cardId: card.id, message: ribbonTooltip});
                    }
                  }}
                  onMouseLeave={e => {
                    // Only clear if currently showing for this card
                    if (badgeTooltip && badgeTooltip.cardId === card.id) {
                      setBadgeTooltip(null);
                    }
                  }}
                >
                  <div className={`card-ribbon-bookmark ${ribbonColorClass}`}>&nbsp;</div>
                  <span className={`badge-tooltip badge-tooltip-outside${showTooltip ? ' show' : ''}`}
                        style={{ background: ribbonBackground }}>{ribbonTooltip}
                  </span>
                </div>
                <div className="card-preview-inner">
                  {/* Top right: Edit/Delete */}
                  <div className="card-actions" style={{position: 'absolute', top: '1.25rem', right: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.75rem', zIndex: 2}}>
                    <button className="card-action-btn" title="Edit" onClick={e => e.stopPropagation()}><FiEdit2 /></button>
                    <button className="card-action-btn" title="Delete" onClick={e => { e.stopPropagation(); handleDeleteCard(card.id); }} disabled={deleting === card.id}><FiTrash2 /></button>
                  </div>
                  {/* Main vertical stack: label, question, subject */}
                  <div className="card-content-stack">
                    <span className="card-preview-label">Question</span>
                    <div className="card-preview-content">{card.question}</div>
                    <span className="card-preview-tag">{deck?.subject || 'General'}</span>
                  </div>
                  {/* Last reviewed in bottom right */}
                  <span className="card-preview-date" style={{position: 'absolute', bottom: '1.25rem', right: '1.25rem'}}>
                    {card.last_review_date ? `Last reviewed: ${new Date(card.last_review_date).toLocaleDateString()}` : 'Not reviewed yet'}
                  </span>
                  {/* Answer (only show if openCardId === card.id) */}
                  {openCardId === card.id && (
                    <div className="card-preview-back" style={{opacity: 1, pointerEvents: 'auto', transform: 'translateY(0)'}}>
                      <div className="card-preview-label">Answer</div>
                      <div className="card-preview-content">
                        {card.answer}
                      </div>
                      <div className="card-preview-meta">
                        <div className="card-preview-tags">
                          <span className="card-preview-tag">Difficulty: {card.difficulty?.toFixed(1) || '0.0'}</span>
                          <span className="card-preview-tag">Stability: {card.stability?.toFixed(1) || '0.0'}</span>
                        </div>
                        <div className="card-preview-date">
                          Next review: {card.scheduled_date ? new Date(card.scheduled_date).toLocaleDateString() : 'Not scheduled'}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
      </div>
      {/* Add Card Modal */}
      {CreateDeckModal}
    </div>
  );
} 