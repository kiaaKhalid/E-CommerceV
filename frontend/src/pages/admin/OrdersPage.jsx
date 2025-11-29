import { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  TextField,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  Avatar,
  InputAdornment,
  useTheme,
  alpha,
  Tooltip,
  LinearProgress,
  Snackbar,
  Alert,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Collapse,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
} from '@mui/material';
import {
  Search,
  Refresh,
  Visibility,
  LocalShipping,
  CheckCircle,
  Cancel,
  ShoppingBag,
} from '@mui/icons-material';
import { ordersAPI } from '../../services/api';
import { formatPrice, getImageUrl } from '../../utils/helpers';

const OrdersPage = () => {
  const theme = useTheme();
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [orderDetails, setOrderDetails] = useState(null);
  
  // Dialog states
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  
  // Snackbar
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const fetchOrders = async () => {
    try {
      setIsLoading(true);
      const response = await ordersAPI.getAll();
      setOrders(response.data || []);
    } catch (error) {
      console.error('Erreur lors du chargement des commandes:', error);
      showSnackbar('Erreur lors du chargement des commandes', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await ordersAPI.updateStatus(orderId, newStatus);
      showSnackbar('Statut mis à jour avec succès');
      fetchOrders();
    } catch (error) {
      console.error('Erreur lors de la mise à jour du statut:', error);
      showSnackbar('Erreur lors de la mise à jour', 'error');
    }
  };

  const handleViewDetails = async (orderId) => {
    try {
      const response = await ordersAPI.getById(orderId);
      setOrderDetails(response.data);
      setDetailsDialogOpen(true);
    } catch (error) {
      console.error('Erreur lors du chargement des détails:', error);
      showSnackbar('Erreur lors du chargement des détails', 'error');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'warning';
      case 'processing': return 'info';
      case 'shipped': return 'primary';
      case 'completed': return 'success';
      case 'cancelled': return 'error';
      default: return 'default';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'pending': return 'En attente';
      case 'processing': return 'En traitement';
      case 'shipped': return 'Expédiée';
      case 'completed': return 'Terminée';
      case 'cancelled': return 'Annulée';
      default: return status;
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      order.id?.toString().includes(searchTerm) ||
      order.user_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.user_email?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const paginatedOrders = filteredOrders.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
            Gestion des Commandes
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {orders.length} commandes au total
          </Typography>
        </Box>
        <Button
          variant="outlined"
          startIcon={<Refresh />}
          onClick={fetchOrders}
        >
          Actualiser
        </Button>
      </Box>

      {/* Filters */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <TextField
            placeholder="Rechercher par ID, nom ou email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search color="action" />
                </InputAdornment>
              ),
            }}
            sx={{ minWidth: 300 }}
          />
          <FormControl sx={{ minWidth: 200 }}>
            <InputLabel>Statut</InputLabel>
            <Select
              value={statusFilter}
              label="Statut"
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <MenuItem value="all">Tous les statuts</MenuItem>
              <MenuItem value="pending">En attente</MenuItem>
              <MenuItem value="processing">En traitement</MenuItem>
              <MenuItem value="shipped">Expédiée</MenuItem>
              <MenuItem value="completed">Terminée</MenuItem>
              <MenuItem value="cancelled">Annulée</MenuItem>
            </Select>
          </FormControl>
        </Box>
      </Paper>

      {/* Orders Table */}
      <Paper sx={{ overflow: 'hidden' }}>
        {isLoading && <LinearProgress />}
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: alpha(theme.palette.primary.main, 0.05) }}>
                <TableCell sx={{ fontWeight: 600 }}>Commande</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Client</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Date</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Articles</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Total</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Statut</TableCell>
                <TableCell sx={{ fontWeight: 600 }} align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedOrders.map((order) => (
                <TableRow key={order.id} hover>
                  <TableCell>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                      #{order.id}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Box>
                      <Typography variant="subtitle2">
                        {order.user_name || 'Client'}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {order.user_email}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {formatDate(order.created_at)}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={`${order.item_count || 0} articles`} 
                      size="small" 
                      variant="outlined" 
                    />
                  </TableCell>
                  <TableCell>
                    <Typography sx={{ fontWeight: 600, color: 'primary.main' }}>
                      {formatPrice(order.total_amount)}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <FormControl size="small" sx={{ minWidth: 140 }}>
                      <Select
                        value={order.status || 'pending'}
                        onChange={(e) => handleStatusChange(order.id, e.target.value)}
                        sx={{
                          '& .MuiSelect-select': {
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1,
                          },
                        }}
                      >
                        <MenuItem value="pending">
                          <Chip label="En attente" color="warning" size="small" />
                        </MenuItem>
                        <MenuItem value="processing">
                          <Chip label="En traitement" color="info" size="small" />
                        </MenuItem>
                        <MenuItem value="shipped">
                          <Chip label="Expédiée" color="primary" size="small" />
                        </MenuItem>
                        <MenuItem value="completed">
                          <Chip label="Terminée" color="success" size="small" />
                        </MenuItem>
                        <MenuItem value="cancelled">
                          <Chip label="Annulée" color="error" size="small" />
                        </MenuItem>
                      </Select>
                    </FormControl>
                  </TableCell>
                  <TableCell align="right">
                    <Tooltip title="Voir détails">
                      <IconButton
                        size="small"
                        onClick={() => handleViewDetails(order.id)}
                        sx={{ color: 'primary.main' }}
                      >
                        <Visibility />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
              {paginatedOrders.length === 0 && !isLoading && (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 8 }}>
                    <Typography color="text.secondary">
                      Aucune commande trouvée
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          component="div"
          count={filteredOrders.length}
          page={page}
          onPageChange={(e, newPage) => setPage(newPage)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(parseInt(e.target.value, 10));
            setPage(0);
          }}
          labelRowsPerPage="Lignes par page"
        />
      </Paper>

      {/* Order Details Dialog */}
      <Dialog 
        open={detailsDialogOpen} 
        onClose={() => setDetailsDialogOpen(false)} 
        maxWidth="md" 
        fullWidth
      >
        <DialogTitle>
          Détails de la commande #{orderDetails?.order?.id}
        </DialogTitle>
        <DialogContent dividers>
          {orderDetails && (
            <Box>
              {/* Order Info */}
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
                  Informations de la commande
                </Typography>
                <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                  <Box>
                    <Typography variant="caption" color="text.secondary">Client</Typography>
                    <Typography>{orderDetails.order.user_name}</Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary">Email</Typography>
                    <Typography>{orderDetails.order.user_email}</Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary">Date</Typography>
                    <Typography>{formatDate(orderDetails.order.created_at)}</Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary">Statut</Typography>
                    <Chip 
                      label={getStatusLabel(orderDetails.order.status)} 
                      color={getStatusColor(orderDetails.order.status)}
                      size="small"
                    />
                  </Box>
                  <Box sx={{ gridColumn: '1 / -1' }}>
                    <Typography variant="caption" color="text.secondary">Adresse de livraison</Typography>
                    <Typography>{orderDetails.order.shipping_address || 'Non spécifiée'}</Typography>
                  </Box>
                </Box>
              </Box>

              {/* Order Items */}
              <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
                  Articles commandés
                </Typography>
                <List>
                  {orderDetails.items?.map((item, index) => (
                    <ListItem 
                      key={index}
                      sx={{ 
                        backgroundColor: alpha(theme.palette.grey[500], 0.05),
                        borderRadius: 2,
                        mb: 1,
                      }}
                    >
                      <ListItemAvatar>
                        <Avatar
                          variant="rounded"
                          src={getImageUrl(item.image_url)}
                          sx={{ width: 50, height: 50 }}
                        >
                          <ShoppingBag />
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={item.product_name || `Produit #${item.product_id}`}
                        secondary={`Quantité: ${item.quantity} × ${formatPrice(item.price)}`}
                      />
                      <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                        {formatPrice(item.quantity * item.price)}
                      </Typography>
                    </ListItem>
                  ))}
                </List>
                
                {/* Total */}
                <Box 
                  sx={{ 
                    display: 'flex', 
                    justifyContent: 'flex-end', 
                    mt: 2, 
                    pt: 2, 
                    borderTop: '1px solid',
                    borderColor: 'divider',
                  }}
                >
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>
                    Total: {formatPrice(orderDetails.order.total_amount)}
                  </Typography>
                </Box>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setDetailsDialogOpen(false)}>Fermer</Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default OrdersPage;
