import React, { useState, useEffect, useCallback } from 'react';
import axiosInstance from '../utils/axiosConfig';
import { Activity, AlertTriangle, Award, MessageSquare, FileText, ChevronLeft, ChevronRight, User, MapPin, Calendar, RefreshCw, TrendingUp, TrendingDown, Bell, AlertCircle, XCircle, CheckCircle } from 'lucide-react';
import './styles/UserEngagement.css';

const UserEngagement = ({ userId }) => {
  const [engagementData, setEngagementData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [refreshing, setRefreshing] = useState(false);
  
  const fetchEngagementData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Fetching engagement data for user:', userId);
      
      const response = await axiosInstance.get(`/api/user-engagement/${userId}`, {
        params: {
          page: currentPage,
          pageSize: pageSize
        }
      });
      
      console.log('Engagement data received:', response.data);
      setEngagementData(response.data);
    } catch (error) {
      console.error('Error fetching engagement data:', error);
      if (error.response?.status === 401) {
        setError('Please log in to view engagement data');
      } else if (error.response?.status === 404) {
        setError('User not found');
      } else {
        setError('Failed to load engagement data. Please try again.');
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [userId, currentPage, pageSize]);
  
  useEffect(() => {
    if (!userId) {
      setError('User ID is required');
      setLoading(false);
      return;
    }
    fetchEngagementData();
  }, [userId, fetchEngagementData]);
  
  const handleRefresh = () => {
    setRefreshing(true);
    fetchEngagementData();
  };
  
  const getScoreColor = (score) => {
    if (score > 70) return '#22c55e'; // Green
    if (score > 50) return '#eab308'; // Yellow
    if (score > 30) return '#f97316'; // Orange
    return '#ef4444'; // Red
  };
  
  const getEngagementStage = (score) => {
    if (score > 70) return { stage: 0, name: 'Fully Engaged', icon: CheckCircle, color: '#22c55e' };
    if (score > 50) return { stage: 1, name: 'Personalized Nudge', icon: Bell, color: '#3b82f6' };
    if (score > 30) return { stage: 2, name: 'Missed Opportunities', icon: AlertCircle, color: '#eab308' };
    if (score > 0) return { stage: 3, name: 'Deactivation Warning', icon: AlertTriangle, color: '#f97316' };
    return { stage: 4, name: 'Account Deactivated', icon: XCircle, color: '#ef4444' };
  };
  
  const formatDate = (dateString) => {
    if (!dateString) return 'Never';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      return dateString;
    }
  };
  
  const getActionIcon = (actionType) => {
    const iconMap = {
      'SERVICE_POST': <FileText className="text-purple-500" size={20} />,
      'MESSAGE_SENT': <MessageSquare className="text-orange-500" size={20} />,
      'PROFILE_UPDATE': <User className="text-blue-500" size={20} />,
      'LOGIN': <User className="text-green-500" size={20} />,
      'POSITIVE_REVIEW': <Award className="text-yellow-500" size={20} />,
      'SERVICE_COMPLETED': <CheckCircle className="text-emerald-500" size={20} />,
      'OFFER_MADE': <TrendingUp className="text-indigo-500" size={20} />,
      'REVIEW_GIVEN': <MessageSquare className="text-pink-500" size={20} />,
      'DAYS_INACTIVE': <AlertTriangle className="text-red-500" size={20} />,
      'PROFILE_INCOMPLETE': <User className="text-gray-500" size={20} />,
      'MESSAGE_IGNORED': <XCircle className="text-red-400" size={20} />
    };
    return iconMap[actionType] || <Activity className="text-gray-500" size={20} />;
  };
  
  const formatActionType = (actionType) => {
    return actionType.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
  };
  
  if (loading && !refreshing) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="loading-spinner mb-4"></div>
          <p className="text-gray-600">Loading engagement data...</p>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <AlertTriangle className="mx-auto mb-4 text-red-500" size={48} />
          <p className="error-message text-red-600">{error}</p>
          <button 
            onClick={fetchEngagementData}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }
  
  if (!engagementData) return null;
  
  const { user, engagement, activities } = engagementData;
  const currentStage = getEngagementStage(engagement.score);
  const StageIcon = currentStage.icon;
  
  return (
    <div className="engagement-container">
      {/* Header with Refresh Button */}
      <div className="header-section">
       
      </div>
      
      {/* User Profile Section */}
      <div className="profile-section">
        <div className="profile-content">
          <div className="avatar">
            {user.profilePicture ? (
              <img 
                src={user.profilePicture} 
                alt={user.username} 
              />
            ) : (
              <User size={40} />
            )}
          </div>
          <div className="user-info">
            <h2>{user.username}</h2>
            <p className="email">{user.email}</p>
            <div className="user-meta">
              <div className="meta-item">
                <Calendar size={16} />
                <span>Joined {formatDate(user.joinedAt)}</span>
              </div>
              {user.location && (
                <div className="meta-item">
                  <MapPin size={16} />
                  <span>{user.location}</span>
                </div>
              )}
              <span className="role-badge">
                {user.role}
              </span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Engagement Score and Stage Visualization */}
      <div className="engagement-score-section">
        <div className="score-main-card">
          <div className="score-header">
            <Activity size={32} />
            <h2>Engagement Score</h2>
          </div>
          <div className="score-display">
            <div 
              className="score-number"
              style={{ color: getScoreColor(engagement.score) }}
            >
              {Math.round(engagement.score)}
            </div>
            <div className="score-status">
              <StageIcon size={24} style={{ color: currentStage.color }} />
              <span style={{ color: currentStage.color }}>{currentStage.name}</span>
            </div>
          </div>
          <div className="score-bar-container">
            <div className="score-bar">
              <div 
                className="score-bar-fill"
                style={{ 
                  width: `${engagement.score}%`,
                  backgroundColor: getScoreColor(engagement.score)
                }}
              />
            </div>
          </div>
          <p className="last-updated">
            Last updated: {formatDate(engagement.lastUpdated)}
          </p>
        </div>
        
      {/* Engagement Stages */}
      <div className="stages-card">
          <h3>Your Account Status & Risk Level</h3>
          <div className="stages-list">
            <div className={`stage-item ${currentStage.stage === 0 ? 'active' : ''}`}>
              <CheckCircle size={20} />
              <div>
                <h4>🌟 Fully Engaged (Score: 71-100)</h4>
                <p><strong>Status: SAFE</strong> - You're doing amazing! Your profile is active and visible to everyone.</p>
                <p className="danger-level safe">✅ No risk of deactivation</p>
              </div>
            </div>
            <div className={`stage-item ${currentStage.stage === 1 ? 'active' : ''}`}>
              <Bell size={20} />
              <div>
                <h4>💡 Needs Attention (Score: 51-70)</h4>
                <p><strong>Status: CAUTION</strong>  </p>
                <p className="danger-level caution">⚡ 50 points away from deactivation risk</p>
              </div>
            </div>
            <div className={`stage-item ${currentStage.stage === 2 ? 'active' : ''}`}>
              <AlertCircle size={20} />
              <div>
                <h4>📧 At Risk (Score: 31-50)</h4>
                <p><strong>Status: WARNING</strong> </p>
                <p className="danger-level warning">⚠️ 30 points from deactivation - Take action soon!</p>
              </div>
            </div>
            <div className={`stage-item ${currentStage.stage === 3 ? 'active' : ''}`}>
              <AlertTriangle size={20} />
              <div>
                <h4>🚨 Critical - Deactivation Warning (Score: 1-30)</h4>
                <p><strong>Status: DANGER</strong> - Your account is at serious risk!</p>
                <p className="danger-level danger">🔴 Only {Math.round(engagement.score)} points from deactivation!</p>
                <p style={{fontSize: '0.8rem', marginTop: '0.5rem', fontWeight: '600', color: '#dc2626'}}>
                </p>
              </div>
            </div>
            <div className={`stage-item ${currentStage.stage === 4 ? 'active' : ''}`}>
              <XCircle size={20} />
              <div>
                <h4>❌ Account Deactivated (Score: 0)</h4>
                <p><strong>Status: DEACTIVATED</strong> - Your profile is hidden from all searches and clients.</p>
                <p className="danger-level deactivated">💔 Account deactivated - Log in and take any action to reactivate!</p>
              </div>
            </div>
          </div>
          {currentStage.stage > 0 && currentStage.stage < 4 && (
            <div className={`deactivation-warning stage-${currentStage.stage}`}>
              <AlertTriangle size={20} />
              <div style={{flex: 1}}>
                <p>
                  <strong>Warning:</strong> You are currently <span className="points-away">{Math.round(engagement.score)} points</span> away from account deactivation. 
                  {currentStage.stage === 3 && " Take immediate action to save your account!"}
                  {currentStage.stage === 2 && " Stay active to avoid falling into the danger zone."}
                  {currentStage.stage === 1 && " Keep engaging to maintain your visibility."}
                </p>
                <div className="deactivation-progress">
                  <div className="deactivation-progress-bar">
                    <div 
                      className="deactivation-progress-fill"
                      style={{ width: `${engagement.score}%` }}
                    />
                  </div>
                  <span className="deactivation-progress-label">
                    Score: {Math.round(engagement.score)} / 100
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
        </div>

      {/* Activity Stats Grid */}
      <div className="stats-grid">
        {/* Positive Actions */}
        <div className="stat-card positive-actions">
          <div className="stat-header">
            <TrendingUp size={24} />
            <h3>Positive Actions Summary</h3>
          </div>
          <div className="stat-content">
            <div className="stat-item">
              <FileText size={16} />
              <span className="stat-label">Services Posted</span>
              <span className="stat-value">{engagement.statistics.services_posted || 0}</span>
            </div>
            <div className="stat-item">
              <MessageSquare size={16} />
              <span className="stat-label">Messages Sent</span>
              <span className="stat-value">{engagement.statistics.messages_sent || 0}</span>
            </div>
            <div className="stat-item">
              <CheckCircle size={16} />
              <span className="stat-label">Services Completed</span>
              <span className="stat-value">{engagement.statistics.services_completed || 0}</span>
            </div>
            <div className="stat-item">
              <Award size={16} />
              <span className="stat-label">Reviews Given</span>
              <span className="stat-value">{engagement.statistics.reviews_given || 0}</span>
            </div>
          </div>
        </div>
        
        {/* Score Impact Factors */}
        <div className="stat-card impact-factors">
          <div className="stat-header">
            <Activity size={24} />
            <h3>Score Impact Factors</h3>
          </div>
          <div className="impact-list">
            <div className="impact-item positive">
              <span className="impact-icon">+10</span>
              <span>Login to platform</span>
            </div>
            <div className="impact-item positive">
              <span className="impact-icon">+15</span>
              <span>Post a new service</span>
            </div>
            <div className="impact-item positive">
              <span className="impact-icon">+5</span>
              <span>Send a message</span>
            </div>
            <div className="impact-item positive">
              <span className="impact-icon">+8</span>
              <span>Update your profile</span>
            </div>
            <div className="impact-item positive">
              <span className="impact-icon">+20</span>
              <span>Complete a service</span>
            </div>
            <div className="impact-item positive">
              <span className="impact-icon">+12</span>
              <span>Make an offer</span>
            </div>
            <div className="impact-item positive">
              <span className="impact-icon">+10</span>
              <span>Review someone else</span>
            </div>
            <div className="impact-item positive">
              <span className="impact-icon">+15</span>
              <span>Receive positive review</span>
            </div>
            <div className="impact-item negative">
              <span className="impact-icon">-2</span>
              <span>Per day inactive (after 3 days)</span>
            </div>
            <div className="impact-item negative">
              <span className="impact-icon">-20</span>
              <span>Incomplete profile</span>
            </div>
            <div className="impact-item negative">
              <span className="impact-icon">-5</span>
              <span>Per ignored message</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Activity History */}
      <div className="activity-history">
        <h3>Recent Activity Timeline (Last 5)</h3>
        
        {activities.items.length === 0 ? (
          <div className="empty-state">
            <Activity size={48} />
            <p>No activities recorded yet</p>
          </div>
        ) : (
          <div className="activities">
            {activities.items.slice(0, 5).map((activity) => (
              <div 
                key={activity.id} 
                className="activity-item"
              >
                <div className="activity-icon">
                  {getActionIcon(activity.action_type)}
                </div>
                <div className="activity-content">
                  <div className="activity-header">
                    <span className="activity-type">
                      {formatActionType(activity.action_type)}
                    </span>
                    <span className="activity-time">
                      {formatDate(activity.created_at)}
                    </span>
                  </div>
                  <div className="activity-score">
                    Score impact: 
                    <span className={`score-change ${activity.score_change >= 0 ? 'positive' : 'negative'}`}>
                      {activity.score_change >= 0 ? '+' : ''}{activity.score_change}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        
        {/* Pagination */}
        {activities.pagination.totalPages > 1 && (
          <div className="pagination">
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={!activities.pagination.hasPrevPage}
              className="pagination-button"
            >
              <ChevronLeft size={16} />
              Previous
            </button>
            <span className="pagination-info">
              Page {currentPage} of {activities.pagination.totalPages}
              <span className="pagination-total">
                ({activities.pagination.totalItems} total activities)
              </span>
            </span>
            <button
              onClick={() => setCurrentPage(prev => Math.min(activities.pagination.totalPages, prev + 1))}
              disabled={!activities.pagination.hasNextPage}
              className="pagination-button"
            >
              Next
              <ChevronRight size={16} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserEngagement;