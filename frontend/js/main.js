// JavaScript principal pour la page d'accueil
document.addEventListener('DOMContentLoaded', async function() {
    await loadCategories();
    await loadFeaturedProducts();
    setupSearchFunctionality();
});

// Charger les catégories
async function loadCategories() {
    const categoryGrid = document.getElementById('category-grid');
    if (!categoryGrid) return;

    Utils.showLoading(categoryGrid);

    try {
        const categories = await api.getCategories();
        
        categoryGrid.innerHTML = '';
        
        const categoryIcons = [
            'fas fa-laptop', 'fas fa-tshirt', 'fas fa-home', 'fas fa-football-ball', 'fas fa-spa',
            'fas fa-book', 'fas fa-gamepad', 'fas fa-car', 'fas fa-gem', 'fas fa-shoe-prints',
            'fas fa-suitcase', 'fas fa-music', 'fas fa-film', 'fas fa-desktop', 'fas fa-mobile-alt',
            'fas fa-blender', 'fas fa-couch', 'fas fa-palette', 'fas fa-tools', 'fas fa-paw'
        ];
        
        categories.slice(0, 8).forEach((category, index) => {
            const categoryCard = document.createElement('div');
            categoryCard.className = 'category-card';
            categoryCard.innerHTML = `
                <div class="category-icon">
                    <i class="${categoryIcons[index] || 'fas fa-box'}"></i>
                </div>
                <h3>${category.name}</h3>
                <p>${category.description}</p>
            `;
            
            categoryCard.addEventListener('click', () => {
                window.location.href = `products.html?category=${encodeURIComponent(category.name)}`;
            });
            
            categoryGrid.appendChild(categoryCard);
        });
        
    } catch (error) {
        console.error('Erreur lors du chargement des catégories:', error);
        categoryGrid.innerHTML = '<p>Erreur lors du chargement des catégories</p>';
    }
}

// Charger les produits populaires
async function loadFeaturedProducts() {
    const productGrid = document.getElementById('featured-products');
    if (!productGrid) return;

    Utils.showLoading(productGrid);

    try {
        const products = await api.getProducts({ limit: 8 });
        
        productGrid.innerHTML = '';
        
        products.forEach(product => {
            const productCard = createProductCard(product);
            productGrid.appendChild(productCard);
        });
        
    } catch (error) {
        console.error('Erreur lors du chargement des produits:', error);
        productGrid.innerHTML = '<p>Erreur lors du chargement des produits</p>';
    }
}

// Créer une carte produit
function createProductCard(product) {
    const productCard = document.createElement('div');
    productCard.className = 'product-card';
    
    productCard.innerHTML = `
        <div class="product-image">
            ${product.image_url ? 
                `<img src="${product.image_url}" alt="${product.name}" style="width:100%;height:100%;object-fit:cover;">` :
                `<i class="fas fa-image"></i>`
            }
        </div>
        <div class="product-info">
            <div class="product-name">${product.name}</div>
            <div class="product-price">${Utils.formatPrice(product.price)}</div>
            <div class="product-actions">
                <button class="btn btn-primary" onclick="addToCart(${product.id})">
                    <i class="fas fa-shopping-cart"></i> Ajouter
                </button>
                <button class="btn btn-secondary" onclick="addToWishlist(${product.id})">
                    <i class="fas fa-heart"></i>
                </button>
            </div>
        </div>
    `;
    
    // Ajouter un événement click sur le nom/image pour voir les détails
    const productName = productCard.querySelector('.product-name');
    const productImage = productCard.querySelector('.product-image');
    
    [productName, productImage].forEach(element => {
        element.style.cursor = 'pointer';
        element.addEventListener('click', () => {
            window.location.href = `product-detail.html?id=${product.id}`;
        });
    });
    
    return productCard;
}

// Configuration de la fonctionnalité de recherche
function setupSearchFunctionality() {
    const searchInput = document.getElementById('search-input');
    const searchBtn = document.getElementById('search-btn');
    
    if (searchInput && searchBtn) {
        const performSearch = () => {
            const searchTerm = searchInput.value.trim();
            if (searchTerm) {
                window.location.href = `products.html?search=${encodeURIComponent(searchTerm)}`;
            }
        };
        
        searchBtn.addEventListener('click', performSearch);
        
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                performSearch();
            }
        });
    }
}

// Fonctions globales pour les actions produit
async function addToCart(productId) {
    if (!auth.isAuthenticated()) {
        Utils.showAlert('Vous devez être connecté pour ajouter des produits au panier', 'error');
        setTimeout(() => {
            window.location.href = `login.html?return=${encodeURIComponent(window.location.href)}`;
        }, 2000);
        return;
    }
    
    try {
        const user = auth.getCurrentUser();
        await api.addToCart(productId, 1, user.id);
        Utils.showAlert('Produit ajouté au panier !', 'success');
        auth.updateCartCount();
    } catch (error) {
        console.error('Erreur ajout panier:', error);
        Utils.showAlert('Erreur lors de l\'ajout au panier', 'error');
    }
}

async function addToWishlist(productId) {
    if (!auth.isAuthenticated()) {
        Utils.showAlert('Vous devez être connecté pour ajouter des produits aux favoris', 'error');
        setTimeout(() => {
            window.location.href = `login.html?return=${encodeURIComponent(window.location.href)}`;
        }, 2000);
        return;
    }
    
    try {
        const user = auth.getCurrentUser();
        await api.addToWishlist(productId, user.id);
        Utils.showAlert('Produit ajouté aux favoris !', 'success');
    } catch (error) {
        console.error('Erreur ajout favoris:', error);
        Utils.showAlert('Erreur lors de l\'ajout aux favoris', 'error');
    }
}