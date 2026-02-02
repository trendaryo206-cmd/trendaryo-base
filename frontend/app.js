// Trendaryo Main Application JavaScript
// This file contains shared functionality across the entire website

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function () {
  console.log('Trendaryo app initialized');

  // Initialize all shared components
  initSharedComponents();

  // Initialize page-specific functionality
  initPageSpecificFeatures();

  // Set up event listeners
  setupGlobalEventListeners();
});

/**
 * Initialize shared components across all pages
 */
function initSharedComponents() {
  // Check if user is logged in
  checkLoginStatus();

  // Update cart count from localStorage
  updateCartCount();

  // Initialize tooltips
  initTooltips();

  // Initialize modals
  initModals();

  // Initialize form validation
  initFormValidation();
}

/**
 * Initialize page-specific features
 */
function initPageSpecificFeatures() {
  const pageId =
    document.body.getAttribute('data-page') ||
    window.location.pathname.split('/').pop().replace('.html', '');

  switch (pageId) {
    case 'index':
      initHomepageFeatures();
      break;
    case 'shop':
      initShopPage();
      break;
    case 'product':
      initProductPage();
      break;
    case 'cart':
      initCartPage();
      break;
    case 'checkout':
      initCheckoutPage();
      break;
    case 'account':
      initAccountPage();
      break;
    case 'login':
      initLoginPage();
      break;
    case 'register':
      initRegisterPage();
      break;
    default:
      // Default initialization for other pages
      console.log(`Initializing ${pageId} page`);
  }
}

/**
 * Set up global event listeners
 */
function setupGlobalEventListeners() {
  // Search functionality
  const searchToggle = document.getElementById('search-toggle');
  if (searchToggle) {
    searchToggle.addEventListener('click', toggleSearch);
  }

  // Mobile menu toggle
  const mobileMenuToggle = document.getElementById('mobile-menu-toggle');
  if (mobileMenuToggle) {
    mobileMenuToggle.addEventListener('click', toggleMobileMenu);
  }

  // Cart updates
  document.addEventListener('cartUpdated', function () {
    updateCartCount();
  });

  // User login/logout events
  document.addEventListener('userLoggedIn', function (e) {
    updateUserUI(e.detail);
  });

  document.addEventListener('userLoggedOut', function () {
    updateUserUI(null);
  });
}

// ====================
// SHARED FUNCTIONALITY
// ====================

/**
 * Check if user is logged in and update UI accordingly
 */
function checkLoginStatus() {
  const user = JSON.parse(localStorage.getItem('trendaryo_user'));

  if (user && user.loggedIn) {
    // Dispatch logged in event
    document.dispatchEvent(new CustomEvent('userLoggedIn', { detail: user }));
    return true;
  }

  // Dispatch logged out event
  document.dispatchEvent(new CustomEvent('userLoggedOut'));
  return false;
}

/**
 * Update user-related UI elements
 */
function updateUserUI(user) {
  const loginLinks = document.querySelectorAll('.login-link');
  const accountLinks = document.querySelectorAll('.account-link');
  const logoutLinks = document.querySelectorAll('.logout-link');

  if (user) {
    // User is logged in
    loginLinks.forEach((link) => (link.style.display = 'none'));
    accountLinks.forEach((link) => (link.style.display = 'block'));
    logoutLinks.forEach((link) => (link.style.display = 'block'));

    // Update user name if element exists
    const userNameElements = document.querySelectorAll('.user-name');
    userNameElements.forEach((element) => {
      element.textContent = user.name || user.email.split('@')[0];
    });
  } else {
    // User is not logged in
    loginLinks.forEach((link) => (link.style.display = 'block'));
    accountLinks.forEach((link) => (link.style.display = 'none'));
    logoutLinks.forEach((link) => (link.style.display = 'none'));
  }
}

/**
 * Update cart count in header
 */
function updateCartCount() {
  const cart = JSON.parse(localStorage.getItem('trendaryo_cart')) || [];
  const totalItems = cart.reduce((total, item) => total + item.quantity, 0);

  // Update all cart count elements
  const cartCountElements = document.querySelectorAll('.cart-count, .mobile-cart-count');
  cartCountElements.forEach((element) => {
    if (element) {
      element.textContent = totalItems;
      element.style.display = totalItems > 0 ? 'flex' : 'none';
    }
  });

  // Dispatch cart updated event
  document.dispatchEvent(
    new CustomEvent('cartUpdated', {
      detail: { count: totalItems, cart: cart },
    })
  );
}

