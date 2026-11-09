import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import UpdateBanner from './components/UpdateBanner';
import { AuthProvider } from './lib/auth';
import './styles.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
        <UpdateBanner />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
