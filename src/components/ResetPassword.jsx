import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Search, AlertCircle, CheckCircle } from 'lucide-react';

const ResetPassword = () => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });
  const navigate = useNavigate();
  const location = useLocation();

  // Get token from URL
  const token = new URLSearchParams(location.search).get('token');

  const validateForm = () => {
    if (!newPassword || !confirmPassword) {
      setMessage({ text: 'Please fill in all fields.', type: 'error' });
      return false;
    }
    if (newPassword !== confirmPassword) {
      setMessage({ text: 'Passwords do not match.', type: 'error' });
      return false;
    }
    if (newPassword.length < 6) {
      setMessage({ text: 'Password must be at least 6 characters long.', type: 'error' });
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    setMessage({ text: '', type: '' });

    try {
      const response = await fetch('http://localhost:3001/api/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token,
          newPassword
        })
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({ text: 'Password reset successful! Redirecting to login...', type: 'success' });
        setTimeout(() => navigate('/login'), 2000);
      } else {
        setMessage({ text: data.error || 'Failed to reset password.', type: 'error' });
      }
    } catch (error) {
      setMessage({ text: 'Network error. Please try again.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="header">
        <div className="header-content">
          <button 
            onClick={() => navigate('/')}
            className="logo"
          >
            Trade Talent
          </button>
          
          <div className="search-container">
            <Search className="search-icon" />
            <input
              type="text"
              placeholder="Search for services..."
              className="search-input"
            />
          </div>
          
          <div className="nav-buttons">
            <button 
              onClick={() => navigate('/login')}
              className="nav-button"
            >
              Login
            </button>
            <button 
              onClick={() => navigate('/signup')}
              className="nav-button"
            >
              Sign Up
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="form-container">
        <div className="form-card">
          <h2 className="form-title">Reset Your Password</h2>

          {message.text && (
            <div className={`message-container ${message.type}`}>
              {message.type === 'error' ? (
                <AlertCircle className="message-icon" />
              ) : (
                <CheckCircle className="message-icon" />
              )}
              <p>{message.text}</p>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="new-password" className="form-label">
                New Password
              </label>
              <input
                type="password"
                id="new-password"
                value={newPassword}
                onChange={(e) => {
                  setNewPassword(e.target.value);
                  setMessage({ text: '', type: '' });
                }}
                placeholder="Enter your new password"
                className={`form-input ${message.type === 'error' ? 'input-error' : ''}`}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="confirm-password" className="form-label">
                Confirm Password
              </label>
              <input
                type="password"
                id="confirm-password"
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  setMessage({ text: '', type: '' });
                }}
                placeholder="Confirm your new password"
                className={`form-input ${message.type === 'error' ? 'input-error' : ''}`}
                required
              />
            </div>

            <button
              type="submit"
              className="btn-primary"
              disabled={loading}
            >
              {loading ? (
                <span className="loading-content">
                  <span className="loading-spinner"></span>
                  Resetting...
                </span>
              ) : (
                'Reset Password'
              )}
            </button>

            <div className="text-center mt-4">
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  navigate('/login');
                }}
                className="text-sm text-gray-600 hover:text-blue-600 transition-colors duration-300 border-b border-gray-400 hover:border-blue-600"
              >
                Back to Login
              </a>
            </div>
          </form>
        </div>
      </div>

      {/* Footer */}
      <footer className="footer">
        <p className="footer-text">© 2024 TradeTalent. All rights reserved.</p>
        <div className="footer-links">
          <a href="#" className="footer-link">Privacy Policy</a>
          <a href="#" className="footer-link">Terms of Service</a>
        </div>
      </footer>
    </div>
  );
};

export default ResetPassword; 