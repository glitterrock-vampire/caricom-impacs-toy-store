import api from './api';

export const productService = {
  async getProducts() {
    try {
      const response = await api.get('/api/products');
      console.log('Fetched products:', {
        count: response.data?.products?.length || response.data?.length || 0,
        firstFew: response.data?.products?.slice(0, 3) || response.data?.slice(0, 3) || []
      });
      return response.data.products || response.data || [];
    } catch (error) {
      console.error('Error fetching products:', error);
      throw error;
    }
  },

  async getProductById(id) {
    try {
      const response = await api.get(`/api/products/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching product with ID ${id}:`, error);
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
      console.error(`Error updating product with ID ${id}:`, error);
      throw error;
    }
  },

  async deleteProduct(id) {
    try {
      await api.delete(`/api/products/${id}`);
    } catch (error) {
      console.error(`Error deleting product with ID ${id}:`, error);
      throw error;
    }
  }
};

export default productService;
