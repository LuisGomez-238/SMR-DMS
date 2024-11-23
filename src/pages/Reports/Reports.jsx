import React from 'react';
import Navbar from '../../components/Navbar/Navbar';

const Reports = () => {
    return (
        <>
            <Navbar />
            <div className="dashboard-container">
                <main className="main-content">
                    <header className="dashboard-header">
                        <div className="header-title">
                            <h1>Reports</h1>
                            <p>View analytics and reports</p>
                        </div>
                    </header>
                    {/* Add your reports content here */}
                </main>
            </div>
        </>
    );
};

export default Reports; 