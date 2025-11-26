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
          minHeight: { xs: 'calc(100vh - 120px)', md: 'calc(100vh - 140px)' },
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          pt: { xs: 6, md: 8 },
          pb: { xs: 10, md: 14 },
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
        
        <Container maxWidth={false} sx={{ position: 'relative', zIndex: 1, px: { xs: 3, md: 6, lg: 10 } }}>
          <Grid container spacing={6} alignItems="center">
            <Grid item xs={12} md={6}>
              <Box sx={{ color: 'white', textAlign: { xs: 'center', md: 'left' } }}>
                <Chip
                  label="✨ Nouvelle Collection 2024"
                  sx={{
                    backgroundColor: 'rgba(255,255,255,0.2)',
                    color: 'white',
                    fontWeight: 600,
                    mb: 3,
                    backdropFilter: 'blur(10px)',
                    fontSize: '0.95rem',
                    py: 2.5,
                  }}
                />
                <Typography
                  variant="h1"
                  sx={{
                    fontWeight: 800,
                    mb: 3,
                    fontSize: { xs: '2.5rem', sm: '3.5rem', md: '4rem', lg: '5rem' },
                    lineHeight: 1.05,
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
                    mb: 4,
                    opacity: 0.9,
                    fontWeight: 400,
                    maxWidth: 550,
                    mx: { xs: 'auto', md: 0 },
                    fontSize: { xs: '1.1rem', md: '1.25rem', lg: '1.4rem' },
                    lineHeight: 1.7,
                  }}
                >
                  Des milliers de produits sélectionnés avec soin, livrés chez vous en un temps record.
                </Typography>
                <Box sx={{ display: 'flex', gap: 3, justifyContent: { xs: 'center', md: 'flex-start' }, flexWrap: 'wrap', mb: 5 }}>
                  <Button
                    variant="contained"
                    size="large"
                    onClick={() => navigate('/products')}
                    endIcon={<ArrowForward />}
                    sx={{
                      background: 'white',
                      color: 'primary.main',
                      px: 5,
                      py: 1.8,
                      fontSize: '1.1rem',
                      fontWeight: 700,
                      borderRadius: 3,
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
                    size="large"
                    sx={{
                      borderColor: 'rgba(255,255,255,0.5)',
                      color: 'white',
                      px: 5,
                      py: 1.8,
                      fontSize: '1.1rem',
                      borderRadius: 3,
                      borderWidth: 2,
                      '&:hover': {
                        borderColor: 'white',
                        backgroundColor: 'rgba(255,255,255,0.1)',
                        borderWidth: 2,
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
                    gap: { xs: 4, md: 6 },
                    justifyContent: { xs: 'center', md: 'flex-start' },
                  }}
                >
                  {[
                    { value: '10K+', label: 'Produits' },
                    { value: '50K+', label: 'Clients' },
                    { value: '4.9', label: 'Note moyenne' },
                  ].map((stat) => (
                    <Box key={stat.label} sx={{ textAlign: 'center' }}>
                      <Typography variant="h4" sx={{ fontWeight: 800, fontSize: { xs: '1.75rem', md: '2.25rem', lg: '2.5rem' } }}>
                        {stat.value}
                      </Typography>
                      <Typography variant="body2" sx={{ opacity: 0.8, fontSize: { xs: '0.95rem', md: '1.1rem' } }}>
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
                  src="https://images.unsplash.com/photo-1607082349566-187342175e2f?w=600"
                  alt="Shopping"
                  sx={{
                    width: '100%',
                    maxWidth: 520,
                    borderRadius: 5,
                    boxShadow: '0 30px 60px rgba(0,0,0,0.3)',
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

      {/* Promo Banner - Modern Creative Design */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #0F0F1A 0%, #1A1A2E 40%, #16213E 100%)',
          py: { xs: 10, md: 14 },
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Animated Mesh Gradient Background */}
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            opacity: 0.6,
            background: `
              radial-gradient(ellipse 80% 50% at 20% 40%, rgba(120, 119, 198, 0.3), transparent),
              radial-gradient(ellipse 60% 50% at 80% 50%, rgba(255, 119, 198, 0.25), transparent),
              radial-gradient(ellipse 50% 40% at 40% 80%, rgba(79, 172, 254, 0.2), transparent)
            `,
          }}
        />

        {/* Floating Orbs */}
        <Box
          sx={{
            position: 'absolute',
            top: '5%',
            left: '10%',
            width: { xs: 200, md: 350 },
            height: { xs: 200, md: 350 },
            borderRadius: '50%',
            background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.4) 0%, rgba(236, 72, 153, 0.2) 100%)',
            filter: 'blur(60px)',
            animation: 'floatOrb1 8s ease-in-out infinite',
            '@keyframes floatOrb1': {
              '0%, 100%': { transform: 'translate(0, 0) scale(1)' },
              '33%': { transform: 'translate(30px, -30px) scale(1.1)' },
              '66%': { transform: 'translate(-20px, 20px) scale(0.9)' },
            },
          }}
        />
        <Box
          sx={{
            position: 'absolute',
            bottom: '10%',
            right: '5%',
            width: { xs: 180, md: 300 },
            height: { xs: 180, md: 300 },
            borderRadius: '50%',
            background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.3) 0%, rgba(59, 130, 246, 0.2) 100%)',
            filter: 'blur(50px)',
            animation: 'floatOrb2 10s ease-in-out infinite',
            '@keyframes floatOrb2': {
              '0%, 100%': { transform: 'translate(0, 0) scale(1)' },
              '50%': { transform: 'translate(-40px, -20px) scale(1.15)' },
            },
          }}
        />

        {/* Geometric Patterns */}
        <Box
          sx={{
            position: 'absolute',
            top: '15%',
            right: '20%',
            width: 120,
            height: 120,
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: 4,
            transform: 'rotate(45deg)',
            animation: 'rotateSquare 20s linear infinite',
            '@keyframes rotateSquare': {
              '0%': { transform: 'rotate(45deg)' },
              '100%': { transform: 'rotate(405deg)' },
            },
          }}
        />
        <Box
          sx={{
            position: 'absolute',
            bottom: '20%',
            left: '15%',
            width: 80,
            height: 80,
            border: '1px solid rgba(255,255,255,0.06)',
            borderRadius: '50%',
            animation: 'pulse3 4s ease-in-out infinite',
            '@keyframes pulse3': {
              '0%, 100%': { transform: 'scale(1)', opacity: 0.6 },
              '50%': { transform: 'scale(1.2)', opacity: 0.3 },
            },
          }}
        />

        {/* Grid Pattern Overlay */}
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            backgroundImage: `
              linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)
            `,
            backgroundSize: '50px 50px',
            opacity: 0.5,
          }}
        />

        <Container maxWidth="xl" sx={{ position: 'relative', zIndex: 1 }}>
          <Grid container spacing={{ xs: 4, md: 8 }} alignItems="center">
            <Grid item xs={12} md={6} order={{ xs: 2, md: 1 }}>
              <Box sx={{ color: 'white', textAlign: { xs: 'center', md: 'left' } }}>
                {/* Animated Badge */}
                <Box
                  sx={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 1.5,
                    background: 'linear-gradient(135deg, rgba(236, 72, 153, 0.2) 0%, rgba(139, 92, 246, 0.2) 100%)',
                    border: '1px solid rgba(236, 72, 153, 0.3)',
                    backdropFilter: 'blur(10px)',
                    color: '#F472B6',
                    fontWeight: 700,
                    mb: 4,
                    px: 3,
                    py: 1.2,
                    borderRadius: 50,
                    fontSize: '0.9rem',
                    boxShadow: '0 0 30px rgba(236, 72, 153, 0.2)',
                  }}
                >
                  <Box
                    sx={{
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, #EC4899 0%, #F43F5E 100%)',
                      boxShadow: '0 0 10px #EC4899',
                      animation: 'glow 2s ease-in-out infinite',
                      '@keyframes glow': {
                        '0%, 100%': { boxShadow: '0 0 10px #EC4899' },
                        '50%': { boxShadow: '0 0 20px #EC4899, 0 0 30px #EC4899' },
                      },
                    }}
                  />
                  <LocalOffer sx={{ fontSize: 18 }} />
                  Offre Exclusive
                </Box>

                {/* Main Title with Creative Typography */}
                <Typography
                  variant="h1"
                  sx={{
                    fontWeight: 900,
                    mb: 3,
                    fontSize: { xs: '2.8rem', sm: '4rem', md: '5rem' },
                    lineHeight: 0.95,
                    letterSpacing: '-0.03em',
                  }}
                >
                  <Box
                    component="span"
                    sx={{
                      display: 'block',
                      background: 'linear-gradient(135deg, #FFFFFF 0%, rgba(255,255,255,0.8) 100%)',
                      backgroundClip: 'text',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                    }}
                  >
                    Jusqu'à
                  </Box>
                  <Box
                    component="span"
                    sx={{
                      display: 'block',
                      position: 'relative',
                      background: 'linear-gradient(135deg, #F472B6 0%, #EC4899 30%, #A855F7 70%, #6366F1 100%)',
                      backgroundClip: 'text',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      backgroundSize: '200% 200%',
                      animation: 'gradientShift 3s ease-in-out infinite',
                      '@keyframes gradientShift': {
                        '0%, 100%': { backgroundPosition: '0% 50%' },
                        '50%': { backgroundPosition: '100% 50%' },
                      },
                      '&::after': {
                        content: '"-50%"',
                        position: 'absolute',
                        left: 3,
                        top: 3,
                        background: 'linear-gradient(135deg, rgba(244, 114, 182, 0.3) 0%, rgba(139, 92, 246, 0.2) 100%)',
                        backgroundClip: 'text',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        zIndex: -1,
                        filter: 'blur(8px)',
                      },
                    }}
                  >
                    -50%
                  </Box>
                  <Box
                    component="span"
                    sx={{
                      display: 'block',
                      fontSize: { xs: '1.8rem', sm: '2.5rem', md: '3rem' },
                      fontWeight: 600,
                      background: 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.6) 100%)',
                      backgroundClip: 'text',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      mt: 1,
                    }}
                  >
                    sur la sélection
                  </Box>
                </Typography>

                {/* Description with Glass Effect */}
                <Box
                  sx={{
                    background: 'rgba(255,255,255,0.03)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255,255,255,0.05)',
                    borderRadius: 3,
                    p: 2.5,
                    mb: 4,
                    maxWidth: 500,
                    mx: { xs: 'auto', md: 0 },
                  }}
                >
                  <Typography
                    variant="body1"
                    sx={{
                      color: 'rgba(255,255,255,0.7)',
                      fontWeight: 400,
                      lineHeight: 1.8,
                      fontSize: '1.05rem',
                    }}
                  >
                    🎁 Profitez de nos offres exceptionnelles sur des milliers de produits premium. 
                    <Box component="span" sx={{ color: '#F472B6', fontWeight: 600 }}> Offre valable jusqu'au 31 décembre.</Box>
                  </Typography>
                </Box>

                {/* CTA Buttons with Hover Effects */}
                <Box sx={{ display: 'flex', gap: 2, justifyContent: { xs: 'center', md: 'flex-start' }, flexWrap: 'wrap', mb: 5 }}>
                  <Button
                    variant="contained"
                    size="large"
                    onClick={() => navigate('/products?sale=true')}
                    endIcon={<ArrowForward />}
                    sx={{
                      background: 'linear-gradient(135deg, #EC4899 0%, #A855F7 50%, #6366F1 100%)',
                      backgroundSize: '200% 200%',
                      px: 5,
                      py: 2,
                      fontSize: '1.1rem',
                      fontWeight: 700,
                      borderRadius: 50,
                      border: 'none',
                      boxShadow: '0 10px 40px rgba(168, 85, 247, 0.4)',
                      transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                      position: 'relative',
                      overflow: 'hidden',
                      '&::before': {
                        content: '""',
                        position: 'absolute',
                        inset: 0,
                        background: 'linear-gradient(135deg, rgba(255,255,255,0.2) 0%, transparent 50%, rgba(255,255,255,0.1) 100%)',
                        opacity: 0,
                        transition: 'opacity 0.3s ease',
                      },
                      '&:hover': {
                        backgroundPosition: '100% 100%',
                        transform: 'translateY(-4px) scale(1.02)',
                        boxShadow: '0 20px 50px rgba(168, 85, 247, 0.5)',
                        '&::before': {
                          opacity: 1,
                        },
                      },
                    }}
                  >
                    Découvrir les offres
                  </Button>
                  <Button
                    variant="outlined"
                    size="large"
                    sx={{
                      borderColor: 'rgba(255,255,255,0.2)',
                      color: 'white',
                      px: 4,
                      py: 2,
                      borderRadius: 50,
                      backdropFilter: 'blur(10px)',
                      background: 'rgba(255,255,255,0.03)',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        borderColor: 'rgba(255,255,255,0.5)',
                        background: 'rgba(255,255,255,0.08)',
                        transform: 'translateY(-2px)',
                      },
                    }}
                  >
                    Voir le catalogue
                  </Button>
                </Box>

                {/* Trust Badges with Icons */}
                <Box
                  sx={{
                    display: 'flex',
                    gap: { xs: 2, md: 4 },
                    justifyContent: { xs: 'center', md: 'flex-start' },
                    flexWrap: 'wrap',
                  }}
                >
                  {[
                    { icon: <LocalShipping />, text: 'Livraison express', color: '#6366F1' },
                    { icon: <Security />, text: '100% Sécurisé', color: '#10B981' },
                    { icon: <AutoAwesome />, text: 'Qualité premium', color: '#F59E0B' },
                  ].map((item, i) => (
                    <Box
                      key={i}
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                        background: 'rgba(255,255,255,0.03)',
                        backdropFilter: 'blur(5px)',
                        border: '1px solid rgba(255,255,255,0.05)',
                        borderRadius: 2,
                        px: 2,
                        py: 1,
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          background: 'rgba(255,255,255,0.06)',
                          transform: 'translateY(-2px)',
                        },
                      }}
                    >
                      <Box sx={{ color: item.color, display: 'flex' }}>{item.icon}</Box>
                      <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)', fontWeight: 500, fontSize: '0.85rem' }}>
                        {item.text}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              </Box>
            </Grid>

            {/* Creative Image Section */}
            <Grid item xs={12} md={6} order={{ xs: 1, md: 2 }}>
              <Box
                sx={{
                  position: 'relative',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  minHeight: { xs: 350, md: 550 },
                }}
              >
                {/* Decorative Ring */}
                <Box
                  sx={{
                    position: 'absolute',
                    width: { xs: 280, md: 450 },
                    height: { xs: 280, md: 450 },
                    borderRadius: '50%',
                    border: '1px dashed rgba(139, 92, 246, 0.3)',
                    animation: 'rotateSlow 30s linear infinite',
                    '@keyframes rotateSlow': {
                      '0%': { transform: 'rotate(0deg)' },
                      '100%': { transform: 'rotate(360deg)' },
                    },
                  }}
                />

                {/* Main Image Card with Glass Effect */}
                <Box
                  sx={{
                    position: 'relative',
                    width: { xs: '85%', md: '75%' },
                    maxWidth: 400,
                    borderRadius: 6,
                    overflow: 'hidden',
                    background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
                    backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    boxShadow: '0 30px 80px rgba(0,0,0,0.4)',
                    transition: 'all 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                    '&:hover': {
                      transform: 'scale(1.03) rotate(-1deg)',
                      boxShadow: '0 40px 100px rgba(139, 92, 246, 0.3)',
                    },
                  }}
                >
                  <Box sx={{ p: 1.5 }}>
                    <Box
                      component="img"
                      src="https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=600"
                      alt="Promo"
                      sx={{
                        width: '100%',
                        height: { xs: 280, md: 380 },
                        objectFit: 'cover',
                        borderRadius: 4,
                      }}
                    />
                  </Box>
                  
                  {/* Image Overlay Content */}
                  <Box
                    sx={{
                      position: 'absolute',
                      bottom: 0,
                      left: 0,
                      right: 0,
                      background: 'linear-gradient(180deg, transparent 0%, rgba(15,15,26,0.95) 100%)',
                      p: 3,
                      pt: 6,
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} sx={{ fontSize: 16, color: '#FCD34D' }} />
                      ))}
                      <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)', ml: 0.5 }}>
                        4.9 (2.5k avis)
                      </Typography>
                    </Box>
                    <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.6)' }}>
                      Collection exclusive disponible
                    </Typography>
                  </Box>
                </Box>

                {/* Floating Discount Badge */}
                <Box
                  sx={{
                    position: 'absolute',
                    top: { xs: 0, md: 30 },
                    right: { xs: 0, md: 20 },
                    background: 'linear-gradient(135deg, #8B5CF6 0%, #6366F1 100%)',
                    borderRadius: 4,
                    p: 2.5,
                    boxShadow: '0 15px 50px rgba(99, 102, 241, 0.5)',
                    border: '1px solid rgba(255,255,255,0.2)',
                    animation: 'floatBadge 4s ease-in-out infinite',
                    '@keyframes floatBadge': {
                      '0%, 100%': { transform: 'translateY(0) rotate(3deg)' },
                      '50%': { transform: 'translateY(-15px) rotate(-3deg)' },
                    },
                  }}
                >
                  <Typography
                    sx={{
                      color: 'white',
                      fontWeight: 900,
                      fontSize: { xs: '1.8rem', md: '2.2rem' },
                      lineHeight: 1,
                      textAlign: 'center',
                    }}
                  >
                    -50%
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{
                      color: 'rgba(255,255,255,0.8)',
                      display: 'block',
                      textAlign: 'center',
                      fontWeight: 700,
                      letterSpacing: 2,
                      mt: 0.5,
                    }}
                  >
                    RÉDUCTION
                  </Typography>
                </Box>

                {/* Countdown Timer Card */}
                <Box
                  sx={{
                    position: 'absolute',
                    bottom: { xs: -10, md: 20 },
                    left: { xs: 0, md: -30 },
                    background: 'rgba(255,255,255,0.95)',
                    backdropFilter: 'blur(20px)',
                    borderRadius: 4,
                    p: 2.5,
                    boxShadow: '0 20px 50px rgba(0,0,0,0.2)',
                    border: '1px solid rgba(0,0,0,0.05)',
                    display: { xs: 'none', sm: 'block' },
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                    <Box
                      sx={{
                        width: 8,
                        height: 8,
                        borderRadius: '50%',
                        background: '#EF4444',
                        animation: 'blink 1s ease-in-out infinite',
                        '@keyframes blink': {
                          '0%, 100%': { opacity: 1 },
                          '50%': { opacity: 0.3 },
                        },
                      }}
                    />
                    <Typography variant="caption" sx={{ color: '#1E293B', fontWeight: 700, fontSize: '0.8rem' }}>
                      OFFRE SE TERMINE DANS
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', gap: 1.5 }}>
                    {[
                      { value: '36', label: 'Jours' },
                      { value: '12', label: 'Hrs' },
                      { value: '45', label: 'Min' },
                      { value: '30', label: 'Sec' },
                    ].map((item, i) => (
                      <Box key={i} sx={{ textAlign: 'center' }}>
                        <Box
                          sx={{
                            background: 'linear-gradient(135deg, #1E293B 0%, #0F172A 100%)',
                            color: 'white',
                            borderRadius: 2,
                            px: 1.5,
                            py: 1,
                            fontWeight: 800,
                            fontSize: '1.2rem',
                            fontFamily: 'monospace',
                            minWidth: 45,
                          }}
                        >
                          {item.value}
                        </Box>
                        <Typography variant="caption" sx={{ color: '#64748B', fontSize: '0.65rem', fontWeight: 600 }}>
                          {item.label}
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                </Box>

                {/* Floating Elements */}
                <Box
                  sx={{
                    position: 'absolute',
                    top: '50%',
                    left: { xs: '5%', md: '5%' },
                    display: { xs: 'none', md: 'block' },
                  }}
                >
                  <Box
                    sx={{
                      width: 50,
                      height: 50,
                      borderRadius: 3,
                      background: 'linear-gradient(135deg, rgba(236, 72, 153, 0.2) 0%, rgba(139, 92, 246, 0.2) 100%)',
                      backdropFilter: 'blur(10px)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      animation: 'floatIcon 5s ease-in-out infinite',
                      '@keyframes floatIcon': {
                        '0%, 100%': { transform: 'translateY(0) rotate(0deg)' },
                        '50%': { transform: 'translateY(-20px) rotate(10deg)' },
                      },
                    }}
                  >
                    <AutoAwesome sx={{ color: '#F472B6', fontSize: 24 }} />
                  </Box>
                </Box>
              </Box>
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