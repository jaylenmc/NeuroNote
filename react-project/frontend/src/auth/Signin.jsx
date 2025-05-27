import React, { useEffect, useState } from 'react';
import { FcGoogle } from 'react-icons/fc';
import './signin.css';
import generateState from '../utils/auth';

function Signin() {
    const [error, setError] = useState('');

    useEffect(() => {
        const authError = sessionStorage.getItem('auth_error');
        if (authError) {
            setError(authError);
            sessionStorage.removeItem('auth_error');
            // Clear error message after 5 seconds
            const timer = setTimeout(() => {
                setError('');
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, []);

    const handleGoogleSignIn = () => {
        const state = generateState();
        sessionStorage.setItem('oauth_state', state);
        const api = import.meta.env.VITE_API_URL;

        const OAUTH_URL = 'https://accounts.google.com/o/oauth2/v2/auth?' +
        new URLSearchParams({
            client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
            redirect_uri: 'http://localhost:5173/auth/callback/',
            response_type: "code",
            scope: 'openid email profile',
            access_type: 'offline',
            prompt: 'consent',
            state: state
        }).toString();

        window.location.href = OAUTH_URL;
    };

    return (
        <div className="signin-container">
            <div className="signin-box">
                {error && (
                    <div className="error-message-popup">
                        {error}
                    </div>
                )}
                <div className="app-branding">
                    <h1 className="neuronote-title">NEURONOTE</h1>
                </div>
                
                <div className="signin-content">
                    <button 
                        className="google-signin-button"
                        onClick={handleGoogleSignIn}
                    >
                        <FcGoogle className="google-icon" />
                        <span>Continue with Google</span>
                    </button>
                </div>
            </div>
        </div>
    );
}

export default Signin;