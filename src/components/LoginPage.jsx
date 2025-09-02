// src/components/LoginPage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, AlertCircle, CheckCircle } from 'lucide-react';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const navigate = useNavigate();

  // Check if user is already logged in
  useEffect(() => {
    const checkSession = async () => {
      try {
        const response = await fetch('http://localhost:3001/api/check-session', {
          credentials: 'include'
        });
        
        if (response.ok) {
          const data = await response.json();
          if (data.authenticated) {
            const dashboardPath = data.user.role === 'admin' ? '/admin-dashboard' : '/user-dashboard';
            navigate(dashboardPath);
          }
        }
      } catch (error) {
        console.error('Session check failed:', error);
      }
    };

    checkSession();
  }, [navigate]);

  const validateForm = () => {
    if (!email || !password) {
      setMessage({ text: 'Please fill in all fields.', type: 'error' });
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
      const res = await fetch('http://localhost:3001/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password })
      });
      
      const data = await res.json();
      
      if (res.ok) {
        setMessage({ text: data.message || 'Login successful!', type: 'success' });
        if (data.user) {
          localStorage.setItem('user', JSON.stringify({
            username: data.user.username,
            email: data.user.email,
            role: data.user.role
          }));
          
          setTimeout(() => {
            const dashboardPath = data.user.role === 'admin' ? '/admin-dashboard' : '/user-dashboard';
            navigate(dashboardPath);
          }, 1000);
        }
      } else {
        setMessage({ text: data.error || 'Login failed.', type: 'error' });
      }
    } catch (err) {
      setMessage({ text: 'Network error. Please try again.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    if (!resetEmail) {
      setMessage({ text: 'Please enter your email address.', type: 'error' });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('http://localhost:3001/api/request-password-reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: resetEmail })
      });

      const data = await response.json();
      
      if (response.ok) {
        setMessage({ 
          text: 'Password reset link has been sent to your email!', 
          type: 'success' 
        });
        setShowForgotPassword(false);
        setResetEmail('');
      } else {
        setMessage({ 
          text: data.error || 'Failed to send reset link. Please try again.', 
          type: 'error' 
        });
      }
    } catch (error) {
      setMessage({ 
        text: 'Network error. Please try again.', 
        type: 'error' 
      });
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
          <h2 className="form-title">
            {showForgotPassword ? 'Reset Password' : 'Sign in to your account'}
          </h2>
          
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

          {!showForgotPassword ? (
            // Login Form
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="email" className="form-label">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setMessage({ text: '', type: '' });
                  }}
                  placeholder="Enter your email"
                  className={`form-input ${message.type === 'error' ? 'input-error' : ''}`}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="password" className="form-label">
                  Password
                </label>
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setMessage({ text: '', type: '' });
                  }}
                  placeholder="Enter your password"
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
                    Signing in...
                  </span>
                ) : (
                  'Sign in'
                )}
              </button>

              <div className="text-center mt-4">
                <a
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    setShowForgotPassword(true);
                  }}
                  className="text-sm text-gray-600 hover:text-blue-600 transition-colors duration-300 border-b border-gray-400 hover:border-blue-600"
                >
                  Forgot your password?
                </a>
              </div>
            </form>
          ) : (
            // Forgot Password Form
            <form onSubmit={handleForgotPassword}>
              <div className="form-group">
                <label htmlFor="reset-email" className="form-label">
                  Email
                </label>
                <input
                  type="email"
                  id="reset-email"
                  value={resetEmail}
                  onChange={(e) => {
                    setResetEmail(e.target.value);
                    setMessage({ text: '', type: '' });
                  }}
                  placeholder="Enter your email"
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
                    Sending...
                  </span>
                ) : (
                  'Send Reset Link'
                )}
              </button>

              <div className="text-sm text-center mt-4">
                <a
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    setShowForgotPassword(false);
                    setMessage({ text: '', type: '' });
                  }}
                  className="text-sm text-gray-600 hover:text-blue-600 transition-colors duration-300 border-b border-gray-400 hover:border-blue-600"
                >
                  Back to Login
                </a>
              </div>
            </form>
          )}
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

export default LoginPage;