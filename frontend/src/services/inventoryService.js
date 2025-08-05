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

  // Upload image file
  async uploadImage(file) {
    try {
      const formData = new FormData();
      formData.append('image', file);
      
      const response = await api.post(`${API_PREFIX}/uploads`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      return response.data.url;
    } catch (error) {
      console.error('Error uploading image:', error);
      throw error;
    }
  },

  async createProduct(productData) {
    try {
      const formData = new FormData();
      
      // Append all product data to formData
      Object.keys(productData).forEach(key => {
        // Skip imageFile and imagePreview as they're not needed in the form data
        if (key === 'imageFile' || key === 'imagePreview') {
          return;
        }
        if (productData[key] !== null && productData[key] !== undefined) {
          formData.append(key, productData[key]);
        }
      });
      
      // Handle image file if provided
      if (productData.imageFile) {
        formData.append('image', productData.imageFile);
        // Don't include imageUrl when uploading a file
        // The backend will handle setting the new URL
        formData.delete('imageUrl');
      } else if (!productData.imageUrl || productData.imageUrl.trim() === '') {
        // Don't include imageUrl if it's empty
        // The backend will handle the default image
        formData.delete('imageUrl');
      }
      
      // Ensure numeric fields are properly formatted
      if (formData.get('price')) {
        formData.set('price', parseFloat(formData.get('price')));
      }
      if (formData.get('stock') !== null && formData.get('stock') !== undefined) {
        formData.set('stock', parseInt(formData.get('stock'), 10));
      }
      
      // Set default values if not provided
      if (!formData.get('gender')) formData.set('gender', 'unisex');
      if (!formData.get('status')) formData.set('status', 'in_stock');
      if (!formData.get('ageRange')) formData.set('ageRange', '');
      
      const response = await api.post(`${API_PREFIX}/products`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      // Ensure the response includes the full image URL
      if (response.data.imageUrl && !response.data.imageUrl.startsWith('http')) {
        response.data.imageUrl = `${process.env.REACT_APP_API_URL || 'http://localhost:8000'}${response.data.imageUrl}`;
      }
      
      return response.data;
    } catch (error) {
      console.error('Error creating product:', error);
      throw error;
    }
  },

  async updateProduct(id, productData) {
    try {
      const formData = new FormData();
      
      // Append all product data to formData
      Object.keys(productData).forEach(key => {
        // Skip imageFile and imagePreview as they're not needed in the form data
        if (key === 'imageFile' || key === 'imagePreview') {
          return;
        }
        if (productData[key] !== null && productData[key] !== undefined) {
          formData.append(key, productData[key]);
        }
      });
      
      // Handle image upload if a new file is provided
      if (productData.imageFile) {
        formData.append('image', productData.imageFile);
        // Don't include imageUrl when uploading a new file
        // The backend will handle setting the new URL
        formData.delete('imageUrl');
      }
      
      // Ensure numeric fields are properly formatted
      if (formData.get('price')) {
        formData.set('price', parseFloat(formData.get('price')));
      }
      if (formData.get('stock') !== null && formData.get('stock') !== undefined) {
        formData.set('stock', parseInt(formData.get('stock'), 10));
      }
      
      // Set default values if not provided
      if (!formData.get('gender')) formData.set('gender', 'unisex');
      if (!formData.get('status')) formData.set('status', 'in_stock');
      
      const response = await api.put(`${API_PREFIX}/products/${id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      // Ensure the response includes the full image URL
      if (response.data.imageUrl && !response.data.imageUrl.startsWith('http')) {
        response.data.imageUrl = `${process.env.REACT_APP_API_URL || 'http://localhost:8000'}${response.data.imageUrl}`;
      }
      
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
      const response = await api.put(`${API_PREFIX}/products/${id}`, { 
        stock: parseInt(stock, 10),
        // Let the backend handle the status update based on stock
        status: undefined // This will make the backend recalculate the status
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