import { 
    collection, 
    addDoc, 
    query, 
    where, 
    getDocs,
    doc,
    getDoc,
    setDoc,
    updateDoc,
    deleteDoc,
    Timestamp 
} from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { db } from '../config';

export const inventoryService = {
    // Helper function to convert blob to base64
    async blobToBase64(blob) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(blob);
        });
    },

    async addInventory(sellerId, inventoryData) {
        try {
            // Verify the seller exists
            const sellerRef = doc(db, 'sellers', sellerId);
            const sellerSnap = await getDoc(sellerRef);
            if (!sellerSnap.exists()) {
                throw new Error('Seller not found');
            }

            const sellerData = sellerSnap.data();

            // Process images
            const processedImages = await Promise.all(
                inventoryData.images.map(async (img, index) => {
                    if (typeof img.url === 'string' && !img.url.startsWith('blob:')) {
                        return {
                            url: img.url,
                            isPrimary: index === 0
                        };
                    }

                    // Convert blob to base64 if necessary
                    const base64String = await this.blobToBase64(await fetch(img.preview).then(r => r.blob()));
                    return {
                        url: base64String,
                        isPrimary: index === 0
                    };
                })
            );

            // Prepare inventory data
            const inventory = {
                ...inventoryData,
                images: processedImages,
                sellerId,
                sellerInfo: {
                    businessName: sellerData.businessName,
                    contactName: sellerData.contactName,
                    email: sellerData.email,
                    phone: sellerData.phone,
                    location: sellerData.city && sellerData.state 
                        ? `${sellerData.city}, ${sellerData.state}`
                        : ''
                },
                createdAt: Timestamp.now(),
                updatedAt: Timestamp.now()
            };

            // Add to Firestore
            const docRef = await addDoc(collection(db, 'inventory'), inventory);
            console.log('Added inventory document:', docRef.id);
            
            return { 
                id: docRef.id, 
                ...inventory 
            };
        } catch (error) {
            console.error('Error adding inventory:', error);
            throw error;
        }
    },

    async updateInventory(inventoryId, updates) {
        try {
            const docRef = doc(db, 'inventory', inventoryId);
            await updateDoc(docRef, {
                ...updates,
                updatedAt: Timestamp.now()
            });
            return true;
        } catch (error) {
            console.error('Error updating inventory:', error);
            throw error;
        }
    },

    async deleteInventory(inventoryId) {
        try {
            await deleteDoc(doc(db, 'inventory', inventoryId));
            return true;
        } catch (error) {
            console.error('Error deleting inventory:', error);
            throw error;
        }
    },

    async getSellerInventory(sellerId) {
        try {
            const q = query(
                collection(db, 'inventory'), 
                where('sellerId', '==', sellerId)
            );
            
            const querySnapshot = await getDocs(q);
            return querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
        } catch (error) {
            console.error('Error fetching seller inventory:', error);
            throw error;
        }
    },

    async getInventoryById(inventoryId) {
        try {
            const docRef = doc(db, 'inventory', inventoryId);
            const docSnap = await getDoc(docRef);
            
            if (docSnap.exists()) {
                return { id: docSnap.id, ...docSnap.data() };
            }
            throw new Error('Inventory not found');
        } catch (error) {
            console.error('Error fetching inventory:', error);
            throw error;
        }
    },

    async getAllInventory() {
        try {
            const querySnapshot = await getDocs(collection(db, 'inventory'));
            const inventory = [];
            
            for (const docSnapshot of querySnapshot.docs) {
                const item = { id: docSnapshot.id, ...docSnapshot.data() };
                // Get seller details for each inventory item
                const sellerDocRef = doc(db, 'sellers', item.sellerId);
                const sellerDocSnap = await getDoc(sellerDocRef);
                item.sellerDetails = sellerDocSnap.exists() ? sellerDocSnap.data() : null;
                inventory.push(item);
            }
            
            return inventory;
        } catch (error) {
            console.error('Error fetching all inventory:', error);
            throw error;
        }
    },

    // Add a method to get inventory with seller details
    async getInventoryWithSellerDetails(inventoryId) {
        try {
            const inventoryDoc = await getDoc(doc(db, 'inventory', inventoryId));
            
            if (!inventoryDoc.exists()) {
                throw new Error('Inventory not found');
            }

            const inventoryData = inventoryDoc.data();
            
            // Process images - handle both base64 and regular URLs
            const processedImages = inventoryData.images?.map(img => ({
                url: img.url || img,  // Handle both formats
                isPrimary: img.isPrimary || false
            })) || [];

            // Sort images to ensure primary image is first
            processedImages.sort((a, b) => {
                if (a.isPrimary) return -1;
                if (b.isPrimary) return 1;
                return 0;
            });

            // Format numbers and handle optional fields
            const formattedData = {
                ...inventoryData,
                images: processedImages,
                price: parseFloat(inventoryData.price) || 0,
                mileage: parseInt(inventoryData.mileage) || 0,
                year: parseInt(inventoryData.year) || new Date().getFullYear(),
                features: inventoryData.features || {},
                description: inventoryData.description || 'No description available',
                status: inventoryData.status || 'unknown'
            };

            return {
                id: inventoryDoc.id,
                ...formattedData
            };
        } catch (error) {
            console.error('Error fetching inventory with seller details:', error);
            throw error;
        }
    }
}; 