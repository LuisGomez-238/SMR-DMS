// src/Footer.jsx
import React from 'react';
import './Footer.css'; // Optional: If you want to add specific styles for the footer

const Footer = () => {
  return (
    <footer className="footer">
      <p>© {new Date().getFullYear()} AWEVO Software Solutions. All rights reserved.</p>
    </footer>
  );
};

export default Footer;
