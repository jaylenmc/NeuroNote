import axios from 'axios';

// Remove trailing slash from base URL if it exists
const baseURL = (import.meta.env.VITE_API_URL || 'http://localhost:8000/api').replace(/\/$/, '');

console.log('API Base URL:', baseURL);

const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true // Enable sending cookies for cross-site requests
});

// Create a separate axios instance for token refresh to avoid infinite loops
const refreshApi = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true // Enable sending cookies for cross-site requests
});

// Flag to prevent multiple refresh requests
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  
  failedQueue = [];
};

// Function to refresh token
const refreshToken = async () => {
  try {
    const refreshToken = sessionStorage.getItem('refresh_token');
    if (!refreshToken) {
      console.error('No refresh token found in sessionStorage');
      throw new Error('No refresh token available');
    }

    console.log('Attempting to refresh token...');
    
    // Send the refresh token in the request body
    const response = await refreshApi.post('/auth/token/refresh/', {
      refresh_token: refreshToken
    }, {
      headers: {
        'Content-Type': 'application/json'
      }
    });

    const { access } = response.data;
    sessionStorage.setItem('jwt_token', access);
    console.log('Token refreshed successfully');
    return access;
  } catch (error) {
    console.error('Token refresh failed:', error.response?.data || error.message);
    console.error('Full error:', error);
    
    // If the refresh token itself is invalid/expired, redirect to login
    if (error.response?.status === 401) {
      console.log('Refresh token is invalid/expired, redirecting to login');
      sessionStorage.removeItem('jwt_token');
      sessionStorage.removeItem('refresh_token');
      sessionStorage.removeItem('user');
      window.location.href = '/signin';
    }
    
    throw error;
  }
};

// Add a request interceptor to add the auth token to every request
api.interceptors.request.use(
  (config) => {
    const token = sessionStorage.getItem('jwt_token');
    console.log('Making request to:', config.url);
    console.log('With token:', token ? 'Present' : 'Missing');
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle token refresh
api.interceptors.response.use(
  (response) => {
    console.log('API Response:', {
      url: response.config.url,
      method: response.config.method,
      status: response.status,
      data: response.data
    });
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    
    console.error('API Error:', {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      data: error.response?.data,
      message: error.message
    });

    // If the error is 401 (Unauthorized) and we haven't tried to refresh yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      console.log('Received 401 error, attempting token refresh...');
      
      if (isRefreshing) {
        console.log('Token refresh already in progress, queuing request...');
        // If we're already refreshing, queue this request
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(token => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return api(originalRequest);
        }).catch(err => {
          return Promise.reject(err);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;
      console.log('Starting token refresh process...');

      try {
        const newToken = await refreshToken();
        processQueue(null, newToken);
        
        // Retry the original request with the new token
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        console.log('Retrying original request with new token...');
        return api(originalRequest);
      } catch (refreshError) {
        console.error('Token refresh failed, processing queue with error...');
        processQueue(refreshError, null);
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default api; 