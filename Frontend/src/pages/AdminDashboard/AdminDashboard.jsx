import React, { useState, useEffect, useContext } from 'react';
import { useSearchParams } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import Loader from '../../components/Loader/Loader';
import api from '../../services/api';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const { showToast } = useContext(AuthContext);
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'overview';

  // Sub-tabs for Revenue & Plans page
  const [revenueSubTab, setRevenueSubTab] = useState('active');

  // State
  const [stats, setStats] = useState(null);
  const [owners, setOwners] = useState([]);
  const [pgs, setPgs] = useState([]);
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOwnerDetail, setSelectedOwnerDetail] = useState(null);

  // Settings Change Password State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    fetchTabData();
  }, [activeTab]);

  const fetchTabData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'overview') {
        const resStats = await api.get('/admin/stats');
        setStats(resStats.data);
      } else if (activeTab === 'owners') {
        const resOwners = await api.get('/admin/users?role=owner');
        setOwners(resOwners.data);
        const resPgs = await api.get('/pgs?approvedOnly=false');
        setPgs(resPgs.data);
      } else if (activeTab === 'pgs') {
        const resPgs = await api.get('/pgs?approvedOnly=false');
        setPgs(resPgs.data);
      } else if (activeTab === 'analytics') {
        const resStats = await api.get('/admin/stats');
        setStats(resStats.data);
      } else if (activeTab === 'revenue') {
        const resList = await api.get('/subscriptions');
        setSubscriptions(resList.data || []);
      }
    } catch (err) {
      console.error('Error fetching admin dashboard data:', err.message);
    } finally {
      setLoading(false);
    }
  };

  // User Actions (Approve Owner, Delete User)
  const handleToggleOwnerApproval = async (ownerId, currentStatus) => {
    try {
      const nextStatus = !currentStatus;
      await api.put(`/admin/users/${ownerId}/status`, { isApprovedOwner: nextStatus });
      showToast(
        nextStatus 
          ? 'Owner profile approved successfully! Notification sent to the Owner.' 
          : 'Owner profile set to pending verification.', 
        'success'
      );
      setOwners(prev => prev.map(o => o._id === ownerId ? { ...o, isApprovedOwner: nextStatus } : o));
    } catch (err) {
      showToast(err.message || 'Action failed', 'error');
    }
  };

  const handleDeleteUser = async (userId, userRole) => {
    if (!window.confirm('Are you sure you want to delete this user permanently? This will delete all their data.')) return;
    try {
      await api.delete(`/admin/users/${userId}`);
      showToast('User deleted permanently', 'success');
      if (userRole === 'owner') {
        setOwners(prev => prev.filter(o => o._id !== userId));
      }
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  // PG Actions (Approve PG, Delete PG)
  const handleTogglePGApproval = async (pgId, currentApprovedStatus) => {
    try {
      const nextStatus = !currentApprovedStatus;
      await api.put(`/pgs/${pgId}/approve`, { isApproved: nextStatus });
      showToast(
        nextStatus 
          ? 'PG listing approved successfully! Notification sent to the Owner.' 
          : 'PG listing set to PENDING status.', 
        'success'
      );
      setPgs(prev => prev.map(p => p._id === pgId ? { ...p, isApproved: nextStatus } : p));
    } catch (err) {
      showToast(err.message || 'Action failed', 'error');
    }
  };

  const handleDeletePG = async (pgId) => {
    if (!window.confirm('Are you sure you want to delete this PG listing?')) return;
    try {
      await api.delete(`/pgs/${pgId}`);
      showToast('PG listing deleted', 'success');
      setPgs(prev => prev.filter(p => p._id !== pgId));
    } catch (err) {
      showToast(err.message || 'Deletion failed', 'error');
    }
  };

  const handleApproveSub = async (subId) => {
    try {
      await api.put(`/subscriptions/${subId}/approve`);
      showToast('Subscription approved and activated successfully!', 'success');
      fetchTabData();
    } catch (err) {
      showToast(err.response?.data?.message || err.message || 'Approval failed', 'error');
    }
  };

  const handleCancelSub = async (subId) => {
    if (!window.confirm('Are you sure you want to cancel this subscription?')) return;
    try {
      await api.put(`/subscriptions/${subId}/cancel`);
      showToast('Subscription cancelled successfully!', 'success');
      fetchTabData();
    } catch (err) {
      showToast(err.response?.data?.message || err.message || 'Cancellation failed', 'error');
    }
  };

  const handleExtendSub = async (subId) => {
    try {
      await api.put(`/subscriptions/${subId}/extend`);
      showToast('Subscription extended by 30 days!', 'success');
      fetchTabData();
    } catch (err) {
      showToast(err.response?.data?.message || err.message || 'Extension failed', 'error');
    }
  };

  // Change Password Action
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

  // Filters for Revenue & Plans subtabs
  const activeSubscriptions = subscriptions.filter(sub => sub.status === 'active');
  const expiredSubscriptions = subscriptions.filter(sub => sub.status === 'expired');

  return (
    <div className="container py-4 page-container text-start">
      <h2 className="font-display mb-4">Admin Control Center</h2>

      <div className="row g-4">
        {/* Navigation Sidebar */}
        <div className="col-lg-3 col-md-4">
          <div className="premium-card p-3 dashboard-menu shadow-sm">
            {[
              { id: 'overview', label: 'Overview Dashboard', icon: 'bi-grid' },
              { id: 'owners', label: 'Owner Management', icon: 'bi-people' },
              { id: 'pgs', label: 'PG Management', icon: 'bi-building' },
              { id: 'analytics', label: 'Platform Analytics', icon: 'bi-graph-up' },
              { id: 'revenue', label: 'Revenue & Subscription', icon: 'bi-wallet2' },
              { id: 'settings', label: 'Settings', icon: 'bi-gear' }
            ].map((tabItem) => (
              <button
                key={tabItem.id}
                className={`btn btn-dash-menu w-100 text-start py-2.5 mb-1.5 d-flex align-items-center gap-2 ${activeTab === tabItem.id ? 'active' : ''}`}
                onClick={() => setSearchParams({ tab: tabItem.id })}
              >
                <i className={`bi ${tabItem.icon} fs-5`}></i>
                <span className="small">{tabItem.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Content Panel */}
        <div className="col-lg-9 col-md-8">
          {loading ? (
            <Loader />
          ) : (
            <>
              {/* TAB 1: OVERVIEW */}
              {activeTab === 'overview' && stats && (
                <div className="premium-card p-4">
                  <h4 className="font-display mb-4">System Overview Dashboard</h4>
                  <div className="row g-3">
                    {[
                      { num: stats.totalOwners, label: 'Total Owners', bg: 'rgba(16, 185, 129, 0.1)', color: '#10b981', tab: 'owners', filter: 'all' },
                      { num: stats.pendingOwners, label: 'Pending Owners', bg: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b', tab: 'owners', filter: 'pending' },
                      { num: stats.totalPGs, label: 'Total PG Listings', bg: 'rgba(99, 102, 241, 0.1)', color: '#6366f1', tab: 'pgs', filter: 'all' }
                    ].map((card, i) => (
                      <div 
                        key={i} 
                        className="col-md-4 col-12" 
                        onClick={() => setSearchParams({ tab: card.tab, filter: card.filter })} 
                        style={{ cursor: 'pointer' }}
                      >
                        <div 
                          className="stat-card" 
                          style={{ 
                            borderTop: `4px solid ${card.color}`, 
                            background: `linear-gradient(180deg, var(--surface) 0%, ${card.bg} 100%)`,
                            transition: 'transform 0.25s ease, box-shadow 0.25s ease' 
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'translateY(-5px)';
                            e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.08)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow = 'none';
                          }}
                        >
                          <span className="text-muted small text-uppercase font-display tracking-wider mb-2 d-block">{card.label}</span>
                          <h3 className="font-display mb-0 fw-bold" style={{ color: card.color }}>{card.num}</h3>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 2: OWNER MANAGEMENT */}
              {activeTab === 'owners' && (() => {
                const currentFilter = searchParams.get('filter') || 'all';
                const displayedOwners = currentFilter === 'pending'
                  ? owners.filter(o => !o.isApprovedOwner)
                  : owners;

                return (
                  <div className="premium-card p-4">
                    <div className="d-flex justify-content-between align-items-center mb-4">
                      <h4 className="font-display mb-0">
                        Owner Profile Verification
                        {currentFilter === 'pending' && (
                          <span className="badge bg-warning text-dark ms-2" style={{ fontSize: '0.75rem' }}>Pending Only</span>
                        )}
                      </h4>
                      {currentFilter === 'pending' && (
                        <button 
                          className="btn btn-xs btn-outline-secondary py-1 px-2.5" 
                          onClick={() => setSearchParams({ tab: 'owners', filter: 'all' })}
                          style={{ fontSize: '0.75rem' }}
                        >
                          Show All Owners
                        </button>
                      )}
                    </div>
                    
                    {displayedOwners.length === 0 ? (
                      <p className="text-muted text-center py-4 small fw-semibold">
                        {currentFilter === 'pending' 
                          ? 'No active pending owners found.' 
                          : 'No owner profiles found in the database.'}
                      </p>
                    ) : (
                      <div className="table-responsive">
                        <table className="table align-middle">
                          <thead>
                            <tr className="table-light text-muted">
                              <th>Owner Name</th>
                              <th>Email</th>
                              <th>Phone</th>
                              <th>Total PG</th>
                              <th>Status (Active/Pending)</th>
                              <th className="text-end">Action (View/Delete)</th>
                            </tr>
                          </thead>
                          <tbody>
                            {displayedOwners.map((owner) => {
                            const totalPGCount = (pgs || []).filter(p => {
                              const pOwnerId = p.owner?._id || p.owner;
                              const oId = owner._id || owner.id;
                              return String(pOwnerId) === String(oId);
                            }).length;
                            return (
                              <tr key={owner._id}>
                                <td className="fw-semibold font-display">{owner.name}</td>
                                <td>{owner.email}</td>
                                <td>{owner.phone}</td>
                                <td className="fw-bold text-center" style={{ width: '80px' }}>{totalPGCount}</td>
                                <td>
                                  <span className={`badge ${owner.isApprovedOwner ? 'bg-success' : 'bg-warning text-dark'}`}>
                                    {owner.isApprovedOwner ? 'Active' : 'Pending'}
                                  </span>
                                </td>
                                <td className="text-end">
                                  <div className="d-flex gap-2 justify-content-end align-items-center">
                                    <button
                                      className="btn btn-sm btn-outline-primary py-1 px-3"
                                      onClick={() => setSelectedOwnerDetail(owner)}
                                    >
                                      View
                                    </button>
                                    <button
                                      className="btn btn-sm btn-outline-danger py-1 px-3"
                                      onClick={() => handleDeleteUser(owner._id, 'owner')}
                                      title="Delete Owner"
                                    >
                                      Delete
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              );
            })()}


              {/* TAB 3: PG MANAGEMENT */}
              {activeTab === 'pgs' && (
                <div className="premium-card p-4">
                  <h4 className="font-display mb-4">PG Listings Verification</h4>
                  {pgs.length === 0 ? (
                    <p className="text-muted text-center py-4 small">No PG properties listed.</p>
                  ) : (
                    <div className="table-responsive">
                      <table className="table align-middle">
                        <thead>
                          <tr className="table-light">
                            <th>PG Name</th>
                            <th>Owner Name</th>
                            <th>City</th>
                            <th>Status (Approved/Pending)</th>
                            <th className="text-end">Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {pgs.map((pgObj) => (
                            <tr key={pgObj._id}>
                              <td className="fw-semibold font-display">{pgObj.name}</td>
                              <td>{pgObj.owner?.name}</td>
                              <td>{pgObj.location?.city}</td>
                              <td>
                                <span className={`badge ${pgObj.isApproved ? 'bg-success' : 'bg-warning text-dark'}`}>
                                  {pgObj.isApproved ? 'Approved' : 'Pending'}
                                </span>
                              </td>
                              <td className="text-end">
                                <div className="d-flex gap-2 justify-content-end">
                                  <button
                                    className={`btn btn-sm py-1 px-3 ${pgObj.isApproved ? 'btn-outline-warning' : 'btn-success text-white'}`}
                                    onClick={() => handleTogglePGApproval(pgObj._id, pgObj.isApproved)}
                                  >
                                    {pgObj.isApproved ? 'Disapprove' : 'Approve'}
                                  </button>
                                  <button
                                    className="btn btn-sm btn-outline-danger py-1 px-3"
                                    onClick={() => handleDeletePG(pgObj._id)}
                                  >
                                    Delete
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 5: PLATFORM ANALYTICS */}
              {activeTab === 'analytics' && stats && (
                <div className="premium-card p-4">
                  <h4 className="font-display mb-4">Platform Analytics Overview</h4>
                  <div className="row g-3">
                    {[
                      { num: stats.totalOwners, label: 'Total Owners', bg: 'rgba(16, 185, 129, 0.1)', color: '#10b981' },
                      { num: stats.totalPGs, label: 'Total PGs', bg: 'rgba(99, 102, 241, 0.1)', color: '#6366f1' },
                      { num: stats.totalOwners - stats.pendingOwners, label: 'Active Owners', bg: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6' },
                      { num: stats.pendingOwners, label: 'Pending Owners', bg: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b' }
                    ].map((card, i) => (
                      <div key={i} className="col-md-6 col-12">
                        <div className="stat-card" style={{ borderTop: `4px solid ${card.color}`, background: `linear-gradient(180deg, var(--surface) 0%, ${card.bg} 100%)` }}>
                          <span className="text-muted small text-uppercase font-display tracking-wider mb-2 d-block">{card.label}</span>
                          <h3 className="font-display mb-0 fw-bold" style={{ color: card.color }}>{card.num}</h3>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 6: REVENUE & PLANS */}
              {activeTab === 'revenue' && (
                <div className="premium-card p-4">
                  <h4 className="font-display mb-4">Revenue & Subscription Management</h4>
                  
                  {/* Subsection Tabs */}
                  <div className="d-flex border-bottom mb-4">
                    <button
                      className={`btn pb-2 px-3 rounded-0 font-display ${revenueSubTab === 'active' ? 'border-bottom border-primary border-3 fw-bold text-primary' : 'text-muted'}`}
                      onClick={() => setRevenueSubTab('active')}
                    >
                      Active Plans
                    </button>
                    <button
                      className={`btn pb-2 px-3 rounded-0 font-display ${revenueSubTab === 'expired' ? 'border-bottom border-primary border-3 fw-bold text-primary' : 'text-muted'}`}
                      onClick={() => setRevenueSubTab('expired')}
                    >
                      Expired Plans
                    </button>
                    <button
                      className={`btn pb-2 px-3 rounded-0 font-display ${revenueSubTab === 'history' ? 'border-bottom border-primary border-3 fw-bold text-primary' : 'text-muted'}`}
                      onClick={() => setRevenueSubTab('history')}
                    >
                      Payment History
                    </button>
                    <button
                      className={`btn pb-2 px-3 rounded-0 font-display ${revenueSubTab === 'renewal' ? 'border-bottom border-primary border-3 fw-bold text-primary' : 'text-muted'}`}
                      onClick={() => setRevenueSubTab('renewal')}
                    >
                      Subscription Renewal
                    </button>
                  </div>

                  {/* SUBSECTION 1: ACTIVE PLANS */}
                  {revenueSubTab === 'active' && (
                    <div className="table-responsive">
                      {activeSubscriptions.length === 0 ? (
                        <p className="text-muted text-center py-4 small">No active subscription plans found.</p>
                      ) : (
                        <table className="table align-middle">
                          <thead>
                            <tr className="table-light">
                              <th>Owner Name</th>
                              <th>Plan (Basic/Premium)</th>
                              <th>Expiry Date</th>
                              <th className="text-end">Status</th>
                            </tr>
                          </thead>
                          <tbody>
                            {activeSubscriptions.map((sub) => (
                              <tr key={sub._id}>
                                <td className="fw-semibold">{sub.owner?.name || 'Unknown Owner'}</td>
                                <td className="text-capitalize">{sub.planName} Plan</td>
                                <td>{sub.endDate ? new Date(sub.endDate).toLocaleDateString() : '-'}</td>
                               <td className="text-end">
                                 <span className="badge bg-success">ACTIVE</span>
                               </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      )}
                    </div>
                  )}

                  {/* SUBSECTION 2: EXPIRED PLANS */}
                  {revenueSubTab === 'expired' && (
                    <div className="table-responsive">
                      {expiredSubscriptions.length === 0 ? (
                        <p className="text-muted text-center py-4 small">No expired plans found.</p>
                      ) : (
                        <table className="table align-middle">
                          <thead>
                            <tr className="table-light">
                              <th>Owner Name</th>
                              <th>Plan (Basic/Premium)</th>
                              <th>Expiry Date</th>
                              <th className="text-end">Status</th>
                            </tr>
                          </thead>
                          <tbody>
                            {expiredSubscriptions.map((sub) => (
                              <tr key={sub._id}>
                                <td className="fw-semibold">{sub.owner?.name || 'Unknown Owner'}</td>
                                <td className="text-capitalize">{sub.planName} Plan</td>
                                <td>{sub.endDate ? new Date(sub.endDate).toLocaleDateString() : '-'}</td>
                                <td className="text-end">
                                  <span className="badge bg-danger">EXPIRED</span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      )}
                    </div>
                  )}

                  {/* SUBSECTION 3: PAYMENT HISTORY */}
                  {revenueSubTab === 'history' && (
                    <div className="table-responsive">
                      {subscriptions.length === 0 ? (
                        <p className="text-muted text-center py-4 small">No payment history found.</p>
                      ) : (
                        <table className="table align-middle">
                          <thead>
                            <tr className="table-light">
                              <th>Owner Name</th>
                              <th>Plan (Basic/Premium)</th>
                              <th>Amount Paid</th>
                              <th>Receipt Number</th>
                              <th>Payment Status</th>
                              <th className="text-end">Status</th>
                            </tr>
                          </thead>
                          <tbody>
                            {subscriptions.map((sub) => (
                              <tr key={sub._id}>
                                <td className="fw-semibold">{sub.owner?.name || 'Unknown Owner'}</td>
                                <td className="text-capitalize">{sub.planName} Plan</td>
                                <td>₹{sub.price}</td>
                                <td className="fw-mono text-muted">{sub.receiptNumber || 'N/A'}</td>
                                <td>
                                  <span className={`badge ${
                                    sub.paymentStatus === 'paid' ? 'bg-success' :
                                    sub.paymentStatus === 'pending' ? 'bg-warning text-dark' : 'bg-danger'
                                  }`}>
                                    {sub.paymentStatus.toUpperCase()}
                                  </span>
                                </td>
                                <td className="text-end">
                                  <span className={`badge me-2 ${
                                    sub.status === 'active' ? 'bg-success' :
                                    sub.status === 'expired' ? 'bg-danger' :
                                    sub.status === 'pending' ? 'bg-warning text-dark' : 'bg-secondary'
                                  }`}>
                                    {sub.status.toUpperCase()}
                                  </span>
                                  {sub.status === 'pending' && (
                                    <button className="btn btn-sm btn-success text-white py-0.5 px-2 fs-8" onClick={() => handleApproveSub(sub._id)}>
                                      Approve
                                    </button>
                                  )}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      )}
                    </div>
                  )}

                  {/* SUBSECTION 4: SUBSCRIPTION RENEWAL */}
                  {revenueSubTab === 'renewal' && (
                    <div className="table-responsive">
                      {activeSubscriptions.length === 0 && expiredSubscriptions.length === 0 ? (
                        <p className="text-muted text-center py-4 small">No subscription renewal listings found.</p>
                      ) : (
                        <table className="table align-middle">
                          <thead>
                            <tr className="table-light">
                              <th>Owner Name</th>
                              <th>Plan (Basic/Premium)</th>
                              <th>Expiry Date</th>
                              <th>Current Status</th>
                              <th className="text-end">Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {[...activeSubscriptions, ...expiredSubscriptions].map((sub) => (
                              <tr key={sub._id}>
                                <td className="fw-semibold">{sub.owner?.name || 'Unknown Owner'}</td>
                                <td className="text-capitalize">{sub.planName} Plan</td>
                                <td>{sub.endDate ? new Date(sub.endDate).toLocaleDateString() : '-'}</td>
                                <td>
                                  <span className={`badge ${sub.status === 'active' ? 'bg-success' : 'bg-danger'}`}>
                                    {sub.status.toUpperCase()}
                                  </span>
                                </td>
                                <td className="text-end">
                                  <button className="btn btn-sm btn-outline-primary py-1 px-2.5 me-2" onClick={() => handleExtendSub(sub._id)}>
                                    Extend 30 Days
                                  </button>
                                  {sub.status === 'active' && (
                                    <button className="btn btn-sm btn-outline-danger py-1 px-2.5" onClick={() => handleCancelSub(sub._id)}>
                                      Cancel
                                    </button>
                                  )}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 7: SETTINGS */}
              {activeTab === 'settings' && (
                <div className="premium-card p-5" style={{ maxWidth: '550px' }}>
                  <h4 className="font-display mb-4 text-gradient fw-bold">Settings</h4>
                  <p className="text-muted small mb-4">Manage your admin profile credential access and security.</p>
                  
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
            </>
          )}
        </div>
      </div>

      {/* Owner Detail Modal */}
      {selectedOwnerDetail && (
        <div className="modal-backdrop-custom d-flex align-items-center justify-content-center p-3">
          <div className="modal-box-custom premium-card p-5 animate-fade-in text-start position-relative">
            <button className="btn-close position-absolute top-0 end-0 m-3" onClick={() => setSelectedOwnerDetail(null)}></button>
            <h4 className="font-display mb-4 text-accent">Owner Profile Details</h4>
            <div className="row g-3">
              <div className="col-12">
                <p className="mb-2"><strong>Name:</strong> {selectedOwnerDetail.name}</p>
                <p className="mb-2"><strong>Email:</strong> {selectedOwnerDetail.email}</p>
                <p className="mb-2"><strong>Phone:</strong> {selectedOwnerDetail.phone}</p>
                <p className="mb-2"><strong>Approval Status:</strong> {selectedOwnerDetail.isApprovedOwner ? 'Approved' : 'Pending'}</p>
              </div>
            </div>
            <div className="mt-4 d-flex gap-2 justify-content-end">
              <button 
                className={`btn btn-sm ${selectedOwnerDetail.isApprovedOwner ? 'btn-outline-warning' : 'btn-success text-white'}`}
                onClick={() => {
                  handleToggleOwnerApproval(selectedOwnerDetail._id, selectedOwnerDetail.isApprovedOwner);
                  setSelectedOwnerDetail(null);
                }}
              >
                {selectedOwnerDetail.isApprovedOwner ? 'Set Pending' : 'Approve Owner'}
              </button>
              <button className="btn btn-sm btn-secondary" onClick={() => setSelectedOwnerDetail(null)}>Close</button>
            </div>
          </div>
        </div>
      )}


    </div>
  );
};

export default AdminDashboard;
