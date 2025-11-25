import axios from 'axios';

// Configuration de base de l'API
// En développement, le proxy Vite redirige vers le backend
// En production, utiliser l'URL du backend
const API_BASE_URL = import.meta.env.PROD 
  ? import.meta.env.VITE_API_URL || 'http://localhost:3001'
  : ''; // Vide en dev car le proxy Vite gère la redirection

// Instance axios avec configuration
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Pour les sessions
});

// Intercepteur pour les requêtes
api.interceptors.request.use(
  (config) => {
    // Ajouter le token d'authentification si disponible
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Intercepteur pour les réponses
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Gestion globale des erreurs
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Services d'authentification
export const authAPI = {
  login: (credentials) => api.post('/api/auth/login', credentials),
  register: (userData) => api.post('/api/auth/register', userData),
  logout: () => api.post('/api/auth/logout'),
  checkAuth: () => api.get('/api/auth/check'),
  getEducationalExamples: () => api.get('/api/auth/educational-examples'),
};

// Services des produits
export const productsAPI = {
  getAll: (params) => api.get('/api/products', { params }),
  getById: (id) => api.get(`/api/products/${id}`),
  search: (term) => api.get(`/api/products/search/${term}`),
  getCategories: () => api.get('/api/products/categories/all'),
  addToCart: (data) => api.post('/api/products/cart/add', data),
  getCart: (userId) => api.get(`/api/products/cart/${userId}`),
  removeFromCart: (cartId) => api.delete(`/api/products/cart/${cartId}`),
  updateCartQuantity: (cartId, quantity) => 
    api.put(`/api/products/cart/${cartId}`, { quantity }),
  addToWishlist: (data) => api.post('/api/products/wishlist/add', data),
  getWishlist: (userId) => api.get(`/api/products/wishlist/${userId}`),
  removeFromWishlist: (wishlistId) => api.delete(`/api/products/wishlist/${wishlistId}`),
};

// Services des commandes
export const ordersAPI = {
  create: (orderData) => api.post('/api/orders/create', orderData),
  getAll: () => api.get('/api/orders'),
  getById: (id) => api.get(`/api/orders/${id}`),
  getUserOrders: (userId) => api.get(`/api/users/${userId}/orders`),
  updateStatus: (id, status) => api.put(`/api/orders/${id}/status`, { status }),
};

// Services des utilisateurs
export const usersAPI = {
  getAll: () => api.get('/api/users'),
  getById: (id) => api.get(`/api/users/${id}`),
  update: (id, userData) => api.put(`/api/users/${id}`, userData),
  delete: (id) => api.delete(`/api/users/${id}`),
  getProfile: () => api.get('/api/users/profile'),
  updateProfile: (userData) => api.put('/api/users/profile', userData),
};

// Services d'administration
export const adminAPI = {
  getDashboard: () => api.get('/admin/dashboard'),
  
  // Gestion des produits
  addProduct: (productData) => {
    const formData = new FormData();
    Object.keys(productData).forEach(key => {
      formData.append(key, productData[key]);
    });
    return api.post('/admin/add-product', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  updateProduct: (id, productData) => api.put(`/admin/products/${id}`, productData),
  deleteProduct: (id) => api.delete(`/admin/products/${id}`),
  
  // Gestion des utilisateurs
  getUsers: () => api.get('/admin/users'),
  addUser: (userData) => api.post('/admin/add-user', userData),
  updateUserRole: (userId, role) => api.put(`/admin/user-role/${userId}`, { role }),
  deleteUser: (userId) => api.delete(`/admin/users/${userId}`),
  
  // Gestion des catégories
  getCategories: () => api.get('/admin/categories'),
  addCategory: (categoryData) => api.post('/admin/add-category', categoryData),
  updateCategory: (id, categoryData) => api.put(`/admin/categories/${id}`, categoryData),
  deleteCategory: (id) => api.delete(`/admin/categories/${id}`),
  
  // Statistiques
  getStats: () => api.get('/admin/stats'),
  getSalesData: (period) => api.get(`/admin/sales-data?period=${period}`),
};

export default api;