import { 
    collection, 
    doc, 
    setDoc, 
    updateDoc, 
    deleteDoc, 
    getDoc, 
    getDocs,
    query,
    where,
    orderBy,
    serverTimestamp,
    arrayUnion,
    arrayRemove,
    addDoc
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { db, storage } from '../config';
import { s3 } from '../awsConfig';
import { PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';

const COLLECTION_NAME = 'buyers';
const BUCKET_NAME = import.meta.env.VITE_AWS_BUCKET_NAME;

export const buyersService = {
    // Create a new buyer with company name as ID
    async createBuyer(formData) {
        try {
            const buyerData = {
                businessName: formData.buyerCompanyName || '',
                contactName: formData.buyerName || '',
                email: formData.buyerEmail || '',
                phone: formData.buyerPhone || '',
                businessType: 'company', // default value
                status: 'pending', // for finance applications
                address: formData.buyerAddress || '',
                city: formData.buyerCity || '',
                state: formData.buyerState || '',
                zipCode: formData.buyerZip || '',
                // Additional fields
                cdlNumber: formData.buyerCDLNumber || '',
                cdlState: formData.buyerCDLState || '',
                ein: formData.buyerEIN || '',
                ssn: formData.buyerSS || '',
                yearsDriving: formData.buyerYearsDriving || '',
                yearsOwner: formData.buyerYearsOwner || '',
                fleetSize: formData.buyerFleetSize || '',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };

            const docRef = await addDoc(collection(db, 'buyers'), buyerData);
            return docRef.id;
        } catch (error) {
            console.error('Error creating buyer:', error);
            throw error;
        }
    },

    // Validate buyer data
    validateBuyerData(data) {
        const errors = {};
        let isValid = true;

        // Basic Information
        if (!data.businessName?.trim()) {
            errors.businessName = 'Business name is required';
            isValid = false;
        }

        if (!data.contactName?.trim()) {
            errors.contactName = 'Contact name is required';
            isValid = false;
        }

        if (!data.email?.trim()) {
            errors.email = 'Email is required';
            isValid = false;
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
            errors.email = 'Invalid email format';
            isValid = false;
        }

        if (!data.phone?.trim()) {
            errors.phone = 'Phone number is required';
            isValid = false;
        } else if (!/^\d{10}$/.test(data.phone.replace(/\D/g, ''))) {
            errors.phone = 'Invalid phone format (10 digits required)';
            isValid = false;
        }

        // Address Validation
        if (!data.address?.trim()) {
            errors.address = 'Address is required';
            isValid = false;
        }

        if (!data.city?.trim()) {
            errors.city = 'City is required';
            isValid = false;
        }

        if (!data.state?.trim()) {
            errors.state = 'State is required';
            isValid = false;
        }

        if (!data.zip?.trim()) {
            errors.zip = 'ZIP code is required';
            isValid = false;
        } else if (!/^\d{5}(-\d{4})?$/.test(data.zip)) {
            errors.zip = 'Invalid ZIP code format';
            isValid = false;
        }

        // Optional Field Validation - EIN is now optional
        if (data.ein && data.ein.trim() !== '' && !/^\d{2}-\d{7}$/.test(data.ein)) {
            errors.ein = 'Invalid EIN format (XX-XXXXXXX)';
            isValid = false;
        }

        if (data.ssn && !/^\d{3}-\d{2}-\d{4}$/.test(data.ssn)) {
            errors.ssn = 'Invalid SSN format (XXX-XX-XXXX)';
            isValid = false;
        }

        // Number Field Validation
        const numberFields = ['yearsDriving', 'yearsOwner', 'fleetSize', 'trucksInFleet', 'trailersInFleet'];
        numberFields.forEach(field => {
            if (data[field] && (isNaN(data[field]) || data[field] < 0)) {
                errors[field] = `Invalid ${field.replace(/([A-Z])/g, ' $1').toLowerCase()}`;
                isValid = false;
            }
        });

        return { isValid, errors };
    },

    // Add this to your existing buyersService
    async getBuyers() {
        try {
            const querySnapshot = await getDocs(
                query(
                    collection(db, COLLECTION_NAME),
                    orderBy('businessName', 'asc')
                )
            );
            
            return querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
        } catch (error) {
            console.error('Error getting buyers:', error);
            throw error;
        }
    },

    async getBuyerById(id) {
        try {
            const docRef = doc(db, COLLECTION_NAME, id);
            const docSnap = await getDoc(docRef);
            
            if (!docSnap.exists()) {
                return null;
            }

            return {
                id: docSnap.id,
                ...docSnap.data()
            };
        } catch (error) {
            console.error('Error getting buyer:', error);
            throw error;
        }
    },

    async uploadDocument(buyerId, file, documentType) {
        try {
            console.log('Starting document upload for buyer:', buyerId);
            
            // 1. Get buyer data
            const buyerRef = doc(db, COLLECTION_NAME, buyerId);
            const buyerSnap = await getDoc(buyerRef);
            
            if (!buyerSnap.exists()) {
                throw new Error(`Buyer not found with ID: ${buyerId}`);
            }

            const businessName = buyerSnap.data().businessName;
            console.log('Found buyer:', businessName);

            // 2. Prepare S3 path
            const cleanBusinessName = businessName.replace(/[^a-zA-Z0-9]/g, '_');
            const timestamp = Date.now();
            const fileName = `${documentType}_${timestamp}_${file.name}`;
            const s3Key = `buyers/${cleanBusinessName}_${buyerId}/documents/${fileName}`;

            // 3. Upload to S3
            const uploadParams = {
                Bucket: BUCKET_NAME,
                Key: s3Key,
                Body: file,
                ContentType: file.type
            };

            console.log('Uploading to S3...', uploadParams);
            await s3.send(new PutObjectCommand(uploadParams));

            // 4. Generate the S3 URL
            const fileUrl = `https://${BUCKET_NAME}.s3.${import.meta.env.VITE_AWS_REGION}.amazonaws.com/${s3Key}`;

            // 5. Update Firestore with document metadata
            console.log('Updating Firestore with document metadata...');
            const documentData = {
                id: `${documentType}_${timestamp}`,
                type: documentType,
                name: file.name,
                url: fileUrl,
                uploadedAt: timestamp,
                fileName: fileName,
                path: s3Key
            };

            // First add the document to the array
            await updateDoc(buyerRef, {
                documents: arrayUnion(documentData)
            });

            // Then update the timestamp separately
            await updateDoc(buyerRef, {
                updatedAt: serverTimestamp()
            });

            console.log('Document upload completed successfully');
            return fileUrl;
        } catch (error) {
            console.error('Detailed upload error:', {
                error: error.message,
                code: error.code,
                stack: error.stack,
                details: error
            });
            throw error;
        }
    },

    async deleteDocument(buyerId, document) {
        try {
            // 1. Delete from S3
            const deleteParams = {
                Bucket: BUCKET_NAME,
                Key: document.path
            };

            await s3.send(new DeleteObjectCommand(deleteParams));

            // 2. Remove from Firestore
            const buyerRef = doc(db, COLLECTION_NAME, buyerId);
            await updateDoc(buyerRef, {
                documents: arrayRemove(document),
                updatedAt: serverTimestamp()
            });
        } catch (error) {
            console.error('Error deleting document:', error);
            throw error;
        }
    }
}; 