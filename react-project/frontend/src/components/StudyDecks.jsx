import React, { useState, useEffect, useRef, useCallback, memo } from 'react';
import { useNavigate } from 'react-router-dom';
import ReactDOM from 'react-dom';
import { 
    BookOpen, 
    ArrowLeft, 
    Plus, 
    Trash2, 
    X, 
    Star,
    MoreVertical,
    CheckCircle,
    Clock,
    Calendar,
    Brain,
    Book,
    GraduationCap,
    Calculator,
    Atom,
    Code,
    Filter,
    SortAsc,
    SortDesc
} from 'lucide-react';
import { FiPlus, FiTrash2 } from 'react-icons/fi';
import './StudyDecks.css';
import brainPng from '../assets/brain.png';
import api from '../api/axios';
import { formatDateForDisplay, formatDateTimeForDisplay } from '../utils/dateUtils';

const LoadingSpinner = () => (
  <div style={{
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    margin: '20px auto',
    width: '60px',
    height: '60px',
    position: 'relative'
  }}>
    <img 
      src={brainPng}
      alt="Loading..." 
      className="brain-loader"
      style={{
        width: '100%',
        height: '100%',
        objectFit: 'contain',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0
      }}
    />
  </div>
);

// Skeleton Loader Component
const DeckSkeleton = () => (
  <div className="studydeck-card skeleton-card">
    <div className="skeleton-icon"></div>
    <div className="skeleton-title"></div>
    <div className="skeleton-subject"></div>
    <div className="skeleton-metrics">
      <div className="skeleton-metric-row">
        <div className="skeleton-metric-label"></div>
        <div className="skeleton-metric-value"></div>
      </div>
      <div className="skeleton-metric-row">
        <div className="skeleton-metric-label"></div>
        <div className="skeleton-metric-value"></div>
      </div>
    </div>
    <div className="skeleton-progress-label"></div>
    <div className="skeleton-progress-rail">
      <div className="skeleton-progress-fill"></div>
    </div>
    <div className="skeleton-button"></div>
  </div>
);

// Empty State Component
const EmptyState = () => (
  <div className="empty-state">
    <div className="empty-state-icon">
      <Book size={48} />
    </div>
    <h3 className="empty-state-title">No Decks Yet</h3>
    <p className="empty-state-description">
      Create your first deck to start studying and track your progress.
    </p>
    <button className="empty-state-btn" onClick={handleOpenCreateModal}>
      <Plus size={20} />
      Create Your First Deck
    </button>
  </div>
);

// Memoized Modal Component
const CreateDeckModal = memo(({ showCreateModal, handleCloseModal, handleCreateDeck, newDeck, setNewDeck, titleInputRef }) => {
    const modalContent = (
        <div className={`modal-overlay ${showCreateModal ? 'show' : ''}`} onClick={handleCloseModal}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h3>Create New Deck</h3>
                    <button 
                        className="close-button"
                        onClick={handleCloseModal}
                    >
                        <X size={20} />
                    </button>
                </div>
                <form onSubmit={handleCreateDeck}>
                    <div className="form-group">
                        <label htmlFor="title">Title</label>
                        <input
                            ref={titleInputRef}
                            type="text"
                            id="title"
                            value={newDeck.title}
                            onChange={(e) => setNewDeck(prev => ({ ...prev, title: e.target.value }))}
                            required
                            placeholder="Enter deck title"
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="subject">Subject</label>
                        <input
                            type="text"
                            id="subject"
                            value={newDeck.subject}
                            onChange={(e) => setNewDeck(prev => ({ ...prev, subject: e.target.value }))}
                            required
                            placeholder="Enter subject"
                        />
                    </div>
                    <div className="modal-actions">
                        <button type="button" onClick={handleCloseModal}>Cancel</button>
                        <button type="submit">Create Deck</button>
                    </div>
                </form>
            </div>
        </div>
    );

    return ReactDOM.createPortal(modalContent, document.body);
});

