// Esperar a que el DOM esté listo
window.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('product-form');
    const formMessage = document.getElementById('form-message');
    const productsList = document.getElementById('products-list');
    const productFormContainer = document.getElementById('product-form-container');
    const authStatus = document.getElementById('auth-status');
    const loginLink = document.getElementById('login-link');
    const registerLink = document.getElementById('register-link');
    const logoutLink = document.getElementById('logout-link');
    const authModal = document.getElementById('auth-modal');
    const closeAuthModal = document.getElementById('close-auth-modal');
    const authForm = document.getElementById('auth-form');
    const authEmail = document.getElementById('auth-email');
    const authPassword = document.getElementById('auth-password');
    const authSubmitBtn = document.getElementById('auth-submit-btn');
    const switchAuthModeBtn = document.getElementById('switch-auth-mode');
    const googleSigninBtn = document.getElementById('google-signin-btn');
    const authErrorMessage = document.getElementById('auth-error-message');
    const authModalTitle = document.getElementById('auth-modal-title');
    const userWelcome = document.getElementById('user-welcome');

    let isLoginMode = true;
    let currentUser = null;

    // --- Autenticación Firebase ---
    function showAuthModal(loginMode = true) {
        isLoginMode = loginMode;
        authModalTitle.textContent = loginMode ? 'Iniciar Sesión' : 'Registrarse';
        authSubmitBtn.textContent = loginMode ? 'Iniciar Sesión' : 'Registrarse';
        switchAuthModeBtn.textContent = loginMode ? '¿No tienes cuenta? Regístrate' : '¿Ya tienes cuenta? Inicia sesión';
        authErrorMessage.textContent = '';
        authForm.reset();
        authModal.style.display = 'block';
    }
    function closeModal() {
        authModal.style.display = 'none';
    }
    if (loginLink) loginLink.onclick = (e) => { e.preventDefault(); showAuthModal(true); };
    if (registerLink) registerLink.onclick = (e) => { e.preventDefault(); showAuthModal(false); };
    if (closeAuthModal) closeAuthModal.onclick = closeModal;
    if (switchAuthModeBtn) switchAuthModeBtn.onclick = () => showAuthModal(!isLoginMode);
    window.onclick = function(event) { if (event.target === authModal) closeModal(); };

    // Email/Password Auth
    if (authForm) {
        authForm.onsubmit = async (e) => {
            e.preventDefault();
            authErrorMessage.textContent = '';
            const email = authEmail.value.trim();
            const password = authPassword.value;
            try {
                if (isLoginMode) {
                    await auth.signInWithEmailAndPassword(email, password);
                } else {
                    await auth.createUserWithEmailAndPassword(email, password);
                }
                closeModal();
            } catch (err) {
                authErrorMessage.textContent = err.message;
            }
        };
    }
    // Google Auth
    if (googleSigninBtn) {
        googleSigninBtn.onclick = async () => {
            const provider = new firebase.auth.GoogleAuthProvider();
            try {
                await auth.signInWithPopup(provider);
                closeModal();
            } catch (err) {
                authErrorMessage.textContent = err.message;
            }
        };
    }
    // Logout
    if (logoutLink) logoutLink.onclick = (e) => { e.preventDefault(); auth.signOut(); };

    // Mostrar/ocultar formulario según autenticación
    auth.onAuthStateChanged(user => {
        currentUser = user;
        if (productFormContainer) {
            productFormContainer.style.display = user ? 'block' : 'none';
        }
        if (authStatus) {
            if (user) {
                authStatus.innerHTML = `<span class="user-info"><i class='fa-solid fa-user'></i> ${user.displayName || user.email}</span>`;
            } else {
                authStatus.innerHTML = '<span class="user-info">Debes iniciar sesión para publicar productos.</span>';
            }
        }
        if (loginLink) loginLink.style.display = user ? 'none' : 'inline-flex';
        if (registerLink) registerLink.style.display = user ? 'none' : 'inline-flex';
        if (logoutLink) logoutLink.style.display = user ? 'inline-flex' : 'none';
        // Mostrar mensaje de bienvenida y avatar
        if (userWelcome) {
            if (user) {
                let avatar = user.photoURL ? `<img src="${user.photoURL}" alt="avatar" class="avatar-img">` : `<span class="avatar-icon"><i class='fa-solid fa-user-circle'></i></span>`;
                userWelcome.style.display = 'inline-flex';
                userWelcome.innerHTML = `${avatar} <span class="welcome-msg">¡Bienvenido, ${user.displayName || user.email}!</span>`;
            } else {
                userWelcome.style.display = 'none';
                userWelcome.innerHTML = '';
            }
        }
        // Refrescar productos para mostrar/eliminar botones según usuario
        if (productsList) renderProducts();
    });

    // Lógica para crear productos (solo en createproducts.html)
    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            formMessage.textContent = '';
            const user = auth.currentUser;
            if (!user) {
                formMessage.textContent = 'Debes iniciar sesión para publicar productos.';
                formMessage.style.color = '#d32f2f';
                return;
            }
            const name = document.getElementById('product-name').value.trim();
            const description = document.getElementById('product-description').value.trim();
            const price = parseFloat(document.getElementById('product-price').value);
            if (!name || !description || isNaN(price)) {
                formMessage.textContent = 'Por favor, completa todos los campos.';
                formMessage.style.color = '#d32f2f';
                return;
            }
            try {
                await db.collection('products').add({
                    name,
                    description,
                    price,
                    createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                    userId: user.uid,
                    userEmail: user.email
                });
                formMessage.textContent = '¡Producto publicado exitosamente!';
                formMessage.style.color = '#388e3c';
                form.reset();
            } catch (error) {
                formMessage.textContent = 'Error al publicar el producto: ' + error.message;
                formMessage.style.color = '#d32f2f';
            }
        });
    }

    // Mostrar productos y permitir eliminar si es el creador
    function renderProducts() {
        productsList.innerHTML = '<p class="empty-message">Cargando productos...</p>';
        db.collection('products').orderBy('createdAt', 'desc').onSnapshot(snapshot => {
            if (snapshot.empty) {
                productsList.innerHTML = '<p class="empty-message">No hay productos publicados aún.</p>';
                return;
            }
            let html = '';
            snapshot.forEach(doc => {
                const product = doc.data();
                const date = product.createdAt && product.createdAt.toDate ? product.createdAt.toDate() : null;
                const canDelete = currentUser && product.userId === currentUser.uid;
                html += `
                <div class="product-card">
                    <h3><i class="fa-solid fa-tag"></i> ${product.name}</h3>
                    <p class="desc"><i class="fa-solid fa-align-left"></i> ${product.description}</p>
                    <p class="price"><i class="fa-solid fa-dollar-sign"></i> $${product.price.toFixed(2)}</p>
                    <p class="date"><i class="fa-regular fa-clock"></i> ${date ? date.toLocaleString('es-ES') : 'Sin fecha'}</p>
                    ${canDelete ? `<button class="btn btn-delete" data-id="${doc.id}"><i class="fa-solid fa-trash"></i> Eliminar</button>` : ''}
                </div>
                `;
            });
            productsList.innerHTML = html;
            // Asignar eventos a los botones de eliminar
            document.querySelectorAll('.btn-delete').forEach(btn => {
                btn.onclick = async (e) => {
                    const id = btn.getAttribute('data-id');
                    if (confirm('¿Seguro que deseas eliminar este producto?')) {
                        try {
                            await db.collection('products').doc(id).delete();
                        } catch (err) {
                            alert('Error al eliminar: ' + err.message);
                        }
                    }
                };
            });
        }, err => {
            productsList.innerHTML = '<p class="empty-message">Error al cargar productos.</p>';
        });
    }

    // Lógica para mostrar productos (solo en products.html)
    if (productsList) {
        renderProducts();
    }
});
