import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FiPlus, FiTrash2 } from 'react-icons/fi';
import './DeckManager.css';
import { getAuthHeader, handleApiError } from '../utils/auth';

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
    const api = import.meta.env.VITE_API_URL;

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
            const headers = await getAuthHeader();
            const response = await axios.get(`${api}flashcards/deck/`, { headers });
            setDecks(response.data);
        } catch (error) {
            try {
                await handleApiError(error);
                // Retry the request with new token
                const newHeaders = await getAuthHeader();
                const response = await axios.get(`${api}flashcards/deck/`, { headers: newHeaders });
                setDecks(response.data);
            } catch (retryError) {
                console.error('Error fetching decks:', retryError);
            }
        } finally {
            setIsLoadingDecks(false);
        }
    };

    const fetchCards = async (deckId) => {
        setIsLoadingCards(true);
        try {
            const headers = await getAuthHeader();
            const response = await axios.get(`${api}flashcards/cards/`, { headers });
            
            const deckCards = response.data.filter(card => card.card_deck === deckId);
            console.log('Fetched cards:', deckCards);
            setCards(deckCards);
            
        } catch (error) {
            try {
                await handleApiError(error);
                // Retry the request with new token
                const newHeaders = await getAuthHeader();
                const response = await axios.get(`${api}flashcards/cards/`, { headers: newHeaders });
                const deckCards = response.data.filter(card => card.card_deck === deckId);
                setCards(deckCards);
            } catch (retryError) {
                console.error('Error fetching cards:', retryError);
                setCards([]);
            }
        } finally {
            setIsLoadingCards(false);
        }
    };

    const createDeck = async () => {
        if (!newDeck.title.trim() || !newDeck.subject.trim()) return;
        
        try {
            const headers = await getAuthHeader();
            await axios.post(`${api}flashcards/deck/`, 
                newDeck,
                { headers }
            );
            setNewDeck({ title: '', subject: '' });
            setIsCreatingDeck(false);
            fetchDecks();
        } catch (error) {
            try {
                await handleApiError(error);
                // Retry the request with new token
                const newHeaders = await getAuthHeader();
                await axios.post(`${api}flashcards/deck/`, 
                    newDeck,
                    { headers: newHeaders }
                );
                setNewDeck({ title: '', subject: '' });
                setIsCreatingDeck(false);
                fetchDecks();
            } catch (retryError) {
                console.error('Error creating deck:', retryError);
            }
        }
    };

    const deleteDeck = async (deckId) => {
        try {
            const headers = await getAuthHeader();
            await axios.delete(`${api}flashcards/deck/delete/${deckId}`, { headers });
            if (selectedDeck?.id === deckId) {
                setSelectedDeck(null);
                setCards([]);
            }
            fetchDecks();
        } catch (error) {
            try {
                await handleApiError(error);
                // Retry the request with new token
                const newHeaders = await getAuthHeader();
                await axios.delete(`${api}flashcards/deck/delete/${deckId}`, { headers: newHeaders });
                if (selectedDeck?.id === deckId) {
                    setSelectedDeck(null);
                    setCards([]);
                }
                fetchDecks();
            } catch (retryError) {
                console.error('Error deleting deck:', retryError);
            }
        }
    };

    const createCard = async () => {
        if (!newCard.front.trim() || !newCard.back.trim()) return;
        
        try {
            const headers = await getAuthHeader();
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
            
            const response = await axios.post(`${api}flashcards/cards/`,
                cardData,
                { headers }
            );
            
            console.log('Card creation response:', response.data);
            
            setNewCard({ 
                front: '', 
                back: '',
                scheduled_date: new Date().toISOString().split('T')[0]
            });
            setIsCreatingCard(false);
            fetchCards(selectedDeck.id);
        } catch (error) {
            try {
                await handleApiError(error);
                // Retry the request with new token
                const newHeaders = await getAuthHeader();
                const scheduledDate = newCard.scheduled_date ? 
                    new Date(newCard.scheduled_date + 'T00:00:00').toISOString().split('T')[0] : 
                    null;

                const cardData = {
                    "answer": newCard.back,
                    "question": newCard.front,
                    "deck_id": selectedDeck.id,
                    "scheduled_date": scheduledDate
                };
                
                const response = await axios.post(`${api}flashcards/cards/`,
                    cardData,
                    { headers: newHeaders }
                );
                
                setNewCard({ 
                    front: '', 
                    back: '',
                    scheduled_date: new Date().toISOString().split('T')[0]
                });
                setIsCreatingCard(false);
                fetchCards(selectedDeck.id);
            } catch (retryError) {
                console.error('Error creating card:', retryError);
            }
        }
    };

    const deleteCard = async (deckId, cardId) => {
        try {
            const headers = await getAuthHeader();
            await axios.delete(`${api}flashcards/cards/delete/${deckId}/${cardId}`, { headers });
            fetchCards(selectedDeck.id);
        } catch (error) {
            try {
                await handleApiError(error);
                // Retry the request with new token
                const newHeaders = await getAuthHeader();
                await axios.delete(`${api}flashcards/cards/delete/${deckId}/${cardId}`, { headers: newHeaders });
                fetchCards(selectedDeck.id);
            } catch (retryError) {
                console.error('Error deleting card:', retryError);
            }
        }
    };

    const formatDate = (dateString) => {
        if (!dateString || dateString === '1969-12-31') return null;
        try {
            // Create date in local timezone
            const date = new Date(dateString + 'T00:00:00');
            if (isNaN(date.getTime())) return null;
            return date.toLocaleDateString();
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