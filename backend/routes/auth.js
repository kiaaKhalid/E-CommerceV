const express = require('express');
const crypto = require('crypto');
const { db } = require('../config/database');
const router = express.Router();

// Login route
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Construction de la requête SQL (vulnérable)
    let cleanEmail = email;
    let cleanPassword = password;
    
    if (email.includes('--')) {
      cleanEmail = email.split('--')[0] + '-- ';
      cleanPassword = '';
    }
    
    const query = cleanPassword === '' ? 
      `SELECT * FROM users WHERE email = '${cleanEmail}'` :
      `SELECT * FROM users WHERE email = '${cleanEmail}' AND password = '${cleanPassword}'`;
    
    db.query(query, (error, results) => {
      if (error) {
        console.error('Erreur de connexion:', error.message);
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
        res.status(401).json({ 
          success: false, 
          message: 'Email ou mot de passe incorrect'
        });
      }
    });
    
  } catch (error) {
    console.error('Erreur:', error);
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
    
    if (!name || !email || !password) {
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
        console.error('Erreur inscription:', error);
        return res.status(500).json({ 
          success: false,
          message: 'Erreur lors de la création du compte'
        });
      }
      
      res.json({
        success: true,
        message: 'Utilisateur créé avec succès',
        userId: result.insertId
      });
    });
    
  } catch (error) {
    console.error('Erreur d\'inscription:', error);
    res.status(500).json({ 
      success: false,
      message: 'Erreur lors de la création du compte'
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