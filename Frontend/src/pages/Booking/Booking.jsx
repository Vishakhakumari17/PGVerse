import React, { useState, useEffect, useContext } from 'react';
import { useParams, useSearchParams, useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import Loader from '../../components/Loader/Loader';
import api from '../../services/api';
import './Booking.css';

const Booking = () => {
  const { pgId } = useParams();
  const [searchParams] = useSearchParams();
  const { user, showToast } = useContext(AuthContext);
  const navigate = useNavigate();

  const initialRoomType = searchParams.get('roomType') || '';

  const [pg, setPg] = useState(null);
  const [loading, setLoading] = useState(true);
  const [roomType, setRoomType] = useState(initialRoomType);
  const [bookingDate, setBookingDate] = useState('');
  const [duration, setDuration] = useState(3); // default 3 months

  useEffect(() => {
    const fetchPG = async () => {
      try {
        const res = await api.get(`/pgs/${pgId}`);
        setPg(res.data);
        // If roomType is not set, set it to the first available room type
        if (!initialRoomType && res.data.rooms && res.data.rooms.length > 0) {
          setRoomType(res.data.rooms[0].roomType);
        }
      } catch (err) {
        console.error('Error fetching PG for booking:', err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchPG();
  }, [pgId, initialRoomType]);

  const getSelectedRoom = () => {
    if (!pg || !pg.rooms) return null;
    return pg.rooms.find(r => r.roomType === roomType);
  };

  const selectedRoomObj = getSelectedRoom();
  const roomPrice = selectedRoomObj ? selectedRoomObj.price : 0;
  const securityDeposit = roomPrice; // 1 month rent as security deposit
  const advancePaymentAmount = roomPrice; // 1 month rent advance
  const totalCost = roomPrice * duration + securityDeposit;

  const handleProceedToPayment = (e) => {
    e.preventDefault();
    if (!bookingDate) {
      showToast('Please choose a valid booking start date', 'error');
      return;
    }
    
    // Pass booking details to payment page using router state
    navigate('/payment', {
      state: {
        pgId,
        pgName: pg.name,
        roomType,
        bookingDate,
        duration,
        advancePaymentAmount,
        totalCost,
        sharing: selectedRoomObj ? selectedRoomObj.sharing : 1
      }
    });
  };

  if (loading) return <Loader fullPage={true} />;
  if (!pg) {
    return (
      <div className="container py-5 text-center page-container">
        <h4 className="font-display">PG Listing Not Found</h4>
        <Link to="/search" className="btn btn-premium-primary mt-3">Back to Search</Link>
      </div>
    );
  }

  return (
    <div className="container py-4 page-container">
      <div className="row g-4 justify-content-center">
        <div className="col-lg-8">
          <div className="premium-card p-5 text-start">
            <h2 className="font-display mb-4">Book Your Room</h2>

            <div className="alert alert-info py-2 small mb-4">
              ✨ Complete booking in two steps: Choose room requirements and proceed to mock payment checkout.
            </div>

            <form onSubmit={handleProceedToPayment}>
              {/* PG Info */}
              <div className="pg-summary-box p-3 rounded mb-4 bg-light d-flex align-items-center justify-content-between">
                <div>
                  <h5 className="mb-1 font-display">{pg.name}</h5>
                  <p className="text-muted small mb-0"><i className="bi bi-geo-alt me-1"></i> {pg.location.city}, {pg.location.state}</p>
                </div>
                <span className="badge bg-primary text-uppercase px-2.5 py-1.5">{pg.gender} PG</span>
              </div>

              {/* Room Type Selector */}
              <div className="mb-3">
                <label className="form-label font-display small text-muted">Select Room Package</label>
                <select
                  className="form-select custom-input"
                  value={roomType}
                  onChange={(e) => setRoomType(e.target.value)}
                  required
                >
                  {pg.rooms && pg.rooms.map((room) => (
                    <option key={room._id} value={room.roomType} disabled={room.availability <= 0}>
                      {room.roomType} ({room.sharing} Sharing) - ₹{room.price}/month {room.availability <= 0 ? '(Sold Out)' : ''}
                    </option>
                  ))}
                </select>
              </div>

              {/* Date Input */}
              <div className="mb-3">
                <label className="form-label font-display small text-muted">Booking Start Date</label>
                <input
                  type="date"
                  className="form-control custom-input"
                  min={new Date().toISOString().split('T')[0]}
                  value={bookingDate}
                  onChange={(e) => setBookingDate(e.target.value)}
                  required
                />
              </div>

              {/* Duration selector */}
              <div className="mb-4">
                <label className="form-label font-display small text-muted">Duration of Stay (Months)</label>
                <select
                  className="form-select custom-input"
                  value={duration}
                  onChange={(e) => setDuration(Number(e.target.value))}
                >
                  {[1, 2, 3, 6, 9, 12].map(m => (
                    <option key={m} value={m}>{m} Month{m > 1 ? 's' : ''}</option>
                  ))}
                </select>
              </div>

              <hr className="my-4 opacity-10" />

              {/* Price Breakdown */}
              <h5 className="font-display mb-3">Cost Breakdown</h5>
              <div className="cost-breakdown-box p-3 bg-light rounded d-flex flex-column gap-2 mb-4">
                <div className="d-flex justify-content-between small">
                  <span className="text-muted">Monthly Rent ({roomType})</span>
                  <span className="fw-semibold">₹{roomPrice} / month</span>
                </div>
                <div className="d-flex justify-content-between small">
                  <span className="text-muted">Stay rent (₹{roomPrice} x {duration} months)</span>
                  <span className="fw-semibold">₹{roomPrice * duration}</span>
                </div>
                <div className="d-flex justify-content-between small border-bottom pb-2">
                  <span className="text-muted">Refundable Security Deposit (1 Month)</span>
                  <span className="fw-semibold">₹{securityDeposit}</span>
                </div>
                <div className="d-flex justify-content-between font-display fw-bold text-dark fs-5 mt-1 border-bottom pb-2">
                  <span>Total Amount</span>
                  <span>₹{totalCost}</span>
                </div>
                <div className="d-flex justify-content-between font-display fw-bold text-primary mt-1">
                  <span>Advance Payment (To book)</span>
                  <span>₹{advancePaymentAmount}</span>
                </div>
                <small className="text-muted text-start mt-2">
                  *The remaining amount (₹{totalCost - advancePaymentAmount}) is payable directly to the owner at checkout.
                </small>
              </div>

              <button type="submit" className="btn btn-premium-primary w-100 py-3 font-display">
                Proceed to Payment (₹{advancePaymentAmount})
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Booking;
