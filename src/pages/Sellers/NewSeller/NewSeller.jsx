import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { sellersService } from '../../../firebase/services/sellersService';
import Navbar from '../../components/Navbar/Navbar';
import './NewSeller.css';

const NewSeller = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        businessName: '',
        contactName: '',
        email: '',
        phone: '',
        address: '',
        city: '',
        state: '',
        zip: '',
        businessType: 'individual',
        preferredContactMethod: 'email',
    });
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [generatedId, setGeneratedId] = useState('');

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

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            // Validate form data
            const { isValid, errors: validationErrors } = sellersService.validateSellerData(formData);

            if (!isValid) {
                setErrors(validationErrors);
                setIsSubmitting(false);
                return;
            }

            // Create seller in database
            const sellerId = await sellersService.createSeller(formData);
            
            // Show success message (you could use a toast notification here)
            console.log('Seller created successfully:', sellerId);
            
            // Redirect to seller details page
            navigate(`/sellers/${sellerId}`);
        } catch (error) {
            console.error('Error creating seller:', error);
            setErrors({
                submit: 'Failed to create seller. Please try again.'
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleCancel = () => {
        navigate('/sellers');
    };

    // Preview ID when business name changes
    useEffect(() => {
        if (formData.businessName) {
            const previewId = formData.businessName
                .toLowerCase()
                .replace(/[^a-z0-9]/g, '-')
                .replace(/-+/g, '-')
                .replace(/^-|-$/g, '');
            setGeneratedId(previewId);
        } else {
            setGeneratedId('');
        }
    }, [formData.businessName]);

    return (
        <>
            <Navbar />
            <div className="new-seller-container">
                <main className="main-content">
                    <header className="page-header">
                        <h1>New Seller</h1>
                        <p>Add a new seller to the platform</p>
                    </header>

                    {generatedId && (
                        <div className="id-preview">
                            <p>Generated Seller ID: <strong>{generatedId}</strong></p>
                        </div>
                    )}

                    {errors.submit && (
                        <div className="error-message">
                            {errors.submit}
                        </div>
                    )}

                    <div className="form-container">
                        <form onSubmit={handleSubmit} className="onboarding-form">
                            <div className="form-section">
                                <h2>Business Information</h2>
                                <div className="form-grid">
                                    <div className="form-group">
                                        <label htmlFor="businessType">Business Type</label>
                                        <select
                                            id="businessType"
                                            name="businessType"
                                            value={formData.businessType}
                                            onChange={handleChange}
                                            required
                                        >
                                            <option value="individual">Individual</option>
                                            <option value="company">Company</option>
                                        </select>
                                    </div>

                                    <div className="form-group">
                                        <label htmlFor="businessName">Business Name</label>
                                        <input
                                            type="text"
                                            id="businessName"
                                            name="businessName"
                                            value={formData.businessName}
                                            onChange={handleChange}
                                            className={errors.businessName ? 'error' : ''}
                                            required
                                        />
                                        {errors.businessName && (
                                            <span className="error-text">{errors.businessName}</span>
                                        )}
                                    </div>

                                </div>
                            </div>

                            <div className="form-section">
                                <h2>Contact Information</h2>
                                <div className="form-grid">
                                    <div className="form-group">
                                        <label htmlFor="contactName">Contact Name</label>
                                        <input
                                            type="text"
                                            id="contactName"
                                            name="contactName"
                                            value={formData.contactName}
                                            onChange={handleChange}
                                            className={errors.contactName ? 'error' : ''}
                                            required
                                        />
                                        {errors.contactName && (
                                            <span className="error-text">{errors.contactName}</span>
                                        )}
                                    </div>

                                    <div className="form-group">
                                        <label htmlFor="email">Email</label>
                                        <input
                                            type="email"
                                            id="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleChange}
                                            className={errors.email ? 'error' : ''}
                                            required
                                        />
                                        {errors.email && (
                                            <span className="error-text">{errors.email}</span>
                                        )}
                                    </div>

                                    <div className="form-group">
                                        <label htmlFor="phone">Phone</label>
                                        <input
                                            type="tel"
                                            id="phone"
                                            name="phone"
                                            value={formData.phone}
                                            onChange={handleChange}
                                            className={errors.phone ? 'error' : ''}
                                            required
                                        />
                                        {errors.phone && (
                                            <span className="error-text">{errors.phone}</span>
                                        )}
                                    </div>

                                    <div className="form-group">
                                        <label htmlFor="preferredContactMethod">Preferred Contact Method</label>
                                        <select
                                            id="preferredContactMethod"
                                            name="preferredContactMethod"
                                            value={formData.preferredContactMethod}
                                            onChange={handleChange}
                                            className={errors.preferredContactMethod ? 'error' : ''}
                                            required
                                        >
                                            <option value="email">Email</option>
                                            <option value="phone">Phone</option>
                                            <option value="text">Text</option>
                                        </select>
                                        {errors.preferredContactMethod && (
                                            <span className="error-text">{errors.preferredContactMethod}</span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="form-section">
                                <h2>Address</h2>
                                <div className="form-grid">
                                    <div className="form-group full-width">
                                        <label htmlFor="address">Street Address</label>
                                        <input
                                            type="text"
                                            id="address"
                                            name="address"
                                            value={formData.address}
                                            onChange={handleChange}
                                            className={errors.address ? 'error' : ''}
                                            required
                                        />
                                        {errors.address && (
                                            <span className="error-text">{errors.address}</span>
                                        )}
                                    </div>

                                    <div className="form-group">
                                        <label htmlFor="city">City</label>
                                        <input
                                            type="text"
                                            id="city"
                                            name="city"
                                            value={formData.city}
                                            onChange={handleChange}
                                            className={errors.city ? 'error' : ''}
                                            required
                                        />
                                        {errors.city && (
                                            <span className="error-text">{errors.city}</span>
                                        )}
                                    </div>

                                    <div className="form-group">
                                        <label htmlFor="state">State</label>
                                        <input
                                            type="text"
                                            id="state"
                                            name="state"
                                            value={formData.state}
                                            onChange={handleChange}
                                            className={errors.state ? 'error' : ''}
                                            required
                                        />
                                        {errors.state && (
                                            <span className="error-text">{errors.state}</span>
                                        )}
                                    </div>

                                    <div className="form-group">
                                        <label htmlFor="zip">ZIP Code</label>
                                        <input
                                            type="text"
                                            id="zip"
                                            name="zip"
                                            value={formData.zip}
                                            onChange={handleChange}
                                            className={errors.zip ? 'error' : ''}
                                            required
                                        />
                                        {errors.zip && (
                                            <span className="error-text">{errors.zip}</span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="form-actions">
                                <button 
                                    type="submit" 
                                    className="btn-primary"
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? 'Creating...' : 'Create Seller Profile'}
                                </button>
                                <button 
                                    type="button" 
                                    className="btn-secondary"
                                    onClick={handleCancel}
                                    disabled={isSubmitting}
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </main>
            </div>
        </>
    );
};

export default NewSeller;