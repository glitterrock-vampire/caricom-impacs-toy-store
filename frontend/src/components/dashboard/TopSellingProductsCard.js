import React from 'react';

const TopSellingProductsCard = ({ products = [] }) => {
  const defaultProducts = [
    {
      id: 1,
      name: 'Head Phone',
      icon: '🎧',
      price: '$108.50',
      quantity: 184,
      amount: '$1,965.81'
    },
    {
      id: 2,
      name: 'Nike Sports',
      icon: '👟',
      price: '$111.50',
      quantity: 55,
      amount: '$2,965.81'
    },
    {
      id: 3,
      name: 'Watch',
      icon: '⌚',
      price: '$103.50',
      quantity: 23,
      amount: '$1,665.81'
    }
  ];

  const displayProducts = products.length > 0 ? products : defaultProducts;

  return (
    <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold text-white">Top Selling Product</h3>
        <button className="text-slate-400 hover:text-white transition-colors">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
            <circle cx="10" cy="4" r="1.5"/>
            <circle cx="10" cy="10" r="1.5"/>
            <circle cx="10" cy="16" r="1.5"/>
          </svg>
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="text-slate-400 text-sm">
              <th className="text-left pb-4 font-medium">Product Name</th>
              <th className="text-left pb-4 font-medium">Price</th>
              <th className="text-left pb-4 font-medium">Quantity</th>
              <th className="text-left pb-4 font-medium">Amount</th>
            </tr>
          </thead>
          <tbody className="text-white">
            {displayProducts.map((product, index) => (
              <tr key={product.id || index} className="border-t border-slate-700">
                <td className="py-4">
                  <div className="flex items-center">
                    <span className="mr-3 text-lg">{product.icon}</span>
                    <span className="font-medium">{product.name}</span>
                  </div>
                </td>
                <td className="py-4 text-slate-300">{product.price}</td>
                <td className="py-4 text-slate-300">{product.quantity}</td>
                <td className="py-4 font-semibold">{product.amount}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TopSellingProductsCard;
