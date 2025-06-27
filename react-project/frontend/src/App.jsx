// src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Route, Routes, Link, Navigate, useLocation } from 'react-router-dom';
import Home from './Home';  // Import the Home page component
import About from './About'; // Import the About page component
import './App.css'; // Import the CSS file
import Signin from './auth/signin';
import Authentication from './api/OAuthSuccess';
import Dashboard from './components/Dashboard';
import StudyRoom from './components/StudyRoom';
import StudyRoomPage from './pages/StudyRoom';
import DeckContent from './components/DeckContent';
import { useAuth, AuthProvider } from './auth/AuthContext'; // or wherever it's defined
import { ThemeProvider } from './contexts/ThemeContext';
import StudyDecks from './components/StudyDecks';
import ReviewSession from './pages/ReviewSession';
import ReviewPage from './pages/ReviewPage';
import Login from './pages/Login';
import Register from './pages/Register';
import ChatPage from './pages/ChatPage';
import QuizPage from './pages/QuizPage';
import FocusPage from './pages/FocusPage';
import ProgressPage from './pages/ProgressPage';
import StudyGroups from './pages/StudyGroups';
import Achievements from './pages/Achievements';
import QuizCreatePage from './pages/QuizCreatePage';
import QuizReviewPage from './pages/QuizReviewPage';
import QuizTakePage from './pages/QuizTakePage';
import QuizResultsPage from './pages/QuizResultsPage';
import NightOwlFlashcardsPage from './pages/NightOwlFlashcardsPage';

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
  const location = useLocation();
  
  // Hide navbar on these routes
  const hideNavbarRoutes = ['/dashboard', '/signin', '/auth/callback/', '/study-room', '/review', '/chat', '/login', '/register', '/quiz', '/focus', '/progress', '/study-groups', '/achievements'];
  if (hideNavbarRoutes.some(route => location.pathname.startsWith(route))) {
    return null;
  }
  
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
          <Link to="/signin" className="nn-signup-btn-minimal">Get Started</Link>
        )}
      </div>
    </nav>
  );
}

// AppContent wrapper to use location
function AppContent() {
  const location = useLocation();
  const showNavbar = !['/dashboard', '/signin', '/auth/callback/', '/chat', '/login', '/register', '/quiz', '/progress', '/study-groups', '/achievements'].some(route => 
    location.pathname.startsWith(route)
  );

  return (
    <>
      {showNavbar && <Navbar />}
      <main className="main-content">
        <Routes>
          <Route path='/auth/callback/' element={<Authentication />} />
          <Route path="/" element={<Home />} /> {/* Home page route */}
          <Route path="/about" element={<About />} /> {/* About page route */}
          <Route path="/features" element={<div>Features Page</div>} />
          <Route path="/pricing" element={<div>Pricing Page</div>} />
          <Route path="/signup" element={<div>Sign Up Page</div>} />
          <Route 
            path="/dashboard/*" 
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/study-room" 
            element={
              <ProtectedRoute>
                <StudyRoom />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/study-room/deck/:deckId" 
            element={
              <ProtectedRoute>
                <DeckContent />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/study-room/decks" 
            element={
              <ProtectedRoute>
                <StudyDecks />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/review-session" 
            element={
              <ProtectedRoute>
                <ReviewSession />
              </ProtectedRoute>
            } 
          />
          <Route path="/review" element={
            <ProtectedRoute>
              <ReviewPage />
            </ProtectedRoute>
          } />
          <Route path='/signin' element={ <Signin /> }/>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/chat" element={<ChatPage />} />
          <Route path="/quiz" element={
            <ProtectedRoute>
              <QuizPage />
            </ProtectedRoute>
          } />
          <Route path="/focus" element={
            <ProtectedRoute>
              <FocusPage />
            </ProtectedRoute>
          } />
          <Route path="/progress" element={<ProgressPage />} />
          <Route 
            path="/study-groups" 
            element={
              <ProtectedRoute>
                <StudyGroups />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/study-groups/study-room/" 
            element={
              <ProtectedRoute>
                <StudyRoomPage />
              </ProtectedRoute>
            } 
          />
          <Route path="/achievements" element={<Achievements />} />
          <Route 
            path="/quiz/create" 
            element={
              <ProtectedRoute>
                <QuizCreatePage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/quiz/:quizId/review" 
            element={
              <ProtectedRoute>
                <QuizReviewPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/quiz/:quizId/test" 
            element={
              <ProtectedRoute>
                <QuizTakePage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/quiz/:quizId/results" 
            element={
              <ProtectedRoute>
                <QuizResultsPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/night-owl-flashcards" 
            element={
              <ProtectedRoute>
                <NightOwlFlashcardsPage />
              </ProtectedRoute>
            } 
          />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </main>
    </>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <AppContent />
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;