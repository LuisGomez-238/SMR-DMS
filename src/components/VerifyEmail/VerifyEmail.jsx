import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import './VerifyEmail.css';

const VerifyEmail = ({ email }) => {
    const { resendVerificationEmail } = useAuth();
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [cooldown, setCooldown] = useState(false);

    const handleResendEmail = async () => {
        if (cooldown) return;

        try {
            setLoading(true);
            await resendVerificationEmail();
            setMessage('Verification email sent! Please check your inbox.');
            
            // Set cooldown
            setCooldown(true);
            setTimeout(() => setCooldown(false), 60000); // 1 minute cooldown
        } catch (error) {
            setMessage('Failed to resend verification email. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="verify-email-container">
            <h2>Verify Your Email</h2>
            <p>We've sent a verification email to:</p>
            <p className="email-address">{email}</p>
            <p>Please check your inbox and click the verification link to activate your account.</p>
            
            {message && <div className="message">{message}</div>}
            
            <button 
                onClick={handleResendEmail}
                disabled={loading || cooldown}
                className="resend-button"
            >
                {cooldown 
                    ? 'Please wait 1 minute before resending' 
                    : loading 
                        ? 'Sending...' 
                        : 'Resend Verification Email'}
            </button>

            <div className="instructions">
                <h3>Haven't received the email?</h3>
                <ul>
                    <li>Check your spam folder</li>
                    <li>Verify you entered the correct email address</li>
                    <li>Wait a few minutes and try resending the verification email</li>
                </ul>
            </div>
        </div>
    );
};

export default VerifyEmail; 