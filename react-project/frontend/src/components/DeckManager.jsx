import React, { useState, useEffect } from 'react';
import { FiPlus, FiTrash2 } from 'react-icons/fi';
import './DeckManager.css';
import { formatDateForDisplay } from '../utils/dateUtils';
import api from '../api/axios';

const DeckManager = () => {
    const [decks, setDecks] = useState([]);
    const [selectedDeck, setSelectedDeck] = useState(null);
    const [cards, setCards] = useState([]);
    const [isCreatingDeck, setIsCreatingDeck] = useState(false);
    const [isCreatingCard, setIsCreatingCard] = useState(false);
    const [isLoadingDecks, setIsLoadingDecks] = useState(true);
    const [isLoadingCards, setIsLoadingCards] = useState(false);
    const [newDeck, setNewDeck] = useState({ 
        title: '',
        subject: ''
    });
    const [newCard, setNewCard] = useState({ 
        front: '', 
        back: '',
        scheduled_date: new Date().toISOString().split('T')[0]
    });

    useEffect(() => {
        fetchDecks();
    }, []);

    useEffect(() => {
        if (decks.length > 0 && !selectedDeck) {
            setSelectedDeck(decks[0]);
        }
    }, [decks]);

    useEffect(() => {
        if (selectedDeck) {
            fetchCards(selectedDeck.id);
        }
    }, [selectedDeck]);

    const fetchDecks = async () => {
        setIsLoadingDecks(true);
        try {
            const response = await api.get('/flashcards/deck/');
            setDecks(response.data);
        } catch (error) {
            console.error('Error fetching decks:', error);
        } finally {
            setIsLoadingDecks(false);
        }
    };

    const fetchCards = async (deckId) => {
        setIsLoadingCards(true);
        try {
            const response = await api.get('/flashcards/cards/');
            
            const deckCards = response.data.filter(card => card.card_deck === deckId);
            console.log('Fetched cards:', deckCards);
            setCards(deckCards);
            
        } catch (error) {
            console.error('Error fetching cards:', error);
            setCards([]);
        } finally {
            setIsLoadingCards(false);
        }
    };

    const createDeck = async () => {
        if (!newDeck.title.trim() || !newDeck.subject.trim()) return;
        
        try {
            await api.post('/flashcards/deck/', newDeck);
            setNewDeck({ title: '', subject: '' });
            setIsCreatingDeck(false);
            fetchDecks();
        } catch (error) {
            console.error('Error creating deck:', error);
        }
    };

    const deleteDeck = async (deckId) => {
        try {
            await api.delete(`/flashcards/deck/delete/${deckId}`);
            if (selectedDeck?.id === deckId) {
                setSelectedDeck(null);
                setCards([]);
            }
            fetchDecks();
        } catch (error) {
            console.error('Error deleting deck:', error);
        }
    };

    const createCard = async () => {
        if (!newCard.front.trim() || !newCard.back.trim()) return;
        
        try {
            const scheduledDate = newCard.scheduled_date ? 
                new Date(newCard.scheduled_date + 'T00:00:00').toISOString().split('T')[0] : 
                null;

            const cardData = {
                "answer": newCard.back,
                "question": newCard.front,
                "deck_id": selectedDeck.id,
                "scheduled_date": scheduledDate
            };
            
            console.log('Creating card with data:', cardData);
            
            const response = await api.post('/flashcards/cards/', cardData);
            
            console.log('Card creation response:', response.data);
            
            setNewCard({ 
                front: '', 
                back: '',
                scheduled_date: new Date().toISOString().split('T')[0]
            });
            setIsCreatingCard(false);
            fetchCards(selectedDeck.id);
        } catch (error) {
            console.error('Error creating card:', error);
        }
    };

    const deleteCard = async (deckId, cardId) => {
        try {
            await api.delete(`/flashcards/cards/delete/${deckId}/${cardId}`);
            fetchCards(selectedDeck.id);
        } catch (error) {
            console.error('Error deleting card:', error);
        }
    };

    const formatDate = (dateString) => {
        if (!dateString || dateString === '1969-12-31') return null;
        try {
            return formatDateForDisplay(dateString);
        } catch (error) {
            console.error('Error formatting date:', error);
            return null;
        }
    };

    return (
        <div className="deck-manager">
            <div className="decks-section">
                <div className="section-header">
                    <h3>My Decks</h3>
                    <button 
                        className="add-button"
                        onClick={() => setIsCreatingDeck(true)}
                    >
                        <FiPlus /> New Deck
                    </button>
                </div>

                {isCreatingDeck && (
                    <div className="create-form">
                        <input
                            type="text"
                            placeholder="Enter deck title"
                            value={newDeck.title}
                            onChange={(e) => setNewDeck({ ...newDeck, title: e.target.value })}
                            onKeyPress={(e) => e.key === 'Enter' && createDeck()}
                        />
                        <input
                            type="text"
                            placeholder="Enter subject"
                            value={newDeck.subject}
                            onChange={(e) => setNewDeck({ ...newDeck, subject: e.target.value })}
                            onKeyPress={(e) => e.key === 'Enter' && createDeck()}
                        />
                        <div className="form-buttons">
                            <button onClick={createDeck}>Create</button>
                            <button onClick={() => setIsCreatingDeck(false)}>Cancel</button>
                        </div>
                    </div>
                )}

                <div className="deck-list">
                    {isLoadingDecks ? (
                        <div className="loading-spinner">Loading decks...</div>
                    ) : (
                        decks.map(deck => (
                            <div 
                                key={deck.id} 
                                className={`deck-item ${selectedDeck?.id === deck.id ? 'selected' : ''}`}
                                onClick={() => setSelectedDeck(deck)}
                            >
                                <div className="deck-info">
                                    <span className="deck-title">{deck.title}</span>
                                    <span className="deck-subject">{deck.subject}</span>
                                </div>
                                <button 
                                    className="delete-button"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        deleteDeck(deck.id);
                                    }}
                                >
                                    <FiTrash2 />
                                </button>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {selectedDeck && (
                <div className="cards-section">
                    <div className="section-header">
                        <h3>Cards in {selectedDeck.title}</h3>
                        <button 
                            className="add-button"
                            onClick={() => setIsCreatingCard(true)}
                        >
                            <FiPlus /> New Card
                        </button>
                    </div>

                    {isCreatingCard && (
                        <div className="create-form">
                            <input
                                type="text"
                                placeholder="Front of card"
                                value={newCard.front}
                                onChange={(e) => setNewCard({ ...newCard, front: e.target.value })}
                                onKeyPress={(e) => e.key === 'Enter' && createCard()}
                            />
                            <input
                                type="text"
                                placeholder="Back of card"
                                value={newCard.back}
                                onChange={(e) => setNewCard({ ...newCard, back: e.target.value })}
                                onKeyPress={(e) => e.key === 'Enter' && createCard()}
                            />
                            <input
                                type="date"
                                value={newCard.scheduled_date}
                                onChange={(e) => {
                                    console.log('Date selected:', e.target.value); // Debug log
                                    setNewCard({ ...newCard, scheduled_date: e.target.value });
                                }}
                                min={new Date().toISOString().split('T')[0]}
                            />
                            <div className="form-buttons">
                                <button onClick={createCard}>Create</button>
                                <button onClick={() => setIsCreatingCard(false)}>Cancel</button>
                            </div>
                        </div>
                    )}

                    <div className="card-list">
                        {isLoadingCards ? (
                            <div className="loading-spinner">Loading cards...</div>
                        ) : cards.length > 0 ? (
                            cards.map(card => (
                                <div key={card.id} className="card-item">
                                    <div className="card-content">
                                        <div className="card-front">{card.question}</div>
                                        <div className="card-back">{card.answer}</div>
                                        {card.scheduled_date && (
                                            <div className="card-review-date">
                                                Review: {formatDate(card.scheduled_date)}
                                            </div>
                                        )}
                                    </div>
                                    <button 
                                        className="delete-button"
                                        onClick={() => deleteCard(selectedDeck.id, card.id)}
                                    >
                                        <FiTrash2 />
                                    </button>
                                </div>
                            ))
                        ) : (
                            <div className="no-cards">No cards in this deck yet</div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default DeckManager; 