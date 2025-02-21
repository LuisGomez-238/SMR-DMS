import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { inventoryService } from '../../firebase/services/inventoryService';
import Navbar from '../Navbar/Navbar';
import { 
    ArrowLeftIcon,
    PhoneIcon, 
    EnvelopeIcon,
    MapPinIcon,
    BuildingOfficeIcon,
    UserCircleIcon,
    ArrowUpIcon
} from '@heroicons/react/24/outline';
import './InventoryDetails.css';

const InventoryDetails = () => {
    const { inventoryId } = useParams();
    const navigate = useNavigate();
    const [inventory, setInventory] = useState(null);
    const [selectedImage, setSelectedImage] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isScrolled, setIsScrolled] = useState(false);
    const [showScrollTop, setShowScrollTop] = useState(false);

    useEffect(() => {
        const fetchInventoryDetails = async () => {
            try {
                const data = await inventoryService.getInventoryWithSellerDetails(inventoryId);
                setInventory(data);
            } catch (err) {
                console.error('Error fetching inventory details:', err);
                setError('Failed to load inventory details');
            } finally {
                setLoading(false);
            }
        };

        fetchInventoryDetails();
    }, [inventoryId]);

    useEffect(() => {
        const handleScroll = () => {
            const scrolled = window.scrollY > 100;
            setIsScrolled(scrolled);
            setShowScrollTop(scrolled);
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    };

    const renderSpecifications = (inventory) => {
        if (inventory.category === 'truck') {
            return (
                <>
                    <div className="specs-section">
                        <h3>Basic Information</h3>
                        <div className="specs-grid">
                            <div className="spec-item">
                                <label>Category</label>
                                <span>Truck</span>
                            </div>
                            <div className="spec-item">
                                <label>VIN</label>
                                <span>{inventory.vin}</span>
                            </div>
                            <div className="spec-item">
                                <label>Mileage</label>
                                <span>{inventory.mileage?.toLocaleString()} miles</span>
                            </div>
                            <div className="spec-item">
                                <label>Price</label>
                                <span>${inventory.price?.toLocaleString()}</span>
                            </div>
                        </div>
                    </div>

                    <div className="specs-section">
                        <h3>Truck Features</h3>
                        <div className="specs-grid">
                            <div className="spec-item">
                                <label>APU</label>
                                <span>{inventory.apu === 'yes' ? 'Yes' : 'No'}</span>
                            </div>
                            <div className="spec-item">
                                <label>Inverter</label>
                                <span>{inventory.inverter === 'yes' ? 'Yes' : 'No'}</span>
                            </div>
                            <div className="spec-item">
                                <label>Bunk Heater</label>
                                <span>{inventory.bunkHeater === 'yes' ? 'Yes' : 'No'}</span>
                            </div>
                            <div className="spec-item">
                                <label>Deer Guard</label>
                                <span>{inventory.deerGuard === 'yes' ? 'Yes' : 'No'}</span>
                            </div>
                            <div className="spec-item">
                                <label>Fuel Tank Size</label>
                                <span>{inventory.fuelTankSize}</span>
                            </div>
                        </div>
                    </div>
                </>
            );
        } else if (inventory.category === 'trailer') {
            return (
                <>
                    <div className="specs-section">
                        <h3>Basic Information</h3>
                        <div className="specs-grid">
                            <div className="spec-item">
                                <label>Category</label>
                                <span>Trailer</span>
                            </div>
                            <div className="spec-item">
                                <label>VIN</label>
                                <span>{inventory.vin}</span>
                            </div>
                            <div className="spec-item">
                                <label>Price</label>
                                <span>${inventory.price?.toLocaleString()}</span>
                            </div>
                            <div className="spec-item">
                                <label>Trailer Type</label>
                                <span>{inventory.trailerType}</span>
                            </div>
                        </div>
                    </div>

                    <div className="specs-section">
                        <h3>Trailer Features</h3>
                        <div className="specs-grid">
                            <div className="spec-item">
                                <label>Door Type</label>
                                <span>{inventory.doorType}</span>
                            </div>
                            <div className="spec-item">
                                <label>Suspension</label>
                                <span>{inventory.suspension}</span>
                            </div>
                            <div className="spec-item">
                                <label>Air Lines</label>
                                <span>{inventory.airLines === 'yes' ? 'Yes' : 'No'}</span>
                            </div>
                            {inventory.trailerType === 'reefer' && (
                                <>
                                    <div className="spec-item">
                                        <label>Reefer Hours</label>
                                        <span>{inventory.reeferHours}</span>
                                    </div>
                                    <div className="spec-item">
                                        <label>Reefer Make</label>
                                        <span>{inventory.reeferMake}</span>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </>
            );
        }
    };

    const printDocument = (url) => {
        const printWindow = window.open(url, '_blank');
        printWindow.onload = () => {
            printWindow.print();
        };
    };

    if (loading) return <div className="loading">Loading inventory details...</div>;
    if (error) return <div className="error-message">{error}</div>;
    if (!inventory) return <div className="error-message">Inventory not found</div>;

    return (
        <div className="inventory-details-container">
                <div className="navigation-buttons">
                    <Link 
                        to="/inventory" 
                        className="back-button"
                        title="Back to Inventory"
                    >
                        <ArrowLeftIcon />
                        <span>Back to Inventory</span>
                    </Link>
                    
                    <Link 
                        to={`/sellers/${inventory.sellerId}`} 
                        className="seller-link-button"
                        title="View Seller Profile"
                    >
                        <UserCircleIcon />
                        <span>View Seller</span>
                    </Link>
                </div>

                <div className="inventory-details-grid">
                    {/* Image Gallery Section */}
                    <div className="image-gallery-section">
                        <div className="main-image">
                            <img 
                                src={inventory.images?.[selectedImage]?.url || '/placeholder-truck.png'} 
                                alt={`${inventory.year} ${inventory.make} ${inventory.model}`} 
                                onError={(e) => {
                                    e.target.src = '/placeholder-truck.png';
                                    e.target.onerror = null;
                                }}
                            />
                        </div>
                        <div className="image-thumbnails">
                            {inventory.images?.map((image, index) => (
                                <div 
                                    key={index}
                                    className={`thumbnail ${selectedImage === index ? 'selected' : ''}`}
                                    onClick={() => setSelectedImage(index)}
                                >
                                    <img 
                                        src={image.url} 
                                        alt={`Thumbnail ${index + 1}`} 
                                        onError={(e) => {
                                            e.target.src = '/placeholder-truck.png';
                                            e.target.onerror = null;
                                        }}
                                    />
                                </div>
                            ))}
                        </div>
                           {/* Documents Section */}
                <div className="documents-section">
                    <h2>Uploaded Documents</h2>
                    {inventory.documents && inventory.documents.length > 0 ? (
                        <ul className="documents-list">
                            {inventory.documents.map((doc, index) => (
                                <li key={index} className="document-item">
                                    <a href={doc.url} target="_blank" rel="noopener noreferrer">
                                        {doc.name}
                                    </a>
                                    <button onClick={() => printDocument(doc.url)} className="print-button">
                                        Print
                                    </button>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p>No documents uploaded.</p>
                    )}
                </div>
                    </div>

                    {/* Details Section */}
                    <div className="details-section">
                        <div className="vehicle-header">
                            <h1>{inventory.year} {inventory.make} {inventory.model}</h1>
                            <div className="price">${inventory.price?.toLocaleString()}</div>
                            <span className={`status-badge ${inventory.status || 'unknown'}`}>
                                {inventory.status || 'Unknown Status'}
                            </span>
                        </div>

                        {renderSpecifications(inventory)}

                        <div className="description">
                            <h2>Description</h2>
                            <p>{inventory.description || 'No description available'}</p>
                        </div>

                        {/* Seller Information */}
                        <div className="seller-section">
                            <h2>
                                <BuildingOfficeIcon />
                                Seller Information
                            </h2>
                            <div className="seller-card">
                                <h3>{inventory.sellerInfo.businessName}</h3>
                                <div className="seller-details">
                                    <a 
                                        href={`tel:${inventory.sellerInfo.phone}`} 
                                        className="contact-item"
                                    >
                                        <PhoneIcon />
                                        <span>{inventory.sellerInfo.phone}</span>
                                    </a>
                                    <a 
                                        href={`mailto:${inventory.sellerInfo.email}`}
                                        className="contact-item"
                                    >
                                        <EnvelopeIcon />
                                        <span>{inventory.sellerInfo.email}</span>
                                    </a>
                                    <div className="contact-item">
                                        <MapPinIcon />
                                        <span>{inventory.sellerInfo.location}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            <button 
                className={`scroll-to-top ${showScrollTop ? 'visible' : ''}`}
                onClick={scrollToTop}
                aria-label="Scroll to top"
            >
                <ArrowUpIcon className="h-5 w-5" />
            </button>
        </div>
    );
};

export default InventoryDetails; 