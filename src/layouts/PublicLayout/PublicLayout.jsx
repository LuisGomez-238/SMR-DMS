import { Outlet } from 'react-router-dom';
import './PublicLayout.css';

const PublicLayout = () => {
    return (
        <div className="public-layout">
            <main className="public-main">
                <Outlet />
            </main>
            
            <footer className="public-footer">
                <p>© {new Date().getFullYear()} Sell My Rig. All rights reserved.</p>
            </footer>
        </div>
    );
};

export default PublicLayout; 