import React from 'react';
import { BarChart, LineChart } from '../Charts';

const MetricCard = ({ title, value, icon, iconBgColor, chartType = 'line', data = [] }) => {
  const renderChart = () => {
    if (chartType === 'bar') {
      return <BarChart data={data} height={60} />;
    }
    return <LineChart data={data} height={60} />;
  };

  const getIconBgClass = () => {
    switch (iconBgColor) {
      case 'emerald':
        return 'bg-emerald-500';
      case 'purple':
        return 'bg-purple-500';
      case 'blue':
        return 'bg-blue-500';
      default:
        return 'bg-blue-500';
    }
  };

  return (
    <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white">{title}</h3>
        <div className={`w-10 h-10 ${getIconBgClass()} rounded-lg flex items-center justify-center`}>
          <span className="text-white font-bold text-sm">{icon}</span>
        </div>
      </div>
      <div className="text-3xl font-bold text-white mb-4">{value}</div>
      <div className="h-16">
        {renderChart()}
      </div>
    </div>
  );
};

export default MetricCard;
