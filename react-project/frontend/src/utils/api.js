// API utility functions for authenticated requests

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
    let token = sessionStorage.getItem('jwt_token');
    
    if (isTokenExpired(token)) {
        token = await refreshAccessToken();
        if (!token) return null; // If refresh failed, return null
    }

    const response = await fetch(url, {
        ...options,
        headers: {
            ...options.headers,
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
    });

    if (response.status === 401) {
        // Try refreshing token once more
        token = await refreshAccessToken();
        if (!token) return null;

        // Retry the request with new token
        return fetch(url, {
            ...options,
            headers: {
                ...options.headers,
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        });
    }

    return response;
}; 