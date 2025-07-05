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
      const refreshToken = sessionStorage.getItem('refresh_token');
      
      if (storedUser && storedUser !== 'undefined' && jwtToken && refreshToken) {
        setUser(JSON.parse(storedUser));
      } else {
        // Clear any stale data if tokens are missing
        sessionStorage.removeItem('user');
        sessionStorage.removeItem('jwt_token');
        sessionStorage.removeItem('refresh_token');
        setUser(null);
      }
    } catch (error) {
      console.error('Error loading user from sessionStorage:', error);
      sessionStorage.removeItem('user');
      sessionStorage.removeItem('jwt_token');
      sessionStorage.removeItem('refresh_token');
      setUser(null);
    }
    setLoading(false);
  }, []);

  const login = (userData, tokens) => {
    try {
      setUser(userData);
      sessionStorage.setItem('user', JSON.stringify(userData));
      
      // Store both access and refresh tokens
      if (tokens?.access) {
        sessionStorage.setItem('jwt_token', tokens.access);
      }
      if (tokens?.jwt_refresh) {
        sessionStorage.setItem('refresh_token', tokens.jwt_refresh);
      }
    } catch (error) {
      console.error('Error saving user to sessionStorage:', error);
    }
  };

  const logout = () => {
    setUser(null);
    sessionStorage.removeItem('user');
    sessionStorage.removeItem('jwt_token');
    sessionStorage.removeItem('refresh_token');
  };

  const updateTokens = (tokens) => {
    try {
      if (tokens?.access) {
        sessionStorage.setItem('jwt_token', tokens.access);
      }
      if (tokens?.jwt_refresh) {
        sessionStorage.setItem('refresh_token', tokens.jwt_refresh);
      }
    } catch (error) {
      console.error('Error updating tokens:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading, updateTokens }}>
      {children}
    </AuthContext.Provider>
  );
};