/**
 * Add item to cart
 */
function addToCart(product) {
  // Validate product object
  if (!product || !product.id) {
    console.error('Invalid product data');
    return false;
  }

  const cart = JSON.parse(localStorage.getItem('trendaryo_cart')) || [];

  // Check if product already exists in cart (same ID, size, and color)
  const existingIndex = cart.findIndex(
    (item) => item.id === product.id && item.size === product.size && item.color === product.color
  );

  if (existingIndex > -1) {
    // Update quantity
    cart[existingIndex].quantity += product.quantity || 1;
  } else {
    // Add new item
    cart.push({
      ...product,
      quantity: product.quantity || 1,
      addedAt: new Date().toISOString(),
    });
  }

  // Save to localStorage
  localStorage.setItem('trendaryo_cart', JSON.stringify(cart));

  // Update UI
  updateCartCount();

  // Show confirmation
  showToast(`Added ${product.name || 'item'} to cart!`);

  return true;
}

/**
 * Remove item from cart
 */
function removeFromCart(itemId, size = null, color = null) {
  const cart = JSON.parse(localStorage.getItem('trendaryo_cart')) || [];

  const filteredCart = cart.filter((item) => {
    if (size && color) {
      return !(item.id === itemId && item.size === size && item.color === color);
    }
    return item.id !== itemId;
  });

  localStorage.setItem('trendaryo_cart', JSON.stringify(filteredCart));
  updateCartCount();

  // Trigger cart update event for other components
  document.dispatchEvent(
    new CustomEvent('cartUpdated', {
      detail: { cart: filteredCart },
    })
  );

  return filteredCart;
}

/**
 * Update cart item quantity
 */
function updateCartItemQuantity(itemId, size, color, newQuantity) {
  if (newQuantity < 1) return removeFromCart(itemId, size, color);

  const cart = JSON.parse(localStorage.getItem('trendaryo_cart')) || [];

  const updatedCart = cart.map((item) => {
    if (item.id === itemId && item.size === size && item.color === color) {
      return { ...item, quantity: newQuantity };
    }
    return item;
  });

  localStorage.setItem('trendaryo_cart', JSON.stringify(updatedCart));
  updateCartCount();

  return updatedCart;
}

/**
 * Calculate cart total
 */
function calculateCartTotal() {
  const cart = JSON.parse(localStorage.getItem('trendaryo_cart')) || [];

  const subtotal = cart.reduce((total, item) => {
    return total + item.price * item.quantity;
  }, 0);

  const shipping = subtotal > 50 ? 0 : 9.99;
  const tax = subtotal * 0.08; // 8% tax rate
  const total = subtotal + shipping + tax;

  return {
    subtotal: parseFloat(subtotal.toFixed(2)),
    shipping: parseFloat(shipping.toFixed(2)),
    tax: parseFloat(tax.toFixed(2)),
    total: parseFloat(total.toFixed(2)),
  };
}

/**
 * Toggle search bar
 */
function toggleSearch() {
  const searchBar = document.getElementById('search-bar');
  if (searchBar) {
    searchBar.classList.toggle('active');
    if (searchBar.classList.contains('active')) {
      searchBar.querySelector('input').focus();
    }
  } else {
    // Create search bar if it doesn't exist
    createSearchBar();
  }
}

/**
 * Create search bar dynamically
 */
function createSearchBar() {
  const searchBar = document.createElement('div');
  searchBar.id = 'search-bar';
  searchBar.className = 'search-bar';
  searchBar.innerHTML = `
        <div class="search-container">
            <input type="text" placeholder="Search products, collections, trends..." id="search-input">
            <button class="search-close" id="search-close">
                <i class="fas fa-times"></i>
            </button>
        </div>
        <div class="search-results" id="search-results"></div>
    `;

  document.body.appendChild(searchBar);

  // Add styles
  const style = document.createElement('style');
  style.textContent = `
        .search-bar {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            background-color: white;
            box-shadow: 0 5px 20px rgba(0,0,0,0.1);
            padding: 1rem;
            z-index: 1001;
            display: none;
        }
        
        .search-bar.active {
            display: block;
            animation: slideDown 0.3s ease;
        }
        
        .search-container {
            display: flex;
            max-width: 800px;
            margin: 0 auto;
        }
        
        .search-bar input {
            flex: 1;
            padding: 1rem;
            border: 2px solid var(--accent-gold);
            border-radius: 5px 0 0 5px;
            font-size: 1rem;
        }
        
        .search-close {
            background-color: var(--accent-gold);
            color: var(--primary-dark);
            border: none;
            padding: 1rem 1.5rem;
            border-radius: 0 5px 5px 0;
            cursor: pointer;
        }
        
        .search-results {
            max-width: 800px;
            margin: 1rem auto;
            max-height: 400px;
            overflow-y: auto;
        }
        
        @keyframes slideDown {
            from {
                transform: translateY(-100%);
                opacity: 0;
            }
            to {
                transform: translateY(0);
                opacity: 1;
            }
        }
    `;
  document.head.appendChild(style);

  // Add event listeners
  document.getElementById('search-close').addEventListener('click', toggleSearch);
  document.getElementById('search-input').addEventListener('input', debounce(performSearch, 300));
}

