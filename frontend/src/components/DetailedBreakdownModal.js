import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
  LinearProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Avatar,
  CircularProgress,
} from '@mui/material';
import api from '../services/api';
import {
  TrendingUp,
  TrendingDown,
  AttachMoney,
  ShoppingCart,
  People,
  CalendarToday,
  LocationOn,
  Category,
  Store,
  CreditCard,
  LocalShipping,
  Schedule,
} from '@mui/icons-material';

const DetailedBreakdownModal = ({ open, onClose, type, subType, data }) => {
  const [realData, setRealData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open && type && subType) {
      fetchRealData();
    }
  }, [open, type, subType]);

  const fetchRealData = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/api/dashboard/breakdown/${type}/${subType}`);
      setRealData(response.data);
    } catch (error) {
      console.error('Error fetching breakdown data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getBreakdownContent = () => {
    switch (type) {
      case 'revenue':
        if (subType === 'breakdown') {
          return {
            title: 'Revenue Breakdown Deep Dive',
            icon: <AttachMoney sx={{ fontSize: 40, color: 'success.main' }} />,
            content: loading ? (
              <Box display="flex" justifyContent="center" p={4}>
                <CircularProgress />
              </Box>
            ) : (
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Monthly Revenue Trends
                      </Typography>
                      {realData?.monthlyRevenue?.map((month, index) => (
                        <Box key={index} mb={2}>
                          <Box display="flex" justifyContent="space-between" mb={1}>
                            <Typography variant="body2">{month.month}</Typography>
                            <Typography variant="body2" fontWeight="bold">
                              ${month.revenue?.toFixed(2) || '0.00'}
                            </Typography>
                          </Box>
                          <LinearProgress 
                            variant="determinate" 
                            value={Math.min((month.revenue / (realData.maxRevenue || 1)) * 100, 100)} 
                            color="success" 
                          />
                        </Box>
                      )) || (
                        <Typography variant="body2" color="text.secondary">
                          No revenue data available
                        </Typography>
                      )}
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Revenue by Payment Method
                      </Typography>
                      <List dense>
                        {realData?.paymentMethods?.map((method, index) => (
                          <ListItem key={index}>
                            <ListItemIcon>
                              {method.method === 'credit_card' && <CreditCard color="primary" />}
                              {method.method === 'cash' && <AttachMoney color="success" />}
                              {method.method === 'bank_transfer' && <Store color="info" />}
                            </ListItemIcon>
                            <ListItemText 
                              primary={method.method.replace('_', ' ').toUpperCase()} 
                              secondary={`$${method.amount?.toFixed(2) || '0.00'} (${method.percentage || 0}%)`} 
                            />
                          </ListItem>
                        )) || (
                          <Typography variant="body2" color="text.secondary">
                            No payment method data available
                          </Typography>
                        )}
                      </List>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Daily Revenue Breakdown (Last 7 Days)
                      </Typography>
                      <TableContainer component={Paper} variant="outlined">
                        <Table size="small">
                          <TableHead>
                            <TableRow>
                              <TableCell>Date</TableCell>
                              <TableCell>Orders</TableCell>
                              <TableCell>Revenue</TableCell>
                              <TableCell>Avg Order Value</TableCell>
                              <TableCell>Growth</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {realData?.dailyRevenue?.map((day, index) => (
                              <TableRow key={index}>
                                <TableCell>{new Date(day.date).toLocaleDateString()}</TableCell>
                                <TableCell>{day.orders || 0}</TableCell>
                                <TableCell fontWeight="bold">${day.revenue?.toFixed(2) || '0.00'}</TableCell>
                                <TableCell>${day.avgOrderValue?.toFixed(2) || '0.00'}</TableCell>
                                <TableCell>
                                  <Chip 
                                    label={`${day.growth >= 0 ? '+' : ''}${day.growth?.toFixed(1) || 0}%`}
                                    color={day.growth >= 0 ? 'success' : 'error'}
                                    size="small"
                                  />
                                </TableCell>
                              </TableRow>
                            )) || (
                              <TableRow>
                                <TableCell colSpan={5} align="center">
                                  <Typography variant="body2" color="text.secondary">
                                    No daily revenue data available
                                  </Typography>
                                </TableCell>
                              </TableRow>
                            )}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            )
          };
        }
        break;

      case 'orders':
        if (subType === 'trends') {
          return {
            title: 'Order Trends Deep Analysis',
            icon: <ShoppingCart sx={{ fontSize: 40, color: 'primary.main' }} />,
            content: (
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Hourly Order Distribution
                      </Typography>
                      <Box mb={2}>
                        <Box display="flex" justifyContent="space-between" mb={1}>
                          <Typography variant="body2">9:00 AM - 12:00 PM</Typography>
                          <Typography variant="body2" fontWeight="bold">45 orders</Typography>
                        </Box>
                        <LinearProgress variant="determinate" value={75} color="primary" />
                      </Box>
                      <Box mb={2}>
                        <Box display="flex" justifyContent="space-between" mb={1}>
                          <Typography variant="body2">12:00 PM - 3:00 PM</Typography>
                          <Typography variant="body2" fontWeight="bold">62 orders</Typography>
                        </Box>
                        <LinearProgress variant="determinate" value={100} color="success" />
                      </Box>
                      <Box mb={2}>
                        <Box display="flex" justifyContent="space-between" mb={1}>
                          <Typography variant="body2">3:00 PM - 6:00 PM</Typography>
                          <Typography variant="body2" fontWeight="bold">38 orders</Typography>
                        </Box>
                        <LinearProgress variant="determinate" value={60} color="warning" />
                      </Box>
                      <Box mb={2}>
                        <Box display="flex" justifyContent="space-between" mb={1}>
                          <Typography variant="body2">6:00 PM - 9:00 PM</Typography>
                          <Typography variant="body2" fontWeight="bold">28 orders</Typography>
                        </Box>
                        <LinearProgress variant="determinate" value={45} color="info" />
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Order Fulfillment Times
                      </Typography>
                      <List dense>
                        <ListItem>
                          <ListItemIcon><Schedule color="success" /></ListItemIcon>
                          <ListItemText 
                            primary="Same Day Delivery" 
                            secondary="45% of orders (avg 4 hours)" 
                          />
                        </ListItem>
                        <ListItem>
                          <ListItemIcon><LocalShipping color="primary" /></ListItemIcon>
                          <ListItemText 
                            primary="Next Day Delivery" 
                            secondary="35% of orders (avg 18 hours)" 
                          />
                        </ListItem>
                        <ListItem>
                          <ListItemIcon><CalendarToday color="warning" /></ListItemIcon>
                          <ListItemText 
                            primary="2-3 Day Delivery" 
                            secondary="20% of orders (avg 2.5 days)" 
                          />
                        </ListItem>
                      </List>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Order Status Breakdown
                      </Typography>
                      <Grid container spacing={2}>
                        <Grid item xs={6} sm={3}>
                          <Box textAlign="center" p={2}>
                            <Avatar sx={{ bgcolor: 'success.main', mx: 'auto', mb: 1 }}>
                              <ShoppingCart />
                            </Avatar>
                            <Typography variant="h4" color="success.main">89</Typography>
                            <Typography variant="caption">Delivered</Typography>
                          </Box>
                        </Grid>
                        <Grid item xs={6} sm={3}>
                          <Box textAlign="center" p={2}>
                            <Avatar sx={{ bgcolor: 'info.main', mx: 'auto', mb: 1 }}>
                              <LocalShipping />
                            </Avatar>
                            <Typography variant="h4" color="info.main">34</Typography>
                            <Typography variant="caption">Shipped</Typography>
                          </Box>
                        </Grid>
                        <Grid item xs={6} sm={3}>
                          <Box textAlign="center" p={2}>
                            <Avatar sx={{ bgcolor: 'warning.main', mx: 'auto', mb: 1 }}>
                              <Schedule />
                            </Avatar>
                            <Typography variant="h4" color="warning.main">23</Typography>
                            <Typography variant="caption">Processing</Typography>
                          </Box>
                        </Grid>
                        <Grid item xs={6} sm={3}>
                          <Box textAlign="center" p={2}>
                            <Avatar sx={{ bgcolor: 'error.main', mx: 'auto', mb: 1 }}>
                              <TrendingDown />
                            </Avatar>
                            <Typography variant="h4" color="error.main">10</Typography>
                            <Typography variant="caption">Cancelled</Typography>
                          </Box>
                        </Grid>
                      </Grid>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            )
          };
        }
        break;

      case 'customers':
        if (subType === 'growth') {
          return {
            title: 'Customer Growth Deep Analysis',
            icon: <People sx={{ fontSize: 40, color: 'secondary.main' }} />,
            content: (
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Customer Acquisition Channels
                      </Typography>
                      <Box mb={2}>
                        <Box display="flex" justifyContent="space-between" mb={1}>
                          <Typography variant="body2">Social Media</Typography>
                          <Typography variant="body2" fontWeight="bold">35 customers</Typography>
                        </Box>
                        <LinearProgress variant="determinate" value={70} color="primary" />
                      </Box>
                      <Box mb={2}>
                        <Box display="flex" justifyContent="space-between" mb={1}>
                          <Typography variant="body2">Word of Mouth</Typography>
                          <Typography variant="body2" fontWeight="bold">28 customers</Typography>
                        </Box>
                        <LinearProgress variant="determinate" value={56} color="success" />
                      </Box>
                      <Box mb={2}>
                        <Box display="flex" justifyContent="space-between" mb={1}>
                          <Typography variant="body2">Online Search</Typography>
                          <Typography variant="body2" fontWeight="bold">18 customers</Typography>
                        </Box>
                        <LinearProgress variant="determinate" value={36} color="warning" />
                      </Box>
                      <Box mb={2}>
                        <Box display="flex" justifyContent="space-between" mb={1}>
                          <Typography variant="body2">Direct Visit</Typography>
                          <Typography variant="body2" fontWeight="bold">8 customers</Typography>
                        </Box>
                        <LinearProgress variant="determinate" value={16} color="info" />
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Customer Lifetime Value
                      </Typography>
                      <List dense>
                        <ListItem>
                          <ListItemIcon><AttachMoney color="success" /></ListItemIcon>
                          <ListItemText 
                            primary="High Value (>$500)" 
                            secondary="12 customers - $8,450 total" 
                          />
                        </ListItem>
                        <ListItem>
                          <ListItemIcon><AttachMoney color="primary" /></ListItemIcon>
                          <ListItemText 
                            primary="Medium Value ($200-$500)" 
                            secondary="34 customers - $9,850 total" 
                          />
                        </ListItem>
                        <ListItem>
                          <ListItemIcon><AttachMoney color="warning" /></ListItemIcon>
                          <ListItemText 
                            primary="Low Value (&lt;$200)" 
                            secondary="43 customers - $4,200 total" 
                          />
                        </ListItem>
                      </List>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Customer Retention Analysis
                      </Typography>
                      <TableContainer component={Paper} variant="outlined">
                        <Table size="small">
                          <TableHead>
                            <TableRow>
                              <TableCell>Month</TableCell>
                              <TableCell>New Customers</TableCell>
                              <TableCell>Returning Customers</TableCell>
                              <TableCell>Retention Rate</TableCell>
                              <TableCell>Churn Rate</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {[
                              { month: 'January', new: 12, returning: 77, retention: '86%', churn: '14%' },
                              { month: 'December', new: 8, returning: 71, retention: '82%', churn: '18%' },
                              { month: 'November', new: 15, returning: 65, retention: '79%', churn: '21%' },
                              { month: 'October', new: 10, returning: 58, retention: '85%', churn: '15%' },
                            ].map((row, index) => (
                              <TableRow key={index}>
                                <TableCell>{row.month}</TableCell>
                                <TableCell>{row.new}</TableCell>
                                <TableCell>{row.returning}</TableCell>
                                <TableCell>
                                  <Chip 
                                    label={row.retention}
                                    color="success"
                                    size="small"
                                  />
                                </TableCell>
                                <TableCell>
                                  <Chip 
                                    label={row.churn}
                                    color="warning"
                                    size="small"
                                  />
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            )
          };
        }
        if (subType === 'categories') {
          return {
            title: 'Product Categories Deep Analysis',
            icon: <Category sx={{ fontSize: 40, color: 'info.main' }} />,
            content: (
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Category Performance Trends
                      </Typography>
                      <Box mb={2}>
                        <Box display="flex" justifyContent="space-between" mb={1}>
                          <Typography variant="body2">Building Blocks</Typography>
                          <Typography variant="body2" fontWeight="bold">$4,250 (34%)</Typography>
                        </Box>
                        <LinearProgress variant="determinate" value={85} color="primary" />
                      </Box>
                      <Box mb={2}>
                        <Box display="flex" justifyContent="space-between" mb={1}>
                          <Typography variant="body2">Action Figures</Typography>
                          <Typography variant="body2" fontWeight="bold">$3,180 (26%)</Typography>
                        </Box>
                        <LinearProgress variant="determinate" value={65} color="success" />
                      </Box>
                      <Box mb={2}>
                        <Box display="flex" justifyContent="space-between" mb={1}>
                          <Typography variant="body2">Educational Toys</Typography>
                          <Typography variant="body2" fontWeight="bold">$2,890 (23%)</Typography>
                        </Box>
                        <LinearProgress variant="determinate" value={58} color="warning" />
                      </Box>
                      <Box mb={2}>
                        <Box display="flex" justifyContent="space-between" mb={1}>
                          <Typography variant="body2">Remote Control</Typography>
                          <Typography variant="body2" fontWeight="bold">$2,130 (17%)</Typography>
                        </Box>
                        <LinearProgress variant="determinate" value={43} color="info" />
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Seasonal Category Trends
                      </Typography>
                      <List dense>
                        <ListItem>
                          <ListItemIcon><TrendingUp color="success" /></ListItemIcon>
                          <ListItemText
                            primary="Holiday Season (Dec-Jan)"
                            secondary="Building Blocks +45%, Action Figures +38%"
                          />
                        </ListItem>
                        <ListItem>
                          <ListItemIcon><TrendingUp color="primary" /></ListItemIcon>
                          <ListItemText
                            primary="Back to School (Aug-Sep)"
                            secondary="Educational Toys +52%, Puzzles +28%"
                          />
                        </ListItem>
                        <ListItem>
                          <ListItemIcon><TrendingDown color="warning" /></ListItemIcon>
                          <ListItemText
                            primary="Summer Break (Jun-Jul)"
                            secondary="Indoor toys -15%, Outdoor toys +25%"
                          />
                        </ListItem>
                      </List>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Category Profit Margins
                      </Typography>
                      <TableContainer component={Paper} variant="outlined">
                        <Table size="small">
                          <TableHead>
                            <TableRow>
                              <TableCell>Category</TableCell>
                              <TableCell>Revenue</TableCell>
                              <TableCell>Cost</TableCell>
                              <TableCell>Profit</TableCell>
                              <TableCell>Margin</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {[
                              { category: 'Building Blocks', revenue: 4250, cost: 2550, profit: 1700, margin: '40%' },
                              { category: 'Action Figures', revenue: 3180, cost: 2226, profit: 954, margin: '30%' },
                              { category: 'Educational Toys', revenue: 2890, cost: 1734, profit: 1156, margin: '40%' },
                              { category: 'Remote Control', revenue: 2130, cost: 1491, profit: 639, margin: '30%' },
                            ].map((row, index) => (
                              <TableRow key={index}>
                                <TableCell>{row.category}</TableCell>
                                <TableCell>${row.revenue}</TableCell>
                                <TableCell>${row.cost}</TableCell>
                                <TableCell>${row.profit}</TableCell>
                                <TableCell>
                                  <Chip
                                    label={row.margin}
                                    color={parseFloat(row.margin) >= 35 ? 'success' : 'warning'}
                                    size="small"
                                  />
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            )
          };
        }
        if (subType === 'locations') {
          return {
            title: 'Customer Locations Deep Analysis',
            icon: <LocationOn sx={{ fontSize: 40, color: 'warning.main' }} />,
            content: (
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Regional Revenue Distribution
                      </Typography>
                      <Box mb={2}>
                        <Box display="flex" justifyContent="space-between" mb={1}>
                          <Typography variant="body2">🇯🇲 Jamaica</Typography>
                          <Typography variant="body2" fontWeight="bold">$5,450 (44%)</Typography>
                        </Box>
                        <LinearProgress variant="determinate" value={88} color="primary" />
                      </Box>
                      <Box mb={2}>
                        <Box display="flex" justifyContent="space-between" mb={1}>
                          <Typography variant="body2">🇹🇹 Trinidad & Tobago</Typography>
                          <Typography variant="body2" fontWeight="bold">$3,890 (31%)</Typography>
                        </Box>
                        <LinearProgress variant="determinate" value={62} color="success" />
                      </Box>
                      <Box mb={2}>
                        <Box display="flex" justifyContent="space-between" mb={1}>
                          <Typography variant="body2">🇧🇧 Barbados</Typography>
                          <Typography variant="body2" fontWeight="bold">$2,110 (17%)</Typography>
                        </Box>
                        <LinearProgress variant="determinate" value={34} color="warning" />
                      </Box>
                      <Box mb={2}>
                        <Box display="flex" justifyContent="space-between" mb={1}>
                          <Typography variant="body2">🇬🇩 Other CARICOM</Typography>
                          <Typography variant="body2" fontWeight="bold">$1,000 (8%)</Typography>
                        </Box>
                        <LinearProgress variant="determinate" value={16} color="info" />
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Shipping & Logistics
                      </Typography>
                      <List dense>
                        <ListItem>
                          <ListItemIcon><LocalShipping color="success" /></ListItemIcon>
                          <ListItemText
                            primary="Local Delivery (Jamaica)"
                            secondary="Same day: 65%, Next day: 35%"
                          />
                        </ListItem>
                        <ListItem>
                          <ListItemIcon><LocalShipping color="primary" /></ListItemIcon>
                          <ListItemText
                            primary="Regional Shipping"
                            secondary="2-3 days: 70%, 4-5 days: 30%"
                          />
                        </ListItem>
                        <ListItem>
                          <ListItemIcon><AttachMoney color="warning" /></ListItemIcon>
                          <ListItemText
                            primary="Shipping Costs"
                            secondary="Local: $5-15, Regional: $25-45"
                          />
                        </ListItem>
                      </List>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Market Penetration Analysis
                      </Typography>
                      <TableContainer component={Paper} variant="outlined">
                        <Table size="small">
                          <TableHead>
                            <TableRow>
                              <TableCell>Country/Region</TableCell>
                              <TableCell>Customers</TableCell>
                              <TableCell>Avg Order Value</TableCell>
                              <TableCell>Market Share</TableCell>
                              <TableCell>Growth Potential</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {[
                              { country: '🇯🇲 Jamaica', customers: 32, aov: '$170.31', share: '44%', potential: 'High' },
                              { country: '🇹🇹 Trinidad & Tobago', customers: 28, aov: '$138.93', share: '31%', potential: 'Medium' },
                              { country: '🇧🇧 Barbados', customers: 18, aov: '$117.22', share: '17%', potential: 'High' },
                              { country: '🇬🇩 Grenada', customers: 6, aov: '$95.50', share: '5%', potential: 'Very High' },
                              { country: '🇱🇨 St. Lucia', customers: 4, aov: '$125.00', share: '3%', potential: 'Very High' },
                            ].map((row, index) => (
                              <TableRow key={index}>
                                <TableCell>{row.country}</TableCell>
                                <TableCell>{row.customers}</TableCell>
                                <TableCell>{row.aov}</TableCell>
                                <TableCell>{row.share}</TableCell>
                                <TableCell>
                                  <Chip
                                    label={row.potential}
                                    color={
                                      row.potential === 'Very High' ? 'success' :
                                      row.potential === 'High' ? 'primary' :
                                      row.potential === 'Medium' ? 'warning' : 'default'
                                    }
                                    size="small"
                                  />
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            )
          };
        }
        break;

      default:
        return {
          title: 'Detailed Analysis',
          icon: <TrendingUp sx={{ fontSize: 40 }} />,
          content: <Typography>Detailed breakdown not available for this section.</Typography>
        };
    }

    return {
      title: 'Detailed Analysis',
      icon: <TrendingUp sx={{ fontSize: 40 }} />,
      content: <Typography>Detailed breakdown not available for this section.</Typography>
    };
  };

  const modalContent = getBreakdownContent();

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="xl" 
      fullWidth
      PaperProps={{
        sx: { borderRadius: 3 }
      }}
    >
      <DialogTitle sx={{ pb: 1 }}>
        <Box display="flex" alignItems="center">
          {modalContent.icon}
          <Box ml={2}>
            <Typography variant="h5" component="h2">
              {modalContent.title}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Advanced analytics and detailed insights
            </Typography>
          </Box>
        </Box>
      </DialogTitle>

      <DialogContent>
        {modalContent.content}
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button onClick={onClose} color="inherit">
          Close
        </Button>
        <Button variant="outlined">
          Export Detailed Report
        </Button>
        <Button variant="contained">
          Schedule Report
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DetailedBreakdownModal;
