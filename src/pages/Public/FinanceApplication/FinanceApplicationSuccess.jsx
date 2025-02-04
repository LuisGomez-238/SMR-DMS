import { Link } from 'react-router-dom';
import './FinanceApplicationSuccess.css';

const FinanceApplicationSuccess = () => {
    return (
        <div className="success-page">
            <div className="success-container">
                <div className="success-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 13l4 4L19 7"
                        />
                    </svg>
                </div>
                
                <h1>Application Submitted Successfully!</h1>
                
                <p>
                    Thank you for submitting your finance application. Our team will
                    review your information and contact you shortly.
                </p>
                
                <div className="next-steps">
                    <h2>Next Steps</h2>
                    <ul>
                        <li>Review your email for confirmation</li>
                        <li>Prepare any additional documents if requested</li>
                        <li>Our team will contact you within 1-2 business days</li>
                    </ul>
                </div>

                <div className="contact-info">
                    <p>
                        If you have any questions, please contact us at:{' '}
                        <a href="mailto:info@sellmyrig.com">info@sellmyrig.com</a>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default FinanceApplicationSuccess; 