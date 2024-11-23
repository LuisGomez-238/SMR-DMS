import { db, auth } from './config';
import { collection, getDocs, addDoc } from 'firebase/firestore';

export const firestoreService = {
    async getData(collectionName) {
        try {
            // Check if user is authenticated
            if (!auth.currentUser) {
                throw new Error('User must be authenticated to access data');
            }

            const querySnapshot = await getDocs(collection(db, collectionName));
            return querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
        } catch (error) {
            console.error('Error fetching data:', error);
            throw error;
        }
    }
}; 