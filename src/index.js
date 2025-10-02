import React from 'react';
import ReactDOM from 'react-dom/client';
import * as serviceWorkerRegistration from './serviceWorkerRegistration';

// Placeholder React component for future migration
function App() {
  return (
    <div>
      <h1>Stellar Journey</h1>
      <p>React app initialization - ready for future migration</p>
      <p style={{ fontSize: '0.9rem', color: '#666', marginTop: '20px' }}>
        PWA enabled - Install this app on your device!
      </p>
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Register service worker for PWA functionality
serviceWorkerRegistration.register({
  onSuccess: (registration) => {
    console.log('[PWA] App is ready for offline use!');
  },
  onUpdate: (registration) => {
    console.log('[PWA] New version available! Please refresh to update.');
  }
});
