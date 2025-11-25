const mysql = require('mysql');

// ⚠️ CONFIGURATION VULNÉRABLE POUR L'ENSEIGNEMENT DE LA CYBERSÉCURITÉ ⚠️
// Cette configuration est délibérément non sécurisée pour des fins pédagogiques
const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'ecommerce_db',
  multipleStatements: true, // VULNÉRABILITÉ : Permet les requêtes multiples pour les injections
  acquireTimeout: 60000,
  timeout: 60000,
  charset: 'utf8mb4',
  timezone: 'local'
};

// Connexion simple pour démonstrations
const db = mysql.createConnection(dbConfig);

db.connect((err) => {
  if (err) {
    console.error('❌ Erreur de connexion à la base de données:', err);
    return;
  }
  console.log('🎓 Connecté à la base de données MySQL - MODE ÉDUCATIF VULNÉRABLE');
  console.log('⚠️  ATTENTION: Cette configuration est vulnérable aux injections SQL pour l\'enseignement !');
});

// Fonction executeQuery pour exécuter les requêtes SQL
const executeQuery = (query, params = []) => {
  return new Promise((resolve, reject) => {
    db.query(query, params, (error, results) => {
      if (error) {
        console.error('Erreur SQL:', error);
        reject(error);
      } else {
        resolve(results);
      }
    });
  });
};

// Fonction pour analyser les injections SQL (éducative)
const demonstrateInjection = (email, password) => {
  console.log('\n🎓 === ANALYSE D\'INJECTION SQL POUR ÉTUDIANTS ===');
  console.log('📧 Email analysé:', email);
  console.log('🔑 Mot de passe analysé:', password);
  
  // Patterns d'injection SQL à détecter
  const injectionPatterns = [
    { pattern: /'/gi, type: 'Guillemets simples', description: 'Tentative d\'échapper la chaîne SQL' },
    { pattern: /(or\s+(1\s*=\s*1|'1'\s*=\s*'1'))/gi, type: 'OR 1=1', description: 'Condition toujours vraie pour contourner l\'authentification' },
    { pattern: /(union\s+select)/gi, type: 'UNION SELECT', description: 'Tentative d\'extraire des données supplémentaires' },
    { pattern: /(--)/gi, type: 'Commentaires SQL', description: 'Commentaire pour ignorer le reste de la requête' },
    { pattern: /(;)/gi, type: 'Séparateur de requêtes', description: 'Tentative d\'exécuter plusieurs requêtes' },
    { pattern: /(drop|delete|insert|update)/gi, type: 'Commandes destructives', description: 'Tentative de modification/suppression de données' }
  ];
  
  let isInjectionAttempt = false;
  let detectedPatterns = [];
  
  const combinedInput = `${email} ${password}`;
  
  injectionPatterns.forEach(({ pattern, type, description }) => {
    if (pattern.test(combinedInput)) {
      isInjectionAttempt = true;
      detectedPatterns.push({ type, description, pattern: pattern.toString() });
    }
  });
  
  if (isInjectionAttempt) {
    console.log('🚨 INJECTION SQL DÉTECTÉE !');
    console.log('🎯 Patterns trouvés:');
    detectedPatterns.forEach(p => {
      console.log(`   - ${p.type}: ${p.description}`);
    });
    console.log('📚 Excellent exemple pour démonstration !');
  } else {
    console.log('✅ Connexion normale détectée - Pas d\'injection');
  }
  
  return { isInjectionAttempt, detectedPatterns };
};

// Fonction pour créer des exemples d'injection pour les étudiants
const getEducationalExamples = () => {
  return {
    basic_bypass: {
      email: "admin' OR '1'='1' -- ",
      password: "anything",
      explanation: "Contourne l'authentification en rendant la condition toujours vraie"
    },
    union_attack: {
      email: "admin' UNION SELECT 1,2,3,4,5 -- ",
      password: "test",
      explanation: "Tente d'extraire des données supplémentaires de la base"
    },
    comment_attack: {
      email: "admin' -- ",
      password: "ignored",
      explanation: "Ignore la vérification du mot de passe avec un commentaire"
    },
    always_true: {
      email: "' OR 'a'='a",
      password: "anything",
      explanation: "Condition toujours vraie pour contourner l'authentification"
    },
    multiple_queries: {
      email: "admin'; DROP TABLE users; -- ",
      password: "test",
      explanation: "Tentative d'exécuter une requête destructive (dangereux !)"
    }
  };
};

module.exports = { 
  db,
  executeQuery,
  demonstrateInjection,
  getEducationalExamples
};