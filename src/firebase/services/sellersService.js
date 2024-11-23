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
    serverTimestamp 
} from 'firebase/firestore';
import { db } from '../config';

const COLLECTION_NAME = 'sellers';

export const sellersService = {
    // Create a new seller with company name as ID
    async createSeller(sellerData) {
        try {
            // Format company name for ID (remove spaces, special chars, lowercase)
            const sellerId = sellerData.businessName
                .toLowerCase()
                .replace(/[^a-z0-9]/g, '-') // Replace special chars with hyphens
                .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
                .replace(/^-|-$/g, ''); // Remove leading/trailing hyphens

            // Check if seller ID already exists
            const existingDoc = await getDoc(doc(db, COLLECTION_NAME, sellerId));
            if (existingDoc.exists()) {
                throw new Error('A seller with this business name already exists');
            }

            // Create new document with formatted ID
            const docRef = doc(db, COLLECTION_NAME, sellerId);
            await setDoc(docRef, {
                ...sellerData,
                id: sellerId, // Store the formatted ID in the document
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
                status: 'active'
            });

            return sellerId;
        } catch (error) {
            console.error('Error creating seller:', error);
            throw error;
        }
    },

    // Get a seller by ID
    async getSellerById(sellerId) {
        try {
            const docRef = doc(db, COLLECTION_NAME, sellerId);
            const docSnap = await getDoc(docRef);
            
            if (docSnap.exists()) {
                return { id: docSnap.id, ...docSnap.data() };
            }
            return null;
        } catch (error) {
            console.error('Error getting seller:', error);
            throw error;
        }
    },

    // Update a seller
    async updateSeller(sellerId, updateData) {
        try {
            const docRef = doc(db, COLLECTION_NAME, sellerId);
            await updateDoc(docRef, {
                ...updateData,
                updatedAt: serverTimestamp()
            });
            return true;
        } catch (error) {
            console.error('Error updating seller:', error);
            throw error;
        }
    },

    // Delete a seller (soft delete)
    async deleteSeller(sellerId) {
        try {
            const docRef = doc(db, COLLECTION_NAME, sellerId);
            await updateDoc(docRef, {
                status: 'inactive',
                updatedAt: serverTimestamp()
            });
            return true;
        } catch (error) {
            console.error('Error deleting seller:', error);
            throw error;
        }
    },

    // Get all active sellers
    async getAllSellers() {
        try {
            const querySnapshot = await getDocs(collection(db, COLLECTION_NAME));
            return querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
        } catch (error) {
            console.error('Error getting sellers:', error);
            throw error;
        }
    },

    // Search sellers
    async searchSellers(searchTerm) {
        try {
            const q = query(
                collection(db, COLLECTION_NAME),
                where('status', '==', 'active'),
                where('businessName', '>=', searchTerm),
                where('businessName', '<=', searchTerm + '\uf8ff'),
                orderBy('businessName'),
                limit(10)
            );
            
            const querySnapshot = await getDocs(q);
            return querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
        } catch (error) {
            console.error('Error searching sellers:', error);
            throw error;
        }
    },

    // Validate seller data
    validateSellerData(data) {
        const errors = {};

        // Required fields (simplified)
        const requiredFields = [
            'businessName',
            'businessType',
            'contactName',
            'email',
            'phone',
            'address',
            'city',
            'state',
            'zip',
            'preferredContactMethod'
        ];

        requiredFields.forEach(field => {
            if (!data[field]) {
                errors[field] = 'This field is required';
            }
        });

        // Business name validation
        if (data.businessName) {
            if (data.businessName.length < 2) {
                errors.businessName = 'Business name must be at least 2 characters';
            }
            if (data.businessName.length > 100) {
                errors.businessName = 'Business name must be less than 100 characters';
            }
        }

        // Email validation
        if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
            errors.email = 'Invalid email format';
        }

        // Phone validation
        if (data.phone && !/^\d{10}$/.test(data.phone.replace(/\D/g, ''))) {
            errors.phone = 'Invalid phone number format';
        }

        // ZIP code validation
        if (data.zip && !/^\d{5}(-\d{4})?$/.test(data.zip)) {
            errors.zip = 'Invalid ZIP code format';
        }

        return {
            isValid: Object.keys(errors).length === 0,
            errors
        };
    }
}; 