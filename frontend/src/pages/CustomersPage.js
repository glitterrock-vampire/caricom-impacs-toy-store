import React, { useEffect, useState } from 'react';
import { fetchCustomers, createCustomer, deleteCustomer, fetchCustomerOrders } from '../services/customerService';
import { exportOrdersToPDF } from '../utils/pdfExport';

export default function CustomersPage() {
  const [customers, setCustomers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [newCustomer, setNewCustomer] = useState({ name: '', email: '', phone: '' });

  useEffect(() => {
    loadCustomers();
  }, []);

  const loadCustomers = async () => {
    const data = await fetchCustomers();
    setCustomers(data);
  };

  const handleAddCustomer = async e => {
    e.preventDefault();
    await createCustomer(newCustomer);
    setNewCustomer({ name: '', email: '', phone: '' });
    loadCustomers();
  };

  const handleDelete = async id => {
    await deleteCustomer(id);
    loadCustomers();
  };

  const handleExport = async () => {
    // Optionally fetch all orders or pass current state
    let allOrders = [];
    for (let customer of customers) {
      const customerOrders = await fetchCustomerOrders(customer.id);
      allOrders = allOrders.concat(customerOrders);
    }
    exportOrdersToPDF(customers, allOrders);
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Customer Management</h1>
      <form onSubmit={handleAddCustomer} className="mb-6 flex gap-2">
        <input type="text" placeholder="Name" value={newCustomer.name} onChange={e => setNewCustomer({ ...newCustomer, name: e.target.value })} required />
        <input type="email" placeholder="Email" value={newCustomer.email} onChange={e => setNewCustomer({ ...newCustomer, email: e.target.value })} required />
        <input type="text" placeholder="Phone" value={newCustomer.phone} onChange={e => setNewCustomer({ ...newCustomer, phone: e.target.value })} required />
        <button type="submit" className="bg-green-500 text-white px-4 py-2 rounded">Add</button>
      </form>
      <button onClick={handleExport} className="bg-blue-500 text-white px-4 py-2 rounded mb-4">Export Orders to PDF</button>
      <table className="min-w-full bg-white">
        <thead>
          <tr>
            <th>Name</th><th>Email</th><th>Phone</th><th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {customers.map(c => (
            <tr key={c.id}>
              <td>{c.name}</td>
              <td>{c.email}</td>
              <td>{c.phone}</td>
              <td>
                <button onClick={() => handleDelete(c.id)} className="bg-red-500 text-white px-2 py-1 rounded">Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}