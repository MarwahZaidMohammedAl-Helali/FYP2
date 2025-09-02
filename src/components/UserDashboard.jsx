// src/components/UserDashboard.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  User, 
  Heart, 
  FileText, 
  Award, 
  Image, 
  Users, 
  MessageSquare, 
  Settings, 
  Bell, 
  Menu,
  LogOut,
  Star,
  BarChart3,
  Calendar,
  HelpCircle,
  X,
  ChevronDown,
  Search,
  Activity
} from 'lucide-react';
import Profile from './Profile';
import Favorites from './Favorites';
import MyReviews from './MyReviews';
import MyRatings from './MyRatings';
import Chat from './Chat';
import HelpCenter from './HelpCenter';
import Notifications from './Notifications';
import EngagementNotifications from './EngagementNotifications';
import MyOffersToOthers from './MyOffersToOthers';
import Responses from './Responses';
import OngoingServices from './OngoingServices';
import CompletedServices from './CompletedServices';
import AddService from './AddService';
import Services from './Services';
import UserEngagement from './UserEngagement';

const UserDashboard = () => {
  const [activeSection, setActiveSection] = useState('services');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [openSubmenu, setOpenSubmenu] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [userId, setUserId] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Set active section based on URL on component mount and URL changes
  useEffect(() => {
    const path = location.pathname.split('/').pop();
    if (path && path !== 'user-dashboard') {
      setActiveSection(path);
    }
  }, [location]);

  // Check authentication and get user ID on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        console.log('Checking authentication...');
        const response = await fetch('http://localhost:3001/api/check-session', {
          credentials: 'include',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          }
        });
        
        console.log('Auth check response status:', response.status);
        
        if (!response.ok) {
          throw new Error('Session expired');
        }
        
        const data = await response.json();
        console.log('Auth check response:', data);
        
        if (!data.authenticated) {
          console.log('Not authenticated, redirecting to login');
          navigate('/login');
          return;
        }
        
        // Set the user ID from the session data
        setUserId(data.userId);
        console.log('Authentication confirmed');
      } catch (error) {
        console.error('Auth check failed:', error);
        navigate('/login');
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
    
    // Set up periodic session checks (every 5 minutes)
    const interval = setInterval(checkAuth, 5 * 60 * 1000);
    
    return () => {
      console.log('Cleaning up auth check interval');
      clearInterval(interval);
    };
  }, [navigate]);

  // Handle logout
  const handleLogout = async () => {
    try {
      console.log('Attempting to logout...');
      const response = await fetch('http://localhost:3001/api/logout', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        }
      });
      
      console.log('Logout response status:', response.status);
      
      if (response.ok) {
        console.log('Logout successful');
        localStorage.removeItem('user'); // Clean up any local storage
        navigate('/login', { replace: true }); // Use replace to prevent back navigation
      } else {
        console.error('Logout failed:', await response.text());
      }
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  // Close sidebar when clicking outside on mobile
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (sidebarOpen && !event.target.closest('.sidebar') && !event.target.closest('.menu-toggle')) {
        setSidebarOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [sidebarOpen]);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 1024) {
        setSidebarOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const menuItems = [
    { 
      id: 'services', 
      label: 'Services', 
      icon: BarChart3,
      submenu: [
        {
          id: 'search-services',
          label: 'Search Services',
          action: () => {
            setActiveSection('services');
            navigate('/user-dashboard/services');
          }
        },
        { 
          id: 'add-service', 
          label: 'Add a service', 
          action: () => {
            setActiveSection('add-service');
            navigate('/user-dashboard/add-service');
          }
        },
        { 
          id: 'my-offers', 
          label: 'My offers to other', 
          action: () => {
            setActiveSection('my-offers');
            navigate('/user-dashboard/my-offers');
          }
        },
        { 
          id: 'responses', 
          label: 'Responses', 
          action: () => {
            setActiveSection('responses');
            navigate('/user-dashboard/responses');
          }
        },
        { 
          id: 'ongoing-services', 
          label: 'Ongoing Services', 
          action: () => {
            setActiveSection('ongoing-services');
            navigate('/user-dashboard/ongoing-services');
          }
        },
        { 
          id: 'completed-services', 
          label: 'Completed Services', 
          action: () => {
            setActiveSection('completed-services');
            navigate('/user-dashboard/completed-services');
          }
        }
      ]
    },
    {
      id: 'engagement',
      label: 'My Engagement',
      icon: Activity,
      action: () => {
        setActiveSection('engagement');
        navigate('/user-dashboard/engagement');
      }
    },
    { 
      id: 'profile', 
      label: 'Profile', 
      icon: User,
      action: () => {
        setActiveSection('profile');
        navigate('/user-dashboard/profile');
      }
    },
    { 
      id: 'favorites', 
      label: 'Favorites', 
      icon: Heart,
      action: () => {
        setActiveSection('favorites');
        navigate('/user-dashboard/favorites');
      }
    },
    { 
      id: 'reviews', 
      label: 'Reviews', 
      icon: FileText, 
      submenu: [
        { 
          id: 'my-reviews', 
          label: 'My Reviews', 
          action: () => {
            setActiveSection('reviews');
            navigate('/user-dashboard/reviews');
          }
        },
        { 
          id: 'my-rate', 
          label: 'My Rate', 
          action: () => {
            setActiveSection('rating');
            navigate('/user-dashboard/rating');
          }
        }
      ]
    },
    { 
      id: 'chat', 
      label: 'Chat', 
      icon: MessageSquare,
      action: () => {
        setActiveSection('chat');
        navigate('/user-dashboard/chat');
      }
    },
    { 
      id: 'help', 
      label: 'Help Center', 
      icon: HelpCircle,
      action: () => {
        setActiveSection('help');
        navigate('/user-dashboard/help');
      }
    },
    { 
      id: 'notifications', 
      label: 'Notifications', 
      icon: Bell,
      action: () => {
        setActiveSection('notifications');
        navigate('/user-dashboard/notifications');
      }
    },
    { 
      id: 'logout', 
      label: 'Logout', 
      icon: LogOut,
      action: handleLogout
    }
  ];

  const toggleSubmenu = (itemId) => {
    setOpenSubmenu(openSubmenu === itemId ? null : itemId);
  };

  const handleMenuItemClick = (item) => {
    if (item.submenu) {
      toggleSubmenu(item.id);
    } else if (item.action) {
      item.action();
      setSidebarOpen(false);
    }
  };

  const renderContent = () => {
    if (isLoading || !userId) {
      return <div className="loading">Loading...</div>;
    }

    switch (activeSection) {
      case 'services':
        return <Services userId={userId} />;
      case 'profile':
        return <Profile userId={userId} />;
      case 'favorites':
        return <Favorites userId={userId} />;
      case 'reviews':
        return <MyReviews userId={userId} />;
      case 'rating':
        return <MyRatings userId={userId} />;
      case 'chat':
        return <Chat userId={userId} />;
      case 'help':
        return <HelpCenter userId={userId} />;
      case 'notifications':
        return (
          <div className="notifications-wrapper">
            <Notifications userId={userId} />
            <EngagementNotifications userId={userId} />
          </div>
        );
      case 'my-offers':
        return <MyOffersToOthers userId={userId} />;
      case 'responses':
        return <Responses userId={userId} />;
      case 'ongoing-services':
        return <OngoingServices userId={userId} />;
      case 'completed-services':
        return <CompletedServices userId={userId} />;
      case 'add-service':
        return <AddService userId={userId} />;
      case 'engagement':
        return <UserEngagement userId={userId} />;
      default:
        return <Services userId={userId} />;
    }
  };

  return (
    <div className="dashboard-container">
      {/* Sidebar Overlay */}
      <div 
        className={`sidebar-overlay ${sidebarOpen ? 'active' : ''}`}
        onClick={() => setSidebarOpen(false)}
      />

      {/* Enhanced Sidebar */}
      <div className={`sidebar ${!sidebarOpen ? 'closed' : ''}`}>
        <div className="sidebar-header">
          <h2>
            <User size={20} />
            User Dashboard
          </h2>
          <button 
            className="sidebar-close"
            onClick={() => setSidebarOpen(false)}
          >
            <X size={20} />
          </button>
        </div>
        
        <nav className="sidebar-menu">
          {menuItems.map((item) => (
            <div key={item.id} className="menu-section">
              <button 
                className={`sidebar-item ${activeSection === item.id ? 'active' : ''}`}
                onClick={() => handleMenuItemClick(item)}
              >
                {React.createElement(item.icon, { size: 18 })}
                {item.label}
                {item.submenu && (
                  <ChevronDown 
                    className={`submenu-toggle ${openSubmenu === item.id ? 'open' : ''}`}
                    size={16}
                  />
                )}
              </button>
              {item.submenu && (
                <div className={`sidebar-submenu ${openSubmenu === item.id ? 'open' : ''}`}>
                  {item.submenu.map((subItem) => (
                    <button 
                      key={subItem.id} 
                      className={`sidebar-item ${activeSection === subItem.id ? 'active' : ''}`}
                      onClick={() => {
                        subItem.action();
                        setSidebarOpen(false);
                      }}
                    >
                      {subItem.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </nav>
      </div>

      {/* Enhanced Main Content */}
      <div className="main-content-dashboard">
        {/* Enhanced Header */}
        <div className="dashboard-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <button 
              className="menu-toggle"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              <Menu size={20} />
            </button>
            <h1>
              {activeSection.split('-').map(word => 
                word.charAt(0).toUpperCase() + word.slice(1)
              ).join(' ')}
            </h1>
          </div>
          
          <div className="header-actions">
            <div className="header-search">
              <Search size={16} />
              <input
                type="text"
                placeholder="Search dashboard..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>

        
       {/* Dynamic Content Based on Active Section */}
       {renderContent()}
      </div>
    </div>
  );
};

export default UserDashboard;