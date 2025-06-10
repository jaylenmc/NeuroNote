import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FiArrowLeft } from 'react-icons/fi';
import ReviewWidget from '../components/ReviewWidget';
import './ReviewPage.css';

const ReviewPage = () => {
  const navigate = useNavigate();

  return (
    <div className="review-page">
      <div className="review-header">
        <button className="back-button" onClick={() => navigate('/study-room')}>
          <FiArrowLeft /> Back to Study Room
        </button>
      </div>
      <div className="review-content">
        <ReviewWidget />
      </div>
    </div>
  );
};

export default ReviewPage; 