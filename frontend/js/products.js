// JavaScript pour la page des produits
let currentProducts = [];
let currentPage = 1;
const itemsPerPage = 12;

document.addEventListener('DOMContentLoaded', async function() {
    await loadCategories();
    await loadProducts();
    setupFilters();
    handleUrlParameters();
});

// Charger les catégories dans le filtre
async function loadCategories() {
    try {
        const categories = await api.getCategories();
        const categoryFilter = document.getElementById('category-filter');
        
        categories.forEach(category => {
            const option = document.createElement('option');
            option.value = category.name;
            option.textContent = category.name;
            categoryFilter.appendChild(option);
        });
    } catch (error) {
        console.error('Erreur lors du chargement des catégories:', error);
    }
}

// Charger tous les produits
async function loadProducts() {
    const productsGrid = document.getElementById('products-grid');
    Utils.showLoading(productsGrid);

    try {
        const products = await api.getProducts();
        currentProducts = products;
        displayProducts(currentProducts);
        updateProductsCount();
    } catch (error) {
        console.error('Erreur lors du chargement des produits:', error);
        productsGrid.innerHTML = '<p>Erreur lors du chargement des produits</p>';
    }
}

// Afficher les produits
function displayProducts(products) {
    const productsGrid = document.getElementById('products-grid');
    productsGrid.innerHTML = '';

    if (products.length === 0) {
        productsGrid.innerHTML = '<p style="text-align: center; grid-column: 1/-1; padding: 2rem;">Aucun produit trouvé</p>';
        return;
    }

    // Pagination
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedProducts = products.slice(startIndex, endIndex);

    paginatedProducts.forEach(product => {
        const productCard = createProductCard(product);
        productsGrid.appendChild(productCard);
    });

    setupPagination(products.length);
}

// Configuration des filtres
function setupFilters() {
    const categoryFilter = document.getElementById('category-filter');
    const searchFilter = document.getElementById('search-filter');
    const searchBtn = document.getElementById('search-btn-filter');
    const sortFilter = document.getElementById('sort-filter');
    const clearBtn = document.getElementById('clear-filters');

    // Événements des filtres
    categoryFilter.addEventListener('change', applyFilters);
    sortFilter.addEventListener('change', applyFilters);
    searchBtn.addEventListener('click', applyFilters);
    clearBtn.addEventListener('click', clearFilters);

    searchFilter.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            applyFilters();
        }
    });
}

// Appliquer les filtres
async function applyFilters() {
    const categoryFilter = document.getElementById('category-filter').value;
    const searchFilter = document.getElementById('search-filter').value;
    const sortFilter = document.getElementById('sort-filter').value;

    let filteredProducts = [...currentProducts];

    // Filtre par catégorie
    if (categoryFilter) {
        filteredProducts = filteredProducts.filter(product => 
            product.category_name === categoryFilter
        );
    }

    // Filtre par recherche
    if (searchFilter) {
        const searchTerm = searchFilter.toLowerCase();
        filteredProducts = filteredProducts.filter(product =>
            product.name.toLowerCase().includes(searchTerm) ||
            product.description.toLowerCase().includes(searchTerm)
        );
    }

    // Tri
    filteredProducts.sort((a, b) => {
        switch (sortFilter) {
            case 'price':
                return parseFloat(a.price) - parseFloat(b.price);
            case 'price-desc':
                return parseFloat(b.price) - parseFloat(a.price);
            case 'date':
                return new Date(b.created_at) - new Date(a.created_at);
            case 'name':
            default:
                return a.name.localeCompare(b.name);
        }
    });

    currentPage = 1; // Reset à la première page
    displayProducts(filteredProducts);
    updateProductsCount(filteredProducts.length);
    updateProductsTitle();
}

// Effacer les filtres
function clearFilters() {
    document.getElementById('category-filter').value = '';
    document.getElementById('search-filter').value = '';
    document.getElementById('sort-filter').value = 'name';
    
    currentPage = 1;
    displayProducts(currentProducts);
    updateProductsCount();
    updateProductsTitle();
}

// Mettre à jour le compteur de produits
function updateProductsCount(count = null) {
    const productsCount = document.getElementById('products-count');
    const total = count !== null ? count : currentProducts.length;
    productsCount.textContent = `${total} produit(s) trouvé(s)`;
}

// Mettre à jour le titre
function updateProductsTitle() {
    const categoryFilter = document.getElementById('category-filter').value;
    const searchFilter = document.getElementById('search-filter').value;
    const title = document.getElementById('products-title');
    
    if (searchFilter) {
        title.textContent = `Résultats pour "${searchFilter}"`;
    } else if (categoryFilter) {
        title.textContent = `Produits - ${categoryFilter}`;
    } else {
        title.textContent = 'Tous les produits';
    }
}

// Gérer les paramètres URL
function handleUrlParameters() {
    const urlParams = new URLSearchParams(window.location.search);
    const category = urlParams.get('category');
    const search = urlParams.get('search');

    if (category) {
        document.getElementById('category-filter').value = category;
        applyFilters();
    }

    if (search) {
        document.getElementById('search-filter').value = search;
        applyFilters();
    }
}

// Configuration de la pagination
function setupPagination(totalItems) {
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const pagination = document.getElementById('pagination');
    
    if (totalPages <= 1) {
        pagination.style.display = 'none';
        return;
    }

    pagination.style.display = 'block';
    pagination.innerHTML = '';

    // Bouton précédent
    if (currentPage > 1) {
        const prevBtn = document.createElement('button');
        prevBtn.className = 'btn btn-secondary';
        prevBtn.textContent = 'Précédent';
        prevBtn.onclick = () => changePage(currentPage - 1);
        pagination.appendChild(prevBtn);
    }

    // Numéros de pages
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
        startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
        const pageBtn = document.createElement('button');
        pageBtn.className = i === currentPage ? 'btn btn-primary' : 'btn btn-secondary';
        pageBtn.textContent = i;
        pageBtn.style.margin = '0 5px';
        pageBtn.onclick = () => changePage(i);
        pagination.appendChild(pageBtn);
    }

    // Bouton suivant
    if (currentPage < totalPages) {
        const nextBtn = document.createElement('button');
        nextBtn.className = 'btn btn-secondary';
        nextBtn.textContent = 'Suivant';
        nextBtn.onclick = () => changePage(currentPage + 1);
        pagination.appendChild(nextBtn);
    }
}

// Changer de page
function changePage(page) {
    currentPage = page;
    applyFilters();
    window.scrollTo({ top: 0, behavior: 'smooth' });
}