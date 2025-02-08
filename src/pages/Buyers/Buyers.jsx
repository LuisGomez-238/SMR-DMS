import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { buyersService } from '../../firebase/services/buyersService';
import LoadingSpinner from '../../components/LoadingSpinner/LoadingSpinner';
import './Buyers.css';

const ITEMS_PER_PAGE = 10;

const Buyers = () => {
    const navigate = useNavigate();
    const [buyers, setBuyers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);

    useEffect(() => {
        fetchBuyers();
    }, []);

    useEffect(() => {
        // Reset to first page when search term changes
        setCurrentPage(1);
    }, [searchTerm]);

    const fetchBuyers = async () => {
        try {
            const buyersData = await buyersService.getBuyers();
            setBuyers(buyersData);
        } catch (error) {
            console.error('Error fetching buyers:', error);
            setError('Failed to load buyers. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e) => {
        setSearchTerm(e.target.value.toLowerCase());
    };

    const filteredBuyers = buyers.filter(buyer => 
        buyer.businessName.toLowerCase().includes(searchTerm) ||
        buyer.contactName.toLowerCase().includes(searchTerm) ||
        buyer.email.toLowerCase().includes(searchTerm)
    );

    // Pagination calculations
    const totalPages = Math.ceil(filteredBuyers.length / ITEMS_PER_PAGE);
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    const currentBuyers = filteredBuyers.slice(startIndex, endIndex);

    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
        window.scrollTo(0, 0);
    };

    if (loading) return <LoadingSpinner />;

    return (
        <>
            <div className="buyers-container">
                <div className="buyers-header">
                    <div className="header-content">
                        <h1>Buyers</h1>
                        <button
                            className="btn-primary"
                            onClick={() => navigate('/buyers/new')}
                        >
                            Add New Buyer
                        </button>
                    </div>
                    <div className="search-bar">
                        <input
                            type="text"
                            placeholder="Search buyers..."
                            value={searchTerm}
                            onChange={handleSearch}
                        />
                    </div>
                </div>

                {error && <div className="error-message">{error}</div>}

                <div className="buyers-table-container">
                    <table className="buyers-table">
                        <thead>
                            <tr>
                                <th>Business Name</th>
                                <th>Contact Name</th>
                                <th>Email</th>
                                <th>Phone</th>
                                <th>Location</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {currentBuyers.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="no-results">
                                        No buyers found
                                    </td>
                                </tr>
                            ) : (
                                currentBuyers.map(buyer => (
                                    <tr 
                                        key={buyer.id}
                                        onClick={() => navigate(`/buyers/${buyer.id}`)}
                                        className="clickable-row"
                                    >
                                        <td>{buyer.businessName}</td>
                                        <td>{buyer.contactName}</td>
                                        <td>{buyer.email}</td>
                                        <td>{buyer.phone}</td>
                                        <td>{`${buyer.city}, ${buyer.state}`}</td>
                                        <td>
                                            <span className={`status-badge ${buyer.status}`}>
                                                {buyer.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {totalPages > 1 && (
                    <div className="pagination">
                        <button
                            onClick={() => handlePageChange(currentPage - 1)}
                            disabled={currentPage === 1}
                            className="pagination-button"
                        >
                            Previous
                        </button>
                        
                        <div className="pagination-numbers">
                            {[...Array(totalPages)].map((_, index) => (
                                <button
                                    key={index + 1}
                                    onClick={() => handlePageChange(index + 1)}
                                    className={`pagination-number ${currentPage === index + 1 ? 'active' : ''}`}
                                >
                                    {index + 1}
                                </button>
                            ))}
                        </div>

                        <button
                            onClick={() => handlePageChange(currentPage + 1)}
                            disabled={currentPage === totalPages}
                            className="pagination-button"
                        >
                            Next
                        </button>
                    </div>
                )}
            </div>
        </>
    );
};

export default Buyers; 