import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import './Register.css';

const Register = () => {
  const { register } = useContext(AuthContext);
  const navigate = useNavigate();

  // Registration states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState('student'); // 'student', 'owner'
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await register(name, email, password, role, phone);
      setSuccessMsg('Registration successful! Redirecting...');
      
      // Auto redirect to appropriate dashboard immediately
      setTimeout(() => {
        if (res.user.role === 'owner') {
          navigate('/owner-dashboard');
        } else {
          navigate('/');
        }
      }, 1000);
    } catch (err) {
      setError(err.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-5 page-container d-flex align-items-center justify-content-center">
      <div className="register-box glass-card p-5 animate-fade-in">
        <div className="text-center mb-4">
          <span className="brand-logo-large">⚡</span>
          <h2 className="font-display mt-2">Create Account</h2>
          <p className="text-muted small">Join PGVerse to search, book or list PG hostels</p>
        </div>

        {error && <div className="alert alert-danger py-2 small">{error}</div>}
        {successMsg && <div className="alert alert-success py-2 small">{successMsg}</div>}

        <form onSubmit={handleRegisterSubmit}>
          {/* Role Switcher */}
          <div className="role-tabs d-flex gap-1 mb-4 p-1 premium-role-tabs rounded-pill">
            {['student', 'owner'].map((r) => (
              <button
                key={r}
                type="button"
                className={`btn btn-sm rounded-pill flex-grow-1 text-capitalize ${role === r ? 'active-tab text-white' : 'text-muted'}`}
                onClick={() => setRole(r)}
                style={{ transition: 'all 0.2s ease', border: 'none' }}
              >
                I'm a {r}
              </button>
            ))}
          </div>

          {/* Name Input */}
          <div className="mb-3 text-start">
            <label className="form-label small font-display text-muted">Full Name</label>
            <div className="input-group-premium d-flex align-items-center border rounded px-3 py-2">
              <i className="bi bi-person me-2 text-muted"></i>
              <input
                type="text"
                className="input-blank flex-grow-1"
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
          </div>

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

          {/* Phone Input */}
          <div className="mb-3 text-start">
            <label className="form-label small font-display text-muted">Phone Number</label>
            <div className="input-group-premium d-flex align-items-center border rounded px-3 py-2">
              <i className="bi bi-telephone me-2 text-muted"></i>
              <input
                type="tel"
                className="input-blank flex-grow-1"
                placeholder="+91 XXXXX XXXXX"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Password Input */}
          <div className="mb-4 text-start">
            <label className="form-label small font-display text-muted">Password</label>
            <div className="input-group-premium d-flex align-items-center border rounded px-3 py-2">
              <i className="bi bi-lock me-2 text-muted"></i>
              <input
                type={showPassword ? "text" : "password"}
                className="input-blank flex-grow-1"
                placeholder="Min 6 characters"
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
            {loading ? 'Processing...' : 'Register Now'}
          </button>
        </form>

        <div className="text-center mt-4">
          <span className="small text-muted">Already have an account? </span>
          <Link to="/login" className="small text-primary text-decoration-none fw-bold">
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
