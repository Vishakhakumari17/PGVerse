import React, { useState, useContext } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import api from '../../services/api';
import { AuthContext } from '../../context/AuthContext';

function ResetPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const email = searchParams.get('email');
  const navigate = useNavigate();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const { showToast } = useContext(AuthContext);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      showToast('Passwords do not match', 'error');
      return;
    }
    if (password.length < 6) {
      showToast('Password must be at least 6 characters long', 'error');
      return;
    }

    setLoading(true);
    try {
      const res = await api.post('/auth/reset-password', {
        token,
        email,
        password
      });
      if (res.data.success) {
        showToast('Password reset successful!', 'success');
        setSuccess(true);
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to reset password', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-fluid d-flex align-items-center justify-content-center py-5 min-vh-80">
      <div className="card login-box p-5 animate-fade-in text-center shadow-lg border">
        {/* Brand Icon */}
        <div className="mb-4">
          <span className="fs-1">🔑</span>
        </div>

        <h3 className="font-display mb-2 fw-bold text-white">Renew Password</h3>
        
        {!token || !email ? (
          <div className="alert alert-danger text-start py-3 small mb-4">
            ⚠️ Invalid or missing password reset link. Please request a new password reset link from the login page.
          </div>
        ) : success ? (
          <div>
            <div className="alert alert-success text-start py-3 small mb-4">
              🎉 Your password has been reset successfully! You can now log in using your new credentials.
            </div>
            <button className="btn btn-premium-primary w-100 py-2.5 font-display" onClick={() => navigate('/login')}>
              Go to Sign In
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <p className="text-muted small mb-4">Enter a strong, secure new password for your account.</p>

            {/* New Password */}
            <div className="mb-3 text-start">
              <label className="form-label small font-display text-muted">New Password</label>
              <div className="input-group-premium d-flex align-items-center border rounded px-3 py-2 position-relative">
                <i className="bi bi-lock me-2 text-muted"></i>
                <input
                  type={showPassword ? "text" : "password"}
                  className="input-blank flex-grow-1 text-white bg-transparent border-0 pe-5"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{ outline: 'none' }}
                  required
                />
                <button
                  type="button"
                  className="btn position-absolute end-0 top-50 translate-middle-y border-0 bg-transparent text-muted"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{ zIndex: 10, outline: 'none', boxShadow: 'none' }}
                >
                  <i className={`bi bi-eye${showPassword ? '-slash' : ''}`}></i>
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div className="mb-4 text-start">
              <label className="form-label small font-display text-muted">Confirm Password</label>
              <div className="input-group-premium d-flex align-items-center border rounded px-3 py-2 position-relative">
                <i className="bi bi-lock me-2 text-muted"></i>
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  className="input-blank flex-grow-1 text-white bg-transparent border-0 pe-5"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  style={{ outline: 'none' }}
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

            <button type="submit" className="btn btn-premium-primary w-100 py-2.5 font-display" disabled={loading}>
              {loading ? 'Resetting password...' : 'Renew Password'}
            </button>
          </form>
        )}

        <div className="mt-4 text-center small">
          <Link to="/login" className="text-accent text-decoration-none fw-semibold">
            ← Cancel and Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}

export default ResetPassword;
