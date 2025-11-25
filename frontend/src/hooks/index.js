import { useState, useEffect, useCallback } from 'react';
import { productsAPI } from '../services/api';
import { debounce } from '../utils/helpers';

// Données de démonstration quand le backend n'est pas disponible
const DEMO_PRODUCTS = [
  { id: 1, name: 'iPhone 15 Pro', description: 'Le dernier smartphone Apple avec puce A17 Pro', price: 1199, stock: 25, category: 'Electronics', image_url: 'https://picsum.photos/seed/iphone/400/400', created_at: '2024-01-15' },
  { id: 2, name: 'MacBook Air M3', description: 'Ordinateur portable ultra-fin avec puce M3', price: 1299, stock: 15, category: 'Electronics', image_url: 'https://picsum.photos/seed/macbook/400/400', created_at: '2024-01-10' },
  { id: 3, name: 'AirPods Pro 2', description: 'Écouteurs sans fil avec réduction de bruit active', price: 279, stock: 50, category: 'Electronics', image_url: 'https://picsum.photos/seed/airpods/400/400', created_at: '2024-01-05' },
  { id: 4, name: 'Nike Air Max 90', description: 'Chaussures de sport iconiques et confortables', price: 149, stock: 30, category: 'Clothing', image_url: 'https://picsum.photos/seed/nike/400/400', created_at: '2024-01-20' },
  { id: 5, name: 'Levi\'s 501 Original', description: 'Jean classique coupe droite', price: 89, stock: 45, category: 'Clothing', image_url: 'https://picsum.photos/seed/levis/400/400', created_at: '2024-01-18' },
  { id: 6, name: 'Samsung Galaxy S24', description: 'Smartphone Android haut de gamme avec IA', price: 999, stock: 20, category: 'Electronics', image_url: 'https://picsum.photos/seed/samsung/400/400', created_at: '2024-01-12' },
  { id: 7, name: 'Sony WH-1000XM5', description: 'Casque audio premium avec ANC', price: 349, stock: 18, category: 'Electronics', image_url: 'https://picsum.photos/seed/sony/400/400', created_at: '2024-01-08' },
  { id: 8, name: 'Adidas Ultraboost', description: 'Chaussures de running haute performance', price: 179, stock: 35, category: 'Sports', image_url: 'https://picsum.photos/seed/adidas/400/400', created_at: '2024-01-22' },
  { id: 9, name: 'Le Petit Prince', description: 'Chef-d\'œuvre de la littérature française', price: 12, stock: 100, category: 'Books', image_url: 'https://picsum.photos/seed/book1/400/400', created_at: '2024-01-01' },
  { id: 10, name: 'Lampe LED Design', description: 'Lampe de bureau moderne et économique', price: 59, stock: 40, category: 'Home', image_url: 'https://picsum.photos/seed/lamp/400/400', created_at: '2024-01-14' },
  { id: 11, name: 'Tapis Yoga Premium', description: 'Tapis antidérapant pour yoga et fitness', price: 45, stock: 60, category: 'Sports', image_url: 'https://picsum.photos/seed/yoga/400/400', created_at: '2024-01-16' },
  { id: 12, name: 'Machine à Café Nespresso', description: 'Machine à café automatique compacte', price: 199, stock: 22, category: 'Home', image_url: 'https://picsum.photos/seed/coffee/400/400', created_at: '2024-01-11' },
];

