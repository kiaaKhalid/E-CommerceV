// Gestion de l'authentification
class AuthManager {
    constructor() {
        this.currentUser = null;
        this.init();
    }

    async init() {
        // Vérifier si l'utilisateur est connecté au chargement de la page
        await this.checkAuthStatus();
        this.updateNavigation();
    }

    async checkAuthStatus() {
        try {
            const response = await api.checkAuth();
            if (response.authenticated) {
                this.currentUser = response.user;
                Storage.set('currentUser', this.currentUser);
                return true;
            } else {
                this.currentUser = null;
                Storage.remove('currentUser');
                return false;
            }
        } catch (error) {
            console.error('Erreur lors de la vérification de l\'authentification:', error);
            this.currentUser = null;
            Storage.remove('currentUser');
            return false;
        }
    }

    async login(email, password) {
        try {
            const response = await api.login(email, password);
            if (response.success) {
                this.currentUser = response.user;
                Storage.set('currentUser', this.currentUser);
                this.updateNavigation();
                Utils.showAlert('Connexion réussie !', 'success');
                return true;
            } else {
                Utils.showAlert(response.message || 'Erreur de connexion', 'error');
                return false;
            }
        } catch (error) {
            console.error('Erreur de connexion:', error);
            Utils.showAlert(error.message || 'Erreur de connexion', 'error');
            return false;
        }
    }

    async register(userData) {
        try {
            const response = await api.register(userData);
            if (response.success) {
                Utils.showAlert('Inscription réussie ! Vous pouvez maintenant vous connecter.', 'success');
                return true;
            } else {
                Utils.showAlert(response.message || 'Erreur lors de l\'inscription', 'error');
                return false;
            }
        } catch (error) {
            console.error('Erreur d\'inscription:', error);
            Utils.showAlert(error.message || 'Erreur lors de l\'inscription', 'error');
            return false;
        }
    }

    async logout() {
        try {
            await api.logout();
            this.currentUser = null;
            Storage.remove('currentUser');
            this.updateNavigation();
            Utils.showAlert('Déconnexion réussie !', 'success');
            
            // Rediriger vers la page d'accueil
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 1000);
        } catch (error) {
            console.error('Erreur de déconnexion:', error);
            Utils.showAlert('Erreur lors de la déconnexion', 'error');
        }
    }

    updateNavigation() {
        const navAuth = document.getElementById('nav-auth');
        const navUser = document.getElementById('nav-user');
        const userName = document.getElementById('user-name');

        if (this.currentUser) {
            if (navAuth) navAuth.style.display = 'none';
            if (navUser) navUser.style.display = 'flex';
            if (userName) userName.textContent = this.currentUser.name;
            
            // Ajouter le lien admin si l'utilisateur est admin
            this.updateAdminAccess();
        } else {
            if (navAuth) navAuth.style.display = 'flex';
            if (navUser) navUser.style.display = 'none';
        }
        
        // Mettre à jour le compteur du panier
        this.updateCartCount();
    }

    updateAdminAccess() {
        if (this.currentUser && this.currentUser.role === 'admin') {
            const navMenu = document.querySelector('.nav-menu');
            if (navMenu && !document.getElementById('admin-link')) {
                const adminLink = document.createElement('a');
                adminLink.href = 'admin.html';
                adminLink.className = 'nav-link';
                adminLink.id = 'admin-link';
                adminLink.innerHTML = '<i class="fas fa-cog"></i> Admin';
                navMenu.insertBefore(adminLink, navMenu.querySelector('.nav-auth, .nav-user'));
            }
        } else {
            const adminLink = document.getElementById('admin-link');
            if (adminLink) {
                adminLink.remove();
            }
        }
    }

    async updateCartCount() {
        if (this.currentUser) {
            try {
                const cartItems = await api.getCart(this.currentUser.id);
                const cartCount = document.getElementById('cart-count');
                if (cartCount) {
                    const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
                    cartCount.textContent = totalItems;
                }
            } catch (error) {
                console.error('Erreur lors de la mise à jour du compteur panier:', error);
            }
        }
    }

    isAuthenticated() {
        return this.currentUser !== null;
    }

    isAdmin() {
        return this.currentUser && this.currentUser.role === 'admin';
    }

    getCurrentUser() {
        return this.currentUser;
    }

    requireAuth() {
        if (!this.isAuthenticated()) {
            Utils.showAlert('Vous devez être connecté pour accéder à cette page', 'error');
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 2000);
            return false;
        }
        return true;
    }

    requireAdmin() {
        if (!this.isAdmin()) {
            Utils.showAlert('Vous devez être administrateur pour accéder à cette page', 'error');
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 2000);
            return false;
        }
        return true;
    }
}

// Instance globale du gestionnaire d'authentification
const auth = new AuthManager();

// Fonction globale pour la déconnexion (appelée depuis le HTML)
async function logout() {
    await auth.logout();
}

// Gestion des formulaires de connexion et d'inscription
document.addEventListener('DOMContentLoaded', function() {
    // Formulaire de connexion
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            
            if (!email || !password) {
                Utils.showAlert('Veuillez remplir tous les champs', 'error');
                return;
            }
            
            const success = await auth.login(email, password);
            if (success) {
                // Rediriger vers la page précédente ou l'accueil
                const returnUrl = new URLSearchParams(window.location.search).get('return') || 'index.html';
                window.location.href = returnUrl;
            }
        });
    }
    
    // Formulaire d'inscription
    const registerForm = document.getElementById('register-form');
    if (registerForm) {
        registerForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const formData = new FormData(registerForm);
            const userData = Object.fromEntries(formData);
            
            // Validation basique
            if (!userData.name || !userData.email || !userData.password) {
                Utils.showAlert('Veuillez remplir tous les champs obligatoires', 'error');
                return;
            }
            
            if (userData.password !== userData.confirmPassword) {
                Utils.showAlert('Les mots de passe ne correspondent pas', 'error');
                return;
            }
            
            delete userData.confirmPassword;
            
            const success = await auth.register(userData);
            if (success) {
                setTimeout(() => {
                    window.location.href = 'login.html';
                }, 2000);
            }
        });
    }
});