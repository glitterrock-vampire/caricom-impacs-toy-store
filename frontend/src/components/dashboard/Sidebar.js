import React from 'react';

const Sidebar = () => {
  const sidebarStyle = {
    width: '256px',
    backgroundColor: '#1e293b',
    borderRight: '1px solid #334155',
    minHeight: '100vh',
    position: 'relative',
    fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
  };

  const brandStyle = {
    padding: '24px',
    borderBottom: '1px solid #334155'
  };

  const brandTitleStyle = {
    fontSize: '20px',
    fontWeight: 'bold',
    color: 'white',
    margin: 0
  };

  const brandSubtitleStyle = {
    fontSize: '14px',
    color: '#94a3b8',
    marginTop: '4px',
    margin: '4px 0 0 0'
  };

  const navigationStyle = {
    padding: '24px'
  };

  const sectionStyle = {
    marginBottom: '32px'
  };

  const sectionTitleStyle = {
    fontSize: '12px',
    fontWeight: '600',
    color: '#94a3b8',
    textTransform: 'uppercase',
    marginBottom: '16px',
    letterSpacing: '0.05em',
    margin: '0 0 16px 0'
  };

  const navItemsStyle = {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px'
  };

  const getNavItemStyle = (active = false) => ({
    display: 'flex',
    alignItems: 'center',
    padding: '12px',
    borderRadius: '8px',
    textDecoration: 'none',
    transition: 'all 0.2s',
    backgroundColor: active ? '#2563eb' : 'transparent',
    color: active ? 'white' : '#cbd5e1',
    cursor: 'pointer'
  });

  const iconStyle = {
    marginRight: '12px',
    fontSize: '18px'
  };

  const labelStyle = {
    fontWeight: '500'
  };

  const logoutContainerStyle = {
    position: 'absolute',
    bottom: '24px',
    left: '24px',
    right: '24px'
  };

  const navigationItems = [
    { icon: '🔍', label: 'Search', active: true },
    { icon: '⚠️', label: 'Alerts', active: false },
    { icon: '🏷️', label: 'Tags', active: false }
  ];

  const otherItems = [
    { icon: '⚙️', label: 'Settings', active: false },
    { icon: '💡', label: 'Tips', active: false },
    { icon: '🗑️', label: 'Trash', active: false }
  ];

  const handleMouseEnter = (e, active) => {
    if (!active) {
      e.target.style.backgroundColor = '#334155';
      e.target.style.color = 'white';
    }
  };

  const handleMouseLeave = (e, active) => {
    if (!active) {
      e.target.style.backgroundColor = 'transparent';
      e.target.style.color = '#cbd5e1';
    }
  };

  return (
    <div style={sidebarStyle}>
      {/* Brand Header */}
      <div style={brandStyle}>
        <h2 style={brandTitleStyle}>Brand</h2>
        <p style={brandSubtitleStyle}>E-commerce Sales Dashboard</p>
      </div>

      {/* Navigation */}
      <div style={navigationStyle}>
        {/* General Section */}
        <div style={sectionStyle}>
          <h4 style={sectionTitleStyle}>GENERAL</h4>
          <div style={navItemsStyle}>
            {navigationItems.map((item, index) => (
              <div
                key={index}
                style={getNavItemStyle(item.active)}
                onMouseEnter={(e) => handleMouseEnter(e, item.active)}
                onMouseLeave={(e) => handleMouseLeave(e, item.active)}
              >
                <span style={iconStyle}>{item.icon}</span>
                <span style={labelStyle}>{item.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Others Section */}
        <div style={sectionStyle}>
          <h4 style={sectionTitleStyle}>OTHERS</h4>
          <div style={navItemsStyle}>
            {otherItems.map((item, index) => (
              <div
                key={index}
                style={getNavItemStyle(item.active)}
                onMouseEnter={(e) => handleMouseEnter(e, item.active)}
                onMouseLeave={(e) => handleMouseLeave(e, item.active)}
              >
                <span style={iconStyle}>{item.icon}</span>
                <span style={labelStyle}>{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Logout Section */}
      <div style={logoutContainerStyle}>
        <div
          style={getNavItemStyle(false)}
          onMouseEnter={(e) => handleMouseEnter(e, false)}
          onMouseLeave={(e) => handleMouseLeave(e, false)}
        >
          <span style={iconStyle}>🚪</span>
          <span style={labelStyle}>Logout</span>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;