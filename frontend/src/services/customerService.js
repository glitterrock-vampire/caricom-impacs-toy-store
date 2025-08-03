import api from './api';

// Fetch all customers
export async function fetchCustomers() {
  const response = await api.get('/customers/');
  return response.data;
}

// Create a new customer
export async function createCustomer(customer) {
  const response = await api.post('/customers/', customer);
  return response.data;
}

// Delete a customer by ID
export async function deleteCustomer(customerId) {
  const response = await api.delete(`/customers/${customerId}`);
  return response.data;
}

// Fetch orders for a customer
export async function fetchCustomerOrders(customerId) {
  const response = await api.get(`/customers/${customerId}/orders`);
  return response.data;
}