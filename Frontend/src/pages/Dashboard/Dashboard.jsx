import React, { useState, useEffect, useContext } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import Card from '../../components/Card/Card';
import Loader from '../../components/Loader/Loader';
import api from '../../services/api';
import './Dashboard.css';

const Dashboard = () => {
  const { user, updateProfile, showToast } = useContext(AuthContext);
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'bookings';

  const [bookings, setBookings] = useState([]);
  const [savedPGsings, setSavedPGsings] = useState([]);
  const [complaints, setComplaints] = useState([]);
  const [contactRequests, setContactRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  // Profile Form States
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [profilePicture, setProfilePicture] = useState(user?.profilePicture || '');
  
  const [profileMsg, setProfileMsg] = useState('');
  const [profileErr, setProfileErr] = useState('');
  const [profileLoading, setProfileLoading] = useState(false);

  // Settings Change Password State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Raise Complaint Form States
  const [complaintPgId, setComplaintPgId] = useState('');
  const [complaintSubject, setComplaintSubject] = useState('');
  const [complaintDesc, setComplaintDesc] = useState('');
  const [complaintMsg, setComplaintMsg] = useState('');
  const [complaintErr, setComplaintErr] = useState('');
  const [complaintLoading, setComplaintLoading] = useState(false);

  // Raise Contact Request Form States
  const [contactLocation, setContactLocation] = useState('');
  const [contactBudget, setContactBudget] = useState('');
  const [contactGender, setContactGender] = useState('boys');
  const [contactMsg, setContactMsg] = useState('');
  const [contactErr, setContactErr] = useState('');
  const [contactLoading, setContactLoading] = useState(false);

  // Active Receipt Modal state
  const [receiptBooking, setReceiptBooking] = useState(null);

  // Pay Rent Flow States
  const [payRentBooking, setPayRentBooking] = useState(null);
  const [payRentMonth, setPayRentMonth] = useState('January');
  const [payRentYear, setPayRentYear] = useState(2026);
  const [payRentMethod, setPayRentMethod] = useState('card');
  const [rentCardNumber, setRentCardNumber] = useState('');
  const [rentCardExpiry, setRentCardExpiry] = useState('');
  const [rentCardCvv, setRentCardCvv] = useState('');
  const [rentUpiId, setRentUpiId] = useState('');
  const [rentPaymentSuccess, setRentPaymentSuccess] = useState(false);
  const [payingRent, setPayingRent] = useState(false);

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'bookings') {
        const res = await api.get('/bookings');
        setBookings(res.data);
      } else if (activeTab === 'saved') {
        const res = await api.get('/auth/me');
        setSavedPGsings(res.data.savedPGs || []);
      } else if (activeTab === 'complaints') {
        const resComplaints = await api.get('/admin/complaints');
        setComplaints(resComplaints.data);
        const resBookings = await api.get('/bookings');
        setBookings(resBookings.data);
        if (resBookings.data.length > 0) {
          setComplaintPgId(resBookings.data[0].pg?._id || '');
        }
      } else if (activeTab === 'contacts') {
        const resContacts = await api.get('/admin/contact-requests');
        setContactRequests(resContacts.data);
      }
    } catch (err) {
      console.error('Error fetching dashboard data:', err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setProfileMsg('');
    setProfileErr('');
    setProfileLoading(true);

    try {
      await updateProfile({ name, phone, profilePicture });
      setProfileMsg('Profile updated successfully!');
    } catch (err) {
      setProfileErr(err.message || 'Profile update failed.');
    } finally {
      setProfileLoading(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      showToast('New passwords do not match', 'error');
      return;
    }
    if (newPassword.length < 6) {
      showToast('Password must be at least 6 characters long', 'error');
      return;
    }
    setPasswordLoading(true);
    try {
      await api.put('/auth/change-password', {
        currentPassword,
        newPassword
      });
      showToast('Password updated successfully!', 'success');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      showToast(err.response?.data?.message || err.message || 'Failed to update password', 'error');
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleRaiseComplaint = async (e) => {
    e.preventDefault();
    setComplaintMsg('');
    setComplaintErr('');
    
    if (!complaintPgId) {
      setComplaintErr('Please select a valid PG accommodation');
      return;
    }

    setComplaintLoading(true);
    try {
      const res = await api.post('/admin/complaints', {
        pgId: complaintPgId,
        subject: complaintSubject,
        description: complaintDesc
      });
      setComplaintMsg('Complaint ticket raised successfully! Admin will review it.');
      setComplaints(prev => [res.data, ...prev]);
      setComplaintSubject('');
      setComplaintDesc('');
    } catch (err) {
      setComplaintErr(err.message || 'Failed to submit complaint ticket');
    } finally {
      setComplaintLoading(false);
    }
  };

  const handleRaiseContactRequest = async (e) => {
    e.preventDefault();
    setContactMsg('');
    setContactErr('');
    setContactLoading(true);

    try {
      const res = await api.post('/admin/contact-requests', {
        preferredLocation: contactLocation,
        budget: Number(contactBudget),
        gender: contactGender
      });
      setContactMsg('Contact Request raised successfully! Admin will assign matching owners.');
      setContactRequests(prev => [res.data, ...prev]);
      setContactLocation('');
      setContactBudget('');
    } catch (err) {
      setContactErr(err.message || 'Failed to submit contact request');
    } finally {
      setContactLoading(false);
    }
  };

  const handlePayRentSubmit = async (e) => {
    e.preventDefault();
    if (!payRentBooking) return;
    setPayingRent(true);
    try {
      const payload = {
        studentType: 'online',
        studentId: payRentBooking._id,
        studentName: user.name,
        pgName: payRentBooking.pg?.name || 'N/A',
        roomType: payRentBooking.roomType,
        monthlyFee: payRentBooking.pg?.rooms?.find(r => r.roomType === payRentBooking.roomType)?.price || 0,
        month: payRentMonth,
        year: Number(payRentYear),
        amountPaid: payRentBooking.pg?.rooms?.find(r => r.roomType === payRentBooking.roomType)?.price || 0,
        status: 'Paid'
      };

      await new Promise(resolve => setTimeout(resolve, 1500));

      await api.post('/fee-payments', payload);
      setRentPaymentSuccess(true);
      showToast('Monthly Rent Payment completed successfully!', 'success');
      setTimeout(() => {
        setPayRentBooking(null);
        setRentPaymentSuccess(false);
      }, 2500);
    } catch (err) {
      showToast(err.message || 'Rent payment failed', 'error');
    } finally {
      setPayingRent(false);
    }
  };

  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) return;

    try {
      await api.put(`/bookings/${bookingId}/status`, { status: 'cancelled' });
      setBookings(prev =>
        prev.map(b => (b._id === bookingId ? { ...b, bookingStatus: 'cancelled' } : b))
      );
      showToast('Booking cancelled successfully.', 'success');
    } catch (err) {
      showToast(err.message || 'Cancellation failed', 'error');
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'accepted': return 'bg-success-light text-success';
      case 'rejected': return 'bg-danger-light text-danger';
      case 'cancelled': return 'bg-secondary-light text-secondary';
      default: return 'bg-warning-light text-warning';
    }
  };

  return (
    <div className="container py-4 page-container text-start">
      <h2 className="font-display mb-4">Student Dashboard</h2>

      <div className="row g-4">
        {/* Navigation Sidebar */}
        <div className="col-lg-3 col-md-4">
          <div className="premium-card p-3 dashboard-menu">
            <button
              className={`btn btn-dash-menu w-100 text-start py-2.5 mb-2 d-flex align-items-center gap-2 ${activeTab === 'bookings' ? 'active' : ''}`}
              onClick={() => setSearchParams({ tab: 'bookings' })}
            >
              <i className="bi bi-calendar-check fs-5"></i>
              <span>My Bookings</span>
            </button>
            <button
              className={`btn btn-dash-menu w-100 text-start py-2.5 mb-2 d-flex align-items-center gap-2 ${activeTab === 'saved' ? 'active' : ''}`}
              onClick={() => setSearchParams({ tab: 'saved' })}
            >
              <i className="bi bi-bookmark fs-5"></i>
              <span>Saved Properties</span>
            </button>
            <button
              className={`btn btn-dash-menu w-100 text-start py-2.5 mb-2 d-flex align-items-center gap-2 ${activeTab === 'contacts' ? 'active' : ''}`}
              onClick={() => setSearchParams({ tab: 'contacts' })}
            >
              <i className="bi bi-envelope-open fs-5"></i>
              <span>Contact Requests</span>
            </button>
            <button
              className={`btn btn-dash-menu w-100 text-start py-2.5 mb-2 d-flex align-items-center gap-2 ${activeTab === 'complaints' ? 'active' : ''}`}
              onClick={() => setSearchParams({ tab: 'complaints' })}
            >
              <i className="bi bi-exclamation-triangle fs-5"></i>
              <span>Complaints & Tickets</span>
            </button>
            <button
              className={`btn btn-dash-menu w-100 text-start py-2.5 mb-2 d-flex align-items-center gap-2 ${activeTab === 'profile' ? 'active' : ''}`}
              onClick={() => setSearchParams({ tab: 'profile' })}
            >
              <i className="bi bi-person fs-5"></i>
              <span>My Profile</span>
            </button>
            <button
              className={`btn btn-dash-menu w-100 text-start py-2.5 d-flex align-items-center gap-2 ${activeTab === 'settings' ? 'active' : ''}`}
              onClick={() => setSearchParams({ tab: 'settings' })}
            >
              <i className="bi bi-gear fs-5"></i>
              <span>Settings</span>
            </button>
          </div>
        </div>

        {/* Content Panel */}
        <div className="col-lg-9 col-md-8">
          {activeTab === 'bookings' && (
            <div className="premium-card p-4">
              <h4 className="font-display mb-4">My Bookings</h4>
              {loading ? (
                <Loader />
              ) : bookings.length === 0 ? (
                <div className="text-center py-5 text-muted">
                  <i className="bi bi-calendar-x fs-1 mb-3 d-block"></i>
                  <p className="mb-3">You have no active bookings or requests.</p>
                  <Link to="/search" className="btn btn-premium-primary btn-sm">Explore PGs</Link>
                </div>
              ) : (
                <div className="d-flex flex-column gap-3">
                  {bookings.map((booking) => (
                    <div key={booking._id} className="booking-card p-4 rounded border d-flex flex-md-row flex-column justify-content-between align-items-start align-items-md-center gap-3">
                      <div>
                        <div className="d-flex align-items-center gap-2 mb-2">
                          <h5 className="font-display mb-0">{booking.pg?.name || 'Deleted PG Property'}</h5>
                          <span className={`badge text-uppercase fs-8 ${getStatusClass(booking.bookingStatus)}`}>
                            {booking.bookingStatus}
                          </span>
                        </div>
                        <p className="text-muted small mb-2">
                          <i className="bi bi-geo-alt me-1"></i> {booking.pg?.location?.city}
                        </p>
                        <div className="d-flex flex-wrap gap-3 small text-muted">
                          <span><strong>Room Type:</strong> {booking.roomType}</span>
                          <span><strong>Start Date:</strong> {new Date(booking.bookingDate).toLocaleDateString()}</span>
                          <span><strong>Stay:</strong> {booking.duration} Months</span>
                        </div>
                      </div>

                      <div className="d-flex flex-md-column flex-row gap-2 w-100-sm justify-content-end text-end mt-2 mt-md-0">
                        <span className="small text-muted mb-md-1 d-block">Paid Advance: <strong>₹{booking.advancePaymentAmount}</strong></span>
                        <div className="d-flex gap-2">
                          <button
                            className="btn btn-sm btn-outline-primary py-1.5 px-3"
                            onClick={() => setReceiptBooking(booking)}
                          >
                            Receipt
                          </button>
                          {booking.bookingStatus === 'accepted' && (
                            <button
                              className="btn btn-sm btn-success text-white py-1.5 px-3"
                              onClick={() => {
                                setPayRentBooking(booking);
                                setRentCardNumber('');
                                setRentCardExpiry('');
                                setRentCardCvv('');
                                setRentUpiId('');
                              }}
                            >
                              Pay Rent
                            </button>
                          )}
                          {booking.bookingStatus === 'pending' && (
                            <button
                              className="btn btn-sm btn-outline-danger py-1.5 px-3"
                              onClick={() => handleCancelBooking(booking._id)}
                            >
                              Cancel
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'saved' && (
            <div className="premium-card p-4">
              <h4 className="font-display mb-4">Saved Properties</h4>
              {loading ? (
                <Loader />
              ) : savedPGsings.length === 0 ? (
                <div className="text-center py-5 text-muted">
                  <i className="bi bi-heartbreak fs-1 mb-3 d-block"></i>
                  <p className="mb-3">You haven't saved any hostels yet.</p>
                  <Link to="/search" className="btn btn-premium-primary btn-sm">Search PGs</Link>
                </div>
              ) : (
                <div className="row g-4">
                  {savedPGsings.map((pg) => (
                    <div key={pg._id} className="col-lg-4 col-md-6">
                      <Card pg={pg} />
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* CONTACT REQUESTS */}
          {activeTab === 'contacts' && (
            <div className="premium-card p-4 text-start">
              <h4 className="font-display mb-4">Contact Requests</h4>
              
              {/* Form to raise contact request */}
              <div className="p-4 border rounded mb-5">
                <h5 className="font-display mb-3 text-indigo">Raise New Contact Request</h5>
                {contactMsg && <div className="alert alert-success py-2 small">{contactMsg}</div>}
                {contactErr && <div className="alert alert-danger py-2 small">{contactErr}</div>}

                <form onSubmit={handleRaiseContactRequest}>
                  <div className="row g-3">
                    <div className="col-md-5">
                      <label className="form-label small text-muted font-display">Preferred Location / Landmark</label>
                      <input
                        type="text"
                        className="form-control custom-input"
                        placeholder="e.g. Knowledge Park II, Sector 62"
                        value={contactLocation}
                        onChange={(e) => setContactLocation(e.target.value)}
                        required
                      />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label small text-muted font-display">Monthly Budget (Max)</label>
                      <input
                        type="number"
                        className="form-control custom-input"
                        placeholder="e.g. 7000, 9000"
                        value={contactBudget}
                        onChange={(e) => setContactBudget(e.target.value)}
                        required
                      />
                    </div>
                    <div className="col-md-3">
                      <label className="form-label small text-muted font-display">Gender Requirement</label>
                      <select
                        className="form-select custom-input"
                        value={contactGender}
                        onChange={(e) => setContactGender(e.target.value)}
                        required
                      >
                        <option value="boys">Boys</option>
                        <option value="girls">Girls</option>
                        <option value="unisex">Unisex</option>
                      </select>
                    </div>
                  </div>

                  <button type="submit" className="btn btn-premium-primary py-2 px-4 mt-3 btn-sm" disabled={contactLoading}>
                    {contactLoading ? 'Submitting...' : 'Raise Request'}
                  </button>
                </form>
              </div>

              {/* Contact Requests History */}
              <h5 className="font-display mb-3">My Contact Requests</h5>
              {loading ? (
                <Loader />
              ) : contactRequests.length === 0 ? (
                <div className="text-center py-4 text-muted">
                  <i className="bi bi-envelope-x fs-2 mb-2 d-block"></i>
                  <p className="small mb-0">No contact requests raised by you yet.</p>
                </div>
              ) : (
                <div className="d-flex flex-column gap-3">
                  {contactRequests.map((req) => (
                    <div key={req._id} className="p-4 border rounded animate-fade-in">
                      <div className="d-flex justify-content-between align-items-start mb-3">
                        <div>
                          <h6 className="font-display mb-1">Location: {req.preferredLocation}</h6>
                          <span className="small text-muted d-block mb-1">Budget: Up to ₹{req.budget}</span>
                          <span className="badge bg-light text-dark text-capitalize small">Gender Pref: {req.gender}</span>
                        </div>
                        <div className="text-end">
                          {req.status === 'pending' && (
                            <span className="badge bg-warning-light text-warning px-2.5 py-1.5 small font-display">
                              🟡 Pending
                            </span>
                          )}
                          {req.status === 'assigned' && (
                            <span className="badge bg-info-light text-info px-2.5 py-1.5 small font-display">
                              🟢 Owner Assigned
                            </span>
                          )}
                          {req.status === 'approved' && (
                            <span className="badge bg-success-light text-success px-2.5 py-1.5 small font-display">
                              ✅ Contact Shared
                            </span>
                          )}
                          {req.status === 'rejected' && (
                            <span className="badge bg-danger-light text-danger px-2.5 py-1.5 small font-display">
                              ❌ Rejected
                            </span>
                          )}
                        </div>
                      </div>

                      {req.status === 'approved' && req.acceptedPG ? (
                        <div className="bg-light p-3 rounded mt-2 border border-success-subtle">
                          <span className="small text-muted text-uppercase d-block fs-8 mb-2 fw-semibold text-success">Approved Owner Contact details</span>
                          <div className="d-flex flex-column gap-1 small text-dark">
                            <span><strong>PG Name:</strong> {req.acceptedPG.name}</span>
                            <span><strong>Owner Name:</strong> {req.acceptedPG.owner?.name}</span>
                            <span><strong>Phone:</strong> {req.acceptedPG.owner?.phone}</span>
                            <span><strong>Email:</strong> {req.acceptedPG.owner?.email}</span>
                          </div>
                        </div>
                      ) : req.status === 'assigned' ? (
                        <p className="small text-muted mb-0 mt-2 italic">
                          💡 Admin has matched your request with owner listings: <strong>{req.assignedPGs?.map(p => p.name).join(', ')}</strong>. Pending owner acceptance response.
                        </p>
                      ) : req.status === 'pending' ? (
                        <p className="small text-muted mb-0 mt-2 italic">
                          💡 Your request is pending admin matching. Matching owners will show up here.
                        </p>
                      ) : null}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* COMPLAINTS & TICKETS */}
          {activeTab === 'complaints' && (
            <div className="premium-card p-4 text-start">
              <h4 className="font-display mb-4">Complaints & Tickets</h4>
              
              {/* Form to raise complaint */}
              <div className="p-4 border rounded mb-5">
                <h5 className="font-display mb-3 text-indigo">Raise a Complaint</h5>
                {complaintMsg && <div className="alert alert-success py-2 small">{complaintMsg}</div>}
                {complaintErr && <div className="alert alert-danger py-2 small">{complaintErr}</div>}

                <form onSubmit={handleRaiseComplaint}>
                  <div className="mb-3">
                    <label className="form-label small text-muted font-display">Target PG</label>
                    <select
                      className="form-select custom-input"
                      value={complaintPgId}
                      onChange={(e) => setComplaintPgId(e.target.value)}
                      required
                    >
                      <option value="">-- Select Accommodation --</option>
                      {bookings.map((bookingObj) => (
                        <option key={bookingObj._id} value={bookingObj.pg?._id}>
                          {bookingObj.pg?.name} ({bookingObj.roomType})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="mb-3">
                    <label className="form-label small text-muted font-display">Subject / Issue Summary</label>
                    <input
                      type="text"
                      className="form-control custom-input"
                      placeholder="e.g. WiFi not working, Water issue"
                      value={complaintSubject}
                      onChange={(e) => setComplaintSubject(e.target.value)}
                      required
                    />
                  </div>
                  <div className="mb-4">
                    <label className="form-label small text-muted font-display">Elaborated Description</label>
                    <textarea
                      className="form-control custom-input"
                      rows="3"
                      placeholder="Explain your problem in detail..."
                      value={complaintDesc}
                      onChange={(e) => setComplaintDesc(e.target.value)}
                      required
                    ></textarea>
                  </div>

                  <button type="submit" className="btn btn-premium-primary py-2 px-4 btn-sm" disabled={complaintLoading}>
                    {complaintLoading ? 'Submitting...' : 'Raise Ticket'}
                  </button>
                </form>
              </div>

              {/* Complaints List */}
              <h5 className="font-display mb-3">Raised Tickets</h5>
              {loading ? (
                <Loader />
              ) : complaints.length === 0 ? (
                <p className="small text-muted py-2">No complaints Raised yet.</p>
              ) : (
                <div className="d-flex flex-column gap-3">
                  {complaints.map((ticket) => (
                    <div key={ticket._id} className="p-3 border rounded">
                      <div className="d-flex justify-content-between align-items-center mb-2">
                        <h6 className="font-display mb-0">{ticket.subject} <span className="small text-muted">on {ticket.pg?.name}</span></h6>
                        <span className={`badge ${ticket.status === 'resolved' ? 'bg-success' : 'bg-danger'}`}>
                          {ticket.status.toUpperCase()}
                        </span>
                      </div>
                      <p className="small mb-2 text-muted italic">"{ticket.description}"</p>

                      {ticket.status === 'resolved' && (
                        <div className="bg-light p-2.5 rounded border-start border-success border-3 small text-muted mt-2">
                          <strong>Admin Resolution:</strong> "{ticket.resolutionDetails}"
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'profile' && (
            <div className="premium-card p-4">
              <h4 className="font-display mb-4">Edit Profile</h4>
              {profileMsg && <div className="alert alert-success py-2 small">{profileMsg}</div>}
              {profileErr && <div className="alert alert-danger py-2 small">{profileErr}</div>}

              <form onSubmit={handleUpdateProfile} className="max-w-2xl text-start">
                <div className="mb-3">
                  <label className="form-label small text-muted font-display">Full Name</label>
                  <input
                    type="text"
                    className="form-control custom-input"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label small text-muted font-display">Email Address (Read-only)</label>
                  <input
                    type="email"
                    className="form-control custom-input bg-light"
                    value={user?.email}
                    disabled
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label small text-muted font-display">Phone Number</label>
                  <input
                    type="tel"
                    className="form-control custom-input"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                  />
                </div>
                <div className="mb-4">
                  <label className="form-label small text-muted font-display">Profile Image URL</label>
                  <input
                    type="text"
                    className="form-control custom-input"
                    placeholder="https://images.unsplash.com/photo-..."
                    value={profilePicture}
                    onChange={(e) => setProfilePicture(e.target.value)}
                  />
                </div>

                <button type="submit" className="btn btn-premium-primary py-2.5 px-4" disabled={profileLoading}>
                  {profileLoading ? 'Saving...' : 'Save Changes'}
                </button>
              </form>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="premium-card p-5" style={{ maxWidth: '550px' }}>
              <h4 className="font-display mb-4 text-gradient fw-bold">Settings</h4>
              <p className="text-muted small mb-4">Manage your account credentials and security.</p>
              
              <form onSubmit={handleChangePassword}>
                <div className="mb-3">
                  <label className="form-label small text-muted font-display">Current Password</label>
                  <div className="position-relative">
                    <input
                      type={showCurrentPassword ? "text" : "password"}
                      className="form-control custom-input w-100 pe-5"
                      placeholder="••••••••"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      required
                    />
                    <button
                      type="button"
                      className="btn position-absolute end-0 top-50 translate-middle-y border-0 bg-transparent text-muted"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      style={{ zIndex: 10, outline: 'none', boxShadow: 'none' }}
                    >
                      <i className={`bi bi-eye${showCurrentPassword ? '-slash' : ''}`}></i>
                    </button>
                  </div>
                </div>
                
                <div className="mb-3">
                  <label className="form-label small text-muted font-display">New Password</label>
                  <div className="position-relative">
                    <input
                      type={showNewPassword ? "text" : "password"}
                      className="form-control custom-input w-100 pe-5"
                      placeholder="••••••••"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                    />
                    <button
                      type="button"
                      className="btn position-absolute end-0 top-50 translate-middle-y border-0 bg-transparent text-muted"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      style={{ zIndex: 10, outline: 'none', boxShadow: 'none' }}
                    >
                      <i className={`bi bi-eye${showNewPassword ? '-slash' : ''}`}></i>
                    </button>
                  </div>
                </div>
                
                <div className="mb-4">
                  <label className="form-label small text-muted font-display">Confirm New Password</label>
                  <div className="position-relative">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      className="form-control custom-input w-100 pe-5"
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                    />
                    <button
                      type="button"
                      className="btn position-absolute end-0 top-50 translate-middle-y border-0 bg-transparent text-muted"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      style={{ zIndex: 10, outline: 'none', boxShadow: 'none' }}
                    >
                      <i className={`bi bi-eye${showConfirmPassword ? '-slash' : ''}`}></i>
                    </button>
                  </div>
                </div>

                <button 
                  type="submit" 
                  className="btn btn-premium-primary py-2.5 px-4 font-display"
                  disabled={passwordLoading}
                >
                  {passwordLoading ? 'Updating...' : 'Change Password'}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>

      {/* Receipt Modal Popup */}
      {receiptBooking && (
        <div className="modal-backdrop-custom d-flex align-items-center justify-content-center p-3" onClick={(e) => { if (e.target === e.currentTarget) setReceiptBooking(null); }}>
          <div className="modal-box-custom premium-card p-5 animate-fade-in text-start position-relative receipt-container" id="printable-receipt" style={{ background: '#FFFFFF', color: '#2D2A26' }}>
            <button className="btn-close position-absolute top-0 end-0 m-3 print-hide" onClick={() => setReceiptBooking(null)}></button>
            <div className="text-center mb-3">
              <span className="fs-2">📄</span>
              <h4 className="font-display mt-2 text-primary">Booking Receipt</h4>
              <span className="small text-muted font-monospace">{receiptBooking.receiptNumber}</span>
            </div>
            
            <div className="border-bottom my-3 pb-2 small">
              <div className="d-flex justify-content-between mb-1">
                <span className="text-muted">Billed User:</span>
                <span className="fw-semibold">{user.name}</span>
              </div>
              <div className="d-flex justify-content-between mb-1">
                <span className="text-muted">Hostel:</span>
                <span className="fw-semibold">{receiptBooking.pg?.name}</span>
              </div>
              <div className="d-flex justify-content-between mb-1">
                <span className="text-muted">Room Selected:</span>
                <span className="fw-semibold">{receiptBooking.roomType}</span>
              </div>
              <div className="d-flex justify-content-between">
                <span className="text-muted">Booking Date:</span>
                <span>{new Date(receiptBooking.bookingDate).toLocaleDateString()}</span>
              </div>
            </div>

            <div className="p-3 bg-light rounded font-monospace small mb-4">
              <div className="d-flex justify-content-between">
                <span>Advance Fee Paid:</span>
                <span className="fw-bold">₹{receiptBooking.advancePaymentAmount}</span>
              </div>
              <div className="d-flex justify-content-between mt-1">
                <span>Payment Status:</span>
                <span className="text-success fw-bold uppercase">COMPLETED</span>
              </div>
              <div className="d-flex justify-content-between mt-1">
                <span>Verification:</span>
                <span className={`fw-bold text-uppercase ${receiptBooking.bookingStatus === 'accepted' ? 'text-success' : 'text-warning'}`}>
                  {receiptBooking.bookingStatus}
                </span>
              </div>
            </div>

            <div className="d-flex gap-2 justify-content-end">
              <button className="btn btn-sm btn-premium-secondary" onClick={() => window.print()}>Print</button>
              <button className="btn btn-sm btn-premium-primary" onClick={() => setReceiptBooking(null)}>Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Pay Rent Modal */}
      {payRentBooking && (
        <div 
          className="modal-backdrop-custom d-flex align-items-center justify-content-center p-3 animate-fade-in" 
          onClick={(e) => { if (e.target === e.currentTarget) setPayRentBooking(null); }}
          style={{ zIndex: 2050, position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.6)', overflowY: 'auto' }}
        >
          <div className="modal-box-custom premium-card p-4 position-relative" style={{ maxWidth: '500px', width: '100%', background: 'var(--surface)', border: '1px solid var(--surface-border)', borderRadius: '12px', maxHeight: '90vh', overflowY: 'auto' }}>
            <button 
              type="button" 
              className="btn-close position-absolute top-0 end-0 m-3" 
              onClick={() => setPayRentBooking(null)}
              style={{ filter: 'var(--close-filter)' }}
            ></button>

            {rentPaymentSuccess ? (
              <div className="text-center py-4">
                <div className="mb-3 text-success fs-1 animate-bounce">✓</div>
                <h4 className="font-display fw-bold mb-1 text-success">Rent Paid Successfully!</h4>
                <p className="small text-muted">
                  Your monthly rent of <strong>₹{payRentBooking.pg?.rooms?.find(r => r.roomType === payRentBooking.roomType)?.price || 0}</strong> for <strong>{payRentMonth} {payRentYear}</strong> has been processed.
                </p>
                <div className="spinner-border text-success spinner-border-sm mt-3" role="status"></div>
              </div>
            ) : (
              <>
                <h4 className="font-display mb-3 fw-bold text-success" style={{ color: 'var(--primary-theme)' }}>Pay Monthly Rent</h4>
                <p className="small text-muted mb-4">
                  Log payment for <strong>{payRentBooking.pg?.name || 'PG Property'}</strong> (Room: {payRentBooking.roomType}).
                </p>

                <form onSubmit={handlePayRentSubmit}>
                  <div className="row g-3 mb-3">
                    <div className="col-6">
                      <label className="form-label small fw-bold">Select Month</label>
                      <select
                        className="form-select"
                        value={payRentMonth}
                        onChange={(e) => setPayRentMonth(e.target.value)}
                        required
                      >
                        {['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'].map(m => (
                          <option key={m} value={m}>{m}</option>
                        ))}
                      </select>
                    </div>
                    <div className="col-6">
                      <label className="form-label small fw-bold">Select Year</label>
                      <input 
                        type="number"
                        className="form-control"
                        value={payRentYear}
                        onChange={(e) => setPayRentYear(e.target.value)}
                        required
                      />
                    </div>
                    <div className="col-12">
                      <label className="form-label small fw-bold">Amount Due (₹)</label>
                      <input 
                        type="text"
                        className="form-control"
                        value={`₹${payRentBooking.pg?.rooms?.find(r => r.roomType === payRentBooking.roomType)?.price || 0}`}
                        disabled
                      />
                    </div>
                  </div>

                  {/* Payment Mode */}
                  <div className="payment-method-selector mb-3 border-top pt-3">
                    <label className="form-label small fw-bold mb-2">Choose Payment Method</label>
                    <div className="d-flex gap-3">
                      <div className="form-check">
                        <input
                          className="form-check-input"
                          type="radio"
                          name="payRentMethod"
                          id="rentMethodCard"
                          value="card"
                          checked={payRentMethod === 'card'}
                          onChange={() => setPayRentMethod('card')}
                        />
                        <label className="form-check-label small" htmlFor="rentMethodCard">
                          Debit/Credit Card
                        </label>
                      </div>
                      <div className="form-check">
                        <input
                          className="form-check-input"
                          type="radio"
                          name="payRentMethod"
                          id="rentMethodUPI"
                          value="upi"
                          checked={payRentMethod === 'upi'}
                          onChange={() => setPayRentMethod('upi')}
                        />
                        <label className="form-check-label small" htmlFor="rentMethodUPI">
                          UPI / QR Code
                        </label>
                      </div>
                    </div>
                  </div>

                  {payRentMethod === 'card' ? (
                    <div className="p-3 border rounded mb-3 bg-light bg-opacity-25">
                      <div className="mb-2">
                        <label className="form-label small text-muted mb-1">Card Number</label>
                        <input
                          type="text"
                          className="form-control form-control-sm"
                          placeholder="1234 5678 1234 5678"
                          value={rentCardNumber}
                          onChange={(e) => setRentCardNumber(e.target.value)}
                          required
                        />
                      </div>
                      <div className="row g-2">
                        <div className="col-6">
                          <label className="form-label small text-muted mb-1">Expiry Date</label>
                          <input
                            type="text"
                            className="form-control form-control-sm"
                            placeholder="MM/YY"
                            value={rentCardExpiry}
                            onChange={(e) => setRentCardExpiry(e.target.value)}
                            required
                          />
                        </div>
                        <div className="col-6">
                          <label className="form-label small text-muted mb-1">CVV</label>
                          <input
                            type="password"
                            className="form-control form-control-sm"
                            placeholder="123"
                            maxLength="3"
                            value={rentCardCvv}
                            onChange={(e) => setRentCardCvv(e.target.value)}
                            required
                          />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="p-3 border rounded mb-3 bg-light bg-opacity-25 text-center">
                      <div className="mb-2">
                        <label className="form-label small text-muted mb-1 d-block text-start">UPI ID</label>
                        <input
                          type="text"
                          className="form-control form-control-sm"
                          placeholder="student@okaxis"
                          value={rentUpiId}
                          onChange={(e) => setRentUpiId(e.target.value)}
                          required
                        />
                      </div>
                      <div className="d-inline-block p-2 bg-white rounded border mt-2">
                        <img 
                          src={`https://api.qrserver.com/v1/create-qr-code/?size=130x130&data=upi://pay?pa=pgverse@pay%26pn=PGVerse%26am=${payRentBooking.pg?.rooms?.find(r => r.roomType === payRentBooking.roomType)?.price || 0}`}
                          alt="Rent UPI QR" 
                          style={{ width: '130px', height: '130px' }}
                        />
                      </div>
                      <small className="text-muted d-block mt-2">Scan QR code using BHIM, GPay, PhonePe, or Paytm</small>
                    </div>
                  )}

                  <div className="d-flex justify-content-end gap-3 mt-4 pt-3 border-top">
                    <button 
                      type="button" 
                      className="btn btn-premium-secondary px-4" 
                      onClick={() => setPayRentBooking(null)}
                      disabled={payingRent}
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit" 
                      className="btn btn-premium-primary px-4"
                      disabled={payingRent}
                    >
                      {payingRent ? 'Processing...' : `Pay Rent (₹${payRentBooking.pg?.rooms?.find(r => r.roomType === payRentBooking.roomType)?.price || 0})`}
                    </button>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
