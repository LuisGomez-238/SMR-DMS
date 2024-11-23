import React, { createContext, useState, useContext, useEffect } from 'react';
import { db } from '../firebase/config';
import { 
    collection, 
    query, 
    getDocs, 
    onSnapshot,
    where,
    limit 
} from 'firebase/firestore';
import { useAuth } from './AuthContext';

const GlobalContext = createContext();

export function useGlobal() {
    const context = useContext(GlobalContext);
    if (!context) {
        throw new Error('useGlobal must be used within a GlobalProvider');
    }
    return context;
}

export function GlobalProvider({ children }) {
    const { currentUser } = useAuth();
    const [stats, setStats] = useState({
        totalSellers: 0,
        activeListings: 0,
        pendingDeals: 0,
        completedDeals: 0,
        totalSales: 0
    });
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Fetch stats with retries
    const fetchStatsWithRetry = async (retries = 3) => {
        for (let attempt = 0; attempt < retries; attempt++) {
            try {
                const statsData = {
                    totalSellers: 0,
                    activeListings: 0,
                    pendingDeals: 0,
                    completedDeals: 0,
                    totalSales: 0
                };

                // Simple query to test connection
                const testQuery = query(
                    collection(db, 'sellers'),
                    limit(1)
                );
                await getDocs(testQuery);

                // If test query succeeds, fetch actual data
                const [sellersSnap, listingsSnap, dealsSnap] = await Promise.all([
                    getDocs(collection(db, 'sellers')),
                    getDocs(query(
                        collection(db, 'listings'),
                        where('status', '==', 'active')
                    )),
                    getDocs(collection(db, 'deals'))
                ]);

                statsData.totalSellers = sellersSnap.size;
                statsData.activeListings = listingsSnap.size;

                dealsSnap.forEach(doc => {
                    const deal = doc.data();
                    if (deal.status === 'pending') {
                        statsData.pendingDeals++;
                    } else if (deal.status === 'completed') {
                        statsData.completedDeals++;
                        statsData.totalSales += deal.amount || 0;
                    }
                });

                return statsData;
            } catch (err) {
                console.warn(`Attempt ${attempt + 1} failed:`, err);
                if (attempt === retries - 1) throw err;
                await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)));
            }
        }
    };

    // Fetch initial stats
    useEffect(() => {
        if (!currentUser) {
            setLoading(false);
            return;
        }

        let isSubscribed = true;

        const loadStats = async () => {
            try {
                setLoading(true);
                setError(null);
                const statsData = await fetchStatsWithRetry();
                
                if (isSubscribed) {
                    setStats(statsData);
                    setLoading(false);
                }
            } catch (err) {
                console.error('Error fetching stats:', err);
                if (isSubscribed) {
                    setError('Failed to load dashboard data. Please check your connection and try again.');
                    setLoading(false);
                }
            }
        };

        loadStats();

        return () => {
            isSubscribed = false;
        };
    }, [currentUser]);

    // Listen for notifications
    useEffect(() => {
        if (!currentUser) return;

        const notificationsQuery = query(
            collection(db, 'notifications'),
            where('userId', '==', currentUser.uid),
            where('read', '==', false),
            limit(10)
        );

        const unsubscribe = onSnapshot(
            notificationsQuery,
            (snapshot) => {
                const newNotifications = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data(),
                    timestamp: doc.data().timestamp?.toDate()
                }));
                setNotifications(newNotifications);
            },
            (error) => {
                console.error('Notifications subscription error:', error);
            }
        );

        return () => unsubscribe();
    }, [currentUser]);

    const refreshStats = async () => {
        try {
            setLoading(true);
            const statsData = await fetchStatsWithRetry();
            setStats(statsData);
            setError(null);
        } catch (err) {
            setError('Failed to refresh stats. Please try again.');
            console.error('Error refreshing stats:', err);
        } finally {
            setLoading(false);
        }
    };

    const value = {
        stats,
        notifications,
        loading,
        error,
        refreshStats
    };

    return (
        <GlobalContext.Provider value={value}>
            {children}
        </GlobalContext.Provider>
    );
} 