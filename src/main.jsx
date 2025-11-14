import React, { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter as Router } from 'react-router-dom';
import './NewStyles.css';
import App from './App.jsx';
import { AuthProvider } from './context/AuthContext.jsx';
import { DataSyncProvider } from './context/DataSyncContext.jsx';
import { UIStateProvider } from './context/UIStateContext.jsx';
import { ThemeProvider } from './context/ThemeContext.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Router>
      <AuthProvider>
        <UIStateProvider>
          <DataSyncProvider>
            <ThemeProvider>
              <App />
            </ThemeProvider>
          </DataSyncProvider>
        </UIStateProvider>
      </AuthProvider>
    </Router>
  </StrictMode>
);
