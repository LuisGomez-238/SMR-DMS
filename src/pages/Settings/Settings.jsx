import React from 'react';
import Navbar from '../../components/Navbar/Navbar';

const Settings = () => {
    return (
        <>
            <Navbar />
            <div className="dashboard-container">
                <main className="main-content">
                    <header className="dashboard-header">
                        <div className="header-title">
                            <h1>Settings</h1>
                            <p>Manage your account settings</p>
                        </div>
                    </header>
                    {/* Add your settings content here */}
                </main>
            </div>
        </>
    );
};

export default Settings; 