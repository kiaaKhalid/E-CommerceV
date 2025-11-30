const client = require('prom-client');

// Créer un registre de métriques
const register = new client.Registry();

// Ajouter les métriques par défaut (CPU, mémoire, etc.)
client.collectDefaultMetrics({
  register,
  prefix: 'ecommerce_',
  gcDurationBuckets: [0.001, 0.01, 0.1, 1, 2, 5]
});

// ============ MÉTRIQUES HTTP ============

// Compteur de requêtes HTTP totales
const httpRequestsTotal = new client.Counter({
  name: 'ecommerce_http_requests_total',
  help: 'Nombre total de requêtes HTTP',
  labelNames: ['method', 'route', 'status_code'],
  registers: [register]
});

// Histogramme de durée des requêtes HTTP
const httpRequestDuration = new client.Histogram({
  name: 'ecommerce_http_request_duration_seconds',
  help: 'Durée des requêtes HTTP en secondes',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [0.001, 0.005, 0.015, 0.05, 0.1, 0.2, 0.3, 0.4, 0.5, 1, 2, 5],
  registers: [register]
});

// Requêtes en cours
const httpRequestsInProgress = new client.Gauge({
  name: 'ecommerce_http_requests_in_progress',
  help: 'Nombre de requêtes HTTP en cours',
  labelNames: ['method'],
  registers: [register]
});

// ============ MÉTRIQUES MÉTIER E-COMMERCE ============

// Compteur de commandes
const ordersTotal = new client.Counter({
  name: 'ecommerce_orders_total',
  help: 'Nombre total de commandes créées',
  labelNames: ['status'],
  registers: [register]
});

// Revenu total
const revenueTotal = new client.Counter({
  name: 'ecommerce_revenue_total',
  help: 'Revenu total en DH',
  registers: [register]
});

// Valeur moyenne des commandes
const orderValue = new client.Histogram({
  name: 'ecommerce_order_value',
  help: 'Valeur des commandes en DH',
  buckets: [50, 100, 200, 500, 1000, 2000, 5000, 10000],
  registers: [register]
});

// Compteur d'ajouts au panier
const cartAdditions = new client.Counter({
  name: 'ecommerce_cart_additions_total',
  help: 'Nombre total d\'ajouts au panier',
  registers: [register]
});

// Compteur de produits vus
const productViews = new client.Counter({
  name: 'ecommerce_product_views_total',
  help: 'Nombre total de vues de produits',
  labelNames: ['product_id'],
  registers: [register]
});

// ============ MÉTRIQUES UTILISATEURS ============

// Compteur de connexions
const userLogins = new client.Counter({
  name: 'ecommerce_user_logins_total',
  help: 'Nombre total de connexions utilisateurs',
  labelNames: ['status'],
  registers: [register]
});

// Compteur d'inscriptions
const userRegistrations = new client.Counter({
  name: 'ecommerce_user_registrations_total',
  help: 'Nombre total d\'inscriptions',
  registers: [register]
});

// Utilisateurs actifs (gauge)
const activeUsers = new client.Gauge({
  name: 'ecommerce_active_users',
  help: 'Nombre d\'utilisateurs actifs',
  registers: [register]
});

// Sessions actives
const activeSessions = new client.Gauge({
  name: 'ecommerce_active_sessions',
  help: 'Nombre de sessions actives',
  registers: [register]
});

// ============ MÉTRIQUES BASE DE DONNÉES ============

// Durée des requêtes DB
const dbQueryDuration = new client.Histogram({
  name: 'ecommerce_db_query_duration_seconds',
  help: 'Durée des requêtes base de données en secondes',
  labelNames: ['operation', 'table'],
  buckets: [0.001, 0.005, 0.01, 0.05, 0.1, 0.5, 1, 2, 5],
  registers: [register]
});

// Compteur de requêtes DB
const dbQueriesTotal = new client.Counter({
  name: 'ecommerce_db_queries_total',
  help: 'Nombre total de requêtes base de données',
  labelNames: ['operation', 'table', 'status'],
  registers: [register]
});

// Connexions DB actives
const dbConnectionsActive = new client.Gauge({
  name: 'ecommerce_db_connections_active',
  help: 'Nombre de connexions base de données actives',
  registers: [register]
});

// ============ MÉTRIQUES ERREURS ============

// Compteur d'erreurs
const errorsTotal = new client.Counter({
  name: 'ecommerce_errors_total',
  help: 'Nombre total d\'erreurs',
  labelNames: ['type', 'route'],
  registers: [register]
});

// Erreurs API
const apiErrorsTotal = new client.Counter({
  name: 'ecommerce_api_errors_total',
  help: 'Nombre total d\'erreurs API',
  labelNames: ['status_code', 'route'],
  registers: [register]
});

