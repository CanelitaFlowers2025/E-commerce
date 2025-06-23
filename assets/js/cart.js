// Global cart array to store products
let cart = [];

// DOM element selections
const addToCartButtons = document.querySelectorAll('.add-to-cart-btn');
const cartItemsContainer = document.getElementById('cart-items'); // For Producto.html's cart display
const cartTotalPriceSpan = document.getElementById('cart-total-price'); // For Producto.html's total price
const clearCartButton = document.getElementById('clear-cart-btn'); // For Producto.html's clear cart button
const cartIconBtn = document.getElementById('cart-icon-btn');
const cartSection = document.getElementById('cart-section');
const cartCountBadge = document.getElementById('cart-count-badge');
const closeCartBtn = document.getElementById('close-cart-btn');
const productSearchInput = document.getElementById('product-search');

// Select elements for Checkout page (these will be null if not on checkout.html)
const cartSummaryContainer = document.querySelector('.cart-summary');
const subtotalSpan = document.querySelector('.cart-totals p:nth-child(1) .fw-bold');
const shippingSpan = document.querySelector('.cart-totals p:nth-child(2) .fw-bold');
const totalSpan = document.querySelector('.cart-totals .h4 .fw-bold');

// Mapping product names to image paths for the checkout summary
const productImages = {
    "Catalina Pink Seamless Sport Set": "./recursos/imagenes/outfit1.jpg",
    "Amanda Blue Seamless Sport Set": "./recursos/imagenes/outfit2.jpg",
    "Kimia Seamless Sport Set": "./recursos/imagenes/outfit3.jpg",
    "Malva Red Seamless Sport Set": "./recursos/imagenes/outfit4.jpg",
    "Sun Orange Seamless Sport Set": "./recursos/imagenes/outfit5.jpg",
    "Brazilian Green Seamless Sport Set": "./recursos/imagenes/outfit6.jpg"
};

// Function to save cart data to localStorage
function saveCart() {
    localStorage.setItem('cart', JSON.stringify(cart));
}

// Function to load cart data from localStorage
function loadCart() {
    const storedCart = localStorage.getItem('cart');
    if (storedCart) {
        cart = JSON.parse(storedCart);
    }
}

// Adds a product to the cart array
function addProductToCart(event) {
    const productCard = event.target.closest('.product-card');
    const productName = productCard.querySelector('h3').innerText;
    // Price needs to be parsed carefully, removing any thousands separators
    const productPriceText = productCard.querySelector('.product-price').innerText;
    const productPrice = parseFloat(productPriceText.replace('$', '').replace(/\./g, '')); // Handles "200.000" correctly
    const quantityInput = productCard.querySelector('.quantity-input');
    const quantity = parseInt(quantityInput.value);

    const existingItemIndex = cart.findIndex(item => item.name === productName);

    if (existingItemIndex > -1) {
        cart[existingItemIndex].quantity += quantity;
    } else {
        cart.push({ name: productName, price: productPrice, quantity: quantity });
    }

    saveCart();
    renderCart(); // Update cart display for Producto.html
}

// Removes a product from the cart array
function removeProductFromCart(event) {
    const index = parseInt(event.target.dataset.index);
    cart.splice(index, 1);
    saveCart();
    renderCart(); // Update cart display for Producto.html
}

// Clears all products from the cart
function clearCart() {
    cart = [];
    saveCart();
    renderCart(); // Update cart display for Producto.html
}

// Formats numbers with thousands separators and no decimal places
const priceFormatter = new Intl.NumberFormat('es-CO', {
    style: 'decimal',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
});

// Renders the cart items and total on Producto.html
function renderCart() {
    if (cartItemsContainer) { // Ensure elements exist (i.e., we are on Producto.html)
        cartItemsContainer.innerHTML = '';
        let total = 0;
        let totalItemsInCart = 0;

        if (cart.length === 0) {
            cartItemsContainer.innerHTML = '<p>Your car is empty.</p>';
            if (cartTotalPriceSpan) cartTotalPriceSpan.innerText = '0'; // Display 0 for empty cart
            if (cartCountBadge) {
                cartCountBadge.innerText = '0';
                cartCountBadge.style.display = 'none';
            }
            return;
        }

        cart.forEach((item, index) => {
            const itemTotal = item.price * item.quantity;
            const itemElement = document.createElement('div');
            itemElement.classList.add('cart-item');
            itemElement.innerHTML = `
                <span>${item.name} (x${item.quantity})</span>
                <span>$${priceFormatter.format(itemTotal)}</span>
                <button class="remove-from-cart-btn" data-index="${index}">Delete</button>
            `;
            cartItemsContainer.appendChild(itemElement);
            total += itemTotal;
            totalItemsInCart += item.quantity;
        });

        if (cartTotalPriceSpan) cartTotalPriceSpan.innerText = priceFormatter.format(total);
        if (cartCountBadge) {
            cartCountBadge.innerText = totalItemsInCart;
            cartCountBadge.style.display = 'block';
        }

        addRemoveButtonListeners();
    }
}

