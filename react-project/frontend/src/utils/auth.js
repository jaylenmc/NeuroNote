import axios from 'axios';

const api = import.meta.env.VITE_API_URL;

export const refreshToken = async () => {
    try {
        const response = await axios.post(`${api}auth/token/refresh/`);
        const newToken = response.data.access;
        sessionStorage.setItem('jwt_token', newToken);
        return newToken;
    } catch (error) {
        console.error('Error refreshing token:', error);
        // If refresh fails, redirect to login
        sessionStorage.removeItem('jwt_token');
        window.location.href = '/login';
        return null;
    }
};

export const getAuthHeader = async () => {
    let token = sessionStorage.getItem('jwt_token');
    if (!token) {
        return null;
    }
    return {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
    };
};

export const handleApiError = async (error) => {
    if (error.response?.status === 401) {
        const newToken = await refreshToken();
        if (newToken) {
            return newToken;
        }
    }
    throw error;
};

function generateState(length = 32) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  return Array.from(crypto.getRandomValues(new Uint8Array(length)))
    .map(x => chars[x % chars.length])
    .join('');
}

export default generateState;