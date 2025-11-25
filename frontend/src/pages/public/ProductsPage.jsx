import { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Card,
  CardMedia,
  CardContent,
  Typography,
  Button,
  Box,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Pagination,
  Slider,
  Paper,
  Divider,
  IconButton,
  Drawer,
  useTheme,
  useMediaQuery,
  InputAdornment,
  alpha,
  Skeleton,
  Breadcrumbs,
  Link,
  ToggleButton,
  ToggleButtonGroup,
} from '@mui/material';
import {
  Search,
  FilterList,
  ShoppingCart,
  Favorite,
  FavoriteBorder,
  Close,
  GridView,
  ViewList,
  Star,
  TuneRounded,
  KeyboardArrowDown,
} from '@mui/icons-material';
import { useSearchParams, Link as RouterLink } from 'react-router-dom';
import { useProducts, useWishlist } from '../../hooks';
import { useCart } from '../../contexts/CartContext';
import { useAuth } from '../../contexts/AuthContext';
import { formatPrice, getImageUrl } from '../../utils/helpers';

// Filter Sidebar Component
const FilterSidebar = ({ 
  isMobile, 
  onClose, 
  searchQuery, 
  setSearchQuery, 
  onSearch,
  category,
  setCategory,
  priceRange,
  setPriceRange,
  sortBy,
  setSortBy
}) => {
  const theme = useTheme();

  return (
    <Box sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1 }}>
          <TuneRounded color="primary" />
          Filtres
        </Typography>
        {isMobile && (
          <IconButton onClick={onClose} size="small">
            <Close />
          </IconButton>
        )}
      </Box>

      {/* Search */}
      <Box component="form" onSubmit={onSearch} sx={{ mb: 3 }}>
        <TextField
          fullWidth
          size="small"
          placeholder="Rechercher..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search sx={{ color: 'text.secondary', fontSize: 20 }} />
              </InputAdornment>
            ),
          }}
          sx={{
            '& .MuiOutlinedInput-root': {
              backgroundColor: alpha(theme.palette.primary.main, 0.04),
              '&:hover': { backgroundColor: alpha(theme.palette.primary.main, 0.08) },
            },
          }}
        />
      </Box>

      <Divider sx={{ mb: 3 }} />

      {/* Category */}
      <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1.5, color: 'text.secondary' }}>
        Catégorie
      </Typography>
      <FormControl fullWidth size="small" sx={{ mb: 3 }}>
        <Select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          displayEmpty
          sx={{ borderRadius: 2 }}
        >
          <MenuItem value="">Toutes les catégories</MenuItem>
          <MenuItem value="Electronics">Électronique</MenuItem>
          <MenuItem value="Clothing">Mode</MenuItem>
          <MenuItem value="Books">Livres</MenuItem>
          <MenuItem value="Home">Maison</MenuItem>
          <MenuItem value="Sports">Sports</MenuItem>
          <MenuItem value="Beauty">Beauté</MenuItem>
        </Select>
      </FormControl>

      {/* Price Range */}
      <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1.5, color: 'text.secondary' }}>
        Prix
      </Typography>
      <Box sx={{ px: 1, mb: 1 }}>
        <Slider
          value={priceRange}
          onChange={(e, newValue) => setPriceRange(newValue)}
          valueLabelDisplay="auto"
          min={0}
          max={2000}
          step={10}
          valueLabelFormat={(value) => formatPrice(value)}
          sx={{
            '& .MuiSlider-thumb': {
              width: 16,
              height: 16,
            },
          }}
        />
      </Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="caption" color="text.secondary">
          {formatPrice(priceRange[0])}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {formatPrice(priceRange[1])}
        </Typography>
      </Box>

      <Divider sx={{ mb: 3 }} />

      {/* Sort */}
      <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1.5, color: 'text.secondary' }}>
        Trier par
      </Typography>
      <FormControl fullWidth size="small">
        <Select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          sx={{ borderRadius: 2 }}
        >
          <MenuItem value="name-asc">Nom (A-Z)</MenuItem>
          <MenuItem value="name-desc">Nom (Z-A)</MenuItem>
          <MenuItem value="price-asc">Prix croissant</MenuItem>
          <MenuItem value="price-desc">Prix décroissant</MenuItem>
          <MenuItem value="date-desc">Plus récents</MenuItem>
        </Select>
      </FormControl>

      {/* Reset Button */}
      <Button
        variant="outlined"
        fullWidth
        sx={{ mt: 'auto', pt: 3, borderRadius: 2 }}
        onClick={() => {
          setCategory('');
          setPriceRange([0, 2000]);
          setSortBy('name-asc');
          setSearchQuery('');
        }}
      >
        Réinitialiser les filtres
      </Button>
    </Box>
  );
};

