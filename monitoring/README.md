# 📊 Système de Monitoring E-Commerce

Ce système de monitoring utilise **Prometheus** pour la collecte de métriques et **Grafana** pour la visualisation.

## 🚀 Démarrage Rapide

### Prérequis
- Docker et Docker Compose installés
- Backend Node.js en cours d'exécution sur le port 3001

### Lancer le monitoring

```bash
# Depuis la racine du projet
docker-compose -f docker-compose.monitoring.yml up -d
```

### Accès aux interfaces

| Service | URL | Identifiants |
|---------|-----|--------------|
| **Prometheus** | http://localhost:9090 | - |
| **Grafana** | http://localhost:3000 | admin / admin123 |
| **Métriques App** | http://localhost:3001/metrics | - |
| **Health Check** | http://localhost:3001/health | - |

## 📈 Métriques Disponibles

### Métriques HTTP
| Métrique | Type | Description |
|----------|------|-------------|
| `ecommerce_http_requests_total` | Counter | Nombre total de requêtes HTTP |
| `ecommerce_http_request_duration_seconds` | Histogram | Durée des requêtes HTTP |
| `ecommerce_http_requests_in_progress` | Gauge | Requêtes en cours |

### Métriques Métier
| Métrique | Type | Description |
|----------|------|-------------|
| `ecommerce_orders_total` | Counter | Nombre total de commandes |
| `ecommerce_revenue_total` | Counter | Revenu total en DH |
| `ecommerce_order_value` | Histogram | Distribution des valeurs de commandes |
| `ecommerce_cart_additions_total` | Counter | Ajouts au panier |
| `ecommerce_product_views_total` | Counter | Vues de produits |

### Métriques Utilisateurs
| Métrique | Type | Description |
|----------|------|-------------|
| `ecommerce_user_logins_total` | Counter | Connexions (success/failed) |
| `ecommerce_user_registrations_total` | Counter | Inscriptions |
| `ecommerce_active_users` | Gauge | Utilisateurs actifs |
| `ecommerce_active_sessions` | Gauge | Sessions actives |

### Métriques Système (Node.js)
| Métrique | Type | Description |
|----------|------|-------------|
| `ecommerce_nodejs_heap_size_used_bytes` | Gauge | Mémoire heap utilisée |
| `ecommerce_nodejs_heap_size_total_bytes` | Gauge | Mémoire heap totale |
| `ecommerce_process_cpu_seconds_total` | Counter | Temps CPU utilisé |

### Métriques Erreurs
| Métrique | Type | Description |
|----------|------|-------------|
| `ecommerce_errors_total` | Counter | Erreurs totales |
| `ecommerce_api_errors_total` | Counter | Erreurs API par code status |

## 🎨 Dashboard Grafana

Le dashboard **"🛒 E-Commerce Dashboard"** est automatiquement provisionné avec :

- **KPIs principaux** : Requêtes totales, Commandes, Revenu, Erreurs
- **Graphiques temps réel** : Requêtes/seconde, Temps de réponse (p50, p95)
- **Métriques utilisateurs** : Connexions, Inscriptions, Ajouts panier
- **Ressources système** : CPU, Mémoire Node.js
- **Répartitions** : Requêtes par méthode HTTP, par code status

## 🔧 Utilisation dans le Code

### Enregistrer des métriques personnalisées

```javascript
const { metrics } = require('./config/metrics');

// Commandes
metrics.recordOrder('completed', 1500);  // status, montant

// Utilisateurs
metrics.recordLogin(true);               // succès/échec
metrics.recordRegistration();

// Produits
metrics.recordProductView(productId);
metrics.recordCartAddition();

// Erreurs
metrics.recordError('ValidationError', '/api/orders');
```

## 📊 Requêtes Prometheus Utiles

```promql
# Taux de requêtes par seconde
rate(ecommerce_http_requests_total[5m])

# Temps de réponse p95
histogram_quantile(0.95, rate(ecommerce_http_request_duration_seconds_bucket[5m]))

# Taux d'erreurs
sum(rate(ecommerce_api_errors_total[5m])) / sum(rate(ecommerce_http_requests_total[5m])) * 100

# Revenu par heure
increase(ecommerce_revenue_total[1h])

# Commandes par statut
sum by (status) (ecommerce_orders_total)
```

## 🛑 Arrêter le monitoring

```bash
docker-compose -f docker-compose.monitoring.yml down
```

Pour supprimer aussi les données :
```bash
docker-compose -f docker-compose.monitoring.yml down -v
```

## 🔍 Dépannage

### Prometheus ne collecte pas les métriques
1. Vérifiez que le backend tourne : `curl http://localhost:3001/health`
2. Vérifiez les métriques : `curl http://localhost:3001/metrics`
3. Vérifiez les targets Prometheus : http://localhost:9090/targets

### Grafana n'affiche pas de données
1. Vérifiez la datasource Prometheus dans Grafana
2. Attendez quelques minutes pour l'accumulation de données
3. Vérifiez la plage de temps sélectionnée
