import React, { useContext, useState } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import './Card.css';

const Card = ({ pg }) => {
  const { user, toggleSavePG, showToast } = useContext(AuthContext);
  const [showDesc, setShowDesc] = useState(false);

  const getMinPrice = () => {
    if (!pg.rooms || pg.rooms.length === 0) return 'N/A';
    const prices = pg.rooms.map(r => r.price);
    return Math.min(...prices);
  };

  const isSaved = user?.savedPGs?.some(id => (id._id || id) === pg._id);

  const handleSave = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      showToast('Please login to book or to continue further process.', 'error');
      return;
    }
    try {
      await toggleSavePG(pg._id);
      showToast(isSaved ? 'PG removed from wishlist!' : 'PG saved to wishlist!', 'success');
    } catch (err) {
      showToast(err.message || 'Action failed', 'error');
    }
  };

  const getFacilityIcon = (facility) => {
    const name = facility.toLowerCase().trim();
    if (name.includes('wifi')) return 'bi-wifi';
    if (name.includes('ac') || name.includes('air conditioner') || name.includes('cooling')) return 'bi-snow';
    if (name.includes('laundry') || name.includes('washing')) return 'bi-water';
    if (name.includes('gym') || name.includes('fitness')) return 'bi-heartpulse';
    if (name.includes('food') || name.includes('meal') || name.includes('kitchen')) return 'bi-cup-hot';
    if (name.includes('cctv') || name.includes('security') || name.includes('camera')) return 'bi-shield-check';
    if (name.includes('power') || name.includes('generator') || name.includes('backup')) return 'bi-lightning-charge';
    return 'bi-check-circle';
  };

  const getSharingTypes = () => {
    if (!pg.rooms || pg.rooms.length === 0) return 'Rooms Available';
    const sharings = pg.rooms.map(r => r.sharing);
    const uniqueSharings = [...new Set(sharings)].sort();
    return uniqueSharings.map(s => s === 1 ? 'Single' : `${s} Sharing`).join(', ');
  };

  return (
    <div className="pg-card-flip-container">
      {/* Save Wishlist Button - Placed outside the inner flip box so it remains visible and clickable on both sides */}
      {(!user || user.role === 'student') && (
        <button
          className={`save-btn position-absolute border-0 d-flex align-items-center justify-content-center ${isSaved ? 'saved' : ''}`}
          onClick={handleSave}
          title={isSaved ? "Remove from Saved" : "Save PG"}
          style={{ zIndex: 15 }}
        >
          <i className={`bi ${isSaved ? 'bi-heart-fill' : 'bi-heart'}`}></i>
        </button>
      )}

      <div className="pg-card-flip-inner">
        
        {/* FRONT FACE (Name, PG Type/Gender Badge, Price, and Book Now button) */}
        <div className="pg-card-front">

          {/* Large PG Image */}
          <div className="pg-img-container">
            {pg.images && pg.images.length > 0 ? (
              <img src={pg.images[0]} alt={pg.name} className="pg-card-img" />
            ) : (
              <div className="pg-card-placeholder d-flex align-items-center justify-content-center flex-column text-muted">
                <span className="fs-3">🏠</span>
                <span className="small">No Image Available</span>
              </div>
            )}
            <div className="gender-badge-container position-absolute bottom-0 start-0 m-3">
              {pg.gender === 'boys' && <span className="badge-premium-boys text-uppercase">Boys Only</span>}
              {pg.gender === 'girls' && <span className="badge-premium-girls text-uppercase">Girls Only</span>}
              {pg.gender === 'unisex' && <span className="badge-premium-unisex text-uppercase">Unisex PG</span>}
            </div>
          </div>

          {/* PG Details (Front Face) */}
          <div className="pg-card-body p-3 d-flex flex-column justify-content-between">
            <div>
              <div className="d-flex justify-content-between align-items-start mb-2">
                <h5 className="pg-card-title mb-0 text-truncate font-display fw-bold" style={{ maxWidth: '85%' }}>{pg.name}</h5>
                {pg.ratingsAverage > 0 && (
                  <span className="rating-badge d-flex align-items-center gap-1 small">
                    <i className="bi bi-star-fill text-warning"></i>
                    {pg.ratingsAverage}
                  </span>
                )}
              </div>
            </div>

            <div>
              <hr className="my-2 opacity-10" />
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <span className="text-muted small" style={{ fontSize: '0.7rem' }}>Starts from</span>
                  <h5 className="price-tag mb-0">
                    ₹{getMinPrice()}<span className="small text-muted fs-6 fw-normal">/mo</span>
                  </h5>
                </div>
                <Link to={`/pgs/${pg._id}`} className="btn btn-premium-primary py-2 px-3 fs-6">
                  Book Now
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* BACK FACE (Hover Details: sharing types, location, description, facilities list) */}
        <div className="pg-card-back">
          <div>
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h6 className="font-display fw-bold mb-0 text-truncate text-uppercase text-accent text-start" style={{ fontSize: '0.95rem', letterSpacing: '0.05em', maxWidth: '70%' }}>
                {pg.name}
              </h6>
              <div className="d-flex gap-2">
                {pg.gender === 'boys' && <span className="badge-premium-boys text-uppercase py-0.5 px-2" style={{ fontSize: '0.65rem' }}>Boys</span>}
                {pg.gender === 'girls' && <span className="badge-premium-girls text-uppercase py-0.5 px-2" style={{ fontSize: '0.65rem' }}>Girls</span>}
                {pg.gender === 'unisex' && <span className="badge-premium-unisex text-uppercase py-0.5 px-2" style={{ fontSize: '0.65rem' }}>Unisex</span>}
              </div>
            </div>

            {/* Room Sharing Type Details */}
            <div className="text-muted small mb-2 d-flex align-items-center gap-1 font-display fw-semibold text-start">
              <i className="bi bi-door-open text-accent me-1"></i>
              <span>Rooms: {getSharingTypes()}</span>
            </div>

            {/* Location Landmark & City details */}
            <p className="pg-card-location small mb-2 text-truncate text-muted text-start">
              <i className="bi bi-geo-alt me-1 text-accent"></i>
              {pg.location.landmark ? `${pg.location.landmark}, ` : ''}{pg.location.city}
            </p>

            {/* Description overview */}
            <div className="mb-3 text-start">
              <span className="small fw-bold text-accent font-display d-block mb-1">Overview</span>
              <p className="text-muted small" style={{ lineHeight: '1.5', fontSize: '0.8rem', maxHeight: '80px', overflowY: 'auto' }}>
                {pg.description}
              </p>
            </div>

            {/* Key facilities badges */}
            {pg.facilities && pg.facilities.length > 0 && (
              <div className="text-start">
                <span className="small fw-bold text-accent font-display d-block mb-1.5">Facilities</span>
                <div className="d-flex flex-wrap gap-1">
                  {pg.facilities.slice(0, 3).map((f, i) => (
                    <span key={i} className="badge bg-light text-dark border px-2 py-1" style={{ fontSize: '0.65rem', textTransform: 'capitalize' }}>
                      <i className={`bi ${getFacilityIcon(f)} me-1 text-primary`}></i>
                      {f}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div>
            <hr className="my-2 opacity-10" />
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <span className="text-muted small" style={{ fontSize: '0.7rem' }}>Starts from</span>
                <h5 className="price-tag mb-0">
                  ₹{getMinPrice()}<span className="small text-muted fs-6 fw-normal">/mo</span>
                </h5>
              </div>
              <Link to={`/pgs/${pg._id}`} className="btn btn-premium-primary py-2 px-3 fs-6">
                Book Now
              </Link>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Card;
