// src/AppRoutes.js
import React, { Suspense } from 'react';
import { Route, Routes, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import LoadingSpinner from './components/LoadingSpinner/LoadingSpinner';
import PrivateRoute from './components/PrivateRoute';
import PublicLayout from './layouts/PublicLayout/PublicLayout';
import Dashboard from './pages/Dashboard/Dashboard';
import FinanceApplication from './pages/Public/FinanceApplication/FinanceApplication';
import FinanceApplicationSuccess from './pages/Public/FinanceApplication/FinanceApplicationSuccess';
import Sellers from './pages/Sellers/Sellers';
import NewSeller from './pages/Sellers/NewSeller/NewSeller';
import SellerDetails from './pages/Sellers/SellerDetails/SellerDetails';
import Inventory from './pages/Inventory/Inventory';
import InventoryDetails from './components/Inventory/InventoryDetails';
import Deals from './pages/Deals/Deals';
import Reports from './pages/Reports/Reports';
import Settings from './pages/Settings/Settings';
import NotFound from './pages/NotFound/NotFound';
import Buyers from './pages/Buyers/Buyers';
import BuyerDetails from './pages/Buyers/BuyerDetails/BuyerDetails';
import NewBuyer from './pages/Buyers/NewBuyer/NewBuyer';

// Lazy load all pages
const Login = React.lazy(() => import('./pages/Login/Login'));
const DealSubmission = React.lazy(() => import('./pages/Deals/DealSubmission'));

// Protected Route Component with loading state
const PrivateRouteComponent = ({ children }) => {
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
            <Route path="/finance-application" element={<FinanceApplication />} />
            <Route path="/finance-application/:token" element={<FinanceApplication />} />
            <Route path="/finance-application-success" element={<FinanceApplicationSuccess />} />

            {/* Protected Routes */}
            <Route path="/" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
            <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />

            <Route path="/buyers" element={<PrivateRoute><Buyers /></PrivateRoute>} />
            <Route path="/buyers/:id" element={<PrivateRoute><BuyerDetails /></PrivateRoute>} />
            <Route path="/buyers/new" element={<PrivateRoute><NewBuyer /></PrivateRoute>} />
            <Route path="/inventory" element={<PrivateRoute><Inventory /></PrivateRoute>} />
            <Route path="/deals" element={<PrivateRoute><Deals /></PrivateRoute>} />

            {/* Sellers Routes */}
            <Route path="/sellers" element={<PrivateRoute><Sellers /></PrivateRoute>} />
            <Route path="/sellers/new" element={<PrivateRoute><NewSeller /></PrivateRoute>} />
            <Route path="/sellers/:sellerId" element={<PrivateRoute><SellerDetails /></PrivateRoute>} />

            {/* Inventory Routes */}
            <Route path="/inventory/:inventoryId" element={<PrivateRoute><InventoryDetails /></PrivateRoute>} />

            {/* Deals Routes */}
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
