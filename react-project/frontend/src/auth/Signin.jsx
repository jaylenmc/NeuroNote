import React from 'react';
import { FcGoogle } from 'react-icons/fc';
import './signin.css';

function Signin() {
    const handleGoogleSignIn = () => {
        // TODO: Implement Google Sign-in logic
        console.log('Google sign-in clicked');
    };

    return (
        <div className="signin-container">
            <div className="signin-box">
                <div className="app-branding">
                    <h1>NeuroNote</h1>
                    <p>Your Digital Brain, Organized</p>
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