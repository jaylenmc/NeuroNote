import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './App.css'
import './Home.css'
import App from './App.jsx'
import { AuthProvider } from './auth/AuthContext'

createRoot(document.getElementById('root')).render(
  // <StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  // {/* </StrictMode>, */}
)
