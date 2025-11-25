const mysql = require('mysql');

// Configuration de la base de données
const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: '',
  multipleStatements: true
};

const db = mysql.createConnection(dbConfig);

// Script d'initialisation de la base de données
const initializeDatabase = async () => {
  console.log('Initialisation de la base de données...');
  
  try {
    // Créer la base de données
    await executeQuery('CREATE DATABASE IF NOT EXISTS ecommerce_db');
    await executeQuery('USE ecommerce_db');
    
    // Créer les tables
    await createTables();
    
    // Insérer les données de test
    await insertTestData();
    
    console.log('Base de données initialisée avec succès!');
    process.exit(0);
  } catch (error) {
    console.error('Erreur lors de l\'initialisation:', error);
    process.exit(1);
  }
};

const executeQuery = (query) => {
  return new Promise((resolve, reject) => {
    db.query(query, (error, results) => {
      if (error) {
        reject(error);
      } else {
        resolve(results);
      }
    });
  });
};

// Fonction pour échapper les caractères spéciaux
const escapeString = (str) => {
  return str.replace(/'/g, "\\'").replace(/"/g, '\\"');
};

const createTables = async () => {
  console.log('Création des tables...');
  
  const tableQueries = [
    // Table users
    `CREATE TABLE IF NOT EXISTS users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      email VARCHAR(150) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      phone VARCHAR(20),
      address TEXT,
      role ENUM('user', 'admin') DEFAULT 'user',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,
    
    // Table categories
    `CREATE TABLE IF NOT EXISTS categories (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      description TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,
    
    // Table products
    `CREATE TABLE IF NOT EXISTS products (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(200) NOT NULL,
      description TEXT,
      price DECIMAL(10,2) NOT NULL,
      stock_quantity INT DEFAULT 0,
      category_id INT,
      sku VARCHAR(50) UNIQUE,
      image_url VARCHAR(500),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (category_id) REFERENCES categories(id)
    )`,
    
    // Table cart_items
    `CREATE TABLE IF NOT EXISTS cart_items (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT,
      product_id INT,
      quantity INT DEFAULT 1,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
      UNIQUE KEY unique_cart_item (user_id, product_id)
    )`,
    
    // Table wishlist
    `CREATE TABLE IF NOT EXISTS wishlist (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT,
      product_id INT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
      UNIQUE KEY unique_wishlist_item (user_id, product_id)
    )`,
    
    // Table orders
    `CREATE TABLE IF NOT EXISTS orders (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT,
      status ENUM('pending', 'confirmed', 'shipped', 'delivered', 'cancelled') DEFAULT 'pending',
      total_amount DECIMAL(10,2) NOT NULL,
      shipping_address TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    )`,
    
    // Table order_items
    `CREATE TABLE IF NOT EXISTS order_items (
      id INT AUTO_INCREMENT PRIMARY KEY,
      order_id INT,
      product_id INT,
      quantity INT NOT NULL,
      price DECIMAL(10,2) NOT NULL,
      FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
      FOREIGN KEY (product_id) REFERENCES products(id)
    )`,
    
    // Table reviews
    `CREATE TABLE IF NOT EXISTS reviews (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT,
      product_id INT,
      rating INT CHECK (rating >= 1 AND rating <= 5),
      comment TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id),
      FOREIGN KEY (product_id) REFERENCES products(id)
    )`,
    
    // Table tags
    `CREATE TABLE IF NOT EXISTS tags (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(50) NOT NULL UNIQUE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,
    
    // Table product_tags
    `CREATE TABLE IF NOT EXISTS product_tags (
      product_id INT,
      tag_id INT,
      PRIMARY KEY (product_id, tag_id),
      FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
      FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
    )`
  ];
  
  for (const query of tableQueries) {
    await executeQuery(query);
  }
  
  console.log('Tables créées avec succès!');
};

const insertTestData = async () => {
  console.log('Insertion des données de test...');
  
  // Insérer 100 utilisateurs
  const userInserts = [];
  const firstNames = ['Jean', 'Marie', 'Pierre', 'Sophie', 'Michel', 'Catherine', 'Philippe', 'Isabelle', 'Alain', 'Nathalie', 'François', 'Sylvie', 'Daniel', 'Martine', 'Bernard', 'Nicole', 'Patrick', 'Françoise', 'Claude', 'Monique'];
  const lastNames = ['Martin', 'Bernard', 'Dubois', 'Thomas', 'Robert', 'Petit', 'Durand', 'Leroy', 'Moreau', 'Simon', 'Laurent', 'Lefebvre', 'Michel', 'Garcia', 'David', 'Bertrand', 'Roux', 'Vincent', 'Fournier', 'Morel'];
  const domains = ['gmail.com', 'yahoo.fr', 'hotmail.com', 'orange.fr', 'free.fr', 'wanadoo.fr'];
  
  for (let i = 1; i <= 100; i++) {
    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
    const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}${i}@${domains[Math.floor(Math.random() * domains.length)]}`;
    const phone = `0${Math.floor(Math.random() * 9) + 1}${Math.floor(Math.random() * 90000000) + 10000000}`;
    const address = `${Math.floor(Math.random() * 999) + 1} rue ${lastNames[Math.floor(Math.random() * lastNames.length)]}, ${Math.floor(Math.random() * 99999) + 10000} ${firstNames[Math.floor(Math.random() * firstNames.length)]}ville`;
    const role = i <= 5 ? 'admin' : 'user';
    
    userInserts.push(`('${escapeString(firstName + ' ' + lastName)}', '${email}', 'motdepasse123', '${phone}', '${escapeString(address)}', '${role}', NOW())`);
  }
  
  await executeQuery(`INSERT INTO users (name, email, password, phone, address, role, created_at) VALUES ${userInserts.join(',')}`);
  
  // Insérer 20 catégories
  const categories = [
    'Électronique', 'Vêtements', 'Maison & Jardin', 'Sports & Loisirs', 'Beauté & Santé',
    'Livres', 'Jouets & Jeux', 'Automobile', 'Bijoux & Montres', 'Chaussures',
    'Bagages', 'Musique', 'Films & TV', 'Informatique', 'Téléphonie',
    'Électroménager', 'Mobilier', 'Décoration', 'Bricolage', 'Animalerie'
  ];
  
  const categoryInserts = categories.map(cat => `('${escapeString(cat)}', 'Description pour ${escapeString(cat)}', NOW())`);
  await executeQuery(`INSERT INTO categories (name, description, created_at) VALUES ${categoryInserts.join(',')}`);
  
  // Insérer 100 produits
  const productNames = [
    'Smartphone Samsung Galaxy', 'iPhone 14 Pro', 'Laptop Dell Inspiron', 'MacBook Air M2', 'Tablette iPad',
    'Casque Bose QuietComfort', 'Écouteurs AirPods Pro', 'Télévision Samsung 55"', 'Console PlayStation 5', 'Nintendo Switch',
    'Appareil photo Canon EOS', 'Drone DJI Mini', 'Montre Apple Watch', 'Fitbit Charge 5', 'Enceinte JBL Flip',
    'Clavier gaming Razer', 'Souris Logitech MX', 'Écran gaming ASUS', 'Imprimante HP LaserJet', 'Disque dur externe Seagate',
    'Jean Levi\'s 501', 'T-shirt Nike Dri-FIT', 'Baskets Adidas Stan Smith', 'Robe Zara', 'Veste H&M',
    'Sac à main Louis Vuitton', 'Portefeuille Hermès', 'Lunettes Ray-Ban', 'Parfum Chanel N°5', 'Rouge à lèvres MAC',
    'Aspirateur Dyson V15', 'Machine à café Nespresso', 'Micro-ondes Samsung', 'Réfrigérateur LG', 'Lave-vaisselle Bosch',
    'Canapé IKEA Ektorp', 'Table basse moderne', 'Lampe de bureau LED', 'Miroir décoratif', 'Plante verte Monstera',
    'Vélo électrique', 'Trottinette Xiaomi', 'Ballon de football Nike', 'Raquette de tennis Wilson', 'Chaussures de running',
    'Livre Harry Potter', 'BD Astérix', 'Roman policier', 'Magazine Elle', 'Journal Le Monde',
    'Jouet LEGO Creator', 'Poupée Barbie', 'Puzzle 1000 pièces', 'Jeu de société Monopoly', 'Console portable',
    'Pneu Michelin', 'Huile moteur Total', 'GPS Garmin', 'Dashcam', 'Chargeur voiture USB',
    'Collier en or', 'Bague diamant', 'Bracelet Pandora', 'Montre Rolex', 'Boucles d\'oreilles perles',
    'Bottes cuir', 'Sandales été', 'Chaussons confort', 'Escarpins élégants', 'Baskets lifestyle',
    'Valise Samsonite', 'Sac à dos voyage', 'Trousse toilette', 'Pochette passeport', 'Étiquette bagage',
    'Guitare acoustique', 'Piano numérique', 'Batterie électronique', 'Microphone studio', 'Amplificateur guitare',
    'Film Blu-ray', 'Série DVD', 'Album vinyle', 'CD musique classique', 'Soundtrack film',
    'Ordinateur portable gaming', 'Carte graphique NVIDIA', 'Processeur Intel', 'Mémoire RAM DDR4', 'SSD Samsung',
    'Chargeur iPhone', 'Coque protection', 'Verre trempé écran', 'Support voiture', 'Powerbank portable',
    'Four encastrable', 'Plaque induction', 'Hotte aspirante', 'Évier inox', 'Robinet cuisine',
    'Lit double 160x200', 'Matelas mémoire forme', 'Oreiller ergonomique', 'Couette 4 saisons', 'Parure de lit',
    'Peinture murale', 'Papier peint', 'Cadre photo', 'Horloge murale', 'Rideau occultant',
    'Perceuse Bosch', 'Marteau Stanley', 'Tournevis électrique', 'Scie circulaire', 'Niveau à bulle',
    'Croquettes chien', 'Litière chat', 'Jouet pour chien', 'Aquarium 100L', 'Cage hamster'
  ];
  
  const productInserts = [];
  for (let i = 0; i < 100; i++) {
    const name = escapeString(productNames[i]);
    const price = (Math.random() * 2000 + 10).toFixed(2);
    const stock = Math.floor(Math.random() * 100) + 1;
    const categoryId = Math.floor(Math.random() * 20) + 1;
    const sku = `SKU${String(i + 1).padStart(6, '0')}`;
    const imageUrl = `/images/product-${i + 1}.jpg`;
    
    productInserts.push(`('${name}', 'Description détaillée pour ${name}. Produit de haute qualité avec garantie.', ${price}, ${stock}, ${categoryId}, '${sku}', '${imageUrl}', NOW())`);
  }
  
  await executeQuery(`INSERT INTO products (name, description, price, stock_quantity, category_id, sku, image_url, created_at) VALUES ${productInserts.join(',')}`);
  
  // Insérer 100 items dans le panier
  const cartInserts = [];
  for (let i = 1; i <= 100; i++) {
    const userId = Math.floor(Math.random() * 95) + 6; // Users 6-100 (pas les admins)
    const productId = Math.floor(Math.random() * 100) + 1;
    const quantity = Math.floor(Math.random() * 5) + 1;
    
    cartInserts.push(`(${userId}, ${productId}, ${quantity}, NOW())`);
  }
  
  await executeQuery(`INSERT IGNORE INTO cart_items (user_id, product_id, quantity, created_at) VALUES ${cartInserts.join(',')}`);
  
  // Insérer 100 items dans la wishlist
  const wishlistInserts = [];
  for (let i = 1; i <= 100; i++) {
    const userId = Math.floor(Math.random() * 95) + 6;
    const productId = Math.floor(Math.random() * 100) + 1;
    
    wishlistInserts.push(`(${userId}, ${productId}, NOW())`);
  }
  
  await executeQuery(`INSERT IGNORE INTO wishlist (user_id, product_id, created_at) VALUES ${wishlistInserts.join(',')}`);
  
  // Insérer 100 commandes
  const orderInserts = [];
  const statuses = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'];
  const addresses = [
    '123 rue de la République, 75001 Paris',
    '45 avenue des Champs-Élysées, 75008 Paris',
    '78 boulevard Saint-Germain, 75005 Paris',
    '12 place Vendôme, 75001 Paris',
    '56 rue de Rivoli, 75004 Paris'
  ];
  
  for (let i = 1; i <= 100; i++) {
    const userId = Math.floor(Math.random() * 95) + 6;
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    const totalAmount = (Math.random() * 500 + 50).toFixed(2);
    const address = escapeString(addresses[Math.floor(Math.random() * addresses.length)]);
    
    orderInserts.push(`(${userId}, '${status}', ${totalAmount}, '${address}', NOW())`);
  }
  
  await executeQuery(`INSERT INTO orders (user_id, status, total_amount, shipping_address, created_at) VALUES ${orderInserts.join(',')}`);
  
  // Insérer 100 items de commandes
  const orderItemInserts = [];
  for (let i = 1; i <= 100; i++) {
    const orderId = Math.floor(Math.random() * 100) + 1;
    const productId = Math.floor(Math.random() * 100) + 1;
    const quantity = Math.floor(Math.random() * 3) + 1;
    const price = (Math.random() * 200 + 10).toFixed(2);
    
    orderItemInserts.push(`(${orderId}, ${productId}, ${quantity}, ${price})`);
  }
  
  await executeQuery(`INSERT INTO order_items (order_id, product_id, quantity, price) VALUES ${orderItemInserts.join(',')}`);
  
  console.log('Données de test insérées avec succès!');
};

// Démarrer l'initialisation
db.connect((err) => {
  if (err) {
    console.error('Erreur de connexion à MySQL:', err);
    process.exit(1);
  }
  console.log('Connecté à MySQL');
  initializeDatabase();
});