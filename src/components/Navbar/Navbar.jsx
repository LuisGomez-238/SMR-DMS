// Navbar.js
import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { 
    HomeIcon,
    UsersIcon,
    TruckIcon,
    DocumentTextIcon,
    ChartBarIcon,
    Cog6ToothIcon,
    Bars3Icon,
    XMarkIcon
} from '@heroicons/react/24/outline';
import './Navbar.css';

const Navbar = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const navItems = [
        { path: '/dashboard', name: 'Dashboard', icon: HomeIcon },
        { path: '/sellers', name: 'Sellers', icon: UsersIcon },
        { path: '/inventory', name: 'Inventory', icon: TruckIcon },
        { path: '/deals', name: 'Deals', icon: DocumentTextIcon },
        { path: '/reports', name: 'Reports', icon: ChartBarIcon },
        { path: '/settings', name: 'Settings', icon: Cog6ToothIcon },
    ];

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
        document.body.classList.toggle('menu-open', !isMenuOpen);
    };

    return (
        <nav className="navbar">
            <div className="nav-brand">
                <img src="/logoSMR.png" alt="Sell My Rig Logo" className="nav-logo" />
            </div>
            
            {/* Hamburger Menu Button */}
            <button 
                className="menu-toggle"
                onClick={toggleMenu}
                aria-label="Toggle navigation menu"
            >
                <Bars3Icon className="nav-icon" />
            </button>

            {/* Navigation Links */}
            <div className={`nav-links ${isMenuOpen ? 'active' : ''}`}>
                {navItems.map((item) => {
                    const Icon = item.icon;
                    return (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            className={({ isActive }) => 
                                `nav-link ${isActive ? 'active' : ''}`
                            }
                            onClick={() => setIsMenuOpen(false)}
                        >
                            <Icon className="nav-icon" />
                            <span className="nav-text">{item.name}</span>
                        </NavLink>
                    );
                })}
            </div>
        </nav>
    );
};

export default Navbar;
