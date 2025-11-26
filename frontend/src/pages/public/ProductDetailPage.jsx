// filepath: /Users/kiaakhalidgmail/Project/e-commercV/frontend/src/pages/public/ProductDetailPage.jsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Container,
  Grid,
  Box,
  Typography,
  Button,
  IconButton,
  Chip,
  Rating,
  Divider,
  Paper,
  Breadcrumbs,
  Skeleton,
  Alert,
  Card,
  CardMedia,
  CardContent,
  CardActions,
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import {
  ShoppingCart,
  FavoriteBorder,
  Favorite,
  Share,
  Add,
  Remove,
  LocalShipping,
  Security,
  Replay,
  CheckCircle,
  NavigateNext,
  ArrowBack,
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import { productsAPI } from '../../services/api';
import { useCart } from '../../contexts/CartContext';
import { useProducts } from '../../hooks';

// Fonction pour formater le prix
const formatPrice = (price) => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
  }).format(price);
};

// Composant TabPanel pour les onglets
function TabPanel({ children, value, index, ...other }) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`product-tabpanel-${index}`}
      aria-labelledby={`product-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

const ProductDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { products } = useProducts();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [isFavorite, setIsFavorite] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  const [selectedImage, setSelectedImage] = useState(0);

  // Charger le produit
  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await productsAPI.getById(id);
        setProduct(response.data);
      } catch (err) {
        console.error('Erreur lors du chargement du produit:', err);
        // Fallback vers les données de démonstration
        const demoProduct = products.find(p => p.id === parseInt(id));
        if (demoProduct) {
          setProduct(demoProduct);
        } else {
          setError('Produit non trouvé');
        }
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchProduct();
    }
  }, [id, products]);

  // Produits similaires (même catégorie)
  const similarProducts = products
    .filter(p => p.category === product?.category && p.id !== product?.id)
    .slice(0, 4);

  const handleQuantityChange = (delta) => {
    const newQuantity = quantity + delta;
    if (newQuantity >= 1 && newQuantity <= (product?.stock || 10)) {
      setQuantity(newQuantity);
    }
  };

  const handleAddToCart = () => {
    if (product) {
      addToCart(product, quantity);
    }
  };

  const handleToggleFavorite = () => {
    setIsFavorite(!isFavorite);
    toast.success(isFavorite ? 'Retiré des favoris' : 'Ajouté aux favoris');
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: product?.name,
        text: product?.description,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Lien copié dans le presse-papier');
    }
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  // Skeleton de chargement
  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Grid container spacing={4}>
          <Grid item xs={12} md={6}>
            <Skeleton variant="rectangular" height={500} sx={{ borderRadius: 3 }} />
          </Grid>
          <Grid item xs={12} md={6}>
            <Skeleton variant="text" height={60} width="80%" />
            <Skeleton variant="text" height={30} width="40%" sx={{ my: 2 }} />
            <Skeleton variant="text" height={100} />
            <Skeleton variant="rectangular" height={50} sx={{ mt: 3, borderRadius: 2 }} />
          </Grid>
        </Grid>
      </Container>
    );
  }

  // Page d'erreur
  if (error || !product) {
    return (
      <Container maxWidth="lg" sx={{ py: 8, textAlign: 'center' }}>
        <Alert severity="error" sx={{ mb: 4, justifyContent: 'center' }}>
          {error || 'Produit non trouvé'}
        </Alert>
        <Button
          variant="contained"
          startIcon={<ArrowBack />}
          onClick={() => navigate('/products')}
        >
          Retour aux produits
        </Button>
      </Container>
    );
  }

  // Images du produit (simulation de plusieurs images)
  const productImages = [
    product.image_url,
    `https://picsum.photos/seed/${product.id}a/400/400`,
    `https://picsum.photos/seed/${product.id}b/400/400`,
    `https://picsum.photos/seed/${product.id}c/400/400`,
  ];

  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: '100vh', py: 4 }}>
      <Container maxWidth="lg">
        {/* Breadcrumbs */}
        <Breadcrumbs
          separator={<NavigateNext fontSize="small" />}
          sx={{ mb: 3 }}
        >
          <Link to="/" style={{ textDecoration: 'none', color: 'inherit' }}>
            Accueil
          </Link>
          <Link to="/products" style={{ textDecoration: 'none', color: 'inherit' }}>
            Boutique
          </Link>
          {product.category && (
            <Link
              to={`/products?category=${product.category}`}
              style={{ textDecoration: 'none', color: 'inherit' }}
            >
              {product.category}
            </Link>
          )}
          <Typography color="text.primary">{product.name}</Typography>
        </Breadcrumbs>

        {/* Contenu principal */}
        <Grid container spacing={4}>
          {/* Galerie d'images */}
          <Grid item xs={12} md={6}>
            <Paper
              elevation={0}
              sx={{
                p: 2,
                borderRadius: 3,
                bgcolor: 'white',
                border: '1px solid',
                borderColor: 'divider',
              }}
            >
              {/* Image principale */}
              <Box
                sx={{
                  position: 'relative',
                  borderRadius: 2,
                  overflow: 'hidden',
                  mb: 2,
                }}
              >
                <Box
                  component="img"
                  src={productImages[selectedImage]}
                  alt={product.name}
                  sx={{
                    width: '100%',
                    height: 400,
                    objectFit: 'cover',
                    borderRadius: 2,
                  }}
                />
                {product.stock <= 5 && product.stock > 0 && (
                  <Chip
                    label={`Plus que ${product.stock} en stock`}
                    color="warning"
                    size="small"
                    sx={{
                      position: 'absolute',
                      top: 16,
                      left: 16,
                    }}
                  />
                )}
                {product.stock === 0 && (
                  <Chip
                    label="Rupture de stock"
                    color="error"
                    size="small"
                    sx={{
                      position: 'absolute',
                      top: 16,
                      left: 16,
                    }}
                  />
                )}
              </Box>

              {/* Miniatures */}
              <Grid container spacing={1}>
                {productImages.map((img, index) => (
                  <Grid item xs={3} key={index}>
                    <Box
                      component="img"
                      src={img}
                      alt={`${product.name} - ${index + 1}`}
                      onClick={() => setSelectedImage(index)}
                      sx={{
                        width: '100%',
                        height: 80,
                        objectFit: 'cover',
                        borderRadius: 1,
                        cursor: 'pointer',
                        border: selectedImage === index ? '2px solid' : '2px solid transparent',
                        borderColor: selectedImage === index ? 'primary.main' : 'transparent',
                        opacity: selectedImage === index ? 1 : 0.7,
                        transition: 'all 0.2s ease',
                        '&:hover': {
                          opacity: 1,
                        },
                      }}
                    />
                  </Grid>
                ))}
              </Grid>
            </Paper>
          </Grid>

          {/* Informations produit */}
          <Grid item xs={12} md={6}>
            <Box>
              {/* Catégorie */}
              {product.category && (
                <Chip
                  label={product.category}
                  size="small"
                  sx={{
                    mb: 2,
                    bgcolor: 'primary.light',
                    color: 'white',
                    fontWeight: 500,
                  }}
                />
              )}

              {/* Nom du produit */}
              <Typography
                variant="h3"
                component="h1"
                sx={{ fontWeight: 700, mb: 2 }}
              >
                {product.name}
              </Typography>

              {/* Note et avis */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <Rating value={4.5} precision={0.5} readOnly />
                <Typography variant="body2" color="text.secondary">
                  (128 avis)
                </Typography>
              </Box>

              {/* Prix */}
              <Typography
                variant="h4"
                sx={{
                  fontWeight: 700,
                  color: 'primary.main',
                  mb: 3,
                }}
              >
                {formatPrice(product.price)}
              </Typography>

              {/* Description courte */}
              <Typography
                variant="body1"
                color="text.secondary"
                sx={{ mb: 3, lineHeight: 1.8 }}
              >
                {product.description}
              </Typography>

              <Divider sx={{ my: 3 }} />

              {/* Sélecteur de quantité */}
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                  Quantité
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      border: '1px solid',
                      borderColor: 'divider',
                      borderRadius: 2,
                    }}
                  >
                    <IconButton
                      onClick={() => handleQuantityChange(-1)}
                      disabled={quantity <= 1}
                    >
                      <Remove />
                    </IconButton>
                    <Typography sx={{ px: 3, fontWeight: 600 }}>
                      {quantity}
                    </Typography>
                    <IconButton
                      onClick={() => handleQuantityChange(1)}
                      disabled={quantity >= (product.stock || 10)}
                    >
                      <Add />
                    </IconButton>
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    {product.stock || 'Plusieurs'} disponible(s)
                  </Typography>
                </Box>
              </Box>

              {/* Boutons d'action */}
              <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
                <Button
                  variant="contained"
                  size="large"
                  startIcon={<ShoppingCart />}
                  onClick={handleAddToCart}
                  disabled={product.stock === 0}
                  sx={{
                    flex: 1,
                    py: 1.5,
                    background: 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)',
                  }}
                >
                  Ajouter au panier
                </Button>
                <IconButton
                  onClick={handleToggleFavorite}
                  sx={{
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: 2,
                    p: 1.5,
                  }}
                >
                  {isFavorite ? (
                    <Favorite sx={{ color: 'error.main' }} />
                  ) : (
                    <FavoriteBorder />
                  )}
                </IconButton>
                <IconButton
                  onClick={handleShare}
                  sx={{
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: 2,
                    p: 1.5,
                  }}
                >
                  <Share />
                </IconButton>
              </Box>

              {/* Avantages */}
              <Paper
                elevation={0}
                sx={{
                  p: 2,
                  borderRadius: 2,
                  bgcolor: 'grey.50',
                  border: '1px solid',
                  borderColor: 'divider',
                }}
              >
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <LocalShipping sx={{ color: 'primary.main' }} />
                      <Box>
                        <Typography variant="body2" fontWeight={600}>
                          Livraison gratuite
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Dès 50€ d'achat
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>
                  <Grid item xs={6}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Security sx={{ color: 'primary.main' }} />
                      <Box>
                        <Typography variant="body2" fontWeight={600}>
                          Paiement sécurisé
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          100% sécurisé
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>
                  <Grid item xs={6}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Replay sx={{ color: 'primary.main' }} />
                      <Box>
                        <Typography variant="body2" fontWeight={600}>
                          Retours gratuits
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Sous 30 jours
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>
                  <Grid item xs={6}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <CheckCircle sx={{ color: 'success.main' }} />
                      <Box>
                        <Typography variant="body2" fontWeight={600}>
                          En stock
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Expédition 24h
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>
                </Grid>
              </Paper>
            </Box>
          </Grid>
        </Grid>

        {/* Onglets Description / Caractéristiques / Avis */}
        <Paper
          elevation={0}
          sx={{
            mt: 6,
            borderRadius: 3,
            border: '1px solid',
            borderColor: 'divider',
            overflow: 'hidden',
          }}
        >
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            sx={{
              borderBottom: 1,
              borderColor: 'divider',
              bgcolor: 'grey.50',
              '& .MuiTab-root': {
                py: 2,
                fontWeight: 600,
              },
            }}
          >
            <Tab label="Description" />
            <Tab label="Caractéristiques" />
            <Tab label="Avis clients (128)" />
          </Tabs>

          <Box sx={{ p: 3 }}>
            <TabPanel value={tabValue} index={0}>
              <Typography variant="body1" sx={{ lineHeight: 1.8 }}>
                {product.description}
              </Typography>
              <Typography variant="body1" sx={{ mt: 2, lineHeight: 1.8 }}>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor 
                incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud 
                exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
              </Typography>
            </TabPanel>

            <TabPanel value={tabValue} index={1}>
              <List>
                <ListItem>
                  <ListItemIcon>
                    <CheckCircle color="primary" />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Catégorie" 
                    secondary={product.category || 'Non spécifiée'} 
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <CheckCircle color="primary" />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Disponibilité" 
                    secondary={product.stock > 0 ? `${product.stock} en stock` : 'Rupture de stock'} 
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <CheckCircle color="primary" />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Référence" 
                    secondary={`PROD-${product.id}`} 
                  />
                </ListItem>
              </List>
            </TabPanel>

            <TabPanel value={tabValue} index={2}>
              <Typography variant="body1" color="text.secondary">
                Les avis clients seront bientôt disponibles.
              </Typography>
            </TabPanel>
          </Box>
        </Paper>

        {/* Produits similaires */}
        {similarProducts.length > 0 && (
          <Box sx={{ mt: 6 }}>
            <Typography variant="h5" sx={{ fontWeight: 700, mb: 3 }}>
              Produits similaires
            </Typography>
            <Grid container spacing={3}>
              {similarProducts.map((p) => (
                <Grid item xs={12} sm={6} md={3} key={p.id}>
                  <Card
                    sx={{
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      cursor: 'pointer',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: '0 12px 24px rgba(0,0,0,0.1)',
                      },
                    }}
                    onClick={() => navigate(`/products/${p.id}`)}
                  >
                    <CardMedia
                      component="img"
                      height="180"
                      image={p.image_url}
                      alt={p.name}
                    />
                    <CardContent sx={{ flexGrow: 1 }}>
                      <Typography variant="subtitle1" fontWeight={600} noWrap>
                        {p.name}
                      </Typography>
                      <Typography variant="h6" color="primary.main" fontWeight={700}>
                        {formatPrice(p.price)}
                      </Typography>
                    </CardContent>
                    <CardActions sx={{ px: 2, pb: 2 }}>
                      <Button
                        size="small"
                        variant="outlined"
                        fullWidth
                        onClick={(e) => {
                          e.stopPropagation();
                          addToCart(p, 1);
                        }}
                      >
                        Ajouter au panier
                      </Button>
                    </CardActions>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Box>
        )}
      </Container>
    </Box>
  );
};

export default ProductDetailPage;
