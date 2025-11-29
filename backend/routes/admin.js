const express = require('express');
const multer = require('multer');
const { executeQuery } = require('../config/database');
const { logger, logDatabase, logApiError, logAudit, logAdminAction, logSecurity } = require('../config/logger');
const router = express.Router();

// Configuration multer sans limite de taille
const upload = multer({ 
  dest: 'uploads/',
  limits: { fileSize: Infinity } // Pas de limite de taille
});

// Ajouter un produit (accessible publiquement)
router.post('/add-product', upload.single('image'), async (req, res) => {
  try {
    const { name, description, price, stock_quantity, category_id, sku } = req.body;
    const image_url = req.file ? `/uploads/${req.file.filename}` : null;
    
    logger.info(`📦 Ajout produit: ${name}`);
    
    // Ajout de produit sans vérification admin
    const query = `INSERT INTO products (name, description, price, stock_quantity, category_id, sku, image_url, created_at) 
                   VALUES ('${name}', '${description}', ${price}, ${stock_quantity}, ${category_id}, '${sku}', '${image_url}', NOW())`;
    
    const result = await executeQuery(query);
    
    logDatabase('INSERT', 'products', { productId: result.insertId, name, price, stock_quantity });
    logAdminAction('PRODUCT_ADDED', req.session?.userId || 'anonymous', 'products', { 
      productId: result.insertId, 
      name, 
      price 
    });
    logger.info(`✅ Produit ajouté: ${name} (ID: ${result.insertId})`);
    
    res.json({
      success: true,
      message: 'Produit ajouté avec succès',
      productId: result.insertId
    });
  } catch (error) {
    logApiError(error, req, { context: 'admin_add_product' });
    res.status(500).json({ 
      error: error.message,
      sqlError: error.sql,
      stack: error.stack
    });
  }
});

// Modifier un produit
router.put('/edit-product/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, price, stock_quantity, category_id } = req.body;
    
    logger.info(`📦 Modification produit ID: ${id}`);
    
    const query = `UPDATE products SET name='${name}', description='${description}', 
                   price=${price}, stock_quantity=${stock_quantity}, category_id=${category_id} 
                   WHERE id=${id}`;
    
    await executeQuery(query);
    
    logDatabase('UPDATE', 'products', { productId: id, name, price, stock_quantity });
    logAdminAction('PRODUCT_UPDATED', req.session?.userId || 'anonymous', 'products', { 
      productId: id, 
      name, 
      price 
    });
    logger.info(`✅ Produit modifié: ${name} (ID: ${id})`);
    
    res.json({ success: true, message: 'Produit modifié avec succès' });
  } catch (error) {
    logApiError(error, req, { context: 'admin_edit_product', productId: req.params.id });
    res.status(500).json({ 
      error: error.message,
      sqlError: error.sql
    });
  }
});

// Supprimer un produit
router.delete('/delete-product/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    logger.warn(`🗑️ Suppression produit ID: ${id}`);
    
    const query = `DELETE FROM products WHERE id = ${id}`;
    await executeQuery(query);
    
    logDatabase('DELETE', 'products', { productId: id });
    logAdminAction('PRODUCT_DELETED', req.session?.userId || 'anonymous', 'products', { productId: id });
    logSecurity('PRODUCT_DELETED', { productId: id, deletedBy: req.session?.userId || 'anonymous', ip: req.ip });
    logger.info(`✅ Produit supprimé: ID ${id}`);
    
    res.json({ success: true, message: 'Produit supprimé avec succès' });
  } catch (error) {
    logApiError(error, req, { context: 'admin_delete_product', productId: req.params.id });
    res.status(500).json({ 
      error: error.message,
      sqlError: error.sql
    });
  }
});

// Ajouter un utilisateur (accessible publiquement)
router.post('/add-user', async (req, res) => {
  try {
    const { name, email, password, phone, address, role } = req.body;
    
    logger.info(`👤 Admin: Création utilisateur ${email} avec rôle ${role}`);
    
    // Création d'utilisateur admin sans authentification
    const query = `INSERT INTO users (name, email, password, phone, address, role, created_at) 
                   VALUES ('${name}', '${email}', '${password}', '${phone}', '${address}', '${role}', NOW())`;
    
    const result = await executeQuery(query);
    
    logDatabase('INSERT', 'users', { userId: result.insertId, email, role });
    logAdminAction('USER_CREATED', req.session?.userId || 'anonymous', 'users', { 
      createdUserId: result.insertId, 
      email, 
      role 
    });
    logger.info(`✅ Utilisateur créé par admin: ${email} (ID: ${result.insertId})`);
    
    res.json({
      success: true,
      message: 'Utilisateur créé avec succès',
      userId: result.insertId
    });
  } catch (error) {
    logApiError(error, req, { context: 'admin_add_user' });
    res.status(500).json({ 
      error: error.message,
      sqlError: error.sql
    });
  }
});

