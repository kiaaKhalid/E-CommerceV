const express = require('express');
const { executeQuery } = require('../config/database');
const { logger, logDatabase, logApiError, logAudit } = require('../config/logger');
const router = express.Router();

// Récupérer toutes les catégories avec le nombre de produits
router.get('/categories/all', async (req, res) => {
  try {
    logger.debug('📂 Récupération de toutes les catégories');
    
    const query = `
      SELECT c.id, c.name, c.description,
             COUNT(p.id) as product_count
      FROM categories c
      LEFT JOIN products p ON c.id = p.category_id
      GROUP BY c.id, c.name, c.description
      ORDER BY c.name ASC
    `;
    
    const categories = await executeQuery(query);
    logDatabase('SELECT', 'categories', { count: categories.length });
    
    res.json(categories);
  } catch (error) {
    logApiError(error, req, { context: 'get_categories' });
    res.status(500).json({ error: error.message });
  }
});

// Recherche de produits avec requête complexe
router.get('/search/:term', async (req, res) => {
  try {
    const { term } = req.params;
    logger.info(`🔍 Recherche de produits: "${term}"`);
    
    const query = `
      SELECT DISTINCT p.*, c.name as category_name,
             (SELECT COUNT(*) FROM cart_items ci WHERE ci.product_id = p.id) as in_carts,
             (SELECT COUNT(*) FROM wishlist w WHERE w.product_id = p.id) as in_wishlists,
             (SELECT GROUP_CONCAT(r.comment) FROM reviews r WHERE r.product_id = p.id) as all_reviews
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN reviews rev ON p.id = rev.product_id
      WHERE p.name LIKE '%${term}%' 
         OR p.description LIKE '%${term}%'
         OR c.name LIKE '%${term}%'
         OR rev.comment LIKE '%${term}%'
      ORDER BY p.price DESC
    `;
    
    const results = await executeQuery(query);
    logDatabase('SEARCH', 'products', { term, resultsCount: results.length });
    logger.info(`🔍 Recherche "${term}": ${results.length} résultats`);
    
    res.json(results);
  } catch (error) {
    logApiError(error, req, { context: 'search_products', term: req.params.term });
    res.status(500).json({ error: error.message });
  }
});

// ============ ROUTES PANIER ============

// Ajouter au panier
router.post('/cart/add', async (req, res) => {
  try {
    const { productId, quantity, userId } = req.body;
    logger.info(`🛒 Ajout au panier - User: ${userId}, Produit: ${productId}, Qté: ${quantity}`);
    
    const query = `INSERT INTO cart_items (user_id, product_id, quantity, created_at) 
                   VALUES (${userId}, ${productId}, ${quantity}, NOW())
                   ON DUPLICATE KEY UPDATE quantity = quantity + ${quantity}`;
    
    await executeQuery(query);
    logDatabase('INSERT', 'cart_items', { userId, productId, quantity });
    logAudit('CART_ADD', userId, { productId, quantity });
    
    res.json({ success: true, message: 'Produit ajouté au panier' });
  } catch (error) {
    logApiError(error, req, { context: 'cart_add' });
    res.status(500).json({ error: error.message });
  }
});

// Récupérer le panier d'un utilisateur
router.get('/cart/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    logger.debug(`🛒 Récupération panier - User: ${userId}`);
    
    const query = `
      SELECT ci.*, p.name, p.price, p.image_url, p.stock_quantity
      FROM cart_items ci
      JOIN products p ON ci.product_id = p.id
      WHERE ci.user_id = ${userId}
    `;
    
    const cartItems = await executeQuery(query);
    logDatabase('SELECT', 'cart_items', { userId, itemsCount: cartItems.length });
    
    res.json(cartItems);
  } catch (error) {
    logApiError(error, req, { context: 'cart_get', userId: req.params.userId });
    res.status(500).json({ error: error.message });
  }
});

// Supprimer du panier
router.delete('/cart/:cartId', async (req, res) => {
  try {
    const { cartId } = req.params;
    logger.info(`🛒 Suppression du panier - CartItem: ${cartId}`);
    
    const query = `DELETE FROM cart_items WHERE id = ${cartId}`;
    await executeQuery(query);
    logDatabase('DELETE', 'cart_items', { cartId });
    
    res.json({ success: true, message: 'Produit retiré du panier' });
  } catch (error) {
    logApiError(error, req, { context: 'cart_delete', cartId: req.params.cartId });
    res.status(500).json({ error: error.message });
  }
});

