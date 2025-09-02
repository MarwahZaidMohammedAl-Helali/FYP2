import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { MessageSquare, Calendar, User } from 'lucide-react';

const MyOffersToOthers = () => {
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchMyOffers();
  }, []);

  const fetchMyOffers = async () => {
    try {
      // Fetch offers with service and user information
      const response = await axios.get('http://localhost:3001/api/my-offers', {
        withCredentials: true
      });
      
      // For each offer, fetch the service owner's information
      const offersWithUsers = await Promise.all(
        response.data.map(async (offer) => {
          try {
            const userResponse = await axios.get(`http://localhost:3001/api/users/${offer.service.user_id}`, {
              withCredentials: true
            });
            return {
              ...offer,
              service: {
                ...offer.service,
                provider: userResponse.data
              }
            };
          } catch (error) {
            console.error('Error fetching user:', error);
            return offer;
          }
        })
      );

      setOffers(offersWithUsers);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching offers:', error);
      setError('Failed to load your offers');
      setLoading(false);
    }
  };

  const handleWithdrawOffer = async (offerId) => {
    try {
      await axios.delete(`http://localhost:3001/api/service-offers/${offerId}`, {
        withCredentials: true
      });
      // Refresh offers list
      fetchMyOffers();
    } catch (error) {
      console.error('Error withdrawing offer:', error);
    }
  };

  const handleStartChat = (userId) => {
    navigate(`/user-dashboard/chat/${userId}`);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'PENDING':
        return '#f8f9fa'; // Light gray background
      case 'ACCEPTED':
        return '#dcfce7'; // Light green background
      case 'DECLINED':
        return '#fee2e2'; // Light red background
      default:
        return '#f8f9fa';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'PENDING':
        return 'Awaiting Requester Response';
      case 'ACCEPTED':
        return 'Requester Accepted';
      case 'DECLINED':
        return 'Requester Declined';
      default:
        return status;
    }
  };

  if (loading) return <div className="loading">Loading your offers...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="myoffers-container">
      <h1 className="myoffers-title">My Offers to Others</h1>

      {offers.length === 0 ? (
        <div className="myoffers-empty">
          <p>You haven't made any offers yet.</p>
          <p>Browse services and make offers to start exchanging skills!</p>
        </div>
      ) : (
        <div className="myoffers-grid">
          {offers.map((offer) => (
            <div 
              key={offer.id} 
              className="offer-card"
              style={{ backgroundColor: getStatusColor(offer.status) }}
            >
              <div className="offer-header">
                <div className="user-avatar">
                  {offer.service.provider?.username?.charAt(0)?.toUpperCase() || 'U'}
                </div>
                <div className="user-info">
                  <h3 className="user-name">{offer.service.provider?.username || 'Unknown User'}</h3>
                  <p className="offer-status">{getStatusText(offer.status)}</p>
                </div>
              </div>

              <div className="offer-content">
                <h4 className="offer-title">Offer: {offer.service.title}</h4>
                <p className="offer-description">{offer.offerDetails}</p>
                
                <div className="offer-deadline">
                  <Calendar size={16} />
                  Offer Deadline: {new Date(offer.proposedDeadline).toLocaleDateString()}
                </div>
              </div>

              <div className="offer-actions">
                {offer.status === 'PENDING' && (
                  <button 
                    className="action-button withdraw-button"
                    onClick={() => handleWithdrawOffer(offer.id)}
                  >
                    WITHDRAW OFFER
                  </button>
                )}
                {offer.status === 'DECLINED' && (
                  <button 
                    className="action-button remove-button"
                    onClick={() => handleWithdrawOffer(offer.id)}
                  >
                    REMOVE OFFER
                  </button>
                )}
              </div>

              <div className="offer-footer">
                <button 
                  className="icon-button"
                  onClick={() => handleStartChat(offer.service.user_id)}
                >
                  <User size={20} />
                </button>
                <button 
                  className="icon-button"
                  onClick={() => handleStartChat(offer.service.user_id)}
                >
                  <MessageSquare size={20} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <style jsx>{`
        .myoffers-container {
          padding: 2rem;
          max-width: 1200px;
          margin: 0 auto;
        }

        .myoffers-title {
          text-align: center;
          font-size: 2rem;
          font-weight: 600;
          margin-bottom: 2rem;
          color: #1a202c;
        }

        .myoffers-empty {
          text-align: center;
          padding: 2rem;
          background: white;
          border-radius: 1rem;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }

        .myoffers-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
          gap: 2rem;
        }

        .offer-card {
          border-radius: 1rem;
          padding: 1.5rem;
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
          transition: transform 0.2s;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }

        .offer-card:hover {
          transform: translateY(-2px);
        }

        .offer-header {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .user-avatar {
          width: 48px;
          height: 48px;
          background: #e2e8f0;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.25rem;
          font-weight: 600;
          color: #4a5568;
        }

        .user-info {
          flex: 1;
        }

        .user-name {
          font-size: 1.25rem;
          font-weight: 600;
          color: #1a202c;
          margin: 0;
        }

        .offer-status {
          font-size: 0.875rem;
          color: #4a5568;
          margin: 0.25rem 0 0 0;
        }

        .offer-content {
          flex: 1;
        }

        .offer-title {
          font-size: 1.125rem;
          font-weight: 600;
          color: #2d3748;
          margin: 0 0 0.75rem 0;
        }

        .offer-description {
          color: #4a5568;
          font-size: 0.875rem;
          line-height: 1.5;
          margin-bottom: 1rem;
        }

        .offer-deadline {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: #4a5568;
          font-size: 0.875rem;
        }

        .offer-actions {
          display: flex;
          gap: 1rem;
          margin-top: auto;
        }

        .action-button {
          width: 100%;
          padding: 0.75rem;
          border: none;
          border-radius: 0.5rem;
          font-weight: 600;
          font-size: 0.875rem;
          cursor: pointer;
          transition: all 0.2s;
        }

        .withdraw-button {
          background: #fee2e2;
          color: #991b1b;
        }

        .withdraw-button:hover {
          background: #fecaca;
        }

        .remove-button {
          background: #fee2e2;
          color: #991b1b;
        }

        .remove-button:hover {
          background: #fecaca;
        }

        .offer-footer {
          display: flex;
          justify-content: flex-end;
          gap: 0.75rem;
          padding-top: 1rem;
          border-top: 1px solid rgba(0, 0, 0, 0.1);
        }

        .icon-button {
          padding: 0.5rem;
          border: none;
          background: white;
          color: #64748b;
          border-radius: 0.375rem;
          cursor: pointer;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .icon-button:hover {
          background: #f1f5f9;
          color: #3b82f6;
        }
      `}</style>
    </div>
  );
};

export default MyOffersToOthers;