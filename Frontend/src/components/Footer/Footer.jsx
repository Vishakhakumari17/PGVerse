import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="footer py-5 mt-auto" style={{ backgroundColor: '#090d16', color: '#9ca3af' }}>
      <div className="container">
        <div className="row g-4">
          <div className="col-lg-4 col-md-6">
            <h5 className="text-white font-display mb-3 fw-bold">⚡ PGVerse</h5>
            <p className="small mb-3" style={{ lineHeight: '1.6' }}>
              Find verified PGs across Delhi NCR near colleges, metro stations, coaching hubs, and workplaces. Compare rooms, facilities, prices, and book your ideal stay with confidence.
            </p>
            <div className="d-flex gap-3 social-links">
              <a href="https://facebook.com/pgverse" target="_blank" rel="noopener noreferrer" className="social-icon"><i className="bi bi-facebook fs-5"></i></a>
              <a href="https://instagram.com/pgverse" target="_blank" rel="noopener noreferrer" className="social-icon"><i className="bi bi-instagram fs-5"></i></a>
              <a href="https://twitter.com/pgverse" target="_blank" rel="noopener noreferrer" className="social-icon"><i className="bi bi-twitter-x fs-5"></i></a>
              <a href="https://linkedin.com/company/pgverse" target="_blank" rel="noopener noreferrer" className="social-icon"><i className="bi bi-linkedin fs-5"></i></a>
            </div>
          </div>
          
          <div className="col-lg-2 col-md-6">
            <h6 className="text-white font-display mb-3 fw-bold">Quick Links</h6>
            <ul className="list-unstyled small d-flex flex-column gap-2">
              <li><Link to="/" className="hover-white text-decoration-none">Home</Link></li>
              <li><Link to="/search" className="hover-white text-decoration-none">Search PGs</Link></li>
              <li><Link to="/register?role=owner" className="hover-white text-decoration-none">PG Owners</Link></li>
              <li><Link to="/contact" className="hover-white text-decoration-none">Contact Us</Link></li>
              <li><Link to="/login" className="hover-white text-decoration-none">Login / Register</Link></li>
            </ul>
          </div>

          <div className="col-lg-3 col-md-6">
            <h6 className="text-white font-display mb-3 fw-bold">Popular Locations</h6>
            <ul className="list-unstyled small d-flex flex-column gap-2">
              <li><Link to="/search?city=Delhi" className="hover-white text-decoration-none">Delhi</Link></li>
              <li><Link to="/search?city=Noida" className="hover-white text-decoration-none">Noida</Link></li>
              <li><Link to="/search?city=Greater%20Noida" className="hover-white text-decoration-none">Greater Noida</Link></li>
              <li><Link to="/search?city=Gurugram" className="hover-white text-decoration-none">Gurugram</Link></li>
            </ul>
          </div>

          <div className="col-lg-3 col-md-6">
            <h6 className="text-white font-display mb-3 fw-bold">Support</h6>
            <p className="small mb-2"><i className="bi bi-envelope me-2 text-accent"></i> support@pgverse.com</p>
            <p className="small mb-2"><i className="bi bi-telephone me-2 text-accent"></i> +91 98765 43210</p>
            <p className="small"><i className="bi bi-geo-alt me-2 text-accent"></i> Delhi NCR, India</p>
          </div>
        </div>

        <hr className="my-4" style={{ borderColor: 'rgba(255,255,255,0.08)' }} />
        <div className="d-flex flex-md-row flex-column justify-content-between align-items-center gap-3">
          <div>
            <p className="small mb-1">&copy; {new Date().getFullYear()} PGVerse | Developed by Vishakha kumari</p>
            <p className="small text-muted mb-0" style={{ fontSize: '0.8rem' }}>Helping Students & Working Professionals Find Verified PGs Across Delhi NCR.</p>
          </div>
          <div className="d-flex gap-3 small">
            <a href="#" className="hover-white text-decoration-none">Privacy Policy</a>
            <span className="text-muted">|</span>
            <a href="#" className="hover-white text-decoration-none">Terms of Service</a>
          </div>
        </div>
      </div>
      <style>{`
        .footer {
          color: #9ca3af !important; /* Always light gray base text */
        }
        .footer a {
          color: #9ca3af !important;
          transition: color 0.2s ease;
        }
        .footer a:hover,
        .footer .hover-white:hover {
          color: #ffffff !important;
        }
        .footer .text-muted {
          color: #8c847c !important; /* Always readable light-medium gray */
        }
        .footer hr {
          border-color: rgba(255, 255, 255, 0.08) !important;
        }
        .social-icon {
          color: #9ca3af !important;
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
          display: inline-block;
        }
        .social-icon:hover {
          color: var(--accent) !important;
          transform: translateY(-3px) scale(1.15);
        }
        .text-accent {
          color: var(--accent) !important;
        }
      `}</style>
    </footer>
  );
};

export default Footer;
