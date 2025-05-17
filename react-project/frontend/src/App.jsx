// src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Route, Routes, Link, Navigate } from 'react-router-dom';
import Home from './Home';  // Import the Home page component
import About from './About'; // Import the About page component
import './App.css'; // Import the CSS file
import Signin from './auth/Signin';
import Authentication from './api/OAuthSuccess';
import { useAuth, AuthProvider } from './auth/AuthContext'; // or wherever it's defined

// Protected Route component
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <div>Loading...</div>;
  }
  
  if (!user) {
    return <Navigate to="/" />;
  }
  
  return children;
};

function Navbar() {
  const { user, logout } = useAuth();
  
  return (
    <nav className="nn-navbar-global">
      <div className="nn-logo">
        <span className="nn-logo-text">NeuroNote</span>
      </div>
      <div className="nn-nav-links">
        <Link to="/">Home</Link>
        <Link to="/about">About us</Link>
        <Link to="/pricing">Pricing</Link>
        <Link to="/features">Features</Link>
        {user ? (
          <>
            <Link to="/dashboard">Dashboard</Link>
            <button onClick={logout} className="nn-signup-btn-minimal">Logout</button>
          </>
        ) : (
          <Link to="/signup" className="nn-signup-btn-minimal">Get Started</Link>
        )}
      </div>
    </nav>
  );
}

function App() {
  return (
    <div className="app">
      <AuthProvider>
        <Router>
          <Navbar />
          <main className="main-content">
            <Routes>
              <Route path='/auth/callback/' element={<Authentication />}></Route>
              <Route path="/" element={<Home />} /> {/* Home page route */}
              <Route path="/about" element={<About />} /> {/* About page route */}
              <Route path="/features" element={<div>Features Page</div>} />
              <Route path="/pricing" element={<div>Pricing Page</div>} />
              <Route path="/signup" element={<div>Sign Up Page</div>} />
              <Route 
                path="/dashboard" 
                element={
                  <ProtectedRoute>
                    <div>Dashboard Page</div>
                  </ProtectedRoute>
                } 
              />
              <Route path='/signin' element={ <Signin /> }/>
            </Routes>
          </main>
        </Router>
      </AuthProvider>
    </div>
  );
}

export default App;