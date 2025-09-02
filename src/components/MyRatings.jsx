import React, { useState } from 'react';

const MyRatings = () => {
  // Sample data - in a real app this would come from an API
  const [ratings, setRatings] = useState([
    {
      id: '1',
      reviewerName: 'John Smith',
      reviewerPhoto: '/placeholder-avatar.jpg',
      reviewerJob: 'Project Manager',
      rating: 5,
      comment: 'Excellent work ethic and attention to detail. Delivered the project ahead of schedule.',
      date: '2024-03-18',
      projectTitle: 'Website Redesign Project'
    },
    {
      id: '2',
      reviewerName: 'Emily Brown',
      reviewerPhoto: '/placeholder-avatar.jpg',
      reviewerJob: 'Marketing Director',
      rating: 4,
      comment: 'Great communication skills and very professional. Would definitely work with again.',
      date: '2024-03-15',
      projectTitle: 'Brand Identity Design'
    }
  ]);

  // Calculate average rating
  const averageRating = ratings.reduce((acc, curr) => acc + curr.rating, 0) / ratings.length;

  const StarRating = ({ rating, size = 'md' }) => {
    const starSizes = {
      sm: 'w-4 h-4',
      md: 'w-5 h-5',
      lg: 'w-6 h-6'
    };

    return (
      <div className="myratings-stars">
        {[...Array(5)].map((_, index) => (
          <svg
            key={index}
            className={`${starSizes[size]} ${index < rating ? 'myratings-star-filled' : 'myratings-star-empty'}`}
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
      </div>
    );
  };

  return (
    <div className="myratings-container">
      <style>{`
        .myratings-container {
          padding: 1.5rem;
          background: white;
          border-radius: 0.75rem;
          box-shadow: 0 1px 3px rgba(0,0,0,0.05);
        }
        .myratings-header {
          font-size: 1.5rem;
          font-weight: 600;
          margin-bottom: 2rem;
          color: #1a202c;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .myratings-summary {
          display: flex;
          align-items: center;
          gap: 1.5rem;
        }
        .myratings-average {
          font-size: 2rem;
          font-weight: bold;
          color: #1e293b;
        }
        .myratings-count {
          font-size: 1rem;
          color: #64748b;
        }
        .myratings-stars {
          display: flex;
          gap: 0.15rem;
        }
        .myratings-star-filled {
          color: #facc15;
        }
        .myratings-star-empty {
          color: #e5e7eb;
        }
        .myratings-distribution {
          margin-bottom: 2rem;
        }
        .myratings-distribution-row {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-bottom: 0.5rem;
        }
        .myratings-distribution-label {
          width: 2.5rem;
          font-size: 0.95rem;
          color: #64748b;
        }
        .myratings-distribution-bar {
          flex: 1;
          height: 0.5rem;
          background: #f1f5f9;
          border-radius: 0.25rem;
          overflow: hidden;
        }
        .myratings-distribution-bar-fill {
          height: 100%;
          background: #facc15;
          border-radius: 0.25rem;
        }
        .myratings-distribution-count {
          width: 3rem;
          font-size: 0.95rem;
          color: #94a3b8;
          text-align: right;
        }
        .myratings-list {
          display: grid;
          gap: 1.5rem;
        }
        .myratings-card {
          display: flex;
          gap: 1rem;
          padding: 1rem;
          border: 1px solid #e2e8f0;
          border-radius: 0.5rem;
          background: white;
          transition: box-shadow 0.2s, border-color 0.2s;
        }
        .myratings-card:hover {
          box-shadow: 0 4px 12px rgba(0,0,0,0.06);
          border-color: #facc15;
        }
        .myratings-avatar {
          width: 48px;
          height: 48px;
          border-radius: 50%;
          object-fit: cover;
        }
        .myratings-content {
          flex: 1;
        }
        .myratings-row {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 0.5rem;
        }
        .myratings-name {
          font-weight: 600;
          color: #1e293b;
        }
        .myratings-job {
          font-size: 0.95rem;
          color: #64748b;
        }
        .myratings-date {
          font-size: 0.85rem;
          color: #94a3b8;
          margin-top: 0.25rem;
        }
        .myratings-project {
          font-size: 0.95rem;
          color: #64748b;
          margin-bottom: 0.25rem;
        }
        .myratings-comment {
          color: #334155;
        }
      `}</style>
      <div className="myratings-header">
        <span>Ratings Received</span>
        <div className="myratings-summary">
          <span className="myratings-average">{averageRating.toFixed(1)}</span>
          <span className="myratings-count">{ratings.length} ratings</span>
          <StarRating rating={Math.round(averageRating)} size="lg" />
        </div>
      </div>
      <div className="myratings-distribution">
        {[5, 4, 3, 2, 1].map((stars) => {
          const count = ratings.filter(r => r.rating === stars).length;
          const percentage = (count / ratings.length) * 100;
          return (
            <div key={stars} className="myratings-distribution-row">
              <span className="myratings-distribution-label">{stars}</span>
              <StarRating rating={stars} size="sm" />
              <div className="myratings-distribution-bar">
                <div className="myratings-distribution-bar-fill" style={{ width: `${percentage}%` }} />
              </div>
              <span className="myratings-distribution-count">{count} ({percentage.toFixed(0)}%)</span>
            </div>
          );
        })}
      </div>
      <div className="myratings-list">
        {ratings.map((rating) => (
          <div key={rating.id} className="myratings-card">
            <img
              src={rating.reviewerPhoto}
              alt={rating.reviewerName}
              className="myratings-avatar"
            />
            <div className="myratings-content">
              <div className="myratings-row">
                <div>
                  <div className="myratings-name">{rating.reviewerName}</div>
                  <div className="myratings-job">{rating.reviewerJob}</div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                  <StarRating rating={rating.rating} />
                  <div className="myratings-date">{new Date(rating.date).toLocaleDateString()}</div>
                </div>
              </div>
              {rating.projectTitle && (
                <div className="myratings-project">Project: {rating.projectTitle}</div>
              )}
              <div className="myratings-comment">{rating.comment}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MyRatings; 