// Données de démonstration pour les catégories
const DEMO_CATEGORIES = [
  { id: 1, name: 'Électronique', description: 'Appareils électroniques', product_count: 15 },
  { id: 2, name: 'Vêtements', description: 'Mode et vêtements', product_count: 12 },
  { id: 3, name: 'Maison & Jardin', description: 'Articles pour la maison', product_count: 8 },
  { id: 4, name: 'Sports & Loisirs', description: 'Équipements sportifs', product_count: 10 },
  { id: 5, name: 'Beauté & Santé', description: 'Produits de beauté', product_count: 7 },
  { id: 6, name: 'Livres', description: 'Livres et magazines', product_count: 20 },
  { id: 7, name: 'Jouets & Jeux', description: 'Jouets pour enfants', product_count: 5 },
  { id: 8, name: 'Automobile', description: 'Accessoires auto', product_count: 4 },
  { id: 9, name: 'Bijoux & Montres', description: 'Bijoux et accessoires', product_count: 6 },
  { id: 10, name: 'Chaussures', description: 'Chaussures et baskets', product_count: 9 },
  { id: 11, name: 'Bagages', description: 'Valises et sacs', product_count: 3 },
  { id: 12, name: 'Musique', description: 'Instruments et accessoires', product_count: 4 },
  { id: 13, name: 'Films & TV', description: 'Films et séries', product_count: 8 },
  { id: 14, name: 'Informatique', description: 'Matériel informatique', product_count: 11 },
  { id: 15, name: 'Téléphonie', description: 'Smartphones et accessoires', product_count: 7 },
  { id: 16, name: 'Électroménager', description: 'Appareils ménagers', product_count: 6 },
  { id: 17, name: 'Mobilier', description: 'Meubles et déco', product_count: 5 },
  { id: 18, name: 'Décoration', description: 'Objets décoratifs', product_count: 9 },
  { id: 19, name: 'Bricolage', description: 'Outils et matériaux', product_count: 4 },
  { id: 20, name: 'Animalerie', description: 'Articles pour animaux', product_count: 3 },
];

// Hook pour gérer les produits avec filtres et recherche
export const useProducts = (initialFilters = {}) => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState(initialFilters);
  const [totalProducts, setTotalProducts] = useState(0);
  const [isDemo, setIsDemo] = useState(false);

  // Fonction de recherche avec debounce
  const debouncedSearch = useCallback(
    debounce(async (searchTerm) => {
      if (searchTerm) {
        if (isDemo) {
          // Recherche dans les données de démo
          const filtered = DEMO_PRODUCTS.filter(p => 
            p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.description.toLowerCase().includes(searchTerm.toLowerCase())
          );
          setFilteredProducts(filtered);
          setTotalProducts(filtered.length);
        } else {
          try {
            setLoading(true);
            const response = await productsAPI.search(searchTerm);
            setFilteredProducts(response.data);
            setTotalProducts(response.data.length);
          } catch (err) {
            // Fallback vers données de démo
            const filtered = DEMO_PRODUCTS.filter(p => 
              p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
              p.description.toLowerCase().includes(searchTerm.toLowerCase())
            );
            setFilteredProducts(filtered);
            setTotalProducts(filtered.length);
          } finally {
            setLoading(false);
          }
        }
      } else {
        setFilteredProducts(products);
        setTotalProducts(products.length);
      }
    }, 300),
    [products, isDemo]
  );

  // Charger les produits
  const fetchProducts = useCallback(async (params = {}) => {
    try {
      setLoading(true);
      setError(null);
      const response = await productsAPI.getAll({ ...filters, ...params });
      setProducts(response.data);
      setFilteredProducts(response.data);
      setTotalProducts(response.data.length);
      setIsDemo(false);
    } catch (err) {
      console.warn('Backend non disponible, utilisation des données de démo');
      // Utiliser les données de démonstration
      setProducts(DEMO_PRODUCTS);
      setFilteredProducts(DEMO_PRODUCTS);
      setTotalProducts(DEMO_PRODUCTS.length);
      setIsDemo(true);
      setError(null); // Pas d'erreur affichée en mode démo
    } finally {
      setLoading(false);
    }
  }, [filters]);

  // Mettre à jour les filtres
  const updateFilters = useCallback((newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  // Rechercher
  const search = useCallback((searchTerm) => {
    debouncedSearch(searchTerm);
  }, [debouncedSearch]);

  // Charger au montage du composant
  useEffect(() => {
    fetchProducts();
  }, []);

  return {
    products: filteredProducts,
    loading,
    error,
    filters,
    totalProducts,
    fetchProducts,
    updateFilters,
    search,
    refetch: fetchProducts,
  };
};

// Hook pour gérer les catégories
export const useCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchCategories = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await productsAPI.getCategories();
      setCategories(response.data);
    } catch (err) {
      console.warn('Backend non disponible, utilisation des données de démo pour les catégories');
      setCategories(DEMO_CATEGORIES);
      setError(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  return {
    categories,
    loading,
    error,
    refetch: fetchCategories,
  };
};

// Hook pour gérer les favoris
export const useWishlist = (userId) => {
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchWishlist = useCallback(async () => {
    if (!userId) return;
    
    try {
      setLoading(true);
      const response = await productsAPI.getWishlist(userId);
      setWishlist(response.data);
    } catch (error) {
      console.error('Erreur chargement favoris:', error);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  const addToWishlist = async (productId) => {
    try {
      await productsAPI.addToWishlist({ productId, userId });
      await fetchWishlist();
      return true;
    } catch (error) {
      console.error('Erreur ajout favoris:', error);
      return false;
    }
  };

  const removeFromWishlist = async (wishlistId) => {
    try {
      await productsAPI.removeFromWishlist(wishlistId);
      setWishlist(prev => prev.filter(item => item.id !== wishlistId));
      return true;
    } catch (error) {
      console.error('Erreur suppression favoris:', error);
      return false;
    }
  };

  const isInWishlist = (productId) => {
    return wishlist.some(item => item.product_id === productId);
  };

  useEffect(() => {
    fetchWishlist();
  }, [fetchWishlist]);

  return {
    wishlist,
    loading,
    addToWishlist,
    removeFromWishlist,
    isInWishlist,
    refetch: fetchWishlist,
  };
};

// Hook pour gérer la pagination
export const usePagination = (items, itemsPerPage = 10) => {
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(items.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentItems = items.slice(startIndex, endIndex);

  const goToPage = (page) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  const nextPage = () => {
    setCurrentPage(prev => Math.min(prev + 1, totalPages));
  };

  const prevPage = () => {
    setCurrentPage(prev => Math.max(prev - 1, 1));
  };

  // Reset à la page 1 quand les items changent
  useEffect(() => {
    setCurrentPage(1);
  }, [items.length]);

  return {
    currentPage,
    totalPages,
    currentItems,
    hasNextPage: currentPage < totalPages,
    hasPrevPage: currentPage > 1,
    goToPage,
    nextPage,
    prevPage,
  };
};

// Hook pour gérer le localStorage
export const useLocalStorage = (key, initialValue) => {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`Erreur lecture localStorage ${key}:`, error);
      return initialValue;
    }
  });

  const setValue = (value) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error(`Erreur écriture localStorage ${key}:`, error);
    }
  };

  return [storedValue, setValue];
};

