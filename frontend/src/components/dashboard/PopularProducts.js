// src/components/dashboard/PopularProducts.js
import React from 'react';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

const PopularProducts = ({ data = [] }) => {
  const chartData = {
    labels: data.map(item => item.name),
    datasets: [
      {
        data: data.map(item => item.percentage),
        backgroundColor: [
          'rgba(59, 130, 246, 0.7)',
          'rgba(99, 102, 241, 0.7)',
          'rgba(168, 85, 247, 0.7)',
          'rgba(236, 72, 153, 0.7)',
          'rgba(6, 182, 212, 0.7)',
        ],
        borderColor: [
          'rgba(59, 130, 246, 1)',
          'rgba(99, 102, 241, 1)',
          'rgba(168, 85, 247, 1)',
          'rgba(236, 72, 153, 1)',
          'rgba(6, 182, 212, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <h3 className="text-lg font-semibold mb-4">🧸 Popular Products</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="h-64">
          <Doughnut data={chartData} />
        </div>
        <div className="flex flex-col justify-center">
          {data.map((item, index) => (
            <div key={item.id} className="flex items-center mb-2">
              <div 
                className="w-4 h-4 mr-2" 
                style={{ 
                  backgroundColor: chartData.datasets[0].backgroundColor[index] 
                }}
              ></div>
              <span className="text-sm">
                {item.name}: {item.percentage}% ({item.count} sold)
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PopularProducts;