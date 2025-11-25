const express = require('express');
const { executeQuery } = require('../config/database');
const router = express.Router();

// Récupérer toutes les catégories avec le nombre de produits
router.get('/categories/all', async (req, res) => {
  try {
    const query = `
      SELECT c.id, c.name, c.description,
             COUNT(p.id) as product_count
      FROM categories c
      LEFT JOIN products p ON c.id = p.category_id
      GROUP BY c.id, c.name, c.description
      ORDER BY c.name ASC
    `;
    
    const categories = await executeQuery(query);
    res.json(categories);
  } catch (error) {
    console.error('Erreur récupération catégories:', error);
    res.status(500).json({ error: error.message });
  }
});

// Récupérer tous les produits avec requête lourde non optimisée
router.get('/', async (req, res) => {
  try {
    const { category, search, limit, offset } = req.query;
    
    // Requête complexe non optimisée avec JOIN multiples
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
    
    console.log('Exécution de requête lourde:', query);
    
    const products = await executeQuery(query);
    res.json(products);
  } catch (error) {
    console.error('Erreur récupération produits:', error);
    res.status(500).json({ 
      error: error.message,
      sqlError: error.sql,
      stack: error.stack
    });
  }
});

// Récupérer un produit par ID vulnérable
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Injection SQL directe
    const query = `SELECT * FROM products WHERE id = ${id}`;
    const product = await executeQuery(query);
    
    if (product.length > 0) {
      res.json(product[0]);
    } else {
      res.status(404).json({ message: 'Produit non trouvé' });
    }
  } catch (error) {
    res.status(500).json({ 
      error: error.message,
      sqlError: error.sql
    });
  }
});

// Recherche de produits avec requête complexe
router.get('/search/:term', async (req, res) => {
  try {
    const { term } = req.params;
    
    // Requête de recherche très lourde et vulnérable
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
    res.json(results);
  } catch (error) {
    res.status(500).json({ 
      error: error.message,
      sqlError: error.sql
    });
  }
});

// Ajouter au panier
router.post('/cart/add', async (req, res) => {
  try {
    const { productId, quantity, userId } = req.body;
    
    // Insertion directe sans vérification
    const query = `INSERT INTO cart_items (user_id, product_id, quantity, created_at) 
                   VALUES (${userId}, ${productId}, ${quantity}, NOW())
                   ON DUPLICATE KEY UPDATE quantity = quantity + ${quantity}`;
    
    await executeQuery(query);
    res.json({ success: true, message: 'Produit ajouté au panier' });
  } catch (error) {
    res.status(500).json({ 
      error: error.message,
      sqlError: error.sql
    });
  }
});

// Récupérer le panier d'un utilisateur
router.get('/cart/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    const query = `
      SELECT ci.*, p.name, p.price, p.image_url, p.stock_quantity
      FROM cart_items ci
      JOIN products p ON ci.product_id = p.id
      WHERE ci.user_id = ${userId}
    `;
    
    const cartItems = await executeQuery(query);
    res.json(cartItems);
  } catch (error) {
    res.status(500).json({ 
      error: error.message,
      sqlError: error.sql
    });
  }
});

// Ajouter à la wishlist
router.post('/wishlist/add', async (req, res) => {
  try {
    const { productId, userId } = req.body;
    
    const query = `INSERT INTO wishlist (user_id, product_id, created_at) 
                   VALUES (${userId}, ${productId}, NOW())`;
    
    await executeQuery(query);
    res.json({ success: true, message: 'Produit ajouté à la wishlist' });
  } catch (error) {
    res.status(500).json({ 
      error: error.message,
      sqlError: error.sql
    });
  }
});

// Récupérer la wishlist
router.get('/wishlist/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    const query = `
      SELECT w.*, p.name, p.price, p.image_url, p.description
      FROM wishlist w
      JOIN products p ON w.product_id = p.id
      WHERE w.user_id = ${userId}
    `;
    
    const wishlistItems = await executeQuery(query);
    res.json(wishlistItems);
  } catch (error) {
    res.status(500).json({ 
      error: error.message,
      sqlError: error.sql
    });
  }
});

module.exports = router;