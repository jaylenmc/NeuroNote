// API utility functions for authenticated requests

import api from '../api/axios';

const isTokenExpired = (token) => {
    if (!token) return true;
    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        return payload.exp * 1000 < Date.now();
    } catch (error) {
        return true;
    }
};

const refreshAccessToken = async () => {
    try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}auth/token/refresh/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include', // Important for cookies
        });

        if (response.ok) {
            const data = await response.json();
            sessionStorage.setItem('jwt_token', data.access);
            return data.access;
        } else {
            console.error('Failed to refresh token:', await response.text());
            // Clear token and redirect to login
            sessionStorage.removeItem('jwt_token');
            window.location.href = '/signin';
            return null;
        }
    } catch (error) {
        console.error('Error refreshing token:', error);
        sessionStorage.removeItem('jwt_token');
        window.location.href = '/signin';
        return null;
    }
};

export const makeAuthenticatedRequest = async (url, options = {}) => {
  // options: { method, data, ... }
  try {
    let response;
    if (options.method === 'POST') {
      response = await api.post(url, options.data);
    } else if (options.method === 'PUT') {
      response = await api.put(url, options.data);
    } else {
      response = await api.get(url);
    }
    return response;
  } catch (error) {
    // api instance will handle token refresh and errors
    throw error;
  }
}; 