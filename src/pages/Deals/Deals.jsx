import React from 'react';
import Navbar from '../../components/Navbar/Navbar';

const Deals = () => {
    return (
        <>
            <Navbar />
            <div className="dashboard-container">
                <main className="main-content">
                    <header className="dashboard-header">
                        <div className="header-title">
                            <h1>Deals</h1>
                            <p>Track and manage your deals</p>
                        </div>
                    </header>
                    {/* Add your deals content here */}
                </main>
            </div>
        </>
    );
};

export default Deals; 