const ProductsPage = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const { user } = useAuth();
  const { addToCart } = useCart();
  const { wishlist, addToWishlist, removeFromWishlist, isInWishlist } = useWishlist(user?.id);
  
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [category, setCategory] = useState(searchParams.get('category') || '');
  const [sortBy, setSortBy] = useState('name-asc');
  const [priceRange, setPriceRange] = useState([0, 2000]);
  const [currentPage, setCurrentPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState('grid');
  
  const productsPerPage = 12;
  const { products, loading, error, search } = useProducts();

  useEffect(() => {
    if (searchQuery) {
      search(searchQuery);
    }
  }, [searchQuery, search]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setSearchParams({ search: searchQuery.trim() });
      search(searchQuery.trim());
    }
  };

  const handleAddToCart = (product, e) => {
    e?.stopPropagation();
    addToCart(product, 1);
  };

  const handleToggleWishlist = async (product, e) => {
    e?.stopPropagation();
    if (isInWishlist(product.id)) {
      const wishlistItem = wishlist.find(item => item.product_id === product.id);
      if (wishlistItem) await removeFromWishlist(wishlistItem.id);
    } else {
      await addToWishlist(product.id);
    }
  };

  const filteredProducts = products.filter(product => {
    if (category && product.category !== category) return false;
    if (product.price < priceRange[0] || product.price > priceRange[1]) return false;
    return true;
  });

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortBy) {
      case 'name-asc': return a.name.localeCompare(b.name);
      case 'name-desc': return b.name.localeCompare(a.name);
      case 'price-asc': return a.price - b.price;
      case 'price-desc': return b.price - a.price;
      case 'date-desc': return new Date(b.created_at) - new Date(a.created_at);
      default: return 0;
    }
  });

  const totalPages = Math.ceil(sortedProducts.length / productsPerPage);
  const startIndex = (currentPage - 1) * productsPerPage;
  const displayedProducts = sortedProducts.slice(startIndex, startIndex + productsPerPage);

  // Product Card
  const ProductCard = ({ product }) => (
    <Card
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: viewMode === 'list' ? 'row' : 'column',
        cursor: 'pointer',
        '&:hover': {
          '& .product-image': { transform: 'scale(1.05)' },
          '& .quick-actions': { opacity: 1 },
        },
      }}
    >
      <Box
        sx={{
          position: 'relative',
          overflow: 'hidden',
          width: viewMode === 'list' ? { xs: 120, sm: 200 } : '100%',
          pt: viewMode === 'list' ? 0 : '100%',
          flexShrink: 0,
        }}
      >
        <CardMedia
          component="img"
          image={getImageUrl(product.image_url)}
          alt={product.name}
          className="product-image"
          sx={{
            position: viewMode === 'list' ? 'relative' : 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: viewMode === 'list' ? { xs: 120, sm: 200 } : '100%',
            objectFit: 'cover',
            transition: 'transform 0.4s ease',
          }}
        />
        
        {/* Badges */}
        {product.stock < 10 && product.stock > 0 && (
          <Chip
            label="Stock limité"
            size="small"
            sx={{
              position: 'absolute',
              top: 8,
              left: 8,
              backgroundColor: '#F59E0B',
              color: 'white',
              fontWeight: 600,
              fontSize: '0.65rem',
            }}
          />
        )}
        
        {/* Quick Actions */}
        <Box
          className="quick-actions"
          sx={{
            position: 'absolute',
            top: 8,
            right: 8,
            display: 'flex',
            flexDirection: 'column',
            gap: 0.5,
            opacity: { xs: 1, md: 0 },
            transition: 'opacity 0.3s',
          }}
        >
          <IconButton
            size="small"
            onClick={(e) => handleToggleWishlist(product, e)}
            sx={{
              backgroundColor: 'white',
              boxShadow: 1,
              '&:hover': { backgroundColor: 'white' },
            }}
          >
            {isInWishlist(product.id) ? (
              <Favorite sx={{ fontSize: 18, color: 'error.main' }} />
            ) : (
              <FavoriteBorder sx={{ fontSize: 18 }} />
            )}
          </IconButton>
        </Box>
      </Box>

      <CardContent sx={{ flex: 1, p: { xs: 1.5, md: 2 }, display: 'flex', flexDirection: 'column' }}>
        <Typography
          variant="caption"
          sx={{ color: 'primary.main', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}
        >
          {product.category || 'Catégorie'}
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
            WebkitLineClamp: viewMode === 'list' ? 1 : 2,
            WebkitBoxOrient: 'vertical',
            fontSize: { xs: '0.875rem', md: '1rem' },
          }}
        >
          {product.name}
        </Typography>

        {viewMode === 'list' && (
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              mb: 1,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              display: { xs: 'none', sm: '-webkit-box' },
            }}
          >
            {product.description}
          </Typography>
        )}

        {/* Rating */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1 }}>
          {[...Array(5)].map((_, i) => (
            <Star key={i} sx={{ fontSize: 14, color: i < 4 ? '#F59E0B' : 'grey.300' }} />
          ))}
          <Typography variant="caption" color="text.secondary">(128)</Typography>
        </Box>

        <Box sx={{ mt: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1 }}>
          <Typography variant="h6" sx={{ fontWeight: 700, color: 'primary.main', fontSize: { xs: '1rem', md: '1.125rem' } }}>
            {formatPrice(product.price)}
          </Typography>
          
          <Button
            variant="contained"
            size="small"
            startIcon={<ShoppingCart sx={{ fontSize: 16 }} />}
            onClick={(e) => handleAddToCart(product, e)}
            disabled={product.stock === 0}
            sx={{ 
              fontSize: '0.75rem',
              px: { xs: 1, md: 2 },
              minWidth: 'auto',
            }}
          >
            {isMobile ? '' : 'Ajouter'}
          </Button>
        </Box>
      </CardContent>
    </Card>
  );

  return (
    <Box sx={{ backgroundColor: 'grey.50', minHeight: '100vh' }}>
      <Container maxWidth="xl" sx={{ py: { xs: 2, md: 4 } }}>
        {/* Breadcrumbs */}
        <Breadcrumbs sx={{ mb: 3 }}>
          <Link component={RouterLink} to="/" color="inherit" underline="hover">
            Accueil
          </Link>
          <Typography color="text.primary" fontWeight={500}>Produits</Typography>
        </Breadcrumbs>

        <Grid container spacing={3}>
          {/* Desktop Sidebar */}
          {!isMobile && (
            <Grid item md={3} lg={2.5}>
              <Paper sx={{ position: 'sticky', top: 100, borderRadius: 3 }}>
                <FilterSidebar
                  isMobile={false}
                  searchQuery={searchQuery}
                  setSearchQuery={setSearchQuery}
                  onSearch={handleSearchSubmit}
                  category={category}
                  setCategory={setCategory}
                  priceRange={priceRange}
                  setPriceRange={setPriceRange}
                  sortBy={sortBy}
                  setSortBy={setSortBy}
                />
              </Paper>
            </Grid>
          )}

          {/* Mobile Filter Drawer */}
          <Drawer
            anchor="left"
            open={showFilters}
            onClose={() => setShowFilters(false)}
            PaperProps={{ sx: { width: 300, borderRadius: '0 24px 24px 0' } }}
          >
            <FilterSidebar
              isMobile={true}
              onClose={() => setShowFilters(false)}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              onSearch={handleSearchSubmit}
              category={category}
              setCategory={setCategory}
              priceRange={priceRange}
              setPriceRange={setPriceRange}
              sortBy={sortBy}
              setSortBy={setSortBy}
            />
          </Drawer>

          {/* Products Grid */}
          <Grid item xs={12} md={9} lg={9.5}>
            {/* Header */}
            <Paper sx={{ p: 2, mb: 3, borderRadius: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
                <Box>
                  <Typography variant="h5" sx={{ fontWeight: 700 }}>
                    {searchQuery ? `Résultats pour "${searchQuery}"` : 'Tous les produits'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {filteredProducts.length} produits trouvés
                  </Typography>
                </Box>
                
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  {isMobile && (
                    <Button
                      variant="outlined"
                      startIcon={<FilterList />}
                      onClick={() => setShowFilters(true)}
                      sx={{ borderRadius: 2 }}
                    >
                      Filtres
                    </Button>
                  )}
                  
                  <ToggleButtonGroup
                    value={viewMode}
                    exclusive
                    onChange={(e, newView) => newView && setViewMode(newView)}
                    size="small"
                    sx={{ display: { xs: 'none', sm: 'flex' } }}
                  >
                    <ToggleButton value="grid" sx={{ borderRadius: '8px 0 0 8px' }}>
                      <GridView fontSize="small" />
                    </ToggleButton>
                    <ToggleButton value="list" sx={{ borderRadius: '0 8px 8px 0' }}>
                      <ViewList fontSize="small" />
                    </ToggleButton>
                  </ToggleButtonGroup>
                </Box>
              </Box>
            </Paper>

            {/* Products */}
            {loading ? (
              <Grid container spacing={2}>
                {[...Array(8)].map((_, i) => (
                  <Grid item xs={6} sm={viewMode === 'list' ? 12 : 4} md={viewMode === 'list' ? 12 : 4} lg={viewMode === 'list' ? 12 : 3} key={i}>
                    <Card sx={{ display: 'flex', flexDirection: viewMode === 'list' ? 'row' : 'column' }}>
                      <Skeleton variant="rectangular" sx={{ pt: viewMode === 'list' ? 0 : '100%', width: viewMode === 'list' ? 200 : '100%', height: viewMode === 'list' ? 200 : 'auto' }} />
                      <CardContent sx={{ flex: 1 }}>
                        <Skeleton width="40%" height={16} />
                        <Skeleton width="80%" height={24} sx={{ my: 1 }} />
                        <Skeleton width="30%" height={28} />
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            ) : displayedProducts.length === 0 ? (
              <Paper sx={{ p: 6, textAlign: 'center', borderRadius: 3 }}>
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  Aucun produit trouvé
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Essayez de modifier vos critères de recherche
                </Typography>
              </Paper>
            ) : (
              <>
                <Grid container spacing={2}>
                  {displayedProducts.map((product) => (
                    <Grid
                      item
                      xs={6}
                      sm={viewMode === 'list' ? 12 : 4}
                      md={viewMode === 'list' ? 12 : 4}
                      lg={viewMode === 'list' ? 12 : 3}
                      key={product.id}
                    >
                      <ProductCard product={product} />
                    </Grid>
                  ))}
                </Grid>

                {/* Pagination */}
                {totalPages > 1 && (
                  <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                    <Pagination
                      count={totalPages}
                      page={currentPage}
                      onChange={(e, page) => setCurrentPage(page)}
                      color="primary"
                      size={isMobile ? 'medium' : 'large'}
                      sx={{
                        '& .MuiPaginationItem-root': {
                          borderRadius: 2,
                        },
                      }}
                    />
                  </Box>
                )}
              </>
            )}
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default ProductsPage;