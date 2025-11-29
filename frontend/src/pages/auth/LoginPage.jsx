import { useState } from 'react';
import {
  Box,
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Link,
  Divider,
  InputAdornment,
  IconButton,
  Alert,
  useTheme,
  useMediaQuery,
  alpha,
} from '@mui/material';
import {
  Email,
  Lock,
  Visibility,
  VisibilityOff,
  Google,
  Facebook,
  Apple,
  Store,
  ArrowForward,
} from '@mui/icons-material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const LoginPage = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { login, isLoading, error } = useAuth();

  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [formErrors, setFormErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.email) errors.email = 'L\'email est requis';
    if (!formData.password) errors.password = 'Le mot de passe est requis';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const result = await login(formData);
    
    if (result.success) {
      navigate('/');
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        backgroundColor: 'grey.50',
      }}
    >
      {/* Left Side - Branding (Desktop Only) */}
      {!isMobile && (
        <Box
          sx={{
            flex: 1,
            background: 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 50%, #EC4899 100%)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            p: 6,
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

          <Box sx={{ position: 'relative', zIndex: 1, textAlign: 'center', color: 'white', maxWidth: 480 }}>
            {/* Logo */}
            <Box
              sx={{
                width: 80,
                height: 80,
                borderRadius: '20px',
                background: 'rgba(255,255,255,0.2)',
                backdropFilter: 'blur(10px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mx: 'auto',
                mb: 4,
              }}
            >
              <Store sx={{ fontSize: 44 }} />
            </Box>

            <Typography variant="h2" sx={{ fontWeight: 800, mb: 2 }}>
              ShopHub
            </Typography>
            <Typography variant="h6" sx={{ opacity: 0.9, fontWeight: 400, mb: 4 }}>
              Découvrez des milliers de produits de qualité à prix imbattables
            </Typography>

            {/* Features */}
            <Box sx={{ 
              display: 'flex', 
              flexDirection: 'column', 
              gap: 1.5, 
              textAlign: 'left',
              backgroundColor: 'rgba(255,255,255,0.1)',
              borderRadius: 2,
              p: 3,
            }}>
              {[
                "✓ Livraison gratuite dès 50€ d'achat",
                "✓ Retours gratuits sous 30 jours",
                "✓ Paiement 100% sécurisé",
                "✓ Service client 7j/7",
              ].map((feature, index) => (
                <Box key={index} sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 1,
                }}>
                  <Typography variant="body1" sx={{ fontSize: '1rem' }}>
                    {feature}
                  </Typography>
                </Box>
              ))}
            </Box>
          </Box>
        </Box>
      )}

      {/* Right Side - Login Form */}
      <Box
        sx={{
          flex: isMobile ? 1 : '0 0 520px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          p: { xs: 3, md: 6 },
        }}
      >
        <Box sx={{ maxWidth: 400, mx: 'auto', width: '100%' }}>
          {/* Mobile Logo */}
          {isMobile && (
            <Box sx={{ textAlign: 'center', mb: 4 }}>
              <Box
                sx={{
                  width: 60,
                  height: 60,
                  borderRadius: '16px',
                  background: 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mx: 'auto',
                  mb: 2,
                }}
              >
                <Store sx={{ color: 'white', fontSize: 32 }} />
              </Box>
              <Typography variant="h5" sx={{ fontWeight: 700 }}>
                ShopHub
              </Typography>
            </Box>
          )}

          <Typography variant="h4" sx={{ fontWeight: 800, mb: 1 }}>
            Connexion
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
            Connectez-vous pour accéder à votre compte
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
              {error}
            </Alert>
          )}

          {/* Social Login */}
          <Box sx={{ display: 'flex', gap: 1.5, mb: 3 }}>
            {[
              { icon: <Google />, label: 'Google', color: '#DB4437' },
              { icon: <Facebook />, label: 'Facebook', color: '#4267B2' },
              { icon: <Apple />, label: 'Apple', color: '#000000' },
            ].map((social) => (
              <Button
                key={social.label}
                variant="outlined"
                fullWidth
                sx={{
                  py: 1.5,
                  borderColor: 'divider',
                  color: 'text.primary',
                  '&:hover': {
                    borderColor: social.color,
                    backgroundColor: alpha(social.color, 0.04),
                  },
                }}
              >
                {social.icon}
              </Button>
            ))}
          </Box>

          <Divider sx={{ mb: 3 }}>
            <Typography variant="caption" color="text.secondary">
              ou connectez-vous avec votre email
            </Typography>
          </Divider>

          {/* Login Form */}
          <Box component="form" onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="Email"
              name="email"
              type="text"
              value={formData.email}
              onChange={handleChange}
              error={!!formErrors.email}
              helperText={formErrors.email}
              placeholder="votre@email.com"
              sx={{ mb: 2.5 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Email sx={{ color: 'text.secondary', fontSize: 20 }} />
                  </InputAdornment>
                ),
              }}
            />

            <TextField
              fullWidth
              label="Mot de passe"
              name="password"
              type={showPassword ? 'text' : 'password'}
              value={formData.password}
              onChange={handleChange}
              error={!!formErrors.password}
              helperText={formErrors.password}
              sx={{ mb: 1.5 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Lock sx={{ color: 'text.secondary', fontSize: 20 }} />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                      size="small"
                    >
                      {showPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 3 }}>
              <Link
                component={RouterLink}
                to="/forgot-password"
                variant="body2"
                sx={{
                  color: 'primary.main',
                  textDecoration: 'none',
                  '&:hover': { textDecoration: 'underline' },
                }}
              >
                Mot de passe oublié ?
              </Link>
            </Box>

            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              disabled={isLoading}
              endIcon={<ArrowForward />}
              sx={{
                py: 1.5,
                borderRadius: 2,
                textTransform: 'none',
                fontSize: '1rem',
                fontWeight: 600,
                background: 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)',
                boxShadow: '0 4px 14px 0 rgba(99, 102, 241, 0.39)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #5558E3 0%, #7C4FE0 100%)',
                  boxShadow: '0 6px 20px 0 rgba(99, 102, 241, 0.5)',
                },
              }}
            >
              {isLoading ? 'Connexion...' : 'Se connecter'}
            </Button>
          </Box>

          <Typography variant="body2" color="text.secondary" sx={{ mt: 4, textAlign: 'center' }}>
            Pas encore de compte ?{' '}
            <Link
              component={RouterLink}
              to="/register"
              sx={{
                color: 'primary.main',
                fontWeight: 600,
                textDecoration: 'none',
                '&:hover': { textDecoration: 'underline' },
              }}
            >
              Créer un compte
            </Link>
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};

export default LoginPage;