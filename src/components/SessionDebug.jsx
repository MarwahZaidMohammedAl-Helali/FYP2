// Create src/components/SessionDebug.jsx
import React, { useState } from 'react';
import axiosInstance from '../utils/axiosConfig';

const SessionDebug = () => {
  const [sessionInfo, setSessionInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const checkSession = async () => {
    setLoading(true);
    setError(null);
    try {
      console.log('Checking session...');
      const response = await axiosInstance.get('/api/debug-session');
      console.log('Session response:', response.data);
      setSessionInfo(response.data);
    } catch (err) {
      console.error('Session check error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const testEngagementAPI = async () => {
    if (!sessionInfo?.userId) {
      alert('No user ID in session!');
      return;
    }
    
    setLoading(true);
    setError(null);
    try {
      console.log('Testing engagement API...');
      const response = await axiosInstance.get(`/api/user-engagement/${sessionInfo.userId}?page=1&pageSize=10`);
      console.log('Engagement API response:', response.data);
      alert('Success! Check console for data.');
    } catch (err) {
      console.error('Engagement API error:', err);
      setError(`Engagement API Error: ${err.response?.data?.error || err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
      <h2>Session Debug Tool</h2>
      
      <div style={{ marginBottom: '20px' }}>
        <button 
          onClick={checkSession}
          disabled={loading}
          style={{
            padding: '10px 20px',
            marginRight: '10px',
            backgroundColor: '#4CAF50',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: loading ? 'not-allowed' : 'pointer'
          }}
        >
          Check Session
        </button>
        
        <button 
          onClick={testEngagementAPI}
          disabled={loading || !sessionInfo}
          style={{
            padding: '10px 20px',
            backgroundColor: '#2196F3',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: loading || !sessionInfo ? 'not-allowed' : 'pointer'
          }}
        >
          Test Engagement API
        </button>
      </div>

      {loading && <p>Loading...</p>}
      
      {error && (
        <div style={{ 
          padding: '10px', 
          backgroundColor: '#f44336', 
          color: 'white', 
          borderRadius: '4px',
          marginBottom: '10px'
        }}>
          Error: {error}
        </div>
      )}
      
      {sessionInfo && (
        <div style={{ 
          padding: '10px', 
          backgroundColor: '#f0f0f0', 
          borderRadius: '4px',
          fontFamily: 'monospace',
          fontSize: '14px'
        }}>
          <h3>Session Info:</h3>
          <pre>{JSON.stringify(sessionInfo, null, 2)}</pre>
        </div>
      )}
    </div>
  );
};

export default SessionDebug;