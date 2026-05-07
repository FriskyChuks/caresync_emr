import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

// Ensure the DOM is ready
const rootElement = document.getElementById('root');
if (!rootElement) {
  console.error('Root element not found!');
} else {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
  )
}

// Remove loading fallback
const loadingFallback = document.getElementById('loading-fallback');
if (loadingFallback) {
  setTimeout(() => {
    loadingFallback.style.opacity = '0';
    setTimeout(() => {
      loadingFallback.style.display = 'none';
    }, 300);
  }, 500);
}