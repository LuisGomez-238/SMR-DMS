import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { PDFDocument } from 'pdf-lib';
import { format } from 'date-fns';
import { buyersService } from '../../../firebase/services/buyersService';
import { s3 } from '../../../firebase/awsConfig';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { addDoc, collection, updateDoc, doc } from 'firebase/firestore';
import { db } from '../../../firebase/config';
import './FinanceApplication.css';

const S3_PDF_URL = 'https://smr-dms.s3.amazonaws.com/templates/BuyerForms.pdf';

const FinanceApplication = () => {
    const navigate = useNavigate();
    const { token } = useParams();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errors, setErrors] = useState({});

    const [formData, setFormData] = useState({
        buyerName: '',
        buyerDateofBirth: '',
        buyerTitle:'',   
        buyerEmail: '',
        buyerAddress: '',
        buyerCity: '',
        buyerState: '',
        buyerZip: '',
        date: new Date(),
        buyerCompanyName: '',
        buyerPhone: '',
        // Asset details
        buyerCDLNumber: '',
        buyerYearsDriving: '',
        buyerYearsOwner: '',
        buyerFleetSize: '',
        buyerTrucksInFleet: '',
        buyerTrailersInFleet: '',
        buyerEIN: '',
        buyerSS: '',
        buyerCDLState: '',
    });

    const [documents, setDocuments] = useState([]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleFileChange = (e, type) => {
        const file = e.target.files[0];
        if (file) {
            setDocuments(prev => [...prev, { file, type }]);
        }
    };

    const removeDocument = (index) => {
        setDocuments(prev => prev.filter((_, i) => i !== index));
    };

    const loadPdf = async () => {
        try {
            const response = await fetch(S3_PDF_URL, {
                headers: {
                    'Cache-Control': 'no-cache', // Optional: prevents caching if you update the template
                }
            });
            
            if (!response.ok) {
                throw new Error('Failed to load PDF template');
            }
            
            return await response.arrayBuffer();
        } catch (error) {
            console.error('Error loading PDF template:', error);
            throw error;
        }
    };

    const fillPdfForm = async (formData) => {
        try {
            const pdfBytes = await loadPdf();
            const pdfDoc = await PDFDocument.load(pdfBytes);
            const form = pdfDoc.getForm();

            // Helper function to safely set field text
            const setFieldText = (fieldName, value) => {
                try {
                    const field = form.getTextField(fieldName);
                    field.setText(value?.toString() || '');
                } catch (error) {
                    console.warn(`Field "${fieldName}" not found in PDF`);
                }
            };

            // Fill in all the form fields
            setFieldText('buyerName', formData.buyerName);
            setFieldText('buyerDateofBirth', formData.buyerDateofBirth, 'MM/dd/yy');
            setFieldText('buyerTitle', formData.buyerTitle);
            setFieldText('buyerEmail', formData.buyerEmail);
            setFieldText('buyerAddress', formData.buyerAddress);
            setFieldText('buyerCity', formData.buyerCity);
            setFieldText('buyerState', formData.buyerState);
            setFieldText('buyerZip', formData.buyerZip);
            setFieldText('date', format(formData.date, 'MM/dd/yy'));
            setFieldText('buyerCompanyName', formData.buyerCompanyName);
            setFieldText('buyerPhone', formData.buyerPhone);
            setFieldText('buyerCDLNumber', formData.buyerCDLNumber);
            setFieldText('buyerYearsDriving', formData.buyerYearsDriving);
            setFieldText('buyerYearsOwner', formData.buyerYearsOwner);
            setFieldText('assetPlateNumber', formData.assetPlateNumber);
            setFieldText('buyerFleetSize', formData.buyerFleetSize);
            setFieldText('buyerTrucksInFleet', formData.buyerTrucksInFleet);
            setFieldText('buyerTrailersInFleet', formData.buyerTrailersInFleet);
            setFieldText('buyerEIN', formData.buyerEIN);
            setFieldText('buyerSS', formData.buyerSS);
            setFieldText('buyerCDLState', formData.buyerCDLState);

            // Serialize the PDF
            const filledPdfBytes = await pdfDoc.save();
            
            // Convert to File object
            const filledPdfFile = new File(
                [filledPdfBytes], 
                'filled-buyer-forms.pdf', 
                { type: 'application/pdf' }
            );

            return filledPdfFile;
        } catch (error) {
            console.error('Error filling PDF:', error);
            throw error;
        }
    };

    const uploadToS3 = async (file, buyerId, type) => {
        const fileExtension = file.name.split('.').pop();
        const uniqueFileName = `finance-applications/${buyerId}/${type}-${Date.now()}.${fileExtension}`;
        
        const params = {
            Bucket: 'smr-dms',
            Key: uniqueFileName,
            Body: file,
            ContentType: file.type
        };

        try {
            await s3.send(new PutObjectCommand(params));
            return `https://smr-dms.s3.amazonaws.com/${uniqueFileName}`;
        } catch (error) {
            console.error('Error uploading to S3:', error);
            throw error;
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setErrors({});

        try {
            // Fill the PDF form first
            const filledPdfFile = await fillPdfForm(formData);
            
            // Create a temporary ID for the buyer
            const tempId = Date.now().toString();
            
            // Upload all documents to S3 first
            const pdfUrl = await uploadToS3(filledPdfFile, tempId, 'BuyerForms');
            const uploadPromises = documents.map(doc => 
                uploadToS3(doc.file, tempId, doc.type)
            );
            const uploadedUrls = await Promise.all(uploadPromises);

            // Prepare the documents array
            const documentsList = [
                { type: 'BuyerForms', url: pdfUrl },
                ...documents.map((doc, index) => ({
                    type: doc.type,
                    url: uploadedUrls[index]
                }))
            ];

            // Create the buyer document with all data including documents
            const buyerData = {
                businessName: formData.buyerCompanyName || '',
                contactName: formData.buyerName || '',
                email: formData.buyerEmail || '',
                phone: formData.buyerPhone || '',
                businessType: 'company',
                status: 'pending',
                address: formData.buyerAddress || '',
                city: formData.buyerCity || '',
                state: formData.buyerState || '',
                zipCode: formData.buyerZip || '',
                cdlNumber: formData.buyerCDLNumber || '',
                cdlState: formData.buyerCDLState || '',
                ein: formData.buyerEIN || '',
                ssn: formData.buyerSS || '',
                yearsDriving: formData.buyerYearsDriving || '',
                yearsOwner: formData.buyerYearsOwner || '',
                fleetSize: formData.buyerFleetSize || '',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                documents: documentsList // Include documents array in initial creation
            };

            // Create the Firestore document with all data at once
            await addDoc(collection(db, 'buyers'), buyerData);

            navigate('/finance-application-success');
        } catch (error) {
            console.error('Error in form submission:', error);
            setErrors(prev => ({
                ...prev,
                submit: 'Failed to submit application. Please try again.'
            }));
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="finance-application">
            <div className="application-container">
                <div className="application-header">
                    <img src="/logoSMR.png" alt="Sell My Rig" className="company-logo" />
                    <h1>Finance Application</h1>
                    <p>Please complete all required fields below</p>
                </div>

                <form onSubmit={handleSubmit} className="application-form">
                    {/* Business Information */}
                    <div className="form-section">
                        <h2>Business Information</h2>
                        
                        <div className="form-group">
                            <label htmlFor="buyerName">Name *</label>
                            <input
                                type="text"
                                id="buyerName"
                                name="buyerName"
                                placeholder='First and Last Name'
                                value={formData.buyerName}
                                onChange={handleInputChange}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="buyerDateofBirth">Date of Birth *</label>
                            <input
                                type="date"
                                id="buyerDateofBirth"
                                name="buyerDateofBirth"
                                value={formData.buyerDateofBirth}
                                onChange={handleInputChange}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="buyerCompanyName">Company Name *</label>
                            <input
                                type="text"
                                id="buyerCompanyName"
                                name="buyerCompanyName"
                                value={formData.buyerCompanyName}
                                onChange={handleInputChange}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="buyerEIN">EIN *</label>
                            <input
                                type="text"
                                id="buyerEIN"
                                name="buyerEIN"
                                placeholder='12-3456789'
                                value={formData.buyerEIN}
                                onChange={handleInputChange}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="buyerTitle">Title *</label>
                            <input
                                type="text"
                                id="buyerTitle"
                                name="buyerTitle"
                                placeholder='Owner'
                                value={formData.buyerTitle}
                                onChange={handleInputChange}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="buyerEmail">Email *</label>
                            <input
                                type="email"
                                id="buyerEmail"
                                name="buyerEmail"
                                placeholder='example@gmail.com'
                                value={formData.buyerEmail}
                                onChange={handleInputChange}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="buyerAddress">Street Address *</label>
                            <input
                                type="text"
                                id="buyerAddress"
                                name="buyerAddress"
                                placeholder='123 Main St'
                                value={formData.buyerAddress}
                                onChange={handleInputChange}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="buyerCity">City *</label>
                            <input
                                type="text"
                                id="buyerCity"
                                name="buyerCity"
                                placeholder='City'
                                value={formData.buyerCity}
                                onChange={handleInputChange}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="buyerState">State *</label>
                            <input
                                type="text"
                                id="buyerState"
                                name="buyerState"
                                placeholder='CA'
                                value={formData.buyerState}
                                onChange={handleInputChange}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="buyerZip">Zip Code *</label>
                            <input
                                type="text"
                                id="buyerZip"
                                name="buyerZip"
                                placeholder='12345'
                                value={formData.buyerZip}
                                onChange={handleInputChange}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="date">Date *</label>
                            <input
                                type="date"
                                id="date"
                                name="date"
                                value={formData.date.toISOString().split('T')[0]}
                                onChange={handleInputChange}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="buyerPhone">Phone Number *</label>
                            <input
                                type="tel"
                                id="buyerPhone"
                                name="buyerPhone"
                                placeholder='(123) 456-7890'
                                value={formData.buyerPhone}
                                onChange={handleInputChange}
                                required
                            />
                        </div>
                        
                        <div className="form-group">
                            <label htmlFor="buyerCDLNumber">CDL Number *</label>
                            <input
                                type="text"
                                id="buyerCDLNumber"
                                name="buyerCDLNumber"
                                placeholder='1234567890'
                                value={formData.buyerCDLNumber}
                                onChange={handleInputChange}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="buyerYearsDriving">Years Driving *</label>
                            <input
                                type="text"
                                id="buyerYearsDriving"
                                name="buyerYearsDriving"
                                placeholder='10'
                                value={formData.buyerYearsDriving}
                                onChange={handleInputChange}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="buyerYearsOwner">Years Owner *</label>
                            <input
                                type="text"
                                id="buyerYearsOwner"
                                name="buyerYearsOwner"
                                placeholder='10'
                                value={formData.buyerYearsOwner}
                                onChange={handleInputChange}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="buyerFleetSize">Fleet Size *</label>
                            <input
                                type="text"
                                id="buyerFleetSize"
                                name="buyerFleetSize"
                                placeholder='10'
                                value={formData.buyerFleetSize}
                                onChange={handleInputChange}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="buyerTrucksInFleet">Trucks in Fleet *</label>
                            <input
                                type="text"
                                id="buyerTrucksInFleet"
                                name="buyerTrucksInFleet"
                                placeholder='10'
                                value={formData.buyerTrucksInFleet}
                                onChange={handleInputChange}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="buyerTrailersInFleet">Trailers in Fleet *</label>
                            <input
                                type="text"
                                id="buyerTrailersInFleet"
                                name="buyerTrailersInFleet"
                                placeholder='10'
                                value={formData.buyerTrailersInFleet}
                                onChange={handleInputChange}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="buyerSS">SSN *</label>
                            <input
                                type="text"
                                id="buyerSS"
                                name="buyerSS"
                                placeholder='123-45-6789'
                                value={formData.buyerSS}
                                onChange={handleInputChange}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="buyerCDLState">CDL State *</label>
                            <input
                                type="text"
                                id="buyerCDLState"
                                name="buyerCDLState"
                                placeholder='CA'
                                value={formData.buyerCDLState}
                                onChange={handleInputChange}
                                required
                            />
                        </div>
                    </div>

                    {/* Documents */}
                    <div className="form-section">
                        <h2>Required Documents</h2>
                        
                        <div className="form-group">
                            <label>Commercial Driver's License</label>
                            <input
                                type="file"
                                onChange={(e) => handleFileChange(e, 'DriversLicense')}
                                accept=".pdf,.jpg,.jpeg,.png"
                            />
                        </div>

                        <div className="form-group">
                            <label>SSN Card</label>
                            <input
                                type="file"
                                onChange={(e) => handleFileChange(e, 'Insurance')}
                                accept=".pdf,.jpg,.jpeg,.png"
                            />
                        </div>

                        <div className="form-group">
                            <label>Work Permit (if applicable)</label>
                            <input
                                type="file"
                                onChange={(e) => handleFileChange(e, 'Insurance')}
                                accept=".pdf,.jpg,.jpeg,.png"
                            />
                        </div>

                        <div className="form-group">
                            <label>3 Months Most Recent Business Bank Statement</label>
                            <input
                                type="file"
                                onChange={(e) => handleFileChange(e, 'Insurance')}
                                accept=".pdf,.jpg,.jpeg,.png"
                            />
                        </div>

                        <div className="form-group">
                            <label>3 Months Most Recent Personal Bank Statement</label>
                            <input
                                type="file"
                                onChange={(e) => handleFileChange(e, 'Insurance')}
                                accept=".pdf,.jpg,.jpeg,.png"
                            />
                        </div>

                        <div className="form-group">
                            <label>2 Years of Business Tax Returns</label>
                            <input
                                type="file"
                                onChange={(e) => handleFileChange(e, 'Insurance')}
                                accept=".pdf,.jpg,.jpeg,.png"
                            />
                        </div>

                        <div className="form-group">
                            <label>2 Years of Personal Tax Returns</label>
                            <input
                                type="file"
                                onChange={(e) => handleFileChange(e, 'Insurance')}
                                accept=".pdf,.jpg,.jpeg,.png"
                            />
                        </div>

                        <div className="form-group">
                            <label>Other Documents</label>
                            <input
                                type="file"
                                onChange={(e) => handleFileChange(e, 'Other')}
                                accept=".pdf,.jpg,.jpeg,.png"
                            />
                        </div>

                        {documents.length > 0 && (
                            <div className="uploaded-documents">
                                <h3>Uploaded Documents</h3>
                                <ul>
                                    {documents.map((doc, index) => (
                                        <li key={index}>
                                            {doc.file.name}
                                            <button
                                                type="button"
                                                onClick={() => removeDocument(index)}
                                                className="remove-document"
                                            >
                                                Remove
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>

                    {errors.submit && (
                        <div className="error-message">{errors.submit}</div>
                    )}

                    <button
                        type="submit"
                        className="submit-button"
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? 'Submitting...' : 'Submit Application'}
                    </button>
                </form>

                <div className="application-footer">
                    <p>© {new Date().getFullYear()} Sell My Rig. All rights reserved.</p>
                </div>
            </div>
        </div>
    );
};

export default FinanceApplication; 