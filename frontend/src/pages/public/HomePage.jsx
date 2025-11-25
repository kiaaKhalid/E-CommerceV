import { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Grid,
  Card,
  CardMedia,
  CardContent,
  CardActions,
  IconButton,
  Chip,
  useTheme,
  useMediaQuery,
  alpha,
  Skeleton,
} from '@mui/material';
import {
  ArrowForward,
  ShoppingCart,
  Favorite,
  FavoriteBorder,
  Star,
  LocalShipping,
  Security,
  Headphones,
  TrendingUp,
  NewReleases,
  LocalOffer,
  Category,
  AutoAwesome,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useProducts, useCategories } from '../../hooks';
import { useCart } from '../../contexts/CartContext';
import { useAuth } from '../../contexts/AuthContext';
import { formatPrice, getImageUrl } from '../../utils/helpers';
import CategoryCarousel from '../../components/ui/CategoryCarousel';

const HomePage = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));
  const { products, loading } = useProducts();
  const { categories, loading: categoriesLoading } = useCategories();
  const { addToCart } = useCart();
  const { isAuthenticated } = useAuth();

  const featuredProducts = products.slice(0, 8);
  const newProducts = products.slice(0, 4);

  const handleAddToCart = (product, e) => {
    e.stopPropagation();
    addToCart(product, 1);
  };

  // Product Card Component
  const ProductCard = ({ product, index }) => (
    <Card
      onClick={() => navigate(`/products/${product.id}`)}
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        cursor: 'pointer',
        position: 'relative',
        borderRadius: 3,
        overflow: 'hidden',
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
        transition: 'all 0.3s ease',
        '&:hover': {
          boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
          transform: 'translateY(-4px)',
          '& .product-image': {
            transform: 'scale(1.05)',
          },
          '& .product-actions': {
            opacity: 1,
            transform: 'translateY(0)',
          },
        },
      }}
    >
      {/* Image Container - Hauteur fixe */}
      <Box sx={{ position: 'relative', overflow: 'hidden', height: 220 }}>
        <CardMedia
          component="img"
          image={getImageUrl(product.image_url)}
          alt={product.name}
          className="product-image"
          sx={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            transition: 'transform 0.4s ease',
          }}
        />
        
        {/* Badges */}
        <Box sx={{ position: 'absolute', top: 12, left: 12, display: 'flex', flexDirection: 'column', gap: 0.5 }}>
          {index < 2 && (
            <Chip
              label="Nouveau"
              size="small"
              sx={{
                background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                color: 'white',
                fontWeight: 600,
                fontSize: '0.7rem',
              }}
            />
          )}
          {product.stock < 10 && product.stock > 0 && (
            <Chip
              label="Stock limité"
              size="small"
              sx={{
                backgroundColor: '#F59E0B',
                color: 'white',
                fontWeight: 600,
                fontSize: '0.7rem',
              }}
            />
          )}
        </Box>

        {/* Quick Actions */}
        <Box
          className="product-actions"
          sx={{
            position: 'absolute',
            bottom: 12,
            left: 12,
            right: 12,
            display: 'flex',
            gap: 1,
            opacity: 0,
            transform: 'translateY(10px)',
            transition: 'all 0.3s ease',
          }}
        >
          <Button
            variant="contained"
            fullWidth
            size="small"
            startIcon={<ShoppingCart sx={{ fontSize: 18 }} />}
            onClick={(e) => handleAddToCart(product, e)}
            disabled={product.stock === 0}
            sx={{
              background: 'rgba(255,255,255,0.95)',
              color: 'primary.main',
              backdropFilter: 'blur(10px)',
              fontWeight: 600,
              '&:hover': {
                background: 'white',
              },
            }}
          >
            Ajouter
          </Button>
          <IconButton
            onClick={(e) => e.stopPropagation()}
            sx={{
              backgroundColor: 'rgba(255,255,255,0.95)',
              backdropFilter: 'blur(10px)',
              '&:hover': { backgroundColor: 'white' },
            }}
          >
            <FavoriteBorder sx={{ fontSize: 20 }} />
          </IconButton>
        </Box>
      </Box>

      {/* Content - Hauteur fixe */}
      <CardContent sx={{ flexGrow: 1, p: 2, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: 140 }}>
        <Box>
          <Typography
            variant="caption"
            sx={{
              color: 'primary.main',
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              fontSize: '0.7rem',
            }}
          >
            {product.category || 'CATÉGORIE'}
          </Typography>
          <Typography
            variant="subtitle1"
            sx={{
              fontWeight: 600,
              mt: 0.5,
              mb: 1,
              lineHeight: 1.3,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              fontSize: '0.95rem',
              height: '2.6em',
            }}
          >
            {product.name}
          </Typography>
        </Box>
        
        <Box>
          {/* Rating */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1 }}>
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                sx={{
                  fontSize: 14,
                  color: i < 4 ? '#F59E0B' : 'grey.300',
                }}
              />
            ))}
            <Typography variant="caption" color="text.secondary" sx={{ ml: 0.5, fontSize: '0.7rem' }}>
              (128)
            </Typography>
          </Box>

          {/* Price */}
          <Typography
            variant="h6"
            sx={{
              fontWeight: 700,
              color: 'primary.main',
              fontSize: '1.1rem',
            }}
          >
            {formatPrice(product.price)}
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );

  return (
    <Box>
      {/* Hero Section */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 50%, #EC4899 100%)',
          position: 'relative',
          overflow: 'visible',
          minHeight: { xs: 'auto', md: 'auto' },
          pt: { xs: 4, md: 6 },
          pb: { xs: 8, md: 10 },
        }}
      >
        {/* Background Pattern */}
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />
        
        <Container maxWidth="xl" sx={{ position: 'relative', zIndex: 1 }}>
          <Grid container spacing={3} alignItems="center">
            <Grid item xs={12} md={6}>
              <Box sx={{ color: 'white', textAlign: { xs: 'center', md: 'left' } }}>
                <Chip
                  label="✨ Nouvelle Collection 2024"
                  sx={{
                    backgroundColor: 'rgba(255,255,255,0.2)',
                    color: 'white',
                    fontWeight: 600,
                    mb: 2,
                    backdropFilter: 'blur(10px)',
                    fontSize: '0.75rem',
                  }}
                />
                <Typography
                  variant="h1"
                  sx={{
                    fontWeight: 800,
                    mb: 1.5,
                    fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem' },
                    lineHeight: 1.1,
                  }}
                >
                  Découvrez le
                  <br />
                  <Box
                    component="span"
                    sx={{
                      background: 'linear-gradient(135deg, #FDE68A 0%, #FCD34D 100%)',
                      backgroundClip: 'text',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                    }}
                  >
                    Shopping du Futur
                  </Box>
                </Typography>
                <Typography
                  variant="body1"
                  sx={{
                    mb: 2.5,
                    opacity: 0.9,
                    fontWeight: 400,
                    maxWidth: 450,
                    mx: { xs: 'auto', md: 0 },
                    fontSize: { xs: '0.9rem', md: '1rem' },
                  }}
                >
                  Des milliers de produits sélectionnés avec soin, livrés chez vous en un temps record.
                </Typography>
                <Box sx={{ display: 'flex', gap: 2, justifyContent: { xs: 'center', md: 'flex-start' }, flexWrap: 'wrap', mb: 3 }}>
                  <Button
                    variant="contained"
                    size="medium"
                    onClick={() => navigate('/products')}
                    endIcon={<ArrowForward />}
                    sx={{
                      background: 'white',
                      color: 'primary.main',
                      px: 3,
                      py: 1,
                      fontSize: '0.9rem',
                      fontWeight: 700,
                      '&:hover': {
                        background: 'rgba(255,255,255,0.9)',
                        transform: 'translateY(-2px)',
                      },
                    }}
                  >
                    Explorer la boutique
                  </Button>
                  <Button
                    variant="outlined"
                    size="medium"
                    sx={{
                      borderColor: 'rgba(255,255,255,0.5)',
                      color: 'white',
                      px: 3,
                      py: 1,
                      '&:hover': {
                        borderColor: 'white',
                        backgroundColor: 'rgba(255,255,255,0.1)',
                      },
                    }}
                  >
                    En savoir plus
                  </Button>
                </Box>

                {/* Stats */}
                <Box
                  sx={{
                    display: 'flex',
                    gap: { xs: 3, md: 4 },
                    justifyContent: { xs: 'center', md: 'flex-start' },
                  }}
                >
                  {[
                    { value: '10K+', label: 'Produits' },
                    { value: '50K+', label: 'Clients' },
                    { value: '4.9', label: 'Note moyenne' },
                  ].map((stat) => (
                    <Box key={stat.label} sx={{ textAlign: 'center' }}>
                      <Typography variant="h5" sx={{ fontWeight: 800, fontSize: { xs: '1.25rem', md: '1.5rem' } }}>
                        {stat.value}
                      </Typography>
                      <Typography variant="caption" sx={{ opacity: 0.8 }}>
                        {stat.label}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              </Box>
            </Grid>

            {/* Hero Image - Hidden on mobile */}
            <Grid item xs={12} md={6} sx={{ display: { xs: 'none', md: 'block' } }}>
              <Box
                sx={{
                  position: 'relative',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                <Box
                  component="img"
                  src="https://images.unsplash.com/photo-1607082349566-187342175e2f?w=500"
                  alt="Shopping"
                  sx={{
                    width: '100%',
                    maxWidth: 380,
                    borderRadius: 4,
                    boxShadow: '0 20px 40px rgba(0,0,0,0.25)',
                    transform: 'rotate(3deg)',
                  }}
                />
              </Box>
            </Grid>
          </Grid>
        </Container>

        {/* Categories Carousel - Positionné en bas du hero, débordant */}
        <Box
          sx={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            transform: 'translateY(50%)',
            zIndex: 10,
            '&::before': {
              content: '""',
              position: 'absolute',
              left: 0,
              top: 0,
              bottom: 0,
              width: { xs: 30, md: 80 },
              background: 'linear-gradient(90deg, #F5F5F5 0%, transparent 100%)',
              zIndex: 2,
              pointerEvents: 'none',
            },
            '&::after': {
              content: '""',
              position: 'absolute',
              right: 0,
              top: 0,
              bottom: 0,
              width: { xs: 30, md: 80 },
              background: 'linear-gradient(270deg, #F5F5F5 0%, transparent 100%)',
              zIndex: 2,
              pointerEvents: 'none',
            },
          }}
        >
          <CategoryCarousel categories={categories} loading={categoriesLoading} />
        </Box>
      </Box>

      {/* Featured Products Section */}
      <Box sx={{ backgroundColor: 'grey.50', pt: { xs: 10, md: 12 }, pb: { xs: 6, md: 10 } }}>
        <Container maxWidth={false} sx={{ px: { xs: 2, md: 4 } }}>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              mb: { xs: 4, md: 5 },
              flexWrap: 'wrap',
              gap: 2,
            }}
          >
            <Box>
              <Typography variant="h3" sx={{ fontWeight: 800, mb: 0.5 }}>
                Produits populaires
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Les favoris de nos clients
              </Typography>
            </Box>
            <Button
              variant="outlined"
              endIcon={<ArrowForward />}
              onClick={() => navigate('/products')}
              sx={{ borderRadius: 3 }}
            >
              Voir tout
            </Button>
          </Box>

          <Box
            sx={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: 2,
            }}
          >
            {loading
              ? [...Array(8)].map((_, i) => (
                  <Box
                    key={i}
                    sx={{
                      width: { xs: 'calc(50% - 8px)', md: 'calc(25% - 12px)' },
                    }}
                  >
                    <Card sx={{ height: '100%', borderRadius: 3 }}>
                      <Skeleton variant="rectangular" height={220} />
                      <CardContent>
                        <Skeleton width="40%" height={16} />
                        <Skeleton width="100%" height={24} sx={{ my: 1 }} />
                        <Skeleton width="50%" height={16} />
                        <Skeleton width="35%" height={28} sx={{ mt: 1 }} />
                      </CardContent>
                    </Card>
                  </Box>
                ))
              : featuredProducts.map((product, index) => (
                  <Box
                    key={product.id}
                    sx={{
                      width: { xs: 'calc(50% - 8px)', md: 'calc(25% - 12px)' },
                    }}
                  >
                    <ProductCard product={product} index={index} />
                  </Box>
                ))}
          </Box>
        </Container>
      </Box>

      {/* Promo Banner */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)',
          py: { xs: 6, md: 10 },
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            top: -100,
            right: -100,
            width: 300,
            height: 300,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)',
            opacity: 0.1,
          }}
        />
        <Container maxWidth="lg">
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={6}>
              <Box sx={{ color: 'white', textAlign: { xs: 'center', md: 'left' } }}>
                <Chip
                  icon={<LocalOffer sx={{ color: 'white !important' }} />}
                  label="Offre Limitée"
                  sx={{
                    background: 'linear-gradient(135deg, #EC4899 0%, #F43F5E 100%)',
                    color: 'white',
                    fontWeight: 600,
                    mb: 2,
                  }}
                />
                <Typography variant="h2" sx={{ fontWeight: 800, mb: 2 }}>
                  Jusqu'à -50%
                  <br />
                  sur la sélection
                </Typography>
                <Typography variant="body1" sx={{ color: 'grey.400', mb: 4 }}>
                  Profitez de nos offres exceptionnelles sur des milliers de produits.
                  Offre valable jusqu'au 31 décembre.
                </Typography>
                <Button
                  variant="contained"
                  size="large"
                  onClick={() => navigate('/products?sale=true')}
                  sx={{
                    background: 'linear-gradient(135deg, #EC4899 0%, #F43F5E 100%)',
                    px: 4,
                    py: 1.5,
                    '&:hover': {
                      background: 'linear-gradient(135deg, #DB2777 0%, #E11D48 100%)',
                    },
                  }}
                >
                  Découvrir les offres
                </Button>
              </Box>
            </Grid>
            <Grid item xs={12} md={6} sx={{ display: { xs: 'none', md: 'block' } }}>
              <Box
                component="img"
                src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=600"
                alt="Promo"
                sx={{
                  width: '100%',
                  maxWidth: 450,
                  borderRadius: 4,
                  mx: 'auto',
                  display: 'block',
                }}
              />
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Newsletter Section */}
      <Container maxWidth="md" sx={{ py: { xs: 6, md: 10 }, textAlign: 'center' }}>
        <Box
          sx={{
            p: { xs: 4, md: 6 },
            borderRadius: 4,
            background: alpha(theme.palette.primary.main, 0.04),
            border: '1px solid',
            borderColor: alpha(theme.palette.primary.main, 0.1),
          }}
        >
          <Typography variant="h3" sx={{ fontWeight: 800, mb: 2 }}>
            Restez informé
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 4, maxWidth: 500, mx: 'auto' }}>
            Inscrivez-vous à notre newsletter pour recevoir nos dernières offres et nouveautés
          </Typography>
          <Box
            sx={{
              display: 'flex',
              gap: 1.5,
              maxWidth: 450,
              mx: 'auto',
              flexDirection: { xs: 'column', sm: 'row' },
            }}
          >
            <Box
              component="input"
              placeholder="Votre adresse email"
              sx={{
                flex: 1,
                px: 2.5,
                py: 1.5,
                borderRadius: 2,
                border: '2px solid',
                borderColor: 'divider',
                fontSize: '1rem',
                outline: 'none',
                '&:focus': {
                  borderColor: 'primary.main',
                },
              }}
            />
            <Button
              variant="contained"
              size="large"
              sx={{ px: 4, whiteSpace: 'nowrap' }}
            >
              S'inscrire
            </Button>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default HomePage;