import { useAuth } from './AuthContext';

export function AuthStatus() {
    const { currentUser } = useAuth();

    return (
        <div style={{ padding: '10px', background: '#f0f0f0', margin: '10px' }}>
            <h3>Auth Status</h3>
            {currentUser ? (
                <div>
                    <p>✅ Signed in as: {currentUser.email}</p>
                    <p>UID: {currentUser.uid}</p>
                    <p>Email verified: {currentUser.emailVerified ? 'Yes' : 'No'}</p>
                </div>
            ) : (
                <p>❌ Not signed in</p>
            )}
        </div>
    );
} 