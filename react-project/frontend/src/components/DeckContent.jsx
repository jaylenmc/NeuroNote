import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiEdit2, FiTrash2, FiPlus, FiSearch, FiStar, FiClock, FiTag, FiArrowLeft, FiX, FiFilter, FiCheck } from 'react-icons/fi';
import './DeckContent.css';

const API_URL = import.meta.env.VITE_API_URL;

export default function DeckContent() {
  const { deckId } = useParams();
  const navigate = useNavigate();
  const [deck, setDeck] = useState(null);
  const [cards, setCards] = useState([]);
  const [search, setSearch] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [newCard, setNewCard] = useState({
    question: '',
    answer: '',
    tags: [],
    scheduled_date: ''
  });
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(null);
  const [theme, setTheme] = useState('dark');
  const [openCardId, setOpenCardId] = useState(null);
  const [badgeTooltip, setBadgeTooltip] = useState(null);
  const [showPreview, setShowPreview] = useState(false);
  const [newTag, setNewTag] = useState('');
  const [selectedRibbonColor, setSelectedRibbonColor] = useState(null);
  const MAX_CHARS = 500;
  const [error, setError] = useState(null);
  const [showEditDeck, setShowEditDeck] = useState(false);
  const [showEditCard, setShowEditCard] = useState(false);
  const [editingDeck, setEditingDeck] = useState(null);
  const [editingCardId, setEditingCardId] = useState(null);
  const [editingSide, setEditingSide] = useState('front');
  const [editCardQuestion, setEditCardQuestion] = useState('');
  const [editCardAnswer, setEditCardAnswer] = useState('');
  const [editCardScheduledDate, setEditCardScheduledDate] = useState('');
  const [editDeckTitle, setEditDeckTitle] = useState('');
  const [editDeckSubject, setEditDeckSubject] = useState('');
  const [showNotesModal, setShowNotesModal] = useState(false);
  const [selectedCard, setSelectedCard] = useState(null);
  const [cardNotes, setCardNotes] = useState({});

  const ribbonColors = [
    { value: null, label: 'All Cards', color: '#666' },
    { value: 'ribbon-soft-blue', label: 'Unseen', color: '#38bdf8' },
    { value: 'ribbon-warm-amber', label: 'Needs Review', color: '#f59e42' },
    { value: 'ribbon-muted-purple', label: 'In Progress', color: '#7c3aed' },
    { value: 'ribbon-soft-red', label: 'Struggling', color: '#f43f5e' },
    { value: 'ribbon-dark-pink', label: 'Mastered', color: '#db2777' }
  ];

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

  const handleAddCard = async (e) => {
    e.preventDefault();
    try {
      const token = sessionStorage.getItem('jwt_token');
      if (!token) {
        setError('Please log in to create cards');
        return;
      }

      const response = await fetch(`${API_URL}flashcards/cards/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
          question: newCard.question,
          answer: newCard.answer,
          deck_id: deck.id,
          scheduled_date: newCard.scheduled_date
        })
      });

      if (!response.ok) {
        throw new Error('Failed to create card');
      }

      setNewCard({
        question: '',
        answer: '',
        tags: [],
        scheduled_date: ''
      });
      setShowAdd(false);
      fetchCards();
    } catch (err) {
      console.error('Error creating card:', err);
      setError(err.message);
    }
  };

  async function handleDeleteDeck() {
    if (!window.confirm('Are you sure you want to delete this deck?')) return;
    await fetch(`${API_URL}flashcards/deck/delete/${deckId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${jwt}` }
    });
    navigate('/study-room');
  }

  const getRibbonColor = (card) => {
    const reps = card.repetitions || 0;
    const correct = card.correct || 0;
    const incorrect = card.incorrect || 0;

    if (reps >= 5) {
      return 'ribbon-dark-pink';
    } else if (reps >= 1 && incorrect > correct) {
      return 'ribbon-soft-red';
    } else if (reps === 0) {
      return 'ribbon-soft-blue';
    } else if (reps === 1) {
      return 'ribbon-warm-amber';
    } else if (reps === 2 || reps === 3) {
      return 'ribbon-muted-purple';
    }
    return '';
  };

  const filteredCards = cards.filter(card => {
    const matchesSearch = card.question.toLowerCase().includes(search.toLowerCase()) ||
                         card.answer.toLowerCase().includes(search.toLowerCase());
    const matchesRibbon = !selectedRibbonColor || getRibbonColor(card) === selectedRibbonColor;
    return matchesSearch && matchesRibbon;
  });

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
            <form onSubmit={handleAddCard}>
              <div className="form-group">
                <label htmlFor="question">Question</label>
                <textarea
                  id="question"
                  value={newCard.question}
                  onChange={(e) => setNewCard(prev => ({ ...prev, question: e.target.value }))}
                  required
                  placeholder="Enter your question"
                />
              </div>
              <div className="form-group">
                <label htmlFor="answer">Answer</label>
                <textarea
                  id="answer"
                  value={newCard.answer}
                  onChange={(e) => setNewCard(prev => ({ ...prev, answer: e.target.value }))}
                  required
                  placeholder="Enter your answer"
                />
              </div>
              <div className="form-group">
                <label htmlFor="scheduledDate">Scheduled Review Date</label>
                <input
                  type="date"
                  id="scheduledDate"
                  value={newCard.scheduled_date}
                  onChange={(e) => setNewCard(prev => ({ ...prev, scheduled_date: e.target.value }))}
                  min={new Date().toISOString().split('T')[0]}
                />
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
                <div className="card-preview-front-label">Question</div>
                {newCard.question || 'No question entered'}
              </div>
              <div className="card-preview-back">
                <div className="card-preview-back-label">Answer</div>
                {newCard.answer || 'No answer entered'}
              </div>
              {newCard.scheduled_date && (
                <div className="card-preview-date">
                  Review: {new Date(newCard.scheduled_date).toLocaleDateString()}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }, [showAdd, newCard, newTag, showPreview]);

  const handleEditDeck = async (e) => {
    e.preventDefault();
    try {
      const token = sessionStorage.getItem('jwt_token');
      if (!token) {
        setError('Please log in to edit deck');
        return;
      }

      const response = await fetch(`http://localhost:8000/api/flashcards/deck/update/${deckId}/`, {
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

  const handleEditCard = async (cardId) => {
    try {
      const token = sessionStorage.getItem('jwt_token');
      if (!token) {
        setError('Please log in to edit card');
        return;
      }

      // Create request body with only the fields that have values
      const requestBody = {
        question: editCardQuestion,
        answer: editCardAnswer
      };

      // Only add scheduled_date if it has a value and is not empty
      if (editCardScheduledDate && editCardScheduledDate.trim() !== '') {
        requestBody.scheduled_date = editCardScheduledDate;
      } else {
        requestBody.scheduled_date = null; // Explicitly set to null if empty
      }

      const response = await fetch(`http://localhost:8000/api/flashcards/cards/update/${deck.id}/${cardId}/`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        if (response.status === 401) {
          setError('Session expired. Please log in again.');
          return;
        }
        throw new Error('Failed to update card');
      }

      setEditingCardId(null);
      setEditingSide('front');
      setEditCardScheduledDate(''); // Reset the scheduled date
      fetchCards(); // Refresh the cards list
    } catch (err) {
      console.error('Error updating card:', err);
      setError(err.message);
    }
  };

  const handleNotesChange = (cardId, value) => {
    setCardNotes(prev => ({
      ...prev,
      [cardId]: value
    }));
  };

  const handleSaveNotes = async (cardId) => {
    try {
      const token = sessionStorage.getItem('jwt_token');
      if (!token) {
        setError('Please log in to save notes');
        return;
      }

      const response = await fetch(`${API_URL}flashcards/cards/update/${deckId}/${cardId}/`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
          notes: cardNotes[cardId]
        })
      });

      if (!response.ok) {
        throw new Error('Failed to save notes');
      }

      setShowNotesModal(false);
      setSelectedCard(null);
    } catch (err) {
      console.error('Error saving notes:', err);
      setError(err.message);
    }
  };

  const renderCard = (card) => {
    const isEditing = editingCardId === card.id;
    const ribbonColorClass = card.ribbon_color || 'ribbon-soft-blue';
    const ribbonTooltip = ribbonColors.find(c => c.value === ribbonColorClass)?.label || 'Unseen';
    const showTooltip = badgeTooltip?.cardId === card.id;

    return (
      <div key={card.id} className={`card-preview ${isEditing ? 'editing' : ''}`}>
        {isEditing && (
          <div className="edit-mode-indicator">
            <FiEdit2 size={16} />
            Editing...
          </div>
        )}
        <div className="card-content-stack">
          <span className="card-preview-label">
            {isEditing ? (editingSide === 'front' ? 'Question' : 'Answer') : 'Question'}
          </span>
          {isEditing ? (
            <textarea
              className="edit-textarea"
              value={editingSide === 'front' ? editCardQuestion : editCardAnswer}
              onChange={(e) => {
                if (editingSide === 'front') {
                  setEditCardQuestion(e.target.value);
                } else {
                  setEditCardAnswer(e.target.value);
                }
              }}
              onClick={(e) => e.stopPropagation()}
              placeholder={editingSide === 'front' ? 'Enter question...' : 'Enter answer...'}
            />
          ) : (
            <div className="card-preview-content">
              {card.question}
            </div>
          )}
        </div>
        {isEditing && (
          <div className="edit-controls">
            <button 
              className={`edit-side-btn ${editingSide === 'front' ? 'active' : ''}`}
              onClick={(e) => {
                e.stopPropagation();
                setEditingSide('front');
              }}
            >
              <FiEdit2 size={16} />
              Front
            </button>
            <button 
              className={`edit-side-btn ${editingSide === 'back' ? 'active' : ''}`}
              onClick={(e) => {
                e.stopPropagation();
                setEditingSide('back');
              }}
            >
              <FiEdit2 size={16} />
              Back
            </button>
            <button 
              className="cancel-btn"
              onClick={(e) => {
                e.stopPropagation();
                setEditingCardId(null);
                setEditingSide('front');
              }}
            >
              <FiX size={16} />
              Cancel
            </button>
          </div>
        )}
        <div className="card-preview-date">
          <FiClock size={14} />
          {card.last_review_date ? `Last reviewed: ${new Date(card.last_review_date).toLocaleDateString()}` : 'Not reviewed yet'}
        </div>
      </div>
    );
  };

  return (
    <div className="deck-content-page">
      <button className="deck-back-btn" onClick={() => navigate('/study-room/decks')}><FiArrowLeft /> Back to Decks</button>
      <div className="deck-header">
        <span className="deck-emoji">📘</span>
        <div className="deck-header-info">
          <div className="deck-title-section">
            <h1 className="deck-title">{deck?.title || 'Deck'}</h1>
            <span className="deck-subject">{deck?.subject || 'No subject'}</span>
            <div className="deck-subtitle">{cards.length} cards · Last updated 2 days ago</div>
          </div>
        </div>
        <div className="deck-header-actions">
          <button 
            className="deck-header-btn" 
            title="Edit Deck" 
            onClick={() => {
              setEditingDeck(deck);
              setEditDeckTitle(deck.title);
              setEditDeckSubject(deck.subject);
              setShowEditDeck(true);
            }}
          >
            <FiEdit2 />
          </button>
          <button className="deck-header-btn" title="Delete Deck" onClick={handleDeleteDeck}>
            <FiTrash2 />
          </button>
        </div>
      </div>
      <div className="deck-search-filter">
        <div className="deck-search-bar">
          <input
            type="text"
            placeholder="Search cards..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <FiSearch className="search-icon" />
        </div>
        <div className="ribbon-filter">
          <button className="filter-button">
            <FiFilter size={16} />
            Filter
          </button>
          <div className="ribbon-filter-dropdown">
            {ribbonColors.map(({ value, label, color }) => (
              <button
                key={value || 'all'}
                className={`ribbon-filter-option ${selectedRibbonColor === value ? 'active' : ''}`}
                onClick={() => setSelectedRibbonColor(value)}
                data-value={value}
              >
                <span className="ribbon-color-dot"/>
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>
      <button className="add-card-btn" onClick={() => setShowAdd(true)}><FiPlus /> Add New Card</button>
      <div className="card-list-grid cards-grid">
        {loading ? <div className="loading">Loading...</div> :
          filteredCards.map(card => {
            const isEditing = editingCardId === card.id;
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
                className={`card-preview card-theme-${theme}`}
                key={card.id}
                onClick={e => {
                  if (e.target.closest('.card-action-btn') || isEditing) return;
                  setOpenCardId(openCardId === card.id ? null : card.id);
                }}
              >
                <div
                  className="ribbon-tooltip-wrapper"
                  onMouseEnter={e => {
                    if (!badgeTooltip || badgeTooltip.cardId !== card.id) {
                      setBadgeTooltip({cardId: card.id, message: ribbonTooltip});
                    }
                  }}
                  onMouseLeave={e => {
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
                  <div className="card-actions" >
                    <button 
                      type="button"
                      className="card-action-btn edit"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (isEditing) {
                          handleEditCard(card.id);
                        } else {
                          setEditingCardId(card.id);
                          setEditCardQuestion(card.question);
                          setEditCardAnswer(card.answer);
                          setEditCardScheduledDate(card.scheduled_date || '');
                        }
                      }}
                    >
                      {isEditing ? <FiCheck /> : <FiEdit2 />}
                    </button>
                    <button 
                      type="button"
                      className="card-action-btn delete"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteCard(card.id);
                      }}
                    >
                      <FiTrash2 />
                    </button>
                  </div>
                  {isEditing && (
                    <div className="badge-tooltip-outside show">
                      Edit Mode
                    </div>
                  )}
                  <div className="card-content-stack">
                    <span className="card-preview-label">{isEditing ? (editingSide === 'front' ? 'Question' : 'Answer') : 'Question'}</span>
                    {isEditing ? (
                      <textarea
                        className="card-preview-content"
                        value={editingSide === 'front' ? editCardQuestion : editCardAnswer}
                        onChange={(e) => {
                          if (editingSide === 'front') {
                            setEditCardQuestion(e.target.value);
                          } else {
                            setEditCardAnswer(e.target.value);
                          }
                        }}
                        onClick={(e) => e.stopPropagation()}
                        style={{
                          background: 'transparent',
                          border: 'none',
                          color: 'inherit',
                          fontFamily: 'inherit',
                          fontSize: 'inherit',
                          lineHeight: 'inherit',
                          padding: '0',
                          resize: 'none',
                          minHeight: '100px',
                          width: '100%',
                          outline: 'none',
                          caretColor: 'var(--primary-color)'
                        }}
                      />
                    ) : (
                      <div className="card-preview-content">
                        {card.question}
                        {isEditing && <span className="caret">|</span>}
                      </div>
                    )}
                    {!isEditing && (
                      <button 
                        className="card-preview-tag notes-button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedCard(card);
                          setShowNotesModal(true);
                        }}
                      >
                        Notes
                      </button>
                    )}
                  </div>
                  {isEditing && (
                    <div className="edit-controls" >
                      <button 
                        className={`card-action-btn ${editingSide === 'front' ? 'active' : ''}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingSide('front');
                        }}
                      >
                        Front
                      </button>
                      <button 
                        className={`card-action-btn ${editingSide === 'back' ? 'active' : ''}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingSide('back');
                        }}
                      >
                        Back
                      </button>
                      <button 
                        className="card-action-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingCardId(null);
                          setEditingSide('front');
                        }}
                      >
                        Cancel
                      </button>
                    </div>
                  )}
                  <span className="card-preview-date">
                    {card.last_review_date ? `Last reviewed: ${new Date(card.last_review_date).toLocaleDateString()}` : 'Not reviewed yet'}
                  </span>
                  {openCardId === card.id && (
                    <div className="card-preview-back" style={{
                      opacity: 1,
                      pointerEvents: 'auto',
                      transform: 'translateY(0)',
                      minHeight: isEditing ? '200px' : 'auto',
                    }}>
                      <div className="card-preview-label">Answer</div>
                      {isEditing ? (
                        <textarea
                          className="card-preview-content"
                          value={editingSide === 'back' ? editCardAnswer : editCardQuestion}
                          onChange={(e) => {
                            if (editingSide === 'back') {
                              setEditCardAnswer(e.target.value);
                            } else {
                              setEditCardQuestion(e.target.value);
                            }
                          }}
                          onClick={(e) => e.stopPropagation()}
                          
                        />
                      ) : (
                        <div className="card-preview-content">
                          {card.answer}
                          {isEditing && <span className="caret">|</span>}
                        </div>
                      )}
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
      {CreateDeckModal}
      {showEditDeck && (
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
        </div>
      )}
      {showNotesModal && selectedCard && (
        <div className="modal-overlay" onClick={() => setShowNotesModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Card Notes</h3>
              <button className="close-button" onClick={() => setShowNotesModal(false)}>
                <FiX size={20} />
              </button>
            </div>
            <div className="form-group">
              <textarea
                className="notes-textarea"
                value={cardNotes[selectedCard.id] || ''}
                onChange={(e) => handleNotesChange(selectedCard.id, e.target.value)}
                placeholder="Add your notes here..."
              />
            </div>
            <div className="modal-actions">
              <button 
                className="submit-button"
                onClick={() => handleSaveNotes(selectedCard.id)}
              >
                Save Notes
              </button>
              <button 
                className="cancel-button"
                onClick={() => setShowNotesModal(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 