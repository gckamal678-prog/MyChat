import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { registerServiceWorker } from './utils/registerSW'
import { AuthProvider } from './context/AuthContext'

// Register the service worker for offline support.
registerServiceWorker();

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </React.StrictMode>,
)
