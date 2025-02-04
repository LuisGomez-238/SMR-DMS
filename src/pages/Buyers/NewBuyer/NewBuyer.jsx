import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { buyersService } from '../../../firebase/services/buyersService';
import Navbar from '../../../components/Navbar/Navbar';
import DocumentUpload from '../../../components/DocumentUpload/DocumentUpload';
import './NewBuyer.css';

const NewBuyer = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        // Basic Information
        businessName: '',
        contactName: '',
        email: '',
        phone: '',
        businessType: 'individual',
        // Address Information
        address: '',
        city: '',
        state: '',
        zip: '',
        // Business Details
        ein: '',
        ssn: '',
        // Driver Information
        cdlNumber: '',
        cdlState: '',
        yearsDriving: '',
        yearsOwner: '',
        // Fleet Information
        fleetSize: '',
        trucksInFleet: '',
        trailersInFleet: '',
        // Contact Preference
        preferredContactMethod: 'email',
    });
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [documents, setDocuments] = useState([]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        // Clear error when field is edited
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    const handleFileAdd = (fileData, index) => {
        if (index !== undefined) {
            const newDocs = [...documents];
            newDocs[index] = fileData;
            setDocuments(newDocs);
        } else {
            setDocuments([...documents, fileData]);
        }
    };

    const handleFileRemove = (index) => {
        const newDocs = documents.filter((_, i) => i !== index);
        setDocuments(newDocs);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setErrors({});

        try {
            // First create the buyer
            const buyerId = await buyersService.createBuyer(formData);
            
            // Then upload each document
            if (documents.length > 0) {
                const uploadPromises = documents.map(doc => 
                    buyersService.uploadDocument(buyerId, doc.file, doc.type)
                );
                
                // Wait for all uploads to complete
                await Promise.all(uploadPromises);
            }

            // Navigate to the buyer details page
            navigate(`/buyers/${buyerId}`);
        } catch (error) {
            console.error('Error creating buyer:', error);
            setErrors(prev => ({
                ...prev,
                submit: 'Failed to create buyer or upload documents. Please try again.'
            }));
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <>
            <Navbar />
            <div className="new-buyer-container">
                <div className="main-content">
                    <div className="page-header">
                        <h1>New Buyer</h1>
                        <p>Create a new buyer profile</p>
                    </div>

                    <form onSubmit={handleSubmit} className="onboarding-form">
                        {/* Business Information Section */}
                        <div className="form-section">
                            <h2>Business Information</h2>
                            <div className="form-row">
                                <div className="form-group">
                                    <label htmlFor="businessName">Business Name*</label>
                                    <input
                                        type="text"
                                        id="businessName"
                                        name="businessName"
                                        value={formData.businessName}
                                        onChange={handleChange}
                                        className={errors.businessName ? 'error' : ''}
                                    />
                                    {errors.businessName && <span className="error-message">{errors.businessName}</span>}
                                </div>

                                <div className="form-group">
                                    <label htmlFor="businessType">Business Type*</label>
                                    <select
                                        id="businessType"
                                        name="businessType"
                                        value={formData.businessType}
                                        onChange={handleChange}
                                    >
                                        <option value="individual">Individual</option>
                                        <option value="company">Company</option>
                                        <option value="partnership">Partnership</option>
                                    </select>
                                </div>
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label htmlFor="ein">EIN (XX-XXXXXXX)</label>
                                    <input
                                        type="text"
                                        id="ein"
                                        name="ein"
                                        value={formData.ein}
                                        onChange={handleChange}
                                        className={errors.ein ? 'error' : ''}
                                        placeholder="XX-XXXXXXX"
                                    />
                                    {errors.ein && <span className="error-message">{errors.ein}</span>}
                                </div>

                                <div className="form-group">
                                    <label htmlFor="ssn">SSN (XXX-XX-XXXX)</label>
                                    <input
                                        type="text"
                                        id="ssn"
                                        name="ssn"
                                        value={formData.ssn}
                                        onChange={handleChange}
                                        className={errors.ssn ? 'error' : ''}
                                        placeholder="XXX-XX-XXXX"
                                    />
                                    {errors.ssn && <span className="error-message">{errors.ssn}</span>}
                                </div>
                            </div>
                        </div>

                        {/* Contact Information Section */}
                        <div className="form-section">
                            <h2>Contact Information</h2>
                            <div className="form-row">
                                <div className="form-group">
                                    <label htmlFor="contactName">Contact Name*</label>
                                    <input
                                        type="text"
                                        id="contactName"
                                        name="contactName"
                                        value={formData.contactName}
                                        onChange={handleChange}
                                        className={errors.contactName ? 'error' : ''}
                                    />
                                    {errors.contactName && <span className="error-message">{errors.contactName}</span>}
                                </div>

                                <div className="form-group">
                                    <label htmlFor="preferredContactMethod">Preferred Contact Method*</label>
                                    <select
                                        id="preferredContactMethod"
                                        name="preferredContactMethod"
                                        value={formData.preferredContactMethod}
                                        onChange={handleChange}
                                    >
                                        <option value="email">Email</option>
                                        <option value="phone">Phone</option>
                                        <option value="text">Text</option>
                                    </select>
                                </div>
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label htmlFor="email">Email*</label>
                                    <input
                                        type="email"
                                        id="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        className={errors.email ? 'error' : ''}
                                    />
                                    {errors.email && <span className="error-message">{errors.email}</span>}
                                </div>

                                <div className="form-group">
                                    <label htmlFor="phone">Phone*</label>
                                    <input
                                        type="tel"
                                        id="phone"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleChange}
                                        className={errors.phone ? 'error' : ''}
                                        placeholder="1234567890"
                                    />
                                    {errors.phone && <span className="error-message">{errors.phone}</span>}
                                </div>
                            </div>
                        </div>

                        {/* Address Section */}
                        <div className="form-section">
                            <h2>Address Information</h2>
                            <div className="form-row">
                                <div className="form-group full-width">
                                    <label htmlFor="address">Street Address*</label>
                                    <input
                                        type="text"
                                        id="address"
                                        name="address"
                                        value={formData.address}
                                        onChange={handleChange}
                                        className={errors.address ? 'error' : ''}
                                    />
                                    {errors.address && <span className="error-message">{errors.address}</span>}
                                </div>
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label htmlFor="city">City*</label>
                                    <input
                                        type="text"
                                        id="city"
                                        name="city"
                                        value={formData.city}
                                        onChange={handleChange}
                                        className={errors.city ? 'error' : ''}
                                    />
                                    {errors.city && <span className="error-message">{errors.city}</span>}
                                </div>

                                <div className="form-group">
                                    <label htmlFor="state">State*</label>
                                    <input
                                        type="text"
                                        id="state"
                                        name="state"
                                        value={formData.state}
                                        onChange={handleChange}
                                        className={errors.state ? 'error' : ''}
                                        maxLength="2"
                                        placeholder="CA"
                                    />
                                    {errors.state && <span className="error-message">{errors.state}</span>}
                                </div>

                                <div className="form-group">
                                    <label htmlFor="zip">ZIP Code*</label>
                                    <input
                                        type="text"
                                        id="zip"
                                        name="zip"
                                        value={formData.zip}
                                        onChange={handleChange}
                                        className={errors.zip ? 'error' : ''}
                                        placeholder="12345"
                                    />
                                    {errors.zip && <span className="error-message">{errors.zip}</span>}
                                </div>
                            </div>
                        </div>

                        {/* Driver Information Section */}
                        <div className="form-section">
                            <h2>Driver Information</h2>
                            <div className="form-row">
                                <div className="form-group">
                                    <label htmlFor="cdlNumber">CDL Number</label>
                                    <input
                                        type="text"
                                        id="cdlNumber"
                                        name="cdlNumber"
                                        value={formData.cdlNumber}
                                        onChange={handleChange}
                                        className={errors.cdlNumber ? 'error' : ''}
                                    />
                                    {errors.cdlNumber && <span className="error-message">{errors.cdlNumber}</span>}
                                </div>

                                <div className="form-group">
                                    <label htmlFor="cdlState">CDL State</label>
                                    <input
                                        type="text"
                                        id="cdlState"
                                        name="cdlState"
                                        value={formData.cdlState}
                                        onChange={handleChange}
                                        className={errors.cdlState ? 'error' : ''}
                                        maxLength="2"
                                        placeholder="CA"
                                    />
                                    {errors.cdlState && <span className="error-message">{errors.cdlState}</span>}
                                </div>
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label htmlFor="yearsDriving">Years Driving</label>
                                    <input
                                        type="number"
                                        id="yearsDriving"
                                        name="yearsDriving"
                                        value={formData.yearsDriving}
                                        onChange={handleChange}
                                        className={errors.yearsDriving ? 'error' : ''}
                                        min="0"
                                    />
                                    {errors.yearsDriving && <span className="error-message">{errors.yearsDriving}</span>}
                                </div>

                                <div className="form-group">
                                    <label htmlFor="yearsOwner">Years as Owner</label>
                                    <input
                                        type="number"
                                        id="yearsOwner"
                                        name="yearsOwner"
                                        value={formData.yearsOwner}
                                        onChange={handleChange}
                                        className={errors.yearsOwner ? 'error' : ''}
                                        min="0"
                                    />
                                    {errors.yearsOwner && <span className="error-message">{errors.yearsOwner}</span>}
                                </div>
                            </div>
                        </div>

                        {/* Fleet Information Section */}
                        <div className="form-section">
                            <h2>Fleet Information</h2>
                            <div className="form-row">
                                <div className="form-group">
                                    <label htmlFor="fleetSize">Total Fleet Size</label>
                                    <input
                                        type="number"
                                        id="fleetSize"
                                        name="fleetSize"
                                        value={formData.fleetSize}
                                        onChange={handleChange}
                                        className={errors.fleetSize ? 'error' : ''}
                                        min="0"
                                    />
                                    {errors.fleetSize && <span className="error-message">{errors.fleetSize}</span>}
                                </div>

                                <div className="form-group">
                                    <label htmlFor="trucksInFleet">Number of Trucks</label>
                                    <input
                                        type="number"
                                        id="trucksInFleet"
                                        name="trucksInFleet"
                                        value={formData.trucksInFleet}
                                        onChange={handleChange}
                                        className={errors.trucksInFleet ? 'error' : ''}
                                        min="0"
                                    />
                                    {errors.trucksInFleet && <span className="error-message">{errors.trucksInFleet}</span>}
                                </div>

                                <div className="form-group">
                                    <label htmlFor="trailersInFleet">Number of Trailers</label>
                                    <input
                                        type="number"
                                        id="trailersInFleet"
                                        name="trailersInFleet"
                                        value={formData.trailersInFleet}
                                        onChange={handleChange}
                                        className={errors.trailersInFleet ? 'error' : ''}
                                        min="0"
                                    />
                                    {errors.trailersInFleet && <span className="error-message">{errors.trailersInFleet}</span>}
                                </div>
                            </div>
                        </div>

                        {/* Document Upload Section */}
                        <div className="form-section">
                            <h2>Documents</h2>
                            <DocumentUpload
                                files={documents}
                                onFileAdd={handleFileAdd}
                                onFileRemove={handleFileRemove}
                            />
                        </div>

                        {/* Form Actions */}
                        <div className="form-actions">
                            <button
                                type="button"
                                onClick={() => navigate('/buyers')}
                                className="btn-secondary"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="btn-primary"
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? 'Creating...' : 'Create Buyer'}
                            </button>
                        </div>

                        {errors.submit && <div className="error-message submit-error">{errors.submit}</div>}
                    </form>
                </div>
            </div>
        </>
    );
};

export default NewBuyer; 