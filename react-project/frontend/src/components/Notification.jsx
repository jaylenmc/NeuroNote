import React from 'react';

const Notification = ({ notification }) => {
    if (!notification.show) return null;

    return (
        <div 
            className="notification" 
            style={{ 
                backgroundColor: notification.type === 'success' ? '#4CAF50' : '#f44336',
                position: 'fixed',
                top: '20px',
                right: '20px',
                padding: '12px 20px',
                borderRadius: '4px',
                color: 'white',
                zIndex: 1000,
                boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
            }}
        >
            {notification.message}
        </div>
    );
};

export default Notification; 