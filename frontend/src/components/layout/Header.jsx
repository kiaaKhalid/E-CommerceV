import { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Badge,
  Menu,
  MenuItem,
  Box,
  TextField,
  InputAdornment,
  Avatar,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemButton,
  Divider,
  useTheme,
  useMediaQuery,
  Container,
  alpha,
} from '@mui/material';
import {
  ShoppingCart,
  Search,
  Person,
  Menu as MenuIcon,
  Favorite,
  Dashboard,
  Logout,
  Home,
  Category,
  Store,
  Close,
  KeyboardArrowDown,
  LocalShipping,
  Headphones,
  Receipt,
} from '@mui/icons-material';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useCart } from '../../contexts/CartContext';
import { getInitials, getAvatarColor } from '../../utils/helpers';

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isTablet = useMediaQuery(theme.breakpoints.down('lg'));
  const { user, isAuthenticated, logout } = useAuth();
  const { totalItems } = useCart();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [userMenuAnchor, setUserMenuAnchor] = useState(null);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [showMobileSearch, setShowMobileSearch] = useState(false);

  const navLinks = [
    { label: 'Accueil', path: '/', icon: <Home /> },
    { label: 'Boutique', path: '/products', icon: <Store /> },
    { label: 'Catégories', path: '/categories', icon: <Category /> },
  ];

  const isActivePath = (path) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
      setShowMobileSearch(false);
      setMobileDrawerOpen(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    setUserMenuAnchor(null);
    setMobileDrawerOpen(false);
    navigate('/');
  };

  // Drawer Mobile Content
  const mobileDrawerContent = (
    <Box sx={{ width: 300, height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Header du Drawer */}
      <Box
        sx={{
          p: 3,
          background: 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)',
          color: 'white',
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>
            ShopHub
          </Typography>
          <IconButton color="inherit" onClick={() => setMobileDrawerOpen(false)}>
            <Close />
          </IconButton>
        </Box>
        
        {isAuthenticated && user && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar
              sx={{
                bgcolor: 'rgba(255,255,255,0.2)',
                width: 48,
                height: 48,
                fontWeight: 600,
              }}
            >
              {getInitials(user?.name || 'U')}
            </Avatar>
            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                {user?.name}
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.8 }}>
                {user?.email}
              </Typography>
            </Box>
          </Box>
        )}
      </Box>

      {/* Search Bar Mobile */}
      <Box sx={{ p: 2 }}>
        <Box component="form" onSubmit={handleSearch}>
          <TextField
            fullWidth
            size="small"
            placeholder="Rechercher un produit..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search sx={{ color: 'text.secondary' }} />
                </InputAdornment>
              ),
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                backgroundColor: '#F1F5F9',
                '&:hover': { backgroundColor: '#E2E8F0' },
              },
            }}
          />
        </Box>
      </Box>

      <Divider />

      {/* Navigation Links */}
      <List sx={{ flex: 1, py: 1 }}>
        {navLinks.map((link) => (
          <ListItem key={link.path} disablePadding>
            <ListItemButton
              onClick={() => {
                navigate(link.path);
                setMobileDrawerOpen(false);
              }}
              selected={isActivePath(link.path)}
              sx={{
                mx: 1,
                borderRadius: 2,
                '&.Mui-selected': {
                  backgroundColor: alpha(theme.palette.primary.main, 0.1),
                  '&:hover': {
                    backgroundColor: alpha(theme.palette.primary.main, 0.15),
                  },
                },
              }}
            >
              <ListItemIcon sx={{ color: isActivePath(link.path) ? 'primary.main' : 'text.secondary' }}>
                {link.icon}
              </ListItemIcon>
              <ListItemText 
                primary={link.label}
                primaryTypographyProps={{
                  fontWeight: isActivePath(link.path) ? 600 : 400,
                  color: isActivePath(link.path) ? 'primary.main' : 'text.primary',
                }}
              />
            </ListItemButton>
          </ListItem>
        ))}

        <Divider sx={{ my: 2 }} />

        {isAuthenticated ? (
          <>
            <ListItem disablePadding>
              <ListItemButton
                onClick={() => { navigate('/cart'); setMobileDrawerOpen(false); }}
                sx={{ mx: 1, borderRadius: 2 }}
              >
                <ListItemIcon>
                  <Badge badgeContent={totalItems} color="error">
                    <ShoppingCart />
                  </Badge>
                </ListItemIcon>
                <ListItemText primary="Mon Panier" />
              </ListItemButton>
            </ListItem>
            <ListItem disablePadding>
              <ListItemButton
                onClick={() => { navigate('/wishlist'); setMobileDrawerOpen(false); }}
                sx={{ mx: 1, borderRadius: 2 }}
              >
                <ListItemIcon><Favorite /></ListItemIcon>
                <ListItemText primary="Mes Favoris" />
              </ListItemButton>
            </ListItem>
            <ListItem disablePadding>
              <ListItemButton
                onClick={() => { navigate('/orders'); setMobileDrawerOpen(false); }}
                sx={{ mx: 1, borderRadius: 2 }}
              >
                <ListItemIcon><Receipt /></ListItemIcon>
                <ListItemText primary="Mes Commandes" />
              </ListItemButton>
            </ListItem>
            <ListItem disablePadding>
              <ListItemButton
                onClick={() => { navigate('/profile'); setMobileDrawerOpen(false); }}
                sx={{ mx: 1, borderRadius: 2 }}
              >
                <ListItemIcon><Person /></ListItemIcon>
                <ListItemText primary="Mon Profil" />
              </ListItemButton>
            </ListItem>
            {user?.role === 'admin' && (
              <ListItem disablePadding>
                <ListItemButton
                  onClick={() => { navigate('/admin'); setMobileDrawerOpen(false); }}
                  sx={{ mx: 1, borderRadius: 2 }}
                >
                  <ListItemIcon><Dashboard /></ListItemIcon>
                  <ListItemText primary="Administration" />
                </ListItemButton>
              </ListItem>
            )}
          </>
        ) : (
          <>
            <ListItem disablePadding>
              <ListItemButton
                onClick={() => { navigate('/login'); setMobileDrawerOpen(false); }}
                sx={{ mx: 1, borderRadius: 2 }}
              >
                <ListItemIcon><Person /></ListItemIcon>
                <ListItemText primary="Connexion" />
              </ListItemButton>
            </ListItem>
            <ListItem disablePadding>
              <ListItemButton
                onClick={() => { navigate('/register'); setMobileDrawerOpen(false); }}
                sx={{ mx: 1, borderRadius: 2 }}
              >
                <ListItemIcon><Person /></ListItemIcon>
                <ListItemText primary="Inscription" />
              </ListItemButton>
            </ListItem>
          </>
        )}
      </List>

      {/* Footer du Drawer */}
      {isAuthenticated && (
        <Box sx={{ p: 2, borderTop: '1px solid', borderColor: 'divider' }}>
          <Button
            fullWidth
            variant="outlined"
            color="error"
            startIcon={<Logout />}
            onClick={handleLogout}
            sx={{ borderRadius: 2 }}
          >
            Déconnexion
          </Button>
        </Box>
      )}
    </Box>
  );

  return (
    <>
      {/* Top Bar - Promotions */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)',
          color: 'white',
          py: 0.75,
          textAlign: 'center',
          display: { xs: 'none', sm: 'block' },
        }}
      >
        <Container maxWidth="xl">
          <Typography variant="body2" sx={{ fontWeight: 500, fontSize: '0.8125rem' }}>
            🎉 Livraison GRATUITE pour toute commande supérieure à 50€ | Code: BIENVENUE10
          </Typography>
        </Container>
      </Box>

      {/* Main Header */}
      <AppBar 
        position="sticky" 
        elevation={0}
        sx={{
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Container maxWidth="xl">
          <Toolbar sx={{ minHeight: { xs: 64, md: 72 }, px: { xs: 0 } }}>
            {/* Menu burger mobile */}
            {isMobile && (
              <IconButton
                edge="start"
                onClick={() => setMobileDrawerOpen(true)}
                sx={{ 
                  mr: 1,
                  color: 'text.primary',
                }}
              >
                <MenuIcon />
              </IconButton>
            )}

            {/* Logo */}
            <Box
              component={Link}
              to="/"
              sx={{
                display: 'flex',
                alignItems: 'center',
                textDecoration: 'none',
                mr: { xs: 'auto', md: 4 },
              }}
            >
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mr: 1.5,
                }}
              >
                <Store sx={{ color: 'white', fontSize: 24 }} />
              </Box>
              <Typography
                variant="h5"
                sx={{
                  fontWeight: 800,
                  background: 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  display: { xs: 'none', sm: 'block' },
                }}
              >
                ShopHub
              </Typography>
            </Box>

            {/* Navigation Desktop */}
            {!isMobile && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                {navLinks.map((link) => (
                  <Button
                    key={link.path}
                    component={Link}
                    to={link.path}
                    sx={{
                      color: isActivePath(link.path) ? 'primary.main' : 'text.primary',
                      fontWeight: isActivePath(link.path) ? 600 : 500,
                      px: 2,
                      py: 1,
                      borderRadius: 2,
                      position: 'relative',
                      '&::after': isActivePath(link.path) ? {
                        content: '""',
                        position: 'absolute',
                        bottom: 4,
                        left: '50%',
                        transform: 'translateX(-50%)',
                        width: 20,
                        height: 3,
                        borderRadius: 2,
                        background: 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)',
                      } : {},
                      '&:hover': {
                        backgroundColor: alpha(theme.palette.primary.main, 0.08),
                      },
                    }}
                  >
                    {link.label}
                  </Button>
                ))}
              </Box>
            )}

            {/* Search Bar Desktop */}
            {!isTablet && (
              <Box
                component="form"
                onSubmit={handleSearch}
                sx={{
                  flex: 1,
                  maxWidth: 480,
                  mx: 4,
                }}
              >
                <TextField
                  fullWidth
                  size="small"
                  placeholder="Rechercher des produits..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Search sx={{ color: 'text.secondary' }} />
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      backgroundColor: '#F1F5F9',
                      borderRadius: '12px',
                      '& fieldset': { border: 'none' },
                      '&:hover': { backgroundColor: '#E2E8F0' },
                      '&.Mui-focused': {
                        backgroundColor: '#FFFFFF',
                        boxShadow: '0 0 0 2px rgba(99, 102, 241, 0.2)',
                      },
                    },
                  }}
                />
              </Box>
            )}

            {/* Actions */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 0.5, md: 1 }, ml: 'auto' }}>
              {/* Search Icon Mobile/Tablet */}
              {isTablet && (
                <IconButton
                  onClick={() => setShowMobileSearch(!showMobileSearch)}
                  sx={{ color: 'text.primary' }}
                >
                  <Search />
                </IconButton>
              )}

              {/* Wishlist */}
              {!isMobile && isAuthenticated && (
                <IconButton
                  onClick={() => navigate('/wishlist')}
                  sx={{ color: 'text.primary' }}
                >
                  <Favorite />
                </IconButton>
              )}

              {/* Cart */}
              <IconButton
                onClick={() => navigate('/cart')}
                sx={{ color: 'text.primary' }}
              >
                <Badge 
                  badgeContent={totalItems} 
                  color="error"
                  sx={{
                    '& .MuiBadge-badge': {
                      background: 'linear-gradient(135deg, #EC4899 0%, #F43F5E 100%)',
                    },
                  }}
                >
                  <ShoppingCart />
                </Badge>
              </IconButton>

              {/* User Menu Desktop */}
              {!isMobile && (
                isAuthenticated ? (
                  <>
                    <Button
                      onClick={(e) => setUserMenuAnchor(e.currentTarget)}
                      sx={{
                        ml: 1,
                        color: 'text.primary',
                        textTransform: 'none',
                        borderRadius: 2,
                        px: 1.5,
                        '&:hover': {
                          backgroundColor: alpha(theme.palette.primary.main, 0.08),
                        },
                      }}
                      endIcon={<KeyboardArrowDown />}
                    >
                      <Avatar
                        sx={{
                          width: 32,
                          height: 32,
                          mr: 1,
                          fontSize: '0.875rem',
                          fontWeight: 600,
                          background: 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)',
                        }}
                      >
                        {getInitials(user?.name || 'U')}
                      </Avatar>
                      <Typography variant="body2" sx={{ fontWeight: 500, display: { xs: 'none', lg: 'block' } }}>
                        {user?.name?.split(' ')[0]}
                      </Typography>
                    </Button>
                    <Menu
                      anchorEl={userMenuAnchor}
                      open={Boolean(userMenuAnchor)}
                      onClose={() => setUserMenuAnchor(null)}
                      transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                      anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                      PaperProps={{
                        sx: { width: 220, mt: 1 },
                      }}
                    >
                      <Box sx={{ px: 2, py: 1.5, borderBottom: '1px solid', borderColor: 'divider' }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                          {user?.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {user?.email}
                        </Typography>
                      </Box>
                      <MenuItem onClick={() => { navigate('/profile'); setUserMenuAnchor(null); }}>
                        <ListItemIcon><Person fontSize="small" /></ListItemIcon>
                        Mon Profil
                      </MenuItem>
                      <MenuItem onClick={() => { navigate('/orders'); setUserMenuAnchor(null); }}>
                        <ListItemIcon><Receipt fontSize="small" /></ListItemIcon>
                        Mes Commandes
                      </MenuItem>
                      {user?.role === 'admin' && (
                        <MenuItem onClick={() => { navigate('/admin'); setUserMenuAnchor(null); }}>
                          <ListItemIcon><Dashboard fontSize="small" /></ListItemIcon>
                          Administration
                        </MenuItem>
                      )}
                      <Divider />
                      <MenuItem onClick={handleLogout} sx={{ color: 'error.main' }}>
                        <ListItemIcon><Logout fontSize="small" sx={{ color: 'error.main' }} /></ListItemIcon>
                        Déconnexion
                      </MenuItem>
                    </Menu>
                  </>
                ) : (
                  <Box sx={{ display: 'flex', gap: 1, ml: 1 }}>
                    <Button
                      variant="outlined"
                      onClick={() => navigate('/login')}
                      sx={{
                        borderColor: 'divider',
                        color: 'text.primary',
                        '&:hover': {
                          borderColor: 'primary.main',
                          backgroundColor: alpha(theme.palette.primary.main, 0.04),
                        },
                      }}
                    >
                      Connexion
                    </Button>
                    <Button
                      variant="contained"
                      onClick={() => navigate('/register')}
                    >
                      S'inscrire
                    </Button>
                  </Box>
                )
              )}
            </Box>
          </Toolbar>
        </Container>

        {/* Mobile Search Bar */}
        {isTablet && showMobileSearch && (
          <Box sx={{ px: 2, pb: 2, backgroundColor: 'background.paper' }}>
            <Box component="form" onSubmit={handleSearch}>
              <TextField
                fullWidth
                size="small"
                placeholder="Rechercher des produits..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoFocus
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search sx={{ color: 'text.secondary' }} />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: '#F1F5F9',
                    '& fieldset': { border: 'none' },
                  },
                }}
              />
            </Box>
          </Box>
        )}
      </AppBar>

      {/* Mobile Drawer */}
      <Drawer
        anchor="left"
        open={mobileDrawerOpen}
        onClose={() => setMobileDrawerOpen(false)}
        PaperProps={{
          sx: { borderRadius: '0 24px 24px 0' },
        }}
      >
        {mobileDrawerContent}
      </Drawer>
    </>
  );
};

export default Header;