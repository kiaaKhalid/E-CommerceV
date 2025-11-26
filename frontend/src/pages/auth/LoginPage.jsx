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
  Warning,
} from '@mui/icons-material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

// 🎓 VERSION ÉDUCATIVE - VULNÉRABLE AUX INJECTIONS SQL
// ⚠️ NE JAMAIS UTILISER EN PRODUCTION ⚠️

const LoginPage = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { login, isLoading, error } = useAuth();

  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [educationalInfo, setEducationalInfo] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  // 🎓 VALIDATION DÉSACTIVÉE POUR DÉMONSTRATION PÉDAGOGIQUE
  const validateForm = () => {
    const errors = {};
    // ⚠️ Validation minimale - permet les injections SQL pour l'enseignement
    if (!formData.email) errors.email = 'L\'email est requis';
    if (!formData.password) errors.password = 'Le mot de passe est requis';
    // ❌ SUPPRIMÉ: validation du format email pour permettre les injections
    // else if (!/\S+@\S+\.\S+/.test(formData.email)) errors.email = 'Email invalide';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const result = await login(formData);
    
    // 🎓 Afficher les informations éducatives si présentes
    if (result.educational_analysis) {
      setEducationalInfo(result.educational_analysis);
    }
    
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
      {/* 🎓 BANNIÈRE ÉDUCATIVE */}
      <Box
        sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 9999,
          background: 'linear-gradient(90deg, #f44336 0%, #ff9800 100%)',
          color: 'white',
          py: 1,
          px: 2,
          textAlign: 'center',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 1,
        }}
      >
        <Warning />
        <Typography variant="body2" sx={{ fontWeight: 600 }}>
          🎓 VERSION ÉDUCATIVE - VULNÉRABLE AUX INJECTIONS SQL - COURS DE CYBERSÉCURITÉ
        </Typography>
        <Warning />
      </Box>

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
            pt: 10,
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
              🎓 Cours SQL
              <br />Injection
            </Typography>
            <Typography variant="h6" sx={{ opacity: 0.9, fontWeight: 400, mb: 4 }}>
              Démonstration pédagogique des vulnérabilités d'injection SQL
            </Typography>

            {/* Exemples d'injection */}
            <Box sx={{ 
              display: 'flex', 
              flexDirection: 'column', 
              gap: 1.5, 
              textAlign: 'left',
              backgroundColor: 'rgba(0,0,0,0.2)',
              borderRadius: 2,
              p: 2,
            }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
                💉 Exemples d'injections à tester :
              </Typography>
              {[
                "' OR '1'='1' --",
                "admin@test.com' OR '1'='1' --",
                "' OR 1=1 --",
                "admin'--",
              ].map((example, index) => (
                <Box key={index} sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 1,
                  backgroundColor: 'rgba(255,255,255,0.1)',
                  borderRadius: 1,
                  px: 1.5,
                  py: 0.5,
                }}>
                  <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>
                    {example}
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
          pt: { xs: 8, md: 10 },
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
                🎓 Cours SQL Injection
              </Typography>
            </Box>
          )}

          <Typography variant="h4" sx={{ fontWeight: 800, mb: 1 }}>
            Connexion
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
            🎓 Testez les injections SQL dans le champ email
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
              {error}
            </Alert>
          )}

          {/* 🎓 Affichage des informations éducatives */}
          {educationalInfo && (
            <Alert 
              severity={educationalInfo.injection_detected ? "warning" : "info"} 
              sx={{ mb: 3, borderRadius: 2 }}
            >
              <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
                🎓 Analyse Éducative:
              </Typography>
              <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: '0.75rem' }}>
                Injection détectée: {educationalInfo.injection_detected ? '✅ OUI' : '❌ NON'}
              </Typography>
              {educationalInfo.vulnerable_query && (
                <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: '0.75rem', mt: 1 }}>
                  Requête: {educationalInfo.vulnerable_query}
                </Typography>
              )}
            </Alert>
          )}

          {/* Social Login - Désactivé pour la démo */}
          <Box sx={{ display: 'flex', gap: 1.5, mb: 3, opacity: 0.5 }}>
            {[
              { icon: <Google />, label: 'Google', color: '#DB4437' },
              { icon: <Facebook />, label: 'Facebook', color: '#4267B2' },
              { icon: <Apple />, label: 'Apple', color: '#000000' },
            ].map((social) => (
              <Button
                key={social.label}
                variant="outlined"
                fullWidth
                disabled
                sx={{
                  py: 1.5,
                  borderColor: 'divider',
                  color: 'text.primary',
                }}
              >
                {social.icon}
              </Button>
            ))}
          </Box>

          <Divider sx={{ mb: 3 }}>
            <Typography variant="caption" color="text.secondary">
              💉 Testez les injections ci-dessous
            </Typography>
          </Divider>

          {/* Login Form */}
          <Box component="form" onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="Email (💉 Injection ici)"
              name="email"
              type="text"
              value={formData.email}
              onChange={handleChange}
              error={!!formErrors.email}
              helperText={formErrors.email || "Ex: admin@test.com' OR '1'='1' --"}
              placeholder="' OR '1'='1' --"
              sx={{ 
                mb: 2.5,
                '& .MuiOutlinedInput-root': {
                  backgroundColor: 'rgba(255, 152, 0, 0.05)',
                  '& fieldset': {
                    borderColor: 'warning.main',
                    borderWidth: 2,
                  },
                  '&:hover fieldset': {
                    borderColor: 'warning.dark',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: 'warning.main',
                  },
                },
                '& .MuiInputBase-input': {
                  fontFamily: 'monospace',
                  backgroundColor: 'transparent',
                  '&:-webkit-autofill': {
                    WebkitBoxShadow: '0 0 0 100px white inset',
                    WebkitTextFillColor: 'inherit',
                  },
                },
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Email sx={{ color: 'warning.main', fontSize: 20 }} />
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
              helperText={formErrors.password || "Entrez n'importe quoi"}
              sx={{ 
                mb: 1.5,
                '& .MuiOutlinedInput-root': {
                  backgroundColor: 'transparent',
                  '& fieldset': {
                    borderColor: 'divider',
                  },
                  '&:hover fieldset': {
                    borderColor: 'primary.main',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: 'primary.main',
                  },
                  '&.Mui-focused': {
                    backgroundColor: 'transparent',
                  },
                },
                '& .MuiInputBase-input': {
                  backgroundColor: 'transparent',
                  '&:-webkit-autofill': {
                    WebkitBoxShadow: '0 0 0 100px white inset',
                    WebkitTextFillColor: 'inherit',
                  },
                },
              }}
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
                underline="hover"
                sx={{ fontSize: '0.875rem', fontWeight: 500 }}
              >
                Mot de passe oublié ?
              </Link>
            </Box>

            <Button
              type="submit"
              variant="contained"
              fullWidth
              size="large"
              disabled={isLoading}
              endIcon={<ArrowForward />}
              sx={{
                py: 1.5,
                mb: 3,
                fontSize: '1rem',
                background: 'linear-gradient(90deg, #f44336 0%, #ff9800 100%)',
              }}
            >
              {isLoading ? 'Test en cours...' : '💉 Tester l\'injection'}
            </Button>
          </Box>

          {/* Exemples rapides pour mobile */}
          {isMobile && (
            <Box sx={{ 
              mt: 3, 
              p: 2, 
              backgroundColor: 'rgba(255, 152, 0, 0.1)', 
              borderRadius: 2,
              border: '1px solid',
              borderColor: 'warning.main',
            }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
                💉 Injections à tester :
              </Typography>
              {[
                "' OR '1'='1' --",
                "admin@test.com' OR '1'='1' --",
              ].map((example, index) => (
                <Typography 
                  key={index} 
                  variant="body2" 
                  sx={{ 
                    fontFamily: 'monospace', 
                    fontSize: '0.75rem',
                    backgroundColor: 'white',
                    p: 0.5,
                    borderRadius: 0.5,
                    mb: 0.5,
                  }}
                >
                  {example}
                </Typography>
              ))}
            </Box>
          )}

          <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center' }}>
            Pas encore de compte ?{' '}
            <Link
              component={RouterLink}
              to="/register"
              underline="hover"
              sx={{ fontWeight: 600 }}
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