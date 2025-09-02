import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';

const EmailVerification = () => {
  const [verificationStatus, setVerificationStatus] = useState('Verifying...');
  const [isError, setIsError] = useState(false);
  const [verificationComplete, setVerificationComplete] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const verifyEmail = async () => {
      // If verification is already complete, don't try again
      if (verificationComplete) return;
      
      const params = new URLSearchParams(location.search);
      const token = params.get('token');

      if (!token) {
        setVerificationStatus('Invalid verification link - no token provided.');
        setIsError(true);
        setVerificationComplete(true);
        setTimeout(() => navigate('/login'), 3000);
        return;
      }

      try {
        console.log('Attempting to verify email with token:', token);
        const response = await axios.get(`/api/verify-email?token=${token}`);
        console.log('Server response:', response.data);

        // Mark verification as complete to prevent double attempts
        setVerificationComplete(true);

        if (response.data.success) {
          setVerificationStatus('✓ ' + response.data.message);
          setIsError(false);
          
          // If message indicates already verified, go to login
          if (response.data.message.toLowerCase().includes('already verified')) {
            setTimeout(() => navigate('/login'), 2000);
          } else {
            // For first-time verification:
            // 1. Store user data
            if (response.data.user) {
              const userData = {
                ...response.data.user,
                isAuthenticated: true,
                lastLogin: new Date().toISOString()
              };
              localStorage.setItem('user', JSON.stringify(userData));
            }
            // 2. Redirect based on role
            const userRole = response.data.user?.role;
            const dashboardPath = userRole === 'admin' ? '/admin-dashboard' : '/user-dashboard';
            
            // Use a single timeout for redirection
            const redirectTimer = setTimeout(() => {
              navigate(dashboardPath, { replace: true }); // Using replace to prevent back navigation
            }, 2000);

            // Cleanup timeout if component unmounts
            return () => clearTimeout(redirectTimer);
          }
        } else {
          throw new Error(response.data.message || 'Verification failed');
        }
      } catch (error) {
        console.error('Verification error:', error);
        setIsError(true);
        setVerificationComplete(true);

        // Get the error message from the response
        const errorMessage = error.response?.data?.message || error.message || 'Verification Failed';
        setVerificationStatus('✗ ' + errorMessage);
        
        // Log additional error details for debugging
        if (error.response) {
          console.log('Error response:', {
            status: error.response.status,
            data: error.response.data
          });
        }
        
        setTimeout(() => navigate('/login'), 3000);
      }
    };

    verifyEmail();
  }, [navigate, location, verificationComplete]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className={`mt-6 text-3xl font-extrabold ${isError ? 'text-red-600' : 'text-green-600'}`}>
            {verificationStatus}
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            {isError ? 'Redirecting to login page...' : 'Please wait...'}
          </p>
        </div>
      </div>
    </div>
  );
};

export default EmailVerification; 