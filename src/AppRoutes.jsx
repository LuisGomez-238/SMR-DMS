// src/AppRoutes.js
import React, { Suspense } from 'react';
import { Route, Routes, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import LoadingSpinner from './components/LoadingSpinner/LoadingSpinner';

// Lazy load all pages
const Login = React.lazy(() => import('./pages/Login/Login'));
const Dashboard = React.lazy(() => import('./pages/Dashboard/Dashboard'));
const DealSubmission = React.lazy(() => import('./pages/Deals/DealSubmission'));
const Sellers = React.lazy(() => import('./pages/Sellers/Sellers'));
const NewSeller = React.lazy(() => import('./pages/Sellers/NewSeller/NewSeller'));
const SellerDetails = React.lazy(() => import('./pages/Sellers/SellerDetails/SellerDetails'));
const Inventory = React.lazy(() => import('./pages/Inventory/Inventory'));
const InventoryDetails = React.lazy(() => import('./components/Inventory/InventoryDetails'));
const Deals = React.lazy(() => import('./pages/Deals/Deals'));
const Reports = React.lazy(() => import('./pages/Reports/Reports'));
const Settings = React.lazy(() => import('./pages/Settings/Settings'));
const NotFound = React.lazy(() => import('./pages/NotFound/NotFound'));

// Protected Route Component with loading state
const PrivateRoute = ({ children }) => {
    const { currentUser, loading } = useAuth();

    if (loading) {
        return <LoadingSpinner />;
    }

    return currentUser ? (
        <Suspense fallback={<LoadingSpinner />}>
            {children}
        </Suspense>
    ) : (
        <Navigate to="/login" />
    );
};

const AppRoutes = () => {
    const { currentUser } = useAuth();

    return (
        <Routes>
            {/* Public Routes */}
            <Route 
                path="/login" 
                element={
                    currentUser ? (
                        <Navigate to="/dashboard" />
                    ) : (
                        <Suspense fallback={<LoadingSpinner />}>
                            <Login />
                        </Suspense>
                    )
                } 
            />
            
            {/* Protected Routes - Grouped by feature */}
            {/* Dashboard */}
            <Route path="/" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
            <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
            
            {/* Sellers Routes */}
            <Route path="/sellers" element={<PrivateRoute><Sellers /></PrivateRoute>} />
            <Route path="/sellers/new" element={<PrivateRoute><NewSeller /></PrivateRoute>} />
            <Route path="/sellers/:sellerId" element={<PrivateRoute><SellerDetails /></PrivateRoute>} />
            
            {/* Inventory Routes */}
            <Route path="/inventory" element={<PrivateRoute><Inventory /></PrivateRoute>} />
            <Route path="/inventory/:inventoryId" element={<PrivateRoute><InventoryDetails /></PrivateRoute>} />
            
            {/* Deals Routes */}
            <Route path="/deals" element={<PrivateRoute><Deals /></PrivateRoute>} />
            <Route path="/deals/new" element={<PrivateRoute><Deals /></PrivateRoute>} />
            <Route path="/deal-submission" element={<PrivateRoute><DealSubmission /></PrivateRoute>} />
            
            {/* Other Routes */}
            <Route path="/reports" element={<PrivateRoute><Reports /></PrivateRoute>} />
            <Route path="/settings" element={<PrivateRoute><Settings /></PrivateRoute>} />
            
            {/* 404 Route */}
            <Route 
                path="*" 
                element={
                    <Suspense fallback={<LoadingSpinner />}>
                        <NotFound />
                    </Suspense>
                } 
            />
        </Routes>
    );
};

export default AppRoutes;
