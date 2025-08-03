// src/components/Charts.js
import React from 'react';
import {
  LineChart as LC,
  Line,
  XAxis,
  YAxis,
  PieChart as PC,
  Pie,
  Cell,
  BarChart as BC,
  Bar,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip as RechartsTooltip
} from 'recharts';

// Color palette
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

// Custom tooltip
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-2 border border-gray-200 rounded shadow-lg">
        <p className="font-semibold">{label}</p>
        {payload.map((entry, index) => (
          <p key={index} style={{ color: entry.color }}>
            {entry.name}: {entry.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

// Common chart props
const chartProps = {
  margin: { top: 5, right: 20, left: 0, bottom: 5 },
  className: "w-full h-[300px]"
};

export function LineChart({ data, xDataKey = "day", yDataKey = "value", stroke = COLORS[0] }) {
  if (!data || data.length === 0) {
    return <NoDataMessage />;
  }

  return (
    <div {...chartProps}>
      <ResponsiveContainer width="100%" height="100%">
        <LC data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis 
            dataKey={xDataKey} 
            tick={{ fontSize: 12 }}
            tickLine={false}
          />
          <YAxis 
            tick={{ fontSize: 12 }}
            tickLine={false}
          />
          <RechartsTooltip content={<CustomTooltip />} />
          <Line 
            type="monotone" 
            dataKey={yDataKey} 
            stroke={stroke} 
            strokeWidth={2}
            dot={{ r: 3 }}
            activeDot={{ r: 5 }}
          />
        </LC>
      </ResponsiveContainer>
    </div>
  );
}

export function PieChart({ data, dataKey = "count", nameKey = "name" }) {
  if (!data || data.length === 0) {
    return <NoDataMessage />;
  }

  return (
    <div {...chartProps}>
      <ResponsiveContainer width="100%" height="100%">
        <PC>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            outerRadius={80}
            fill="#8884d8"
            dataKey={dataKey}
            nameKey={nameKey}
            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <RechartsTooltip content={<CustomTooltip />} />
          <Legend />
        </PC>
      </ResponsiveContainer>
    </div>
  );
}

export function BarChart({ data, xDataKey = "name", yDataKey = "value", fill = COLORS[1] }) {
  if (!data || data.length === 0) {
    return <NoDataMessage />;
  }

  return (
    <div {...chartProps}>
      <ResponsiveContainer width="100%" height="100%">
        <BC data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis 
            dataKey={xDataKey} 
            tick={{ fontSize: 12 }}
            tickLine={false}
          />
          <YAxis 
            tick={{ fontSize: 12 }}
            tickLine={false}
          />
          <RechartsTooltip content={<CustomTooltip />} />
          <Legend />
          <Bar dataKey={yDataKey} fill={fill} radius={[4, 4, 0, 0]}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Bar>
        </BC>
      </ResponsiveContainer>
    </div>
  );
}

// Helper component for no data state
const NoDataMessage = () => (
  <div className="flex items-center justify-center h-full text-gray-500">
    No data available
  </div>
);
