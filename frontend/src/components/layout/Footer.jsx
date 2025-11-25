import {
  Box,
  Container,
  Grid,
  Typography,
  Link,
  IconButton,
  TextField,
  Button,
  Divider,
  Stack,
  useTheme,
  useMediaQuery,
  alpha,
} from '@mui/material';
import {
  Facebook,
  Twitter,
  Instagram,
  LinkedIn,
  YouTube,
  Email,
  Phone,
  LocationOn,
  Send,
  Store,
  CreditCard,
  LocalShipping,
  Security,
  Headphones,
} from '@mui/icons-material';
import { Link as RouterLink } from 'react-router-dom';

const Footer = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const footerLinks = {
    shop: [
      { label: 'Nouveautés', path: '/products?sort=newest' },
      { label: 'Meilleures ventes', path: '/products?sort=bestseller' },
      { label: 'Promotions', path: '/products?sale=true' },
      { label: 'Toutes les catégories', path: '/categories' },
    ],
    account: [
      { label: 'Mon compte', path: '/profile' },
      { label: 'Mes commandes', path: '/orders' },
      { label: 'Ma liste de souhaits', path: '/wishlist' },
      { label: 'Mon panier', path: '/cart' },
    ],
    help: [
      { label: 'Centre d\'aide', path: '/help' },
      { label: 'Livraison', path: '/shipping' },
      { label: 'Retours & Remboursements', path: '/returns' },
      { label: 'FAQ', path: '/faq' },
    ],
    legal: [
      { label: 'Conditions générales', path: '/terms' },
      { label: 'Politique de confidentialité', path: '/privacy' },
      { label: 'Mentions légales', path: '/legal' },
      { label: 'Cookies', path: '/cookies' },
    ],
  };

  const socialLinks = [
    { icon: <Facebook />, url: '#', label: 'Facebook' },
    { icon: <Twitter />, url: '#', label: 'Twitter' },
    { icon: <Instagram />, url: '#', label: 'Instagram' },
    { icon: <LinkedIn />, url: '#', label: 'LinkedIn' },
    { icon: <YouTube />, url: '#', label: 'YouTube' },
  ];

  const features = [
    { icon: <LocalShipping />, title: 'Livraison Gratuite', desc: 'Dès 50€ d\'achat' },
    { icon: <Security />, title: 'Paiement Sécurisé', desc: '100% sécurisé' },
    { icon: <Headphones />, title: 'Support 24/7', desc: 'À votre écoute' },
    { icon: <CreditCard />, title: 'Satisfait ou Remboursé', desc: '30 jours' },
  ];

  return (
    <Box component="footer">
      {/* Features Bar */}
      <Box
        sx={{
          backgroundColor: 'white',
          borderTop: '1px solid',
          borderColor: 'divider',
          py: { xs: 3, md: 4 },
        }}
      >
        <Container maxWidth="xl">
          <Box
            sx={{
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'center',
              gap: { xs: 3, md: 6 },
            }}
          >
            {features.map((feature, index) => (
              <Box
                key={index}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 2,
                }}
              >
                <Box
                  sx={{
                    width: { xs: 40, md: 48 },
                    height: { xs: 40, md: 48 },
                    borderRadius: '12px',
                    background: alpha(theme.palette.primary.main, 0.1),
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'primary.main',
                  }}
                >
                  {feature.icon}
                </Box>
                <Box>
                  <Typography
                    variant="subtitle2"
                    sx={{ fontWeight: 600, fontSize: { xs: '0.8rem', md: '0.9rem' } }}
                  >
                    {feature.title}
                  </Typography>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ fontSize: { xs: '0.7rem', md: '0.75rem' } }}
                  >
                    {feature.desc}
                  </Typography>
                </Box>
              </Box>
            ))}
          </Box>
        </Container>
      </Box>

      {/* Main Footer */}
      <Box
        sx={{
          background: 'linear-gradient(180deg, #0F172A 0%, #1E293B 100%)',
          color: 'white',
          pt: { xs: 5, md: 8 },
          pb: { xs: 3, md: 4 },
        }}
      >
        <Container maxWidth="xl">
          <Grid container spacing={{ xs: 4, md: 6 }}>
            {/* Brand Section */}
            <Grid item xs={12} md={4}>
              <Box sx={{ mb: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Box
                    sx={{
                      width: 44,
                      height: 44,
                      borderRadius: '12px',
                      background: 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mr: 1.5,
                    }}
                  >
                    <Store sx={{ color: 'white', fontSize: 26 }} />
                  </Box>
                  <Typography variant="h5" sx={{ fontWeight: 800 }}>
                    ShopHub
                  </Typography>
                </Box>
                <Typography
                  variant="body2"
                  sx={{ color: 'grey.400', lineHeight: 1.8, mb: 3, maxWidth: 320 }}
                >
                  Votre destination shopping en ligne. Découvrez une sélection unique de produits 
                  de qualité à des prix imbattables.
                </Typography>

                {/* Newsletter */}
                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1.5 }}>
                  Inscrivez-vous à notre newsletter
                </Typography>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <TextField
                    size="small"
                    placeholder="Votre email"
                    sx={{
                      flex: 1,
                      '& .MuiOutlinedInput-root': {
                        backgroundColor: 'rgba(255,255,255,0.05)',
                        borderRadius: '10px',
                        color: 'white',
                        '& fieldset': { borderColor: 'rgba(255,255,255,0.1)' },
                        '&:hover fieldset': { borderColor: 'rgba(255,255,255,0.2)' },
                        '&.Mui-focused fieldset': { borderColor: 'primary.main' },
                      },
                      '& .MuiInputBase-input::placeholder': { color: 'grey.500' },
                    }}
                  />
                  <Button
                    variant="contained"
                    sx={{
                      minWidth: 'auto',
                      px: 2,
                      background: 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)',
                      '&:hover': {
                        background: 'linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)',
                      },
                    }}
                  >
                    <Send sx={{ fontSize: 20 }} />
                  </Button>
                </Box>
              </Box>
            </Grid>

            {/* Links Sections */}
            <Grid item xs={6} sm={3} md={2}>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2.5 }}>
                Boutique
              </Typography>
              <Stack spacing={1.5}>
                {footerLinks.shop.map((link) => (
                  <Link
                    key={link.path}
                    component={RouterLink}
                    to={link.path}
                    sx={{
                      color: 'grey.400',
                      textDecoration: 'none',
                      fontSize: '0.875rem',
                      transition: 'all 0.2s',
                      '&:hover': { color: 'white', pl: 0.5 },
                    }}
                  >
                    {link.label}
                  </Link>
                ))}
              </Stack>
            </Grid>

            <Grid item xs={6} sm={3} md={2}>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2.5 }}>
                Mon Compte
              </Typography>
              <Stack spacing={1.5}>
                {footerLinks.account.map((link) => (
                  <Link
                    key={link.path}
                    component={RouterLink}
                    to={link.path}
                    sx={{
                      color: 'grey.400',
                      textDecoration: 'none',
                      fontSize: '0.875rem',
                      transition: 'all 0.2s',
                      '&:hover': { color: 'white', pl: 0.5 },
                    }}
                  >
                      {link.label}
                  </Link>
                ))}
              </Stack>
            </Grid>

            <Grid item xs={6} sm={3} md={2}>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2.5 }}>
                Aide
              </Typography>
              <Stack spacing={1.5}>
                {footerLinks.help.map((link) => (
                  <Link
                    key={link.path}
                    component={RouterLink}
                    to={link.path}
                    sx={{
                      color: 'grey.400',
                      textDecoration: 'none',
                      fontSize: '0.875rem',
                      transition: 'all 0.2s',
                      '&:hover': { color: 'white', pl: 0.5 },
                    }}
                  >
                    {link.label}
                  </Link>
                ))}
              </Stack>
            </Grid>

            <Grid item xs={6} sm={3} md={2}>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2.5 }}>
                Contact
              </Typography>
              <Stack spacing={2}>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
                  <LocationOn sx={{ color: 'primary.light', fontSize: 20, mt: 0.3 }} />
                  <Typography variant="body2" sx={{ color: 'grey.400' }}>
                    123 Rue du Commerce<br />75001 Paris, France
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Phone sx={{ color: 'primary.light', fontSize: 20 }} />
                  <Typography variant="body2" sx={{ color: 'grey.400' }}>
                    +33 1 23 45 67 89
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Email sx={{ color: 'primary.light', fontSize: 20 }} />
                  <Typography variant="body2" sx={{ color: 'grey.400' }}>
                    contact@shophub.fr
                  </Typography>
                </Box>
              </Stack>
            </Grid>
          </Grid>

          <Divider sx={{ my: 4, borderColor: 'rgba(255,255,255,0.1)' }} />

          {/* Bottom Footer */}
          <Box
            sx={{
              display: 'flex',
              flexDirection: { xs: 'column', md: 'row' },
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: 2,
            }}
          >
            <Typography variant="body2" sx={{ color: 'grey.500', textAlign: { xs: 'center', md: 'left' } }}>
              © 2024 ShopHub. Tous droits réservés.
            </Typography>

            {/* Social Links */}
            <Stack direction="row" spacing={1}>
              {socialLinks.map((social) => (
                <IconButton
                  key={social.label}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  sx={{
                    color: 'grey.400',
                    backgroundColor: 'rgba(255,255,255,0.05)',
                    '&:hover': {
                      color: 'white',
                      backgroundColor: 'primary.main',
                      transform: 'translateY(-2px)',
                    },
                    transition: 'all 0.2s',
                  }}
                  size="small"
                >
                  {social.icon}
                </IconButton>
              ))}
            </Stack>

            {/* Legal Links */}
            <Stack
              direction="row"
              spacing={2}
              sx={{ display: { xs: 'none', sm: 'flex' } }}
            >
              {footerLinks.legal.slice(0, 2).map((link) => (
                <Link
                  key={link.path}
                  component={RouterLink}
                  to={link.path}
                  sx={{
                    color: 'grey.500',
                    textDecoration: 'none',
                    fontSize: '0.8125rem',
                    '&:hover': { color: 'grey.300' },
                  }}
                >
                  {link.label}
                </Link>
              ))}
            </Stack>
          </Box>
        </Container>
      </Box>
    </Box>
  );
};

export default Footer;