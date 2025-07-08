import React from 'react';
import { FiChevronDown, FiX } from 'react-icons/fi';

const DeckDropdown = ({
  decks = [],
  selectedDeckId,
  setSelectedDeckId,
  showDeckDropdown,
  setShowDeckDropdown,
}) => (
  <div className="deck-dropdown-container">
    <button
      className="deck-dropdown-toggle"
      onClick={() => setShowDeckDropdown((prev) => !prev)}
    >
      <span role="img" aria-label="deck">📁</span>
      {selectedDeckId
        ? (decks.find(d => d.id === selectedDeckId)?.title || 'Unknown Deck')
        : 'All Decks'}
      <FiChevronDown style={{ marginLeft: 6 }} />
    </button>
    {showDeckDropdown && (
      <div className="deck-dropdown-menu">
        <div
          className={`deck-dropdown-item${selectedDeckId === null ? ' selected' : ''}`}
          onClick={() => { setSelectedDeckId(null); setShowDeckDropdown(false); }}
        >
          📁 All Decks
        </div>
        {decks.map(deck => (
          <div
            key={deck.id}
            className={`deck-dropdown-item${selectedDeckId === deck.id ? ' selected' : ''}`}
            onClick={() => { setSelectedDeckId(deck.id); setShowDeckDropdown(false); }}
          >
            📦 {deck.title}
          </div>
        ))}
      </div>
    )}
    {selectedDeckId && (
      <button
        className="clear-deck-filter"
        onClick={() => setSelectedDeckId(null)}
        title="Clear Filter"
      >
        <FiX />
      </button>
    )}
  </div>
);

export default DeckDropdown; 