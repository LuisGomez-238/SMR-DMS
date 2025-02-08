import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { sellersService } from '../../firebase/services/sellersService';
import Navbar from '../../components/Navbar/Navbar';
import { 
    MagnifyingGlassIcon,
    FunnelIcon,
    UserPlusIcon,
    EllipsisVerticalIcon,
    ChevronDownIcon
} from '@heroicons/react/24/outline';
import './Sellers.css';

const Sellers = () => {
    const navigate = useNavigate();
    const [sellers, setSellers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterOpen, setFilterOpen] = useState(false);
    const [sortBy, setSortBy] = useState('newest');

    // Fetch sellers on component mount
    useEffect(() => {
        const fetchSellers = async () => {
            try {
                const fetchedSellers = await sellersService.getAllSellers();
                setSellers(fetchedSellers);
            } catch (err) {
                console.error('Error fetching sellers:', err);
                setError('Failed to load sellers');
            } finally {
                setLoading(false);
            }
        };

        fetchSellers();
    }, []);

    const handleSearch = (e) => {
        setSearchTerm(e.target.value);
    };

    const handleRowClick = (sellerId) => {
        navigate(`/sellers/${sellerId}`);
    };

    if (loading) {
        return (
            <>
                <Navbar />
                <div className="dashboard-container">
                    <div className="loading">Loading sellers...</div>
                </div>
            </>
        );
    }

    if (error) {
        return (
            <>
                <Navbar />
                <div className="dashboard-container">
                    <div className="error-message">{error}</div>
                </div>
            </>
        );
    }

    // Filter sellers based on search term
    const filteredSellers = sellers.filter(seller => 
        seller.businessName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        seller.contactName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        seller.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Sort sellers based on selected option
    const sortedSellers = [...filteredSellers].sort((a, b) => {
        switch (sortBy) {
            case 'newest':
                return new Date(b.createdAt) - new Date(a.createdAt);
            case 'oldest':
                return new Date(a.createdAt) - new Date(b.createdAt);
            case 'alphabetical':
                return a.businessName.localeCompare(b.businessName);
            default:
                return 0;
        }
    });

    return (
        <div className='sellers-container'>
            <Navbar />
            <div className="dashboard-container">
                <main className="main-content">
                    <div className="sellers-header">
                        <div className="header-title">
                            <h1>Sellers</h1>
                            <p>Manage and view all sellers</p>
                        </div>
                        <button 
                            className="btn-primary"
                            onClick={() => navigate('/sellers/new')}
                        >
                            <UserPlusIcon className="icon" />
                            Add New Seller
                        </button>
                    </div>

                    <div className="sellers-controls">
                        <div className="search-bar">
                            <input
                                type="text"
                                placeholder="Search sellers..."
                                value={searchTerm}
                                onChange={handleSearch}
                            />
                        </div>

                        <div className="controls-right">
                            <button 
                                className="btn-filter"
                                onClick={() => setFilterOpen(!filterOpen)}
                            >
                                <FunnelIcon className="icon" />
                                Filters
                            </button>

                            <div className="sort-dropdown">
                                <select 
                                    value={sortBy}
                                    onChange={(e) => setSortBy(e.target.value)}
                                >
                                    <option value="newest">Newest First</option>
                                    <option value="oldest">Oldest First</option>
                                    <option value="alphabetical">A-Z</option>
                                    <option value="listings">Most Listings</option>
                                </select>
                                <ChevronDownIcon className="dropdown-icon" />
                            </div>
                        </div>
                    </div>

                    {filterOpen && (
                        <div className="filters-panel">
                            <div className="filter-group">
                                <label>Status</label>
                                <div className="filter-options">
                                    <label className="checkbox-label">
                                        <input type="checkbox" /> Active
                                    </label>
                                    <label className="checkbox-label">
                                        <input type="checkbox" /> Inactive
                                    </label>
                                    <label className="checkbox-label">
                                        <input type="checkbox" /> Pending
                                    </label>
                                </div>
                            </div>
                            {/* Add more filter groups as needed */}
                        </div>
                    )}

                    <div className="sellers-table">
                        <table>
                            <thead>
                                <tr>
                                    <th>Business Name</th>
                                    <th>Contact</th>
                                    <th>Location</th>
                                    <th>Status</th>
                                    <th>Date Added</th>
                                    <th></th>
                                </tr>
                            </thead>
                            <tbody>
                                {sortedSellers.map(seller => (
                                    <tr 
                                        key={seller.id}
                                        onClick={() => handleRowClick(seller.id)}
                                        className="clickable-row"
                                    >
                                        <td className="business-name">
                                            {seller.businessName}
                                        </td>
                                        <td>
                                            <div className="contact-info">
                                                <span>{seller.contactName}</span>
                                                <span className="secondary-text">{seller.email}</span>
                                            </div>
                                        </td>
                                        <td>{`${seller.city}, ${seller.state}`}</td>
                                        <td>
                                            <span className={`status-badge ${seller.status || 'active'}`}>
                                                {seller.status || 'active'}
                                            </span>
                                        </td>
                                        <td>
                                            {seller.createdAt ? 
                                                new Date(seller.createdAt.toDate()).toLocaleDateString() 
                                                : 'N/A'
                                            }
                                        </td>
                                        <td>
                                            <button 
                                                className="btn-icon"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    // Add your action menu logic here
                                                }}
                                            >
                                                <EllipsisVerticalIcon className="icon" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="pagination">
                        {/* Add pagination controls here */}
                    </div>
                </main>
            </div>
        </div>
    );
};

export default Sellers; 
