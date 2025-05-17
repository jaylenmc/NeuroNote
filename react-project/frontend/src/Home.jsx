import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from './auth/AuthContext'; // or wherever you defined it

function Home() {
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);
  const [videoError, setVideoError] = useState(false);
  const videoRef = useRef(null);
  const { user } = useAuth();
  const navigate = useNavigate();

  const OAUTH_URL = 'https://accounts.google.com/o/oauth2/v2/auth?' +
    new URLSearchParams({
      client_id:'REDACTED',
      redirect_uri:'http://localhost:5173/auth/callback/',
      response_type: "code",
      scope: 'openid email profile',
      access_type: 'offline',
      prompt: 'consent',
    }).toString();

  const handleLogin = () => {
    window.location.href = OAUTH_URL;
  }

  useEffect(() => {
    const video = videoRef.current;
    if (video) {
      video.addEventListener('loadeddata', () => {
        setIsVideoLoaded(true);
      });
      video.addEventListener('error', () => {
        setVideoError(true);
      });
    }
  }, []);

  // Redirect to dashboard if user is already logged in
  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  return (
    <div style={{ background: 'var(--background)' }}>
      {/* Hero Section */}
      <section className="section text-center" style={{ position: 'relative', minHeight: '100vh', padding: 0, maxWidth: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {!videoError && (
          <video 
            ref={videoRef}
            autoPlay
            loop
            muted
            playsInline
            className="background-video"
            style={{
              opacity: isVideoLoaded ? 1 : 0,
              transition: 'opacity 0.5s ease-in-out'
            }}
          >
            <source src="/background.mp4" type="video/mp4"/>
          </video>
        )}
        {(!isVideoLoaded || videoError) && (
          <div 
            className="background-video"
            style={{
              background: 'linear-gradient(45deg, #ffffff 0%, #808080 50%, #000000 100%)',
              opacity: 0.9
            }}
          />
        )}
        <div style={{ 
          position: 'relative',
          zIndex: 2,
          opacity: isVideoLoaded ? 1 : 0,
          transition: 'opacity 0.5s ease-in-out',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          width: '100%'
        }}>
          <div className="hero-content">
            <h1 className="hero-title">Master Any Subject<br />Backed By Brain Science</h1>
            <p className="hero-subtitle">Minimal, modern note-taking powered by AI.</p>
            <button onClick={handleLogin} className="cta-btn">Get Started</button>
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="section text-center">
        <h2 style={{ color: 'var(--primary)', fontWeight: 700, fontSize: '1.7rem', marginBottom: '2rem' }}>How it Works</h2>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', flexWrap: 'wrap' }}>
          <div className="card">
            <div className="card-icon" role="img" aria-label="Note">📝</div>
            <div style={{ fontWeight: 600, marginBottom: '0.5rem' }}>Take Smart Notes</div>
            <div className="text-muted">Capture ideas and facts instantly, organized for recall.</div>
          </div>
          <div className="card">
            <div className="card-icon" role="img" aria-label="Flashcards">📚</div>
            <div style={{ fontWeight: 600, marginBottom: '0.5rem' }}>AI-Generated Flashcards</div>
            <div className="text-muted">Turn notes into flashcards with one click for spaced repetition.</div>
          </div>
          <div className="card">
            <div className="card-icon" role="img" aria-label="Brain">🧠</div>
            <div style={{ fontWeight: 600, marginBottom: '0.5rem' }}>Review & Retain</div>
            <div className="text-muted">Review at optimal times, proven by brain science.</div>
          </div>
        </div>
      </section>

      {/* Why NeuroNote */}
      <section className="section text-center">
        <h2 style={{ color: 'var(--primary)', fontWeight: 700, fontSize: '1.7rem', marginBottom: '2rem' }}>Why NeuroNote?</h2>
        <ul className="benefit-list">
          <li>Boosts long-term memory and understanding</li>
          <li>Reduces study time with efficient review</li>
          <li>Works for any subject, from science to languages</li>
        </ul>
        <div style={{ marginTop: '2.5rem', display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <div className="testimonial">“I finally remember what I study. NeuroNote is a game changer!”<br /><span style={{ fontWeight: 600 }}>— Alex, Med Student</span></div>
          <div className="testimonial" style={{ background: 'var(--secondary-green)', color: '#18181B' }}>“Flashcards are so easy now. I use it every day.”<br /><span style={{ fontWeight: 600 }}>— Priya, High Schooler</span></div>
        </div>
      </section>

      {/* Visual Preview */}
      <section className="section visual-preview">
        <h2 style={{ color: 'var(--primary)', fontWeight: 700, fontSize: '1.7rem', marginBottom: '2rem', textAlign: 'center' }}>See NeuroNote in Action</h2>
        <img src="/demo-screenshot.png" alt="NeuroNote Demo Screenshot" className="visual-img" style={{ border: '1px solid #E5E7EB' }} />
        <div className="text-muted" style={{ marginTop: '1rem' }}>(Demo screenshot or short video goes here)</div>
      </section>

      {/* Final Call to Action */}
      <section className="section text-center">
        <h2 style={{ color: 'var(--primary)', fontWeight: 700, fontSize: '1.5rem', marginBottom: '1.2rem' }}>Ready to get started?</h2>
        <Link to="/signup" className="cta-btn">Sign Up Free</Link>
      </section>
    </div>
  );
}

export default Home;