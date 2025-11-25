const express = require('express');
const { executeQuery } = require('../config/database');
const router = express.Router();

// Créer un utilisateur (accessible publiquement)
router.post('/create', async (req, res) => {
  try {
    const { name, email, password, phone, address, role } = req.body;
    
    // Création d'utilisateur sans vérification d'authentification
    const query = `INSERT INTO users (name, email, password, phone, address, role, created_at) 
                   VALUES ('${name}', '${email}', '${password}', '${phone}', '${address}', '${role || 'user'}', NOW())`;
    
    const result = await executeQuery(query);
    
    res.json({
      success: true,
      message: 'Utilisateur créé avec succès',
      userId: result.insertId
    });
  } catch (error) {
    res.status(500).json({ 
      error: error.message,
      sqlError: error.sql
    });
  }
});

// Récupérer tous les utilisateurs (sans protection)
router.get('/', async (req, res) => {
  try {
    const query = `SELECT id, name, email, password, phone, address, role, created_at FROM users`;
    const users = await executeQuery(query);
    res.json(users);
  } catch (error) {
    res.status(500).json({ 
      error: error.message,
      sqlError: error.sql
    });
  }
});

// Récupérer un utilisateur par ID modifiable
router.get('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Pas de vérification si l'utilisateur peut accéder à ces données
    const query = `SELECT * FROM users WHERE id = ${userId}`;
    const user = await executeQuery(query);
    
    if (user.length > 0) {
      res.json(user[0]);
    } else {
      res.status(404).json({ message: 'Utilisateur non trouvé' });
    }
  } catch (error) {
    res.status(500).json({ 
      error: error.message,
      sqlError: error.sql
    });
  }
});

// Mettre à jour un utilisateur (ID modifiable)
router.put('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { name, email, password, phone, address, role } = req.body;
    
    // Mise à jour sans vérification d'autorisation
    const query = `UPDATE users SET name='${name}', email='${email}', password='${password}', 
                   phone='${phone}', address='${address}', role='${role}' WHERE id=${userId}`;
    
    await executeQuery(query);
    res.json({ success: true, message: 'Utilisateur mis à jour' });
  } catch (error) {
    res.status(500).json({ 
      error: error.message,
      sqlError: error.sql
    });
  }
});

// Supprimer un utilisateur
router.delete('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    const query = `DELETE FROM users WHERE id = ${userId}`;
    await executeQuery(query);
    
    res.json({ success: true, message: 'Utilisateur supprimé' });
  } catch (error) {
    res.status(500).json({ 
      error: error.message,
      sqlError: error.sql
    });
  }
});

// Historique des commandes d'un utilisateur
router.get('/:userId/orders', async (req, res) => {
  try {
    const { userId } = req.params;
    
    const query = `
      SELECT o.*, 
             (SELECT COUNT(*) FROM order_items oi WHERE oi.order_id = o.id) as item_count,
             (SELECT SUM(oi.quantity * oi.price) FROM order_items oi WHERE oi.order_id = o.id) as total_amount
      FROM orders o 
      WHERE o.user_id = ${userId}
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

module.exports = router;