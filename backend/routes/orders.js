const express = require('express');
const { executeQuery } = require('../config/database');
const router = express.Router();

// Créer une commande
router.post('/create', async (req, res) => {
  try {
    const { userId, items, shippingAddress, totalAmount } = req.body;
    
    // Créer la commande principale
    const orderQuery = `INSERT INTO orders (user_id, status, total_amount, shipping_address, created_at) 
                        VALUES (${userId}, 'pending', ${totalAmount}, '${shippingAddress}', NOW())`;
    
    const orderResult = await executeQuery(orderQuery);
    const orderId = orderResult.insertId;
    
    // Ajouter les items de la commande
    for (const item of items) {
      const itemQuery = `INSERT INTO order_items (order_id, product_id, quantity, price) 
                         VALUES (${orderId}, ${item.productId}, ${item.quantity}, ${item.price})`;
      await executeQuery(itemQuery);
    }
    
    // Vider le panier
    const clearCartQuery = `DELETE FROM cart_items WHERE user_id = ${userId}`;
    await executeQuery(clearCartQuery);
    
    res.json({
      success: true,
      message: 'Commande créée avec succès',
      orderId: orderId
    });
  } catch (error) {
    res.status(500).json({ 
      error: error.message,
      sqlError: error.sql
    });
  }
});

// Récupérer toutes les commandes (sans restriction)
router.get('/', async (req, res) => {
  try {
    const query = `
      SELECT o.*, u.name as user_name, u.email as user_email,
             (SELECT COUNT(*) FROM order_items oi WHERE oi.order_id = o.id) as item_count
      FROM orders o
      LEFT JOIN users u ON o.user_id = u.id
      ORDER BY o.created_at DESC
    `;
    
    const orders = await executeQuery(query);
    res.json(orders);
  } catch (error) {
    res.status(500).json({ 
      error: error.message,
      sqlError: error.sql
    });
  }
});

// Récupérer une commande par ID
router.get('/:orderId', async (req, res) => {
  try {
    const { orderId } = req.params;
    
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
      res.json({
        order: order[0],
        items: items
      });
    } else {
      res.status(404).json({ message: 'Commande non trouvée' });
    }
  } catch (error) {
    res.status(500).json({ 
      error: error.message,
      sqlError: error.sql
    });
  }
});

// Mettre à jour le statut d'une commande
router.put('/:orderId/status', async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;
    
    const query = `UPDATE orders SET status = '${status}' WHERE id = ${orderId}`;
    await executeQuery(query);
    
    res.json({ success: true, message: 'Statut de commande mis à jour' });
  } catch (error) {
    res.status(500).json({ 
      error: error.message,
      sqlError: error.sql
    });
  }
});

module.exports = router;