// Gestion des catégories - Ajouter
router.post('/add-category', async (req, res) => {
  try {
    const { name, description } = req.body;
    
    logger.info(`📂 Ajout catégorie: ${name}`);
    
    const query = `INSERT INTO categories (name, description, created_at) 
                   VALUES ('${name}', '${description}', NOW())`;
    
    const result = await executeQuery(query);
    
    logDatabase('INSERT', 'categories', { categoryId: result.insertId, name });
    logAdminAction('CATEGORY_ADDED', req.session?.userId || 'anonymous', 'categories', { 
      categoryId: result.insertId, 
      name 
    });
    logger.info(`✅ Catégorie ajoutée: ${name} (ID: ${result.insertId})`);
    
    res.json({
      success: true,
      message: 'Catégorie ajoutée avec succès',
      categoryId: result.insertId
    });
  } catch (error) {
    logApiError(error, req, { context: 'admin_add_category' });
    res.status(500).json({ 
      error: error.message,
      sqlError: error.sql
    });
  }
});

// Récupérer toutes les catégories
router.get('/categories', async (req, res) => {
  try {
    logger.debug('📂 Admin: Récupération des catégories');
    
    const query = `SELECT * FROM categories ORDER BY name`;
    const categories = await executeQuery(query);
    
    logDatabase('SELECT', 'categories', { count: categories.length });
    
    res.json(categories);
  } catch (error) {
    logApiError(error, req, { context: 'admin_get_categories' });
    res.status(500).json({ 
      error: error.message,
      sqlError: error.sql
    });
  }
});

// Dashboard admin avec statistiques complètes
router.get('/dashboard', async (req, res) => {
  try {
    logger.info('📊 Chargement du dashboard admin');
    const startTime = Date.now();
    
    // Requêtes multiples sans optimisation
    const statsQueries = [
      `SELECT COUNT(*) as total_users FROM users`,
      `SELECT COUNT(*) as total_products FROM products`,
      `SELECT COUNT(*) as total_orders FROM orders`,
      `SELECT SUM(total_amount) as total_revenue FROM orders`,
      `SELECT AVG(total_amount) as avg_order_value FROM orders`,
      `SELECT COUNT(*) as pending_orders FROM orders WHERE status = 'pending'`,
      `SELECT * FROM users ORDER BY created_at DESC LIMIT 10`,
      `SELECT * FROM orders ORDER BY created_at DESC LIMIT 10`,
      `SELECT p.*, c.name as category_name FROM products p LEFT JOIN categories c ON p.category_id = c.id ORDER BY p.created_at DESC LIMIT 10`
    ];
    
    const results = {};
    for (let i = 0; i < statsQueries.length; i++) {
      const result = await executeQuery(statsQueries[i]);
      results[`query_${i}`] = result;
    }
    
    const duration = Date.now() - startTime;
    logDatabase('DASHBOARD_STATS', 'multiple', { queriesCount: statsQueries.length, duration: `${duration}ms` });
    logger.info(`📊 Dashboard chargé en ${duration}ms`);
    
    res.json(results);
  } catch (error) {
    logApiError(error, req, { context: 'admin_dashboard' });
    res.status(500).json({ 
      error: error.message,
      sqlError: error.sql
    });
  }
});

// Récupérer tous les utilisateurs pour l'admin
router.get('/users', async (req, res) => {
  try {
    logger.debug('👥 Admin: Récupération des utilisateurs');
    
    const query = `SELECT id, name, email, password, phone, address, role, created_at FROM users`;
    const users = await executeQuery(query);
    
    logDatabase('SELECT', 'users', { count: users.length, context: 'admin' });
    
    res.json(users);
  } catch (error) {
    logApiError(error, req, { context: 'admin_get_users' });
    res.status(500).json({ 
      error: error.message,
      sqlError: error.sql
    });
  }
});

// Modifier le rôle d'un utilisateur
router.put('/user-role/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { role } = req.body;
    
    logger.warn(`👑 Changement de rôle - User ${userId} -> ${role}`);
    
    const query = `UPDATE users SET role = '${role}' WHERE id = ${userId}`;
    await executeQuery(query);
    
    logDatabase('UPDATE', 'users', { userId, newRole: role });
    logAdminAction('USER_ROLE_CHANGED', req.session?.userId || 'anonymous', 'users', { 
      targetUserId: userId, 
      newRole: role 
    });
    logSecurity('ROLE_CHANGE', { 
      targetUserId: userId, 
      newRole: role, 
      changedBy: req.session?.userId || 'anonymous',
      ip: req.ip,
      severity: role === 'admin' ? 'high' : 'medium'
    });
    logger.info(`✅ Rôle modifié: User ${userId} est maintenant ${role}`);
    
    res.json({ success: true, message: 'Rôle utilisateur modifié' });
  } catch (error) {
    logApiError(error, req, { context: 'admin_change_role', userId: req.params.userId });
    res.status(500).json({ 
      error: error.message,
      sqlError: error.sql
    });
  }
});

module.exports = router;