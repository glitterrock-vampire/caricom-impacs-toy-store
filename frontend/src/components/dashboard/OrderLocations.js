// src/components/dashboard/OrderLocations.js
import React, { useEffect, useRef } from 'react';

const OrderLocations = () => {
  const mapRef = useRef(null);

  useEffect(() => {
    // Initialize map here (e.g., Google Maps or Leaflet)
    // This is a placeholder for map initialization
    if (mapRef.current) {
      // Example: new google.maps.Map(mapRef.current, {...});
      console.log('Map would be initialized here');
    }
  }, []);

  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <h3 className="font-semibold mb-4">🌍 Order Locations</h3>
      <div 
        ref={mapRef} 
        className="h-48 bg-gray-100 rounded flex items-center justify-center"
      >
        Interactive Map Placeholder
      </div>
      <div className="mt-2 text-sm text-gray-500 text-center">
        Map shows the locations of recent orders
      </div>
    </div>
  );
};

export default OrderLocations;