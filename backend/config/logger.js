const winston = require('winston');
const DailyRotateFile = require('winston-daily-rotate-file');
const path = require('path');
const fs = require('fs');

// Créer le dossier logs s'il n'existe pas
const logsDir = path.join(__dirname, '../logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Format personnalisé pour les logs
const customFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.printf(({ level, message, timestamp, ...metadata }) => {
    let metaStr = Object.keys(metadata).length ? JSON.stringify(metadata, null, 2) : '';
    return `[${timestamp}] [${level.toUpperCase()}]: ${message} ${metaStr}`;
  })
);

// Format JSON pour les fichiers
const jsonFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.json()
);

// Format coloré pour la console
const consoleFormat = winston.format.combine(
  winston.format.colorize({ all: true }),
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.printf(({ level, message, timestamp, ...metadata }) => {
    let metaStr = '';
    if (metadata.method) {
      metaStr = `[${metadata.method}] ${metadata.url}`;
      if (metadata.statusCode) {
        metaStr += ` - ${metadata.statusCode}`;
      }
      if (metadata.responseTime) {
        metaStr += ` (${metadata.responseTime}ms)`;
      }
    }
    return `[${timestamp}] ${level}: ${message} ${metaStr}`;
  })
);

// Transport pour les logs d'accès (requêtes HTTP)
const accessLogTransport = new DailyRotateFile({
  filename: path.join(logsDir, 'access-%DATE%.log'),
  datePattern: 'YYYY-MM-DD',
  zippedArchive: true,
  maxSize: '20m',
  maxFiles: '14d',
  level: 'http',
  format: jsonFormat
});

// Transport pour les logs d'erreurs
const errorLogTransport = new DailyRotateFile({
  filename: path.join(logsDir, 'error-%DATE%.log'),
  datePattern: 'YYYY-MM-DD',
  zippedArchive: true,
  maxSize: '20m',
  maxFiles: '30d',
  level: 'error',
  format: jsonFormat
});

// Transport pour tous les logs combinés
const combinedLogTransport = new DailyRotateFile({
  filename: path.join(logsDir, 'combined-%DATE%.log'),
  datePattern: 'YYYY-MM-DD',
  zippedArchive: true,
  maxSize: '20m',
  maxFiles: '14d',
  format: jsonFormat
});

// Transport pour les logs d'audit (actions importantes)
const auditLogTransport = new DailyRotateFile({
  filename: path.join(logsDir, 'audit-%DATE%.log'),
  datePattern: 'YYYY-MM-DD',
  zippedArchive: true,
  maxSize: '20m',
  maxFiles: '90d',
  level: 'info',
  format: jsonFormat
});

// Créer le logger principal
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'debug',
  levels: {
    error: 0,
    warn: 1,
    info: 2,
    http: 3,
    debug: 4
  },
  transports: [
    errorLogTransport,
    combinedLogTransport,
    new winston.transports.Console({
      format: consoleFormat
    })
  ]
});

// Logger spécifique pour les accès HTTP
const accessLogger = winston.createLogger({
  level: 'http',
  levels: { http: 0 },
  transports: [accessLogTransport]
});

// Logger spécifique pour l'audit
const auditLogger = winston.createLogger({
  level: 'info',
  transports: [auditLogTransport]
});

// Ajouter les couleurs personnalisées
winston.addColors({
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'cyan'
});

// ============ FONCTIONS UTILITAIRES DE LOGGING ============

/**
 * Masquer les données sensibles
 */
const sanitizeData = (data) => {
  if (!data) return data;
  
  const sensitiveFields = ['password', 'token', 'authorization', 'cookie', 'credit_card', 'cvv', 'secret'];
  const sanitized = { ...data };
  
  const maskValue = (obj) => {
    if (typeof obj !== 'object' || obj === null) return obj;
    
    const result = Array.isArray(obj) ? [...obj] : { ...obj };
    
    for (const key in result) {
      if (sensitiveFields.some(field => key.toLowerCase().includes(field))) {
        result[key] = '***MASKED***';
      } else if (typeof result[key] === 'object') {
        result[key] = maskValue(result[key]);
      }
    }
    return result;
  };
  
  return maskValue(sanitized);
};

/**
 * Logger une requête HTTP
 */
