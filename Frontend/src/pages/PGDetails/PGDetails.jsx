import React, { useState, useEffect, useContext } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import Loader from '../../components/Loader/Loader';
import api from '../../services/api';
import './PGDetails.css';

const PGDetails = () => {
  const { id } = useParams();
  const { user, showToast } = useContext(AuthContext);
  const navigate = useNavigate();

  const [pg, setPg] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Review inputs
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [reviewMsg, setReviewMsg] = useState('');
  const [reviewErr, setReviewErr] = useState('');

  const [contactStatus, setContactStatus] = useState('none');
  const [contactLoading, setContactLoading] = useState(false);
  const [activeImage, setActiveImage] = useState('');
  const [showLightbox, setShowLightbox] = useState(false);

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const res = await api.get(`/pgs/${id}`);
        setPg(res.data);
        setReviews(res.reviews || []);
        if (res.data.images && res.data.images.length > 0) {
          setActiveImage(res.data.images[0]);
        }
      } catch (err) {
        console.error('Error fetching PG details:', err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchDetails();
  }, [id]);

  useEffect(() => {
    const checkContactRequest = async () => {
      if (user) {
        if (user.role === 'owner' || user.role === 'admin') {
          setContactStatus('approved');
          return;
        }
        setContactLoading(true);
        try {
          const res = await api.get(`/admin/contact-requests/check/${id}`);
          if (res.exists) {
            setContactStatus(res.status);
          } else {
            setContactStatus('none');
          }
        } catch (err) {
          console.error('Failed to check contact request status:', err.message);
        } finally {
          setContactLoading(false);
        }
      }
    };
    checkContactRequest();
  }, [id, user]);

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    setReviewMsg('');
    setReviewErr('');

    if (!user) {
      setReviewErr('Please login to submit a review');
      return;
    }

    try {
      const res = await api.post(`/pgs/${id}/reviews`, { rating, comment });
      setReviewMsg('Review added successfully!');
      
      // Update reviews local state
      const newReviewObj = {
        ...res.data,
        user: {
          name: user.name,
          profilePicture: user.profilePicture
        }
      };
      setReviews(prev => [newReviewObj, ...prev]);
      
      // Reset inputs
      setComment('');
      setRating(5);
    } catch (err) {
      setReviewErr(err.message || 'Failed to submit review');
    }
  };

  const handleRequestContact = async () => {
    if (!user) {
      navigate(`/login?redirect=/pgs/${id}`);
      return;
    }
    setContactLoading(true);
    try {
      const res = await api.post('/admin/contact-requests', { pgId: id });
      setContactStatus(res.data.status);
      showToast('Contact details requested! Match notification sent directly to the Owner.', 'success');
    } catch (err) {
      showToast(err.message || 'Failed to submit contact request', 'error');
    } finally {
      setContactLoading(false);
    }
  };

  const handleBookRedirect = (roomType) => {
    if (!user) {
      showToast('Please login to book or to continue further process.', 'error');
      navigate(`/login?redirect=/pgs/${id}`);
    } else if (user.role !== 'student') {
      showToast('Only registered students can book PG accommodations.', 'error');
    } else {
      navigate(`/booking/${id}?roomType=${encodeURIComponent(roomType)}`);
    }
  };

  if (loading) return <Loader fullPage={true} />;
  if (!pg) {
    return (
      <div className="container py-5 text-center page-container">
        <h3 className="font-display">Accommodation Not Found</h3>
        <p className="text-muted">The requested listing might have been removed or is pending approval.</p>
        <Link to="/search" className="btn btn-premium-primary mt-3">Back to Search</Link>
      </div>
    );
  }

  return (
    <div className="container py-4 page-container">
      <nav aria-label="breadcrumb" className="mb-4">
        <ol className="breadcrumb">
          <li className="breadcrumb-item"><Link to="/" className="text-primary text-decoration-none">Home</Link></li>
          <li className="breadcrumb-item"><Link to="/search" className="text-primary text-decoration-none">Search</Link></li>
          <li className="breadcrumb-item active" aria-current="page">{pg.name}</li>
        </ol>
      </nav>

      {/* Image Gallery */}
      <div className="row g-4 mb-4">
        {pg.images && pg.images.length > 0 ? (
          pg.images.length === 1 ? (
            <div className="col-12">
              <div className="pg-main-image-wrapper premium-card overflow-hidden cursor-pointer" style={{ height: '400px' }} onClick={() => setShowLightbox(true)}>
                <img src={pg.images[0]} alt={pg.name} className="pg-main-img w-100 h-100" style={{ objectFit: 'cover' }} />
                <div className="image-overlay-zoom d-flex align-items-center justify-content-center">
                  <i className="bi bi-zoom-in text-white fs-3"></i>
                </div>
              </div>
            </div>
          ) : (
            <>
              {/* Active Main Image */}
              <div className="col-md-8">
                <div className="pg-main-image-wrapper premium-card overflow-hidden cursor-pointer position-relative" style={{ height: '400px' }} onClick={() => setShowLightbox(true)}>
                  <img src={activeImage || pg.images[0]} alt={pg.name} className="pg-main-img w-100 h-100" style={{ objectFit: 'cover', transition: 'all 0.3s ease' }} />
                  <div className="image-overlay-zoom position-absolute w-100 h-100 top-0 start-0 d-flex align-items-center justify-content-center" style={{ background: 'rgba(0,0,0,0.2)', opacity: 0, transition: 'opacity 0.2s' }}>
                    <i className="bi bi-zoom-in text-white fs-3"></i>
                  </div>
                </div>
              </div>

              {/* Side Thumbnails Column */}
              <div className="col-md-4">
                <div className="d-flex flex-column gap-2 overflow-auto" style={{ maxHeight: '400px', paddingRight: '4px' }}>
                  {pg.images.map((img, index) => (
                    <div
                      key={index}
                      className={`pg-thumbnail-wrapper premium-card overflow-hidden cursor-pointer flex-shrink-0 ${activeImage === img ? 'border-primary border-3' : ''}`}
                      style={{ height: '128px', transition: 'all 0.2s', opacity: activeImage === img ? 1 : 0.7 }}
                      onClick={() => setActiveImage(img)}
                    >
                      <img src={img} alt={`${pg.name}-thumb-${index}`} className="w-100 h-100" style={{ objectFit: 'cover' }} />
                    </div>
                  ))}
                </div>
              </div>
            </>
          )
        ) : (
          <div className="col-12">
            <div className="pg-main-image-wrapper premium-card overflow-hidden bg-light d-flex align-items-center justify-content-center flex-column text-muted" style={{ height: '300px' }}>
              <span className="fs-1">🏠</span>
              <h5 className="font-display mt-2">No Images Uploaded</h5>
            </div>
          </div>
        )}
      </div>

      <div className="row g-4">
        {/* Main Details */}
        <div className="col-lg-8">
          <div className="premium-card p-4 mb-4">
            <div className="d-flex justify-content-between align-items-start mb-3">
              <div>
                <h2 className="pg-title font-display mb-1">{pg.name}</h2>
                <p className="pg-address text-muted mb-2">
                  <i className="bi bi-geo-alt me-1 text-primary"></i>
                  {pg.location.address}, {pg.location.city}, {pg.location.state}
                </p>
              </div>
              <div className="d-flex flex-column align-items-end gap-1">
                {pg.gender === 'boys' && <span className="badge-premium-boys text-uppercase fs-7">Boys Only</span>}
                {pg.gender === 'girls' && <span className="badge-premium-girls text-uppercase fs-7">Girls Only</span>}
                {pg.gender === 'unisex' && <span className="badge-premium-unisex text-uppercase fs-7">Unisex</span>}
                {pg.ratingsAverage > 0 && (
                  <span className="rating-badge-large mt-2 d-flex align-items-center gap-1">
                    <i className="bi bi-star-fill text-warning"></i>
                    {pg.ratingsAverage} <span className="text-muted fw-normal">({pg.ratingsCount} reviews)</span>
                  </span>
                )}
              </div>
            </div>

            <h5 className="font-display mt-4 mb-2">Description</h5>
            <p className="description-text mb-4">{pg.description}</p>

            <h5 className="font-display mb-3">Facilities Included</h5>
            <div className="row g-2 mb-4">
              {pg.facilities && pg.facilities.length > 0 ? (
                pg.facilities.map((fac, i) => (
                  <div key={i} className="col-md-4 col-6">
                    <div className="facility-item p-2 d-flex align-items-center gap-2 rounded border">
                      <span className="facility-icon">⚡</span>
                      <span className="small text-muted">{fac}</span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-muted small">Standard clean room facility.</p>
              )}
            </div>

            <h5 className="font-display mb-3">Nearby Colleges & Tech Parks</h5>
            <div className="d-flex flex-wrap gap-2 mb-2">
              {pg.nearbyColleges && pg.nearbyColleges.length > 0 ? (
                pg.nearbyColleges.map((col, i) => (
                  <span key={i} className="badge-premium-location text-capitalize small">
                    🏫 {col}
                  </span>
                ))
              ) : (
                <span className="text-muted small">Information not available</span>
              )}
            </div>
          </div>

          {/* Rooms Availability Table */}
          <div className="premium-card p-4 mb-4">
            <h4 className="font-display mb-3">Rooms & Seats</h4>
            <div className="table-responsive">
              <table className="table align-middle">
                <thead>
                  <tr className="table-light">
                    <th>Room No.</th>
                    <th>Room Type</th>
                    <th>Floor</th>
                    <th>Status</th>
                    <th>Sharing</th>
                    <th>Price / Mo</th>
                    <th>Total Seats</th>
                    <th>Availability</th>
                    <th className="text-end">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {pg.rooms && pg.rooms.length > 0 ? (
                    pg.rooms.map((room) => {
                      const getStatusBadgeColor = (status) => {
                        switch (status) {
                          case 'Available': return 'bg-success-light text-success';
                          case 'Occupied': return 'bg-danger-light text-danger';
                          case 'Maintenance': return 'bg-warning-light text-warning';
                          default: return 'bg-secondary-light text-secondary';
                        }
                      };

                      return (
                        <tr key={room._id}>
                          <td><span className="badge bg-light text-dark border font-monospace">Room {room.roomNumber || 'N/A'}</span></td>
                          <td>
                            <h6 className="mb-0 font-display">{room.roomType}</h6>
                            <div className="d-flex flex-wrap gap-1 mt-1">
                              {room.amenities && room.amenities.map((a, j) => (
                                <span key={j} className="badge bg-light text-muted border-0 small fs-9">{a}</span>
                              ))}
                            </div>
                          </td>
                          <td>{room.roomFloor || 'Ground'}</td>
                          <td><span className={`badge ${getStatusBadgeColor(room.roomStatus || 'Available')}`}>{room.roomStatus || 'Available'}</span></td>
                          <td>{room.sharing} Sharing</td>
                          <td className="fw-bold text-primary">₹{room.price}</td>
                          <td>{room.totalSeats || room.availability}</td>
                          <td>
                            {room.availability > 0 && room.roomStatus === 'Available' ? (
                              <span className="badge bg-success-light text-success">{room.availability} available</span>
                            ) : (
                              <span className="badge bg-danger-light text-danger">Sold Out / Occupied</span>
                            )}
                          </td>
                          <td className="text-end">
                            <button
                              className="btn btn-premium-primary py-1.5 px-3 btn-sm"
                              disabled={room.availability <= 0 || room.roomStatus !== 'Available'}
                              onClick={() => handleBookRedirect(room.roomType)}
                            >
                              Book Now
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan="9" className="text-center text-muted">No rooms currently listed.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Google Map Embedding */}
          <div className="premium-card p-4 mb-4">
            <h5 className="font-display mb-3">Location & Directions</h5>
            <div className="map-embed-wrapper rounded overflow-hidden border" style={{ boxShadow: 'var(--card-shadow)' }}>
              <iframe
                src={
                  pg.location.mapCoordinates && pg.location.mapCoordinates.startsWith('http') 
                    ? pg.location.mapCoordinates 
                    : `https://maps.google.com/maps?q=${encodeURIComponent(
                        [pg.location.landmark, pg.location.address, pg.location.city, pg.location.state].filter(Boolean).join(', ') || 'Noida, Uttar Pradesh'
                      )}&t=&z=15&ie=UTF8&iwloc=&output=embed`
                }
                width="100%"
                height="300"
                style={{ border: 0, display: 'block' }}
                allowFullScreen=""
                loading="lazy"
                title="PG Location Map"
              ></iframe>
            </div>
          </div>

          {/* Reviews & Comments */}
          <div className="premium-card p-4">
            <h4 className="font-display mb-4">Student Reviews</h4>

            {/* Write a Review */}
            {user && user.role === 'student' ? (
              <form onSubmit={handleReviewSubmit} className="mb-5 border-bottom pb-4">
                <h6 className="font-display mb-3">Add Your Rating & Review</h6>
                {reviewMsg && <div className="alert alert-success py-2 small">{reviewMsg}</div>}
                {reviewErr && <div className="alert alert-danger py-2 small">{reviewErr}</div>}
                
                <div className="mb-3 d-flex align-items-center gap-2">
                  <span className="small text-muted font-display">Rating:</span>
                  <div className="star-rating-input">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        className="btn-star p-0 border-0 background-none"
                        onClick={() => setRating(star)}
                      >
                        <i className={`bi bi-star${rating >= star ? '-fill text-warning' : ' text-muted'} fs-5`}></i>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="mb-3">
                  <textarea
                    className="form-control custom-input w-100"
                    rows="3"
                    placeholder="Write a comment about your experience in this PG..."
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    required
                  ></textarea>
                </div>

                <button type="submit" className="btn btn-premium-primary py-2 px-4 btn-sm">
                  Submit Review
                </button>
              </form>
            ) : (
              <div className="alert alert-warning py-2.5 small mb-5">
                💡 Only verified students can write reviews. <Link to="/login" className="alert-link">Sign In</Link> to review.
              </div>
            )}

            {/* Reviews List */}
            <div className="d-flex flex-column gap-4">
              {reviews.length === 0 ? (
                <p className="text-muted small text-center my-4">No reviews yet. Be the first to write a review!</p>
              ) : (
                reviews.map((rev) => (
                  <div key={rev._id} className="review-block border-bottom pb-4 text-start">
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <div className="d-flex align-items-center gap-2">
                        <div className="review-avatar rounded-circle d-flex align-items-center justify-content-center text-uppercase font-display">
                          {rev.user?.name?.charAt(0) || 'U'}
                        </div>
                        <div>
                          <h6 className="mb-0 font-display small">{rev.user?.name || 'Anonymous User'}</h6>
                          <small className="text-muted">{new Date(rev.createdAt).toLocaleDateString()}</small>
                        </div>
                      </div>
                      <div className="review-stars">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <i key={star} className={`bi bi-star${rev.rating >= star ? '-fill text-warning' : ''} small`}></i>
                        ))}
                      </div>
                    </div>
                    <p className="small mb-2">{rev.comment}</p>

                    {/* Owner Reply */}
                    {rev.ownerReply && (
                      <div className="owner-reply-box bg-light border-start border-primary border-4 p-3 rounded mt-2">
                        <div className="d-flex align-items-center gap-1 mb-1">
                          <span className="small font-display fw-bold text-primary">Owner Response:</span>
                        </div>
                        <p className="small mb-0 text-muted italic">"{rev.ownerReply}"</p>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Sidebar Info/Owner Panel */}
        <div className="col-lg-4">
          <div className="premium-card p-4 mb-4 text-start position-sticky" style={{ top: '90px' }}>
            <h5 className="font-display mb-3">Owner Contact details</h5>
            
            {contactLoading ? (
              <Loader />
            ) : !user ? (
              <div className="text-center py-3">
                <i className="bi bi-lock fs-2 text-muted mb-2 d-block"></i>
                <p className="small text-muted mb-3">Contact details are locked for guest users.</p>
                <Link to={`/login?redirect=/pgs/${pg._id}`} className="btn btn-sm btn-premium-primary w-100">
                  Login to View Contact
                </Link>
              </div>
            ) : contactStatus === 'approved' ? (
              <div className="d-flex flex-column gap-3 animate-fade-in">
                <div className="d-flex align-items-center gap-3">
                  <div className="owner-avatar rounded-circle d-flex align-items-center justify-content-center font-display">
                    {pg.owner?.name?.charAt(0) || 'O'}
                  </div>
                  <div>
                    <h6 className="mb-0 font-display">{pg.owner?.name}</h6>
                    <small className="text-muted">PG Administrator</small>
                  </div>
                </div>
                <hr className="my-2 opacity-10" />
                <div className="d-flex align-items-center gap-2 small">
                  <i className="bi bi-telephone text-primary"></i>
                  <span>{pg.owner?.phone}</span>
                </div>
                <div className="d-flex align-items-center gap-2 small text-truncate">
                  <i className="bi bi-envelope text-primary"></i>
                  <span>{pg.owner?.email}</span>
                </div>
              </div>
            ) : contactStatus === 'pending' ? (
              <div className="text-center py-4 text-warning">
                <i className="bi bi-hourglass-split fs-3 mb-2 d-block"></i>
                <h6 className="font-display mb-1 text-dark">Request Pending</h6>
                <p className="fs-8 text-muted mb-0">Admin will approve your request shortly.</p>
              </div>
            ) : contactStatus === 'rejected' ? (
              <div className="text-center py-4 text-danger">
                <i className="bi bi-x-circle fs-3 mb-2 d-block"></i>
                <h6 className="font-display mb-1 text-dark">Request Rejected</h6>
                <p className="fs-8 text-muted mb-0">Your request was rejected by the Administrator.</p>
              </div>
            ) : (
              <div className="text-center py-3">
                <i className="bi bi-shield-lock fs-3 text-muted mb-2 d-block"></i>
                <p className="small text-muted mb-3">Please request approval to view the owner's contact information.</p>
                <button className="btn btn-sm btn-premium-primary w-100" onClick={handleRequestContact}>
                  Request Contact Details
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Lightbox Modal */}
      {showLightbox && (
        <div className="lightbox-backdrop d-flex align-items-center justify-content-center animate-fade-in" onClick={() => setShowLightbox(false)}>
          <button className="btn btn-close-lightbox position-absolute top-0 end-0 m-4 border-0 bg-transparent text-white" onClick={() => setShowLightbox(false)}>
            <i className="bi bi-x-lg fs-3"></i>
          </button>
          <div className="lightbox-content text-center" onClick={(e) => e.stopPropagation()}>
            <img src={activeImage || pg.images[0]} alt="Full Screen Preview" className="lightbox-img img-fluid rounded shadow-lg" style={{ maxHeight: '75vh', maxWidth: '85vw', objectFit: 'contain' }} />
            {pg.images.length > 1 && (
              <div className="lightbox-thumbnails d-flex justify-content-center gap-2 mt-3 overflow-auto py-2">
                {pg.images.map((img, idx) => (
                  <img
                    key={idx}
                    src={img}
                    alt="thumb"
                    className={`lightbox-thumb rounded cursor-pointer ${activeImage === img ? 'border border-2 border-white' : ''}`}
                    style={{ width: '64px', height: '44px', objectFit: 'cover', opacity: activeImage === img ? 1 : 0.6, transition: 'all 0.2s' }}
                    onClick={() => setActiveImage(img)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default PGDetails;
