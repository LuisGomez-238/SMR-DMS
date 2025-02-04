import React, { Suspense, useEffect } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { GlobalProvider } from './contexts/GlobalContext';
import LoadingSpinner from './components/LoadingSpinner/LoadingSpinner';
import Navbar from './components/Navbar/Navbar';
import AppRoutes from './AppRoutes';
import { useLocation } from 'react-router-dom';
import './App.css';

// Lazy load components
const AppRoutesComponent = React.lazy(() => import('./AppRoutes'));

// Create a separate component for the app content
const AppContent = () => {
  const location = useLocation();
  const isFinanceApplication = location.pathname.includes('finance-application');

  return (
    <div className="app">
      {!isFinanceApplication && <Navbar />}
      <main className="main-content">
        <AppRoutes />
      </main>
    </div>
  );
};

// Main App component
const App = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <GlobalProvider>
          <AppContent />
        </GlobalProvider>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;