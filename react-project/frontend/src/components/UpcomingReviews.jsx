import React, { useEffect, useState, useRef } from 'react';
import { FiChevronLeft, FiChevronRight, FiCalendar } from 'react-icons/fi';
import './UpcomingReviews.css';
import { formatDateForDisplay, convertBackendDateToLocal } from '../utils/dateUtils';
import api from '../api/axios';

const UpcomingReviews = ({ calendarHeight = '300px', deck = null }) => {
    const [upcoming, setUpcoming] = useState([]);
    const [dayIndex, setDayIndex] = useState(0);
    const [cardIndexes, setCardIndexes] = useState({});
    const [decks, setDecks] = useState({});
    const calendarRef = useRef(null);

    const current = upcoming[dayIndex] || { date: null, cards: [] };
    const cardIndex = cardIndexes[current.date] || 0;
    const card = current.cards[cardIndex];

    useEffect(() => {
        const fetchDecks = async () => {
            try {
                const response = await api.get('/flashcards/decks/');
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
                const response = await api.get('/flashcards/cards/');
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
                    if (card.scheduled_date) {
                        // Convert backend date to local date for proper grouping
                        const localDate = convertBackendDateToLocal(card.scheduled_date);
                        if (next7.includes(localDate)) {
                            if (!grouped[localDate]) grouped[localDate] = [];
                            grouped[localDate].push(card);
                        }
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
        setDayIndex(prev => prev > 0 ? prev - 1 : upcoming.length - 1);
    };

    const handleNextDay = () => {
        setDayIndex(prev => prev < upcoming.length - 1 ? prev + 1 : 0);
    };

    const handlePrevCard = (totalCards) => {
        setCardIndexes(prev => ({
            ...prev,
            [current.date]: prev[current.date] > 0 ? prev[current.date] - 1 : totalCards - 1
        }));
    };

    const handleNextCard = (totalCards) => {
        setCardIndexes(prev => ({
            ...prev,
            [current.date]: prev[current.date] < totalCards - 1 ? prev[current.date] + 1 : 0
        }));
    };

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
                        <div className="upcoming-date">{current.date ? formatDateForDisplay(current.date) : ''}</div>
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