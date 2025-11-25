import { createContext, useContext, useReducer, useEffect } from 'react';
import { productsAPI } from '../services/api';
import { useAuth } from './AuthContext';
import { toast } from 'react-toastify';

// État initial
const initialState = {
  items: [],
  totalItems: 0,
  totalPrice: 0,
  isLoading: false,
  error: null,
};

// Actions
const CART_ACTIONS = {
  SET_LOADING: 'SET_LOADING',
  SET_CART: 'SET_CART',
  ADD_ITEM: 'ADD_ITEM',
  REMOVE_ITEM: 'REMOVE_ITEM',
  UPDATE_QUANTITY: 'UPDATE_QUANTITY',
  CLEAR_CART: 'CLEAR_CART',
  SET_ERROR: 'SET_ERROR',
  CLEAR_ERROR: 'CLEAR_ERROR',
};

// Reducer
const cartReducer = (state, action) => {
  switch (action.type) {
    case CART_ACTIONS.SET_LOADING:
      return { ...state, isLoading: action.payload };
    
    case CART_ACTIONS.SET_CART:
      const items = action.payload;
      const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
      const totalPrice = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      return {
        ...state,
        items,
        totalItems,
        totalPrice,
        isLoading: false,
        error: null,
      };
    
    case CART_ACTIONS.ADD_ITEM:
      const newItem = action.payload;
      const existingItemIndex = state.items.findIndex(item => item.product_id === newItem.product_id);
      
      let updatedItems;
      if (existingItemIndex >= 0) {
        updatedItems = state.items.map((item, index) =>
          index === existingItemIndex
            ? { ...item, quantity: item.quantity + newItem.quantity }
            : item
        );
      } else {
        updatedItems = [...state.items, newItem];
      }
      
      return {
        ...state,
        items: updatedItems,
        totalItems: updatedItems.reduce((sum, item) => sum + item.quantity, 0),
        totalPrice: updatedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0),
      };
    
    case CART_ACTIONS.REMOVE_ITEM:
      const filteredItems = state.items.filter(item => item.id !== action.payload);
      return {
        ...state,
        items: filteredItems,
        totalItems: filteredItems.reduce((sum, item) => sum + item.quantity, 0),
        totalPrice: filteredItems.reduce((sum, item) => sum + (item.price * item.quantity), 0),
      };
    
    case CART_ACTIONS.UPDATE_QUANTITY:
      const { itemId, quantity } = action.payload;
      const updatedQuantityItems = state.items.map(item =>
        item.id === itemId ? { ...item, quantity } : item
      );
      return {
        ...state,
        items: updatedQuantityItems,
        totalItems: updatedQuantityItems.reduce((sum, item) => sum + item.quantity, 0),
        totalPrice: updatedQuantityItems.reduce((sum, item) => sum + (item.price * item.quantity), 0),
      };
    
    case CART_ACTIONS.CLEAR_CART:
      return { ...initialState };
    
    case CART_ACTIONS.SET_ERROR:
      return { ...state, error: action.payload, isLoading: false };
    
    case CART_ACTIONS.CLEAR_ERROR:
      return { ...state, error: null };
    
    default:
      return state;
  }
};

// Contexte
const CartContext = createContext();

// Provider
export const CartProvider = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, initialState);
  const { user, isAuthenticated } = useAuth();

  // Charger le panier quand l'utilisateur se connecte
  useEffect(() => {
    if (isAuthenticated && user) {
      loadCart();
    } else {
      dispatch({ type: CART_ACTIONS.CLEAR_CART });
    }
  }, [isAuthenticated, user]);

  const loadCart = async () => {
    if (!user?.id) return;
    
    try {
      dispatch({ type: CART_ACTIONS.SET_LOADING, payload: true });
      const response = await productsAPI.getCart(user.id);
      dispatch({ type: CART_ACTIONS.SET_CART, payload: response.data });
    } catch (error) {
      console.error('Erreur chargement panier:', error);
      dispatch({ type: CART_ACTIONS.SET_ERROR, payload: 'Erreur lors du chargement du panier' });
    }
  };

  const addToCart = async (product, quantity = 1) => {
    if (!isAuthenticated) {
      toast.error('Vous devez être connecté pour ajouter des produits au panier');
      return;
    }

    try {
      dispatch({ type: CART_ACTIONS.SET_LOADING, payload: true });
      
      const cartData = {
        productId: product.id,
        quantity,
        userId: user.id,
      };

      await productsAPI.addToCart(cartData);
      
      // Optimistic update
      dispatch({
        type: CART_ACTIONS.ADD_ITEM,
        payload: {
          id: Date.now(), // Temporary ID
          product_id: product.id,
          product_name: product.name,
          price: product.price,
          quantity,
          image_url: product.image_url,
        },
      });

      toast.success(`${product.name} ajouté au panier`);
      
      // Recharger le panier pour synchroniser avec le serveur
      await loadCart();
      
    } catch (error) {
      console.error('Erreur ajout panier:', error);
      toast.error('Erreur lors de l\'ajout au panier');
      dispatch({ type: CART_ACTIONS.SET_ERROR, payload: 'Erreur lors de l\'ajout au panier' });
    }
  };

  const removeFromCart = async (cartItemId) => {
    try {
      dispatch({ type: CART_ACTIONS.SET_LOADING, payload: true });
      
      await productsAPI.removeFromCart(cartItemId);
      dispatch({ type: CART_ACTIONS.REMOVE_ITEM, payload: cartItemId });
      
      toast.success('Produit retiré du panier');
    } catch (error) {
      console.error('Erreur suppression panier:', error);
      toast.error('Erreur lors de la suppression');
      dispatch({ type: CART_ACTIONS.SET_ERROR, payload: 'Erreur lors de la suppression' });
    }
  };

  const updateQuantity = async (cartItemId, newQuantity) => {
    if (newQuantity <= 0) {
      await removeFromCart(cartItemId);
      return;
    }

    try {
      dispatch({ type: CART_ACTIONS.SET_LOADING, payload: true });
      
      await productsAPI.updateCartQuantity(cartItemId, newQuantity);
      dispatch({
        type: CART_ACTIONS.UPDATE_QUANTITY,
        payload: { itemId: cartItemId, quantity: newQuantity },
      });
      
    } catch (error) {
      console.error('Erreur mise à jour quantité:', error);
      toast.error('Erreur lors de la mise à jour');
      dispatch({ type: CART_ACTIONS.SET_ERROR, payload: 'Erreur lors de la mise à jour' });
    }
  };

  const clearCart = () => {
    dispatch({ type: CART_ACTIONS.CLEAR_CART });
  };

  const clearError = () => {
    dispatch({ type: CART_ACTIONS.CLEAR_ERROR });
  };

  const value = {
    ...state,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    clearError,
    loadCart,
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};

// Hook personnalisé
export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export default CartContext;