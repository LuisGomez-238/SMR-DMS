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
        <div className="sellers-container">
            <div className="sellers-header">
                <div className="header-content">
                    <h1>Sellers</h1>
                    <button 
                        className="btn-primary"
                        onClick={() => navigate('/sellers/new')}
                    >
                        <UserPlusIcon className="icon" />
                        Add New Seller
                    </button>
                </div>
                <div className="search-bar">
                    <input
                        type="text"
                        placeholder="Search sellers..."
                        value={searchTerm}
                        onChange={handleSearch}
                    />
                </div>
            </div>

            {error && <div className="error-message">{error}</div>}

            <div className="sellers-table-container">
                <table className="sellers-table">
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
                        {sortedSellers.length === 0 ? (
                            <tr>
                                <td colSpan="6" className="no-results">
                                    No sellers found
                                </td>
                            </tr>
                        ) : (
                            sortedSellers.map(seller => (
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
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Sellers; 
