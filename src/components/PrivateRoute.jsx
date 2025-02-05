import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const PrivateRoute = ({ children }) => {
    const { currentUser } = useAuth();
    const location = useLocation();

    // Allow access to finance application pages without authentication
    if (location.pathname.includes('finance-application')) {
        return children;
    }

    // Redirect to login if not authenticated
    if (!currentUser) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // User is authenticated, render the protected route
    return children;
};

export default PrivateRoute; 