// inventoryService.js
import api from './api';

const API_PREFIX = '/api';

const inventoryService = {
async getProducts(page = 1, limit = 10, searchTerm = '', category = '') {
  try {
    const params = { 
      page, 
      limit,
      ...(searchTerm && { search: searchTerm }),
      ...(category && { category })
    };
    
    const response = await api.get(`${API_PREFIX}/products`, { params });
    console.log('Raw API Response:', response);
    
    const products = response.data.products || [];
    const pagination = response.data.pagination || {
      total: 0,
      page,
      limit
    };
    
    return {
      data: products,
      pagination
    };
  } catch (error) {
    console.error('Error in getProducts:', error);
    throw error;
  }
},

  async getProduct(id) {
    try {
      const response = await api.get(`${API_PREFIX}/products/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching product ${id}:`, error);
      throw error;
    }
  },

  async createProduct(productData) {
    try {
      const response = await api.post(`${API_PREFIX}/products`, {
        ...productData,
        price: parseFloat(productData.price),
        stock: parseInt(productData.stock, 10),
        // Make sure these fields are included
        gender: productData.gender || 'unisex',
        ageRange: productData.ageRange || null,
        status: productData.status || 'in_stock'
      });
      return response.data;
    } catch (error) {
      console.error('Error creating product:', error);
      throw error;
    }
  },
  
  async updateProduct(id, productData) {
    try {
      const response = await api.put(`${API_PREFIX}/products/${id}`, {
        ...productData,
        price: parseFloat(productData.price),
        stock: parseInt(productData.stock, 10),
        gender: productData.gender || 'unisex',
        ageRange: productData.ageRange || null,
        status: productData.status || 'in_stock'
      });
      return response.data;
    } catch (error) {
      console.error(`Error updating product ${id}:`, error);
      throw error;
    }
  },

  async deleteProduct(id) {
    try {
      await api.delete(`${API_PREFIX}/products/${id}`);
    } catch (error) {
      console.error(`Error deleting product ${id}:`, error);
      throw error;
    }
  },

  async updateStock(id, stock) {
    try {
      const response = await api.patch(`${API_PREFIX}/products/${id}/stock`, { 
        stock: parseInt(stock, 10) 
      });
      return response.data;
    } catch (error) {
      console.error(`Error updating stock for product ${id}:`, error);
      throw error;
    }
  },

  async getCategories() {
    try {
      const response = await api.get(`${API_PREFIX}/products/meta/categories`);
      if (response.data && Array.isArray(response.data)) {
        return response.data;
      }
      return [];
    } catch (error) {
      console.error('Error fetching categories:', error);
      return [];
    }
  },

  // Updated to match Prisma schema
  getStatusOptions() {
    return [
      { value: 'in_stock', label: 'In Stock' },
      { value: 'out_of_stock', label: 'Out of Stock' },
      { value: 'discontinued', label: 'Discontinued' }
    ];
  },

  // New method for gender options
  getGenderOptions() {
    return [
      { value: 'boys', label: 'Boys' },
      { value: 'girls', label: 'Girls' },
      { value: 'unisex', label: 'Unisex' }
    ];
  },

  // New method for age ranges
  getAgeRangeOptions() {
    return [
      { value: '0-2', label: '0-2 years' },
      { value: '3-5', label: '3-5 years' },
      { value: '6-8', label: '6-8 years' },
      { value: '9-12', label: '9-12 years' },
      { value: '13+', label: '13+ years' }
    ];
  }
};

export default inventoryService;