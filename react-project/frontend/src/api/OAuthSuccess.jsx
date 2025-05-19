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
        .then(res => {
          console.log('Login successful', res.data)

          const { jwt_token, email } = res.data;

          sessionStorage.setItem('jwt_token', jwt_token)
          login({ email })

          navigate('/dashboard');
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
  }, [searchParams, navigate]);

  return (
    <div className="auth-loading-container">
      <h1 className="auth-loading-title">NEURONOTE</h1>
    </div>
  );
}

export default Authentication;