// Attaches event listeners to 'Delete' buttons in the cart display
function addRemoveButtonListeners() {
    const removeButtons = document.querySelectorAll('.remove-from-cart-btn');
    removeButtons.forEach(button => {
        button.removeEventListener('click', removeProductFromCart); // Prevent duplicate listeners
        button.addEventListener('click', removeProductFromCart);
    });
}

// Filters products on Producto.html based on search input
function filterProducts() {
    const searchTerm = productSearchInput.value.toLowerCase();
    const productCards = document.querySelectorAll('.product-card');

    productCards.forEach(card => {
        const productName = card.querySelector('h3').innerText.toLowerCase();
        if (productName.includes(searchTerm)) {
            card.style.display = 'block';
        } else {
            card.style.display = 'none';
        }
    });
}

// Renders the order summary on checkout.html
function renderCheckoutSummary() {
    if (cartSummaryContainer) { // Ensure elements exist (i.e., we are on checkout.html)
        cartSummaryContainer.innerHTML = ''; // Clear existing content
        let subtotal = 0;

        if (cart.length === 0) {
            cartSummaryContainer.innerHTML = '<p class="p-3">Your cart is empty.</p>';
            if (subtotalSpan) subtotalSpan.innerText = '$0';
            if (shippingSpan) shippingSpan.innerText = '$0';
            if (totalSpan) totalSpan.innerText = '$0';
            return;
        }

        cart.forEach(item => {
            const itemTotal = item.price * item.quantity;
            subtotal += itemTotal;

            const itemElement = document.createElement('div');
            itemElement.classList.add('d-flex', 'align-items-center', 'mb-3', 'pb-3', 'border-bottom');
            itemElement.innerHTML = `
                <img src="${productImages[item.name] || './recursos/imagenes/placeholder.jpg'}" alt="${item.name}" class="img-fluid me-3" style="width: 80px; height: 80px; object-fit: cover; border-radius: 5px;">
                <div>
                    <h5 class="mb-0" style="color: #4A4A4A; font-size: 1.2rem;">${item.name}</h5>
                    <p class="mb-0 text-muted" style="font-size: 0.95rem;">Qty: ${item.quantity}</p>
                    <span class="fw-bold" style="color: #CC66FF;">$${priceFormatter.format(itemTotal)}</span>
                </div>
            `;
            cartSummaryContainer.appendChild(itemElement);
        });

        const shippingCost = 15000; // Example shipping cost. Keep as a number.
        const total = subtotal + shippingCost;

        // Append the totals section
        const totalsElement = document.createElement('div');
        totalsElement.classList.add('cart-totals', 'mt-4', 'pt-3', 'border-top');
        totalsElement.innerHTML = `
            <p class="d-flex justify-content-between mb-2" style="font-size: 1.1rem;">Subtotal: <span class="fw-bold">$${priceFormatter.format(subtotal)}</span></p>
            <p class="d-flex justify-content-between mb-2" style="font-size: 1.1rem;">Shipping: <span class="fw-bold">$${priceFormatter.format(shippingCost)}</span></p>
            <p class="d-flex justify-content-between h4 mb-0" style="color: #8A4F7D;">Total: <span class="fw-bold">$${priceFormatter.format(total)}</span></p>
        `;
        cartSummaryContainer.appendChild(totalsElement);
    }
}

// Updates only the cart count badge in the header for all pages
function renderCartCountBadge() {
    if (cartCountBadge) {
        let totalItemsInCart = 0;
        cart.forEach(item => totalItemsInCart += item.quantity);
        cartCountBadge.innerText = totalItemsInCart;
        cartCountBadge.style.display = totalItemsInCart > 0 ? 'block' : 'none';
    }
}

// Initialize on DOM content loaded
document.addEventListener('DOMContentLoaded', () => {
    loadCart(); // Load cart data from localStorage first

    // Check current page by body class to render relevant content
    if (document.body.classList.contains('product-page')) {
        // Event listeners specific to Producto.html
        addToCartButtons.forEach(button => {
            button.addEventListener('click', addProductToCart);
        });
        if (clearCartButton) clearCartButton.addEventListener('click', clearCart);
        if (cartIconBtn) {
            cartIconBtn.addEventListener('click', () => {
                if (cartSection) cartSection.classList.toggle('show');
            });
        }
        if (closeCartBtn) {
            closeCartBtn.addEventListener('click', () => {
                if (cartSection) cartSection.classList.remove('show');
            });
        }
        if (productSearchInput) productSearchInput.addEventListener('keyup', filterProducts);
        renderCart(); // Render full cart display for Producto.html
    } else if (document.body.classList.contains('checkout-page')) {
        renderCheckoutSummary(); // Render order summary for checkout.html
    } else {
        // For other pages, just ensure the cart count badge is updated
        renderCartCountBadge();
    }
});