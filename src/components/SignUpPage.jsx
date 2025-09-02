// src/components/SignUpPage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, AlertCircle, CheckCircle } from 'lucide-react';

const SuccessMessage = ({ message }) => (
  <div className="message-container success" style={{ marginBottom: '2rem' }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
      <CheckCircle className="message-icon" size={24} />
      <div>
        <h3 style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>Registration Successful! 🎉</h3>
        <p>{message}</p>
      </div>
    </div>
  </div>
);

const SignUpPage = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });
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
    if (!formData.username || !formData.email || !formData.password || !formData.confirmPassword) {
      setMessage({ text: 'Please fill in all fields', type: 'error' });
      return false;
    }
    if (!formData.email.includes('@')) {
      setMessage({ text: 'Please enter a valid email address', type: 'error' });
      return false;
    }
    if (formData.password.length < 6) {
      setMessage({ text: 'Password must be at least 6 characters long', type: 'error' });
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      setMessage({ text: 'Passwords do not match', type: 'error' });
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
      const res = await fetch('http://localhost:3001/api/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, role: 'user' })
      });

      const data = await res.json();

      if (res.ok) {
        setMessage({
          text: 'Your account has been created successfully! Please verify your email to continue.',
          type: 'success'
        });
        // Clear form after successful registration
        setFormData({
          username: '',
          email: '',
          password: '',
          confirmPassword: ''
        });
      } else {
        // Handle specific error cases
        switch (data.error) {
          case 'Email already registered.':
            setMessage({
              text: 'This email is already registered. Please use a different email or login.',
              type: 'error'
            });
            break;
          case 'Username already taken':
            setMessage({
              text: 'This username is already taken. Please choose a different username.',
              type: 'error'
            });
            break;
          default:
            setMessage({
              text: data.error || 'Registration failed. Please try again.',
              type: 'error'
            });
        }
      }
    } catch (err) {
      setMessage({
        text: 'Network error. Please check your connection and try again.',
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setMessage({ text: '', type: '' });
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
          <h2 className="form-title">Create Account</h2>
          
          <form onSubmit={handleSubmit}>
            {message.text && message.type === 'success' ? (
              <SuccessMessage message={message.text} />
            ) : message.text ? (
              <div className={`message-container ${message.type}`}>
                <AlertCircle className="message-icon" />
                <p>{message.text}</p>
              </div>
            ) : null}

            <div className="form-group">
              <label htmlFor="username" className="form-label">
                Username
              </label>
              <input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleChange}
                placeholder="Choose a username"
                className={`form-input ${message.type === 'error' ? 'input-error' : ''}`}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="email" className="form-label">
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
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
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Create a password"
                className={`form-input ${message.type === 'error' ? 'input-error' : ''}`}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword" className="form-label">
                Confirm Password
              </label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Confirm your password"
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
                  Creating Account...
                </span>
              ) : (
                'Sign up'
              )}
            </button>

            <div className="text-sm text-center mt-4">
              <a href="/login" className="font-medium text-indigo-600 hover:text-indigo-500">
                Already have an account? Sign in
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

export default SignUpPage;