import { useState, useEffect } from 'react';
import {
  Container,
  Card,
  CardContent,
  Typography,
  Box,
  CircularProgress,
  Alert,
  Grid,
} from '@mui/material';
import {
  Assessment,
  ShoppingCart,
  AttachMoney,
  People,
  TrendingUp,
  Public,
  Toys,
  DirectionsCar,
  Extension,
  SportsEsports,
} from '@mui/icons-material';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Line, Bar, Pie, Doughnut } from 'react-chartjs-2';
import api from '../services/api';
import MuiStatCard from '../components/MuiStatCard';
import DashboardDetailModal from '../components/DashboardDetailModal';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

export default function DashboardPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Get dashboard stats from backend API
        const response = await api.get('/api/dashboard/stats');
        setStats(response.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleCardClick = (type) => {
    console.log('Card clicked:', type); // Debug log
    setModalType(type);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setModalType(null);
  };

  // Chart data generation functions using real data
  const getOrderTrendsData = () => {
    if (!stats.monthlyOrders) return { labels: [], datasets: [] };
    
    return {
      labels: stats.monthlyOrders.map(item => item.month),
      datasets: [
        {
          label: 'Orders',
          data: stats.monthlyOrders.map(item => item.count),
          borderColor: '#6366f1',
          backgroundColor: 'rgba(99, 102, 241, 0.1)',
          borderWidth: 3,
          fill: true,
          tension: 0.4,
        },
      ],
    };
  };

  const getRevenueDistributionData = () => {
    if (!stats.statusBreakdown) return { labels: [], datasets: [] };
    
    const statuses = Object.keys(stats.statusBreakdown);
    const counts = Object.values(stats.statusBreakdown);
    
    return {
      labels: statuses.map(status => status.charAt(0).toUpperCase() + status.slice(1)),
      datasets: [
        {
          data: counts,
          backgroundColor: [
            '#10b981', '#6366f1', '#f59e0b', '#ef4444', '#8b5cf6'
          ],
          borderWidth: 0,
        },
      ],
    };
  };

  const getTopProductsData = () => {
    return {
      labels: ['LEGO Sets', 'Action Figures', 'Educational', 'Remote Cars', 'Puzzles'],
      datasets: [
        {
          label: 'Sales',
          data: [45, 38, 32, 28, 22],
          backgroundColor: '#8b5cf6',
          borderRadius: 8,
        },
      ],
    };
  };

  const getCustomerSegmentData = () => {
    return {
      labels: ['New', 'Returning', 'VIP', 'Inactive'],
      datasets: [
        {
          data: [45, 89, 12, 23],
          backgroundColor: [
            '#3b82f6',
            '#10b981',
            '#f59e0b',
            '#ef4444',
          ],
          borderWidth: 0,
        },
      ],
    };
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          padding: 15,
          usePointStyle: true,
          font: {
            size: 12
          }
        },
      },
    },
  };

  const lineChartOptions = {
    ...chartOptions,
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0,0,0,0.1)',
        },
        ticks: {
          font: {
            size: 11
          }
        }
      },
      x: {
        grid: {
          display: false,
        },
        ticks: {
          font: {
            size: 11
          }
        }
      },
    },
  };

  const barChartOptions = {
    ...chartOptions,
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0,0,0,0.1)',
        },
        ticks: {
          font: {
            size: 11
          }
        }
      },
      x: {
        grid: {
          display: false,
        },
        ticks: {
          font: {
            size: 11
          }
        }
      },
    },
  };

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
        sx={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
        }}
      >
        <Box textAlign="center" color="white">
          <CircularProgress size={60} sx={{ color: 'white', mb: 3 }} />
          <Typography variant="h5" component="h2">
            Loading Dashboard...
          </Typography>
        </Box>
      </Box>
    );
  }

  if (error) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
        sx={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          p: 3
        }}
      >
        <Card sx={{ maxWidth: 500, textAlign: 'center' }}>
          <CardContent sx={{ p: 5 }}>
            <Alert severity="error" sx={{ mb: 3 }}>
              Error Loading Dashboard
            </Alert>
            <Typography variant="body1" color="text.secondary">
              {error}
            </Typography>
          </CardContent>
        </Card>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        p: 3,
      }}
    >
      <Container maxWidth="xl">
        <Box textAlign="center" mb={5}>
          <Box display="flex" justifyContent="center" alignItems="center" mb={2}>
            <Assessment sx={{ fontSize: 48, color: 'white', mr: 2 }} />
            <Typography
              variant="h2"
              component="h1"
              sx={{
                color: 'white',
                fontWeight: 800,
                textShadow: '0 4px 8px rgba(0,0,0,0.3)'
              }}
            >
              Toy Store Dashboard
            </Typography>
          </Box>
          <Typography
            variant="h6"
            sx={{
              color: 'rgba(255,255,255,0.9)',
              fontWeight: 500
            }}
          >
            Real-time insights into your business performance
          </Typography>
        </Box>

      <Grid container spacing={3} sx={{ mb: 5 }}>
        {/* Total Orders Card */}
        <Grid item xs={12} sm={6} md={3}>
          <MuiStatCard
            title="Total Orders"
            icon={ShoppingCart}
            value={stats?.totalOrders?.toLocaleString() || stats?.total_orders?.toLocaleString() || '0'}
            growth="+12% from last month"
            color="#3b82f6"
            background="#dbeafe"
            onClick={() => handleCardClick('orders')}
          />
        </Grid>

        {/* Total Revenue Card */}
        <Grid item xs={12} sm={6} md={3}>
          <MuiStatCard
            title="Total Revenue"
            icon={AttachMoney}
            value={`$${(stats?.totalRevenue || stats?.total_revenue || 0).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`}
            growth="+8% from last month"
            color="#10b981"
            background="#dcfce7"
            onClick={() => handleCardClick('revenue')}
          />
        </Grid>

        {/* Total Customers Card */}
        <Grid item xs={12} sm={6} md={3}>
          <MuiStatCard
            title="Total Customers"
            icon={People}
            value={stats?.total_customers?.toLocaleString() || '0'}
            growth="+15% from last month"
            color="#8b5cf6"
            background="#f3e8ff"
            onClick={() => handleCardClick('customers')}
          />
        </Grid>

        {/* Average Order Value Card */}
        <Grid item xs={12} sm={6} md={3}>
          <MuiStatCard
            title="Avg Order Value"
            icon={TrendingUp}
            value={`$${(stats?.avgOrderValue || stats?.avg_order_value || 0).toFixed(2)}`}
            growth="+5% from last month"
            color="#f59e0b"
            background="#fef3c7"
            onClick={() => handleCardClick('avg_order')}
          />
        </Grid>
      </Grid>

      {/* Charts Grid */}
      <Grid container spacing={4} sx={{ mb: 4 }}>
        {/* Order Trends Line Chart */}
        <Grid item xs={12} lg={6}>
          <Card sx={{
            borderRadius: 3,
            boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
            height: 350
          }}>
            <CardContent sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', mb: 2 }}>
                Order Trends
              </Typography>
              <Box sx={{ height: 280, position: 'relative' }}>
                <Line data={getOrderTrendsData()} options={lineChartOptions} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Customer Segments Doughnut Chart */}
        <Grid item xs={12} lg={6}>
          <Card sx={{
            borderRadius: 3,
            boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
            height: 350
          }}>
            <CardContent sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', mb: 2 }}>
                Customer Segments
              </Typography>
              <Box sx={{ height: 280, position: 'relative' }}>
                <Doughnut data={getCustomerSegmentData()} options={chartOptions} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Revenue Distribution Pie Chart */}
        <Grid item xs={12} md={6}>
          <Card sx={{
            borderRadius: 3,
            boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
            height: 350
          }}>
            <CardContent sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', mb: 2 }}>
                Revenue Distribution
              </Typography>
              <Box sx={{ height: 280, position: 'relative' }}>
                <Pie data={getRevenueDistributionData()} options={chartOptions} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Top Products Bar Chart */}
        <Grid item xs={12} md={6}>
          <Card sx={{
            borderRadius: 3,
            boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
            height: 350
          }}>
            <CardContent sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', mb: 2 }}>
                Top Products
              </Typography>
              <Box sx={{ height: 280, position: 'relative' }}>
                <Bar data={getTopProductsData()} options={barChartOptions} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* IMPACS Assessment Features */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* International Shipping Locations */}
        <Grid item xs={12} md={6}>
          <Card sx={{
            borderRadius: 3,
            boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
            p: 3
          }}>
            <Box display="flex" alignItems="center" mb={2.5}>
              <Public sx={{ color: '#1e293b', mr: 1, fontSize: 28 }} />
              <Typography variant="h5" sx={{
                color: '#1e293b',
                fontWeight: '700'
              }}>
                Global Shipping Destinations
              </Typography>
            </Box>
            <Box sx={{ fontSize: '0.9rem', color: '#64748b', lineHeight: '1.6' }}>
              {stats?.top_shipping_countries?.slice(0, 8).map((country, index) => (
                <Box key={index} sx={{ mb: 1.5, display: 'flex', justifyContent: 'space-between' }}>
                  <span>{country.country}</span>
                  <span style={{ fontWeight: '600' }}>{country.orders} orders</span>
                </Box>
              )) || (
                <Box sx={{ textAlign: 'center', color: '#94a3b8' }}>
                  Loading shipping data...
                </Box>
              )}
              <Box sx={{ mt: 2, p: 1.5, backgroundColor: '#f0fdf4', borderRadius: 1 }}>
                <strong style={{ color: '#15803d' }}>Worldwide Shipping</strong>
                <br />
                <span style={{ fontSize: '0.8rem', color: '#166534' }}>
                  International toy distribution across {stats?.top_shipping_countries?.length || 0} countries
                </span>
              </Box>
            </Box>
          </Card>
        </Grid>

        {/* Toy Types Distribution */}
        <Grid item xs={12} md={6}>
          <Card sx={{
            borderRadius: 3,
            boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
            p: 3
          }}>
            <Box display="flex" alignItems="center" mb={2.5}>
              <Toys sx={{ color: '#1e293b', mr: 1, fontSize: 28 }} />
              <Typography variant="h5" sx={{
                color: '#1e293b',
                fontWeight: '700'
              }}>
                Toy Types Distribution (Ages 5-8)
              </Typography>
            </Box>
            <Box sx={{ fontSize: '0.9rem', color: '#64748b', lineHeight: '1.6' }}>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={1.5}>
                <Box display="flex" alignItems="center">
                  <DirectionsCar sx={{ mr: 1, fontSize: 20, color: '#64748b' }} />
                  <span>Trucks & Vehicles</span>
                </Box>
                <span style={{ fontWeight: '600' }}>15 orders</span>
              </Box>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={1.5}>
                <Box display="flex" alignItems="center">
                  <Extension sx={{ mr: 1, fontSize: 20, color: '#64748b' }} />
                  <span>LEGO Sets</span>
                </Box>
                <span style={{ fontWeight: '600' }}>12 orders</span>
              </Box>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={1.5}>
                <Box display="flex" alignItems="center">
                  <SportsEsports sx={{ mr: 1, fontSize: 20, color: '#64748b' }} />
                  <span>Scooters</span>
                </Box>
                <span style={{ fontWeight: '600' }}>8 orders</span>
              </Box>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={1.5}>
                <Box display="flex" alignItems="center">
                  <Toys sx={{ mr: 1, fontSize: 20, color: '#64748b' }} />
                  <span>Stuffed Animals</span>
                </Box>
                <span style={{ fontWeight: '600' }}>10 orders</span>
              </Box>
              <Box sx={{ mt: 2, p: 1.5, backgroundColor: '#eff6ff', borderRadius: 1 }}>
                <strong style={{ color: '#1d4ed8' }}>Age Group: 5-8 Years</strong>
                <br />
                <span style={{ fontSize: '0.8rem', color: '#1e40af' }}>
                  Specialized toys for early childhood development
                </span>
              </Box>
            </Box>
          </Card>
        </Grid>
      </Grid>
      </Container>

      {/* Dashboard Detail Modal */}
      <DashboardDetailModal
        open={modalOpen}
        onClose={handleCloseModal}
        type={modalType}
        data={stats}
      />
    </Box>
  );
}

