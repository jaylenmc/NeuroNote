import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../auth/AuthContext';
import './Auth.css';

const Register = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();
    const { isDarkMode } = useTheme();
    const { register } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        setIsLoading(true);

        try {
            await register(email, password);
            navigate('/dashboard');
        } catch (error) {
            setError('Failed to create an account. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className={`auth-container ${isDarkMode ? 'dark-mode' : ''}`}>
            <div className="auth-card">
                <h1>Create Account</h1>
                <p className="auth-subtitle">Join NeuroNote and start your learning journey</p>

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
                            placeholder="Create a password"
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="confirmPassword">Confirm Password</label>
                        <input
                            type="password"
                            id="confirmPassword"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                            placeholder="Confirm your password"
                        />
                    </div>

                    <button 
                        type="submit" 
                        className="auth-button"
                        disabled={isLoading}
                    >
                        {isLoading ? 'Creating Account...' : 'Create Account'}
                    </button>
                </form>

                <p className="auth-footer">
                    Already have an account?{' '}
                    <Link to="/login" className="auth-link">
                        Sign in
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default Register; 