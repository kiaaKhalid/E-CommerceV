const express = require('express');
const crypto = require('crypto');
const { db, demonstrateInjection, getEducationalExamples } = require('../config/database');
const router = express.Router();

// 🎓 VERSION ÉDUCATIVE VULNÉRABLE POUR L'ENSEIGNEMENT DE LA CYBERSÉCURITÉ 🎓
// ⚠️ CETTE VERSION EST DÉLIBÉRÉMENT NON SÉCURISÉE POUR DES FINS PÉDAGOGIQUES ⚠️

// Login DÉLIBÉRÉMENT VULNÉRABLE pour démonstration pédagogique
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    console.log('\n🎓 === DÉMONSTRATION D\'INJECTION SQL - COURS DE CYBERSÉCURITÉ ===');
    console.log('📧 Email reçu:', email);
    console.log('🔑 Mot de passe reçu:', password);
    
    // Analyse éducative de la tentative
    const analysis = demonstrateInjection(email, password);
    
    // Construction DÉLIBÉRÉMENT VULNÉRABLE de la requête SQL
    // Méthode dangereuse : concaténation directe des paramètres utilisateur
    
    // Nettoyer légèrement pour éviter les erreurs de syntaxe tout en gardant la vulnérabilité
    let cleanEmail = email;
    let cleanPassword = password;
    
    // Si l'injection contient des commentaires SQL, nettoyer pour éviter les erreurs de syntaxe
    if (email.includes('--')) {
      // Garder tout avant -- et ajouter un espace pour fermer proprement
      cleanEmail = email.split('--')[0] + '-- ';
      cleanPassword = ''; // Ignorer le mot de passe après le commentaire
    }
    
    const vulnerableQuery = cleanPassword === '' ? 
      `SELECT * FROM users WHERE email = '${cleanEmail}'` :
      `SELECT * FROM users WHERE email = '${cleanEmail}' AND password = '${cleanPassword}'`;
    
    console.log('🔓 Requête SQL vulnérable générée:', vulnerableQuery);
    
    // Exécuter la requête vulnérable
    db.query(vulnerableQuery, (error, results) => {
      if (error) {
        console.error('💥 ERREUR SQL ÉDUCATIVE:');
        console.error('   Message:', error.message);
        console.error('   Code:', error.code);
        console.error('   Requête:', vulnerableQuery);
        
        // Analyser l'erreur pour l'enseignement
        let teachingNote = '';
        let suggestions = [];
        
        if (error.message.includes('syntax')) {
          teachingNote = 'LEÇON: Erreur de syntaxe SQL. L\'injection est mal formée - les guillemets ne sont pas équilibrés.';
          suggestions = [
            "admin' OR '1'='1' --",
            "admin' OR 1=1 --",
            "' OR 'a'='a' --",
            "test@example.com' OR '1'='1' --"
          ];
        }
        
        return res.status(500).json({
          success: false,
          message: '❌ Injection SQL échouée - Erreur de syntaxe',
          educational_analysis: {
            injection_detected: analysis.isInjectionAttempt,
            patterns_found: analysis.detectedPatterns,
            vulnerable_query: vulnerableQuery,
            error_details: {
              message: error.message,
              code: error.code,
              type: 'SYNTAX_ERROR'
            },
            teaching_note: teachingNote,
            suggested_payloads: suggestions,
            lesson: 'Cette erreur montre l\'importance de la syntaxe correcte dans les injections SQL'
          }
        });
      }
      
      // Analyse des résultats pour l'enseignement
      console.log('✅ Requête SQL exécutée avec succès');
      console.log('📊 Nombre de résultats:', results.length);
      
      if (results.length > 0) {
        const user = results[0];
        
        console.log('🎯 UTILISATEUR TROUVÉ:');
        console.log('   ID:', user.id);
        console.log('   Email:', user.email);
        console.log('   Name:', user.name);
        console.log('   Role:', user.role);
        
        if (analysis.isInjectionAttempt) {
          console.log('🚨 *** INJECTION SQL RÉUSSIE ! ***');
          console.log('🎓 DÉMONSTRATION: L\'attaquant a contourné l\'authentification');
        } else {
          console.log('✅ Connexion légitime avec identifiants valides');
        }
        
        // Créer la session utilisateur
        req.session.userId = user.id;
        req.session.user = user;
        req.session.isAdmin = user.role === 'admin';
        
        res.json({
          success: true,
          message: analysis.isInjectionAttempt ? 
            '🚨 INJECTION SQL RÉUSSIE ! Accès non autorisé accordé.' : 
            '✅ Connexion normale réussie',
          user: {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role
          },
          educational_analysis: {
            injection_detected: analysis.isInjectionAttempt,
            attack_successful: true,
            patterns_found: analysis.detectedPatterns,
            vulnerable_query: vulnerableQuery,
            security_impact: analysis.isInjectionAttempt ? 
              '🔴 CRITIQUE: Authentification contournée via injection SQL' : 
              '🟢 NORMAL: Authentification légitime',
            lesson: analysis.isInjectionAttempt ? 
              'Cette vulnérabilité permet à un attaquant d\'accéder au système sans connaître les identifiants' : 
              'Connexion normale avec des identifiants valides'
          }
        });
        
      } else {
        console.log('❌ Aucun utilisateur trouvé avec cette requête');
        
        res.status(401).json({ 
          success: false, 
          message: analysis.isInjectionAttempt ? 
            'Injection SQL détectée mais aucun résultat retourné' : 
            'Email ou mot de passe incorrect',
          educational_analysis: {
            injection_detected: analysis.isInjectionAttempt,
            attack_successful: false,
            patterns_found: analysis.detectedPatterns,
            vulnerable_query: vulnerableQuery,
            lesson: analysis.isInjectionAttempt ? 
              'L\'injection a été exécutée mais n\'a pas retourné de données utilisateur' : 
              'Tentative de connexion échouée avec des identifiants incorrects',
            note: 'Essayez avec des identifiants valides ou une injection SQL différente'
          }
        });
      }
    });
    
  } catch (error) {
    console.error('💥 Erreur générale:', error);
    res.status(500).json({ 
      success: false,
      message: 'Erreur interne du serveur',
      error: error.message
    });
  }
});

// Route pour obtenir des exemples d'injection SQL pour les étudiants
router.get('/educational-examples', (req, res) => {
  const examples = getEducationalExamples();
  
  res.json({
    message: '🎓 Exemples d\'injection SQL pour l\'enseignement',
    warning: '⚠️ À utiliser uniquement dans un environnement d\'apprentissage contrôlé',
    examples: examples,
    test_account: {
      email: 'test@example.com',
      password: 'password123',
      note: 'Compte de test pour connexion normale'
    },
    instructions: {
      '1': 'Utilisez les exemples ci-dessus dans le champ email',
      '2': 'Mettez n\'importe quoi dans le champ mot de passe',
      '3': 'Observez comment l\'injection contourne l\'authentification',
      '4': 'Analysez la réponse JSON pour comprendre l\'impact'
    }
  });
});

// Register simplifié (version normale)
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