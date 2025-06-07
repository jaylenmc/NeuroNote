import React from 'react';
import bookshelfImg from '../assets/bookshelf.jpg';
import ReviewCards from './ReviewCards';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css';

export default function StudyRoom() {
    const navigate = useNavigate();
    return (
        <div className="flashcards-blur-bg">
            <div className="flashcards-blur-img" style={{ backgroundImage: `url(${bookshelfImg})` }} />
            <div className="flashcards-vignette" />
            <div className="content-section">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32 }}>
                    <h2>Study Room</h2>
                    <button className="enter-study-room-btn" onClick={() => navigate('/dashboard')}>Back to Flashcards</button>
                </div>
                <ReviewCards />
                {/* Add Decks, Cards, StudySessions components here as needed */}
            </div>
        </div>
    );
} 