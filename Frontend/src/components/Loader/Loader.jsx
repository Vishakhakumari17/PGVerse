import React from 'react';
import './Loader.css';

const Loader = ({ fullPage = false }) => {
  return (
    <div className={`d-flex align-items-center justify-content-center ${fullPage ? 'loader-fullpage' : 'loader-inline'}`}>
      <div className="loader-container text-center">
        <div className="spinner-premium mb-3"></div>
        <p className="text-muted small font-display text-uppercase tracking-wider mb-0">Loading PGVerse...</p>
      </div>
    </div>
  );
};

export default Loader;
