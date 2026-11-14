import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';

// Catch unhandled errors that might cause blank screen
window.addEventListener('error', (event) => {
  console.error('Global error:', event.error);
  const root = document.getElementById('root');
  if (root && !root.hasChildNodes()) {
    root.innerHTML = `<div style="padding:2rem;font-family:Inter,sans-serif;text-align:center;color:#4B5035;">
      <h2>TraceBack failed to load</h2>
      <p style="color:#4C4B3D;font-size:0.875rem;margin:1rem 0;">${event.error?.message || 'Unknown error'}</p>
      <button onclick="localStorage.clear();location.reload();" style="padding:0.75rem 1.5rem;background:#B96F4B;color:#fff;border:none;border-radius:0.5rem;cursor:pointer;font-weight:600;">
        Clear Cache & Reload
      </button>
    </div>`;
  }
});

window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection:', event.reason);
});

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
