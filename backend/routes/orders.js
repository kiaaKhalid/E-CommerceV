const express = require('express');
const { executeQuery } = require('../config/database');
const { logger, logDatabase, logApiError, logAudit, logTransaction } = require('../config/logger');
const router = express.Router();

// Créer une commande
router.post('/create', async (req, res) => {
  try {
    const { userId, items, shippingAddress, totalAmount } = req.body;
    
    logger.info(`🛍️ Création commande - User: ${userId}, Total: ${totalAmount} DH`);
    
    // Créer la commande principale
    const orderQuery = `INSERT INTO orders (user_id, status, total_amount, shipping_address, created_at) 
                        VALUES (${userId}, 'pending', ${totalAmount}, '${shippingAddress}', NOW())`;
    
    const orderResult = await executeQuery(orderQuery);
    const orderId = orderResult.insertId;
    
    logDatabase('INSERT', 'orders', { orderId, userId, totalAmount });
    
    // Ajouter les items de la commande
    for (const item of items) {
      const itemQuery = `INSERT INTO order_items (order_id, product_id, quantity, price) 
                         VALUES (${orderId}, ${item.productId}, ${item.quantity}, ${item.price})`;
      await executeQuery(itemQuery);
      logDatabase('INSERT', 'order_items', { orderId, productId: item.productId, quantity: item.quantity });
    }
    
    // Vider le panier
    const clearCartQuery = `DELETE FROM cart_items WHERE user_id = ${userId}`;
    await executeQuery(clearCartQuery);
    logDatabase('DELETE', 'cart_items', { userId, reason: 'order_completed' });
    
    // Log de la transaction
    logTransaction('ORDER_CREATED', orderId, userId, totalAmount, 'pending', {
      itemsCount: items.length,
      shippingAddress
    });
    
    logAudit('ORDER_CREATED', userId, { orderId, totalAmount, itemsCount: items.length });
    logger.info(`✅ Commande #${orderId} créée avec succès - ${items.length} articles - ${totalAmount} DH`);
    
    res.json({
      success: true,
      message: 'Commande créée avec succès',
      orderId: orderId
    });
  } catch (error) {
    logApiError(error, req, { context: 'order_create' });
    res.status(500).json({ error: error.message });
  }
});

// Récupérer toutes les commandes
router.get('/', async (req, res) => {
  try {
    logger.debug('📋 Récupération de toutes les commandes');
    
    const query = `
      SELECT o.*, u.name as user_name, u.email as user_email,
             (SELECT COUNT(*) FROM order_items oi WHERE oi.order_id = o.id) as item_count
      FROM orders o
      LEFT JOIN users u ON o.user_id = u.id
      ORDER BY o.created_at DESC
    `;
    
    const orders = await executeQuery(query);
    logDatabase('SELECT', 'orders', { count: orders.length });
    
    res.json(orders);
  } catch (error) {
    logApiError(error, req, { context: 'orders_list' });
    res.status(500).json({ error: error.message });
  }
});

// ============ ROUTES SPÉCIFIQUES (AVANT /:orderId) ============

// Mettre à jour le statut d'une commande
router.put('/:orderId/status', async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;
    
    logger.info(`📦 Mise à jour statut commande #${orderId} -> ${status}`);
    
    const query = `UPDATE orders SET status = '${status}' WHERE id = ${orderId}`;
    await executeQuery(query);
    
    logDatabase('UPDATE', 'orders', { orderId, newStatus: status });
    logTransaction('ORDER_STATUS_UPDATED', orderId, null, null, status, { previousStatus: 'unknown' });
    logAudit('ORDER_STATUS_CHANGED', req.session?.userId || 'system', { orderId, newStatus: status });
    
    logger.info(`✅ Statut commande #${orderId} mis à jour: ${status}`);
    
    res.json({ success: true, message: 'Statut de commande mis à jour' });
  } catch (error) {
    logApiError(error, req, { context: 'order_status_update', orderId: req.params.orderId });
    res.status(500).json({ error: error.message });
  }
});

// ============ ROUTES GÉNÉRIQUES (À LA FIN) ============

// Récupérer une commande par ID
router.get('/:orderId', async (req, res) => {
  try {
    const { orderId } = req.params;
    logger.debug(`📋 Récupération commande #${orderId}`);
    
    const orderQuery = `
      SELECT o.*, u.name as user_name, u.email as user_email
      FROM orders o
      LEFT JOIN users u ON o.user_id = u.id
      WHERE o.id = ${orderId}
    `;
    
    const itemsQuery = `
      SELECT oi.*, p.name as product_name, p.image_url
      FROM order_items oi
      LEFT JOIN products p ON oi.product_id = p.id
      WHERE oi.order_id = ${orderId}
    `;
    
    const order = await executeQuery(orderQuery);
    const items = await executeQuery(itemsQuery);
    
    if (order.length > 0) {
      logDatabase('SELECT', 'orders', { orderId, found: true, itemsCount: items.length });
      res.json({
        order: order[0],
        items: items
      });
    } else {
      logger.warn(`📋 Commande #${orderId} non trouvée`);
      res.status(404).json({ message: 'Commande non trouvée' });
    }
  } catch (error) {
    logApiError(error, req, { context: 'order_get', orderId: req.params.orderId });
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;