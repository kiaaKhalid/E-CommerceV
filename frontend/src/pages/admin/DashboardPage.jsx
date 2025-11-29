import { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Card,
  CardContent,
  useTheme,
  alpha,
  LinearProgress,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Chip,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  People,
  Inventory,
  ShoppingCart,
  AttachMoney,
  MoreVert,
  ArrowUpward,
  ArrowDownward,
} from '@mui/icons-material';
import { adminAPI } from '../../services/api';

const StatCard = ({ title, value, icon, trend, trendValue, color }) => {
  const isPositive = trend === 'up';

  return (
    <Card
      sx={{
        height: '100%',
        background: `linear-gradient(135deg, ${alpha(color, 0.1)} 0%, ${alpha(color, 0.05)} 100%)`,
        border: `1px solid ${alpha(color, 0.2)}`,
      }}
    >
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Box>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              {title}
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: 700, color: 'text.primary', mb: 1 }}>
              {value}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              {isPositive ? (
                <ArrowUpward sx={{ fontSize: 16, color: 'success.main' }} />
              ) : (
                <ArrowDownward sx={{ fontSize: 16, color: 'error.main' }} />
              )}
              <Typography
                variant="body2"
                sx={{ color: isPositive ? 'success.main' : 'error.main', fontWeight: 600 }}
              >
                {trendValue}%
              </Typography>
              <Typography variant="body2" color="text.secondary">
                vs mois dernier
              </Typography>
            </Box>
          </Box>
          <Avatar
            sx={{
              width: 56,
              height: 56,
              backgroundColor: alpha(color, 0.2),
              color: color,
            }}
          >
            {icon}
          </Avatar>
        </Box>
      </CardContent>
    </Card>
  );
};

const DashboardPage = () => {
  const theme = useTheme();
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0,
    recentUsers: [],
    recentOrders: [],
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);
        const response = await adminAPI.getDashboard();
        const data = response.data;
        
        setStats({
          totalUsers: data.query_0?.[0]?.total_users || 0,
          totalProducts: data.query_1?.[0]?.total_products || 0,
          totalOrders: data.query_2?.[0]?.total_orders || 0,
          totalRevenue: data.query_3?.[0]?.total_revenue || 0,
          recentUsers: data.query_6 || [],
          recentOrders: data.query_7 || [],
        });
      } catch (error) {
        console.error('Erreur lors du chargement du dashboard:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const statCards = [
    {
      title: 'Total Utilisateurs',
      value: stats.totalUsers.toLocaleString(),
      icon: <People />,
      trend: 'up',
      trendValue: 12.5,
      color: theme.palette.primary.main,
    },
    {
      title: 'Total Produits',
      value: stats.totalProducts.toLocaleString(),
      icon: <Inventory />,
      trend: 'up',
      trendValue: 8.2,
      color: theme.palette.success.main,
    },
    {
      title: 'Total Commandes',
      value: stats.totalOrders.toLocaleString(),
      icon: <ShoppingCart />,
      trend: 'up',
      trendValue: 23.1,
      color: theme.palette.warning.main,
    },
    {
      title: 'Revenus Total',
      value: `${stats.totalRevenue?.toLocaleString() || 0} DH`,
      icon: <AttachMoney />,
      trend: 'up',
      trendValue: 15.3,
      color: theme.palette.secondary.main,
    },
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'warning';
      case 'completed': return 'success';
      case 'cancelled': return 'error';
      case 'shipped': return 'info';
      default: return 'default';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'pending': return 'En attente';
      case 'completed': return 'Terminée';
      case 'cancelled': return 'Annulée';
      case 'shipped': return 'Expédiée';
      default: return status;
    }
  };

  if (isLoading) {
    return (
      <Box sx={{ width: '100%' }}>
        <LinearProgress />
      </Box>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
          Dashboard
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Bienvenue dans votre tableau de bord administrateur
        </Typography>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {statCards.map((card, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <StatCard {...card} />
          </Grid>
        ))}
      </Grid>

      {/* Recent Data */}
      <Grid container spacing={3}>
        {/* Recent Orders */}
        <Grid item xs={12} md={7}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Commandes Récentes
              </Typography>
              <Tooltip title="Plus d'options">
                <IconButton size="small">
                  <MoreVert />
                </IconButton>
              </Tooltip>
            </Box>
            
            <List>
              {stats.recentOrders.slice(0, 5).map((order, index) => (
                <ListItem
                  key={order.id || index}
                  sx={{
                    borderRadius: 2,
                    mb: 1,
                    backgroundColor: alpha(theme.palette.grey[500], 0.05),
                  }}
                >
                  <ListItemAvatar>
                    <Avatar sx={{ backgroundColor: alpha(theme.palette.primary.main, 0.1) }}>
                      <ShoppingCart sx={{ color: 'primary.main' }} />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={`Commande #${order.id}`}
                    secondary={`${order.user_name || 'Client'} - ${order.total_amount?.toLocaleString() || 0} DH`}
                  />
                  <Chip
                    label={getStatusLabel(order.status)}
                    color={getStatusColor(order.status)}
                    size="small"
                  />
                </ListItem>
              ))}
              {stats.recentOrders.length === 0 && (
                <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
                  Aucune commande récente
                </Typography>
              )}
            </List>
          </Paper>
        </Grid>

        {/* Recent Users */}
        <Grid item xs={12} md={5}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Nouveaux Utilisateurs
              </Typography>
              <Tooltip title="Plus d'options">
                <IconButton size="small">
                  <MoreVert />
                </IconButton>
              </Tooltip>
            </Box>
            
            <List>
              {stats.recentUsers.slice(0, 5).map((user, index) => (
                <ListItem
                  key={user.id || index}
                  sx={{
                    borderRadius: 2,
                    mb: 1,
                    backgroundColor: alpha(theme.palette.grey[500], 0.05),
                  }}
                >
                  <ListItemAvatar>
                    <Avatar
                      sx={{
                        background: 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)',
                      }}
                    >
                      {user.name?.charAt(0) || 'U'}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={user.name || 'Utilisateur'}
                    secondary={user.email}
                  />
                  <Chip
                    label={user.role || 'user'}
                    color={user.role === 'admin' ? 'primary' : 'default'}
                    size="small"
                    variant="outlined"
                  />
                </ListItem>
              ))}
              {stats.recentUsers.length === 0 && (
                <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
                  Aucun utilisateur récent
                </Typography>
              )}
            </List>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default DashboardPage;
