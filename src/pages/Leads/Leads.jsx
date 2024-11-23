import React from 'react';
import Navbar from '../components/Navbar';

const Leads = () => {
    return (
        <>
            <Navbar />
            <div className="dashboard-container">
                <main className="main-content">
                    <header className="dashboard-header">
                        <div className="header-title">
                            <h1>Leads</h1>
                            <p>Manage your leads and prospects</p>
                        </div>
                    </header>
                    {/* Add your leads content here */}
                </main>
            </div>
        </>
    );
};

export default Leads; 