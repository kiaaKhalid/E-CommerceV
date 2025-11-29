import { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  IconButton,
  Paper,
  Grid,
  useTheme,
  alpha,
  Breadcrumbs,
  Link,
  Card,
  CardMedia,
  CardContent,
  CardActions,
  Snackbar,
  Alert,
  Skeleton,
  Chip,
  Tooltip,
} from '@mui/material';
import {
  Delete,
  Favorite,
  FavoriteBorder,
  ArrowForward,
  Home,
  NavigateNext,
  AddShoppingCart,
  DeleteSweep,
} from '@mui/icons-material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useCart } from '../../contexts/CartContext';
import { productsAPI } from '../../services/api';
import { formatPrice, getImageUrl } from '../../utils/helpers';

const WishlistPage = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { addToCart } = useCart();

  const [wishlistItems, setWishlistItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // Charger la wishlist
  useEffect(() => {
    const fetchWishlist = async () => {
      if (!isAuthenticated || !user?.id) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const response = await productsAPI.getWishlist(user.id);
        setWishlistItems(response.data.wishlist || response.data || []);
      } catch (error) {
        console.error('Erreur lors du chargement de la wishlist:', error);
        setSnackbar({
          open: true,
          message: 'Erreur lors du chargement de la liste de souhaits',
          severity: 'error',
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchWishlist();
  }, [isAuthenticated, user?.id]);

  // Supprimer de la wishlist
  const handleRemoveFromWishlist = async (wishlistId) => {
    try {
      await productsAPI.removeFromWishlist(wishlistId);
      setWishlistItems((prev) => prev.filter((item) => item.id !== wishlistId));
      setSnackbar({
        open: true,
        message: 'Produit retiré de votre liste de souhaits',
        severity: 'success',
      });
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      setSnackbar({
        open: true,
        message: 'Erreur lors de la suppression du produit',
        severity: 'error',
      });
    }
  };

  // Ajouter au panier
  const handleAddToCart = async (item) => {
    try {
      await addToCart({
        product_id: item.product_id,
        quantity: 1,
      });
      setSnackbar({
        open: true,
        message: 'Produit ajouté au panier !',
        severity: 'success',
      });
    } catch (error) {
      console.error('Erreur lors de l\'ajout au panier:', error);
      setSnackbar({
        open: true,
        message: 'Erreur lors de l\'ajout au panier',
        severity: 'error',
      });
    }
  };

  // Ajouter tous au panier
  const handleAddAllToCart = async () => {
    try {
      for (const item of wishlistItems) {
        await addToCart({
          product_id: item.product_id,
          quantity: 1,
        });
      }
      setSnackbar({
        open: true,
        message: 'Tous les produits ont été ajoutés au panier !',
        severity: 'success',
      });
    } catch (error) {
      console.error('Erreur lors de l\'ajout au panier:', error);
      setSnackbar({
        open: true,
        message: 'Erreur lors de l\'ajout des produits au panier',
        severity: 'error',
      });
    }
  };

  // Vider la wishlist
  const handleClearWishlist = async () => {
    try {
      for (const item of wishlistItems) {
        await productsAPI.removeFromWishlist(item.id);
      }
      setWishlistItems([]);
      setSnackbar({
        open: true,
        message: 'Liste de souhaits vidée',
        severity: 'success',
      });
    } catch (error) {
      console.error('Erreur lors du vidage de la wishlist:', error);
      setSnackbar({
        open: true,
        message: 'Erreur lors du vidage de la liste',
        severity: 'error',
      });
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  // Si non authentifié
  if (!isAuthenticated) {
    return (
      <Box sx={{ backgroundColor: 'grey.50', minHeight: '80vh', py: { xs: 4, md: 8 } }}>
        <Container maxWidth="md">
          <Paper
            sx={{
              p: { xs: 4, md: 8 },
              textAlign: 'center',
              borderRadius: 4,
            }}
          >
            <Box
              sx={{
                width: 120,
                height: 120,
                borderRadius: '50%',
                background: alpha(theme.palette.error.main, 0.1),
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mx: 'auto',
                mb: 4,
              }}
            >
              <Favorite sx={{ fontSize: 60, color: 'error.main' }} />
            </Box>
            <Typography variant="h4" sx={{ fontWeight: 700, mb: 2 }}>
              Connectez-vous pour voir vos favoris
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 4, maxWidth: 400, mx: 'auto' }}>
              Créez un compte ou connectez-vous pour sauvegarder vos produits préférés et les retrouver plus tard.
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Button
                variant="contained"
                size="large"
                onClick={() => navigate('/login')}
                sx={{ px: 4 }}
              >
                Se connecter
              </Button>
              <Button
                variant="outlined"
                size="large"
                onClick={() => navigate('/register')}
                sx={{ px: 4 }}
              >
                Créer un compte
              </Button>
            </Box>
          </Paper>
        </Container>
      </Box>
    );
  }

  // Skeleton loader
  const renderSkeleton = () => (
    <Grid container spacing={3}>
      {[1, 2, 3, 4].map((item) => (
        <Grid item xs={12} sm={6} md={4} lg={3} key={item}>
          <Card sx={{ borderRadius: 3 }}>
            <Skeleton variant="rectangular" height={200} />
            <CardContent>
              <Skeleton variant="text" height={30} />
              <Skeleton variant="text" width="60%" />
              <Skeleton variant="text" width="40%" />
            </CardContent>
            <CardActions>
              <Skeleton variant="rectangular" width="100%" height={40} />
            </CardActions>
          </Card>
        </Grid>
      ))}
    </Grid>
  );

  // Wishlist vide
  const renderEmptyWishlist = () => (
    <Paper
      sx={{
        p: { xs: 4, md: 8 },
        textAlign: 'center',
        borderRadius: 4,
      }}
    >
      <Box
        sx={{
          width: 120,
          height: 120,
          borderRadius: '50%',
          background: alpha(theme.palette.grey[500], 0.1),
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          mx: 'auto',
          mb: 4,
        }}
      >
        <FavoriteBorder sx={{ fontSize: 60, color: 'grey.400' }} />
      </Box>
      <Typography variant="h4" sx={{ fontWeight: 700, mb: 2 }}>
        Votre liste de souhaits est vide
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4, maxWidth: 400, mx: 'auto' }}>
        Parcourez notre catalogue et ajoutez vos produits préférés à votre liste de souhaits en cliquant sur le cœur.
      </Typography>
      <Button
        variant="contained"
        size="large"
        startIcon={<ArrowForward />}
        onClick={() => navigate('/shop')}
        sx={{ px: 4 }}
      >
        Découvrir nos produits
      </Button>
    </Paper>
  );

  // Carte produit wishlist
  const renderWishlistCard = (item) => (
    <Card
      key={item.id}
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        borderRadius: 3,
        transition: 'all 0.3s ease',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: theme.shadows[8],
        },
      }}
    >
      {/* Image du produit */}
      <Box sx={{ position: 'relative' }}>
        <CardMedia
          component="img"
          height="200"
          image={getImageUrl(item.image_url) || '/placeholder-product.png'}
          alt={item.name}
          sx={{
            objectFit: 'cover',
            cursor: 'pointer',
          }}
          onClick={() => navigate(`/product/${item.product_id}`)}
        />
        {/* Badge favoris */}
        <Chip
          icon={<Favorite sx={{ fontSize: 16 }} />}
          label="Favori"
          size="small"
          sx={{
            position: 'absolute',
            top: 12,
            left: 12,
            backgroundColor: alpha(theme.palette.error.main, 0.9),
            color: 'white',
            fontWeight: 600,
          }}
        />
        {/* Bouton supprimer */}
        <Tooltip title="Retirer des favoris">
          <IconButton
            onClick={() => handleRemoveFromWishlist(item.id)}
            sx={{
              position: 'absolute',
              top: 8,
              right: 8,
              backgroundColor: alpha(theme.palette.background.paper, 0.9),
              '&:hover': {
                backgroundColor: theme.palette.error.light,
                color: 'white',
              },
            }}
          >
            <Delete />
          </IconButton>
        </Tooltip>
      </Box>

      {/* Contenu */}
      <CardContent sx={{ flexGrow: 1, pb: 1 }}>
        <Typography
          variant="h6"
          sx={{
            fontWeight: 600,
            mb: 1,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            cursor: 'pointer',
            '&:hover': { color: 'primary.main' },
          }}
          onClick={() => navigate(`/product/${item.product_id}`)}
        >
          {item.name}
        </Typography>
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{
            mb: 2,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
          }}
        >
          {item.description || 'Aucune description disponible'}
        </Typography>
        <Typography variant="h6" color="primary" sx={{ fontWeight: 700 }}>
          {formatPrice(item.price)}
        </Typography>
      </CardContent>

      {/* Actions */}
      <CardActions sx={{ p: 2, pt: 0 }}>
        <Button
          variant="contained"
          fullWidth
          startIcon={<AddShoppingCart />}
          onClick={() => handleAddToCart(item)}
          sx={{ borderRadius: 2 }}
        >
          Ajouter au panier
        </Button>
      </CardActions>
    </Card>
  );

  return (
    <Box sx={{ backgroundColor: 'grey.50', minHeight: '80vh', py: { xs: 3, md: 5 } }}>
      <Container maxWidth="lg">
        {/* Breadcrumbs */}
        <Breadcrumbs
          separator={<NavigateNext fontSize="small" />}
          sx={{ mb: 4 }}
        >
          <Link
            component={RouterLink}
            to="/"
            color="inherit"
            sx={{ display: 'flex', alignItems: 'center', textDecoration: 'none' }}
          >
            <Home sx={{ mr: 0.5, fontSize: 20 }} />
            Accueil
          </Link>
          <Typography color="text.primary" sx={{ fontWeight: 600 }}>
            Liste de souhaits
          </Typography>
        </Breadcrumbs>

        {/* En-tête */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            justifyContent: 'space-between',
            alignItems: { xs: 'flex-start', sm: 'center' },
            mb: 4,
            gap: 2,
          }}
        >
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
              Ma liste de souhaits
            </Typography>
            <Typography variant="body1" color="text.secondary">
              {wishlistItems.length} produit{wishlistItems.length !== 1 ? 's' : ''} dans votre liste
            </Typography>
          </Box>

          {wishlistItems.length > 0 && (
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <Button
                variant="outlined"
                color="error"
                startIcon={<DeleteSweep />}
                onClick={handleClearWishlist}
              >
                Vider la liste
              </Button>
              <Button
                variant="contained"
                startIcon={<AddShoppingCart />}
                onClick={handleAddAllToCart}
              >
                Tout ajouter au panier
              </Button>
            </Box>
          )}
        </Box>

        {/* Contenu */}
        {isLoading ? (
          renderSkeleton()
        ) : wishlistItems.length === 0 ? (
          renderEmptyWishlist()
        ) : (
          <Grid container spacing={3}>
            {wishlistItems.map((item) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={item.id}>
                {renderWishlistCard(item)}
              </Grid>
            ))}
          </Grid>
        )}

        {/* Snackbar */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={4000}
          onClose={handleCloseSnackbar}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert
            onClose={handleCloseSnackbar}
            severity={snackbar.severity}
            sx={{ width: '100%' }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Container>
    </Box>
  );
};

export default WishlistPage;
