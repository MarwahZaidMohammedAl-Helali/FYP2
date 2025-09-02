// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './components/LoginPage';
import SignUpPage from './components/SignUpPage';
import AdminDashboard from './components/AdminDashboard';
import UserDashboard from './components/UserDashboard';
import EmailVerification from './components/EmailVerification';
import TradeTalentHomepage from './components/TradeTalentHomepage';
import Favorites from './components/Favorites';
import Profile from './components/Profile';
import MyReviews from './components/MyReviews';
import MyRatings from './components/MyRatings';
import Chat from './components/Chat';
import HelpCenter from './components/HelpCenter';
import Notifications from './components/Notifications';
import MyOffersToOthers from './components/MyOffersToOthers';
import Responses from './components/Responses';
import OngoingServices from './components/OngoingServices';
import CompletedServices from './components/CompletedServices';
import AddService from './components/AddService';
import ResetPassword from './components/ResetPassword';
import SessionDebug from './components/SessionDebug';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<TradeTalentHomepage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignUpPage />} />
          <Route path="/verify-email" element={<EmailVerification />} />
          <Route path="/admin-dashboard" element={<AdminDashboard />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/debug-session" element={<SessionDebug />} />
          
          {/* User Dashboard with nested routes */}
          <Route path="/user-dashboard/*" element={<UserDashboard />}>
            <Route path="favorites" element={<Favorites />} />
            <Route path="profile" element={<Profile />} />
            <Route path="reviews" element={<MyReviews />} />
            <Route path="rating" element={<MyRatings />} />
            <Route path="chat" element={<Chat />} />
            <Route path="help" element={<HelpCenter />} />
            <Route path="notifications" element={<Notifications />} />
            <Route path="my-offers" element={<MyOffersToOthers />} />
            <Route path="responses" element={<Responses />} />
            <Route path="ongoing-services" element={<OngoingServices />} />
            <Route path="completed-services" element={<CompletedServices />} />
            <Route path="add-service" element={<AddService />} />
            <Route index element={<Navigate to="profile" replace />} />
          </Route>
        </Routes>
      </div>
    </Router>
  );
}

export default App;