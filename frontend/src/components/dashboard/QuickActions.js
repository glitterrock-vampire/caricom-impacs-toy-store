// src/components/dashboard/QuickActions.js
import React from 'react';
import { Link } from 'react-router-dom';

const QuickActions = () => {
  const actions = [
    { icon: '👥', label: 'Add Customer', to: '/customers/new' },
    { icon: '📦', label: 'New Order', to: '/orders/new' },
    { icon: '📊', label: 'View Reports', to: '/reports' },
    { icon: '📝', label: 'Manage Inventory', to: '/inventory' },
  ];

  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <h3 className="font-semibold mb-4">🚀 Quick Actions</h3>
      <div className="grid grid-cols-2 gap-2">
        {actions.map((action, index) => (
          <Link
            key={index}
            to={action.to}
            className="flex flex-col items-center justify-center p-3 rounded-lg hover:bg-gray-50 transition-colors border border-gray-100"
          >
            <span className="text-2xl mb-1">{action.icon}</span>
            <span className="text-sm text-center">{action.label}</span>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default QuickActions;