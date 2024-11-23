import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { sellersService } from '../../../firebase/services/sellersService';
import Navbar from '../../../components/Navbar/Navbar';
import './SellerDetails.css';
import { PlusIcon, TruckIcon } from '@heroicons/react/24/outline';
import { inventoryService } from '../../../firebase/services/inventoryService';
import InventoryModal from '../../../components/Inventory/InventoryModal';

const SellerDetails = () => {
    const { sellerId } = useParams();
    const navigate = useNavigate();
    const [seller, setSeller] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showInventoryModal, setShowInventoryModal] = useState(false);
    const [sellerInventory, setSellerInventory] = useState([]);

    useEffect(() => {
        const fetchSellerData = async () => {
            try {
                setLoading(true);
                // Fetch seller details
                const sellerData = await sellersService.getSellerById(sellerId);
                setSeller(sellerData);

                // Fetch seller's inventory
                const inventory = await inventoryService.getSellerInventory(sellerId);
                setSellerInventory(inventory);
            } catch (err) {
                console.error('Error fetching seller data:', err);
                setError('Failed to load seller information');
            } finally {
                setLoading(false);
            }
        };

        fetchSellerData();
    }, [sellerId]);

    const handleInventorySave = async (newInventory) => {
        try {
            // Show loading state if you have one
            setLoading(true);
            
            // Add the new inventory
            const savedInventory = await inventoryService.addInventory(sellerId, newInventory);
            
            // Immediately update the local state with the new inventory
            setSellerInventory(prev => [...prev, savedInventory]);
            
            // Close the modal
            setShowInventoryModal(false);
            
            // Fetch fresh data from the server to ensure consistency
            const updatedInventory = await inventoryService.getSellerInventory(sellerId);
            setSellerInventory(updatedInventory);
            
        } catch (error) {
            console.error('Error saving inventory:', error);
            // Optionally show an error message to the user
        } finally {
            setLoading(false);
        }
    };

    // Add this effect to refresh inventory when modal closes
    useEffect(() => {
        if (!showInventoryModal) {
            const refreshInventory = async () => {
                try {
                    const updatedInventory = await inventoryService.getSellerInventory(sellerId);
                    setSellerInventory(updatedInventory);
                } catch (error) {
                    console.error('Error refreshing inventory:', error);
                }
            };
            
            refreshInventory();
        }
    }, [showInventoryModal, sellerId]);

    const InventorySection = () => (
        <div className="inventory-section">
            <div className="section-header">
                <h2>Inventory</h2>
                <button 
                    className="btn-primary"
                    onClick={() => setShowInventoryModal(true)}
                >
                    <PlusIcon className="icon" />
                    Add Inventory
                </button>
            </div>
            
            <div className="inventory-grid">
                {sellerInventory.map(item => (
                    <div 
                        key={item.id} 
                        className="inventory-card"
                        onClick={() => navigate(`/inventory/${item.id}`)}
                    >
                        <div className="image-container">
                            {item.images && item.images.length > 0 ? (
                                <img 
                                    src={item.images.find(img => img.isPrimary)?.url || item.images[0].url} 
                                    alt={`${item.year} ${item.make} ${item.model}`}
                                    onError={(e) => {
                                        e.target.src = '/placeholder.png';
                                        e.target.onerror = null;
                                    }}
                                />
                            ) : (
                                <img 
                                    src="/placeholder.png" 
                                    alt="No image available"
                                />
                            )}
                        </div>
                        <div className="inventory-details">
                            <h3>{item.year} {item.make} {item.model}</h3>
                            <p className="price">
                                ${typeof item.price === 'number' ? item.price.toLocaleString() : '0'}
                            </p>
                            <span className={`status-badge ${item.status || 'unknown'}`}>
                                {item.status || 'unknown'}
                            </span>
                        </div>
                    </div>
                ))}
                {sellerInventory.length === 0 && (
                    <div className="no-inventory">
                        <p>No inventory items found</p>
                    </div>
                )}
            </div>
        </div>
    );

    if (loading) {
        return (
            <>
                <Navbar />
                <div className="seller-details-wrapper">
                    <div className="loading">Loading...</div>
                </div>
            </>
        );
    }

    if (error) {
        return (
            <>
                <Navbar />
                <div className="seller-details-wrapper">
                    <div className="error-message">{error}</div>
                </div>
            </>
        );
    }

    return (
        <>
            <Navbar />
            <div className="seller-details-wrapper">
                <div className="seller-details-container">
                    <header className="page-header">
                        <div className="header-content">
                            <div className="header-title">
                                <h1>{seller.businessName}</h1>
                                <p className="seller-type">{seller.businessType}</p>
                            </div>
                            <div className="header-actions">
                                <button 
                                    className="btn-secondary"
                                    onClick={() => navigate('/sellers')}
                                >
                                    Back to Sellers
                                </button>
                                <button 
                                    className="btn-primary"
                                    onClick={() => navigate(`/sellers/${sellerId}/edit`)}
                                >
                                    Edit Seller
                                </button>
                            </div>
                        </div>
                    </header>

                    <div className="seller-details-grid">
                        <section className="details-card">
                            <h2>Business Information</h2>
                            <div className="details-grid">
                                <div className="detail-item">
                                    <label>Business Type</label>
                                    <p>{seller.businessType}</p>
                                </div>
                                <div className="detail-item">
                                    <label>Status</label>
                                    <p>{seller.status}</p>
                                </div>
                            </div>
                        </section>

                        <section className="details-card">
                            <h2>Contact Information</h2>
                            <div className="details-grid">
                                <div className="detail-item">
                                    <label>Contact Name</label>
                                    <p>{seller.contactName}</p>
                                </div>
                                <div className="detail-item">
                                    <label>Email</label>
                                    <p>{seller.email}</p>
                                </div>
                                <div className="detail-item">
                                    <label>Phone</label>
                                    <p>{seller.phone}</p>
                                </div>
                                <div className="detail-item">
                                    <label>Preferred Contact</label>
                                    <p>{seller.preferredContactMethod}</p>
                                </div>
                            </div>
                        </section>

                        <section className="details-card">
                            <h2>Address</h2>
                            <div className="details-grid">
                                <div className="detail-item full-width">
                                    <label>Street Address</label>
                                    <p>{seller.address}</p>
                                </div>
                                <div className="detail-item">
                                    <label>City</label>
                                    <p>{seller.city}</p>
                                </div>
                                <div className="detail-item">
                                    <label>State</label>
                                    <p>{seller.state}</p>
                                </div>
                                <div className="detail-item">
                                    <label>ZIP Code</label>
                                    <p>{seller.zip}</p>
                                </div>
                            </div>
                        </section>
                    </div>
                </div>
            </div>
            <InventorySection />
            
            {showInventoryModal && (
                <InventoryModal 
                    sellerId={sellerId}
                    onClose={() => setShowInventoryModal(false)}
                    onSave={handleInventorySave}
                />
            )}
        </>
    );
};

export default SellerDetails; 