const StudyDecks = () => {
    const [decks, setDecks] = useState([]);
    const [error, setError] = useState(null);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [newDeck, setNewDeck] = useState({ title: '', subject: '' });
    const [showMenu, setShowMenu] = useState(null);
    const [loading, setLoading] = useState(true);
    const [sortBy, setSortBy] = useState('title');
    const [sortOrder, setSortOrder] = useState('asc');
    const [filterSubject, setFilterSubject] = useState('all');
    const [showSortFilter, setShowSortFilter] = useState(false);
    const navigate = useNavigate();
    const titleInputRef = useRef(null);
    const modalRef = useRef(null);
    const sortFilterRef = useRef(null);

    // Debug modal state
    useEffect(() => {
        console.log('Modal state changed:', showCreateModal);
    }, [showCreateModal]);

    const handleCloseModal = useCallback(() => {
        setShowCreateModal(false);
        setNewDeck({ title: '', subject: '' });
    }, []);

    const handleOpenCreateModal = useCallback(() => {
        setShowCreateModal(true);
        // Focus the input after the modal is shown
        requestAnimationFrame(() => {
            if (titleInputRef.current) {
                titleInputRef.current.focus();
            }
        });
    }, []);

    const handleCreateDeck = useCallback(async (e) => {
        e.preventDefault();
        try {
            const response = await api.post('/flashcards/deck/', newDeck);
            handleCloseModal();
            await fetchDecks();
        } catch (err) {
            setError(err.message);
        }
    }, [newDeck, handleCloseModal]);

    const fetchDecks = async () => {
        try {
            setLoading(true);
            const response = await api.get('/flashcards/deck/');
            const data = response.data;
            console.log('Raw deck data from API:', data);
            const decksData = data.decks || [];
            console.log('Decks data:', decksData);
            
            // Fetch cards for each deck
            const decksWithCards = await Promise.all(
                decksData.map(async (deck) => {
                    try {
                        const cardsResponse = await api.get(`/flashcards/cards/${deck.id}/`);
                        console.log(`Cards for deck ${deck.title}:`, cardsResponse.data);
                        return {
                            ...deck,
                            cards: cardsResponse.data || []
                        };
                    } catch (err) {
                        console.error(`Error fetching cards for deck ${deck.id}:`, err);
                        return {
                            ...deck,
                            cards: []
                        };
                    }
                })
            );
            
            console.log('Final decks with cards:', decksWithCards);
            setDecks(decksWithCards);
            setLoading(false);
        } catch (err) {
            setError(err.message);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDecks();
    }, []);

    // Handle click outside sort/filter dropdown
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (sortFilterRef.current && !sortFilterRef.current.contains(event.target)) {
                setShowSortFilter(false);
            }
        };

        if (showSortFilter) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [showSortFilter]);

    const handleDeckClick = (deckId) => {
        navigate(`/study-room/deck/${deckId}`);
    };

    const handleDeleteDeck = async (deckId, e) => {
        e.stopPropagation();
        if (!window.confirm('Are you sure you want to delete this deck?')) return;

        try {
            await api.delete(`/flashcards/deck/delete/${deckId}`);
            await fetchDecks();
        } catch (err) {
            setError(err.message);
        }
    };

    const getSubjectIcon = (subject) => {
        const iconMap = {
            'Biology': Brain,
            'Chemistry': Atom,
            'Computer Science': Code,
            'Mathematics': Calculator,
            'Physics': GraduationCap,
            'default': Book
        };
        return iconMap[subject] || iconMap.default;
    };

    const calculateProgress = (deck) => {
        const totalCards = deck.cards?.length || 0;
        const reviewedCards = deck.cards?.filter(card => card.last_review_date)?.length || 0;
        return totalCards > 0 ? (reviewedCards / totalCards) * 100 : 0;
    };

    const calculateMasteryProgress = (deck) => {
        // Use stock data for mastery progress
        const stockMasteryData = {
            'Biology': 85,
            'Chemistry': 62,
            'Computer Science': 78,
            'Mathematics': 45,
            'Physics': 92,
            'default': 30
        };
        
        return stockMasteryData[deck.subject] || stockMasteryData.default;
    };
    
    const getMasteryColor = (progress) => {
        if (progress >= 90) return '#ec4899'; // Soft Pink - Mastered (ribbon-dark-pink)
        if (progress >= 75) return '#8b5cf6'; // Soft Purple - Good (ribbon-muted-purple)
        if (progress >= 50) return '#f59e42'; // Warm Amber - Needs Improvement (ribbon-warm-amber)
        return '#f87171'; // Pastel Red - Poor (ribbon-soft-red)
    };

    const getMasteryClass = (progress) => {
        if (progress >= 90) return 'mastery-excellent';
        if (progress >= 75) return 'mastery-good';
        if (progress >= 50) return 'mastery-improving';
        return 'mastery-poor';
    };

    const handleSort = (newSortBy) => {
        if (sortBy === newSortBy) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
        } else {
            setSortBy(newSortBy);
            setSortOrder('asc');
        }
    };

    const handleFilter = (subject) => {
        setFilterSubject(subject);
    };

    const getSortedAndFilteredDecks = () => {
        let filteredDecks = decks;
        
        // Apply subject filter
        if (filterSubject !== 'all') {
            filteredDecks = decks.filter(deck => deck.subject === filterSubject);
        }
        
        // Apply sorting
        filteredDecks.sort((a, b) => {
            let aValue, bValue;
            
            switch (sortBy) {
                case 'title':
                    aValue = a.title.toLowerCase();
                    bValue = b.title.toLowerCase();
                    break;
                case 'subject':
                    aValue = a.subject.toLowerCase();
                    bValue = b.subject.toLowerCase();
                    break;
                case 'cards':
                    aValue = a.cards?.length || 0;
                    bValue = b.cards?.length || 0;
                    break;
                case 'mastery':
                    aValue = calculateMasteryProgress(a);
                    bValue = calculateMasteryProgress(b);
                    break;
                case 'created':
                    aValue = new Date(a.created_at || 0);
                    bValue = new Date(b.created_at || 0);
                    break;
                default:
                    aValue = a.title.toLowerCase();
                    bValue = b.title.toLowerCase();
            }
            
            if (sortOrder === 'asc') {
                return aValue > bValue ? 1 : -1;
            } else {
                return aValue < bValue ? 1 : -1;
            }
        });
        
        return filteredDecks;
    };

    const getUniqueSubjects = () => {
        const subjects = [...new Set(decks.map(deck => deck.subject))];
        return subjects.sort();
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'Never';
        return formatDateForDisplay(dateString);
    };

    // Test the formatDateTimeForDisplay function
    const testDate = "2025-07-01T22:50:51Z";
    console.log('Test formatDateTimeForDisplay:', formatDateTimeForDisplay(testDate));
    console.log('Test formatDateForDisplay:', formatDateForDisplay(testDate));

    return (
        <div className="study-decks-container">
            <div className="study-decks-header">
                <button className="back-button" onClick={() => navigate('/study-room')}>
                    <ArrowLeft size={20} />
                    Back
                </button>
                <h2>Your Decks</h2>
                <div className="header-actions">
                    <div className="sort-filter-container" ref={sortFilterRef}>
                        <button 
                            className="sort-filter-btn"
                            onClick={() => setShowSortFilter(!showSortFilter)}
                        >
                            <Filter size={16} />
                            {sortOrder === 'asc' ? <SortAsc size={16} /> : <SortDesc size={16} />}
                        </button>
                        
                        {showSortFilter && (
                            <div className="sort-filter-dropdown">
                                <div className="dropdown-section">
                                    <h4>Sort By</h4>
                                    <div className="sort-options">
                                        <button 
                                            className={`sort-option ${sortBy === 'title' ? 'active' : ''}`}
                                            onClick={() => handleSort('title')}
                                        >
                                            Title
                                        </button>
                                        <button 
                                            className={`sort-option ${sortBy === 'subject' ? 'active' : ''}`}
                                            onClick={() => handleSort('subject')}
                                        >
                                            Subject
                                        </button>
                                        <button 
                                            className={`sort-option ${sortBy === 'cards' ? 'active' : ''}`}
                                            onClick={() => handleSort('cards')}
                                        >
                                            Cards
                                        </button>
                                        <button 
                                            className={`sort-option ${sortBy === 'mastery' ? 'active' : ''}`}
                                            onClick={() => handleSort('mastery')}
                                        >
                                            Mastery
                                        </button>
                                        <button 
                                            className={`sort-option ${sortBy === 'created' ? 'active' : ''}`}
                                            onClick={() => handleSort('created')}
                                        >
                                            Created
                                        </button>
                                    </div>
                                </div>
                                
                                <div className="dropdown-section">
                                    <h4>Filter By Subject</h4>
                                    <div className="filter-options">
                                        <button 
                                            className={`filter-option ${filterSubject === 'all' ? 'active' : ''}`}
                                            onClick={() => handleFilter('all')}
                                        >
                                            All Subjects
                                        </button>
                                        {getUniqueSubjects().map(subject => (
                                            <button 
                                                key={subject}
                                                className={`filter-option ${filterSubject === subject ? 'active' : ''}`}
                                                onClick={() => handleFilter(subject)}
                                            >
                                                {subject}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                    <button className="create-deck-button" onClick={handleOpenCreateModal}>
                        <Plus size={20} />
                        Create Deck
                    </button>
                </div>
            </div>

            {error && <div className="error-message">{error}</div>}
            
            {loading ? (
                <div className="studydeck-grid">
                    {[...Array(6)].map((_, index) => (
                        <DeckSkeleton key={index} />
                    ))}
                </div>
            ) : (
                <div className="studydeck-grid">
                   {getSortedAndFilteredDecks().length > 0 ? (
                       getSortedAndFilteredDecks().map((deck) => (
                        <div
                            key={deck.id}
                            className="studydeck-card"
                            data-status={deck.status || 'in-progress'}
                            onClick={() => handleDeckClick(deck.id)}
                        >
                            {/* Icon circle */}
                            <div className="studydeck-icon-circle">
                                <span className="studydeck-icon">
                                    {React.createElement(getSubjectIcon(deck.subject), { size: 32 })}
                                </span>
                            </div>
                            {/* Title */}
                            <div className="studydeck-title">{deck.title}</div>
                            {/* Subject tag */}
                            <div className="studydeck-subject">{deck.subject}</div>
                            {/* Metrics */}
                            <div className="studydeck-metrics">
                                <div className="studydeck-metric-row">
                                    <span className="studydeck-metric-label">
                                        <BookOpen size={16} style={{ color: '#7c3aed' }}/> Cards
                                    </span>
                                    <span className="studydeck-metric-value">{deck.cards?.length || 0}</span>
                                </div>
                                <div className="studydeck-metric-row">
                                    <span className="studydeck-metric-label">
                                        <CheckCircle size={16} style={{ color: '#f59e42' }}/> Reviewed
                                    </span>
                                    <span className="studydeck-metric-value">{deck.cards?.filter(c => c.last_review_date)?.length || 0}</span>
                                </div>
                            </div>
                            {/* Progress bar */}
                            <div className="studydeck-progress-label">
                                <span>Mastery Progress ({calculateMasteryProgress(deck)}%)</span>
                            </div>
                            <div className="studydeck-progress-rail">
                                <div
                                    className={`studydeck-progress-fill ${getMasteryClass(calculateMasteryProgress(deck))}`}
                                    style={{ 
                                        width: `${calculateMasteryProgress(deck)}%`
                                    }}
                                />
                            </div>
                            {/* Review button */}
                            <button
                                className="studydeck-review-btn"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeckClick(deck.id);
                                }}
                            >
                                <CheckCircle size={18} style={{marginRight: 8}}/> Review Now
                            </button>
                        </div>
                       ))
                   ) : (
                       <EmptyState />
                   )}
                </div>
            )}

            <CreateDeckModal 
                showCreateModal={showCreateModal}
                handleCloseModal={handleCloseModal}
                handleCreateDeck={handleCreateDeck}
                newDeck={newDeck}
                setNewDeck={setNewDeck}
                titleInputRef={titleInputRef}
            />
        </div>
    );
};

// Add the style element at the end of the file
const style = document.createElement('style');
style.textContent = `
  .brain-loader {
    animation: brainPulse 2s ease-in-out infinite;
    filter: drop-shadow(0 0 10px rgba(255, 255, 255, 0.3));
  }

  @keyframes brainPulse {
    0% {
      transform: scale(1);
      filter: drop-shadow(0 0 5px rgba(255, 255, 255, 0.2));
    }
    50% {
      transform: scale(1.1);
      filter: drop-shadow(0 0 15px rgba(255, 255, 255, 0.5));
    }
    100% {
      transform: scale(1);
      filter: drop-shadow(0 0 5px rgba(255, 255, 255, 0.2));
    }
  }
`;
document.head.appendChild(style);

export default StudyDecks; 