import api from './api';

export const reportService = {
  async exportOrdersReport(format = 'excel', startDate = null, endDate = null) {
    try {
      const params = new URLSearchParams();
      params.append('format', format);
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);

      const response = await api.get(`/api/reports/orders?${params.toString()}`, {
        responseType: format === 'json' ? 'json' : 'blob'
      });

      if (format !== 'json') {
        const blob = new Blob([response.data], { 
          type: format === 'excel' ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' : 'application/pdf'
        });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `orders-report-${new Date().toISOString().split('T')[0]}.${format === 'excel' ? 'xlsx' : 'pdf'}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      }

      return response.data;
    } catch (error) {
      console.error('Error exporting orders report:', error);
      throw error;
    }
  },

  async exportCustomersReport(format = 'excel') {
    try {
      const response = await api.get(`/api/reports/customers?format=${format}`, {
        responseType: format === 'json' ? 'json' : 'blob'
      });

      if (format !== 'json') {
        const blob = new Blob([response.data], { 
          type: format === 'excel' ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' : 'application/pdf'
        });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `customers-report-${new Date().toISOString().split('T')[0]}.${format === 'excel' ? 'xlsx' : 'pdf'}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      }

      return response.data;
    } catch (error) {
      console.error('Error exporting customers report:', error);
      throw error;
    }
  },

  async getCustomerAnalytics() {
    try {
      const response = await api.get('/api/reports/customers/analytics');
      return response.data;
    } catch (error) {
      console.error('Error fetching customer analytics:', error);
      throw error;
    }
  },

  async getDashboardData() {
    try {
      const response = await api.get('/api/dashboard/analytics');
      return response.data;
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      throw error;
    }
  }
};
