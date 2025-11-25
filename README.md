# Site E-Commerce avec Vulnérabilités de Sécurité

## 📋 Description

Ce projet est un site e-commerce complet développé avec Node.js/Express pour le backend et HTML/CSS/JavaScript vanilla pour le frontend. **Important : Ce site contient volontairement des vulnérabilités de sécurité à des fins éducatives et de démonstration.**

## 🏗️ Architecture

### Backend (Node.js/Express)
- **Serveur** : Express.js avec middleware CORS, sessions, body-parser
- **Base de données** : MySQL avec des requêtes SQL vulnerables
- **Authentification** : Sessions non sécurisées sans bcrypt
- **API REST** : Endpoints pour produits, utilisateurs, commandes, administration

### Frontend (HTML/CSS/JS)
- **Design** : Interface moderne et responsive avec CSS Grid/Flexbox
- **Interactions** : JavaScript vanilla pour les appels API
- **Pages** : Accueil, Produits, Panier, Favoris, Authentification, Administration

## 🚀 Installation et Lancement

### Prérequis
- Node.js (version 12 ou plus)
- MySQL Server
- Navigateur web moderne

### 1. Configuration de la Base de Données

Créez une base de données MySQL :
```sql
CREATE DATABASE ecommerce_db;
CREATE USER 'ecommerce_user'@'localhost' IDENTIFIED BY 'password123';
GRANT ALL PRIVILEGES ON ecommerce_db.* TO 'ecommerce_user'@'localhost';
FLUSH PRIVILEGES;
```

### 2. Installation des Dépendances

```bash
cd backend
npm install
```

### 3. Initialisation de la Base de Données

```bash
cd backend
npm run init-db
```

Cette commande va :
- Créer toutes les tables nécessaires
- Insérer 100 utilisateurs, produits, catégories avec des données réalistes
- Créer un utilisateur admin (email: admin@eshop.fr, mot de passe: admin123)

### 4. Lancement du Serveur

```bash
cd backend
npm start
```

Le serveur sera disponible sur `http://localhost:3001`

### 5. Accès au Site

Ouvrez `frontend/index.html` dans votre navigateur ou servez les fichiers avec un serveur web local.

## 🔐 Comptes de Test

### Administrateur
- **Email** : admin@eshop.fr
- **Mot de passe** : admin123

### Utilisateurs Générés
- 100 utilisateurs avec emails : user1@example.com à user100@example.com
- **Mot de passe** : password123

## 🌟 Fonctionnalités

### Pour les Visiteurs
- ✅ Navigation des produits avec filtres et recherche
- ✅ Consultation des catégories
- ✅ Inscription et connexion
- ✅ Interface responsive et moderne

### Pour les Utilisateurs Connectés
- ✅ Ajout au panier et liste de favoris
- ✅ Passage de commandes
- ✅ Gestion du profil
- ✅ Historique des commandes

### Pour les Administrateurs
- ✅ Dashboard avec statistiques
- ✅ Gestion des utilisateurs (avec mots de passe visibles)
- ✅ Ajout de produits et catégories
- ✅ Suivi des commandes

## ⚠️ Vulnérabilités de Sécurité Incluses

**⚠️ ATTENTION : Ce site contient volontairement des vulnérabilités. NE PAS utiliser en production !**

### 1. Injections SQL
- Recherche de produits vulnérable aux injections SQL
- Endpoints d'administration non protégés

### 2. Authentification Faible
- Mots de passe stockés en texte clair (pas de bcrypt)
- Sessions non sécurisées
- Pas de validation robuste

### 3. Contrôle d'Accès
- Panel d'administration accessible publiquement
- Pas de vérification de rôles sur certains endpoints

### 4. Exposition de Données
- Mots de passe visibles dans l'interface d'administration
- Informations sensibles exposées via les API

### 5. Problèmes de Performance
- Requêtes SQL non optimisées volontairement
- Pas de mise en cache
- Boucles infinies potentielles

## 📂 Structure des Fichiers

```
e-commercV/
├── backend/
│   ├── server.js           # Serveur principal
│   ├── package.json        # Dépendances Node.js
│   ├── init-database.js    # Script d'initialisation DB
│   ├── config/
│   │   └── database.js     # Configuration MySQL
│   └── routes/
│       ├── auth.js         # Routes d'authentification
│       ├── products.js     # Routes produits
│       ├── users.js        # Routes utilisateurs
│       ├── orders.js       # Routes commandes
│       └── admin.js        # Routes administration
├── frontend/
│   ├── index.html          # Page d'accueil
│   ├── products.html       # Page produits
│   ├── cart.html          # Page panier
│   ├── wishlist.html      # Page favoris
│   ├── login.html         # Page connexion
│   ├── register.html      # Page inscription
│   ├── admin.html         # Panel administration
│   ├── styles/
│   │   └── main.css       # Styles principaux
│   └── js/
│       ├── api.js         # Client API
│       ├── auth.js        # Gestion authentification
│       ├── main.js        # JavaScript principal
│       ├── products.js    # Gestion produits
│       └── cart.js        # Gestion panier
└── README.md
```

## 🎯 Utilisation Pédagogique

Ce projet est conçu pour :
- Démontrer les vulnérabilités web communes
- Enseigner la sécurité par l'exemple
- Tester des outils de sécurité
- Pratiquer les audits de sécurité

### Tests de Sécurité Recommandés
1. **Injection SQL** : Testez les champs de recherche
2. **XSS** : Tentez d'injecter du JavaScript
3. **Accès non autorisé** : Accédez au panel admin sans authentification
4. **Énumération** : Explorez les endpoints API

## 🛠️ Technologies Utilisées

### Backend
- Node.js & Express.js
- MySQL Database
- Sessions & CORS
- JWT (vulnérable)
- Multer (version vulnérable)

### Frontend
- HTML5 & CSS3
- JavaScript ES6+
- Font Awesome Icons
- Design Responsive

## 📊 Données Générées

Le script d'initialisation crée :
- **100 utilisateurs** avec profils réalistes
- **100 produits** dans 20 catégories différentes
- **20 catégories** (Électronique, Vêtements, Maison, etc.)
- **Commandes** et **historiques** d'exemple
- **Données de panier et favoris** pour les tests

## 🚨 Avertissements

1. **Sécurité** : Ce site est volontairement non sécurisé
2. **Production** : NE JAMAIS utiliser ce code en production
3. **Éducation** : Uniquement à des fins pédagogiques
4. **Responsabilité** : Utilisez dans un environnement contrôlé

## 📈 Extensions Possibles

- Ajout d'un système de paiement (test)
- Gestion avancée des stocks
- Système de notifications
- API mobile
- Tests automatisés de sécurité

## 🤝 Contribution

Ce projet est conçu à des fins éducatives. Les contributions pour améliorer l'aspect pédagogique sont les bienvenues, mais les correctifs de sécurité ne doivent PAS être appliqués car les vulnérabilités sont intentionnelles.

## 📝 Licence

Ce projet est fourni à des fins éducatives uniquement. Utilisez à vos propres risques et dans un environnement contrôlé.