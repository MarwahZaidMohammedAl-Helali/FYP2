// src/components/TradeTalentHomepage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Send, RefreshCw, ThumbsUp, Star, Heart, MapPin, Filter, Sparkles, X } from 'lucide-react';
import axios from 'axios';

const TradeTalentHomepage = () => {
  const navigate = useNavigate();
  const [sortBy, setSortBy] = useState('newest');
  const [currentPage, setCurrentPage] = useState(1);
  const [favorites, setFavorites] = useState(new Set());
  const [searchTerm, setSearchTerm] = useState('');
  const [isScrolled, setIsScrolled] = useState(false);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    hasNextPage: false,
    hasPrevPage: false
  });
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [favoritedServices, setFavoritedServices] = useState(new Set());

  const howToSteps = [
    {
      number: 1,
      title: "Browse Services",
      description: "Explore a wide range of services and find the perfect match for your needs",
      icon: <Search />,
      color: "#4a8fe1"
    },
    {
      number: 2,
      title: "Send a Request",
      description: "Send a request and negotiate terms directly with the service provider",
      icon: <Send />,
      color: "#6fa8f5"
    },
    {
      number: 3,
      title: "Complete Exchange",
      description: "Complete the exchange, gaining valuable experience and expanding your portfolio",
      icon: <RefreshCw />,
      color: "#4a8fe1"
    },
    {
      number: 4,
      title: "Give Feedback",
      description: "Rate your experience to help others make informed decisions and improve the platform",
      icon: <ThumbsUp />,
      color: "#6fa8f5"
    }
  ];

  // Handle scroll effect for header
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get('http://localhost:3001/api/categories');
        setCategories(response.data);
      } catch (err) {
        console.error('Error fetching categories:', err);
      }
    };
    fetchCategories();
  }, []);

  // Check authentication status
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await axios.get('http://localhost:3001/api/check-session', { withCredentials: true });
        setIsAuthenticated(response.data.authenticated);
        if (response.data.authenticated) {
          // Fetch user's favorited services
          const favoritesResponse = await axios.get('http://localhost:3001/api/favorites', { withCredentials: true });
          const favoriteIds = new Set(favoritesResponse.data.map(fav => fav.id));
          setFavoritedServices(favoriteIds);
        }
      } catch (error) {
        console.error('Error checking authentication:', error);
        setIsAuthenticated(false);
      }
    };
    checkAuth();
  }, []);

  // Fetch services
  useEffect(() => {
    const fetchServices = async () => {
      try {
        setLoading(true);
        const response = await axios.get('http://localhost:3001/api/services', {
          params: {
            page: currentPage,
            sortBy,
            category: selectedCategory,
            limit: 6
          }
        });
        setServices(response.data.services || []); // Ensure we always have an array
        setPagination(response.data.pagination);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching services:', err);
        setError('Failed to load services. Please try again later.');
        setLoading(false);
        setServices([]); // Set empty array on error
        setPagination({  // Reset pagination state on error
          currentPage: 1,
          totalPages: 1,
          totalItems: 0,
          hasNextPage: false,
          hasPrevPage: false
        });
      }
    };

    fetchServices();
  }, [currentPage, sortBy, selectedCategory]);

  const handleSortChange = (e) => {
    setSortBy(e.target.value.toLowerCase().replace(/\s+/g, '-'));
    setCurrentPage(1); // Reset to first page when sorting changes
  };

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
    setCurrentPage(1); // Reset to first page when category changes
    setShowFilters(false);
  };

  const toggleFavorite = async (serviceId) => {
    if (!isAuthenticated) {
      // Store the service ID in localStorage before redirecting
      localStorage.setItem('pendingFavorite', serviceId);
      navigate('/login');
      return;
    }

    try {
      if (favoritedServices.has(serviceId)) {
        // Remove from favorites
        await axios.delete(`http://localhost:3001/api/favorites/${serviceId}`, { withCredentials: true });
        setFavoritedServices(prev => {
          const newSet = new Set(prev);
          newSet.delete(serviceId);
          return newSet;
        });
    } else {
        // Add to favorites
        await axios.post('http://localhost:3001/api/favorites', { serviceId }, { withCredentials: true });
        setFavoritedServices(prev => new Set([...prev, serviceId]));
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };

  const handleOfferService = (service) => {
    console.log(`Offering service for: ${service.title}`);
  };

  const filteredServices = services ? services.filter(service =>
    service.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    service.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    service.offer.toLowerCase().includes(searchTerm.toLowerCase()) ||
    service.seek.toLowerCase().includes(searchTerm.toLowerCase())
  ) : [];

  // Generate page numbers for pagination
  const pageNumbers = [];
  const maxVisiblePages = 5;
  const totalPages = pagination?.totalPages || 1; // Add safety check with default value
  let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
  let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

  if (endPage - startPage + 1 < maxVisiblePages) {
    startPage = Math.max(1, endPage - maxVisiblePages + 1);
  }

  for (let i = startPage; i <= endPage; i++) {
    pageNumbers.push(i);
  }

  return (
    <div className="min-h-screen">
      {/* Enhanced Header */}
      <header className={`header ${isScrolled ? 'header-scrolled' : ''}`}>
        <div className="header-content">
          <button 
            onClick={() => navigate('/')}
            className="logo"
          >
            <Sparkles size={20} style={{ marginRight: '0.5rem', display: 'inline' }} />
            Trade Talent
          </button>
          
          <div className="search-container">
            <Search className="search-icon" />
            <input
              type="text"
              placeholder="Search for services..."
              className="search-input"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
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
      <div className="main-content">
        <div className="content-wrapper">
          {/* Enhanced Welcome Section */}
          <div className="hero-section">
            <h1 className="hero-title">
              Welcome to TradeTalent
              <Sparkles size={32} style={{ marginLeft: '1rem', display: 'inline' }} />
            </h1>
            <p style={{ 
              fontSize: '1.1rem', 
              marginTop: '1rem', 
              opacity: '0.9',
              maxWidth: '600px',
              margin: '1rem auto 0'
            }}>
              Exchange your skills with professionals worldwide and grow your network
            </p>
          </div>

          {/* Enhanced How to Use Section */}
          <section className="how-to-section">
            <h2 className="section-title">How to Use TradeTalent</h2>
            <p className="section-description">
              TradeTalent allows you to exchange services and professional skills in a seamless, secure, and 
              mutually beneficial way. Follow these simple steps to get started.
            </p>
            
            <div className="steps-grid">
              {howToSteps.map((step) => (
                <div key={step.number} className="step-card">
                  <div className="step-icon">
                    {step.icon}
                  </div>
                  <h3 className="step-title">{step.number}. {step.title}</h3>
                  <p className="step-description">{step.description}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Enhanced Services Section */}
          <section className="services-section">
            <div className="services-header">
              <div className="sort-container">
                <span className="sort-label">Sort by:</span>
                <select 
                  value={sortBy.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  onChange={handleSortChange}
                  className="sort-select"
                >
                  <option value="Rating">Rating</option>
                  <option value="Newest">Newest</option>
                  <option value="Most Popular">Most Popular</option>
                  <option value="Trending">Trending</option>
                </select>
              </div>
              <button 
                className="filters-button"
                onClick={() => setShowFilters(!showFilters)}
              >
                <Filter size={14} />
                FILTERS
                {selectedCategory && (
                <span style={{ 
                  marginLeft: '0.5rem', 
                  background: 'rgba(255,255,255,0.2)', 
                  borderRadius: '50%', 
                  width: '20px', 
                  height: '20px', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  fontSize: '0.75rem' 
                }}>
                    1
                </span>
                )}
              </button>
            </div>

            {/* Filters Panel */}
            {showFilters && (
              <div className="filters-panel">
                <div className="filters-header">
                  <h3>Categories</h3>
                  <button onClick={() => setShowFilters(false)}>
                    <X size={20} />
                  </button>
                </div>
                <div className="categories-list">
                  <button
                    className={`category-button ${!selectedCategory ? 'active' : ''}`}
                    onClick={() => handleCategoryChange('')}
                  >
                    All Categories
                  </button>
                  {categories.map((category) => (
                    <button
                      key={category}
                      className={`category-button ${selectedCategory === category ? 'active' : ''}`}
                      onClick={() => handleCategoryChange(category)}
                    >
                      {category}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {loading ? (
              <div className="loading-message">Loading services...</div>
            ) : error ? (
              <div className="error-message">{error}</div>
            ) : (
              <>
            <div className="services-grid">
              {filteredServices.map((service) => (
                <div key={service.id} className="service-card">
                      {service.image_url && (
                        <img 
                          src={service.image_url} 
                          alt={service.title} 
                          className="service-image"
                        />
                      )}
                      <div className="service-content">
                  <div className="service-header">
                          <div>
                    <h3 className="service-title">{service.title}</h3>
                          </div>
                          <span className="service-badge">
                            {service.category}
                    </span>
                  </div>
                  
                  <p className="service-description">{service.description}</p>
                  
                  <div className="service-details">
                          <div className="detail-item">
                      <span className="detail-label">Offering:</span>
                            <span className="detail-value">{service.offer}</span>
                    </div>
                          <div className="detail-item">
                      <span className="detail-label">Seeking:</span>
                            <span className="detail-value">{service.seek}</span>
                    </div>
                  </div>

                  <div className="service-meta">
                    <div className="rating-container">
                      <div className="stars">
                        {[...Array(5)].map((_, i) => (
                          <Star 
                            key={i} 
                                  size={16}
                                  className={`star ${i < Math.floor(service.rating || 0) ? '' : 'star-empty'}`}
                          />
                        ))}
                      </div>
                            <span>({service.reviews_count || 0})</span>
                    </div>
                          <div className="location">
                            <MapPin size={16} />
                            {service.location || 'Remote'}
                    </div>
                  </div>

                  <div className="service-footer">
                          <div className="provider-info">
                            {service.provider_image ? (
                              <img 
                                src={service.provider_image} 
                                alt={service.provider_name} 
                                className="provider-avatar"
                              />
                            ) : (
                              <div className="provider-avatar-placeholder">
                                {service.provider_name?.charAt(0)?.toUpperCase()}
                              </div>
                            )}
                            <span className="provider-name">{service.provider_name}</span>
                    </div>
                    <div className="action-buttons">
                      <button 
                              className={`icon-button ${favoritedServices.has(service.id) ? 'favorited' : ''}`}
                        onClick={() => toggleFavorite(service.id)}
                              title={favoritedServices.has(service.id) ? 'Remove from favorites' : 'Add to favorites'}
                      >
                              <Heart 
                                size={20}
                                fill={favoritedServices.has(service.id) ? 'currentColor' : 'none'} 
                              />
                      </button>
                      <button 
                        className="offer-button"
                        onClick={() => handleOfferService(service)}
                      >
                        OFFER SERVICE
                      </button>
                          </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Enhanced Pagination */}
                {pagination.totalPages > 1 && (
            <div className="pagination">
              <button 
                      onClick={() => handlePageChange(currentPage - 1)}
                className="pagination-button"
                      disabled={!pagination.hasPrevPage}
              >
                ‹
              </button>
                    {pageNumbers.map((number) => (
                <button
                        key={number}
                        onClick={() => handlePageChange(number)}
                        className={`pagination-button ${currentPage === number ? 'active' : ''}`}
                >
                        {number}
                </button>
              ))}
              <button 
                      onClick={() => handlePageChange(currentPage + 1)}
                className="pagination-button"
                      disabled={!pagination.hasNextPage}
              >
                ›
              </button>
            </div>
                )}

            {/* Results Summary */}
            <div style={{
              textAlign: 'center',
              marginTop: '2rem',
              color: '#64748b',
              fontSize: '0.875rem'
            }}>
                  Showing {filteredServices.length} of {pagination.totalItems} services
              {searchTerm && (
                <span style={{ fontWeight: '600', color: '#4a8fe1' }}>
                  {' '}for "{searchTerm}"
                </span>
              )}
                  {selectedCategory && (
                    <span style={{ fontWeight: '600', color: '#4a8fe1' }}>
                      {' '}in {selectedCategory}
                </span>
              )}
            </div>
              </>
            )}
          </section>
        </div>
      </div>

      {/* Add these styles */}
      <style>{`
        .service-card {
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 0.75rem;
          overflow: hidden;
          transition: all 0.3s ease;
        }
        .service-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        .service-image {
          width: 100%;
          height: 200px;
          object-fit: cover;
          background-color: #f7fafc;
        }
        .service-content {
          padding: 1.5rem;
        }
        .service-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 1rem;
        }
        .service-title {
          font-size: 1.125rem;
          font-weight: 600;
          color: #2d3748;
          margin: 0;
        }
        .service-badge {
          padding: 0.25rem 0.75rem;
          border-radius: 9999px;
          font-size: 0.75rem;
          font-weight: 500;
          background: #ebf8ff;
          color: #4299e1;
        }
        .service-description {
          color: #4a5568;
          font-size: 0.875rem;
          margin-bottom: 1rem;
          line-height: 1.5;
        }
        .service-details {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          margin-bottom: 1rem;
          padding: 1rem;
          background-color: #f8fafc;
          border-radius: 0.5rem;
        }
        .detail-item {
          display: flex;
          justify-content: space-between;
          font-size: 0.875rem;
        }
        .detail-label {
          color: #64748b;
        }
        .detail-value {
          color: #1e293b;
          font-weight: 500;
        }
        .service-meta {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: 1rem;
          padding-top: 1rem;
          border-top: 1px solid #e2e8f0;
        }
        .rating-container {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        .stars {
          display: flex;
          gap: 0.25rem;
        }
        .star {
          color: #f6ad55;
        }
        .star-empty {
          color: #e2e8f0;
        }
        .location {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: #718096;
          font-size: 0.875rem;
        }
        .service-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: 1rem;
          padding-top: 1rem;
          border-top: 1px solid #e2e8f0;
        }
        .provider-info {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }
        .provider-avatar {
          width: 2.5rem;
          height: 2.5rem;
          border-radius: 9999px;
          object-fit: cover;
        }
        .provider-avatar-placeholder {
          width: 2.5rem;
          height: 2.5rem;
          border-radius: 9999px;
          background-color: #e2e8f0;
          color: #64748b;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 600;
          font-size: 1rem;
        }
        .provider-name {
          font-size: 0.875rem;
          color: #4a5568;
          font-weight: 500;
        }
        .action-buttons {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }
        .icon-button {
          padding: 0.5rem;
          border: none;
          background: none;
          color: #718096;
          cursor: pointer;
          border-radius: 9999px;
          transition: all 0.2s ease;
        }
        .icon-button:hover {
          background: #f7fafc;
        }
        .icon-button.favorited {
          color: #ef4444;
          background: rgba(239, 68, 68, 0.1);
        }
        .offer-button {
          padding: 0.5rem 1rem;
          border: none;
          background: #4299e1;
          color: white;
          font-size: 0.875rem;
          font-weight: 500;
          border-radius: 0.375rem;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .offer-button:hover {
          background: #3182ce;
        }
      `}</style>
    </div>
  );
};

export default TradeTalentHomepage;