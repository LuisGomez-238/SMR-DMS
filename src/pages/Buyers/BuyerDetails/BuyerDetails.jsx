import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { buyersService } from '../../../firebase/services/buyersService';
import Navbar from '../../../components/Navbar/Navbar';
import LoadingSpinner from '../../../components/LoadingSpinner/LoadingSpinner';
import { FiUpload, FiTrash2, FiDownload } from 'react-icons/fi';
import './BuyerDetails.css';
import { format } from 'date-fns';

const BuyerDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [buyer, setBuyer] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [uploadError, setUploadError] = useState(null);

    useEffect(() => {
        fetchBuyerDetails();
    }, [id]);

    const fetchBuyerDetails = async () => {
        try {
            const buyerData = await buyersService.getBuyerById(id);
            if (!buyerData) {
                throw new Error('Buyer not found');
            }
            setBuyer(buyerData);
        } catch (error) {
            console.error('Error fetching buyer details:', error);
            setError('Failed to load buyer details. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    const handleFileUpload = async (e, documentType) => {
        const file = e.target.files[0];
        if (!file) return;

        setUploading(true);
        setUploadError(null);

        try {
            await buyersService.uploadDocument(id, file, documentType);
            await fetchBuyerDetails(); // Refresh buyer data
        } catch (error) {
            console.error('Error uploading file:', error);
            setUploadError('Failed to upload document. Please try again.');
        } finally {
            setUploading(false);
        }
    };

    const handleDeleteDocument = async (document) => {
        if (!window.confirm('Are you sure you want to delete this document?')) {
            return;
        }

        try {
            await buyersService.deleteDocument(id, document);
            await fetchBuyerDetails(); // Refresh buyer data
        } catch (error) {
            console.error('Error deleting document:', error);
            setError('Failed to delete document. Please try again.');
        }
    };

    const formatDate = (timestamp) => {
        if (!timestamp) return 'N/A';
        // Handle both Firestore timestamps and regular timestamps
        const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
        return format(date, 'MMM dd, yyyy HH:mm');
    };

    if (loading) return <LoadingSpinner />;
    if (error) return <div className="error-message">{error}</div>;
    if (!buyer) return <div className="error-message">Buyer not found</div>;

    return (
        <>
            <Navbar />
            <div className="buyer-details-container">
                <div className="buyer-details-header">
                    <div className="header-content">
                        <div className="header-left">
                            <button
                                className="btn-back"
                                onClick={() => navigate('/buyers')}
                            >
                                ← Back to Buyers
                            </button>
                            <h1>{buyer.businessName}</h1>
                            <span className={`status-badge ${buyer.status}`}>
                                {buyer.status}
                            </span>
                        </div>
                        <button
                            className="btn-edit"
                            onClick={() => navigate(`/buyers/${id}/edit`)}
                        >
                            Edit Buyer
                        </button>
                    </div>
                </div>

                <div className="buyer-details-content">
                    {/* Business Information */}
                    <div className="details-section">
                        <h2>Business Information</h2>
                        <div className="details-grid">
                            <div className="detail-item">
                                <label>Business Name</label>
                                <p>{buyer.businessName}</p>
                            </div>
                            <div className="detail-item">
                                <label>Business Type</label>
                                <p>{buyer.businessType}</p>
                            </div>
                            <div className="detail-item">
                                <label>EIN</label>
                                <p>{buyer.ein || 'Not provided'}</p>
                            </div>
                            <div className="detail-item">
                                <label>SSN</label>
                                <p>{buyer.ssn || 'Not provided'}</p>
                            </div>
                        </div>
                    </div>

                    {/* Contact Information */}
                    <div className="details-section">
                        <h2>Contact Information</h2>
                        <div className="details-grid">
                            <div className="detail-item">
                                <label>Contact Name</label>
                                <p>{buyer.contactName}</p>
                            </div>
                            <div className="detail-item">
                                <label>Email</label>
                                <p>{buyer.email}</p>
                            </div>
                            <div className="detail-item">
                                <label>Phone</label>
                                <p>{buyer.phone}</p>
                            </div>
                            <div className="detail-item">
                                <label>Preferred Contact Method</label>
                                <p>{buyer.preferredContactMethod}</p>
                            </div>
                        </div>
                    </div>

                    {/* Address Information */}
                    <div className="details-section">
                        <h2>Address</h2>
                        <div className="details-grid">
                            <div className="detail-item full-width">
                                <label>Street Address</label>
                                <p>{buyer.address}</p>
                            </div>
                            <div className="detail-item">
                                <label>City</label>
                                <p>{buyer.city}</p>
                            </div>
                            <div className="detail-item">
                                <label>State</label>
                                <p>{buyer.state}</p>
                            </div>
                            <div className="detail-item">
                                <label>ZIP Code</label>
                                <p>{buyer.zip}</p>
                            </div>
                        </div>
                    </div>

                    {/* Driver Information */}
                    <div className="details-section">
                        <h2>Driver Information</h2>
                        <div className="details-grid">
                            <div className="detail-item">
                                <label>CDL Number</label>
                                <p>{buyer.cdlNumber || 'Not provided'}</p>
                            </div>
                            <div className="detail-item">
                                <label>CDL State</label>
                                <p>{buyer.cdlState || 'Not provided'}</p>
                            </div>
                            <div className="detail-item">
                                <label>Years Driving</label>
                                <p>{buyer.yearsDriving || 'Not provided'}</p>
                            </div>
                            <div className="detail-item">
                                <label>Years as Owner</label>
                                <p>{buyer.yearsOwner || 'Not provided'}</p>
                            </div>
                        </div>
                    </div>

                    {/* Fleet Information */}
                    <div className="details-section">
                        <h2>Fleet Information</h2>
                        <div className="details-grid">
                            <div className="detail-item">
                                <label>Total Fleet Size</label>
                                <p>{buyer.fleetSize || 'Not provided'}</p>
                            </div>
                            <div className="detail-item">
                                <label>Number of Trucks</label>
                                <p>{buyer.trucksInFleet || 'Not provided'}</p>
                            </div>
                            <div className="detail-item">
                                <label>Number of Trailers</label>
                                <p>{buyer.trailersInFleet || 'Not provided'}</p>
                            </div>
                        </div>
                    </div>

                    {/* Documents Section */}
                    <div className="details-section">
                        <h2>Documents</h2>
                        
                        <div className="documents-grid">
                            {/* Upload Buttons */}
                            <div className="document-upload-section">
                                <h3>Upload New Document</h3>
                                <div className="upload-buttons">
                                    <div className="upload-button">
                                        <label htmlFor="cdl-upload" className="btn-upload">
                                            <FiUpload /> CDL
                                        </label>
                                        <input
                                            type="file"
                                            id="cdl-upload"
                                            accept=".pdf,.jpg,.jpeg,.png"
                                            onChange={(e) => handleFileUpload(e, 'CDL')}
                                            style={{ display: 'none' }}
                                        />
                                    </div>
                                    <div className="upload-button">
                                        <label htmlFor="insurance-upload" className="btn-upload">
                                            <FiUpload /> Insurance
                                        </label>
                                        <input
                                            type="file"
                                            id="insurance-upload"
                                            accept=".pdf,.jpg,.jpeg,.png"
                                            onChange={(e) => handleFileUpload(e, 'Insurance')}
                                            style={{ display: 'none' }}
                                        />
                                    </div>
                                    <div className="upload-button">
                                        <label htmlFor="other-upload" className="btn-upload">
                                            <FiUpload /> Other
                                        </label>
                                        <input
                                            type="file"
                                            id="other-upload"
                                            accept=".pdf,.jpg,.jpeg,.png"
                                            onChange={(e) => handleFileUpload(e, 'Other')}
                                            style={{ display: 'none' }}
                                        />
                                    </div>
                                </div>
                                {uploading && <div className="upload-status">Uploading...</div>}
                                {uploadError && <div className="error-message">{uploadError}</div>}
                            </div>

                            {/* Documents List */}
                            <div className="documents-list">
                                {buyer.documents?.length > 0 ? (
                                    buyer.documents.map((doc) => (
                                        <div key={doc.id} className="document-item">
                                            <div className="document-info">
                                                <span className="document-type">{doc.type}</span>
                                                <span className="document-name">{doc.name}</span>
                                                <span className="document-date">
                                                    {formatDate(doc.uploadedAt)}
                                                </span>
                                            </div>
                                            <div className="document-actions">
                                                <a
                                                    href={doc.url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="btn-icon"
                                                    title="Download"
                                                >
                                                    <FiDownload />
                                                </a>
                                                <button
                                                    onClick={() => handleDeleteDocument(doc)}
                                                    className="btn-icon delete"
                                                    title="Delete"
                                                >
                                                    <FiTrash2 />
                                                </button>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="no-documents">
                                        No documents uploaded yet
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default BuyerDetails; 