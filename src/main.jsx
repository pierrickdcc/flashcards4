import React, { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './NewStyles.css';
import App from './App.jsx';
import { AuthProvider } from './context/AuthContext.jsx';
import { DataSyncProvider } from './context/DataSyncContext.jsx';
import { UIStateProvider } from './context/UIStateContext.jsx';
import { ThemeProvider } from './context/ThemeContext.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <DataSyncProvider>
        <UIStateProvider>
          <ThemeProvider>
            <App />
          </ThemeProvider>
        </UIStateProvider>
      </DataSyncProvider>
    </AuthProvider>
  </StrictMode>
);