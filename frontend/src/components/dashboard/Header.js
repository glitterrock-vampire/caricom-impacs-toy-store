import React from 'react';
import './Header.css';

const Header = ({ darkMode, toggleDarkMode }) => {
  return (
    <div className={`header ${darkMode ? 'dark' : 'light'}`}>
      <h1>E-commerce Sales Dashboard</h1>
      
      <div className="header-controls">
        <button 
          className="theme-toggle"
          onClick={toggleDarkMode}
          title={`Switch to ${darkMode ? 'light' : 'dark'} mode`}
        >
          {darkMode ? '☀️' : '🌙'}
        </button>
        
        <div className="user-profile">
          <div className="user-avatar">JS</div>
          <span>John Smith</span>
          <span className="dropdown-arrow">▼</span>
        </div>
      </div>
    </div>
  );
};

export default Header;