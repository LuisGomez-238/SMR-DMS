import React, { Suspense, useEffect } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { GlobalProvider } from './contexts/GlobalContext';
import LoadingSpinner from './components/LoadingSpinner/LoadingSpinner';
import './App.css';

// Lazy load components
const Navbar = React.lazy(() => import('./components/Navbar/Navbar'));
const AppRoutes = React.lazy(() => import('./AppRoutes'));

// Create a wrapper component that handles the conditional rendering
const AppContent = () => {
  const { currentUser } = useAuth();

  // Add debug logging
  useEffect(() => {
    console.log('Auth State Changed:', {
      isAuthenticated: !!currentUser,
      userDetails: currentUser ? {
        uid: currentUser.uid,
        email: currentUser.email
      } : 'Not authenticated'
    });
  }, [currentUser]);

  return (
    <div className="app-container">
      <Suspense fallback={<LoadingSpinner />}>
        {currentUser && <Navbar />}
        <AppRoutes />
      </Suspense>
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <GlobalProvider>
        <Router>
          <AppContent />
        </Router>
      </GlobalProvider>
    </AuthProvider>
  );
}

export default App;