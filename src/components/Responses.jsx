import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { MessageSquare, Star } from 'lucide-react';

const Responses = () => {
  const [responses, setResponses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchResponses();
  }, []);

  const fetchResponses = async () => {
    try {
      const response = await axios.get('http://localhost:3001/api/my-service-responses', {
        withCredentials: true
      });
      setResponses(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching responses:', error);
      setError('Failed to load responses');
      setLoading(false);
    }
  };

  const handleAcceptOffer = async (offerId) => {
    try {
      await axios.post(`http://localhost:3001/api/service-offers/${offerId}/accept`, {}, {
        withCredentials: true
      });
      // Refresh responses
      fetchResponses();
    } catch (error) {
      console.error('Error accepting offer:', error);
    }
  };

  const handleDeclineOffer = async (offerId) => {
    try {
      await axios.post(`http://localhost:3001/api/service-offers/${offerId}/decline`, {}, {
        withCredentials: true
      });
      // Refresh responses
      fetchResponses();
    } catch (error) {
      console.error('Error declining offer:', error);
    }
  };

  const handleStartChat = (userId) => {
    navigate(`/user-dashboard/chat/${userId}`);
  };

  const handleViewProfile = (userId) => {
    navigate(`/user-dashboard/profile/${userId}`);
  };

  if (loading) return <div className="loading">Loading responses...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="responses-root">
      <style>{`
        .responses-root {
          background: #f1f5f9;
          min-height: 100vh;
          padding: 2rem;
        }
        .responses-title {
          text-align: center;
          font-size: 2.2rem;
          font-weight: 600;
          margin-bottom: 2rem;
          color: #222;
        }
        .responses-empty {
          text-align: center;
          padding: 2rem;
          background: white;
          border-radius: 0.5rem;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .responses-group {
          background: white;
          border-radius: 0.5rem;
          box-shadow: 0 2px 8px rgba(0,0,0,0.06);
          padding: 1.5rem;
          margin-bottom: 2rem;
        }
        .responses-group-title {
          font-size: 1.25rem;
          font-weight: 600;
          color: #2d3748;
          margin-bottom: 0.5rem;
        }
        .responses-group-desc {
          color: #4a5568;
          margin-bottom: 1.5rem;
        }
        .responses-cards {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 1.5rem;
        }
        .responses-card {
          background: #f7fafc;
          border-radius: 0.5rem;
          padding: 1.5rem;
          border: 1px solid #e2e8f0;
        }
        .responder-info {
          display: flex;
          align-items: center;
          gap: 1rem;
          margin-bottom: 1rem;
        }
        .responder-avatar {
          width: 48px;
          height: 48px;
          border-radius: 50%;
          background: #e2e8f0;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 600;
          color: #4a5568;
        }
        .responder-details {
          flex: 1;
        }
        .responder-name {
          font-weight: 600;
          color: #2d3748;
          margin-bottom: 0.25rem;
        }
        .responder-stats {
          display: flex;
          gap: 1rem;
          font-size: 0.875rem;
          color: #4a5568;
        }
        .rating-stars {
          display: flex;
          gap: 0.25rem;
          color: #eab308;
        }
        .offer-details {
          margin: 1rem 0;
          padding: 1rem;
          background: white;
          border-radius: 0.375rem;
          border: 1px solid #e2e8f0;
        }
        .offer-details-title {
          font-weight: 600;
          margin-bottom: 0.5rem;
          color: #2d3748;
        }
        .deadline {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: #4a5568;
          font-size: 0.875rem;
          margin: 1rem 0;
        }
        .action-buttons {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 0.75rem;
          margin-top: 1rem;
        }
        .action-button {
          padding: 0.5rem;
          border-radius: 0.375rem;
          font-size: 0.875rem;
          font-weight: 500;
          cursor: pointer;
          border: none;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
        }
        .accept-button {
          background: #dcfce7;
          color: #166534;
        }
        .accept-button:hover {
          background: #bbf7d0;
        }
        .decline-button {
          background: #fee2e2;
          color: #991b1b;
        }
        .decline-button:hover {
          background: #fecaca;
        }
        .chat-button {
          background: #e0f2fe;
          color: #0369a1;
        }
        .chat-button:hover {
          background: #bae6fd;
        }
        .profile-button {
          background: #f3f4f6;
          color: #1f2937;
        }
        .profile-button:hover {
          background: #e5e7eb;
        }
      `}</style>

      <h1 className="responses-title">Responses to Your Services</h1>

      {responses.length === 0 ? (
        <div className="responses-empty">
          <p>No responses to your services yet.</p>
          <p>When someone makes an offer on your service, it will appear here!</p>
        </div>
      ) : (
        responses.map((service) => (
          <div key={service.id} className="responses-group">
            <div className="responses-group-title">{service.title}</div>
            <div className="responses-group-desc">{service.description}</div>
            
            <div className="responses-cards">
              {service.offers.map((offer) => (
                <div key={offer.id} className="responses-card">
                  <div className="responder-info">
                    <div className="responder-avatar">
                      {offer.user.name.charAt(0)}
                    </div>
                    <div className="responder-details">
                      <div className="responder-name">{offer.user.name}</div>
                      <div className="responder-stats">
                        <span>{offer.user.exchangesCount} Exchanges</span>
                        <div className="rating-stars">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              size={14}
                              fill={i < Math.floor(offer.user.rating) ? 'currentColor' : 'none'}
                            />
                          ))}
                          <span>({offer.user.reviewsCount})</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="offer-details">
                    <div className="offer-details-title">Offer Details:</div>
                    <p>{offer.offerDetails}</p>
                  </div>

                  <div className="deadline">
                    📅 Proposed Deadline: {new Date(offer.proposedDeadline).toLocaleDateString()}
                  </div>

                  <div className="action-buttons">
                    {offer.status === 'PENDING' && (
                      <>
                        <button 
                          className="action-button accept-button"
                          onClick={() => handleAcceptOffer(offer.id)}
                        >
                          Accept
                        </button>
                        <button 
                          className="action-button decline-button"
                          onClick={() => handleDeclineOffer(offer.id)}
                        >
                          Decline
                        </button>
                      </>
                    )}
                    <button 
                      className="action-button chat-button"
                      onClick={() => handleStartChat(offer.user.id)}
                    >
                      <MessageSquare size={16} />
                      Chat
                    </button>
                    <button 
                      className="action-button profile-button"
                      onClick={() => handleViewProfile(offer.user.id)}
                    >
                      View Profile
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default Responses; 