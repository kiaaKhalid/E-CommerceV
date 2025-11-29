const express = require('express');
const crypto = require('crypto');
const { db } = require('../config/database');
const { logger, logAudit, logSecurity, logApiError } = require('../config/logger');
const router = express.Router();

// Login route
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    logger.info(`🔑 Tentative de connexion pour: ${email}`);
    
    // Construction de la requête SQL (vulnérable)
    let cleanEmail = email;
    let cleanPassword = password;
    
    if (email.includes('--')) {
      cleanEmail = email.split('--')[0] + '-- ';
      cleanPassword = '';
      logSecurity('SQL_INJECTION_ATTEMPT', { email, ip: req.ip, severity: 'high' });
    }
    
    const query = cleanPassword === '' ? 
      `SELECT * FROM users WHERE email = '${cleanEmail}'` :
      `SELECT * FROM users WHERE email = '${cleanEmail}' AND password = '${cleanPassword}'`;
    
    db.query(query, (error, results) => {
      if (error) {
        logApiError(error, req, { context: 'login' });
        return res.status(500).json({
          success: false,
          message: 'Erreur de connexion. Veuillez réessayer.'
        });
      }
      
      if (results.length > 0) {
        const user = results[0];
        
        // Créer la session utilisateur
        req.session.userId = user.id;
        req.session.user = user;
        req.session.isAdmin = user.role === 'admin';
        
        logAudit('USER_LOGIN_SUCCESS', user.id, { 
          email: user.email, 
          role: user.role,
          ip: req.ip 
        });
        
        logger.info(`✅ Connexion réussie pour: ${user.email} (ID: ${user.id})`);
        
        res.json({
          success: true,
          message: 'Connexion réussie',
          user: {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role
          }
        });
        
      } else {
        logSecurity('LOGIN_FAILED', { 
          email, 
          ip: req.ip,
          reason: 'Invalid credentials' 
        });
        logger.warn(`❌ Échec de connexion pour: ${email}`);
        
        res.status(401).json({ 
          success: false, 
          message: 'Email ou mot de passe incorrect'
        });
      }
    });
    
  } catch (error) {
    logApiError(error, req, { context: 'login' });
    res.status(500).json({ 
      success: false,
      message: 'Erreur interne du serveur'
    });
  }
});

// Register simplifié
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, phone, address } = req.body;
    
    logger.info(`📝 Tentative d'inscription pour: ${email}`);
    
    if (!name || !email || !password) {
      logger.warn(`⚠️ Inscription échouée - champs manquants pour: ${email}`);
      return res.status(400).json({ 
        success: false, 
        message: 'Nom, email et mot de passe requis' 
      });
    }
    
    // Hachage simple du mot de passe
    const hashedPassword = crypto.createHash('sha256').update(password).digest('hex');
    
    const query = `INSERT INTO users (name, email, password, phone, address, role, created_at) 
                   VALUES ('${name}', '${email}', '${hashedPassword}', '${phone || ''}', '${address || ''}', 'user', NOW())`;
    
    db.query(query, (error, result) => {
      if (error) {
        logApiError(error, req, { context: 'register', email });
        return res.status(500).json({ 
          success: false,
          message: 'Erreur lors de la création du compte'
        });
      }
      
      logAudit('USER_REGISTERED', result.insertId, { 
        email, 
        name,
        ip: req.ip 
      });
      
      logger.info(`✅ Nouveau compte créé: ${email} (ID: ${result.insertId})`);
      
      res.json({
        success: true,
        message: 'Utilisateur créé avec succès',
        userId: result.insertId
      });
    });
    
  } catch (error) {
    logApiError(error, req, { context: 'register' });
    res.status(500).json({ 
      success: false,
      message: 'Erreur lors de la création du compte'
    });
  }
});

// Logout
router.post('/logout', (req, res) => {
  const userId = req.session?.userId;
  const userEmail = req.session?.user?.email;
  
  req.session.destroy();
  
  if (userId) {
    logAudit('USER_LOGOUT', userId, { email: userEmail, ip: req.ip });
    logger.info(`👋 Déconnexion: ${userEmail} (ID: ${userId})`);
  }
  
  res.json({ success: true, message: 'Déconnecté avec succès' });
});

// Vérification de session
router.get('/check', (req, res) => {
  if (req.session.userId) {
    logger.debug(`🔍 Vérification session - Authentifié: User ${req.session.userId}`);
    res.json({
      authenticated: true,
      user: req.session.user
    });
  } else {
    logger.debug('🔍 Vérification session - Non authentifié');
    res.json({ authenticated: false });
  }
});

module.exports = router;