const express = require('express');
const crypto = require('crypto');
const { executeQuery } = require('../config/database');
const router = express.Router();

// Login avec vulnérabilités
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Requête SQL vulnérable aux injections
    const query = `SELECT * FROM users WHERE email = '${email}' AND password = '${password}'`;
    
    console.log('Tentative de connexion:', { email, password });
    
    const users = await executeQuery(query);
    
    if (users.length > 0) {
      const user = users[0];
      req.session.userId = user.id;
      req.session.user = user;
      req.session.isAdmin = user.role === 'admin';
      
      res.json({
        success: true,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role
        }
      });
    } else {
      res.status(401).json({ success: false, message: 'Email ou mot de passe incorrect' });
    }
  } catch (error) {
    console.error('Erreur de connexion:', error);
    res.status(500).json({ 
      error: error.message,
      sqlError: error.sql,
      details: error
    });
  }
});

// Register avec mot de passe en clair
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, phone, address } = req.body;
    
    // Stockage du mot de passe en clair
    const query = `INSERT INTO users (name, email, password, phone, address, role, created_at) 
                   VALUES ('${name}', '${email}', '${password}', '${phone}', '${address}', 'user', NOW())`;
    
    const result = await executeQuery(query);
    
    res.json({
      success: true,
      message: 'Utilisateur créé avec succès',
      userId: result.insertId
    });
  } catch (error) {
    console.error('Erreur d\'inscription:', error);
    res.status(500).json({ 
      error: error.message,
      sqlError: error.sql 
    });
  }
});

// Logout
router.post('/logout', (req, res) => {
  req.session.destroy();
  res.json({ success: true, message: 'Déconnecté avec succès' });
});

// Vérification de session
router.get('/check', (req, res) => {
  if (req.session.userId) {
    res.json({
      authenticated: true,
      user: req.session.user
    });
  } else {
    res.json({ authenticated: false });
  }
});

module.exports = router;