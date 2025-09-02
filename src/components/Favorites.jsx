import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Heart, Star, MapPin, Search, Filter, X } from 'lucide-react';

const Favorites = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('default');
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [categories, setCategories] = useState([]);

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

  useEffect(() => {
    const fetchFavorites = async () => {
      try {
        setLoading(true);
        const response = await axios.get('http://localhost:3001/api/favorites', {
          withCredentials: true
        });
        setFavorites(response.data);
        setError(null);
      } catch (err) {
        console.error('Error fetching favorites:', err);
        setError('Failed to load favorites. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchFavorites();
  }, []);

  const removeFavorite = async (serviceId) => {
    try {
      await axios.delete(`http://localhost:3001/api/favorites/${serviceId}`, {
        withCredentials: true
      });
      setFavorites(favorites.filter(fav => fav.id !== serviceId));
    } catch (error) {
      console.error('Error removing favorite:', error);
    }
  };

  // Filter favorites based on search query and category
  const filteredFavorites = favorites.filter(service => {
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch = 
      service.title?.toLowerCase().includes(searchLower) ||
      service.description?.toLowerCase().includes(searchLower) ||
      service.offer?.toLowerCase().includes(searchLower) ||
      service.seek?.toLowerCase().includes(searchLower);
    
    const matchesCategory = !selectedCategory || service.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  // Sort favorites
  const sortedFavorites = [...filteredFavorites].sort((a, b) => {
    switch (sortBy) {
      case 'name':
        return a.title.localeCompare(b.title);
      case 'date':
        return new Date(b.favorited_at) - new Date(a.favorited_at);
      case 'rating':
        return b.rating - a.rating;
      default:
        return 0;
    }
  });

  return (
    <div className="favorites-container">
      <style>{`
        .favorites-container {
          padding: 1.5rem;
          background: white;
          border-radius: 0.75rem;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
        }
        .favorites-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
        }
        .favorites-title {
          font-size: 1.5rem;
          font-weight: 600;
          color: #1a202c;
        }
        .favorites-controls {
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
          transition: all 0.3s ease;
        }
        .search-input:focus {
          outline: none;
          border-color: #4a8fe1;
          box-shadow: 0 0 0 3px rgba(74, 143, 225, 0.1);
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
          background-color: white;
          font-size: 0.875rem;
          color: #4a5568;
          cursor: pointer;
          transition: all 0.3s ease;
          min-width: 150px;
        }
        .sort-select:focus {
          outline: none;
          border-color: #4a8fe1;
          box-shadow: 0 0 0 3px rgba(74, 143, 225, 0.1);
        }
        .filter-button {
          padding: 0.75rem 1rem;
          border: 1px solid #e2e8f0;
          border-radius: 0.5rem;
          background-color: white;
          color: #4a5568;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        .filter-button:hover {
          background-color: #f7fafc;
        }
        .services-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 1.5rem;
          margin-top: 1.5rem;
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
        .service-category {
          font-size: 0.875rem;
          color: #4a5568;
          margin-bottom: 0.5rem;
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
        .remove-button {
          padding: 0.5rem;
          border: none;
          background: none;
          color: #e53e3e;
          cursor: pointer;
          border-radius: 9999px;
          transition: all 0.2s ease;
        }
        .remove-button:hover {
          background: rgba(229, 62, 62, 0.1);
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
        .service-badge {
          padding: 0.25rem 0.75rem;
          border-radius: 9999px;
          font-size: 0.75rem;
          font-weight: 500;
          background: #ebf8ff;
          color: #4299e1;
        }
        @media (max-width: 600px) {
          .favorites-controls { 
            flex-direction: column; 
            gap: 0.5rem; 
          }
          .sort-select { 
            width: 100%; 
          }
        }
      `}</style>

      <div className="favorites-header">
        <h2 className="favorites-title">Your Favorite Services</h2>
      </div>

      <div className="favorites-controls">
        <div className="search-container">
          <Search className="search-icon" size={16} />
            <input
              type="text"
            placeholder="Search your favorites..."
            className="search-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
        </div>

          <select
          className="sort-select"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
          <option value="default">Sort by</option>
            <option value="name">Name</option>
          <option value="date">Date Added</option>
          <option value="rating">Rating</option>
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
        <div className="loading">Loading favorites...</div>
      ) : error ? (
        <div className="error">{error}</div>
      ) : favorites.length === 0 ? (
        <div className="empty-state">
          You have no favorite services yet.
        </div>
      ) : (
        <div className="services-grid">
          {sortedFavorites.map((service) => (
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
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <span className="service-badge">
                      {service.category}
                    </span>
                    <button
                      className="remove-button"
                      onClick={() => removeFavorite(service.id)}
                      title="Remove from favorites"
                    >
                      <Heart fill="currentColor" size={20} />
                    </button>
                  </div>
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
                          className={`star ${i < Math.floor(service.rating) ? '' : 'star-empty'}`}
                          size={16}
                        />
                      ))}
                    </div>
                    <span>({service.reviews_count})</span>
                  </div>
                  <div className="location">
                    <MapPin size={16} />
                    {service.location}
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
            onClick={() => {
              setSelectedCategory('');
              setShowFilters(false);
            }}
          >
            All Categories
          </button>
          {categories.map((category) => (
            <button
              key={category.id}
              className={`category-button ${selectedCategory === category.id ? 'active' : ''}`}
              onClick={() => {
                setSelectedCategory(category.id);
                setShowFilters(false);
              }}
            >
              {category.name}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Favorites; 