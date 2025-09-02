import React, { useState } from 'react';

const sampleNotifications = [
  {
    id: 1,
    type: 'message',
    title: 'New Message from Sarah Johnson',
    description: 'Sarah: Thank you for your help!',
    time: '2 min ago',
    read: false
  },
  {
    id: 2,
    type: 'admin',
    title: 'Admin Responded to Your Complaint',
    description: 'Your complaint has been reviewed. Please check your inbox for details.',
    time: '10 min ago',
    read: false
  },
  {
    id: 3,
    type: 'review',
    title: 'New Review Received',
    description: 'Michael Chen left you a 5-star review.',
    time: '1 hour ago',
    read: true
  }
];

const typeColors = {
  message: '#2563eb',
  admin: '#f59e42',
  review: '#16a34a'
};

const typeIcons = {
  message: '💬',
  admin: '🛡️',
  review: '⭐'
};

const Notifications = () => {
  const [notifications, setNotifications] = useState(sampleNotifications);

  const markAsRead = (id) => {
    setNotifications(notifications.map(n => n.id === id ? { ...n, read: true } : n));
  };

  return (
    <div className="notifications-container">
      <style>{`
        .notifications-container {
          max-width: 600px;
          margin: 2rem auto;
          background: #fff;
          border-radius: 0.75rem;
          box-shadow: 0 1px 3px rgba(0,0,0,0.05);
          padding: 2rem 1.5rem;
        }
        .notifications-title {
          font-size: 2rem;
          font-weight: 700;
          color: #2563eb;
          margin-bottom: 2rem;
          text-align: center;
        }
        .notifications-list {
          display: grid;
          gap: 1.25rem;
        }
        .notification-item {
          display: flex;
          align-items: flex-start;
          gap: 1rem;
          padding: 1rem 1.25rem;
          border: 1px solid #e2e8f0;
          border-radius: 0.5rem;
          background: #f8fafc;
          transition: box-shadow 0.2s, border-color 0.2s;
          cursor: pointer;
        }
        .notification-item.unread {
          background: #e0e7ff;
          border-color: #2563eb;
          box-shadow: 0 4px 12px rgba(37,99,235,0.08);
        }
        .notification-icon {
          font-size: 2rem;
          margin-top: 0.25rem;
        }
        .notification-content {
          flex: 1;
        }
        .notification-title {
          font-weight: 600;
          color: #1e293b;
          margin-bottom: 0.25rem;
        }
        .notification-description {
          color: #64748b;
          font-size: 1rem;
        }
        .notification-time {
          font-size: 0.85rem;
          color: #94a3b8;
          margin-top: 0.5rem;
        }
        .notification-markread {
          background: none;
          border: none;
          color: #2563eb;
          font-size: 0.95rem;
          font-weight: 500;
          cursor: pointer;
          margin-left: 1rem;
          transition: color 0.2s;
        }
        .notification-markread:hover {
          color: #1d4ed8;
        }
      `}</style>
      <div className="notifications-title">Notifications</div>
      <div className="notifications-list">
        {notifications.length === 0 && (
          <div style={{ textAlign: 'center', color: '#94a3b8', padding: '2rem 0' }}>
            No notifications yet.
          </div>
        )}
        {notifications.map(n => (
          <div
            key={n.id}
            className={`notification-item${n.read ? '' : ' unread'}`}
            onClick={() => markAsRead(n.id)}
          >
            <span className="notification-icon" style={{ color: typeColors[n.type] }}>{typeIcons[n.type]}</span>
            <div className="notification-content">
              <div className="notification-title">{n.title}</div>
              <div className="notification-description">{n.description}</div>
              <div className="notification-time">{n.time}</div>
            </div>
            {!n.read && (
              <button className="notification-markread" onClick={e => { e.stopPropagation(); markAsRead(n.id); }}>
                Mark as read
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Notifications; 