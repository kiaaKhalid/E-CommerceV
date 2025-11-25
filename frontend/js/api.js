// Configuration de base de l'API
const API_BASE_URL = 'http://localhost:3001';

// Classe pour gérer les appels API
class ApiService {
    constructor() {
        this.baseURL = API_BASE_URL;
    }

    // Méthode générique pour faire des requêtes
    async request(endpoint, options = {}) {
        const url = `${this.baseURL}${endpoint}`;
        const config = {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            },
            ...options
        };

        try {
            console.log('Requête API:', url, config);
            const response = await fetch(url, config);
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.message || `Erreur ${response.status}`);
            }
            
            return data;
        } catch (error) {
            console.error('Erreur API:', error);
            throw error;
        }
    }

    // Authentification
    async login(email, password) {
        return this.request('/api/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password })
        });
    }

    async register(userData) {
        return this.request('/api/auth/register', {
            method: 'POST',
            body: JSON.stringify(userData)
        });
    }

    async logout() {
        return this.request('/api/auth/logout', {
            method: 'POST'
        });
    }

    async checkAuth() {
        return this.request('/api/auth/check');
    }

    // Produits
    async getProducts(params = {}) {
        const query = new URLSearchParams(params).toString();
        return this.request(`/api/products?${query}`);
    }

    async getProduct(id) {
        return this.request(`/api/products/${id}`);
    }

    async searchProducts(term) {
        return this.request(`/api/products/search/${term}`);
    }

    // Panier
    async addToCart(productId, quantity, userId) {
        return this.request('/api/products/cart/add', {
            method: 'POST',
            body: JSON.stringify({ productId, quantity, userId })
        });
    }

    async getCart(userId) {
        return this.request(`/api/products/cart/${userId}`);
    }

    // Wishlist
    async addToWishlist(productId, userId) {
        return this.request('/api/products/wishlist/add', {
            method: 'POST',
            body: JSON.stringify({ productId, userId })
        });
    }

    async getWishlist(userId) {
        return this.request(`/api/products/wishlist/${userId}`);
    }

    // Utilisateurs
    async getUsers() {
        return this.request('/api/users');
    }

    async getUser(userId) {
        return this.request(`/api/users/${userId}`);
    }

    async updateUser(userId, userData) {
        return this.request(`/api/users/${userId}`, {
            method: 'PUT',
            body: JSON.stringify(userData)
        });
    }

    async getUserOrders(userId) {
        return this.request(`/api/users/${userId}/orders`);
    }

    // Commandes
    async createOrder(orderData) {
        return this.request('/api/orders/create', {
            method: 'POST',
            body: JSON.stringify(orderData)
        });
    }

    async getOrders() {
        return this.request('/api/orders');
    }

    async getOrder(orderId) {
        return this.request(`/api/orders/${orderId}`);
    }

    // Administration (accessible publiquement selon les vulnérabilités)
    async addProduct(productData) {
        const formData = new FormData();
        Object.keys(productData).forEach(key => {
            formData.append(key, productData[key]);
        });

        return this.request('/admin/add-product', {
            method: 'POST',
            headers: {}, // Pas de Content-Type pour FormData
            body: formData
        });
    }

    async addUser(userData) {
        return this.request('/admin/add-user', {
            method: 'POST',
            body: JSON.stringify(userData)
        });
    }

    async getCategories() {
        return this.request('/admin/categories');
    }

    async addCategory(categoryData) {
        return this.request('/admin/add-category', {
            method: 'POST',
            body: JSON.stringify(categoryData)
        });
    }

    async getDashboard() {
        return this.request('/admin/dashboard');
    }

    async getAdminUsers() {
        return this.request('/admin/users');
    }

    async updateUserRole(userId, role) {
        return this.request(`/admin/user-role/${userId}`, {
            method: 'PUT',
            body: JSON.stringify({ role })
        });
    }

    // Création d'utilisateur public (vulnérabilité)
    async createUserPublic(userData) {
        return this.request('/api/users/create', {
            method: 'POST',
            body: JSON.stringify(userData)
        });
    }
}

// Instance globale de l'API
const api = new ApiService();

// Utilitaires pour le localStorage
const Storage = {
    set(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
        } catch (error) {
            console.error('Erreur localStorage set:', error);
        }
    },

    get(key) {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : null;
        } catch (error) {
            console.error('Erreur localStorage get:', error);
            return null;
        }
    },

    remove(key) {
        try {
            localStorage.removeItem(key);
        } catch (error) {
            console.error('Erreur localStorage remove:', error);
        }
    },

    clear() {
        try {
            localStorage.clear();
        } catch (error) {
            console.error('Erreur localStorage clear:', error);
        }
    }
};

// Fonctions utilitaires
const Utils = {
    formatPrice(price) {
        return new Intl.NumberFormat('fr-FR', {
            style: 'currency',
            currency: 'EUR'
        }).format(price);
    },

    formatDate(dateString) {
        return new Intl.DateTimeFormat('fr-FR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        }).format(new Date(dateString));
    },

    showAlert(message, type = 'success') {
        const alertDiv = document.createElement('div');
        alertDiv.className = `alert alert-${type}`;
        alertDiv.textContent = message;
        
        const container = document.querySelector('.main-content');
        if (container) {
            container.insertBefore(alertDiv, container.firstChild);
            
            setTimeout(() => {
                alertDiv.remove();
            }, 5000);
        }
    },

    showLoading(element) {
        if (element) {
            element.innerHTML = '<div class="loading"></div>';
        }
    },

    hideLoading() {
        const loadingElements = document.querySelectorAll('.loading');
        loadingElements.forEach(el => el.remove());
    }
};