const express = require('express');
const multer = require('multer');
const { executeQuery } = require('../config/database');
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
    
    // Ajout de produit sans vérification admin
    const query = `INSERT INTO products (name, description, price, stock_quantity, category_id, sku, image_url, created_at) 
                   VALUES ('${name}', '${description}', ${price}, ${stock_quantity}, ${category_id}, '${sku}', '${image_url}', NOW())`;
    
    const result = await executeQuery(query);
    
    res.json({
      success: true,
      message: 'Produit ajouté avec succès',
      productId: result.insertId
    });
  } catch (error) {
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
    
    const query = `UPDATE products SET name='${name}', description='${description}', 
                   price=${price}, stock_quantity=${stock_quantity}, category_id=${category_id} 
                   WHERE id=${id}`;
    
    await executeQuery(query);
    res.json({ success: true, message: 'Produit modifié avec succès' });
  } catch (error) {
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
    
    const query = `DELETE FROM products WHERE id = ${id}`;
    await executeQuery(query);
    
    res.json({ success: true, message: 'Produit supprimé avec succès' });
  } catch (error) {
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
    
    // Création d'utilisateur admin sans authentification
    const query = `INSERT INTO users (name, email, password, phone, address, role, created_at) 
                   VALUES ('${name}', '${email}', '${password}', '${phone}', '${address}', '${role}', NOW())`;
    
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

// Gestion des catégories - Ajouter
router.post('/add-category', async (req, res) => {
  try {
    const { name, description } = req.body;
    
    const query = `INSERT INTO categories (name, description, created_at) 
                   VALUES ('${name}', '${description}', NOW())`;
    
    const result = await executeQuery(query);
    
    res.json({
      success: true,
      message: 'Catégorie ajoutée avec succès',
      categoryId: result.insertId
    });
  } catch (error) {
    res.status(500).json({ 
      error: error.message,
      sqlError: error.sql
    });
  }
});

// Récupérer toutes les catégories
router.get('/categories', async (req, res) => {
  try {
    const query = `SELECT * FROM categories ORDER BY name`;
    const categories = await executeQuery(query);
    res.json(categories);
  } catch (error) {
    res.status(500).json({ 
      error: error.message,
      sqlError: error.sql
    });
  }
});

// Dashboard admin avec statistiques complètes
router.get('/dashboard', async (req, res) => {
  try {
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
    
    res.json(results);
  } catch (error) {
    res.status(500).json({ 
      error: error.message,
      sqlError: error.sql
    });
  }
});

// Récupérer tous les utilisateurs pour l'admin
router.get('/users', async (req, res) => {
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

// Modifier le rôle d'un utilisateur
router.put('/user-role/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { role } = req.body;
    
    const query = `UPDATE users SET role = '${role}' WHERE id = ${userId}`;
    await executeQuery(query);
    
    res.json({ success: true, message: 'Rôle utilisateur modifié' });
  } catch (error) {
    res.status(500).json({ 
      error: error.message,
      sqlError: error.sql
    });
  }
});

module.exports = router;