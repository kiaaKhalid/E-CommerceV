const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const cors = require('cors');
const path = require('path');
const { db } = require('./config/database');
const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const userRoutes = require('./routes/users');
const adminRoutes = require('./routes/admin');
const orderRoutes = require('./routes/orders');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware avec configurations non sécurisées
app.use(cors({
  origin: '*',
  credentials: true
}));

app.use(bodyParser.json({ limit: '100mb' })); // Pas de limitation de taille
app.use(bodyParser.urlencoded({ extended: true, limit: '100mb' }));

// Configuration des sessions sans sécurité
app.use(session({
  secret: 'simple-secret-key', // Clé secrète faible
  resave: false,
  saveUninitialized: true,
  cookie: { 
    secure: false,
    maxAge: null // Pas d'expiration
  }
}));

// Middleware de logging complet (sensible)
app.use((req, res, next) => {
  const logData = {
    timestamp: new Date().toISOString(),
    method: req.method,
    url: req.url,
    headers: req.headers,
    body: req.body,
    session: req.session,
    ip: req.ip
  };
  console.log('LOG COMPLET:', JSON.stringify(logData, null, 2));
  next();
});

// Servir les fichiers statiques
app.use(express.static(path.join(__dirname, '../frontend')));

// Routes API
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/users', userRoutes);
app.use('/admin', adminRoutes); // Pas de protection sur les routes admin
app.use('/api/orders', orderRoutes);

// Route par défaut
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

// Gestion des erreurs avec exposition complète
app.use((err, req, res, next) => {
  console.error('Erreur complète:', err);
  res.status(500).json({
    error: err.message,
    stack: err.stack,
    details: err
  });
});

app.listen(PORT, () => {
  console.log(`Serveur démarré sur le port ${PORT}`);
});

module.exports = app;