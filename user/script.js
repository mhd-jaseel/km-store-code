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

// Check Login Status and Update Navbar
document.addEventListener('DOMContentLoaded', function () {
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    const signupLink = document.querySelector('a[href="signup.html"]');
    const accountLink = document.querySelector('a[href="account.html"]');
    const headerLoginBtn = document.getElementById('headerLoginBtn');

    if (isLoggedIn) {
        // User IS logged in
        if (signupLink) {
            signupLink.closest('li').style.display = 'none';
        }

        if (headerLoginBtn) {
            headerLoginBtn.style.display = 'none';
        }

        if (accountLink) {
            // Create Dropdown
            const dropdownHTML = `
                <div class="dropdown d-inline-block">
                    <a href="#" class="text-white text-decoration-none dropdown-toggle" id="accountDropdown" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                        <i class="fas fa-user me-1"></i> Account
                    </a>
                    <ul class="dropdown-menu dropdown-menu-end" aria-labelledby="accountDropdown">
                        <li><a class="dropdown-item" href="account.html">Account</a></li>
                        <li><a class="dropdown-item" href="my-orders.html">My Orders</a></li>
                        <li><hr class="dropdown-divider"></li>
                        <li><a class="dropdown-item" href="#" id="logoutBtn">Logout</a></li>
                    </ul>
                </div>
            `;
            accountLink.outerHTML = dropdownHTML;

            // Logout Functionality
            const logoutBtn = document.getElementById('logoutBtn');
            if (logoutBtn) {
                logoutBtn.addEventListener('click', function (e) {
                    e.preventDefault();
                    localStorage.removeItem('isLoggedIn');
                    window.location.href = 'homepage.html';
                });
            }
        }
    } else {
        // User is NOT logged in
        if (accountLink) {
            accountLink.style.display = 'none';
        }
        if (headerLoginBtn) {
            headerLoginBtn.style.display = 'inline';
        }
    }
});

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
            Swal.fire({
                title: 'Are you sure?',
                text: "You won't be able to revert this!",
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#d33',
                cancelButtonColor: '#3085d6',
                confirmButtonText: 'Yes, clear it!'
            }).then((result) => {
                if (result.isConfirmed) {
                    localStorage.removeItem('kmStoreWishlist');
                    renderWishlist();
                    Swal.fire(
                        'Cleared!',
                        'Your wishlist has been cleared.',
                        'success'
                    )
                }
            })
        });
    }

    if (btnMoveAllCart) {
        btnMoveAllCart.addEventListener('click', function () {
            let wishlist = JSON.parse(localStorage.getItem('kmStoreWishlist')) || [];
            if (wishlist.length === 0) return;

            Swal.fire({
                title: 'Move all to cart?',
                text: "This will clear your wishlist and move items to cart.",
                icon: 'question',
                showCancelButton: true,
                confirmButtonColor: '#3085d6',
                cancelButtonColor: '#d33',
                confirmButtonText: 'Yes, move them!'
            }).then((result) => {
                if (result.isConfirmed) {
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
            })
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
                Swal.fire({
                    title: 'Are you sure?',
                    text: "You won't be able to revert this!",
                    icon: 'warning',
                    showCancelButton: true,
                    confirmButtonColor: '#d33',
                    cancelButtonColor: '#3085d6',
                    confirmButtonText: 'Yes, delete it!'
                }).then((result) => {
                    if (result.isConfirmed) {
                        removeFromWishlist(name);
                        Swal.fire(
                            'Deleted!',
                            'Your item has been deleted.',
                            'success'
                        )
                    }
                })
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
                originalPrice: card.querySelector('.product-price-old') ? parseFloat(card.querySelector('.product-price-old').innerText.replace('₹', '')) : null,
                quantity: 1
            };

            addToCart(product, false);

            // Visual Feedback
            const originalText = btn.innerHTML; // Use innerHTML to preserve icons if we want, or just text? innerText is safer for text.
            // Let's just change text for now as requested.
            // If the button has an icon, we might lose it if we just set innerText. 
            // The existing buttons have "Add to cart" text. Some might have icons.
            // Looking at homepage.html: <button class="btn btn-add-cart">Add to cart</button> -> No icon inside text, but some might.
            // Let's safe check.

            btn.innerText = "Added";
            // Optional: change color? The user didn't explicitly ask, but "Added" implies success.
            // btn.classList.add('btn-success'); 

            setTimeout(() => {
                btn.innerHTML = originalText;
                // btn.classList.remove('btn-success');
            }, 2000);
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
                    originalPrice: null, // Assuming single product page logic can be enhanced later if needed, or parse if available
                    quantity: quantityInput ? parseInt(quantityInput.value) : 1
                };
                addToCart(product, false);

                // Visual Feedback
                const originalText = singleProductBtn.innerText;
                singleProductBtn.innerText = "Added";

                setTimeout(() => {
                    singleProductBtn.innerText = originalText;
                }, 2000);
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

                Swal.fire({
                    title: 'Are you sure?',
                    text: "You won't be able to revert this!",
                    icon: 'warning',
                    showCancelButton: true,
                    confirmButtonColor: '#d33',
                    cancelButtonColor: '#3085d6',
                    confirmButtonText: 'Yes, delete it!'
                }).then((result) => {
                    if (result.isConfirmed) {
                        removeFromCart(name);
                        Swal.fire(
                            'Deleted!',
                            'Item has been removed from cart.',
                            'success'
                        )
                    }
                })
            }
        });
    }

    // Clear Cart Button Logic
    const btnClearCart = document.getElementById('btn-clear-cart');
    if (btnClearCart) {
        btnClearCart.addEventListener('click', function () {
            let cart = JSON.parse(localStorage.getItem('kmStoreCart')) || [];
            if (cart.length === 0) return;

            Swal.fire({
                title: 'Are you sure?',
                text: "You won't be able to revert this!",
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#d33',
                cancelButtonColor: '#3085d6',
                confirmButtonText: 'Yes, clear it!'
            }).then((result) => {
                if (result.isConfirmed) {
                    localStorage.removeItem('kmStoreCart');
                    renderCart();
                    Swal.fire(
                        'Deleted!',
                        'Your cart has been cleared.',
                        'success'
                    )
                }
            })
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
        let totalOriginalSubtotal = 0;
        const deliveryCharge = 25;
        const handlingCharge = 2;

        cart.forEach(item => {
            totalSubtotal += item.price * item.quantity;
            if (item.originalPrice) {
                totalOriginalSubtotal += item.originalPrice * item.quantity;
            } else {
                totalOriginalSubtotal += item.price * item.quantity;
            }
        });

        const savings = totalOriginalSubtotal - totalSubtotal;

        // Elements
        const billItemsTotalEl = document.getElementById('bill-items-total');
        const billItemsTotalStrikeEl = document.getElementById('bill-items-total-strike');
        const billSavingsBadgeEl = document.getElementById('bill-savings-badge');

        if (billItemsTotalEl) {
            billItemsTotalEl.textContent = '₹' + totalSubtotal;

            if (savings > 0) {
                if (billItemsTotalStrikeEl) billItemsTotalStrikeEl.textContent = '₹' + totalOriginalSubtotal;
                if (billSavingsBadgeEl) {
                    billSavingsBadgeEl.textContent = 'Saved ₹' + savings;
                    billSavingsBadgeEl.style.display = 'inline-block';
                }
            } else {
                if (billItemsTotalStrikeEl) billItemsTotalStrikeEl.textContent = '';
                if (billSavingsBadgeEl) billSavingsBadgeEl.style.display = 'none';
            }

            if (cartTotalEl) cartTotalEl.textContent = '₹' + (totalSubtotal + deliveryCharge + handlingCharge);
        } else if (cartSubtotalEl) {
            // Fallback for checkout or other pages using old IDs if any (though we updated cart.html)
            cartSubtotalEl.textContent = '₹' + totalSubtotal;
            if (cartTotalEl) cartTotalEl.textContent = '₹' + (totalSubtotal + deliveryCharge + handlingCharge);
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

    // --- Address Book Logic ---
    document.body.addEventListener('click', function (e) {
        if (e.target.classList.contains('btn-delete-address')) {
            e.preventDefault();
            Swal.fire({
                title: 'Are you sure?',
                text: "You want to delete this address?",
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#d33',
                cancelButtonColor: '#3085d6',
                confirmButtonText: 'Yes, delete it!'
            }).then((result) => {
                if (result.isConfirmed) {
                    const row = e.target.closest('tr');
                    if (row) row.remove();
                    Swal.fire(
                        'Deleted!',
                        'Address has been deleted.',
                        'success'
                    )
                }
            })
        }
    });

    // --- SweetAlert Confirmations ---

    // 1. Wishlist: Clear All
    // btnClearWishlist is already declared at the top
    if (btnClearWishlist) {
        btnClearWishlist.addEventListener('click', function () {
            Swal.fire({
                title: 'Clear Wishlist?',
                text: "Are you sure you want to remove all items?",
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#d33',
                cancelButtonColor: '#3085d6',
                confirmButtonText: 'Yes, clear it!'
            }).then((result) => {
                if (result.isConfirmed) {
                    const wishlistContainer = document.getElementById('wishlist-container');
                    if (wishlistContainer) wishlistContainer.innerHTML = '<p class="text-center w-100">Your wishlist is empty.</p>';
                    const countEl = document.getElementById('wishlist-count');
                    if (countEl) countEl.innerText = 0;

                    Swal.fire(
                        'Cleared!',
                        'Your wishlist has been cleared.',
                        'success'
                    );
                }
            });
        });
    }

    // Cart and Checkout logic already exists above.

    // 4. My Orders: Cancel Order
    document.body.addEventListener('click', function (e) {
        if (e.target.classList.contains('btn-cancel-order')) {
            e.preventDefault();
            Swal.fire({
                title: 'Cancel Order?',
                text: "Are you sure you want to cancel this order? This action cannot be undone.",
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#d33',
                cancelButtonColor: '#3085d6',
                confirmButtonText: 'Yes, Cancel Order'
            }).then((result) => {
                if (result.isConfirmed) {
                    const row = e.target.closest('tr');
                    const badge = row.querySelector('.badge');
                    if (badge) {
                        badge.className = 'badge bg-secondary';
                        badge.innerText = 'Cancelled';
                    }
                    e.target.remove(); // Remove Cancel button

                    Swal.fire(
                        'Cancelled!',
                        'Your order has been cancelled.',
                        'success'
                    );
                }
            });
        }
    });

    // --- Order Details & Invoice Logic (My Orders Page) ---
    const orderDetailsModalEl = document.getElementById('orderDetailsModal');
    if (orderDetailsModalEl) {
        const modal = new bootstrap.Modal(orderDetailsModalEl);
        const modalOrderId = document.getElementById('modalOrderId');
        const modalOrderDate = document.getElementById('modalOrderDate');
        const modalOrderItems = document.getElementById('modalOrderItems');
        const modalOrderTotal = document.getElementById('modalOrderTotal');
        const btnDownloadInvoice = document.getElementById('btnDownloadInvoice');
        let currentOrderData = null;

        // View Details Click Handler
        document.body.addEventListener('click', function (e) {
            if (e.target.classList.contains('view-order-btn')) {
                const btn = e.target;
                const row = btn.closest('tr');

                // Parse Data
                const orderId = row.getAttribute('data-order-id');
                const date = row.getAttribute('data-date');
                const status = row.getAttribute('data-status');
                const total = row.getAttribute('data-total');
                const items = JSON.parse(row.getAttribute('data-items'));

                currentOrderData = { orderId, date, status, total, items };

                // Populate Modal
                modalOrderId.textContent = orderId;
                modalOrderDate.textContent = date;
                modalOrderTotal.textContent = total;

                // Populate Items
                modalOrderItems.innerHTML = '';
                items.forEach(item => {
                    const li = document.createElement('li');
                    li.classList.add('list-group-item', 'd-flex', 'justify-content-between', 'align-items-center', 'px-0');
                    li.innerHTML = `
                        <div>
                            <h6 class="mb-0 text-dark">${item.name}</h6>
                            <small class="text-muted">Qty: ${item.qty}</small>
                        </div>
                        <span class="text-muted small">${item.price}</span>
                    `;
                    modalOrderItems.appendChild(li);
                });

                // Show/Hide Download Button
                if (status === 'Delivered') {
                    btnDownloadInvoice.style.display = 'inline-block';
                } else {
                    btnDownloadInvoice.style.display = 'none';
                }

                modal.show();
            }
        });

        // Download Invoice Click Handler
        if (btnDownloadInvoice) {
            btnDownloadInvoice.addEventListener('click', function () {
                if (!currentOrderData) return;
                generateInvoice(currentOrderData);
            });
        }
    }

    function generateInvoice(order) {
        const invoiceHTML = `
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <title>Invoice ${order.orderId}</title>
                <style>
                    body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; padding: 40px; color: #333; }
                    .invoice-box { max-width: 800px; margin: auto; border: 1px solid #eee; padding: 30px; }
                    .header { display: flex; justify-content: space-between; margin-bottom: 40px; }
                    .header img { max-width: 150px; }
                    .invoice-title { font-size: 24px; font-weight: bold; color: #0d6efd; }
                    .invoice-details { text-align: right; }
                    .table-responsive { margin-top: 30px; }
                    table { width: 100%; border-collapse: collapse; }
                    th { text-align: left; background-color: #f8f9fa; padding: 12px; border-bottom: 2px solid #dee2e6; }
                    td { padding: 12px; border-bottom: 1px solid #eee; }
                    .total-row td { font-weight: bold; font-size: 18px; border-top: 2px solid #333; }
                    .footer { margin-top: 50px; text-align: center; font-size: 12px; color: #aaa; }
                    @media print {
                        body { padding: 0; }
                        .invoice-box { border: none; }
                    }
                </style>
            </head>
            <body>
                <div class="invoice-box">
                    <div class="header">
                        <div>
                            <div class="invoice-title">KM Store</div>
                            <p>123 Grocery Lane<br>Fresh Town, KA 560000</p>
                        </div>
                        <div class="invoice-details">
                            <h2 style="color: #333;">INVOICE</h2>
                            <p><strong>Order ID:</strong> ${order.orderId}<br>
                            <strong>Date:</strong> ${order.date}<br>
                            <strong>Status:</strong> ${order.status}</p>
                        </div>
                    </div>

                    <div class="table-responsive">
                    <table>
                        <thead>
                            <tr>
                                <th>Item</th>
                                <th>Quantity</th>
                                <th style="text-align: right;">Price</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${order.items.map(item => `
                                <tr>
                                    <td>${item.name}</td>
                                    <td>${item.qty}</td>
                                    <td style="text-align: right;">${item.price}</td>
                                </tr>
                            `).join('')}
                            <tr class="total-row">
                                <td colspan="2" style="text-align: right;">Total</td>
                                <td style="text-align: right;">${order.total}</td>
                            </tr>
                        </tbody>
                    </table>
                    </div>

                    <div class="footer">
                        <p>Thank you for shopping with KM Store!</p>
                        <p>For support, email support@kmstore.com</p>
                    </div>
                </div>
                <script>
                    window.onload = function() { window.print(); }
                <\/script>
            </body>
            </html>
        `;

        const printWindow = window.open('', '', 'height=600,width=800');
        printWindow.document.write(invoiceHTML);
        printWindow.document.close();
    }
});
