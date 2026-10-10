import React from 'react';
import { createRoot } from 'react-dom/client';
import SalmanApp from './SalmanApp.jsx';
import './salman.css';
import './effects.css';

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <SalmanApp />
  </React.StrictMode>
);
