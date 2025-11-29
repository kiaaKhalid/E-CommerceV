const express = require('express');
const { executeQuery } = require('../config/database');
const { logger, logDatabase, logApiError, logAudit, logSecurity } = require('../config/logger');
const router = express.Router();

// Créer un utilisateur (accessible publiquement)
router.post('/create', async (req, res) => {
  try {
    const { name, email, password, phone, address, role } = req.body;
    
    logger.info(`👤 Création utilisateur: ${email}`);
    
    const query = `INSERT INTO users (name, email, password, phone, address, role, created_at) 
                   VALUES ('${name}', '${email}', '${password}', '${phone}', '${address}', '${role || 'user'}', NOW())`;
    
    const result = await executeQuery(query);
    
    logDatabase('INSERT', 'users', { userId: result.insertId, email, role: role || 'user' });
    logAudit('USER_CREATED', result.insertId, { email, name, role: role || 'user', ip: req.ip });
    logger.info(`✅ Utilisateur créé: ${email} (ID: ${result.insertId})`);
    
    res.json({
      success: true,
      message: 'Utilisateur créé avec succès',
      userId: result.insertId
    });
  } catch (error) {
    logApiError(error, req, { context: 'user_create' });
    res.status(500).json({ error: error.message });
  }
});

// Récupérer le profil de l'utilisateur connecté
router.get('/profile', async (req, res) => {
  try {
    if (!req.session.userId) {
      logger.warn('⚠️ Tentative d\'accès au profil sans authentification');
      return res.status(401).json({ message: 'Non authentifié' });
    }
    
    logger.debug(`👤 Récupération profil - User: ${req.session.userId}`);
    
    const query = `SELECT id, name, email, phone, address, role, created_at FROM users WHERE id = ?`;
    const user = await executeQuery(query, [req.session.userId]);
    
    if (user.length > 0) {
      logDatabase('SELECT', 'users', { userId: req.session.userId, found: true });
      res.json(user[0]);
    } else {
      logger.warn(`👤 Profil non trouvé pour User: ${req.session.userId}`);
      res.status(404).json({ message: 'Utilisateur non trouvé' });
    }
  } catch (error) {
    logApiError(error, req, { context: 'profile_get' });
    res.status(500).json({ error: error.message });
  }
});

// Mettre à jour le profil de l'utilisateur connecté
router.put('/profile', async (req, res) => {
  try {
    if (!req.session.userId) {
      logger.warn('⚠️ Tentative de modification profil sans authentification');
      return res.status(401).json({ message: 'Non authentifié' });
    }
    
    const { name, phone, address } = req.body;
    logger.info(`👤 Mise à jour profil - User: ${req.session.userId}`);
    
    const query = `UPDATE users SET name = ?, phone = ?, address = ? WHERE id = ?`;
    await executeQuery(query, [name, phone, address, req.session.userId]);
    
    logDatabase('UPDATE', 'users', { userId: req.session.userId });
    logAudit('PROFILE_UPDATED', req.session.userId, { name, phone, address });
    logger.info(`✅ Profil mis à jour - User: ${req.session.userId}`);
    
    res.json({ success: true, message: 'Profil mis à jour' });
  } catch (error) {
    logApiError(error, req, { context: 'profile_update' });
    res.status(500).json({ error: error.message });
  }
});

// Récupérer tous les utilisateurs
router.get('/', async (req, res) => {
  try {
    logger.debug('👥 Récupération de tous les utilisateurs');
    
    const query = `SELECT id, name, email, phone, address, role, created_at FROM users`;
    const users = await executeQuery(query);
    
    logDatabase('SELECT', 'users', { count: users.length });
    
    res.json(users);
  } catch (error) {
    logApiError(error, req, { context: 'users_list' });
    res.status(500).json({ error: error.message });
  }
});

// Historique des commandes d'un utilisateur
router.get('/:userId/orders', async (req, res) => {
  try {
    const { userId } = req.params;
    logger.debug(`📋 Historique commandes - User: ${userId}`);
    
    const query = `
      SELECT o.*, 
             (SELECT COUNT(*) FROM order_items oi WHERE oi.order_id = o.id) as item_count,
             (SELECT SUM(oi.quantity * oi.price) FROM order_items oi WHERE oi.order_id = o.id) as total_amount
      FROM orders o 
      WHERE o.user_id = ${userId}
      ORDER BY o.created_at DESC
    `;
    
    const orders = await executeQuery(query);
    logDatabase('SELECT', 'orders', { userId, ordersCount: orders.length });
    
    res.json(orders);
  } catch (error) {
    logApiError(error, req, { context: 'user_orders', userId: req.params.userId });
    res.status(500).json({ error: error.message });
  }
});

// Récupérer un utilisateur par ID
router.get('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    logger.debug(`👤 Récupération utilisateur ID: ${userId}`);
    
    const query = `SELECT id, name, email, phone, address, role, created_at FROM users WHERE id = ${userId}`;
    const user = await executeQuery(query);
    
    if (user.length > 0) {
      logDatabase('SELECT', 'users', { userId, found: true });
      res.json(user[0]);
    } else {
      logger.warn(`👤 Utilisateur non trouvé: ${userId}`);
      res.status(404).json({ message: 'Utilisateur non trouvé' });
    }
  } catch (error) {
    logApiError(error, req, { context: 'user_get', userId: req.params.userId });
    res.status(500).json({ error: error.message });
  }
});

// Mettre à jour un utilisateur
router.put('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { name, email, password, phone, address, role } = req.body;
    
    logger.info(`👤 Mise à jour utilisateur ID: ${userId}`);
    
    const query = `UPDATE users SET name='${name}', email='${email}', password='${password}', 
                   phone='${phone}', address='${address}', role='${role}' WHERE id=${userId}`;
    
    await executeQuery(query);
    
    logDatabase('UPDATE', 'users', { userId, email, role });
    logAudit('USER_UPDATED', req.session?.userId || 'system', { targetUserId: userId, email, role });
    logger.info(`✅ Utilisateur mis à jour: ${email} (ID: ${userId})`);
    
    res.json({ success: true, message: 'Utilisateur mis à jour' });
  } catch (error) {
    logApiError(error, req, { context: 'user_update', userId: req.params.userId });
    res.status(500).json({ error: error.message });
  }
});

// Supprimer un utilisateur
router.delete('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    logger.warn(`🗑️ Suppression utilisateur ID: ${userId}`);
    
    const query = `DELETE FROM users WHERE id = ${userId}`;
    await executeQuery(query);
    
    logDatabase('DELETE', 'users', { userId });
    logAudit('USER_DELETED', req.session?.userId || 'system', { deletedUserId: userId, ip: req.ip });
    logSecurity('USER_DELETED', { userId, deletedBy: req.session?.userId || 'system', ip: req.ip });
    logger.info(`✅ Utilisateur supprimé: ID ${userId}`);
    
    res.json({ success: true, message: 'Utilisateur supprimé' });
  } catch (error) {
    logApiError(error, req, { context: 'user_delete', userId: req.params.userId });
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;