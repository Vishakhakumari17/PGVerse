import React, { useState, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import Loader from '../../components/Loader/Loader';
import './Profile.css';

const Profile = () => {
  const { user, updateProfile } = useContext(AuthContext);

  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [profilePicture, setProfilePicture] = useState(user?.profilePicture || '');

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const handleUpdate = async (e) => {
    e.preventDefault();
    setSuccess('');
    setError('');
    setLoading(true);

    try {
      await updateProfile({ name, phone, profilePicture });
      setSuccess('Profile updated successfully!');
    } catch (err) {
      setError(err.message || 'Update failed');
    } finally {
      setLoading(false);
    }
  };

  if (!user) return <Loader fullPage={true} />;

  return (
    <div className="container py-5 page-container d-flex align-items-center justify-content-center">
      <div className="profile-card glass-card p-5 animate-fade-in text-start">
        <div className="text-center mb-4">
          <div className="profile-large-avatar rounded-circle d-flex align-items-center justify-content-center text-uppercase mx-auto mb-3">
            {profilePicture ? (
              <img src={profilePicture} alt={name} className="w-100 h-100 rounded-circle object-cover" />
            ) : (
              name.charAt(0)
            )}
          </div>
          <h3 className="font-display mb-1">{user.name}</h3>
          <span className="badge bg-indigo-light text-primary text-uppercase small px-2.5 py-1.5">{user.role} Profile</span>
        </div>

        {success && <div className="alert alert-success py-2 small">{success}</div>}
        {error && <div className="alert alert-danger py-2 small">{error}</div>}

        <form onSubmit={handleUpdate}>
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
              value={user.email}
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

          <button type="submit" className="btn btn-premium-primary w-100 py-2.5" disabled={loading}>
            {loading ? 'Saving Changes...' : 'Update Account'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Profile;
