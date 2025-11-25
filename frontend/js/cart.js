// JavaScript pour la page du panier
let cartItems = [];
const SHIPPING_COST = 5.99;

document.addEventListener('DOMContentLoaded', async function() {
    if (!auth.requireAuth()) return;
    
    await loadCart();
    setupCheckout();
});

// Charger le panier
async function loadCart() {
    const cartContent = document.getElementById('cart-content');
    const emptyCart = document.getElementById('empty-cart');
    const cartSummary = document.getElementById('cart-summary');
    
    Utils.showLoading(cartContent);
    
    try {
        const user = auth.getCurrentUser();
        cartItems = await api.getCart(user.id);
        
        if (cartItems.length === 0) {
            cartContent.style.display = 'none';
            cartSummary.style.display = 'none';
            emptyCart.style.display = 'block';
        } else {
            emptyCart.style.display = 'none';
            cartSummary.style.display = 'block';
            displayCartItems();
            updateCartSummary();
        }
        
    } catch (error) {
        console.error('Erreur lors du chargement du panier:', error);
        cartContent.innerHTML = '<p>Erreur lors du chargement du panier</p>';
    }
}

// Afficher les articles du panier
function displayCartItems() {
    const cartContent = document.getElementById('cart-content');
    cartContent.innerHTML = '';
    cartContent.style.display = 'block';
    
    cartItems.forEach(item => {
        const cartItem = createCartItemElement(item);
        cartContent.appendChild(cartItem);
    });
}

// Créer un élément d'article de panier
function createCartItemElement(item) {
    const cartItemDiv = document.createElement('div');
    cartItemDiv.className = 'cart-item';
    cartItemDiv.setAttribute('data-item-id', item.id);
    
    cartItemDiv.innerHTML = `
        <div class="cart-item-image">
            ${item.image_url ? 
                `<img src="${item.image_url}" alt="${item.name}" style="width:100%;height:100%;object-fit:cover;border-radius:8px;">` :
                `<i class="fas fa-image"></i>`
            }
        </div>
        <div class="cart-item-info">
            <div class="cart-item-name">${item.name}</div>
            <div class="cart-item-price">${Utils.formatPrice(item.price)}</div>
            <div>Stock disponible: ${item.stock_quantity}</div>
        </div>
        <div class="cart-item-controls">
            <div class="quantity-control">
                <button class="quantity-btn" onclick="updateQuantity(${item.id}, ${item.quantity - 1})">-</button>
                <input type="number" class="quantity-input" value="${item.quantity}" 
                       onchange="updateQuantity(${item.id}, this.value)" min="1" max="${item.stock_quantity}">
                <button class="quantity-btn" onclick="updateQuantity(${item.id}, ${item.quantity + 1})">+</button>
            </div>
            <button class="btn btn-secondary" onclick="removeFromCart(${item.id})">
                <i class="fas fa-trash"></i>
            </button>
        </div>
    `;
    
    return cartItemDiv;
}

// Mettre à jour la quantité d'un article
async function updateQuantity(itemId, newQuantity) {
    newQuantity = parseInt(newQuantity);
    
    if (newQuantity <= 0) {
        removeFromCart(itemId);
        return;
    }
    
    const item = cartItems.find(item => item.id === itemId);
    if (!item) return;
    
    if (newQuantity > item.stock_quantity) {
        Utils.showAlert(`Stock insuffisant. Maximum disponible: ${item.stock_quantity}`, 'error');
        return;
    }
    
    try {
        const user = auth.getCurrentUser();
        // Supprimer l'ancien article et ajouter avec la nouvelle quantité
        await api.addToCart(item.product_id, newQuantity - item.quantity, user.id);
        
        // Mettre à jour localement
        item.quantity = newQuantity;
        
        // Rafraîchir l'affichage
        displayCartItems();
        updateCartSummary();
        auth.updateCartCount();
        
    } catch (error) {
        console.error('Erreur lors de la mise à jour:', error);
        Utils.showAlert('Erreur lors de la mise à jour', 'error');
    }
}

// Supprimer un article du panier
async function removeFromCart(itemId) {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet article ?')) {
        return;
    }
    
    try {
        // Supprimer de la base de données (simulation avec une requête)
        const item = cartItems.find(item => item.id === itemId);
        if (item) {
            // Dans un vrai système, on aurait une API pour supprimer un item spécifique
            // Ici on simule en mettant la quantité à 0
            await updateQuantity(itemId, 0);
        }
        
        // Supprimer localement
        cartItems = cartItems.filter(item => item.id !== itemId);
        
        if (cartItems.length === 0) {
            document.getElementById('cart-content').style.display = 'none';
            document.getElementById('cart-summary').style.display = 'none';
            document.getElementById('empty-cart').style.display = 'block';
        } else {
            displayCartItems();
            updateCartSummary();
        }
        
        auth.updateCartCount();
        Utils.showAlert('Article supprimé du panier', 'success');
        
    } catch (error) {
        console.error('Erreur lors de la suppression:', error);
        Utils.showAlert('Erreur lors de la suppression', 'error');
    }
}

// Mettre à jour le résumé du panier
function updateCartSummary() {
    const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const total = subtotal + SHIPPING_COST;
    
    document.getElementById('subtotal').textContent = Utils.formatPrice(subtotal);
    document.getElementById('total').textContent = Utils.formatPrice(total);
}

// Configuration du checkout
function setupCheckout() {
    const checkoutBtn = document.getElementById('checkout-btn');
    
    checkoutBtn.addEventListener('click', async () => {
        if (cartItems.length === 0) {
            Utils.showAlert('Votre panier est vide', 'error');
            return;
        }
        
        try {
            const user = auth.getCurrentUser();
            const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
            const totalAmount = subtotal + SHIPPING_COST;
            
            const orderData = {
                userId: user.id,
                items: cartItems.map(item => ({
                    productId: item.product_id,
                    quantity: item.quantity,
                    price: item.price
                })),
                totalAmount: totalAmount,
                shippingAddress: user.address || '123 rue par défaut, 75001 Paris'
            };
            
            checkoutBtn.disabled = true;
            checkoutBtn.innerHTML = '<div class="loading"></div> Traitement...';
            
            const response = await api.createOrder(orderData);
            
            if (response.success) {
                Utils.showAlert('Commande passée avec succès !', 'success');
                setTimeout(() => {
                    window.location.href = `orders.html`;
                }, 2000);
            } else {
                throw new Error(response.message || 'Erreur lors de la commande');
            }
            
        } catch (error) {
            console.error('Erreur lors du checkout:', error);
            Utils.showAlert(error.message || 'Erreur lors de la commande', 'error');
            
            checkoutBtn.disabled = false;
            checkoutBtn.innerHTML = '<i class="fas fa-credit-card"></i> Passer la commande';
        }
    });
}