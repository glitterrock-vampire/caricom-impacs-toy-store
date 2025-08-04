import api from './api';

export const inventoryService = {
  async getProducts() {
    try {
      const response = await api.get('/api/products');
      // Backend returns { products: [...], pagination: {...} }
      return response.data.products || response.data;
    } catch (error) {
      console.error('Error fetching products:', error);
      throw error;
    }
  },

  async createProduct(productData) {
    try {
      const response = await api.post('/api/products', productData);
      return response.data;
    } catch (error) {
      console.error('Error creating product:', error);
      throw error;
    }
  },

  async updateProduct(id, productData) {
    try {
      const response = await api.put(`/api/products/${id}`, productData);
      return response.data;
    } catch (error) {
      console.error('Error updating product:', error);
      throw error;
    }
  },

  async deleteProduct(id) {
    try {
      await api.delete(`/api/products/${id}`);
    } catch (error) {
      console.error('Error deleting product:', error);
      throw error;
    }
  },

  async updateStock(id, quantity) {
    try {
      const response = await api.patch(`/api/products/${id}/stock`, { quantity });
      return response.data;
    } catch (error) {
      console.error('Error updating stock:', error);
      throw error;
    }
  },
};
