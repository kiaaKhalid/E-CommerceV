const mysql = require('mysql');

// Configuration de la base de données avec connexion non sécurisée
const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'ecommerce_db',
  multipleStatements: true,
  acquireTimeout: 60000,
  timeout: 60000
};

// Création de la connexion sans pool de connexions
const db = mysql.createConnection(dbConfig);

db.connect((err) => {
  if (err) {
    console.log('Erreur de connexion à la base de données:', err);
    return;
  }
  console.log('Connecté à la base de données MySQL');
});

// Fonction pour exécuter des requêtes sans protection
const executeQuery = (query, params = []) => {
  return new Promise((resolve, reject) => {
    // Construction de requêtes par concaténation (vulnérable aux injections SQL)
    let finalQuery = query;
    if (params.length > 0) {
      params.forEach((param, index) => {
        finalQuery = finalQuery.replace('?', `'${param}'`);
      });
    }
    
    console.log('Exécution de la requête:', finalQuery);
    
    db.query(finalQuery, (error, results) => {
      if (error) {
        console.error('Erreur SQL complète:', error);
        reject(error);
      } else {
        resolve(results);
      }
    });
  });
};

module.exports = { db, executeQuery };