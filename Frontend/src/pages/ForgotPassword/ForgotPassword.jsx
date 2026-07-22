import React, { useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { AuthContext } from '../../context/AuthContext';

function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const { showToast } = useContext(AuthContext);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    try {
      const res = await api.post('/auth/forgot-password', { email });
      if (res.data.success) {
        showToast('Password reset link sent to your email!', 'success');
        setMessage('A password reset link has been sent to your email address. Please check your inbox (or spam folder) and click the link to renew your password.');
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to send reset link', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-fluid d-flex align-items-center justify-content-center py-5 min-vh-80">
      <div className="card login-box p-5 animate-fade-in text-center shadow-lg border">
        {/* Brand Icon */}
        <div className="mb-4">
          <span className="fs-1">⚡</span>
        </div>
        
        <h3 className="font-display mb-2 fw-bold text-white">Forgot Password</h3>
        <p className="text-muted small mb-4">Enter your email address to receive a secure password reset link.</p>

        {message ? (
          <div className="alert alert-success text-start py-3 small mb-4">
            💡 {message}
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="mb-4 text-start">
              <label className="form-label small font-display text-muted">Email Address</label>
              <div className="input-group-premium d-flex align-items-center border rounded px-3 py-2">
                <i className="bi bi-envelope me-2 text-muted"></i>
                <input
                  type="email"
                  className="input-blank flex-grow-1 text-white bg-transparent border-0"
                  placeholder="name@domain.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{ outline: 'none' }}
                  required
                />
              </div>
            </div>

            <button type="submit" className="btn btn-premium-primary w-100 py-2.5 font-display" disabled={loading}>
              {loading ? 'Sending link...' : 'Send Reset Link'}
            </button>
          </form>
        )}

        <div className="mt-4 text-center small">
          <Link to="/login" className="text-accent text-decoration-none fw-semibold">
            ← Back to Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}

export default ForgotPassword;
