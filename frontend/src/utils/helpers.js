// Formatage des prix
export const formatPrice = (price) => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR'
  }).format(price);
};

// Formatage des dates
export const formatDate = (dateString) => {
  return new Intl.DateTimeFormat('fr-FR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(new Date(dateString));
};

// Formatage des dates courtes
export const formatShortDate = (dateString) => {
  return new Intl.DateTimeFormat('fr-FR', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  }).format(new Date(dateString));
};

// Validation d'email
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Validation de mot de passe
export const isValidPassword = (password) => {
  // Au moins 6 caractères
  return password && password.length >= 6;
};

// Validation de téléphone français
export const isValidPhone = (phone) => {
  const phoneRegex = /^(?:(?:\+|00)33|0)\s*[1-9](?:[\s.-]*\d{2}){4}$/;
  return phoneRegex.test(phone);
};

// Slugify pour les URLs
export const slugify = (text) => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
};

// Capitaliser la première lettre
export const capitalize = (str) => {
  return str.charAt(0).toUpperCase() + str.slice(1);
};

// Tronquer du texte
export const truncateText = (text, maxLength = 100) => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

// Debounce pour les recherches
export const debounce = (func, delay) => {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func.apply(null, args), delay);
  };
};

// Générer un ID aléatoire
export const generateId = () => {
  return Math.random().toString(36).substr(2, 9);
};

// Vérifier si une image existe
export const imageExists = (url) => {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(true);
    img.onerror = () => resolve(false);
    img.src = url;
  });
};

// Obtenir l'URL de l'image ou une image par défaut
export const getImageUrl = (imageUrl, fallback = '/images/no-image.jpg') => {
  if (!imageUrl) return fallback;
  
  // Si l'URL est déjà complète (http:// ou https://)
  if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
    return imageUrl;
  }
  
  // En développement, le proxy Vite gère la redirection
  // En production, utiliser l'URL du backend
  const baseUrl = import.meta.env.PROD 
    ? import.meta.env.VITE_API_URL || 'http://localhost:3001'
    : '';
  
  // Si l'URL commence par /uploads, ajouter le baseUrl
  if (imageUrl.startsWith('/uploads')) {
    return `${baseUrl}${imageUrl}`;
  }
  
  // Sinon, supposer que c'est un chemin relatif vers uploads
  return `${baseUrl}/uploads/${imageUrl}`;
};

// Calculer la note moyenne
export const calculateAverageRating = (ratings) => {
  if (!ratings || ratings.length === 0) return 0;
  const sum = ratings.reduce((acc, rating) => acc + rating.rating, 0);
  return (sum / ratings.length).toFixed(1);
};

// Convertir les octets en format lisible
export const formatBytes = (bytes, decimals = 2) => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
  
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

// Générer des couleurs pour les avatars
export const getAvatarColor = (name) => {
  const colors = [
    '#f44336', '#e91e63', '#9c27b0', '#673ab7',
    '#3f51b5', '#2196f3', '#03a9f4', '#00bcd4',
    '#009688', '#4caf50', '#8bc34a', '#cddc39',
    '#ffeb3b', '#ffc107', '#ff9800', '#ff5722'
  ];
  
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  return colors[Math.abs(hash) % colors.length];
};

// Vérifier si l'utilisateur est admin
export const isAdmin = (user) => {
  return user && user.role === 'admin';
};

// Vérifier si l'utilisateur est connecté
export const isAuthenticated = (user) => {
  return user && user.id;
};

// Obtenir les initiales d'un nom
export const getInitials = (name) => {
  return name
    .split(' ')
    .map(word => word.charAt(0))
    .join('')
    .toUpperCase()
    .substring(0, 2);
};

// Statuts de commande avec couleurs
export const getOrderStatusInfo = (status) => {
  const statusMap = {
    'pending': { label: 'En attente', color: 'warning' },
    'confirmed': { label: 'Confirmée', color: 'info' },
    'processing': { label: 'En préparation', color: 'primary' },
    'shipped': { label: 'Expédiée', color: 'secondary' },
    'delivered': { label: 'Livrée', color: 'success' },
    'cancelled': { label: 'Annulée', color: 'error' },
  };
  
  return statusMap[status] || { label: status, color: 'default' };
};

// Filtrer les produits
export const filterProducts = (products, filters) => {
  return products.filter(product => {
    // Filtre par catégorie
    if (filters.category && product.category !== filters.category) {
      return false;
    }
    
    // Filtre par prix
    if (filters.minPrice && product.price < filters.minPrice) {
      return false;
    }
    
    if (filters.maxPrice && product.price > filters.maxPrice) {
      return false;
    }
    
    // Filtre par recherche
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      return (
        product.name.toLowerCase().includes(searchTerm) ||
        product.description.toLowerCase().includes(searchTerm)
      );
    }
    
    return true;
  });
};

// Trier les produits
export const sortProducts = (products, sortBy) => {
  const sortedProducts = [...products];
  
  switch (sortBy) {
    case 'name-asc':
      return sortedProducts.sort((a, b) => a.name.localeCompare(b.name));
    case 'name-desc':
      return sortedProducts.sort((a, b) => b.name.localeCompare(a.name));
    case 'price-asc':
      return sortedProducts.sort((a, b) => a.price - b.price);
    case 'price-desc':
      return sortedProducts.sort((a, b) => b.price - a.price);
    case 'date-desc':
      return sortedProducts.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    case 'date-asc':
      return sortedProducts.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
    default:
      return sortedProducts;
  }
};

// Pagination
export const paginate = (items, page, itemsPerPage) => {
  const startIndex = (page - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  
  return {
    items: items.slice(startIndex, endIndex),
    totalPages: Math.ceil(items.length / itemsPerPage),
    currentPage: page,
    totalItems: items.length,
    hasNextPage: endIndex < items.length,
    hasPrevPage: startIndex > 0,
  };
};