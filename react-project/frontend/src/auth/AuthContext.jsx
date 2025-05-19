import React, { createContext, useState, useContext, useEffect } from 'react';

// Create context
const AuthContext = createContext();

// Custom hook
export const useAuth = () => useContext(AuthContext);

// Provider component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load user from localStorage (or token logic)
  useEffect(() => {
    try {
      const storedUser = localStorage.getItem('user');
      if (storedUser && storedUser !== 'undefined') {
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error('Error loading user from localStorage:', error);
      localStorage.removeItem('user'); // Clear invalid data
    }
    setLoading(false);
  }, []);

  const login = (userData) => {
    try {
      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));
    } catch (error) {
      console.error('Error saving user to localStorage:', error);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};