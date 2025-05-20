import React, { createContext, useState, useContext, useEffect } from 'react';

// Create context
const AuthContext = createContext();

// Custom hook
export const useAuth = () => useContext(AuthContext);

// Provider component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load user from sessionStorage
  useEffect(() => {
    try {
      const storedUser = sessionStorage.getItem('user');
      const jwtToken = sessionStorage.getItem('jwt_token');
      
      if (storedUser && storedUser !== 'undefined' && jwtToken) {
      setUser(JSON.parse(storedUser));
      } else {
        // Clear any stale data if token is missing
        sessionStorage.removeItem('user');
        setUser(null);
      }
    } catch (error) {
      console.error('Error loading user from sessionStorage:', error);
      sessionStorage.removeItem('user');
      setUser(null);
    }
    setLoading(false);
  }, []);

  const login = (userData) => {
    try {
    setUser(userData);
      sessionStorage.setItem('user', JSON.stringify(userData));
    } catch (error) {
      console.error('Error saving user to sessionStorage:', error);
    }
  };

  const logout = () => {
    setUser(null);
    sessionStorage.removeItem('user');
    sessionStorage.removeItem('jwt_token');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};