// ============ MÉTRIQUES INVENTAIRE ============

// Stock produits (gauge)
const productStock = new client.Gauge({
  name: 'ecommerce_product_stock',
  help: 'Stock disponible par produit',
  labelNames: ['product_id', 'product_name'],
  registers: [register]
});

// Produits en rupture de stock
const outOfStockProducts = new client.Gauge({
  name: 'ecommerce_out_of_stock_products',
  help: 'Nombre de produits en rupture de stock',
  registers: [register]
});

// ============ MIDDLEWARE EXPRESS ============

/**
 * Middleware pour collecter les métriques HTTP
 */
const metricsMiddleware = (req, res, next) => {
  const startTime = Date.now();
  
  // Incrémenter les requêtes en cours
  httpRequestsInProgress.labels(req.method).inc();
  
  // Capturer la fin de la réponse
  res.on('finish', () => {
    const duration = (Date.now() - startTime) / 1000;
    const route = getRoutePattern(req);
    const statusCode = res.statusCode.toString();
    
    // Métriques HTTP
    httpRequestsTotal.labels(req.method, route, statusCode).inc();
    httpRequestDuration.labels(req.method, route, statusCode).observe(duration);
    httpRequestsInProgress.labels(req.method).dec();
    
    // Tracker les erreurs
    if (res.statusCode >= 400) {
      apiErrorsTotal.labels(statusCode, route).inc();
    }
  });
  
  next();
};

/**
 * Obtenir le pattern de route (sans les IDs dynamiques)
 */
const getRoutePattern = (req) => {
  let route = req.route ? req.route.path : req.path;
  
  // Remplacer les IDs numériques par :id
  route = route.replace(/\/\d+/g, '/:id');
  
  // Normaliser la route
  if (route.length > 50) {
    route = route.substring(0, 50);
  }
  
  return route || 'unknown';
};

// ============ FONCTIONS HELPER POUR MÉTRIQUES MÉTIER ============

const metrics = {
  // HTTP
  recordHttpRequest: (method, route, statusCode, duration) => {
    httpRequestsTotal.labels(method, route, statusCode).inc();
    httpRequestDuration.labels(method, route, statusCode).observe(duration);
  },
  
  // Commandes
  recordOrder: (status, amount) => {
    ordersTotal.labels(status).inc();
    if (amount) {
      revenueTotal.inc(amount);
      orderValue.observe(amount);
    }
  },
  
  // Panier
  recordCartAddition: () => {
    cartAdditions.inc();
  },
  
  // Produits
  recordProductView: (productId) => {
    productViews.labels(productId.toString()).inc();
  },
  
  // Utilisateurs
  recordLogin: (success) => {
    userLogins.labels(success ? 'success' : 'failed').inc();
  },
  
  recordRegistration: () => {
    userRegistrations.inc();
  },
  
  setActiveUsers: (count) => {
    activeUsers.set(count);
  },
  
  setActiveSessions: (count) => {
    activeSessions.set(count);
  },
  
  // Base de données
  recordDbQuery: (operation, table, duration, success) => {
    dbQueriesTotal.labels(operation, table, success ? 'success' : 'error').inc();
    dbQueryDuration.labels(operation, table).observe(duration);
  },
  
  setDbConnections: (count) => {
    dbConnectionsActive.set(count);
  },
  
  // Erreurs
  recordError: (type, route) => {
    errorsTotal.labels(type, route).inc();
  },
  
  // Inventaire
  updateProductStock: (productId, productName, stock) => {
    productStock.labels(productId.toString(), productName).set(stock);
  },
  
  setOutOfStockCount: (count) => {
    outOfStockProducts.set(count);
  }
};

// ============ ROUTE POUR EXPOSER LES MÉTRIQUES ============

const getMetricsHandler = async (req, res) => {
  try {
    res.set('Content-Type', register.contentType);
    res.end(await register.metrics());
  } catch (error) {
    res.status(500).end(error.message);
  }
};

// ============ EXPORTS ============

module.exports = {
  register,
  metrics,
  metricsMiddleware,
  getMetricsHandler,
  
  // Export des compteurs individuels pour usage avancé
  counters: {
    httpRequestsTotal,
    ordersTotal,
    cartAdditions,
    productViews,
    userLogins,
    userRegistrations,
    dbQueriesTotal,
    errorsTotal,
    apiErrorsTotal,
    revenueTotal
  },
  
  histograms: {
    httpRequestDuration,
    orderValue,
    dbQueryDuration
  },
  
  gauges: {
    httpRequestsInProgress,
    activeUsers,
    activeSessions,
    dbConnectionsActive,
    productStock,
    outOfStockProducts
  }
};
