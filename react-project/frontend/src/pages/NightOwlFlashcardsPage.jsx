import React, { useEffect } from 'react';
import Dashboard from '../components/Dashboard';

const NightOwlFlashcardsPage = () => {
  // Remove the global navbar if present
  useEffect(() => {
    const navbar = document.querySelector('.nn-navbar-global');
    if (navbar) navbar.style.display = 'none';
    return () => {
      if (navbar) navbar.style.display = '';
    };
  }, []);

  // Render Dashboard with flashcards view
  return <Dashboard initialView="flashcards" />;
};

export default NightOwlFlashcardsPage; 