// Hook pour gérer les notifications toast
export const useToast = () => {
  const showToast = useCallback((message, type = 'success') => {
    // Utilise react-toastify
    const { toast } = require('react-toastify');
    
    switch (type) {
      case 'success':
        toast.success(message);
        break;
      case 'error':
        toast.error(message);
        break;
      case 'warning':
        toast.warning(message);
        break;
      case 'info':
        toast.info(message);
        break;
      default:
        toast(message);
    }
  }, []);

  return { showToast };
};

// Hook pour gérer les modales
export const useModal = (initialState = false) => {
  const [isOpen, setIsOpen] = useState(initialState);

  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);
  const toggle = useCallback(() => setIsOpen(prev => !prev), []);

  return {
    isOpen,
    open,
    close,
    toggle,
  };
};

// Hook pour gérer les formulaires
export const useForm = (initialValues = {}, validationRules = {}) => {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (name, value) => {
    setValues(prev => ({ ...prev, [name]: value }));
    
    // Effacer l'erreur pour ce champ
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleBlur = (name) => {
    setTouched(prev => ({ ...prev, [name]: true }));
    
    // Valider le champ
    if (validationRules[name]) {
      const error = validationRules[name](values[name]);
      if (error) {
        setErrors(prev => ({ ...prev, [name]: error }));
      }
    }
  };

  const validate = () => {
    const newErrors = {};
    
    Object.keys(validationRules).forEach(field => {
      const error = validationRules[field](values[field]);
      if (error) {
        newErrors[field] = error;
      }
    });
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (onSubmit) => {
    setIsSubmitting(true);
    
    const isValid = validate();
    if (isValid) {
      try {
        await onSubmit(values);
      } catch (error) {
        console.error('Erreur soumission formulaire:', error);
      }
    }
    
    setIsSubmitting(false);
  };

  const reset = () => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
    setIsSubmitting(false);
  };

  return {
    values,
    errors,
    touched,
    isSubmitting,
    handleChange,
    handleBlur,
    handleSubmit,
    reset,
    isValid: Object.keys(errors).length === 0,
  };
};