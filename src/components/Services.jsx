import React, { useState, useEffect } from 'react';
import { Search, Filter, X, Star, MapPin, Heart } from 'lucide-react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Services = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [categories, setCategories] = useState([]);
  const [favoritedServices, setFavoritedServices] = useState(new Set());
  const [showOfferModal, setShowOfferModal] = useState(false);
  const [selectedService, setSelectedService] = useState(null);
  const [offerDetails, setOfferDetails] = useState('');
  const [proposedDeadline, setProposedDeadline] = useState('');
  const [wordCount, setWordCount] = useState(0);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const MAX_WORDS = 500;
  const [offerError, setOfferError] = useState('');

  const navigate = useNavigate();

  useEffect(() => {
    checkAuthentication();
  }, []);

  const checkAuthentication = async () => {
    try {
      const response = await axios.get('http://localhost:3001/api/check-session', {
        withCredentials: true
      });
      setIsAuthenticated(response.data.authenticated);
    } catch (error) {
      console.error('Error checking authentication:', error);
      setIsAuthenticated(false);
    }
  };

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

  // Fetch services and user's favorites
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [servicesRes, favoritesRes] = await Promise.all([
          axios.get('http://localhost:3001/api/services', {
            params: {
              sortBy,
              category: selectedCategory
            }
          }),
          axios.get('http://localhost:3001/api/favorites', { 
            withCredentials: true 
          })
        ]);

        setServices(servicesRes.data.services || []);
        const favoriteIds = new Set(favoritesRes.data.map(fav => fav.id));
        setFavoritedServices(favoriteIds);
        setError(null);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load services. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [sortBy, selectedCategory]);

  const toggleFavorite = async (serviceId) => {
    try {
      if (favoritedServices.has(serviceId)) {
        await axios.delete(`http://localhost:3001/api/favorites/${serviceId}`, { 
          withCredentials: true 
        });
        setFavoritedServices(prev => {
          const newSet = new Set(prev);
          newSet.delete(serviceId);
          return newSet;
        });
      } else {
        await axios.post('http://localhost:3001/api/favorites', { 
          serviceId 
        }, { 
          withCredentials: true 
        });
        setFavoritedServices(prev => new Set([...prev, serviceId]));
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };

  const handleSortChange = (e) => {
    setSortBy(e.target.value);
  };

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
    setShowFilters(false);
  };

  // Filter services based on search term
  const filteredServices = services.filter(service =>
    service.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    service.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    service.offer?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    service.seek?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleOfferService = (service) => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    setSelectedService(service);
    setShowOfferModal(true);
  };

  const handleSubmitOffer = async () => {
    if (!offerDetails.trim() || !proposedDeadline) {
      setOfferError('Please fill in all fields');
      return;
    }

    try {
      // First moderate the text
      const moderationResponse = await fetch('http://localhost:3001/api/moderate-text', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: offerDetails })
      });

      const result = await moderationResponse.json();

      if (result.status === 'rejected') {
        setOfferError(result.reason || 'Your offer contains inappropriate content. Please revise.');
        return;
      }

      // If text is appropriate, submit the offer to service_offers table
      const response = await axios.post('http://localhost:3001/api/service-offers', {
        service_id: selectedService.id,
        offer_details: offerDetails.trim(),
        proposed_deadline: proposedDeadline,
        status: 'PENDING' // Default status for new offers
      }, { 
        withCredentials: true, // This ensures the session cookie is sent
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (response.data.success) {
        // Reset and close modal on success
        setShowOfferModal(false);
        setOfferDetails('');
        setProposedDeadline('');
        setSelectedService(null);
        setOfferError('');
      } else {
        throw new Error(response.data.error || 'Failed to submit offer');
      }
    } catch (error) {
      console.error('Error submitting offer:', error);
      setOfferError(error.response?.data?.error || 'Failed to submit offer. Please try again.');
    }
  };

  const handleOfferDetailsChange = (e) => {
    const text = e.target.value;
    const words = text.trim().split(/\s+/);
    if (words.length <= MAX_WORDS) {
      setOfferDetails(text);
      setWordCount(words.length);
    }
  };

  return (
    <div className="services-container">
      <div className="services-header">
        <h2 className="services-title">Available Services</h2>
      </div>

      <div className="services-controls">
        <div className="search-container">
          <Search className="search-icon" size={16} />
          <input
            type="text"
            placeholder="Search services..."
            className="search-input"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <select
          className="sort-select"
          value={sortBy}
          onChange={handleSortChange}
        >
          <option value="newest">Newest</option>
          <option value="rating">Highest Rated</option>
          <option value="popular">Most Popular</option>
        </select>

        <button 
          className="filter-button"
          onClick={() => setShowFilters(true)}
        >
          <Filter size={16} />
          Filter
        </button>
      </div>

      {loading ? (
        <div className="loading">Loading services...</div>
      ) : error ? (
        <div className="error">{error}</div>
      ) : (
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
      )}

      {/* Filter Modal */}
      <div className="filter-modal">
        <div className="filter-header">
          <h3 className="filter-title">Filter by Category</h3>
          <button 
            className="close-button"
            onClick={() => setShowFilters(false)}
          >
            <X size={20} />
          </button>
        </div>
        <div className="category-list">
          <button
            className={`category-button ${!selectedCategory ? 'active' : ''}`}
            onClick={() => handleCategoryChange('')}
          >
            All Categories
          </button>
          {categories.map((category) => (
            <button
              key={category.id}
              className={`category-button ${selectedCategory === category.id ? 'active' : ''}`}
              onClick={() => handleCategoryChange(category.id)}
            >
              {category.name}
            </button>
          ))}
        </div>
      </div>

      {/* Offer Service Modal */}
      {showOfferModal && (
        <div className="modal-overlay">
          <div className="offer-modal">
            <div className="modal-header">
              <h3>Make an Offer</h3>
              <button 
                className="close-button"
                onClick={() => {
                  setShowOfferModal(false);
                  setOfferError('');
                }}
              >
                <X size={20} />
              </button>
            </div>

            <div className="modal-content">
              <div className="service-info">
                <h4>{selectedService?.title}</h4>
                <p>{selectedService?.description}</p>
              </div>

              <div className="form-group">
                <label>Proposed Deadline</label>
                <input
                  type="date"
                  value={proposedDeadline}
                  onChange={(e) => setProposedDeadline(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>

              <div className="form-group">
                <label>Your Offer Details</label>
                <textarea
                  value={offerDetails}
                  onChange={handleOfferDetailsChange}
                  placeholder="Describe what you can offer in detail..."
                  rows={5}
                />
                <div className="word-count">
                  {wordCount}/{MAX_WORDS} words
                </div>
              </div>

              {offerError && (
                <div className="error-message">
                  {offerError}
                </div>
              )}

              <button 
                className="submit-offer-btn"
                onClick={handleSubmitOffer}
              >
                Submit Offer
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .services-container {
          padding: 1.5rem;
          background: white;
          border-radius: 0.75rem;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
        }
        .services-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
        }
        .services-title {
          font-size: 1.5rem;
          font-weight: 600;
          color: #1a202c;
        }
        .services-controls {
          display: flex;
          gap: 1rem;
          margin-bottom: 1.5rem;
        }
        .search-container {
          flex: 1;
          position: relative;
        }
        .search-input {
          width: 100%;
          padding: 0.75rem 1rem 0.75rem 2.5rem;
          border: 1px solid #e2e8f0;
          border-radius: 0.5rem;
          font-size: 0.875rem;
        }
        .search-icon {
          position: absolute;
          left: 0.75rem;
          top: 50%;
          transform: translateY(-50%);
          color: #a0aec0;
        }
        .sort-select {
          padding: 0.75rem 1rem;
          border: 1px solid #e2e8f0;
          border-radius: 0.5rem;
          background: white;
          min-width: 150px;
        }
        .filter-button {
          padding: 0.75rem 1rem;
          border: 1px solid #e2e8f0;
          border-radius: 0.5rem;
          background: white;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        .services-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 1.5rem;
        }
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
        .filter-modal {
          position: fixed;
          top: 0;
          right: 0;
          bottom: 0;
          width: 300px;
          background: white;
          padding: 1.5rem;
          box-shadow: -2px 0 5px rgba(0, 0, 0, 0.1);
          transform: translateX(${showFilters ? '0' : '100%'});
          transition: transform 0.3s ease;
          z-index: 1000;
        }
        .filter-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.5rem;
        }
        .filter-title {
          font-size: 1.25rem;
          font-weight: 600;
          color: #1a202c;
        }
        .close-button {
          padding: 0.5rem;
          border: none;
          background: none;
          cursor: pointer;
          color: #718096;
          border-radius: 9999px;
          transition: all 0.2s ease;
        }
        .close-button:hover {
          background: #f7fafc;
        }
        .category-list {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }
        .category-button {
          padding: 0.75rem 1rem;
          border: 1px solid #e2e8f0;
          border-radius: 0.5rem;
          background: white;
          color: #4a5568;
          cursor: pointer;
          transition: all 0.2s ease;
          text-align: left;
        }
        .category-button.active {
          background: #ebf8ff;
          border-color: #4299e1;
          color: #2b6cb0;
        }
        .category-button:hover {
          background: #f7fafc;
        }
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 1000;
        }
        .offer-modal {
          background: white;
          border-radius: 0.5rem;
          width: 90%;
          max-width: 600px;
          max-height: 90vh;
          overflow-y: auto;
          padding: 1.5rem;
        }
        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.5rem;
        }
        .modal-header h3 {
          font-size: 1.25rem;
          font-weight: 600;
          color: #1a202c;
        }
        .service-info {
          background: #f7fafc;
          padding: 1rem;
          border-radius: 0.375rem;
          margin-bottom: 1.5rem;
        }
        .service-info h4 {
          font-weight: 600;
          margin-bottom: 0.5rem;
        }
        .form-group {
          margin-bottom: 1.5rem;
        }
        .form-group label {
          display: block;
          font-weight: 500;
          margin-bottom: 0.5rem;
        }
        .form-group input,
        .form-group textarea {
          width: 100%;
          padding: 0.75rem;
          border: 1px solid #e2e8f0;
          border-radius: 0.375rem;
          font-size: 1rem;
        }
        .word-count {
          text-align: right;
          font-size: 0.875rem;
          color: #718096;
          margin-top: 0.25rem;
        }
        .error-message {
          color: #e53e3e;
          margin-bottom: 1rem;
          padding: 0.5rem;
          background: #fff5f5;
          border-radius: 0.375rem;
        }
        .submit-offer-btn {
          width: 100%;
          padding: 0.75rem;
          background: #4299e1;
          color: white;
          border: none;
          border-radius: 0.375rem;
          font-weight: 500;
          cursor: pointer;
          transition: background 0.2s;
        }
        .submit-offer-btn:hover {
          background: #3182ce;
        }
      `}</style>
    </div>
  );
};

export default Services;