// Mettre à jour la quantité dans le panier
router.put('/cart/:cartId', async (req, res) => {
  try {
    const { cartId } = req.params;
    const { quantity } = req.body;
    logger.info(`🛒 Mise à jour panier - CartItem: ${cartId}, Nouvelle Qté: ${quantity}`);
    
    const query = `UPDATE cart_items SET quantity = ${quantity} WHERE id = ${cartId}`;
    await executeQuery(query);
    logDatabase('UPDATE', 'cart_items', { cartId, quantity });
    
    res.json({ success: true, message: 'Quantité mise à jour' });
  } catch (error) {
    logApiError(error, req, { context: 'cart_update', cartId: req.params.cartId });
    res.status(500).json({ error: error.message });
  }
});

// ============ ROUTES WISHLIST ============

// Ajouter à la wishlist
router.post('/wishlist/add', async (req, res) => {
  try {
    const { productId, userId } = req.body;
    logger.info(`❤️ Ajout wishlist - User: ${userId}, Produit: ${productId}`);
    
    const query = `INSERT INTO wishlist (user_id, product_id, created_at) 
                   VALUES (${userId}, ${productId}, NOW())`;
    
    await executeQuery(query);
    logDatabase('INSERT', 'wishlist', { userId, productId });
    logAudit('WISHLIST_ADD', userId, { productId });
    
    res.json({ success: true, message: 'Produit ajouté à la wishlist' });
  } catch (error) {
    logApiError(error, req, { context: 'wishlist_add' });
    res.status(500).json({ error: error.message });
  }
});

// Récupérer la wishlist
router.get('/wishlist/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    logger.debug(`❤️ Récupération wishlist - User: ${userId}`);
    
    const query = `
      SELECT w.*, p.name, p.price, p.image_url, p.description
      FROM wishlist w
      JOIN products p ON w.product_id = p.id
      WHERE w.user_id = ${userId}
    `;
    
    const wishlistItems = await executeQuery(query);
    logDatabase('SELECT', 'wishlist', { userId, itemsCount: wishlistItems.length });
    
    res.json(wishlistItems);
  } catch (error) {
    logApiError(error, req, { context: 'wishlist_get', userId: req.params.userId });
    res.status(500).json({ error: error.message });
  }
});

// Supprimer de la wishlist
router.delete('/wishlist/:wishlistId', async (req, res) => {
  try {
    const { wishlistId } = req.params;
    logger.info(`❤️ Suppression wishlist - Item: ${wishlistId}`);
    
    const query = `DELETE FROM wishlist WHERE id = ${wishlistId}`;
    await executeQuery(query);
    logDatabase('DELETE', 'wishlist', { wishlistId });
    
    res.json({ success: true, message: 'Produit retiré de la wishlist' });
  } catch (error) {
    logApiError(error, req, { context: 'wishlist_delete', wishlistId: req.params.wishlistId });
    res.status(500).json({ error: error.message });
  }
});

// ============ ROUTES PRODUITS ============

// Récupérer tous les produits
router.get('/', async (req, res) => {
  try {
    const { category, search, limit, offset } = req.query;
    logger.info('📦 Récupération des produits', { category, search, limit, offset });
    
    let query = `
      SELECT p.*, c.name as category_name, 
             (SELECT AVG(rating) FROM reviews r WHERE r.product_id = p.id) as avg_rating,
             (SELECT COUNT(*) FROM reviews r WHERE r.product_id = p.id) as review_count,
             (SELECT GROUP_CONCAT(DISTINCT t.name) FROM product_tags pt 
              JOIN tags t ON pt.tag_id = t.id WHERE pt.product_id = p.id) as tags
      FROM products p 
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN reviews rev ON p.id = rev.product_id
    `;
    
    if (category) {
      query += ` WHERE c.name = '${category}'`;
    }
    
    if (search) {
      query += category ? ` AND` : ` WHERE`;
      query += ` (p.name LIKE '%${search}%' OR p.description LIKE '%${search}%')`;
    }
    
    query += ` GROUP BY p.id ORDER BY p.created_at DESC`;
    
    if (limit) {
      query += ` LIMIT ${limit}`;
    }
    
    if (offset) {
      query += ` OFFSET ${offset}`;
    }
    
    const products = await executeQuery(query);
    logDatabase('SELECT', 'products', { 
      filters: { category, search, limit, offset },
      count: products.length 
    });
    logger.info(`📦 ${products.length} produits récupérés`);
    
    res.json(products);
  } catch (error) {
    logApiError(error, req, { context: 'products_list' });
    res.status(500).json({ error: error.message });
  }
});

// Récupérer un produit par ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    logger.debug(`📦 Récupération produit ID: ${id}`);
    
    const query = `SELECT * FROM products WHERE id = ${id}`;
    const product = await executeQuery(query);
    
    if (product.length > 0) {
      logDatabase('SELECT', 'products', { productId: id, found: true });
      res.json(product[0]);
    } else {
      logger.warn(`📦 Produit non trouvé: ${id}`);
      res.status(404).json({ message: 'Produit non trouvé' });
    }
  } catch (error) {
    logApiError(error, req, { context: 'product_get', productId: req.params.id });
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;