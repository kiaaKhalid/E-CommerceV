import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActionArea,
  TextField,
  InputAdornment,
  ToggleButton,
  ToggleButtonGroup,
  Chip,
  Paper,
  List,
  ListItem,
  ListItemButton,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Divider,
  useTheme,
  alpha,
  Skeleton,
} from '@mui/material';
import {
  Search,
  GridView,
  ViewList,
  Category,
  Inventory,
  ArrowForward,
  Clear,
  LocalOffer,
  Pets,
  DirectionsCar,
  Luggage,
  Spa,
  Checkroom,
  Watch,
  SportsSoccer,
  MenuBook,
  SportsEsports,
  Headphones,
  Laptop,
  PhoneIphone,
  Kitchen,
  Chair,
  Brush,
  Build,
  Home,
} from '@mui/icons-material';
import { useCategories } from '../../hooks';
import Loading from '../../components/ui/Loading';

// Icônes MUI pour les catégories
const getCategoryIcon = (name) => {
  const icons = {
    'Électronique': <Headphones />,
    'Vêtements': <Checkroom />,
    'Maison & Jardin': <Home />,
    'Sports & Loisirs': <SportsSoccer />,
    'Beauté & Santé': <Spa />,
    'Livres': <MenuBook />,
    'Jouets & Jeux': <SportsEsports />,
    'Automobile': <DirectionsCar />,
    'Bijoux & Montres': <Watch />,
    'Bagages': <Luggage />,
    'Informatique': <Laptop />,
    'Téléphonie': <PhoneIphone />,
    'Électroménager': <Kitchen />,
    'Mobilier': <Chair />,
    'Décoration': <Brush />,
    'Bricolage': <Build />,
    'Animalerie': <Pets />,
  };
  return icons[name] || <Category />;
};

