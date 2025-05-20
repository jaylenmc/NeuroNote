import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';

const UpcomingReviews = () => {
    const [upcoming, setUpcoming] = useState([]);
    const [dayIndex, setDayIndex] = useState(0);
    const [cardIndexes, setCardIndexes] = useState({});
    const [calendarHeight, setCalendarHeight] = useState(420);
    const [decks, setDecks] = useState({});
    const calendarRef = useRef(null);
    const api = import.meta.env.VITE_API_URL;

    useEffect(() => {
        const fetchDecks = async () => {
            try {
                const jwt_token = sessionStorage.getItem('jwt_token');
                if (!jwt_token) {
                    console.error('No JWT token found');
                    return;
                }
                const config = {
                    headers: {
                        'Authorization': `Bearer ${jwt_token}`,
                        'Content-Type': 'application/json'
                    }
                };
                const response = await axios.get(`${api}flashcards/decks/`, config);
                console.log('Decks response:', response.data);
                const decksMap = {};
                response.data.forEach(deck => {
                    decksMap[deck.id] = deck;
                });
                setDecks(decksMap);
            } catch (error) {
                console.error('Error fetching decks:', error);
            }
        };

        const fetchCards = async () => {
            try {
                const jwt_token = sessionStorage.getItem('jwt_token');
                if (!jwt_token) {
                    console.error('No JWT token found');
                    return;
                }
                const config = {
                    headers: {
                        'Authorization': `Bearer ${jwt_token}`,
                        'Content-Type': 'application/json'
                    }
                };
                const response = await axios.get(`${api}flashcards/cards/`, config);
                console.log('Cards response:', response.data);
                
                const today = new Date();
                const next7 = Array.from({length: 7}, (_, i) => {
                    const d = new Date(today);
                    d.setDate(today.getDate() + i);
                    return d.toISOString().split('T')[0];
                });
                console.log('Next 7 days:', next7);

                const grouped = {};
                response.data.forEach(card => {
                    if (card.scheduled_date && next7.includes(card.scheduled_date)) {
                        if (!grouped[card.scheduled_date]) grouped[card.scheduled_date] = [];
                        grouped[card.scheduled_date].push(card);
                    }
                });
                console.log('Grouped cards:', grouped);

                const filteredDays = next7
                    .map(date => ({
                        date,
                        cards: grouped[date] || []
                    }))
                    .filter(day => day.cards.length > 0);
                console.log('Filtered days:', filteredDays);

                setUpcoming(filteredDays);
                setCardIndexes({});
                setDayIndex(0);
            } catch (error) {
                console.error('Error fetching cards:', error);
                setUpcoming([]);
            }
        };

        fetchDecks();
        fetchCards();
    }, []);

    useEffect(() => {
        if (calendarRef.current) {
            setCalendarHeight(calendarRef.current.offsetHeight);
        }
    }, [upcoming]);

    const handlePrevDay = () => {
        setDayIndex(idx => (idx > 0 ? idx - 1 : upcoming.length - 1));
    };

    const handleNextDay = () => {
        setDayIndex(idx => (idx < upcoming.length - 1 ? idx + 1 : 0));
    };

    const handlePrevCard = (cardsLength) => {
        setCardIndexes(prev => ({
            ...prev,
            [dayIndex]: prev[dayIndex] > 0 ? prev[dayIndex] - 1 : cardsLength - 1
        }));
    };

    const handleNextCard = (cardsLength) => {
        setCardIndexes(prev => ({
            ...prev,
            [dayIndex]: prev[dayIndex] < cardsLength - 1 ? prev[dayIndex] + 1 : 0
        }));
    };

    const current = upcoming[dayIndex] || { date: '', cards: [] };
    const cardIdx = cardIndexes[dayIndex] || 0;
    const card = current.cards[cardIdx];
    const deck = card ? decks[card.deck] : null;

    return (
        <div
            className="upcoming-reviews swipe-mode"
            style={{ height: calendarHeight }}
        >
            <div ref={calendarRef} style={{ display: 'none' }} className="calendar-widget-mock" />
            <h4>Upcoming Reviews {card && deck ? `- ${deck.name}` : ''}</h4>
            {upcoming.length > 0 ? (
                <>
                    <div className="upcoming-day-swipe-row">
                        <button className="swipe-btn" onClick={handlePrevDay} aria-label="Previous day">&lt;</button>
                        <div className="upcoming-date">{current.date ? new Date(current.date).toLocaleDateString() : ''}</div>
                        <button className="swipe-btn" onClick={handleNextDay} aria-label="Next day">&gt;</button>
                    </div>
                    {card ? (
                        <div className="upcoming-swipe-card">
                            <button className="swipe-btn" onClick={() => handlePrevCard(current.cards.length)} aria-label="Previous card">&lt;</button>
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
                                <div className="upcoming-card-question">{card.question}</div>
                                <div className="upcoming-card-subject">
                                    {deck ? `${deck.name} - ${deck.subject}` : 'No Subject'}
                                </div>
                            </div>
                            <button className="swipe-btn" onClick={() => handleNextCard(current.cards.length)} aria-label="Next card">&gt;</button>
                        </div>
                    ) : (
                        <div className="no-cards">No cards scheduled for this day</div>
                    )}
                </>
            ) : (
                <div className="no-cards">No upcoming reviews scheduled</div>
            )}
        </div>
    );
};

export default UpcomingReviews; 