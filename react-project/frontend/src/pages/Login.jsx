import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../auth/AuthContext';
import './Auth.css';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();
    const { isDarkMode } = useTheme();
    const { login } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            await login(email, password);
            navigate('/dashboard');
        } catch (error) {
            setError('Failed to log in. Please check your credentials.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className={`auth-container ${isDarkMode ? 'dark-mode' : ''}`}>
            <div className="auth-card">
                <h1>Welcome Back</h1>
                <p className="auth-subtitle">Sign in to continue your learning journey</p>

                {error && <div className="auth-error">{error}</div>}

                <form onSubmit={handleSubmit} className="auth-form">
                    <div className="form-group">
                        <label htmlFor="email">Email</label>
                        <input
                            type="email"
                            id="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            placeholder="Enter your email"
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="password">Password</label>
                        <input
                            type="password"
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            placeholder="Enter your password"
                        />
                    </div>

                    <button 
                        type="submit" 
                        className="auth-button"
                        disabled={isLoading}
                    >
                        {isLoading ? 'Signing in...' : 'Sign In'}
                    </button>
                </form>

                <p className="auth-footer">
                    Don't have an account?{' '}
                    <Link to="/register" className="auth-link">
                        Sign up
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default Login; 