/**
 * Perform search with debouncing
 */
function performSearch(event) {
  const query = event.target.value.trim();
  const resultsContainer = document.getElementById('search-results');

  if (query.length < 2) {
    resultsContainer.innerHTML = '';
    return;
  }

  // In a real app, this would be an API call
  // For demo, we'll use mock data
  const mockResults = [
    { id: 1, name: 'Minimalist Watch', category: 'Watches', price: 249.99 },
    { id: 2, name: 'Leather Wallet', category: 'Accessories', price: 89.99 },
    { id: 3, name: 'Designer Sunglasses', category: 'Accessories', price: 159.99 },
    { id: 4, name: 'Premium Backpack', category: 'Bags', price: 129.99 },
  ];

  // Filter mock results based on query
  const filteredResults = mockResults.filter(
    (item) =>
      item.name.toLowerCase().includes(query.toLowerCase()) ||
      item.category.toLowerCase().includes(query.toLowerCase())
  );

  // Display results
  if (filteredResults.length > 0) {
    resultsContainer.innerHTML = filteredResults
      .map(
        (item) => `
            <a href="product.html?id=${item.id}" class="search-result-item">
                <div>
                    <h4>${item.name}</h4>
                    <p>${item.category} • $${item.price}</p>
                </div>
                <i class="fas fa-chevron-right"></i>
            </a>
        `
      )
      .join('');
  } else {
    resultsContainer.innerHTML =
      '<p class="no-results">No results found. Try different keywords.</p>';
  }
}

/**
 * Toggle mobile menu
 */
function toggleMobileMenu() {
  const mobileNav = document.getElementById('mobile-nav');
  const overlay = document.getElementById('mobile-nav-overlay');

  if (mobileNav && overlay) {
    mobileNav.classList.toggle('active');
    overlay.classList.toggle('active');
    document.body.style.overflow = mobileNav.classList.contains('active') ? 'hidden' : '';
  }
}

/**
 * Show toast notification
 */