const logRequest = (req, res, responseTime) => {
  const logData = {
    timestamp: new Date().toISOString(),
    method: req.method,
    url: req.originalUrl || req.url,
    statusCode: res.statusCode,
    responseTime: `${responseTime}ms`,
    ip: req.ip || req.connection.remoteAddress,
    userAgent: req.get('User-Agent'),
    userId: req.session?.userId || null,
    contentLength: res.get('Content-Length') || 0
  };

  // Log dans le fichier d'accès
  accessLogger.log('http', 'HTTP Request', logData);

  // Log coloré dans la console
  const statusColor = res.statusCode >= 500 ? 'error' : 
                      res.statusCode >= 400 ? 'warn' : 
                      res.statusCode >= 300 ? 'info' : 'http';
  
  logger.log(statusColor, `${req.method} ${req.originalUrl}`, {
    statusCode: res.statusCode,
    responseTime,
    method: req.method,
    url: req.originalUrl
  });
};

/**
 * Logger une action d'audit
 */
const logAudit = (action, userId, details = {}) => {
  const auditData = {
    timestamp: new Date().toISOString(),
    action,
    userId,
    details: sanitizeData(details),
    ip: details.ip || null
  };
  
  auditLogger.info(`AUDIT: ${action}`, auditData);
  logger.info(`🔐 AUDIT: ${action}`, { userId, action });
};

/**
 * Logger une erreur API
 */
const logApiError = (error, req, additionalInfo = {}) => {
  const errorData = {
    timestamp: new Date().toISOString(),
    error: {
      message: error.message,
      stack: error.stack,
      code: error.code
    },
    request: {
      method: req.method,
      url: req.originalUrl || req.url,
      body: sanitizeData(req.body),
      params: req.params,
      query: req.query,
      userId: req.session?.userId || null,
      ip: req.ip
    },
    ...additionalInfo
  };
  
  logger.error(`❌ API Error: ${error.message}`, errorData);
};

/**
 * Logger une opération de base de données
 */
const logDatabase = (operation, table, details = {}) => {
  const dbData = {
    timestamp: new Date().toISOString(),
    operation,
    table,
    details: sanitizeData(details)
  };
  
  logger.debug(`🗄️ DB ${operation}: ${table}`, dbData);
};

/**
 * Logger une action admin
 */
const logAdminAction = (action, adminId, target, details = {}) => {
  const adminData = {
    timestamp: new Date().toISOString(),
    action,
    adminId,
    target,
    details: sanitizeData(details)
  };
  
  auditLogger.info(`ADMIN ACTION: ${action}`, adminData);
  logger.warn(`👑 ADMIN: ${action} by user ${adminId}`, { target, action });
};

/**
 * Logger un événement de sécurité
 */
const logSecurity = (event, details = {}) => {
  const securityData = {
    timestamp: new Date().toISOString(),
    event,
    severity: details.severity || 'medium',
    details: sanitizeData(details)
  };
  
  auditLogger.info(`SECURITY: ${event}`, securityData);
  logger.warn(`🛡️ SECURITY: ${event}`, securityData);
};

/**
 * Logger une transaction/commande
 */
const logTransaction = (type, orderId, userId, amount, status, details = {}) => {
  const transactionData = {
    timestamp: new Date().toISOString(),
    type,
    orderId,
    userId,
    amount,
    status,
    details: sanitizeData(details)
  };
  
  auditLogger.info(`TRANSACTION: ${type}`, transactionData);
  logger.info(`💰 TRANSACTION: ${type} - Order #${orderId} - ${amount} DH - ${status}`);
};

// ============ MIDDLEWARE EXPRESS ============

/**
 * Middleware de logging des requêtes HTTP
 */
const requestLoggerMiddleware = (req, res, next) => {
  const startTime = Date.now();
  
  // Capturer la fin de la réponse
  res.on('finish', () => {
    const responseTime = Date.now() - startTime;
    logRequest(req, res, responseTime);
  });
  
  next();
};

/**
 * Middleware de logging des erreurs
 */
const errorLoggerMiddleware = (err, req, res, next) => {
  logApiError(err, req);
  next(err);
};

// ============ EXPORTS ============

module.exports = {
  logger,
  accessLogger,
  auditLogger,
  
  // Fonctions de logging
  logRequest,
  logAudit,
  logApiError,
  logDatabase,
  logAdminAction,
  logSecurity,
  logTransaction,
  sanitizeData,
  
  // Middlewares
  requestLoggerMiddleware,
  errorLoggerMiddleware
};
