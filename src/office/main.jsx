import React from 'react';
import ReactDOM from 'react-dom/client';
import { AuthProvider } from '../lib/auth';
import OfficeApp from './OfficeApp';
import '../styles.css';

// LibreOffice पान (/office.html) — मुख्य app पासून वेगळे, cross-origin isolated
ReactDOM.createRoot(document.getElementById('office-root')).render(
  <AuthProvider>
    <OfficeApp />
  </AuthProvider>,
);
