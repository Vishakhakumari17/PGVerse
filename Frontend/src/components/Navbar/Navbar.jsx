import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { ThemeContext } from '../../context/ThemeContext';
import './Navbar.css';

const Navbar = () => {
  const { user, logout, notifications, markNotificationsRead } = useContext(AuthContext);
  const { theme, toggleTheme } = useContext(ThemeContext);
  const navigate = useNavigate();

  const [visible, setVisible] = React.useState(true);
  const [prevScrollPos, setPrevScrollPos] = React.useState(0);

  React.useEffect(() => {
    const handleScroll = () => {
      const currentScrollPos = window.scrollY;
      
      if (currentScrollPos < 10) {
        setVisible(true);
      } else {
        setVisible(prevScrollPos > currentScrollPos);
      }
      setPrevScrollPos(currentScrollPos);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [prevScrollPos]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const getNotificationLink = (title) => {
    if (title === 'New PG Approval Required') return '/admin-dashboard?tab=subscriptions';
    if (title === 'New Owner Registration') return '/admin-dashboard?tab=owners';
    if (title === 'New Student Match Request' || title === 'Direct Student Contact Inquiry') return '/owner-dashboard?tab=matches';
    if (title === 'PG Listing Approved' || title === 'Owner Profile Approved') return '/owner-dashboard?tab=pgs';
    if (title === 'Owner Contact Details Shared' || title === 'Contact Request Rejected') return '/dashboard?tab=contacts';
    if (title === 'New Booking Request') return '/owner-dashboard?tab=requests';
    if (title === 'Booking Approved' || title === 'Booking Rejected') return '/dashboard?tab=bookings';
    if (title === 'New Subscription Payment Pending 💰') return '/admin-dashboard?tab=subscriptions';
    if (title === 'Subscription Activated 🚀') return '/owner-dashboard?tab=subscription';
    return '#';
  };

  const unreadNotificationsCount = notifications.filter(n => !n.read).length;

  return (
    <nav className={`navbar navbar-expand-lg sticky-top main-navbar py-3 ${visible ? '' : 'navbar-hidden'}`}>
      <div className="container">
        <Link className="navbar-brand d-flex align-items-center" to="/">
          <span className="brand-icon me-2">⚡</span>
          <span className="brand-text text-gradient font-display">PGVerse</span>
        </Link>

        {/* Right Action Icons (Always Visible on Mobile & Desktop) */}
        <div className="d-flex align-items-center gap-2 gap-md-3 order-lg-3 ms-auto me-2 me-lg-0">
          {/* Modern Theme Switcher */}
          <button
            className="btn btn-icon theme-toggle-btn"
            onClick={toggleTheme}
            aria-label="Toggle Theme"
            title={`Switch to ${theme === 'light' ? 'dark' : 'light'} theme`}
          >
            <i className={`bi ${theme === 'light' ? 'bi-moon-stars' : 'bi-sun'} fs-5`}></i>
          </button>

          {user ? (
            <>
              {/* Notifications Dropdown */}
              <div className="dropdown">
                <button
                  className="btn btn-icon position-relative dropdown-toggle no-caret"
                  type="button"
                  id="notificationDropdown"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                  onClick={markNotificationsRead}
                >
                  <i className="bi bi-bell fs-5"></i>
                  {unreadNotificationsCount > 0 && (
                    <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill notification-badge-pulse">
                      {unreadNotificationsCount}
                    </span>
                  )}
                </button>
                <ul className="dropdown-menu dropdown-menu-end notification-menu shadow border-0" aria-labelledby="notificationDropdown">
                  <li className="dropdown-header text-uppercase font-display">Notifications</li>
                  {notifications.length === 0 ? (
                    <li><span className="dropdown-item text-muted text-center py-3">No notifications yet</span></li>
                  ) : (
                    notifications.slice(0, 5).map((noti) => {
                      const isPendingSub = noti.title === 'New Subscription Payment Pending 💰';
                      return (
                        <li key={noti._id} className="border-bottom">
                          <Link 
                            to={getNotificationLink(noti.title)} 
                            className={`dropdown-item notification-item p-3 ${noti.read ? '' : 'unread'} ${isPendingSub ? 'border-start border-danger border-3 bg-danger-subtle' : ''} text-wrap`}
                            style={{ display: 'block', textDecoration: 'none', color: 'inherit' }}
                            onClick={() => {
                              const toggle = document.getElementById('notificationDropdown');
                              if (toggle && toggle.classList.contains('show')) {
                                toggle.click();
                              } else {
                                document.querySelectorAll('.dropdown-menu.show, .dropdown-toggle.show').forEach(el => {
                                  el.classList.remove('show');
                                });
                              }
                            }}
                          >
                            <h6 className={`mb-1 font-display fs-6 ${isPendingSub ? 'text-danger fw-bold' : ''}`}>{noti.title}</h6>
                            <p className="mb-0 text-muted small">{noti.message}</p>
                          </Link>
                        </li>
                      );
                    })
                  )}
                </ul>
              </div>

              {/* Role Specific Dashboard Buttons (hidden on extra small screens, visible on small and up) */}
              {user.role === 'student' && (
                <Link className="btn btn-premium-secondary py-2 px-3 border-0 btn-nav-dash d-none d-sm-inline-block" to="/dashboard">
                  Dashboard
                </Link>
              )}
              {user.role === 'owner' && (
                <Link className="btn btn-premium-secondary py-2 px-3 border-0 btn-nav-dash d-none d-sm-inline-block" to="/owner-dashboard">
                  Owner Panel
                </Link>
              )}
              {user.role === 'admin' && (
                <Link className="btn btn-premium-secondary py-2 px-3 border-0 btn-nav-dash d-none d-sm-inline-block" to="/admin-dashboard">
                  Admin Panel
                </Link>
              )}

              {/* Profile Dropdown */}
              <div className="dropdown">
                <button
                  className="btn btn-profile dropdown-toggle d-flex align-items-center gap-2 p-1 border-0"
                  type="button"
                  id="profileDropdown"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                >
                  {user.profilePicture ? (
                    <img
                      src={user.profilePicture}
                      alt={user.name}
                      className="rounded-circle profile-img"
                    />
                  ) : (
                    <div className="rounded-circle profile-avatar d-flex align-items-center justify-content-center text-uppercase">
                      {user.name.charAt(0)}
                    </div>
                  )}
                </button>
                <ul className="dropdown-menu dropdown-menu-end border-0 shadow-lg profile-dropdown" aria-labelledby="profileDropdown">
                  <li className="p-3 border-bottom">
                    <h6 className="mb-0 font-display">{user.name}</h6>
                    <small className="text-muted text-capitalize">{user.role}</small>
                  </li>
                  {/* Dashboard link for small mobile screens (since panel buttons are hidden for spacing) */}
                  <li className="d-block d-sm-none">
                    {user.role === 'student' && (
                      <Link className="dropdown-item" to="/dashboard">
                        <i className="bi bi-speedometer2 me-2"></i> Dashboard
                      </Link>
                    )}
                    {user.role === 'owner' && (
                      <Link className="dropdown-item" to="/owner-dashboard">
                        <i className="bi bi-speedometer2 me-2"></i> Owner Panel
                      </Link>
                    )}
                    {user.role === 'admin' && (
                      <Link className="dropdown-item" to="/admin-dashboard">
                        <i className="bi bi-speedometer2 me-2"></i> Admin Panel
                      </Link>
                    )}
                  </li>
                  <li>
                    <Link className="dropdown-item" to="/profile">
                      <i className="bi bi-person me-2"></i> My Profile
                    </Link>
                  </li>
                  {user.role === 'student' && (
                    <li>
                      <Link className="dropdown-item" to="/dashboard?tab=saved">
                        <i className="bi bi-bookmark me-2"></i> Saved PGs
                      </Link>
                    </li>
                  )}
                  <li><hr className="dropdown-divider" /></li>
                  <li>
                    <button className="dropdown-item text-danger" onClick={handleLogout}>
                      <i className="bi bi-box-arrow-right me-2"></i> Logout
                    </button>
                  </li>
                </ul>
              </div>
            </>
          ) : (
            <div className="d-flex align-items-center gap-2">
              <Link className="btn btn-link text-nav text-decoration-none px-2" to="/login">Login</Link>
              <Link className="btn btn-premium-primary py-1.5 px-3" to="/register">Register</Link>
            </div>
          )}
        </div>

        {/* Hamburger Toggler */}
        <button
          className="navbar-toggler border-0 order-lg-2"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
          aria-controls="navbarNav"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        {/* Collapsible Page Links */}
        <div className="collapse navbar-collapse order-lg-1" id="navbarNav">
          <ul className="navbar-nav me-auto mb-2 mb-lg-0 align-items-center">
            <li className="nav-item">
              <Link className="nav-link text-nav" to="/">Home</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link text-nav" to="/search">Search PGs</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link text-nav" to="/contact">Contact</Link>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
