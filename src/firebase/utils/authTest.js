import { db, auth } from '../config';
import { collection, getDocs } from 'firebase/firestore';

export async function testFirestoreAccess() {
    try {
        // Check auth state
        const user = auth.currentUser;
        console.log('Current user:', user ? {
            email: user.email,
            uid: user.uid,
            emailVerified: user.emailVerified
        } : 'No user signed in');

        // Try to access Firestore
        const testCollection = collection(db, 'test');
        const snapshot = await getDocs(testCollection);
        console.log('Successfully accessed Firestore');
        return true;
    } catch (error) {
        console.error('Firestore access test failed:', error);
        return false;
    }
}

// Usage example:
// testFirestoreAccess().then(success => {
//     console.log('Access test result:', success ? 'Passed' : 'Failed');
// }); 