import React, { useState, useEffect } from 'react';
import api from '../services/api';

export default function DashboardPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await api.get('/dashboard/stats');
        setStats(response.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
      }}>
        <div style={{ textAlign: 'center', color: 'white' }}>
          <div style={{
            width: '60px',
            height: '60px',
            border: '4px solid rgba(255,255,255,0.3)',
            borderTop: '4px solid white',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 20px'
          }}></div>
          <h2 style={{ margin: 0, fontSize: '1.5rem' }}>Loading Dashboard...</h2>
          <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        padding: '20px'
      }}>
        <div style={{
          backgroundColor: 'white',
          padding: '40px',
          borderRadius: '16px',
          textAlign: 'center',
          maxWidth: '400px'
        }}>
          <div style={{ fontSize: '64px', marginBottom: '20px' }}>⚠️</div>
          <h2 style={{ color: '#dc2626', margin: '0 0 15px 0', fontSize: '1.5rem' }}>Error Loading Dashboard</h2>
          <p style={{ color: '#64748b', margin: 0, lineHeight: '1.6' }}>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '20px',
      fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }}>
      <div style={{ textAlign: 'center', marginBottom: '40px' }}>
        <h1 style={{
          color: 'white',
          fontSize: '3rem',
          fontWeight: '800',
          margin: '0 0 10px 0',
          textShadow: '0 4px 8px rgba(0,0,0,0.3)'
        }}>
          🎯 Toy Store Dashboard
        </h1>
        <p style={{
          color: 'rgba(255,255,255,0.9)',
          fontSize: '1.2rem',
          margin: 0
        }}>
          Real-time insights into your business performance
        </p>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '24px',
        marginBottom: '40px',
        maxWidth: '1200px',
        margin: '0 auto 40px auto'
      }}>
        {/* Total Orders Card */}
        <StatCard
          title="Total Orders"
          icon="🛒"
          value={stats?.total_orders?.toLocaleString() || '0'}
          growth="+12% from last month"
          color="#3b82f6"
          background="#dbeafe"
        />

        {/* Total Revenue Card */}
        <StatCard
          title="Total Revenue"
          icon="💰"
          value={`$${stats?.total_revenue?.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2}) || '0.00'}`}
          growth="+8% from last month"
          color="#10b981"
          background="#dcfce7"
        />

        {/* Total Customers Card */}
        <StatCard
          title="Total Customers"
          icon="👥"
          value={stats?.total_customers?.toLocaleString() || '0'}
          growth="+15% from last month"
          color="#8b5cf6"
          background="#f3e8ff"
        />

        {/* Average Order Value Card */}
        <StatCard
          title="Avg Order Value"
          icon="📊"
          value={`$${stats?.avg_order_value?.toFixed(2) || '0.00'}`}
          growth="+5% from last month"
          color="#f59e0b"
          background="#fef3c7"
        />
      </div>

      {/* IMPACS Assessment Features */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
        gap: '24px',
        marginBottom: '40px',
        maxWidth: '1200px',
        margin: '0 auto 40px auto'
      }}>
        {/* International Shipping Locations */}
        <div style={{
          background: 'white',
          borderRadius: '20px',
          padding: '32px',
          boxShadow: '0 20px 40px rgba(0,0,0,0.1)'
        }}>
          <h3 style={{
            color: '#1e293b',
            marginBottom: '20px',
            fontSize: '1.25rem',
            fontWeight: '700'
          }}>
            🌍 Global Shipping Destinations
          </h3>
          <div style={{ fontSize: '0.9rem', color: '#64748b', lineHeight: '1.6' }}>
            {stats?.top_shipping_countries?.slice(0, 8).map((country, index) => (
              <div key={index} style={{ marginBottom: '12px', display: 'flex', justifyContent: 'space-between' }}>
                <span>{country.country}</span>
                <span style={{ fontWeight: '600' }}>{country.orders} orders</span>
              </div>
            )) || (
              <div style={{ textAlign: 'center', color: '#94a3b8' }}>
                Loading shipping data...
              </div>
            )}
            <div style={{ marginTop: '16px', padding: '12px', backgroundColor: '#f0fdf4', borderRadius: '8px' }}>
              <strong style={{ color: '#15803d' }}>Worldwide Shipping</strong>
              <br />
              <span style={{ fontSize: '0.8rem', color: '#166534' }}>
                International toy distribution across {stats?.top_shipping_countries?.length || 0} countries
              </span>
            </div>
          </div>
        </div>

        {/* Toy Types Distribution */}
        <div style={{
          background: 'white',
          borderRadius: '20px',
          padding: '32px',
          boxShadow: '0 20px 40px rgba(0,0,0,0.1)'
        }}>
          <h3 style={{
            color: '#1e293b',
            marginBottom: '20px',
            fontSize: '1.25rem',
            fontWeight: '700'
          }}>
            🧸 Toy Types Distribution (Ages 5-8)
          </h3>
          <div style={{ fontSize: '0.9rem', color: '#64748b', lineHeight: '1.6' }}>
            <div style={{ marginBottom: '12px', display: 'flex', justifyContent: 'space-between' }}>
              <span>🚛 Trucks & Vehicles</span>
              <span style={{ fontWeight: '600' }}>15 orders</span>
            </div>
            <div style={{ marginBottom: '12px', display: 'flex', justifyContent: 'space-between' }}>
              <span>🧱 LEGO Sets</span>
              <span style={{ fontWeight: '600' }}>12 orders</span>
            </div>
            <div style={{ marginBottom: '12px', display: 'flex', justifyContent: 'space-between' }}>
              <span>🛴 Scooters</span>
              <span style={{ fontWeight: '600' }}>8 orders</span>
            </div>
            <div style={{ marginBottom: '12px', display: 'flex', justifyContent: 'space-between' }}>
              <span>🧸 Stuffed Animals</span>
              <span style={{ fontWeight: '600' }}>10 orders</span>
            </div>
            <div style={{ marginTop: '16px', padding: '12px', backgroundColor: '#eff6ff', borderRadius: '8px' }}>
              <strong style={{ color: '#1d4ed8' }}>Age Group: 5-8 Years</strong>
              <br />
              <span style={{ fontSize: '0.8rem', color: '#1e40af' }}>
                Specialized toys for early childhood development
              </span>
            </div>
          </div>
        </div>
      </div>


    </div>
  );
}

function StatCard({ title, icon, value, growth, color, background }) {
  return (
    <div style={{
      background: 'white',
      borderRadius: '20px',
      padding: '32px',
      boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
      position: 'relative',
      overflow: 'hidden'
    }}>
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: '6px',
        background: `linear-gradient(90deg, ${color}, ${color})`
      }}></div>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px' }}>
        <div style={{
          width: '56px',
          height: '56px',
          borderRadius: '16px',
          backgroundColor: background,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '28px',
          marginRight: '20px'
        }}>
          {icon}
        </div>
        <div>
          <h3 style={{
            color: '#64748b',
            fontSize: '0.875rem',
            fontWeight: '600',
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            margin: 0
          }}>
            {title}
          </h3>
        </div>
      </div>
      <div style={{
        fontSize: '2.5rem',
        fontWeight: '800',
        color: '#1e293b',
        marginBottom: '8px'
      }}>
        {value}
      </div>
      <div style={{
        fontSize: '0.875rem',
        color: '#10b981',
        fontWeight: '600'
      }}>
        {growth}
      </div>
    </div>
  );
}