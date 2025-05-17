import { useEffect } from 'react';
import axios from 'axios';
import { useSearchParams, useNavigate } from 'react-router-dom';

function Authentication() {
  const api = import.meta.env.VITE_API_URL;
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const code = searchParams.get('code');

    if (code) {
      axios.post(`${ api }auth/google/`, { code })
        .then(res => {
          console.log('Login successful', res.data)
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