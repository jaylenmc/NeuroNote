import { useEffect } from 'react';
import axios from 'axios';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext'
import './OAuthSuccess.css';

function Authentication() {
  const api = import.meta.env.VITE_API_URL;
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { login } = useAuth()

  useEffect(() => {
    const returnedState = searchParams.get('state');
    const storedState = sessionStorage.getItem('oauth_state');
    const code = searchParams.get('code');

    if (returnedState !== storedState) {
      console.error('OAuth state mismatch! Potential CSRF attack.');
      sessionStorage.setItem('auth_error', 'Authentication failed. Please try again.');
      navigate('/signin');
      return;
    }

    sessionStorage.removeItem('oauth_state');

    if (code) {
      axios.post(`${ api }auth/google/`, { code })
        .then(async res => {
          console.log('Login successful', res.data)

          const { user, jwt_refresh } = res.data;

          // Store the refresh token first
          sessionStorage.setItem('refresh_token', jwt_refresh);
          sessionStorage.setItem('user', JSON.stringify(user));

          // Make an initial token refresh to get an access token
          try {
            const refreshResponse = await axios.post(`${api}auth/token/refresh/`, {
              refresh_token: jwt_refresh
            }, {
              headers: {
                'Content-Type': 'application/json'
              }
            });

            const { access } = refreshResponse.data;
            sessionStorage.setItem('jwt_token', access);

            // Update the auth context
            login(user, { access, jwt_refresh });
            navigate('/dashboard');
          } catch (refreshError) {
            console.error('Failed to get initial access token:', refreshError);
            sessionStorage.setItem('auth_error', 'Authentication failed. Please try again.');
            navigate('/signin');
          }
        })
        .catch(err => {
          if (err.response) {
            console.log('OAuth error: ', err.response.data)
          } else {
            console.error('OAuth error', err);
          }
          sessionStorage.setItem('auth_error', 'Authentication failed. Please try again.');
          navigate('/signin');
        })
    }
  }, [searchParams, navigate, login]);

  return (
    <div className="auth-loading-container">
      <h1 className="auth-loading-title">NEURONOTE</h1>
    </div>
  );
}

export default Authentication;