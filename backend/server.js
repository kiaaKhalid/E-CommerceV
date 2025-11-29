const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const cors = require('cors');
const path = require('path');
const { db } = require('./config/database');
const { 
  logger, 
  requestLoggerMiddleware, 
  errorLoggerMiddleware,
  logSecurity 
} = require('./config/logger');
const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const userRoutes = require('./routes/users');
const adminRoutes = require('./routes/admin');
const orderRoutes = require('./routes/orders');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware CORS
app.use(cors({
  origin: '*',
  credentials: true
}));

app.use(bodyParser.json({ limit: '100mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '100mb' }));

// Configuration des sessions
app.use(session({
  secret: 'simple-secret-key',
  resave: false,
  saveUninitialized: true,
  cookie: { 
    secure: false,
    maxAge: null
  }
}));

// ============ MIDDLEWARE DE JOURNALISATION ============
// Utiliser le middleware de logging pour toutes les requêtes
app.use(requestLoggerMiddleware);

// Servir les fichiers statiques
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(express.static(path.join(__dirname, '../frontend')));

// Routes API
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/users', userRoutes);
app.use('/admin', adminRoutes);
app.use('/api/orders', orderRoutes);

// Route par défaut
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

// ============ MIDDLEWARE DE GESTION DES ERREURS ============
// Middleware de logging des erreurs
app.use(errorLoggerMiddleware);

// Gestion des erreurs finale
app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  
  // Ne pas exposer les détails en production
  const response = {
    success: false,
    message: statusCode === 500 ? 'Erreur interne du serveur' : err.message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  };
  
  res.status(statusCode).json(response);
});

// ============ DÉMARRAGE DU SERVEUR ============
app.listen(PORT, () => {
  logger.info(`🚀 Serveur démarré sur le port ${PORT}`, {
    port: PORT,
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString()
  });
});

module.exports = app;