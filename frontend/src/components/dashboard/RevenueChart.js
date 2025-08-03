import React from 'react';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer } from 'recharts';

const RevenueChart = ({ darkMode }) => {
  const data = [
    { month: 'Jan', revenue1: 400, revenue2: 300 },
    { month: 'Feb', revenue1: 300, revenue2: 400 },
    { month: 'Mar', revenue1: 600, revenue2: 500 },
    { month: 'Apr', revenue1: 500, revenue2: 600 },
    { month: 'May', revenue1: 700, revenue2: 650 },
    { month: 'Jun', revenue1: 600, revenue2: 700 },
    { month: 'Jul', revenue1: 800, revenue2: 750 },
    { month: 'Aug', revenue1: 750, revenue2: 800 },
    { month: 'Sep', revenue1: 900, revenue2: 850 },
    { month: 'Oct', revenue1: 850, revenue2: 900 },
    { month: 'Nov', revenue1: 950, revenue2: 920 },
    { month: 'Dec', revenue1: 900, revenue2: 950 }
  ];

  return (
    <div>
      <h3 style={{ margin: '0 0 20px 0', fontSize: '18px' }}>Revenue</h3>
      <ResponsiveContainer width="100%" height={250}>
        <LineChart data={data}>
          <XAxis 
            dataKey="month" 
            axisLine={false}
            tickLine={false}
            tick={{ fill: darkMode ? '#8b949e' : '#6b7280', fontSize: 12 }}
          />
          <YAxis hide />
          <Line 
            type="monotone" 
            dataKey="revenue1" 
            stroke="#3b82f6" 
            strokeWidth={3}
            dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
            activeDot={{ r: 6, fill: '#3b82f6' }}
          />
          <Line 
            type="monotone" 
            dataKey="revenue2" 
            stroke="#ec4899" 
            strokeWidth={3}
            dot={{ fill: '#ec4899', strokeWidth: 2, r: 4 }}
            activeDot={{ r: 6, fill: '#ec4899' }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default RevenueChart;