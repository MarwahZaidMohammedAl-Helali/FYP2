import React, { useState, useEffect } from 'react';

const completedData = [
  {
    id: 1,
    title: 'Web Development Project',
    desc: 'Web development service offered in exchange for mobile app development.',
    partner: 'John Doe',
    partnerFile: 'file1.pdf',
    yourFile: 'file2.pdf',
    deadline: '2025-02-20',
    review: '',
    rating: 4,
  },
  {
    id: 2,
    title: 'SEO Optimization',
    desc: 'SEO optimization offered in exchange for graphic design services.',
    partner: 'Alice Smith',
    partnerFile: 'file3.pdf',
    yourFile: 'file4.pdf',
    deadline: '2025-02-20',
    review: '',
    rating: 0,
  }
];

const CompletedServices = () => {
  const [services, setServices] = useState(completedData);
  const [errors, setErrors] = useState({});
  const [isShaking, setIsShaking] = useState({});

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

  const handleRating = (id, value) => {
    setServices(services.map(s => s.id === id ? { ...s, rating: value } : s));
  };

  const handleReview = (id, value) => {
    setServices(services.map(s => s.id === id ? { ...s, review: value } : s));
    // Clear error when user types
    if (errors[id]) {
      setErrors(prev => ({
        ...prev,
        [id]: ''
      }));
    }
  };

  const handleSubmitReview = async (id) => {
    const service = services.find(s => s.id === id);
    if (!service.review || !service.rating) return;

    try {
      const response = await fetch('http://localhost:3001/api/moderate-text', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: service.review }),
      });

      const result = await response.json();

      if (result.status === 'approved') {
        // Submit the review
        console.log('Review submitted:', { id, rating: service.rating, review: service.review });
        // Add your submission logic here
      } else {
        setErrors(prev => ({
          ...prev,
          [id]: "This review contains inappropriate language. Please revise it."
        }));
        setIsShaking(prev => ({
          ...prev,
          [id]: true
        }));
        setTimeout(() => {
          setIsShaking(prev => ({
            ...prev,
            [id]: false
          }));
        }, 500);
      }
    } catch (e) {
      console.error('Moderation server error:', e);
      setErrors(prev => ({
        ...prev,
        [id]: "Could not connect to the server. Please try again in a moment."
      }));
      setIsShaking(prev => ({
        ...prev,
        [id]: false
      }));
    }
  };

  return (
    <div className="completed-root">
      <style>{`
        .completed-root {
          background: #f1f5f9;
          min-height: 100vh;
          padding: 2rem 0;
        }
        .completed-title {
          font-size: 2.2rem;
          font-weight: 600;
          margin-bottom: 0.5rem;
          color: #222;
          text-align: center;
        }
        .completed-desc {
          text-align: center;
          color: #64748b;
          margin-bottom: 2rem;
        }
        .completed-card {
          background: #fff;
          border-radius: 0.5rem;
          box-shadow: 0 2px 8px rgba(0,0,0,0.04);
          margin: 0 auto 2rem auto;
          max-width: 900px;
          padding: 2rem 2rem 1.5rem 2rem;
        }
        .completed-card-title {
          font-size: 1.25rem;
          font-weight: 600;
          margin-bottom: 0.25rem;
        }
        .completed-card-desc {
          color: #64748b;
          margin-bottom: 1.5rem;
        }
        .completed-files-row {
          display: flex;
          gap: 1rem;
          margin-bottom: 1rem;
        }
        .completed-file-box {
          background: #f3f4f6;
          border-radius: 0.5rem;
          border: 1px solid #e2e8f0;
          flex: 1;
          padding: 1rem 1.5rem;
          min-width: 200px;
          display: flex;
          align-items: center;
          gap: 1rem;
        }
        .completed-file-box.yourside {
          background: #e0f2fe;
          border: 1px solid #bae6fd;
        }
        .completed-file-label {
          font-weight: 500;
          margin-bottom: 0.25rem;
        }
        .completed-file-download {
          background: #fff;
          color: #2563eb;
          border: 1px solid #2563eb;
          border-radius: 0.3rem;
          padding: 0.4rem 1.2rem;
          font-size: 1rem;
          font-weight: 500;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          transition: background 0.2s;
        }
        .completed-file-download:hover {
          background: #e0e7ff;
        }
        .completed-deadline-row {
          margin-bottom: 1rem;
          display: flex;
          align-items: center;
          gap: 1rem;
        }
        .completed-deadline-label {
          color: #64748b;
        }
        .completed-review-row {
          margin-bottom: 1rem;
        }
        .completed-review-label {
          font-weight: 500;
          margin-bottom: 0.5rem;
        }
        .completed-stars {
          display: flex;
          gap: 0.1rem;
          margin-bottom: 0.5rem;
        }
        .completed-star {
          color: #facc15;
          font-size: 1.3rem;
          cursor: pointer;
        }
        .completed-star.inactive {
          color: #e5e7eb;
        }
        .completed-review-input {
          width: 100%;
          min-height: 80px;
          border-radius: 0.3rem;
          border: 1px solid #cbd5e1;
          padding: 0.75rem 1rem;
          font-size: 1rem;
          margin-bottom: 0.5rem;
        }
        .completed-submit-btn {
          background: #2563eb;
          color: #fff;
          border: none;
          border-radius: 0.3rem;
          padding: 0.4rem 1.5rem;
          font-size: 1rem;
          font-weight: 500;
          cursor: pointer;
          opacity: 0.6;
        }
        .completed-submit-btn.enabled {
          opacity: 1;
          cursor: pointer;
        }
        .error-message {
          position: absolute;
          bottom: 3rem;
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
        .shake {
          animation: shake 0.5s cubic-bezier(.36,.07,.19,.97) both;
        }
      `}</style>
      <div className="completed-title">Completed Services</div>
      <div className="completed-desc">Here, you will find all the services you have completed, along with all the uploaded files and details.</div>
      {services.map(service => (
        <div key={service.id} className="completed-card">
          <div className="completed-card-title">{service.title}</div>
          <div className="completed-card-desc">{service.desc}</div>
          <div className="completed-files-row">
            <div className="completed-file-box">
              <div>
                <div className="completed-file-label">{service.partner}</div>
                <span role="img" aria-label="clip">📎</span>
                <button className="completed-file-download"> <span role="img" aria-label="cloud">☁️</span> CLICK TO DOWNLOAD </button>
              </div>
            </div>
            <div className="completed-file-box yourside">
              <div>
                <div className="completed-file-label">Your Side</div>
                <span role="img" aria-label="clip">📎</span>
                <button className="completed-file-download"> <span role="img" aria-label="cloud">☁️</span> CLICK TO DOWNLOAD </button>
              </div>
            </div>
          </div>
          <div className="completed-deadline-row">
            <span className="completed-deadline-label">Deadline: {service.deadline}</span>
            <span role="img" aria-label="calendar">🗓️</span>
          </div>
          <div className="completed-review-row">
            <div className="completed-review-label">Rate and Review this Service:</div>
            <div className="completed-stars">
              {[...Array(5)].map((_, i) => (
                <span
                  key={i}
                  className={`completed-star${i < service.rating ? '' : ' inactive'}`}
                  onClick={() => handleRating(service.id, i + 1)}
                  style={{ pointerEvents: 'auto' }}
                >★</span>
              ))}
            </div>
            <textarea
              className={`completed-review-input ${errors[service.id] ? 'error' : ''} ${isShaking[service.id] ? 'shake' : ''}`}
              placeholder="Write a Review"
              value={service.review}
              onChange={e => handleReview(service.id, e.target.value)}
            />
            {errors[service.id] && (
              <div className="error-message">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="12" y1="8" x2="12" y2="12"></line>
                  <line x1="12" y1="16" x2="12.01" y2="16"></line>
                </svg>
                {errors[service.id]}
              </div>
            )}
            <button
              className={`completed-submit-btn${service.review && service.rating ? ' enabled' : ''}`}
              disabled={!(service.review && service.rating)}
              onClick={() => handleSubmitReview(service.id)}
            >
              SUBMIT REVIEW
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default CompletedServices; 