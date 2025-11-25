import { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  IconButton,
  Paper,
  Grid,
  Divider,
  TextField,
  useTheme,
  useMediaQuery,
  alpha,
  Breadcrumbs,
  Link,
  Card,
  CardMedia,
} from '@mui/material';
import {
  Add,
  Remove,
  Delete,
  ShoppingCart,
  ArrowForward,
  LocalShipping,
  Security,
  LocalOffer,
  ShoppingBag,
} from '@mui/icons-material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useCart } from '../../contexts/CartContext';
import { useAuth } from '../../contexts/AuthContext';
import { formatPrice, getImageUrl } from '../../utils/helpers';

const CartPage = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { items, totalItems, totalPrice, updateQuantity, removeFromCart, isLoading } = useCart();
  const { isAuthenticated } = useAuth();
  
  const [promoCode, setPromoCode] = useState('');
  const [promoApplied, setPromoApplied] = useState(false);

  const shippingCost = totalPrice >= 50 ? 0 : 5.99;
  const discount = promoApplied ? totalPrice * 0.1 : 0;
  const finalTotal = totalPrice + shippingCost - discount;

  const handleApplyPromo = () => {
    if (promoCode.toUpperCase() === 'BIENVENUE10') {
      setPromoApplied(true);
    }
  };

  // Empty Cart State
  if (items.length === 0) {
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
                background: alpha(theme.palette.primary.main, 0.1),
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mx: 'auto',
                mb: 4,
              }}
            >
              <ShoppingBag sx={{ fontSize: 60, color: 'primary.main' }} />
            </Box>
            <Typography variant="h4" sx={{ fontWeight: 700, mb: 2 }}>
              Votre panier est vide
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 4, maxWidth: 400, mx: 'auto' }}>
              Découvrez nos produits et ajoutez vos favoris à votre panier pour passer commande.
            </Typography>
            <Button
              variant="contained"
              size="large"
              onClick={() => navigate('/products')}
              endIcon={<ArrowForward />}
              sx={{ px: 4 }}
            >
              Découvrir la boutique
            </Button>
          </Paper>
        </Container>
      </Box>
    );
  }

  return (
    <Box sx={{ backgroundColor: 'grey.50', minHeight: '100vh', py: { xs: 2, md: 4 } }}>
      <Container maxWidth="xl">
        {/* Breadcrumbs */}
        <Breadcrumbs sx={{ mb: 3 }}>
          <Link component={RouterLink} to="/" color="inherit" underline="hover">
            Accueil
          </Link>
          <Typography color="text.primary" fontWeight={500}>Panier</Typography>
        </Breadcrumbs>

        <Typography variant="h4" sx={{ fontWeight: 800, mb: 4 }}>
          Mon Panier
          <Typography component="span" variant="h6" color="text.secondary" sx={{ ml: 2, fontWeight: 400 }}>
            ({totalItems} article{totalItems > 1 ? 's' : ''})
          </Typography>
        </Typography>

        <Grid container spacing={4}>
          {/* Cart Items */}
          <Grid item xs={12} lg={8}>
            <Paper sx={{ borderRadius: 3, overflow: 'hidden' }}>
              {/* Header */}
              <Box
                sx={{
                  p: 2,
                  backgroundColor: 'grey.50',
                  borderBottom: '1px solid',
                  borderColor: 'divider',
                  display: { xs: 'none', md: 'grid' },
                  gridTemplateColumns: '3fr 1fr 1fr 1fr auto',
                  gap: 2,
                  alignItems: 'center',
                }}
              >
                <Typography variant="subtitle2" color="text.secondary">Produit</Typography>
                <Typography variant="subtitle2" color="text.secondary" textAlign="center">Prix</Typography>
                <Typography variant="subtitle2" color="text.secondary" textAlign="center">Quantité</Typography>
                <Typography variant="subtitle2" color="text.secondary" textAlign="center">Total</Typography>
                <Box sx={{ width: 40 }} />
              </Box>

              {/* Items */}
              {items.map((item, index) => (
                <Box key={item.id}>
                  <Box
                    sx={{
                      p: { xs: 2, md: 3 },
                      display: { xs: 'flex', md: 'grid' },
                      gridTemplateColumns: { md: '3fr 1fr 1fr 1fr auto' },
                      flexDirection: { xs: 'column', sm: 'row' },
                      gap: { xs: 2, md: 3 },
                      alignItems: 'center',
                    }}
                  >
                    {/* Product Info */}
                    <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', width: '100%' }}>
                      <Box
                        sx={{
                          width: { xs: 80, md: 100 },
                          height: { xs: 80, md: 100 },
                          borderRadius: 2,
                          overflow: 'hidden',
                          flexShrink: 0,
                        }}
                      >
                        <Box
                          component="img"
                          src={getImageUrl(item.image_url)}
                          alt={item.product_name || item.name}
                          sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                      </Box>
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography
                          variant="subtitle1"
                          sx={{
                            fontWeight: 600,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {item.product_name || item.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Réf: #{item.product_id || item.id}
                        </Typography>
                        {/* Mobile Price */}
                        <Typography
                          variant="subtitle1"
                          sx={{
                            fontWeight: 700,
                            color: 'primary.main',
                            display: { xs: 'block', md: 'none' },
                            mt: 1,
                          }}
                        >
                          {formatPrice(item.price)}
                        </Typography>
                      </Box>
                    </Box>

                    {/* Price (Desktop) */}
                    <Typography
                      variant="body1"
                      sx={{
                        fontWeight: 600,
                        textAlign: 'center',
                        display: { xs: 'none', md: 'block' },
                      }}
                    >
                      {formatPrice(item.price)}
                    </Typography>

                    {/* Quantity */}
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: { xs: 'flex-start', md: 'center' },
                        gap: 1,
                      }}
                    >
                      <IconButton
                        size="small"
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        disabled={item.quantity <= 1}
                        sx={{
                          border: '1px solid',
                          borderColor: 'divider',
                          borderRadius: 1,
                        }}
                      >
                        <Remove fontSize="small" />
                      </IconButton>
                      <Typography
                        sx={{
                          minWidth: 40,
                          textAlign: 'center',
                          fontWeight: 600,
                        }}
                      >
                        {item.quantity}
                      </Typography>
                      <IconButton
                        size="small"
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        sx={{
                          border: '1px solid',
                          borderColor: 'divider',
                          borderRadius: 1,
                        }}
                      >
                        <Add fontSize="small" />
                      </IconButton>
                    </Box>

                    {/* Total (Desktop) */}
                    <Typography
                      variant="body1"
                      sx={{
                        fontWeight: 700,
                        color: 'primary.main',
                        textAlign: 'center',
                        display: { xs: 'none', md: 'block' },
                      }}
                    >
                      {formatPrice(item.price * item.quantity)}
                    </Typography>

                    {/* Delete */}
                    <IconButton
                      onClick={() => removeFromCart(item.id)}
                      sx={{
                        color: 'error.main',
                        '&:hover': { backgroundColor: alpha(theme.palette.error.main, 0.1) },
                      }}
                    >
                      <Delete />
                    </IconButton>
                  </Box>
                  {index < items.length - 1 && <Divider />}
                </Box>
              ))}
            </Paper>

            {/* Continue Shopping */}
            <Button
              component={RouterLink}
              to="/products"
              variant="outlined"
              sx={{ mt: 3, borderRadius: 2 }}
            >
              Continuer mes achats
            </Button>
          </Grid>

          {/* Order Summary */}
          <Grid item xs={12} lg={4}>
            <Paper sx={{ borderRadius: 3, p: 3, position: { lg: 'sticky' }, top: { lg: 100 } }}>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 3 }}>
                Résumé de la commande
              </Typography>

              {/* Promo Code */}
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle2" sx={{ mb: 1.5, fontWeight: 600 }}>
                  Code promo
                </Typography>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <TextField
                    size="small"
                    placeholder="Entrez votre code"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                    disabled={promoApplied}
                    sx={{ flex: 1 }}
                  />
                  <Button
                    variant="outlined"
                    onClick={handleApplyPromo}
                    disabled={promoApplied || !promoCode}
                    sx={{ borderRadius: 2 }}
                  >
                    Appliquer
                  </Button>
                </Box>
                {promoApplied && (
                  <Typography variant="caption" color="success.main" sx={{ mt: 1, display: 'block' }}>
                    ✓ Code BIENVENUE10 appliqué (-10%)
                  </Typography>
                )}
              </Box>

              <Divider sx={{ my: 3 }} />

              {/* Summary */}
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography color="text.secondary">Sous-total</Typography>
                  <Typography fontWeight={500}>{formatPrice(totalPrice)}</Typography>
                </Box>
                
                {promoApplied && (
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography color="success.main">Réduction (-10%)</Typography>
                    <Typography color="success.main" fontWeight={500}>-{formatPrice(discount)}</Typography>
                  </Box>
                )}

                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography color="text.secondary">Livraison</Typography>
                  <Typography fontWeight={500} color={shippingCost === 0 ? 'success.main' : 'text.primary'}>
                    {shippingCost === 0 ? 'Gratuite' : formatPrice(shippingCost)}
                  </Typography>
                </Box>

                {shippingCost > 0 && (
                  <Box
                    sx={{
                      p: 1.5,
                      borderRadius: 2,
                      backgroundColor: alpha(theme.palette.primary.main, 0.08),
                    }}
                  >
                    <Typography variant="caption" color="primary.main">
                      🚚 Plus que {formatPrice(50 - totalPrice)} pour la livraison gratuite !
                    </Typography>
                  </Box>
                )}
              </Box>

              <Divider sx={{ my: 3 }} />

              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>Total</Typography>
                <Typography variant="h5" sx={{ fontWeight: 800, color: 'primary.main' }}>
                  {formatPrice(finalTotal)}
                </Typography>
              </Box>

              <Button
                variant="contained"
                fullWidth
                size="large"
                onClick={() => navigate(isAuthenticated ? '/checkout' : '/login')}
                endIcon={<ArrowForward />}
                sx={{ py: 1.5, mb: 3 }}
              >
                {isAuthenticated ? 'Passer la commande' : 'Se connecter pour commander'}
              </Button>

              {/* Trust Badges */}
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                {[
                  { icon: <LocalShipping sx={{ fontSize: 20 }} />, text: 'Livraison gratuite dès 50€' },
                  { icon: <Security sx={{ fontSize: 20 }} />, text: 'Paiement 100% sécurisé' },
                  { icon: <LocalOffer sx={{ fontSize: 20 }} />, text: 'Satisfait ou remboursé 30j' },
                ].map((badge, index) => (
                  <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Box sx={{ color: 'primary.main' }}>{badge.icon}</Box>
                    <Typography variant="body2" color="text.secondary">
                      {badge.text}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default CartPage;