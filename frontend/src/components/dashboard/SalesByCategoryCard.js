import React from 'react';
import { PieChart } from '../Charts';

const SalesByCategoryCard = ({ data }) => {
  return (
    <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold text-white">Sales by Category</h3>
        <button className="text-slate-400 hover:text-white transition-colors">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
            <circle cx="10" cy="4" r="1.5"/>
            <circle cx="10" cy="10" r="1.5"/>
            <circle cx="10" cy="16" r="1.5"/>
          </svg>
        </button>
      </div>
      <div className="h-64">
        <PieChart data={data} />
      </div>
    </div>
  );
};

export default SalesByCategoryCard;
