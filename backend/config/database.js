const mysql = require('mysql');

// Configuration de la base de données
const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'ecommerce_db',
  multipleStatements: true,
  acquireTimeout: 60000,
  timeout: 60000,
  charset: 'utf8mb4',
  timezone: 'local'
};

// Connexion à la base de données
const db = mysql.createConnection(dbConfig);

db.connect((err) => {
  if (err) {
    console.error('Erreur de connexion à la base de données:', err);
    return;
  }
  console.log('Connecté à la base de données MySQL');
});

// Fonction executeQuery pour exécuter les requêtes SQL
const executeQuery = (query, params = []) => {
  return new Promise((resolve, reject) => {
    db.query(query, params, (error, results) => {
      if (error) {
        reject(error);
      } else {
        resolve(results);
      }
    });
  });
};

module.exports = { 
  db,
  executeQuery
};