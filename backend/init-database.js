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
  
  // Insérer 100 produits avec des images réelles depuis Internet
  const productsData = [
    // Électronique
    { name: 'Smartphone Samsung Galaxy', image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&h=400&fit=crop' },
    { name: 'iPhone 14 Pro', image: 'https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=400&h=400&fit=crop' },
    { name: 'Laptop Dell Inspiron', image: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400&h=400&fit=crop' },
    { name: 'MacBook Air M2', image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400&h=400&fit=crop' },
    { name: 'Tablette iPad', image: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=400&h=400&fit=crop' },
    
    // Audio
    { name: 'Casque Bose QuietComfort', image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop' },
    { name: 'Écouteurs AirPods Pro', image: 'https://images.unsplash.com/photo-1606220588913-b3aacb4d2f46?w=400&h=400&fit=crop' },
    { name: 'Enceinte JBL Flip', image: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=400&h=400&fit=crop' },
    
    // Gaming & Divertissement
    { name: 'Télévision Samsung 55 pouces', image: 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=400&h=400&fit=crop' },
    { name: 'Console PlayStation 5', image: 'https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=400&h=400&fit=crop' },
    { name: 'Nintendo Switch', image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=400&fit=crop' },
    
    // Photo & Vidéo
    { name: 'Appareil photo Canon EOS', image: 'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=400&h=400&fit=crop' },
    { name: 'Drone DJI Mini', image: 'https://images.unsplash.com/photo-1473968512647-3e447244af8f?w=400&h=400&fit=crop' },
    
    // Montres & Fitness
    { name: 'Montre Apple Watch', image: 'https://images.unsplash.com/photo-1434493789847-2f02dc6ca35d?w=400&h=400&fit=crop' },
    { name: 'Fitbit Charge 5', image: 'https://images.unsplash.com/photo-1557438159-51eec7a6c9e8?w=400&h=400&fit=crop' },
    
    // Informatique
    { name: 'Clavier gaming Razer', image: 'https://images.unsplash.com/photo-1541140532154-b024d705b90a?w=400&h=400&fit=crop' },
    { name: 'Souris Logitech MX', image: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=400&h=400&fit=crop' },
    { name: 'Écran gaming ASUS', image: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=400&h=400&fit=crop' },
    { name: 'Imprimante HP LaserJet', image: 'https://images.unsplash.com/photo-1612198188060-c7c2a3b66eae?w=400&h=400&fit=crop' },
    { name: 'Disque dur externe Seagate', image: 'https://images.unsplash.com/photo-1597872200969-2b65d56bd16c?w=400&h=400&fit=crop' },
    
    // Vêtements
    { name: 'Jean Levi\'s 501', image: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=400&h=400&fit=crop' },
    { name: 'T-shirt Nike Dri-FIT', image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=400&fit=crop' },
    { name: 'Baskets Adidas Stan Smith', image: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400&h=400&fit=crop' },
    { name: 'Robe Zara', image: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=400&h=400&fit=crop' },
    { name: 'Veste H&M', image: 'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=400&h=400&fit=crop' },
    
    // Accessoires mode
    { name: 'Sac à main Louis Vuitton', image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=400&fit=crop' },
    { name: 'Portefeuille Hermès', image: 'https://images.unsplash.com/photo-1627123424574-724758594e93?w=400&h=400&fit=crop' },
    { name: 'Lunettes Ray-Ban', image: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=400&h=400&fit=crop' },
    { name: 'Parfum Chanel N°5', image: 'https://images.unsplash.com/photo-1541643600914-78b084683601?w=400&h=400&fit=crop' },
    { name: 'Rouge à lèvres MAC', image: 'https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=400&h=400&fit=crop' },
    
    // Électroménager
    { name: 'Aspirateur Dyson V15', image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=400&fit=crop' },
    { name: 'Machine à café Nespresso', image: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400&h=400&fit=crop' },
    { name: 'Micro-ondes Samsung', image: 'https://images.unsplash.com/photo-1574269909862-7e1d70bb8078?w=400&h=400&fit=crop' },
    { name: 'Réfrigérateur LG', image: 'https://images.unsplash.com/photo-1571175443880-49e1d25b2bc5?w=400&h=400&fit=crop' },
    { name: 'Lave-vaisselle Bosch', image: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=400&fit=crop' },
    
    // Mobilier
    { name: 'Canapé IKEA Ektorp', image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=400&fit=crop' },
    { name: 'Table basse moderne', image: 'https://images.unsplash.com/photo-1506439773649-6e0eb8cfb237?w=400&h=400&fit=crop' },
    { name: 'Lampe de bureau LED', image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop' },
    { name: 'Miroir décoratif', image: 'https://images.unsplash.com/photo-1618220179428-22790b461013?w=400&h=400&fit=crop' },
    { name: 'Plante verte Monstera', image: 'https://images.unsplash.com/photo-1545241047-6083a3684587?w=400&h=400&fit=crop' },
    
    // Sport & Transport
    { name: 'Vélo électrique', image: 'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=400&h=400&fit=crop' },
    { name: 'Trottinette Xiaomi', image: 'https://images.unsplash.com/photo-1544191696-15693072cdc0?w=400&h=400&fit=crop' },
    { name: 'Ballon de football Nike', image: 'https://images.unsplash.com/photo-1614632537190-23e4146777db?w=400&h=400&fit=crop' },
    { name: 'Raquette de tennis Wilson', image: 'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=400&h=400&fit=crop' },
    { name: 'Chaussures de running', image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=400&fit=crop' },
    
    // Livres & Médias
    { name: 'Livre Harry Potter', image: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&h=400&fit=crop' },
    { name: 'BD Astérix', image: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&h=400&fit=crop' },
    { name: 'Roman policier', image: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400&h=400&fit=crop' },
    { name: 'Magazine Elle', image: 'https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=400&h=400&fit=crop' },
    { name: 'Journal Le Monde', image: 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=400&h=400&fit=crop' },
    
    // Jouets
    { name: 'Jouet LEGO Creator', image: 'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=400&h=400&fit=crop' },
    { name: 'Poupée Barbie', image: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=400&fit=crop' },
    { name: 'Puzzle 1000 pièces', image: 'https://images.unsplash.com/photo-1606092195730-5d7b9af1efc5?w=400&h=400&fit=crop' },
    
    // Ajoutons 50 produits supplémentaires avec des images génériques mais variées
    { name: 'Produit Tech 1', image: 'https://picsum.photos/400/400?random=51' },
    { name: 'Produit Mode 1', image: 'https://picsum.photos/400/400?random=52' },
    { name: 'Produit Maison 1', image: 'https://picsum.photos/400/400?random=53' },
    { name: 'Produit Sport 1', image: 'https://picsum.photos/400/400?random=54' },
    { name: 'Produit Beauté 1', image: 'https://picsum.photos/400/400?random=55' },
    { name: 'Produit Tech 2', image: 'https://picsum.photos/400/400?random=56' },
    { name: 'Produit Mode 2', image: 'https://picsum.photos/400/400?random=57' },
    { name: 'Produit Maison 2', image: 'https://picsum.photos/400/400?random=58' },
    { name: 'Produit Sport 2', image: 'https://picsum.photos/400/400?random=59' },
    { name: 'Produit Beauté 2', image: 'https://picsum.photos/400/400?random=60' },
    { name: 'Produit Tech 3', image: 'https://picsum.photos/400/400?random=61' },
    { name: 'Produit Mode 3', image: 'https://picsum.photos/400/400?random=62' },
    { name: 'Produit Maison 3', image: 'https://picsum.photos/400/400?random=63' },
    { name: 'Produit Sport 3', image: 'https://picsum.photos/400/400?random=64' },
    { name: 'Produit Beauté 3', image: 'https://picsum.photos/400/400?random=65' },
    { name: 'Produit Tech 4', image: 'https://picsum.photos/400/400?random=66' },
    { name: 'Produit Mode 4', image: 'https://picsum.photos/400/400?random=67' },
    { name: 'Produit Maison 4', image: 'https://picsum.photos/400/400?random=68' },
    { name: 'Produit Sport 4', image: 'https://picsum.photos/400/400?random=69' },
    { name: 'Produit Beauté 4', image: 'https://picsum.photos/400/400?random=70' },
    { name: 'Produit Tech 5', image: 'https://picsum.photos/400/400?random=71' },
    { name: 'Produit Mode 5', image: 'https://picsum.photos/400/400?random=72' },
    { name: 'Produit Maison 5', image: 'https://picsum.photos/400/400?random=73' },
    { name: 'Produit Sport 5', image: 'https://picsum.photos/400/400?random=74' },
    { name: 'Produit Beauté 5', image: 'https://picsum.photos/400/400?random=75' },
    { name: 'Produit Tech 6', image: 'https://picsum.photos/400/400?random=76' },
    { name: 'Produit Mode 6', image: 'https://picsum.photos/400/400?random=77' },
    { name: 'Produit Maison 6', image: 'https://picsum.photos/400/400?random=78' },
    { name: 'Produit Sport 6', image: 'https://picsum.photos/400/400?random=79' },
    { name: 'Produit Beauté 6', image: 'https://picsum.photos/400/400?random=80' },
    { name: 'Produit Tech 7', image: 'https://picsum.photos/400/400?random=81' },
    { name: 'Produit Mode 7', image: 'https://picsum.photos/400/400?random=82' },
    { name: 'Produit Maison 7', image: 'https://picsum.photos/400/400?random=83' },
    { name: 'Produit Sport 7', image: 'https://picsum.photos/400/400?random=84' },
    { name: 'Produit Beauté 7', image: 'https://picsum.photos/400/400?random=85' },
    { name: 'Produit Tech 8', image: 'https://picsum.photos/400/400?random=86' },
    { name: 'Produit Mode 8', image: 'https://picsum.photos/400/400?random=87' },
    { name: 'Produit Maison 8', image: 'https://picsum.photos/400/400?random=88' },
    { name: 'Produit Sport 8', image: 'https://picsum.photos/400/400?random=89' },
    { name: 'Produit Beauté 8', image: 'https://picsum.photos/400/400?random=90' },
    { name: 'Produit Tech 9', image: 'https://picsum.photos/400/400?random=91' },
    { name: 'Produit Mode 9', image: 'https://picsum.photos/400/400?random=92' },
    { name: 'Produit Maison 9', image: 'https://picsum.photos/400/400?random=93' },
    { name: 'Produit Sport 9', image: 'https://picsum.photos/400/400?random=94' },
    { name: 'Produit Beauté 9', image: 'https://picsum.photos/400/400?random=95' },
    { name: 'Produit Tech 10', image: 'https://picsum.photos/400/400?random=96' },
    { name: 'Produit Mode 10', image: 'https://picsum.photos/400/400?random=97' },
    { name: 'Produit Maison 10', image: 'https://picsum.photos/400/400?random=98' },
    { name: 'Produit Sport 10', image: 'https://picsum.photos/400/400?random=99' },
    { name: 'Produit Beauté 10', image: 'https://picsum.photos/400/400?random=100' }
  ];
  
  const productInserts = [];
  for (let i = 0; i < 100; i++) {
    const productData = productsData[i];
    const name = escapeString(productData.name);
    const price = (Math.random() * 2000 + 10).toFixed(2);
    const stock = Math.floor(Math.random() * 100) + 1;
    const categoryId = Math.floor(Math.random() * 20) + 1;
    const sku = `SKU${String(i + 1).padStart(6, '0')}`;
    const imageUrl = productData.image;
    
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