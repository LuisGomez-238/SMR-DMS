import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useGlobal } from '../../contexts/GlobalContext';
import { 
    UserPlusIcon,
    TruckIcon,
    DocumentPlusIcon,
    ChartBarIcon,
    ClockIcon,
    CurrencyDollarIcon,
    UserGroupIcon,
    ArrowRightOnRectangleIcon
} from '@heroicons/react/24/outline';
import { FaUsers } from 'react-icons/fa';
import './Dashboard.css';
const Dashboard = () => {
    const navigate = useNavigate();
    const { currentUser, logout } = useAuth();
    const { stats, loading, error } = useGlobal();

    const handleLogout = async () => {
        try {
            await logout();
            navigate('/login');
        } catch (error) {
            console.error('Failed to log out:', error);
        }
    };

    if (loading) {
        return <div className="loading">Loading...</div>;
    }

    if (error) {
        return <div className="error-message">{error}</div>;
    }

    const statCards = [
        {
            title: 'Total Sellers',
            value: stats.totalSellers,
            icon: FaUsers,
            color: 'blue'
        },
        {
            title: 'Active Listings',
            value: stats.activeListings,
            icon: TruckIcon,
            color: 'green'
        },
        {
            title: 'Pending Deals',
            value: stats.pendingDeals,
            icon: ClockIcon,
            color: 'yellow'
        },
        {
            title: 'Total Sales',
            value: new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: 'USD'
            }).format(stats.totalSales),
            icon: CurrencyDollarIcon,
            color: 'purple'
        },
        {
            title: 'Total Buyers',
            value: stats.totalBuyers,
            icon: FaUsers,
            color: 'orange'
        }
    ];

    const quickActions = [
        {
            title: 'New Seller',
            icon: UserPlusIcon,
            path: '/sellers/new',
            color: 'blue'
        },
        {
            title: 'Add Inventory',
            icon: TruckIcon,
            path: '/inventory/add',
            color: 'green'
        },
        {
            title: 'New Deal',
            icon: DocumentPlusIcon,
            path: '/deals/new',
            color: 'purple'
        },
        {
            title: 'Add New Buyer',
            icon: FaUsers,
            path: '/buyers/new',
            color: 'orange'
        }
    ];

    return (
        <>
            <div className="dashboard">
                <header className="dashboard-header">
                    <div className="header-title">
                        <h1>Dashboard</h1>
                        <p>Welcome back, {currentUser?.email}</p>
                    </div>
                    <button 
                        onClick={handleLogout}
                        className="logout-button"
                    >
                        <ArrowRightOnRectangleIcon className="icon" />
                        Logout
                    </button>
                </header>

            <main className="dashboard-content">
                {/* Stats Overview */}
                <section className="stats-grid">
                    {statCards.map((stat, index) => (
                        <div key={index} className={`stat-card ${stat.color}`}>
                            <div className="stat-icon">
                                <stat.icon />
                            </div>
                            <div className="stat-info">
                                <h3>{stat.title}</h3>
                                <p className="stat-value">{stat.value}</p>
                            </div>
                        </div>
                    ))}
                </section>
            <div className="quick-actions-container">
                {/* Quick Actions */}
                <section className="quick-actions">
                    <h2>Quick Actions</h2>
                    <div className="action-buttons">
                        {quickActions.map((action, index) => (
                            <Link
                                key={index}
                                to={action.path}
                                className={`action-button ${action.color}`}
                            >
                                <action.icon className="action-icon" />
                                <span>{action.title}</span>
                            </Link>
                        ))}
                    </div>
                </section>

                {/* Recent Activity */}
                <section className="recent-activity">
                    <h2>Recent Activity</h2>
                    <div className="activity-list">
                        {stats.recentActivity?.length > 0 ? (
                            stats.recentActivity.map((activity, index) => (
                                <div key={index} className="activity-item">
                                    <div className="activity-icon">
                                        <ChartBarIcon />
                                    </div>
                                    <div className="activity-content">
                                        <h4>{activity.type}</h4>
                                        <p>{activity.description}</p>
                                        <span className="activity-time">
                                            {new Date(activity.timestamp).toLocaleDateString()}
                                        </span>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="no-activity">No recent activity</p>
                        )}
                    </div>
                </section>
            </div>
            </main>
        </div>
        </>
    );
};

export default Dashboard;