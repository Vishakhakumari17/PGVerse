import React, { useState, useContext } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { signInAdminWithFirebase } from '../../utils/firebase';
import './Login.css';

const Login = () => {
  const { login, firebaseAdminLogin } = useContext(AuthContext);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState('student'); // 'student', 'owner', 'admin'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (role === 'admin') {
        try {
          // Log in admin via real Firebase Auth provider
          const firebaseUser = await signInAdminWithFirebase(email, password);
          await firebaseAdminLogin(firebaseUser.email, firebaseUser.name, firebaseUser.uid);
          navigate('/admin-dashboard');
        } catch (firebaseErr) {
          console.warn('Firebase Auth network error, attempting local database Admin login fallback...', firebaseErr.message);
          // Fall back to standard local DB admin login
          const res = await login(email, password);
          if (res.user.role === 'admin') {
            navigate('/admin-dashboard');
          } else {
            throw new Error('Unauthorized: This email is not registered as an Admin in the database.');
          }
        }
      } else {
        // Standard Student/Owner database login
        const res = await login(email, password);
        
        // Route to appropriate dashboards
        if (res.user.role === 'admin') {
          navigate('/admin-dashboard');
        } else if (res.user.role === 'owner') {
          navigate('/owner-dashboard');
        } else {
          // If came from booking page, redirect back there
          const redirect = searchParams.get('redirect');
          if (redirect) {
            navigate(redirect);
          } else {
            navigate('/');
          }
        }
      }
    } catch (err) {
      setError(err.message || 'Login failed. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-5 page-container d-flex align-items-center justify-content-center">
      <div className="login-box glass-card p-5 animate-fade-in">
        <div className="text-center mb-4">
          <span className="brand-logo-large">⚡</span>
          <h2 className="font-display mt-2">Welcome Back</h2>
          <p className="text-muted small">Please sign in to continue on PGVerse</p>
        </div>

        {error && <div className="alert alert-danger py-2 small">{error}</div>}

        <div className="role-tabs d-flex gap-1 mb-4 p-1 premium-role-tabs rounded-pill">
          {['student', 'owner', 'admin'].map((r) => (
            <button
              key={r}
              type="button"
              className={`btn btn-sm rounded-pill flex-grow-1 text-capitalize ${role === r ? 'active-tab text-white' : 'text-muted'}`}
              onClick={() => {
                setRole(r);
                setError('');
              }}
              style={{ transition: 'all 0.2s ease', border: 'none' }}
            >
              {r}
            </button>
          ))}
        </div>

        {role === 'admin' && (
          <div className="alert alert-info py-2 small mb-4 text-start">
            💡 Admin Login is securely connected to the Firebase API. Please sign in with your Firebase Admin account credentials.
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Email Input */}
          <div className="mb-3 text-start">
            <label className="form-label small font-display text-muted">Email Address</label>
            <div className="input-group-premium d-flex align-items-center border rounded px-3 py-2">
              <i className="bi bi-envelope me-2 text-muted"></i>
              <input
                type="email"
                className="input-blank flex-grow-1"
                placeholder="name@domain.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Password Input */}
          <div className="mb-4 text-start">
            <div className="d-flex justify-content-between">
              <label className="form-label small font-display text-muted">Password</label>
              <Link to="/forgot-password" className="small text-primary text-decoration-none">
                Forgot?
              </Link>
            </div>
            <div className="input-group-premium d-flex align-items-center border rounded px-3 py-2">
              <i className="bi bi-lock me-2 text-muted"></i>
              <input
                type={showPassword ? "text" : "password"}
                className="input-blank flex-grow-1"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                className="btn-icon p-0 border-0 bg-transparent text-muted ms-2"
                onClick={() => setShowPassword(!showPassword)}
                style={{ outline: 'none', boxShadow: 'none' }}
              >
                <i className={`bi ${showPassword ? 'bi-eye-slash-fill' : 'bi-eye-fill'} fs-6`}></i>
              </button>
            </div>
          </div>

          <button type="submit" className="btn btn-premium-primary w-100 py-2.5" disabled={loading}>
            {loading ? 'Authenticating...' : `Sign In as ${role.charAt(0).toUpperCase() + role.slice(1)}`}
          </button>
        </form>

        {role !== 'admin' && (
          <div className="text-center mt-4">
            <span className="small text-muted">Don't have an account? </span>
            <Link to="/register" className="small text-primary text-decoration-none fw-bold">
              Sign Up
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default Login;
