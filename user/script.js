// Toggle "View More" text in Product Details
function toggleText() {
    var moreText = document.getElementById("more-text");
    var btnText = document.getElementById("view-more-btn");

    if (moreText.style.display === "none") {
        moreText.style.display = "inline";
        btnText.innerHTML = "view less";
    } else {
        moreText.style.display = "none";
        btnText.innerHTML = "view more";
    }
}

// Cart Functionality
document.addEventListener('DOMContentLoaded', function () {
    const cartTableBody = document.getElementById('cart-table-body');
    const wishlistContainer = document.getElementById('wishlist-container');
    const checkoutProductList = document.getElementById('checkout-product-list');
    const wishlistCountEl = document.getElementById('wishlist-count');
    const btnClearWishlist = document.getElementById('btn-clear-wishlist');
    const btnMoveAllCart = document.getElementById('btn-move-all-cart');
    const cartSubtotalEl = document.getElementById('cart-subtotal');
    const cartTotalEl = document.getElementById('cart-total');
    const checkoutSubtotalEl = document.getElementById('checkout-subtotal');
    const checkoutTotalEl = document.getElementById('checkout-total');
    const placeOrderBtn = document.getElementById('place-order-btn');
    const shippingCost = 20;

    // --- Checkout Logic ---
    if (checkoutProductList) {
        renderCheckout();

        if (placeOrderBtn) {
            placeOrderBtn.addEventListener('click', function (e) {
                e.preventDefault();
                // Simple validation - check if cart is empty
                let cart = JSON.parse(localStorage.getItem('kmStoreCart')) || [];
                if (cart.length === 0) {
                    alert('Your cart is empty!');
                    return;
                }

                // Validate form (basic)
                const form = document.getElementById('billing-form');
                if (form.checkValidity()) {
                    // Success
                    Swal.fire({
                        title: 'Order Placed Successfully!',
                        text: 'Thank you for shopping with us.',
                        icon: 'success',
                        confirmButtonText: 'Continue Shopping',
                        confirmButtonColor: '#28a745'
                    }).then((result) => {
                        if (result.isConfirmed) {
                            localStorage.removeItem('kmStoreCart'); // Clear cart
                            window.location.href = 'homepage.html'; // Redirect to home
                        }
                    });
                } else {
                    form.reportValidity();
                }
            });
        }
    }

    function renderCheckout() {
        let cart = JSON.parse(localStorage.getItem('kmStoreCart')) || [];
        checkoutProductList.innerHTML = '';
        let subtotal = 0;

        if (cart.length === 0) {
            checkoutProductList.innerHTML = '<p class="text-muted">Your cart is empty.</p>';
        }

        cart.forEach(item => {
            const itemTotal = item.price * item.quantity;
            subtotal += itemTotal;

            const div = document.createElement('div');
            div.classList.add('d-flex', 'justify-content-between', 'align-items-center', 'mb-3');
            div.innerHTML = `
                <div class="d-flex align-items-center gap-3">
                    <img src="${item.image}" alt="${item.name}" class="checkout-item-img">
                    <span class="small">${item.name} <span class="text-danger">x ${item.quantity}</span></span>
                </div>
                <span class="small text-muted">₹${itemTotal}</span>
            `;
            checkoutProductList.appendChild(div);
        });

        if (checkoutSubtotalEl) checkoutSubtotalEl.textContent = '₹' + subtotal;
        if (checkoutTotalEl) checkoutTotalEl.textContent = '₹' + subtotal; // Assuming free shipping as per design text, or add shippingCost
    }


    // --- Wishlist Logic ---

    // Bulk Actions
    if (btnClearWishlist) {
        btnClearWishlist.addEventListener('click', function () {
            if (confirm('Are you sure you want to clear your wishlist?')) {
                localStorage.removeItem('kmStoreWishlist');
                renderWishlist();
            }
        });
    }

    if (btnMoveAllCart) {
        btnMoveAllCart.addEventListener('click', function () {
            let wishlist = JSON.parse(localStorage.getItem('kmStoreWishlist')) || [];
            if (wishlist.length === 0) return;

            if (confirm('Move all items to cart?')) {
                wishlist.forEach(item => {
                    // Create cart compatible product object
                    const product = {
                        name: item.name,
                        price: item.price,
                        image: item.image,
                        quantity: 1
                    };
                    addToCart(product, false); // Pass false to prevent redirect for each item
                });

                // Clear wishlist after moving
                localStorage.removeItem('kmStoreWishlist');
                renderWishlist();

                // Redirect to cart once after all added
                window.location.href = 'cart.html';
            }
        });
    }

    // Generic Wishlist Buttons (Homepage/Product Page)
    document.body.addEventListener('click', function (e) {
        if (e.target.closest('.btn-wishlist')) {
            const btn = e.target.closest('.btn-wishlist');
            const card = btn.closest('.product-card');

            const product = {
                name: card.querySelector('.product-title').innerText,
                price: parseFloat(card.querySelector('.product-price').innerText.replace('₹', '')),
                image: card.querySelector('.card-img-top').src,
                originalPrice: card.querySelector('.product-price-old') ? card.querySelector('.product-price-old').innerText : null
            };

            addToWishlist(product);
            btn.querySelector('i').classList.remove('far');
            btn.querySelector('i').classList.add('fas', 'text-danger');
        }
    });

    function addToWishlist(product) {
        let wishlist = JSON.parse(localStorage.getItem('kmStoreWishlist')) || [];

        // Check if exists
        if (!wishlist.some(item => item.name === product.name)) {
            wishlist.push(product);
            localStorage.setItem('kmStoreWishlist', JSON.stringify(wishlist));
            updateWishlistCount();
            // Optional: Show toast
        }
    }

    function updateWishlistCount() {
        let wishlist = JSON.parse(localStorage.getItem('kmStoreWishlist')) || [];
        // Update header count if element exists (you might need to add ID to header heart icon)
        // For now, updating specific page element if present
        if (wishlistCountEl) wishlistCountEl.textContent = wishlist.length;
    }

    if (wishlistContainer) {
        renderWishlist();

        wishlistContainer.addEventListener('click', function (e) {
            if (e.target.closest('.btn-remove-wishlist')) {
                const btn = e.target.closest('.btn-remove-wishlist');
                const name = btn.getAttribute('data-name');
                removeFromWishlist(name);
            } else if (e.target.closest('.btn-add-cart-wishlist')) {
                const btn = e.target.closest('.btn-add-cart-wishlist');
                const name = btn.getAttribute('data-name');
                const price = parseFloat(btn.getAttribute('data-price'));
                const image = btn.getAttribute('data-image');

                const product = {
                    name: name,
                    price: price,
                    image: image,
                    quantity: 1
                };
                addToCart(product);
            }
        });
    }

    function renderWishlist() {
        let wishlist = JSON.parse(localStorage.getItem('kmStoreWishlist')) || [];
        wishlistContainer.innerHTML = '';

        if (wishlist.length === 0) {
            wishlistContainer.innerHTML = '<div class="col-12 text-center py-5"><p class="text-muted">Your wishlist is empty.</p></div>';
            updateWishlistCount();
            return;
        }

        wishlist.forEach(item => {
            const discountBadge = item.originalPrice ? `<span class="badge bg-danger position-absolute top-0 start-0 m-3">-10%</span>` : '';
            const oldPrice = item.originalPrice ? `<span class="text-muted text-decoration-line-through small">${item.originalPrice}</span>` : '';

            const col = document.createElement('div');
            col.classList.add('col');
            col.innerHTML = `
                <div class="card product-card h-100 position-relative">
                    ${discountBadge}
                    <a href="single-product.html">
                        <img src="${item.image}" class="card-img-top p-3" alt="${item.name}">
                    </a>
                    <div class="card-body text-center p-2">
                        <h6 class="product-title">${item.name}</h6>
                        <div class="mb-3 text-start ps-2">
                             <span class="product-price">₹${item.price}</span>
                             ${oldPrice}
                        </div>
                        <div class="d-flex gap-2 align-items-center justify-content-center">
                             <button class="btn btn-light border rounded-circle btn-remove-wishlist" data-name="${item.name}" style="width: 40px; height: 40px;"><i class="fas fa-trash text-danger"></i></button>
                             <button class="btn btn-add-cart w-100">Add to cart</button>
                        </div>
                    </div>
                </div>
            `;
            wishlistContainer.appendChild(col);
        });
        updateWishlistCount();
    }

    function removeFromWishlist(name) {
        let wishlist = JSON.parse(localStorage.getItem('kmStoreWishlist')) || [];
        wishlist = wishlist.filter(item => item.name !== name);
        localStorage.setItem('kmStoreWishlist', JSON.stringify(wishlist));
        renderWishlist();
    }


    // --- Add to Cart Logic ---

    // Generic Add to Cart Buttons (Homepage/Product Page)
    document.body.addEventListener('click', function (e) {
        if (e.target.closest('.btn-add-cart')) {
            const btn = e.target.closest('.btn-add-cart');
            const card = btn.closest('.product-card');

            const product = {
                name: card.querySelector('.product-title').innerText,
                price: parseFloat(card.querySelector('.product-price').innerText.replace('₹', '')),
                image: card.querySelector('.card-img-top').src,
                quantity: 1
            };

            addToCart(product);
        }
    });

    // Single Product Add to Cart Button
    const singleProductBtn = document.querySelector('.btn-add-cart-lg');
    if (singleProductBtn) {
        singleProductBtn.addEventListener('click', function () {
            const quantityInput = document.querySelector('.quantity-selector input') ||
                document.querySelector('.quantity-selector-sm input'); // Fallback if re-using classes

            // In single-product.html structure
            const titleEl = document.querySelector('h2.fw-bold'); // Assuming h2 is title
            const priceEl = document.querySelector('h3.fw-bold'); // Assuming h3 is price
            const imgEl = document.querySelector('.main-product-img');

            if (titleEl && priceEl && imgEl) {
                const product = {
                    name: titleEl.innerText,
                    price: parseFloat(priceEl.innerText.replace('₹', '')),
                    image: imgEl.src,
                    quantity: quantityInput ? parseInt(quantityInput.value) : 1
                };
                addToCart(product);
            }
        });
    }

    function addToCart(product, redirect = true) {
        let cart = JSON.parse(localStorage.getItem('kmStoreCart')) || [];

        // Check if product exists
        const existingItemIndex = cart.findIndex(item => item.name === product.name);

        if (existingItemIndex > -1) {
            cart[existingItemIndex].quantity += product.quantity;
        } else {
            cart.push(product);
        }

        localStorage.setItem('kmStoreCart', JSON.stringify(cart));

        // Redirect to cart page
        if (redirect) {
            window.location.href = 'cart.html';
        }
    }


    // --- Cart Page Logic ---

    if (cartTableBody) {
        renderCart();

        cartTableBody.addEventListener('click', function (e) {
            if (e.target.classList.contains('quantity-btn')) {
                const btn = e.target;
                const action = btn.getAttribute('data-action');
                const row = btn.closest('tr');
                const name = row.getAttribute('data-product-name');

                updateCartItemQuantity(name, action);
            } else if (e.target.closest('.btn-remove-cart')) {
                const btn = e.target.closest('.btn-remove-cart');
                const row = btn.closest('tr');
                const name = row.getAttribute('data-product-name');

                removeFromCart(name);
            }
        });
    }

    function renderCart() {
        let cart = JSON.parse(localStorage.getItem('kmStoreCart')) || [];
        cartTableBody.innerHTML = '';

        if (cart.length === 0) {
            cartTableBody.innerHTML = '<tr><td colspan="5" class="text-center py-4">Your cart is empty.</td></tr>';
            if (cartSubtotalEl) cartSubtotalEl.textContent = '₹0';
            if (cartTotalEl) cartTotalEl.textContent = '₹0';
            return;
        }

        cart.forEach(item => {
            const subtotal = item.price * item.quantity;
            const row = document.createElement('tr');
            row.classList.add('border-bottom', 'cart-item-row');
            row.setAttribute('data-product-name', item.name);

            row.innerHTML = `
                <td class="ps-4 py-4">
                    <div class="d-flex align-items-center gap-3">
                        <div class="cart-img-wrapper rounded p-2 border">
                            <img src="${item.image}" alt="${item.name}" class="img-fluid">
                        </div>
                        <span class="fw-semibold text-dark">${item.name}</span>
                    </div>
                </td>
                <td class="fw-semibold product-price" data-price="${item.price}">₹${item.price}</td>
                <td>
                    <div class="quantity-selector-sm d-flex align-items-center border rounded">
                        <button class="btn btn-sm btn-light rounded-0 border-0 px-2 quantity-btn" data-action="decrease">-</button>
                        <input type="text" value="${item.quantity}" class="form-control form-control-sm text-center border-0 p-0 shadow-none bg-white quantity-input" readonly style="width: 30px;">
                        <button class="btn btn-sm btn-light rounded-0 border-0 px-2 quantity-btn" data-action="increase">+</button>
                    </div>
                </td>
                <td class="fw-semibold text-end pe-4 product-subtotal">₹${subtotal}</td>
                <td class="text-center pe-4">
                    <button class="btn btn-sm text-danger btn-remove-cart"><i class="fas fa-trash"></i></button>
                </td>
            `;
            cartTableBody.appendChild(row);
        });

        updateCartTotal();
    }

    function removeFromCart(name) {
        let cart = JSON.parse(localStorage.getItem('kmStoreCart')) || [];
        cart = cart.filter(item => item.name !== name);
        localStorage.setItem('kmStoreCart', JSON.stringify(cart));
        renderCart();
    }

    function updateCartItemQuantity(name, action) {
        let cart = JSON.parse(localStorage.getItem('kmStoreCart')) || [];
        const itemIndex = cart.findIndex(item => item.name === name);

        if (itemIndex > -1) {
            if (action === 'increase') {
                cart[itemIndex].quantity++;
            } else if (action === 'decrease') {
                if (cart[itemIndex].quantity > 1) {
                    cart[itemIndex].quantity--;
                } else {
                    // Start of logic to remove item if desired, strictly requested min 1 but let's keep it safe
                    // For now, simple min 1
                }
            }
            localStorage.setItem('kmStoreCart', JSON.stringify(cart));
            renderCart();
        }
    }

    function updateCartTotal() {
        let cart = JSON.parse(localStorage.getItem('kmStoreCart')) || [];
        let totalSubtotal = 0;

        cart.forEach(item => {
            totalSubtotal += item.price * item.quantity;
        });

        if (cartSubtotalEl) {
            cartSubtotalEl.textContent = '₹' + totalSubtotal;
            cartTotalEl.textContent = '₹' + (totalSubtotal + shippingCost);
        }
    }

    // --- Hot Deals Slider Logic ---
    const hotDealsTrack = document.getElementById('hot-deals-track');
    const prevBtn = document.getElementById('hot-deals-prev');
    const nextBtn = document.getElementById('hot-deals-next');

    if (hotDealsTrack && prevBtn && nextBtn) {
        nextBtn.addEventListener('click', () => {
            const scrollAmount = hotDealsTrack.clientWidth / 2; // Scroll half container width
            hotDealsTrack.scrollBy({ left: scrollAmount, behavior: 'smooth' });
        });

        prevBtn.addEventListener('click', () => {
            const scrollAmount = hotDealsTrack.clientWidth / 2;
            hotDealsTrack.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
        });
    }
});