function showToast(message, type = 'success') {
  // Remove existing toasts
  const existingToasts = document.querySelectorAll('.toast-notification');
  existingToasts.forEach((toast) => toast.remove());

  // Create new toast
  const toast = document.createElement('div');
  toast.className = `toast-notification toast-${type}`;
  toast.textContent = message;

  // Add styles
  toast.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        background-color: ${type === 'success' ? 'var(--accent-gold)' : '#ff4757'};
        color: var(--primary-dark);
        padding: 1rem 2rem;
        border-radius: 5px;
        box-shadow: 0 5px 15px rgba(0,0,0,0.1);
        z-index: 10000;
        animation: slideIn 0.3s ease;
    `;

  document.body.appendChild(toast);

  // Remove after 3 seconds
  setTimeout(() => {
    toast.style.animation = 'slideOut 0.3s ease';
    setTimeout(() => {
      if (toast.parentNode) {
        toast.parentNode.removeChild(toast);
      }
    }, 300);
  }, 3000);
}

/**
 * Initialize tooltips
 */
function initTooltips() {
  const tooltipElements = document.querySelectorAll('[data-tooltip]');

  tooltipElements.forEach((element) => {
    element.addEventListener('mouseenter', function (e) {
      const tooltip = document.createElement('div');
      tooltip.className = 'tooltip';
      tooltip.textContent = this.getAttribute('data-tooltip');

      document.body.appendChild(tooltip);

      // Position tooltip
      const rect = this.getBoundingClientRect();
      tooltip.style.left = rect.left + rect.width / 2 - tooltip.offsetWidth / 2 + 'px';
      tooltip.style.top = rect.top - tooltip.offsetHeight - 10 + 'px';

      // Store reference
      this._tooltip = tooltip;
    });

    element.addEventListener('mouseleave', function () {
      if (this._tooltip) {
        this._tooltip.remove();
        this._tooltip = null;
      }
    });
  });
}

/**
 * Initialize modals
 */
function initModals() {
  const modalTriggers = document.querySelectorAll('[data-modal]');

  modalTriggers.forEach((trigger) => {
    trigger.addEventListener('click', function () {
      const modalId = this.getAttribute('data-modal');
      const modal = document.getElementById(modalId);

      if (modal) {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
      }
    });
  });

  // Close modals when clicking close button or overlay
  document.addEventListener('click', function (e) {
    if (
      e.target.classList.contains('modal-close') ||
      e.target.classList.contains('modal-overlay')
    ) {
      const modal = e.target.closest('.modal');
      if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = '';
      }
    }
  });
}

/**
 * Initialize form validation
 */
function initFormValidation() {
  const forms = document.querySelectorAll('form[data-validate]');

  forms.forEach((form) => {
    form.addEventListener('submit', function (e) {
      if (!validateForm(this)) {
        e.preventDefault();
      }
    });
  });
}

/**
 * Validate form
 */
function validateForm(form) {
  let isValid = true;
  const inputs = form.querySelectorAll('input[required], select[required], textarea[required]');

  inputs.forEach((input) => {
    const errorElement = input.nextElementSibling?.classList.contains('error-message')
      ? input.nextElementSibling
      : null;

    // Basic validation
    if (!input.value.trim()) {
      isValid = false;
      showInputError(input, 'This field is required', errorElement);
    } else if (input.type === 'email' && !isValidEmail(input.value)) {
      isValid = false;
      showInputError(input, 'Please enter a valid email', errorElement);
    } else if (input.type === 'password' && input.value.length < 8) {
      isValid = false;
      showInputError(input, 'Password must be at least 8 characters', errorElement);
    } else {
      clearInputError(input, errorElement);
    }
  });

  return isValid;
}

/**
 * Show input error
 */
function showInputError(input, message, errorElement = null) {
  input.classList.add('error');

  if (!errorElement) {
    errorElement = document.createElement('div');
    errorElement.className = 'error-message';
    errorElement.textContent = message;
    input.parentNode.insertBefore(errorElement, input.nextSibling);
  } else {
    errorElement.textContent = message;
  }
}

/**
 * Clear input error
 */
function clearInputError(input, errorElement = null) {
  input.classList.remove('error');

  if (errorElement) {
    errorElement.textContent = '';
  }
}

/**
 * Validate email format
 */
function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/**
 * Debounce function for performance
 */
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Format price with currency symbol
 */
function formatPrice(amount, currency = 'USD') {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
  }).format(amount);
}

/**
 * Get URL parameters
 */
function getUrlParams() {
  const params = {};
  const queryString = window.location.search.substring(1);
  const pairs = queryString.split('&');

  pairs.forEach((pair) => {
    const [key, value] = pair.split('=');
    if (key) {
      params[decodeURIComponent(key)] = decodeURIComponent(value || '');
    }
  });

  return params;
}

/**
 * Set URL parameters
 */
function setUrlParams(params) {
  const url = new URL(window.location);

  Object.keys(params).forEach((key) => {
    if (params[key]) {
      url.searchParams.set(key, params[key]);
    } else {
      url.searchParams.delete(key);
    }
  });

  window.history.replaceState({}, '', url);
}

/**
 * Handle API errors
 */
function handleApiError(error) {
  console.error('API Error:', error);

  let message = 'An error occurred. Please try again.';

  if (error.response) {
    // Server responded with error
    switch (error.response.status) {
      case 401:
        message = 'Please log in to continue.';
        window.location.href = 'login.html';
        break;
      case 403:
        message = 'You do not have permission to perform this action.';
        break;
      case 404:
        message = 'The requested resource was not found.';
        break;
      case 500:
        message = 'Server error. Please try again later.';
        break;
    }
  } else if (error.request) {
    // Request was made but no response
    message = 'Network error. Please check your connection.';
  }

  showToast(message, 'error');
}

// ======================
// PAGE-SPECIFIC HANDLERS
// ======================

function initHomepageFeatures() {
  // Initialize trending products carousel
  const trendingContainer = document.getElementById('trending-products');
  if (trendingContainer) {
    initProductCarousel(trendingContainer);
  }

  // Initialize community signup form
  const communityForm = document.getElementById('community-form');
  if (communityForm) {
    communityForm.addEventListener('submit', function (e) {
      e.preventDefault();
      const email = this.querySelector('input[type="email"]').value;

      // Save to localStorage
      const subscribers = JSON.parse(localStorage.getItem('trendaryo_subscribers')) || [];
      subscribers.push({
        email: email,
        subscribedAt: new Date().toISOString(),
      });
      localStorage.setItem('trendaryo_subscribers', JSON.stringify(subscribers));

      showToast('Thanks for joining the Trendaryo Circle!');
      this.reset();
    });
  }
}

function initShopPage() {
  // Initialize filters
  const filterButtons = document.querySelectorAll('.filter-btn');
  filterButtons.forEach((btn) => {
    btn.addEventListener('click', function () {
      filterButtons.forEach((b) => b.classList.remove('active'));
      this.classList.add('active');

      // Filter products based on selected category
      const category = this.getAttribute('data-category');
      filterProducts(category);
    });
  });

  // Initialize sort dropdown
  const sortSelect = document.getElementById('sort-select');
  if (sortSelect) {
    sortSelect.addEventListener('change', function () {
      sortProducts(this.value);
    });
  }

  // Initialize price range slider
  const priceSlider = document.getElementById('price-slider');
  if (priceSlider) {
    noUiSlider.create(priceSlider, {
      start: [0, 500],
      connect: true,
      range: {
        min: 0,
        max: 1000,
      },
    });

    priceSlider.noUiSlider.on('update', function (values) {
      const [min, max] = values.map((val) => parseInt(val));
      filterByPrice(min, max);
    });
  }
}

function initProductPage() {
  // Product page specific initialization
  // This would be handled in product.html's own script
  console.log('Product page initialized');
}

function initCartPage() {
  // Load cart items
  updateCartDisplay();

  // Initialize quantity controls
  document.addEventListener('click', function (e) {
    if (e.target.classList.contains('quantity-decrease')) {
      const itemId = e.target.getAttribute('data-item-id');
      const size = e.target.getAttribute('data-size');
      const color = e.target.getAttribute('data-color');
      updateCartItemQuantity(itemId, size, color, -1);
      updateCartDisplay();
    }

    if (e.target.classList.contains('quantity-increase')) {
      const itemId = e.target.getAttribute('data-item-id');
      const size = e.target.getAttribute('data-size');
      const color = e.target.getAttribute('data-color');
      updateCartItemQuantity(itemId, size, color, 1);
      updateCartDisplay();
    }

    if (e.target.classList.contains('remove-item')) {
      const itemId = e.target.getAttribute('data-item-id');
      const size = e.target.getAttribute('data-size');
      const color = e.target.getAttribute('data-color');
      removeFromCart(itemId, size, color);
      updateCartDisplay();
    }
  });

  // Update cart totals
  function updateCartDisplay() {
    const cart = JSON.parse(localStorage.getItem('trendaryo_cart')) || [];
    const cartContainer = document.getElementById('cart-items');
    const emptyCart = document.getElementById('empty-cart');
    const cartTotals = document.getElementById('cart-totals');

    if (cart.length === 0) {
      if (emptyCart) emptyCart.style.display = 'block';
      if (cartContainer) cartContainer.style.display = 'none';
      if (cartTotals) cartTotals.style.display = 'none';
      return;
    }

    if (emptyCart) emptyCart.style.display = 'none';
    if (cartContainer) cartContainer.style.display = 'block';
    if (cartTotals) cartTotals.style.display = 'block';

    // Update cart items list
    if (cartContainer) {
      cartContainer.innerHTML = cart
        .map(
          (item) => `
                <div class="cart-item">
                    <div class="item-image">
                        <img src="${item.image || 'https://via.placeholder.com/100'}" alt="${item.name}">
                    </div>
                    <div class="item-details">
                        <h4>${item.name}</h4>
                        <p>Size: ${item.size} | Color: ${item.color}</p>
                        <p class="item-price">$${(item.price * item.quantity).toFixed(2)}</p>
                    </div>
                    <div class="item-quantity">
                        <button class="quantity-decrease" 
                                data-item-id="${item.id}"
                                data-size="${item.size}"
                                data-color="${item.color}">-</button>
                        <span>${item.quantity}</span>
                        <button class="quantity-increase"
                                data-item-id="${item.id}"
                                data-size="${item.size}"
                                data-color="${item.color}">+</button>
                    </div>
                    <button class="remove-item"
                            data-item-id="${item.id}"
                            data-size="${item.size}"
                            data-color="${item.color}">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            `
        )
        .join('');
    }

    // Update totals
    const totals = calculateCartTotal();
    if (cartTotals) {
      cartTotals.innerHTML = `
                <div class="total-row">
                    <span>Subtotal</span>
                    <span>$${totals.subtotal.toFixed(2)}</span>
                </div>
                <div class="total-row">
                    <span>Shipping</span>
                    <span>${totals.shipping === 0 ? 'FREE' : `$${totals.shipping.toFixed(2)}`}</span>
                </div>
                <div class="total-row">
                    <span>Tax</span>
                    <span>$${totals.tax.toFixed(2)}</span>
                </div>
                <div class="total-row grand-total">
                    <span>Total</span>
                    <span>$${totals.total.toFixed(2)}</span>
                </div>
            `;
    }
  }
}

function initCheckoutPage() {
  // Initialize checkout form validation
  const checkoutForm = document.getElementById('checkout-form');
  if (checkoutForm) {
    checkoutForm.addEventListener('submit', function (e) {
      e.preventDefault();

      if (validateCheckoutForm()) {
        // Process order
        processOrder();
      }
    });
  }

  // Initialize payment method toggles
  const paymentMethods = document.querySelectorAll('input[name="payment-method"]');
  paymentMethods.forEach((method) => {
    method.addEventListener('change', function () {
      updatePaymentFields(this.value);
    });
  });
}

function initAccountPage() {
  // Initialize account tabs
  const accountTabs = document.querySelectorAll('.account-tab-btn');
  accountTabs.forEach((tab) => {
    tab.addEventListener('click', function () {
      const tabId = this.getAttribute('data-tab');

      // Update active tab
      accountTabs.forEach((t) => t.classList.remove('active'));
      this.classList.add('active');

      // Show corresponding content
      document.querySelectorAll('.account-tab-content').forEach((content) => {
        content.classList.remove('active');
        if (content.id === `${tabId}-tab`) {
          content.classList.add('active');
        }
      });
    });
  });

  // Load user orders
  loadUserOrders();

  // Initialize profile form
  const profileForm = document.getElementById('profile-form');
  if (profileForm) {
    profileForm.addEventListener('submit', function (e) {
      e.preventDefault();
      updateUserProfile(this);
    });
  }
}

function initLoginPage() {
  // Login page specific initialization
  const loginForm = document.getElementById('login-form');
  if (loginForm) {
    loginForm.addEventListener('submit', function (e) {
      e.preventDefault();

      const email = this.querySelector('input[type="email"]').value;
      const password = this.querySelector('input[type="password"]').value;

      // For demo, accept any credentials
      const user = {
        email: email,
        name: email.split('@')[0],
        loggedIn: true,
        lastLogin: new Date().toISOString(),
      };

      localStorage.setItem('trendaryo_user', JSON.stringify(user));

      showToast('Login successful!');

      // Redirect to account page or previous page
      setTimeout(() => {
        const redirectTo =
          new URLSearchParams(window.location.search).get('redirect') || 'account.html';
        window.location.href = redirectTo;
      }, 1000);
    });
  }
}

function initRegisterPage() {
  // Registration page specific initialization
  const registerForm = document.getElementById('register-form');
  if (registerForm) {
    registerForm.addEventListener('submit', function (e) {
      e.preventDefault();

      const formData = new FormData(this);
      const user = {
        firstName: formData.get('first-name'),
        lastName: formData.get('last-name'),
        email: formData.get('email'),
        createdAt: new Date().toISOString(),
        loggedIn: true,
      };

      localStorage.setItem('trendaryo_user', JSON.stringify(user));

      showToast('Account created successfully!');

      // Redirect to account page
      setTimeout(() => {
        window.location.href = 'account.html';
      }, 1000);
    });
  }
}

// Export functions for use in other scripts
window.Trendaryo = {
  addToCart,
  removeFromCart,
  updateCartItemQuantity,
  calculateCartTotal,
  showToast,
  formatPrice,
  getUrlParams,
  setUrlParams,
};

// Make functions available globally
window.addToCart = addToCart;
window.removeFromCart = removeFromCart;
window.showToast = showToast;

// Add global error handling
window.addEventListener('error', function (e) {
  console.error('Global error:', e.error);

  // Don't show toast for minor errors
  if (e.error.message && e.error.message.includes('ResizeObserver')) {
    return; // Ignore ResizeObserver errors
  }

  showToast('Something went wrong. Please refresh the page.', 'error');
});

// Initialize when DOM is loaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initSharedComponents);
} else {
  initSharedComponents();
}