// Couleurs de gradient pour les catégories
const categoryGradients = [
  'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
  'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
  'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
  'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
  'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
  'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)',
  'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)',
  'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  'linear-gradient(135deg, #89f7fe 0%, #66a6ff 100%)',
];

const CategoriesPage = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { categories, loading, error } = useCategories();
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState('grid');

  // Filtrer les catégories par recherche
  const filteredCategories = categories.filter(category =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    category.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalProducts = filteredCategories.reduce((acc, cat) => acc + (cat.product_count || 0), 0);

  const handleCategoryClick = (categoryName) => {
    navigate(`/products?category=${encodeURIComponent(categoryName)}`);
  };

  if (loading) {
    return <Loading message="Chargement des catégories..." />;
  }

  if (error) {
    return (
      <Box
        sx={{
          minHeight: '60vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="h1" sx={{ fontSize: '4rem', mb: 2 }}>😕</Typography>
          <Typography variant="h5" fontWeight={700} gutterBottom>
            Erreur de chargement
          </Typography>
          <Typography color="text.secondary">{error}</Typography>
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'grey.50' }}>
      {/* Hero Section */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 50%, #EC4899 100%)',
          py: { xs: 6, md: 8 },
          position: 'relative',
          overflow: 'hidden',
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

        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
          <Box sx={{ textAlign: 'center', color: 'white' }}>
            <Chip
              icon={<Category sx={{ color: 'white !important' }} />}
              label="Explorez nos catégories"
              sx={{
                bgcolor: 'rgba(255,255,255,0.2)',
                color: 'white',
                fontWeight: 600,
                mb: 3,
                backdropFilter: 'blur(10px)',
                '& .MuiChip-icon': { color: 'white' },
              }}
            />
            <Typography
              variant="h2"
              sx={{
                fontWeight: 800,
                mb: 2,
                fontSize: { xs: '2rem', md: '3rem' },
              }}
            >
              Toutes les Catégories
            </Typography>
            <Typography
              variant="h6"
              sx={{
                opacity: 0.9,
                maxWidth: 600,
                mx: 'auto',
                fontWeight: 400,
                lineHeight: 1.6,
              }}
            >
              Explorez notre large sélection de produits organisés par catégories.
              Trouvez exactement ce que vous cherchez !
            </Typography>
          </Box>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ py: 4, mt: -4, position: 'relative', zIndex: 2 }}>
        {/* Search & Controls Card */}
        <Paper
          elevation={0}
          sx={{
            p: 3,
            borderRadius: 4,
            mb: 4,
            boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
          }}
        >
          <Grid container spacing={3} alignItems="center">
            {/* Search Field */}
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                placeholder="Rechercher une catégorie..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search color="action" />
                    </InputAdornment>
                  ),
                  endAdornment: searchTerm && (
                    <InputAdornment position="end">
                      <Clear
                        sx={{ cursor: 'pointer', color: 'action.active' }}
                        onClick={() => setSearchTerm('')}
                      />
                    </InputAdornment>
                  ),
                  sx: {
                    borderRadius: 3,
                    bgcolor: 'grey.50',
                    '& fieldset': { border: 'none' },
                  },
                }}
              />
            </Grid>

            {/* View Toggle & Stats */}
            <Grid item xs={12} md={6}>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: { xs: 'space-between', md: 'flex-end' },
                  gap: 3,
                  flexWrap: 'wrap',
                }}
              >
                {/* Stats */}
                <Box sx={{ display: 'flex', gap: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Avatar sx={{ bgcolor: alpha(theme.palette.primary.main, 0.1), width: 36, height: 36 }}>
                      <Category sx={{ fontSize: 18, color: 'primary.main' }} />
                    </Avatar>
                    <Box>
                      <Typography variant="h6" fontWeight={700} lineHeight={1}>
                        {filteredCategories.length}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Catégories
                      </Typography>
                    </Box>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Avatar sx={{ bgcolor: alpha(theme.palette.success.main, 0.1), width: 36, height: 36 }}>
                      <Inventory sx={{ fontSize: 18, color: 'success.main' }} />
                    </Avatar>
                    <Box>
                      <Typography variant="h6" fontWeight={700} lineHeight={1}>
                        {totalProducts}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Produits
                      </Typography>
                    </Box>
                  </Box>
                </Box>

                {/* View Toggle */}
                <ToggleButtonGroup
                  value={viewMode}
                  exclusive
                  onChange={(e, newMode) => newMode && setViewMode(newMode)}
                  size="small"
                  sx={{
                    '& .MuiToggleButton-root': {
                      border: 'none',
                      borderRadius: '12px !important',
                      px: 2,
                      '&.Mui-selected': {
                        bgcolor: 'primary.main',
                        color: 'white',
                        '&:hover': {
                          bgcolor: 'primary.dark',
                        },
                      },
                    },
                  }}
                >
                  <ToggleButton value="grid">
                    <GridView sx={{ mr: 1 }} /> Grille
                  </ToggleButton>
                  <ToggleButton value="list">
                    <ViewList sx={{ mr: 1 }} /> Liste
                  </ToggleButton>
                </ToggleButtonGroup>
              </Box>
            </Grid>
          </Grid>
        </Paper>

        {/* No Results */}
        {filteredCategories.length === 0 ? (
          <Paper
            sx={{
              py: 8,
              textAlign: 'center',
              borderRadius: 4,
              boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
            }}
          >
            <Search sx={{ fontSize: 64, color: 'grey.300', mb: 2 }} />
            <Typography variant="h5" fontWeight={700} gutterBottom>
              Aucune catégorie trouvée
            </Typography>
            <Typography color="text.secondary" sx={{ mb: 3 }}>
              Essayez avec un autre terme de recherche
            </Typography>
            <Chip
              label="Effacer la recherche"
              onClick={() => setSearchTerm('')}
              color="primary"
              variant="outlined"
              sx={{ cursor: 'pointer' }}
            />
          </Paper>
        ) : viewMode === 'grid' ? (
          /* Grid View */
          <Grid container spacing={3}>
            {filteredCategories.map((category, index) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={category.id || index}>
                <Card
                  sx={{
                    height: '100%',
                    borderRadius: 4,
                    overflow: 'hidden',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-8px)',
                      boxShadow: '0 12px 40px rgba(0,0,0,0.15)',
                      '& .category-icon': {
                        transform: 'scale(1.1) rotate(5deg)',
                      },
                      '& .arrow-icon': {
                        transform: 'translateX(4px)',
                      },
                    },
                  }}
                >
                  <CardActionArea
                    onClick={() => handleCategoryClick(category.name)}
                    sx={{ height: '100%' }}
                  >
                    {/* Gradient Header */}
                    <Box
                      sx={{
                        background: categoryGradients[index % categoryGradients.length],
                        py: 4,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Avatar
                        className="category-icon"
                        sx={{
                          width: 80,
                          height: 80,
                          bgcolor: 'rgba(255,255,255,0.25)',
                          backdropFilter: 'blur(10px)',
                          transition: 'transform 0.3s ease',
                          '& .MuiSvgIcon-root': {
                            fontSize: 40,
                            color: 'white',
                          },
                        }}
                      >
                        {getCategoryIcon(category.name)}
                      </Avatar>
                    </Box>

                    {/* Content */}
                    <CardContent sx={{ p: 3 }}>
                      <Typography
                        variant="h6"
                        fontWeight={700}
                        gutterBottom
                        sx={{
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {category.name}
                      </Typography>

                      {category.description && (
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
                            minHeight: 40,
                          }}
                        >
                          {category.description}
                        </Typography>
                      )}

                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          pt: 2,
                          borderTop: '1px solid',
                          borderColor: 'divider',
                        }}
                      >
                        <Chip
                          icon={<Inventory sx={{ fontSize: 16 }} />}
                          label={`${category.product_count || 0} produits`}
                          size="small"
                          sx={{
                            bgcolor: alpha(theme.palette.primary.main, 0.1),
                            color: 'primary.main',
                            fontWeight: 600,
                          }}
                        />
                        <ArrowForward
                          className="arrow-icon"
                          sx={{
                            color: 'primary.main',
                            transition: 'transform 0.3s ease',
                          }}
                        />
                      </Box>
                    </CardContent>
                  </CardActionArea>
                </Card>
              </Grid>
            ))}
          </Grid>
        ) : (
          /* List View */
          <Paper
            sx={{
              borderRadius: 4,
              overflow: 'hidden',
              boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
            }}
          >
            <List disablePadding>
              {filteredCategories.map((category, index) => (
                <Box key={category.id || index}>
                  <ListItem disablePadding>
                    <ListItemButton
                      onClick={() => handleCategoryClick(category.name)}
                      sx={{
                        py: 2.5,
                        px: 3,
                        '&:hover': {
                          bgcolor: alpha(theme.palette.primary.main, 0.04),
                          '& .arrow-icon': {
                            transform: 'translateX(4px)',
                          },
                        },
                      }}
                    >
                      <ListItemAvatar>
                        <Avatar
                          sx={{
                            width: 56,
                            height: 56,
                            background: categoryGradients[index % categoryGradients.length],
                            '& .MuiSvgIcon-root': {
                              fontSize: 28,
                              color: 'white',
                            },
                          }}
                        >
                          {getCategoryIcon(category.name)}
                        </Avatar>
                      </ListItemAvatar>

                      <ListItemText
                        sx={{ ml: 2 }}
                        primary={
                          <Typography variant="h6" fontWeight={600}>
                            {category.name}
                          </Typography>
                        }
                        secondary={
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            {category.description || 'Découvrez nos produits'}
                          </Typography>
                        }
                      />

                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Chip
                          label={`${category.product_count || 0} produits`}
                          sx={{
                            bgcolor: 'grey.100',
                            fontWeight: 600,
                          }}
                        />
                        <ArrowForward
                          className="arrow-icon"
                          sx={{
                            color: 'grey.400',
                            transition: 'transform 0.3s ease',
                          }}
                        />
                      </Box>
                    </ListItemButton>
                  </ListItem>
                  {index < filteredCategories.length - 1 && <Divider />}
                </Box>
              ))}
            </List>
          </Paper>
        )}

        {/* Popular Categories Section */}
        <Box sx={{ mt: 8, textAlign: 'center' }}>
          <Typography variant="h4" fontWeight={800} gutterBottom>
            🔥 Catégories Populaires
          </Typography>
          <Typography color="text.secondary" sx={{ mb: 4 }}>
            Découvrez les catégories les plus recherchées
          </Typography>

          <Box
            sx={{
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'center',
              gap: 1.5,
            }}
          >
            {categories.slice(0, 8).map((category, index) => (
              <Chip
                key={category.id || index}
                icon={getCategoryIcon(category.name)}
                label={category.name}
                onClick={() => handleCategoryClick(category.name)}
                sx={{
                  py: 2.5,
                  px: 1,
                  fontSize: '0.9rem',
                  fontWeight: 600,
                  borderRadius: 3,
                  bgcolor: 'white',
                  border: '2px solid',
                  borderColor: 'grey.200',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    borderColor: 'primary.main',
                    bgcolor: alpha(theme.palette.primary.main, 0.04),
                    transform: 'translateY(-2px)',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                  },
                  '& .MuiChip-icon': {
                    color: 'primary.main',
                  },
                }}
              />
            ))}
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default CategoriesPage;
