// Esperar a que el DOM esté listo
window.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('product-form');
    const formMessage = document.getElementById('form-message');
    const productsList = document.getElementById('products-list');

    // Lógica para crear productos (solo en createproducts.html)
    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            formMessage.textContent = '';

            const name = document.getElementById('product-name').value.trim();
            const description = document.getElementById('product-description').value.trim();
            const price = parseFloat(document.getElementById('product-price').value);

            if (!name || !description || isNaN(price)) {
                formMessage.textContent = 'Por favor, completa todos los campos.';
                formMessage.style.color = '#d32f2f';
                return;
            }

            try {
                // Guardar producto en Firestore (sin imagen)
                await db.collection('products').add({
                    name,
                    description,
                    price,
                    createdAt: firebase.firestore.FieldValue.serverTimestamp()
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

    // Lógica para mostrar productos (solo en products.html)
    if (productsList) {
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
                html += `
                <div class="product-card">
                    <h3><i class="fa-solid fa-tag"></i> ${product.name}</h3>
                    <p class="desc"><i class="fa-solid fa-align-left"></i> ${product.description}</p>
                    <p class="price"><i class="fa-solid fa-dollar-sign"></i> $${product.price.toFixed(2)}</p>
                    <p class="date"><i class="fa-regular fa-clock"></i> ${date ? date.toLocaleString('es-ES') : 'Sin fecha'}</p>
                </div>
                `;
            });
            productsList.innerHTML = html;
        }, err => {
            productsList.innerHTML = '<p class="empty-message">Error al cargar productos.</p>';
        });
    }
});
