// src/components/AdminDashboard.jsx
import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  PieChart,
  Menu,
  Settings,
  Bell,
  Search
} from 'lucide-react';

const AdminDashboard = ({ onNavigate }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Sample data for charts
  const userGrowthData = [
    { month: 'Jan', users: 2400 },
    { month: 'Feb', users: 2100 },
    { month: 'Mar', users: 2800 },
    { month: 'Apr', users: 2600 },
    { month: 'May', users: 3200 },
    { month: 'Jun', users: 3800 }
  ];

  const platformTimeData = [
    { week: 'Week 1', time: 45 },
    { week: 'Week 2', time: 52 },
    { week: 'Week 3', time: 48 },
    { week: 'Week 4', time: 61 }
  ];

  const serviceExchangeData = [
    { category: 'Web Development', count: 180 },
    { category: 'Design', count: 240 },
    { category: 'Marketing', count: 120 },
    { category: 'Writing', count: 200 }
  ];

  const serviceTypeDistribution = [
    { type: 'Technical', percentage: 45, color: '#4a8fe1' },
    { type: 'Creative', percentage: 30, color: '#6fa8f5' },
    { type: 'Business', percentage: 15, color: '#9cb4ff' },
    { type: 'Other', percentage: 10, color: '#c4d3ff' }
  ];

  return (
    <div className="dashboard-container">
      {/* Sidebar */}
      <div className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <Menu size={20} />
          <h2>Admin Dashboard</h2>
        </div>
      </div>

      {/* Main Content */}
      <div className="main-content-dashboard">
        {/* Header */}
        <div className="dashboard-header">
          <Menu 
            size={20} 
            className="md:hidden cursor-pointer"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          />
          <h1>Admin Dashboard</h1>
        </div>

        {/* Analytics Dashboard */}
        <div className="dashboard-content" style={{ padding: '2rem', backgroundColor: '#f8f9fa' }}>
          <div style={{ 
            backgroundColor: 'white', 
            borderRadius: '16px', 
            padding: '2rem',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)'
          }}>
            <h2 style={{ 
              fontSize: '1.5rem', 
              fontWeight: '700', 
              color: '#2d3748', 
              marginBottom: '2rem' 
            }}>
              Analytics Dashboard
            </h2>

            {/* Charts Grid */}
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(2, 1fr)', 
              gap: '2rem',
              marginBottom: '2rem'
            }}>
              {/* User Growth Chart */}
              <div style={{ 
                padding: '1.5rem', 
                border: '1px solid #e2e8f0', 
                borderRadius: '12px',
                backgroundColor: '#fafafa'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                  <TrendingUp size={16} style={{ color: '#4a8fe1' }} />
                  <h3 style={{ 
                    fontSize: '1rem', 
                    fontWeight: '600', 
                    color: '#4a5568',
                    margin: 0
                  }}>
                    User Growth (Monthly)
                  </h3>
                </div>
                
                {/* Simple Line Chart */}
                <div style={{ height: '200px', position: 'relative' }}>
                  <svg width="100%" height="100%" viewBox="0 0 300 200">
                    <defs>
                      <linearGradient id="lineGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#4a8fe1" stopOpacity="0.3"/>
                        <stop offset="100%" stopColor="#4a8fe1" stopOpacity="0.1"/>
                      </linearGradient>
                    </defs>
                    
                    {/* Grid lines */}
                    {[40, 80, 120, 160].map((y, i) => (
                      <line key={i} x1="40" y1={y} x2="280" y2={y} stroke="#e2e8f0" strokeWidth="1"/>
                    ))}
                    
                    {/* Data line */}
                    <polyline
                      fill="none"
                      stroke="#4a8fe1"
                      strokeWidth="3"
                      points="60,120 100,140 140,80 180,100 220,60 260,40"
                    />
                    
                    {/* Fill area */}
                    <polygon
                      fill="url(#lineGradient)"
                      points="60,120 100,140 140,80 180,100 220,60 260,40 260,180 60,180"
                    />
                    
                    {/* Data points */}
                    {[
                      {x: 60, y: 120}, {x: 100, y: 140}, {x: 140, y: 80}, 
                      {x: 180, y: 100}, {x: 220, y: 60}, {x: 260, y: 40}
                    ].map((point, i) => (
                      <circle key={i} cx={point.x} cy={point.y} r="4" fill="#4a8fe1"/>
                    ))}
                    
                    {/* X-axis labels */}
                    {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'].map((month, i) => (
                      <text key={i} x={60 + i * 40} y="195" textAnchor="middle" fontSize="10" fill="#64748b">
                        {month}
                      </text>
                    ))}
                  </svg>
                </div>
                
                <p style={{ 
                  fontSize: '0.8rem', 
                  color: '#64748b', 
                  margin: '1rem 0 0 0',
                  textAlign: 'center'
                }}>
                  Track the number of users joining the platform each month to measure growth
                </p>
              </div>

              {/* Average Platform Time */}
              <div style={{ 
                padding: '1.5rem', 
                border: '1px solid #e2e8f0', 
                borderRadius: '12px',
                backgroundColor: '#fafafa'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                  <BarChart3 size={16} style={{ color: '#4a8fe1' }} />
                  <h3 style={{ 
                    fontSize: '1rem', 
                    fontWeight: '600', 
                    color: '#4a5568',
                    margin: 0
                  }}>
                    Average Time on Platform (Weeks)
                  </h3>
                </div>
                
                {/* Simple Bar Chart */}
                <div style={{ height: '200px', position: 'relative' }}>
                  <svg width="100%" height="100%" viewBox="0 0 300 200">
                    {/* Grid lines */}
                    {[40, 80, 120, 160].map((y, i) => (
                      <line key={i} x1="60" y1={y} x2="280" y2={y} stroke="#e2e8f0" strokeWidth="1"/>
                    ))}
                    
                    {/* Bars */}
                    {[
                      {x: 70, height: 90, value: 45}, 
                      {x: 120, height: 104, value: 52}, 
                      {x: 170, height: 96, value: 48}, 
                      {x: 220, height: 122, value: 61}
                    ].map((bar, i) => (
                      <g key={i}>
                        <rect 
                          x={bar.x} 
                          y={180 - bar.height} 
                          width="30" 
                          height={bar.height}
                          fill="#4a8fe1"
                          rx="4"
                        />
                        <text 
                          x={bar.x + 15} 
                          y={170 - bar.height} 
                          textAnchor="middle" 
                          fontSize="10" 
                          fill="#2d3748"
                          fontWeight="600"
                        >
                          {bar.value}
                        </text>
                      </g>
                    ))}
                    
                    {/* X-axis labels */}
                    {['Week 1', 'Week 2', 'Week 3', 'Week 4'].map((week, i) => (
                      <text key={i} x={85 + i * 50} y="195" textAnchor="middle" fontSize="10" fill="#64748b">
                        {week}
                      </text>
                    ))}
                  </svg>
                </div>
                
                <p style={{ 
                  fontSize: '0.8rem', 
                  color: '#64748b', 
                  margin: '1rem 0 0 0',
                  textAlign: 'center'
                }}>
                  This chart shows the average time users spend on the platform per week
                </p>
              </div>
            </div>

            {/* Second Row Charts */}
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(2, 1fr)', 
              gap: '2rem'
            }}>
              {/* Service Exchanges by Category */}
              <div style={{ 
                padding: '1.5rem', 
                border: '1px solid #e2e8f0', 
                borderRadius: '12px',
                backgroundColor: '#fafafa'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                  <BarChart3 size={16} style={{ color: '#4a8fe1' }} />
                  <h3 style={{ 
                    fontSize: '1rem', 
                    fontWeight: '600', 
                    color: '#4a5568',
                    margin: 0
                  }}>
                    Service Exchanges by Category
                  </h3>
                </div>
                
                {/* Column Chart */}
                <div style={{ height: '200px', position: 'relative' }}>
                  <svg width="100%" height="100%" viewBox="0 0 300 200">
                    {/* Grid lines */}
                    {[40, 80, 120, 160].map((y, i) => (
                      <line key={i} x1="40" y1={y} x2="280" y2={y} stroke="#e2e8f0" strokeWidth="1"/>
                    ))}
                    
                    {/* Bars */}
                    {[
                      {x: 50, height: 72, label: 'Web Dev'}, 
                      {x: 100, height: 96, label: 'Design'}, 
                      {x: 150, height: 48, label: 'Marketing'}, 
                      {x: 200, height: 80, label: 'Writing'}
                    ].map((bar, i) => (
                      <g key={i}>
                        <rect 
                          x={bar.x} 
                          y={180 - bar.height} 
                          width="40" 
                          height={bar.height}
                          fill="#6fa8f5"
                          rx="4"
                        />
                        <text 
                          x={bar.x + 20} 
                          y="195" 
                          textAnchor="middle" 
                          fontSize="9" 
                          fill="#64748b"
                        >
                          {bar.label}
                        </text>
                      </g>
                    ))}
                    
                    {/* Y-axis labels */}
                    {['0', '50', '100', '150', '200', '250'].map((value, i) => (
                      <text key={i} x="35" y={185 - i * 30} textAnchor="end" fontSize="9" fill="#64748b">
                        {value}
                      </text>
                    ))}
                  </svg>
                </div>
              </div>

              {/* Service Type Distribution - Pie Chart */}
              <div style={{ 
                padding: '1.5rem', 
                border: '1px solid #e2e8f0', 
                borderRadius: '12px',
                backgroundColor: '#fafafa'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                  <PieChart size={16} style={{ color: '#4a8fe1' }} />
                  <h3 style={{ 
                    fontSize: '1rem', 
                    fontWeight: '600', 
                    color: '#4a5568',
                    margin: 0
                  }}>
                    Service Type Distribution
                  </h3>
                </div>
                
                {/* Pie Chart */}
                <div style={{ height: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <div style={{ position: 'relative' }}>
                    <svg width="160" height="160" viewBox="0 0 160 160">
                      {/* Pie segments */}
                      <circle
                        cx="80"
                        cy="80"
                        r="60"
                        fill="none"
                        stroke="#4a8fe1"
                        strokeWidth="40"
                        strokeDasharray="169.6 207.2"
                        strokeDashoffset="0"
                        transform="rotate(-90 80 80)"
                      />
                      <circle
                        cx="80"
                        cy="80"
                        r="60"
                        fill="none"
                        stroke="#6fa8f5"
                        strokeWidth="40"
                        strokeDasharray="113.1 263.7"
                        strokeDashoffset="-169.6"
                        transform="rotate(-90 80 80)"
                      />
                      <circle
                        cx="80"
                        cy="80"
                        r="60"
                        fill="none"
                        stroke="#9cb4ff"
                        strokeWidth="40"
                        strokeDasharray="56.5 320.3"
                        strokeDashoffset="-282.7"
                        transform="rotate(-90 80 80)"
                      />
                      <circle
                        cx="80"
                        cy="80"
                        r="60"
                        fill="none"
                        stroke="#c4d3ff"
                        strokeWidth="40"
                        strokeDasharray="37.7 339.1"
                        strokeDashoffset="-339.2"
                        transform="rotate(-90 80 80)"
                      />
                    </svg>
                    
                    {/* Legend */}
                    <div style={{ 
                      position: 'absolute', 
                      right: '-120px', 
                      top: '20px',
                      fontSize: '0.8rem'
                    }}>
                      {serviceTypeDistribution.map((item, i) => (
                        <div key={i} style={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: '0.5rem',
                          marginBottom: '0.5rem'
                        }}>
                          <div style={{ 
                            width: '12px', 
                            height: '12px', 
                            backgroundColor: item.color,
                            borderRadius: '2px'
                          }}></div>
                          <span style={{ color: '#4a5568' }}>
                            {item.type} ({item.percentage}%)
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;