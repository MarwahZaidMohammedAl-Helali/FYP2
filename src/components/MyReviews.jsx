import React, { useState, useEffect } from 'react';

const MyReviews = () => {
  const [activeTab, setActiveTab] = useState('all');
  const [reviews, setReviews] = useState([
    {
      id: '1',
      recipientName: 'Sarah Johnson',
      recipientPhoto: '/placeholder-avatar.jpg',
      recipientJob: 'UI/UX Designer',
      rating: 5,
      comment: 'Great collaboration on the project. Very professional and delivered high-quality work on time.',
      date: '2024-03-15',
      projectTitle: 'E-commerce Website Redesign',
      status: 'published'
    },
    {
      id: '2',
      recipientName: 'Michael Chen',
      recipientPhoto: '/placeholder-avatar.jpg',
      recipientJob: 'Full Stack Developer',
      rating: 4,
      comment: 'Excellent problem-solving skills and communication throughout the project.',
      date: '2024-03-10',
      projectTitle: 'Mobile App Development',
      status: 'published'
    },
    {
      id: '3',
      recipientName: 'Emma Wilson',
      recipientPhoto: '/placeholder-avatar.jpg',
      recipientJob: 'Graphic Designer',
      rating: 5,
      comment: 'Amazing creativity and attention to detail. Would definitely work with again!',
      date: '2024-03-08',
      projectTitle: 'Brand Identity Design',
      status: 'draft'
    }
  ]);

  const [isEditing, setIsEditing] = useState(false);
  const [editingReview, setEditingReview] = useState(null);
  const [error, setError] = useState('');
  const [isShaking, setIsShaking] = useState(false);

  // Add keyframes for shake animation
  useEffect(() => {
    const styleSheet = document.createElement("style");
    styleSheet.textContent = `
      @keyframes shake {
        10%, 90% { transform: translate3d(-1px, 0, 0); }
        20%, 80% { transform: translate3d(2px, 0, 0); }
        30%, 50%, 70% { transform: translate3d(-4px, 0, 0); }
        40%, 60% { transform: translate3d(4px, 0, 0); }
      }
    `;
    document.head.appendChild(styleSheet);
    return () => {
      document.head.removeChild(styleSheet);
    };
  }, []);

  const handleEditClick = (review) => {
    setIsEditing(true);
    setEditingReview({ ...review });
    setError('');
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditingReview(null);
    setError('');
  };

  const handleSaveEdit = async () => {
    if (!editingReview.comment.trim()) return;

    try {
      const response = await fetch('http://localhost:3001/api/moderate-text', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: editingReview.comment }),
      });

      const result = await response.json();

      if (result.status === 'approved') {
        setReviews(reviews.map(r => 
          r.id === editingReview.id ? { ...editingReview, date: new Date().toISOString() } : r
        ));
        setIsEditing(false);
        setEditingReview(null);
        setError('');
      } else {
        setError("This review contains inappropriate language. Please revise it.");
        setIsShaking(true);
        setTimeout(() => setIsShaking(false), 500);
      }
    } catch (e) {
      console.error('Moderation server error:', e);
      setError("Could not connect to the server. Please try again in a moment.");
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 500);
    }
  };

  const handleNewReview = async () => {
    const newReview = {
      id: Date.now().toString(),
      recipientName: '',
      recipientPhoto: '/placeholder-avatar.jpg',
      recipientJob: '',
      rating: 5,
      comment: '',
      date: new Date().toISOString(),
      projectTitle: '',
      status: 'draft'
    };
    setEditingReview(newReview);
    setIsEditing(true);
    setError('');
  };

  const handlePublish = async (review) => {
    try {
      const response = await fetch('http://localhost:3001/api/moderate-text', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: review.comment }),
      });

      const result = await response.json();

      if (result.status === 'approved') {
        setReviews(reviews.map(r => 
          r.id === review.id ? { ...review, status: 'published', date: new Date().toISOString() } : r
        ));
      } else {
        setError("This review contains inappropriate language. Please revise it before publishing.");
        setIsShaking(true);
        setTimeout(() => setIsShaking(false), 500);
      }
    } catch (e) {
      console.error('Moderation server error:', e);
      setError("Could not connect to the server. Please try again in a moment.");
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 500);
    }
  };

  const StarRating = ({ rating, size = 'md', onRatingChange }) => {
    const starSizes = {
      sm: 'w-4 h-4',
      md: 'w-5 h-5',
      lg: 'w-6 h-6'
    };

    return (
      <div className="myreviews-stars">
        {[...Array(5)].map((_, index) => (
          <svg
            key={index}
            className={`${starSizes[size]} ${index < rating ? 'myreviews-star-filled' : 'myreviews-star-empty'}`}
            fill="currentColor"
            viewBox="0 0 20 20"
            onClick={() => onRatingChange && onRatingChange(index + 1)}
            style={{ cursor: onRatingChange ? 'pointer' : 'default' }}
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
      </div>
    );
  };

  const filteredReviews = activeTab === 'all' 
    ? reviews 
    : reviews.filter(review => review.status === activeTab);

  const StatusBadge = ({ status }) => {
    const statusStyles = {
      published: 'myreviews-badge-published',
      draft: 'myreviews-badge-draft',
      archived: 'myreviews-badge-archived'
    };
    const statusLabels = {
      published: 'Published',
      draft: 'Draft',
      archived: 'Archived'
    };
    return (
      <span className={`myreviews-badge ${statusStyles[status]}`}>
        {statusLabels[status]}
      </span>
    );
  };

  return (
    <div className="myreviews-root">
      <style>{`
        .myreviews-root {
          padding: 2rem;
          max-width: 800px;
          margin: 0 auto;
        }
        .myreviews-header {
          font-size: 1.8rem;
          font-weight: 600;
          color: #1e293b;
          margin-bottom: 1rem;
        }
        .myreviews-controls {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.5rem;
        }
        .myreviews-tabs {
          display: flex;
          gap: 1rem;
          margin-bottom: 2rem;
          border-bottom: 1px solid #e2e8f0;
          padding-bottom: 0.5rem;
        }
        .myreviews-tab {
          background: none;
          border: none;
          padding: 0.5rem 1rem;
          font-size: 1rem;
          color: #64748b;
          cursor: pointer;
          border-radius: 0.375rem;
          transition: all 0.2s;
        }
        .myreviews-tab:hover {
          background: #f1f5f9;
          color: #1e293b;
        }
        .myreviews-tab.active {
          background: #e0e7ff;
          color: #4338ca;
          font-weight: 500;
        }
        .myreviews-list {
          display: grid;
          gap: 1.5rem;
        }
        .myreviews-card {
          display: flex;
          gap: 1rem;
          padding: 1.5rem;
          border: 1px solid #e2e8f0;
          border-radius: 0.5rem;
          background: white;
          transition: all 0.3s ease;
        }
        .myreviews-card:hover {
          border-color: #cbd5e1;
          box-shadow: 0 4px 12px rgba(0,0,0,0.05);
          transform: translateY(-2px);
        }
        .myreviews-avatar {
          width: 48px;
          height: 48px;
          border-radius: 50%;
          object-fit: cover;
        }
        .myreviews-content {
          flex: 1;
        }
        .myreviews-row {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 0.5rem;
        }
        .myreviews-name {
          font-weight: 600;
          color: #1e293b;
        }
        .myreviews-job {
          font-size: 0.95rem;
          color: #64748b;
        }
        .myreviews-stars {
          display: flex;
          gap: 0.15rem;
        }
        .myreviews-star-filled {
          color: #facc15;
        }
        .myreviews-star-empty {
          color: #e5e7eb;
        }
        .myreviews-badge {
          padding: 0.15rem 0.75rem;
          border-radius: 999px;
          font-size: 0.8rem;
          font-weight: 500;
          margin-left: 0.5rem;
        }
        .myreviews-badge-published {
          background: #dcfce7;
          color: #166534;
        }
        .myreviews-badge-draft {
          background: #fef9c3;
          color: #a16207;
        }
        .myreviews-badge-archived {
          background: #f3f4f6;
          color: #374151;
        }
        .myreviews-date {
          font-size: 0.85rem;
          color: #94a3b8;
          margin-top: 0.25rem;
        }
        .myreviews-project {
          font-size: 0.95rem;
          color: #64748b;
          margin-bottom: 0.25rem;
        }
        .myreviews-comment {
          color: #334155;
          margin-bottom: 0.5rem;
          position: relative;
        }
        .myreviews-comment-input {
          width: 100%;
          min-height: 80px;
          padding: 0.75rem;
          border: 1px solid #cbd5e1;
          border-radius: 0.375rem;
          font-size: 1rem;
          color: #334155;
          resize: vertical;
          transition: all 0.3s ease;
        }
        .myreviews-comment-input:focus {
          outline: none;
          border-color: #2563eb;
          box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
        }
        .myreviews-comment-input.error {
          border-color: #ef4444;
          background: #fef2f2;
        }
        .myreviews-comment-input.error:focus {
          box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
        }
        .error-message {
          position: absolute;
          bottom: -24px;
          left: 0;
          color: #ef4444;
          font-size: 0.875rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          background: white;
          padding: 0.25rem 0.5rem;
          border-radius: 0.25rem;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          z-index: 10;
        }
        .myreviews-actions {
          display: flex;
          gap: 0.5rem;
          margin-top: 1rem;
        }
        .myreviews-action-btn {
          padding: 0.5rem 1rem;
          border-radius: 0.375rem;
          font-size: 0.9rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.3s ease;
        }
        .myreviews-action-btn.primary {
          background: #2563eb;
          color: white;
          border: none;
        }
        .myreviews-action-btn.primary:hover {
          background: #1d4ed8;
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(37, 99, 235, 0.2);
        }
        .myreviews-action-btn.secondary {
          background: white;
          color: #2563eb;
          border: 1px solid #2563eb;
        }
        .myreviews-action-btn.secondary:hover {
          background: #e0e7ff;
        }
        .myreviews-action-btn.danger {
          background: white;
          color: #dc2626;
          border: 1px solid #dc2626;
        }
        .myreviews-action-btn.danger:hover {
          background: #fef2f2;
        }
        .myreviews-empty {
          text-align: center;
          color: #94a3b8;
          padding: 2rem 0;
        }
        .shake {
          animation: shake 0.5s cubic-bezier(.36,.07,.19,.97) both;
        }
      `}</style>
      <div className="myreviews-controls">
        <h2 className="myreviews-header">My Reviews</h2>
        <button className="myreviews-action-btn primary" onClick={handleNewReview}>
          Write New Review
        </button>
      </div>
      <div className="myreviews-tabs">
        {['all', 'published', 'draft', 'archived'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`myreviews-tab${activeTab === tab ? ' active' : ''}`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
            {tab !== 'all' && (
              <span style={{ marginLeft: 4, fontSize: '0.8em', color: '#b6c2d6' }}>
                ({reviews.filter(review => review.status === tab).length})
              </span>
            )}
          </button>
        ))}
      </div>
      <div className="myreviews-list">
        {isEditing ? (
          <div className="myreviews-card">
            <img
              src={editingReview.recipientPhoto}
              alt={editingReview.recipientName}
              className="myreviews-avatar"
            />
            <div className="myreviews-content">
              <div className="myreviews-row">
                <div>
                  <input
                    type="text"
                    value={editingReview.recipientName}
                    onChange={(e) => setEditingReview({ ...editingReview, recipientName: e.target.value })}
                    placeholder="Recipient Name"
                    className="myreviews-name"
                    style={{ border: 'none', background: 'none', fontSize: 'inherit', fontWeight: 'inherit' }}
                  />
                  <input
                    type="text"
                    value={editingReview.recipientJob}
                    onChange={(e) => setEditingReview({ ...editingReview, recipientJob: e.target.value })}
                    placeholder="Job Title"
                    className="myreviews-job"
                    style={{ border: 'none', background: 'none', fontSize: 'inherit' }}
                  />
                </div>
                <StarRating 
                  rating={editingReview.rating} 
                  onRatingChange={(rating) => setEditingReview({ ...editingReview, rating })}
                />
              </div>
              <input
                type="text"
                value={editingReview.projectTitle}
                onChange={(e) => setEditingReview({ ...editingReview, projectTitle: e.target.value })}
                placeholder="Project Title"
                className="myreviews-project"
                style={{ border: 'none', background: 'none', fontSize: 'inherit', width: '100%' }}
              />
              <div className="myreviews-comment">
                <textarea
                  value={editingReview.comment}
                  onChange={(e) => {
                    setEditingReview({ ...editingReview, comment: e.target.value });
                    setError(''); // Clear error when user types
                  }}
                  placeholder="Write your review..."
                  className={`myreviews-comment-input ${error ? 'error' : ''} ${isShaking ? 'shake' : ''}`}
                />
                {error && (
                  <div className="error-message">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10"></circle>
                      <line x1="12" y1="8" x2="12" y2="12"></line>
                      <line x1="12" y1="16" x2="12.01" y2="16"></line>
                    </svg>
                    {error}
                  </div>
                )}
              </div>
              <div className="myreviews-actions">
                <button className="myreviews-action-btn primary" onClick={handleSaveEdit}>
                  Save
                </button>
                <button className="myreviews-action-btn secondary" onClick={handleCancelEdit}>
                  Cancel
                </button>
              </div>
            </div>
          </div>
        ) : (
          filteredReviews.map((review) => (
            <div key={review.id} className="myreviews-card">
              <img
                src={review.recipientPhoto}
                alt={review.recipientName}
                className="myreviews-avatar"
              />
              <div className="myreviews-content">
                <div className="myreviews-row">
                  <div>
                    <div className="myreviews-name">{review.recipientName}</div>
                    <div className="myreviews-job">{review.recipientJob}</div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <StarRating rating={review.rating} />
                      <StatusBadge status={review.status} />
                    </div>
                    <div className="myreviews-date">{new Date(review.date).toLocaleDateString()}</div>
                  </div>
                </div>
                {review.projectTitle && (
                  <div className="myreviews-project">Project: {review.projectTitle}</div>
                )}
                <div className="myreviews-comment">{review.comment}</div>
                <div className="myreviews-actions">
                  <button className="myreviews-action-btn secondary" onClick={() => handleEditClick(review)}>
                    Edit
                  </button>
                  {review.status === 'draft' && (
                    <button className="myreviews-action-btn primary" onClick={() => handlePublish(review)}>
                      Publish
                    </button>
                  )}
                  {review.status !== 'archived' && (
                    <button 
                      className="myreviews-action-btn secondary"
                      onClick={() => setReviews(reviews.map(r => 
                        r.id === review.id ? { ...r, status: 'archived' } : r
                      ))}
                    >
                      Archive
                    </button>
                  )}
                  <button 
                    className="myreviews-action-btn danger"
                    onClick={() => setReviews(reviews.filter(r => r.id !== review.id))}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
        {!isEditing && filteredReviews.length === 0 && (
          <div className="myreviews-empty">No reviews found in this category.</div>
        )}
      </div>
    </div>
  );
};

export default MyReviews; 