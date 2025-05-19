import React, { useState, useEffect } from 'react';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import axios from 'axios';
import './Calendar.css';

function Calendar() {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [scheduledCards, setScheduledCards] = useState({});
    const api = import.meta.env.VITE_API_URL;

    useEffect(() => {
        const fetchCards = async () => {
            try {
                const jwt_token = sessionStorage.getItem('jwt_token');
                
                const config = {
                    headers: {
                        'Authorization': `Bearer ${jwt_token}`,
                        'Content-Type': 'application/json'
                    }
                };

                const response = await axios.get(`${api}flashcards/cards/`, config);
                
                // Group cards by scheduled date
                const cardsByDate = {};
                response.data.forEach(card => {
                    if (card.scheduled_date) {
                        const date = card.scheduled_date;
                        if (!cardsByDate[date]) {
                            cardsByDate[date] = [];
                        }
                        cardsByDate[date].push(card);
                    }
                });
                setScheduledCards(cardsByDate);
            } catch (error) {
                console.error('Error fetching cards:', error);
            }
        };

        fetchCards();
    }, [api]);

    const months = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];

    const getDaysInMonth = (date) => {
        return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
    };

    const getFirstDayOfMonth = (date) => {
        return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
    };

    const goToPreviousMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
    };

    const goToNextMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
    };

    const formatDateString = (year, month, day) => {
        const paddedMonth = String(month + 1).padStart(2, '0');
        const paddedDay = String(day).padStart(2, '0');
        return `${year}-${paddedMonth}-${paddedDay}`;
    };

    const renderCalendarDays = () => {
        const daysInMonth = getDaysInMonth(currentDate);
        const firstDayOfMonth = getFirstDayOfMonth(currentDate);
        const days = [];

        // Add empty cells for days before the first day of the month
        for (let i = 0; i < firstDayOfMonth; i++) {
            days.push(<div key={`empty-${i}`} className="calendar-day empty"></div>);
        }

        // Add the days of the month
        for (let day = 1; day <= daysInMonth; day++) {
            const dateString = formatDateString(
                currentDate.getFullYear(),
                currentDate.getMonth(),
                day
            );
            const isToday = new Date().toDateString() === new Date(currentDate.getFullYear(), currentDate.getMonth(), day).toDateString();
            const hasCards = scheduledCards[dateString]?.length > 0;

            days.push(
                <div 
                    key={day} 
                    className={`calendar-day ${isToday ? 'today' : ''}`}
                >
                    {day}
                    {hasCards && (
                        <div className="card-indicator">
                            {scheduledCards[dateString].length}
                        </div>
                    )}
                </div>
            );
        }

        return days;
    };

    return (
        <div className="calendar-widget">
            <div className="calendar-header">
                <button onClick={goToPreviousMonth} className="month-nav-btn">
                    <FiChevronLeft />
                </button>
                <h3>{months[currentDate.getMonth()]} {currentDate.getFullYear()}</h3>
                <button onClick={goToNextMonth} className="month-nav-btn">
                    <FiChevronRight />
                </button>
            </div>
            <div className="calendar-weekdays">
                <div>Sun</div>
                <div>Mon</div>
                <div>Tue</div>
                <div>Wed</div>
                <div>Thu</div>
                <div>Fri</div>
                <div>Sat</div>
            </div>
            <div className="calendar-days">
                {renderCalendarDays()}
            </div>
        </div>
    );
}

export default Calendar; 