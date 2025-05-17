import { useEffect } from 'react';
import axios from 'axios';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext'

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
      return;
    }

    sessionStorage.removeItem('oauth_state');

    if (code) {
      axios.post(`${ api }auth/google/`, { code })
        .then(res => {
          console.log('Login successful', res.data)

          const { token, user } = res.data;

          localStorage.setItem('token', token)
          login(user)

          navigate('/dashboard');
        })
        .catch(err => {
          if (err.response) {
            console.log('OAuth error: ', err.response.data)
          } else {
            console.error('OAuth error', err);
          }
        })
    }
  }, [searchParams, navigate]);

  return <div>Loggin you in..</div>;
}

export default Authentication;