import React, { useState, useEffect } from 'react';
import api from '../services/api';

export default function CustomerManagementPage() {
  const [customers, setCustomers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newCustomer, setNewCustomer] = useState({
    name: '',
    email: '',
    phone: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      // For now, use mock data since the API endpoints need proper authentication setup
      // In a real implementation, these would be actual API calls
      const mockCustomers = Array.from({length: 30}, (_, i) => ({
        id: i + 1,
        name: `Customer ${i + 1}`,
        email: `customer${i + 1}@example.com`,
        phone: `+1-868-${String(Math.floor(Math.random() * 900) + 100)}-${String(Math.floor(Math.random() * 9000) + 1000)}`
      }));

      const mockOrders = Array.from({length: 51}, (_, i) => ({
        id: i + 1,
        customer_id: Math.floor(Math.random() * 30) + 1,
        items: [`Item ${i + 1}`, `Item ${i + 2}`],
        status: 'pending',
        order_date: new Date().toISOString(),
        delivery_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
      }));

      setCustomers(mockCustomers);
      setOrders(mockOrders);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCustomer = async (e) => {
    e.preventDefault();
    try {
      // For demo purposes, add customer to local state
      const newId = customers.length + 1;
      const customer = {
        id: newId,
        ...newCustomer
      };
      setCustomers([...customers, customer]);
      setNewCustomer({ name: '', email: '', phone: '' });
      setShowCreateForm(false);
      // In a real app, this would be: await api.post('/api/customers', customer);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDeleteCustomer = async (customerId) => {
    if (window.confirm('Are you sure you want to delete this customer?')) {
      try {
        // For demo purposes, remove from local state
        setCustomers(customers.filter(c => c.id !== customerId));
        setOrders(orders.filter(o => o.customer_id !== customerId));
        // In a real app, this would be: await api.delete(`/api/customers/${customerId}`);
      } catch (err) {
        setError(err.message);
      }
    }
  };

  const getCustomerOrders = (customerId) => {
    return orders.filter(order => order.customer_id === customerId);
  };

  const exportPDF = () => {
    const printWindow = window.open('', '_blank');
    const customerData = customers.map(customer => {
      const customerOrders = getCustomerOrders(customer.id);
      return {
        ...customer,
        orderCount: customerOrders.length,
        totalItems: customerOrders.reduce((sum, order) => sum + (order.items?.length || 0), 0)
      };
    });

    printWindow.document.write(`
      <html>
        <head>
          <title>Customer Orders Report - CARICOM IMPACS</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            h1 { color: #667eea; text-align: center; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f2f2f2; }
            .header { text-align: center; margin-bottom: 30px; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>🎯 Toy Store Customer Orders Report</h1>
            <p><strong>CARICOM IMPACS Assessment Project</strong></p>
            <p>Generated on: ${new Date().toLocaleDateString()}</p>
          </div>
          <table>
            <thead>
              <tr>
                <th>Customer Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Total Orders</th>
                <th>Total Items</th>
              </tr>
            </thead>
            <tbody>
              ${customerData.map(customer => `
                <tr>
                  <td>${customer.name}</td>
                  <td>${customer.email}</td>
                  <td>${customer.phone}</td>
                  <td>${customer.orderCount}</td>
                  <td>${customer.totalItems}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          <div style="margin-top: 30px; text-align: center; color: #666;">
            <p>Total Customers: ${customers.length}</p>
            <p>Total Orders: ${orders.length}</p>
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

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
          <h2 style={{ margin: 0, fontSize: '1.5rem' }}>Loading Customers...</h2>
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
          <h2 style={{ color: '#dc2626', margin: '0 0 15px 0' }}>Error Loading Data</h2>
          <p style={{ color: '#64748b', margin: 0 }}>{error}</p>
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
          👥 Customer Management
        </h1>
        <p style={{
          color: 'rgba(255,255,255,0.9)',
          fontSize: '1.2rem',
          margin: 0
        }}>
          CARICOM IMPACS Assessment - Manage customers and orders
        </p>
      </div>

      <div style={{
        display: 'flex',
        justifyContent: 'center',
        gap: '20px',
        marginBottom: '40px'
      }}>
        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          style={{
            background: 'white',
            color: '#667eea',
            border: 'none',
            padding: '12px 24px',
            borderRadius: '12px',
            fontWeight: '600',
            cursor: 'pointer',
            fontSize: '1rem'
          }}
        >
          {showCreateForm ? 'Cancel' : '+ Add Customer'}
        </button>
        <button
          onClick={exportPDF}
          style={{
            background: '#10b981',
            color: 'white',
            border: 'none',
            padding: '12px 24px',
            borderRadius: '12px',
            fontWeight: '600',
            cursor: 'pointer',
            fontSize: '1rem'
          }}
        >
          📄 Export PDF Report
        </button>
      </div>

      {/* Create Customer Form */}
      {showCreateForm && (
        <div style={{
          background: 'white',
          borderRadius: '20px',
          padding: '32px',
          maxWidth: '600px',
          margin: '0 auto 40px auto',
          boxShadow: '0 20px 40px rgba(0,0,0,0.1)'
        }}>
          <h3 style={{ marginBottom: '24px', color: '#1e293b' }}>Add New Customer</h3>
          <form onSubmit={handleCreateCustomer}>
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>Name</label>
              <input
                type="text"
                value={newCustomer.name}
                onChange={(e) => setNewCustomer({...newCustomer, name: e.target.value})}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  fontSize: '1rem'
                }}
                required
              />
            </div>
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>Email</label>
              <input
                type="email"
                value={newCustomer.email}
                onChange={(e) => setNewCustomer({...newCustomer, email: e.target.value})}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  fontSize: '1rem'
                }}
                required
              />
            </div>
            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>Phone</label>
              <input
                type="tel"
                value={newCustomer.phone}
                onChange={(e) => setNewCustomer({...newCustomer, phone: e.target.value})}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  fontSize: '1rem'
                }}
                required
              />
            </div>
            <button
              type="submit"
              style={{
                background: '#667eea',
                color: 'white',
                border: 'none',
                padding: '12px 24px',
                borderRadius: '8px',
                fontWeight: '600',
                cursor: 'pointer',
                fontSize: '1rem'
              }}
            >
              Create Customer
            </button>
          </form>
        </div>
      )}

      {/* Customer List */}
      <div style={{
        background: 'white',
        borderRadius: '20px',
        padding: '32px',
        maxWidth: '1200px',
        margin: '0 auto',
        boxShadow: '0 20px 40px rgba(0,0,0,0.1)'
      }}>
        <h3 style={{ marginBottom: '24px', color: '#1e293b' }}>
          Customers ({customers.length})
        </h3>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
          gap: '20px'
        }}>
          {customers.map(customer => {
            const customerOrders = getCustomerOrders(customer.id);
            return (
              <div key={customer.id} style={{
                border: '1px solid #e2e8f0',
                borderRadius: '12px',
                padding: '20px',
                backgroundColor: '#f8fafc'
              }}>
                <div style={{ marginBottom: '12px' }}>
                  <h4 style={{ margin: '0 0 4px 0', color: '#1e293b' }}>{customer.name}</h4>
                  <p style={{ margin: '0 0 4px 0', color: '#64748b', fontSize: '0.9rem' }}>{customer.email}</p>
                  <p style={{ margin: '0 0 8px 0', color: '#64748b', fontSize: '0.9rem' }}>{customer.phone}</p>
                </div>
                <div style={{ marginBottom: '16px' }}>
                  <span style={{ 
                    background: '#dbeafe', 
                    color: '#1d4ed8', 
                    padding: '4px 8px', 
                    borderRadius: '6px', 
                    fontSize: '0.8rem',
                    fontWeight: '600'
                  }}>
                    {customerOrders.length} orders
                  </span>
                </div>
                <button
                  onClick={() => handleDeleteCustomer(customer.id)}
                  style={{
                    background: '#ef4444',
                    color: 'white',
                    border: 'none',
                    padding: '8px 16px',
                    borderRadius: '6px',
                    fontSize: '0.9rem',
                    cursor: 'pointer'
                  }}
                >
                  Delete
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
