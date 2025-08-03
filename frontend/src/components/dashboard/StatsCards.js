import React from 'react';
import { BarChart, Bar, ResponsiveContainer, LineChart, Line } from 'recharts';
import './StatsCards.css';

const StatsCards = ({ stats, weeklyOrders, darkMode }) => {
  const miniChartData = [
    { value: 80 }, { value: 65 }, { value: 90 }, { value: 75 }, 
    { value: 85 }, { value: 70 }, { value: 95 }
  ];

  return (
    <>
      <div className={`stat-card daily-sales ${darkMode ? 'dark' : 'light'}`}>
        <div className="stat-icon daily-sales-icon">$</div>
        <div className="stat-content">
          <h3>Daily Sales</h3>
          <div className="stat-value">220</div>
        </div>
        <div className="mini-chart">
          <ResponsiveContainer width="100%" height={40}>
            <BarChart data={miniChartData}>
              <Bar dataKey="value" fill="#00d4aa" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className={`stat-card daily-average ${darkMode ? 'dark' : 'light'}`}>
        <div className="stat-icon daily-average-icon">📊</div>
        <div className="stat-content">
          <h3>Daily Average</h3>
          <div className="stat-value">${Math.round(stats?.avg_order_value || 0)}</div>
        </div>
        <div className="mini-chart">
          <ResponsiveContainer width="100%" height={40}>
            <LineChart data={miniChartData}>
              <Line 
                type="monotone" 
                dataKey="value" 
                stroke="#8b5cf6" 
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className={`stat-card total-orders ${darkMode ? 'dark' : 'light'}`}>
        <div className="stat-icon total-orders-icon">🛒</div>
        <div className="stat-content">
          <h3>Total Orders</h3>
          <div className="stat-value">{stats?.total_orders || 1200}</div>
        </div>
        <div className="mini-chart">
          <ResponsiveContainer width="100%" height={40}>
            <LineChart data={miniChartData}>
              <Line 
                type="monotone" 
                dataKey="value" 
                stroke="#3b82f6" 
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </>
  );
};

export default StatsCards;