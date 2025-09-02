import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Bell, AlertTriangle, Award, Star } from 'lucide-react';

const EngagementNotifications = ({ userId }) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchNotifications();
    // Poll for new notifications every minute
    const interval = setInterval(fetchNotifications, 60000);
    return () => clearInterval(interval);
  }, [userId]);

  const fetchNotifications = async () => {
    try {
      // Fetch AI matchmaking suggestions
      const matchResponse = await axios.get(
        `http://localhost:3001/api/ai-matchmaking/${userId}`,
        { withCredentials: true }
      );

      // Fetch missed opportunities digest
      const digestResponse = await axios.get(
        `http://localhost:3001/api/missed-opportunities/${userId}`,
        { withCredentials: true }
      );

      // Fetch re-engagement funnel status
      const funnelResponse = await axios.get(
        `http://localhost:3001/api/re-engagement-status/${userId}`,
        { withCredentials: true }
      );

      // Combine and sort notifications by date
      const allNotifications = [
        ...matchResponse.data.map(match => ({
          type: 'MATCH',
          data: match,
          date: new Date(match.suggested_at)
        })),
        ...digestResponse.data.map(digest => ({
          type: 'DIGEST',
          data: digest,
          date: new Date(digest.digest_sent_at)
        })),
        ...funnelResponse.data.map(status => ({
          type: 'FUNNEL',
          data: status,
          date: new Date(status.triggered_at)
        }))
      ].sort((a, b) => b.date - a.date);

      setNotifications(allNotifications);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      setError('Failed to load notifications');
      setLoading(false);
    }
  };

  const handleNotificationAction = async (notification) => {
    try {
      switch (notification.type) {
        case 'MATCH':
          // Mark AI suggestion as viewed
          await axios.post(
            `http://localhost:3001/api/ai-matchmaking/${notification.data.id}/viewed`,
            {},
            { withCredentials: true }
          );
          break;
        case 'DIGEST':
          // Mark digest as viewed
          await axios.post(
            `http://localhost:3001/api/missed-opportunities/${notification.data.id}/viewed`,
            {},
            { withCredentials: true }
          );
          break;
        case 'FUNNEL':
          // Mark funnel stage as actioned
          await axios.post(
            `http://localhost:3001/api/re-engagement/${notification.data.id}/action`,
            {},
            { withCredentials: true }
          );
          break;
      }
      // Refresh notifications
      fetchNotifications();
    } catch (error) {
      console.error('Error handling notification action:', error);
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'MATCH':
        return <Star className="text-yellow-500" />;
      case 'DIGEST':
        return <Award className="text-blue-500" />;
      case 'FUNNEL':
        return <AlertTriangle className="text-red-500" />;
      default:
        return <Bell className="text-gray-500" />;
    }
  };

  const getNotificationContent = (notification) => {
    switch (notification.type) {
      case 'MATCH':
        return {
          title: 'Perfect Match Found!',
          message: `We found a service that matches your skills: ${notification.data.service_title}`,
          action: 'View Match'
        };
      case 'DIGEST':
        return {
          title: 'Missed Opportunities',
          message: 'Check out these services you might be interested in',
          action: 'View Opportunities'
        };
      case 'FUNNEL':
        const stage = notification.data.stage;
        if (stage === 'DEACTIVATION_WARNING') {
          return {
            title: 'Account At Risk',
            message: 'Your account is at risk of deactivation due to inactivity',
            action: 'Take Action'
          };
        }
        return {
          title: 'Stay Active!',
          message: 'Keep your profile active to get the most out of TradeTalent',
          action: 'Learn More'
        };
    }
  };

  if (loading) return <div className="loading">Loading notifications...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="notifications-container">
      <h2 className="notifications-title">
        <Bell size={20} />
        Engagement Notifications
      </h2>

      {notifications.length === 0 ? (
        <div className="no-notifications">
          No new notifications
        </div>
      ) : (
        <div className="notifications-list">
          {notifications.map((notification, index) => {
            const content = getNotificationContent(notification);
            return (
              <div key={index} className="notification-item">
                <div className="notification-icon">
                  {getNotificationIcon(notification.type)}
                </div>
                <div className="notification-content">
                  <h3 className="notification-title">{content.title}</h3>
                  <p className="notification-message">{content.message}</p>
                  <button
                    className="notification-action"
                    onClick={() => handleNotificationAction(notification)}
                  >
                    {content.action}
                  </button>
                </div>
                <div className="notification-date">
                  {new Date(notification.date).toLocaleDateString()}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <style jsx>{`
        .notifications-container {
          padding: 1.5rem;
          background: white;
          border-radius: 1rem;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }

        .notifications-title {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 1.5rem;
          font-weight: 600;
          margin-bottom: 1.5rem;
          color: #1a202c;
        }

        .no-notifications {
          text-align: center;
          padding: 2rem;
          color: #64748b;
          font-size: 0.875rem;
        }

        .notifications-list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .notification-item {
          display: grid;
          grid-template-columns: auto 1fr auto;
          gap: 1rem;
          padding: 1rem;
          background: #f8fafc;
          border-radius: 0.75rem;
          align-items: center;
        }

        .notification-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 2.5rem;
          height: 2.5rem;
          background: white;
          border-radius: 50%;
          box-shadow: 0 1px 2px rgba(0,0,0,0.1);
        }

        .notification-content {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .notification-title {
          font-size: 1rem;
          font-weight: 600;
          color: #1a202c;
          margin: 0;
        }

        .notification-message {
          font-size: 0.875rem;
          color: #64748b;
          margin: 0;
        }

        .notification-action {
          align-self: flex-start;
          margin-top: 0.5rem;
          padding: 0.5rem 1rem;
          background: #3b82f6;
          color: white;
          border: none;
          border-radius: 0.375rem;
          font-size: 0.75rem;
          font-weight: 500;
          cursor: pointer;
          transition: background-color 0.2s;
        }

        .notification-action:hover {
          background: #2563eb;
        }

        .notification-date {
          font-size: 0.75rem;
          color: #64748b;
          white-space: nowrap;
        }
      `}</style>
    </div>
  );
};

export default EngagementNotifications; 