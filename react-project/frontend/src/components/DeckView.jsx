import React from 'react';
import { FiPlus, FiEdit2, FiTrash2, FiEye } from 'react-icons/fi';

const DeckView = ({
    selectedDeck,
    cards,
    showNewCardModal,
    setShowNewCardModal,
    newCard,
    setNewCard,
    handleCreateCard,
    handleDeleteCard,
    handleEditCard,
    isLoading
}) => {
    if (!selectedDeck) return null;

    return (
        <div className="deck-view">
            <div className="deck-header">
                <div className="deck-info">
                    <h2>{selectedDeck.name}</h2>
                    <p>{selectedDeck.subject} • {cards.length} cards</p>
                </div>
                <div className="deck-actions">
                    <button 
                        className="action-btn primary"
                        onClick={() => setShowNewCardModal(true)}
                    >
                        <FiPlus /> Add Card
                    </button>
                    <button className="action-btn">
                        <FiEye /> Review
                    </button>
                </div>
            </div>

            {isLoading.cards ? (
                <div className="loading-state">
                    <div className="loading-spinner"></div>
                    <p>Loading cards...</p>
                </div>
            ) : cards.length === 0 ? (
                <div className="empty-state">
                    <div className="empty-state-content">
                        <div className="empty-state-icon">📚</div>
                        <h3>No cards yet</h3>
                        <p>Create your first flashcard to start studying</p>
                        <button 
                            className="empty-state-btn primary"
                            onClick={() => setShowNewCardModal(true)}
                        >
                            <FiPlus /> Create First Card
                        </button>
                    </div>
                </div>
            ) : (
                <div className="cards-grid">
                    {cards.map((card, index) => (
                        <div key={card.id} className="card-item">
                            <div className="card-number">#{index + 1}</div>
                            <div className="card-content">
                                <div className="card-question">
                                    <h4>Question:</h4>
                                    <p>{card.question}</p>
                                </div>
                                <div className="card-answer">
                                    <h4>Answer:</h4>
                                    <p>{card.answer}</p>
                                </div>
                                {card.scheduled_date && (
                                    <div className="card-schedule">
                                        <small>Due: {formatDateForDisplay(card.scheduled_date)}</small>
                                    </div>
                                )}
                            </div>
                            <div className="card-actions">
                                <button 
                                    className="card-action-btn"
                                    onClick={() => handleEditCard(card)}
                                >
                                    <FiEdit2 />
                                </button>
                                <button 
                                    className="card-action-btn delete"
                                    onClick={() => handleDeleteCard(card.id)}
                                >
                                    <FiTrash2 />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* New Card Modal */}
            {showNewCardModal && (
                <div className="modal-overlay">
                    <div className="modal">
                        <h3>Create New Card</h3>
                        <div className="modal-content">
                            <div className="form-group">
                                <label>Question:</label>
                                <textarea
                                    value={newCard.question}
                                    onChange={(e) => setNewCard({...newCard, question: e.target.value})}
                                    placeholder="Enter your question..."
                                    rows={3}
                                />
                            </div>
                            <div className="form-group">
                                <label>Answer:</label>
                                <textarea
                                    value={newCard.answer}
                                    onChange={(e) => setNewCard({...newCard, answer: e.target.value})}
                                    placeholder="Enter your answer..."
                                    rows={3}
                                />
                            </div>
                            <div className="form-group">
                                <label>Schedule Date (optional):</label>
                                <input
                                    type="date"
                                    value={newCard.scheduled_date}
                                    onChange={(e) => setNewCard({...newCard, scheduled_date: e.target.value})}
                                />
                            </div>
                        </div>
                        <div className="modal-actions">
                            <button 
                                className="btn secondary"
                                onClick={() => setShowNewCardModal(false)}
                            >
                                Cancel
                            </button>
                            <button 
                                className="btn primary"
                                onClick={handleCreateCard}
                                disabled={!newCard.question.trim() || !newCard.answer.trim()}
                            >
                                Create Card
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DeckView; 