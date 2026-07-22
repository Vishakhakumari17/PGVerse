import React, { useState, useContext } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import Loader from '../../components/Loader/Loader';
import api from '../../services/api';
import './Payment.css';

const Payment = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, showToast } = useContext(AuthContext);

  // If accessed directly without state, redirect to home
  const bookingDetails = location.state;
  if (!bookingDetails) {
    return (
      <div className="container py-5 text-center page-container">
        <h4 className="font-display">No active booking session found</h4>
        <Link to="/" className="btn btn-premium-primary mt-3">Go Home</Link>
      </div>
    );
  }

  const { pgId, pgName, roomType, bookingDate, duration, advancePaymentAmount, totalCost, sharing } = bookingDetails;

  const [paymentMethod, setPaymentMethod] = useState('card'); // 'card' or 'upi'
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [upiId, setUpiId] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [createdBooking, setCreatedBooking] = useState(null);
  const [showReceipt, setShowReceipt] = useState(false);
  const [qrFrame, setQrFrame] = useState('Standard Border');
  const [qrTheme, setQrTheme] = useState('Classic Black & White');
  const [qrLogo, setQrLogo] = useState('PGVerse Icon');

  const getQrColor = () => {
    if (qrTheme === 'Brown & Gold Theme') return '5C4033';
    if (qrTheme === 'Deep Slate Theme') return '2D2A26';
    return '000000';
  };

  const handlePay = async (e) => {
    e.preventDefault();
    setError('');

    if (paymentMethod === 'upi') {
      const upiRegex = /^[\w.\-_]+@[a-zA-Z0-9.\-_]+$/;
      if (!upiRegex.test(upiId)) {
        showToast('Please enter a valid UPI ID (e.g. name@upi)', 'error');
        setError('Please enter a valid UPI ID (e.g. name@upi)');
        return;
      }
    }

    setLoading(true);

    try {
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 2000));

      const transactionId = `TXN-${Math.floor(10000000 + Math.random() * 90000000)}`;

      const res = await api.post('/bookings', {
        pgId,
        roomType,
        bookingDate,
        duration,
        advancePaymentAmount,
        transactionId
      });

      setCreatedBooking(res.data);
      setSuccess(true);
    } catch (err) {
      setError(err.message || 'Payment processing failed');
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (success && createdBooking) {
    return (
      <div className="container py-5 page-container success-payment-view text-center">
        {/* Confetti & Checkmark Screen (1st Image Design) */}
        <div className="success-card-wrapper animate-fade-in mb-4">
          <div className="confetti-container">
            <div className="confetti-piece"></div>
            <div className="confetti-piece"></div>
            <div className="confetti-piece"></div>
            <div className="confetti-piece"></div>
            <div className="confetti-piece"></div>
            <div className="confetti-piece"></div>
            <div className="confetti-piece"></div>
            <div className="confetti-piece"></div>
          </div>

          <div className="success-checkmark-circle">
            <i className="bi bi-check-lg"></i>
          </div>

          <h2 className="success-title">Payment succeeded!</h2>
          <p className="success-subtitle">
            Your transaction was completed successfully. Thank you for booking your stay with PGVerse!
          </p>

          <div className="d-flex flex-column gap-2 align-items-center">
            <button className="btn-success-dashboard border-0" onClick={() => navigate('/dashboard')}>
              Go to Your Dashboard
            </button>
            
            <button 
              className="btn-toggle-receipt print-hide" 
              onClick={() => setShowReceipt(!showReceipt)}
            >
              <i className={`bi ${showReceipt ? 'bi-eye-slash' : 'bi-receipt'} me-2`}></i>
              {showReceipt ? 'Hide Receipt' : 'View / Print Booking Receipt'}
            </button>
          </div>
        </div>

        {/* Printable Receipt (collapsible) */}
        {showReceipt && (
          <div className="row justify-content-center mt-4">
            <div className="col-md-7">
              <div className="premium-card p-5 text-start receipt-container border" id="printable-receipt" style={{ background: '#FFFFFF', color: '#2D2A26' }}>
                <div className="text-center mb-4 receipt-header">
                  <span className="fs-1 d-block mb-2">✅</span>
                  <h3 className="font-display text-success">Booking Confirmed!</h3>
                  <p className="text-muted small">Thank you for booking with PGVerse. Here is your receipt.</p>
                </div>

                <div className="d-flex justify-content-between border-bottom pb-3 mb-4">
                  <div>
                    <h6 className="font-display mb-1 text-dark">PGVerse Pvt Ltd.</h6>
                    <p className="text-muted small mb-0">Mumbai, Maharashtra, India</p>
                  </div>
                  <div className="text-end">
                    <h6 className="font-display text-uppercase mb-1" style={{ color: 'var(--accent)' }}>Receipt</h6>
                    <p className="small mb-0 font-monospace text-muted">{createdBooking.receiptNumber}</p>
                  </div>
                </div>

                <div className="row g-3 small mb-4">
                  <div className="col-6">
                    <span className="text-muted text-uppercase d-block fs-8">Billed To</span>
                    <span className="fw-semibold text-dark">{user.name}</span>
                    <span className="text-muted d-block">{user.email}</span>
                  </div>
                  <div className="col-6 text-end">
                    <span className="text-muted text-uppercase d-block fs-8">Property Details</span>
                    <span className="fw-semibold text-dark">{pgName}</span>
                    <span className="text-muted d-block">{roomType} ({sharing} Sharing)</span>
                  </div>
                </div>

                <table className="table table-borderless table-sm small border-bottom mb-4">
                  <thead>
                    <tr className="table-light">
                      <th className="text-dark">Description</th>
                      <th className="text-end text-dark">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="text-dark">Security Deposit (Refundable)</td>
                      <td className="text-end text-dark">₹{advancePaymentAmount}</td>
                    </tr>
                    <tr>
                      <td className="text-dark">Advance Stay Booking fee</td>
                      <td className="text-end text-dark">₹{advancePaymentAmount}</td>
                    </tr>
                    <tr className="border-top fw-bold text-dark fs-6">
                      <td>Total Paid Advance</td>
                      <td className="text-end">₹{advancePaymentAmount}</td>
                    </tr>
                  </tbody>
                </table>

                <div className="bg-light p-3 rounded small mb-4 font-monospace border text-dark">
                  <div className="d-flex justify-content-between">
                    <span>Start Date:</span>
                    <span>{new Date(bookingDate).toLocaleDateString()}</span>
                  </div>
                  <div className="d-flex justify-content-between">
                    <span>Stay Duration:</span>
                    <span>{duration} Months</span>
                  </div>
                  <div className="d-flex justify-content-between">
                    <span>Transaction ID:</span>
                    <span>{createdBooking.transactionId}</span>
                  </div>
                  <div className="d-flex justify-content-between">
                    <span>Booking Status:</span>
                    <span className="text-warning fw-bold text-uppercase">Pending Owner Approval</span>
                  </div>
                </div>

                <p className="text-muted fs-8 text-center mb-0">
                  This is a computer-generated booking receipt and does not require signatures.
                </p>

                {/* Receipt buttons inside the container */}
                <div className="d-flex gap-3 mt-4 justify-content-center print-hide">
                  <button className="btn btn-premium-secondary py-2.5 px-4" onClick={handlePrint}>
                    <i className="bi bi-printer me-2"></i> Print / Download
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="container py-4 page-container">
      {loading && <Loader fullPage={true} />}

      <div className="row g-4 justify-content-center text-start">
        <div className="col-lg-7">
          <div className="premium-card p-5">
            <h2 className="font-display mb-4">Payment Checkout</h2>

            {error && <div className="alert alert-danger py-2 small">{error}</div>}

            <form onSubmit={handlePay}>
              {/* Payment Summary Box */}
              <div className="p-3 bg-light rounded border mb-4">
                <div className="d-flex justify-content-between font-display text-dark small mb-1">
                  <span>Paying to:</span>
                  <span className="fw-bold">{pgName}</span>
                </div>
                <div className="d-flex justify-content-between font-display text-dark small mb-1">
                  <span>Room Selection:</span>
                  <span className="fw-semibold">{roomType}</span>
                </div>
                <div className="d-flex justify-content-between font-display text-primary fw-bold fs-5 mt-2 pt-2 border-top">
                  <span>Pay Advance Fee:</span>
                  <span>₹{advancePaymentAmount}</span>
                </div>
              </div>

              {/* Payment Method Switcher */}
              <h5 className="font-display mb-3">Choose Payment Method</h5>
              <div className="d-flex gap-3 mb-4">
                <button
                  type="button"
                  className={`btn flex-grow-1 py-3 border d-flex align-items-center justify-content-center gap-2 ${paymentMethod === 'card' ? 'active-method border-primary text-primary' : 'bg-white'}`}
                  onClick={() => setPaymentMethod('card')}
                >
                  <i className="bi bi-credit-card fs-4"></i>
                  <span className="font-display fw-bold">Card</span>
                </button>
                <button
                  type="button"
                  className={`btn flex-grow-1 py-3 border d-flex align-items-center justify-content-center gap-2 ${paymentMethod === 'upi' ? 'active-method border-primary text-primary' : 'bg-white'}`}
                  onClick={() => setPaymentMethod('upi')}
                >
                  <i className="bi bi-phone-vibrate fs-4"></i>
                  <span className="font-display fw-bold">UPI / QR</span>
                </button>
              </div>

              {paymentMethod === 'card' ? (
                <div className="card-payment-form">
                  <div className="mb-3">
                    <label className="form-label small text-muted font-display">Cardholder Name</label>
                    <input type="text" className="form-control custom-input" placeholder="e.g. John Doe" required />
                  </div>
                  <div className="mb-3">
                    <label className="form-label small text-muted font-display">Card Number</label>
                    <input
                      type="text"
                      className="form-control custom-input"
                      placeholder="1234 5678 1234 5678"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                      maxLength={16}
                      required
                    />
                  </div>
                  <div className="row g-3 mb-4">
                    <div className="col-6">
                      <label className="form-label small text-muted font-display">Expiry Date</label>
                      <input
                        type="text"
                        className="form-control custom-input"
                        placeholder="MM/YY"
                        value={cardExpiry}
                        onChange={(e) => setCardExpiry(e.target.value)}
                        maxLength={5}
                        required
                      />
                    </div>
                    <div className="col-6">
                      <label className="form-label small text-muted font-display">CVV</label>
                      <input
                        type="password"
                        className="form-control custom-input"
                        placeholder="•••"
                        value={cardCvv}
                        onChange={(e) => setCardCvv(e.target.value)}
                        maxLength={3}
                        required
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="upi-dual-panel">
                  {/* Left form panel (Cream background) */}
                  <div className="upi-left-form text-start">
                    <h5 className="font-display mb-3">UPI / QR Checkout</h5>
                    
                    <div className="mb-3">
                      <label className="form-label small text-muted font-display">Email Address</label>
                      <input 
                        type="email" 
                        className="form-control custom-input" 
                        placeholder="yourname@domain.com" 
                        defaultValue={user?.email} 
                        readOnly 
                      />
                    </div>
                    
                    <div className="mb-3">
                      <label className="form-label small text-muted font-display">Enter Subject / Note</label>
                      <input 
                        type="text" 
                        className="form-control custom-input" 
                        placeholder="Booking Advance Stay fee" 
                        defaultValue={`Stay deposit for ${pgName}`}
                        readOnly
                      />
                    </div>

                    <div className="mb-3">
                      <label className="form-label small text-muted font-display">UPI ID (e.g. name@upi)</label>
                      <input
                        type="text"
                        className="form-control custom-input"
                        placeholder="john@okaxis"
                        value={upiId}
                        onChange={(e) => setUpiId(e.target.value)}
                        required={paymentMethod === 'upi'}
                      />
                      <small className="text-muted mt-1 d-block" style={{ fontSize: '0.75rem' }}>
                        QR code updates dynamically as you type your UPI ID.
                      </small>
                    </div>
                  </div>

                  {/* Right QR Display Panel (Dark Brown background) */}
                  <div className="upi-right-qr">
                    <div className={`qr-box-container ${qrFrame === 'Glassmorphic Frame' ? 'frame-glass' : qrFrame === 'Minimalist Frame' ? 'frame-minimal' : 'frame-standard'}`}>
                      <div className="position-relative" style={{ width: '130px', height: '130px' }}>
                        <img 
                          src={`https://api.qrserver.com/v1/create-qr-code/?size=130x130&color=${getQrColor()}&data=${encodeURIComponent(
                            upiId ? `upi://pay?pa=${upiId}&pn=PGVerse&am=${advancePaymentAmount}&cu=INR` : `upi://pay?pa=pgverse@pay&pn=PGVerse&am=${advancePaymentAmount}&cu=INR`
                          )}`} 
                          alt="UPI Payment QR Code"
                          title="Scan to pay via UPI"
                          style={{ width: '130px', height: '130px', display: 'block' }}
                        />
                        {qrLogo === 'PGVerse Icon' && (
                          <div className="qr-center-logo position-absolute start-50 top-50 translate-middle d-flex align-items-center justify-content-center bg-white rounded-circle shadow-sm border border-warning" style={{ width: '26px', height: '26px', zIndex: 10 }}>
                            <span style={{ fontSize: '0.7rem', lineHeight: '1' }}>🏠</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <button type="submit" className="btn btn-premium-primary w-100 py-3 font-display">
                Confirm & Pay ₹{advancePaymentAmount}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Payment;
