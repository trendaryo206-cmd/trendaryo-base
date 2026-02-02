// ====== SHARED COMPONENT LOADING ======
async function loadHeader() {
  const container = document.getElementById('header-container');
  if (!container) return;
  
  try {
    // Try multiple possible paths
    const paths = ['./components/header.html', 'components/header.html', '../components/header.html'];
    let loaded = false;
    
    for (const path of paths) {
      try {
        const response = await fetch(path);
        if (response.ok) {
          const data = await response.text();
          container.innerHTML = data;
          initHeader();
          loaded = true;
          break;
        }
      } catch (e) {
        continue;
      }
    }
    
    if (!loaded) {
      throw new Error('Header component not found');
    }
  } catch (error) {
    console.warn('Loading fallback header:', error.message);
    createFallbackHeader();
  }
}

async function loadFooter() {
  const container = document.getElementById('footer-container');
  if (!container) return;
  
  try {
    // Try multiple possible paths
    const paths = ['./components/footer.html', 'components/footer.html', '../components/footer.html'];
    let loaded = false;
    
    for (const path of paths) {
      try {
        const response = await fetch(path);
        if (response.ok) {
          const data = await response.text();
          container.innerHTML = data;
          loaded = true;
          break;
        }
      } catch (e) {
        continue;
      }
    }
    
    if (!loaded) {
      throw new Error('Footer component not found');
    }
  } catch (error) {
    console.warn('Loading fallback footer:', error.message);
    createFallbackFooter();
  }
}

function createFallbackHeader() {
  const container = document.getElementById('header-container');
  if (container) {
    container.innerHTML = `
      <header id="main-header" style="position: fixed; top: 0; width: 100%; background: white; box-shadow: 0 2px 10px rgba(0,0,0,0.1); z-index: 1000; padding: 1rem 0;">
        <div class="container" style="display: flex; justify-content: space-between; align-items: center; max-width: 1200px; margin: 0 auto; padding: 0 1.5rem;">
          <a href="index.html" style="font-family: 'Playfair Display', serif; font-size: 1.8rem; font-weight: 700; color: #0a192f; text-decoration: none;">
            Trend<span style="color: #d4af37;">aryo</span>
          </a>
          <nav style="display: flex; gap: 2rem;">
            <a href="index.html" style="color: #333; text-decoration: none; font-weight: 500;">Home</a>
            <a href="shop.html" style="color: #333; text-decoration: none; font-weight: 500;">Shop</a>
            <a href="collection.html" style="color: #333; text-decoration: none; font-weight: 500;">Collections</a>
            <a href="about.html" style="color: #333; text-decoration: none; font-weight: 500;">About</a>
            <a href="contact.html" style="color: #333; text-decoration: none; font-weight: 500;">Contact</a>
          </nav>
          <div style="display: flex; gap: 1rem; align-items: center;">
            <a href="account.html" style="color: #333; text-decoration: none; font-size: 1.2rem;"><i class="fas fa-user"></i></a>
            <a href="wishlist.html" style="color: #333; text-decoration: none; font-size: 1.2rem;"><i class="fas fa-heart"></i></a>
            <a href="cart.html" style="color: #333; text-decoration: none; font-size: 1.2rem; position: relative;">
              <i class="fas fa-shopping-bag"></i>
              <span class="cart-count" style="position: absolute; top: -8px; right: -8px; background: #d4af37; color: #0a192f; font-size: 0.7rem; width: 18px; height: 18px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 600;">0</span>
            </a>
          </div>
        </div>
      </header>
    `;
    // Initialize cart count for fallback header
    updateCartCount();
  }
}

function createFallbackFooter() {
  const container = document.getElementById('footer-container');
  if (container) {
    container.innerHTML = `
      <footer style="background: #0a192f; color: white; padding: 2rem 0; text-align: center;">
        <div class="container" style="max-width: 1200px; margin: 0 auto; padding: 0 1.5rem;">
          <p>&copy; 2023 Trendaryo. All rights reserved.</p>
        </div>
      </footer>
    `;
  }
}

// ====== HEADER FUNCTIONALITY ======
function initHeader() {
  // Mobile menu toggle
  const mobileMenuToggle = document.getElementById('mobile-menu-toggle');
  const mobileNav = document.getElementById('mobile-nav');
  const mobileNavOverlay = document.getElementById('mobile-nav-overlay');
  const mobileNavClose = document.getElementById('mobile-nav-close');

  if (mobileMenuToggle && mobileNav) {
    mobileMenuToggle.addEventListener('click', () => {
      mobileNav.classList.add('active');
      if (mobileNavOverlay) mobileNavOverlay.classList.add('active');
      document.body.style.overflow = 'hidden';
    });
  }

  function closeMobileMenu() {
    if (mobileNav) mobileNav.classList.remove('active');
    if (mobileNavOverlay) mobileNavOverlay.classList.remove('active');
    document.body.style.overflow = '';
  }

  if (mobileNavClose) {
    mobileNavClose.addEventListener('click', closeMobileMenu);
  }

  if (mobileNavOverlay) {
    mobileNavOverlay.addEventListener('click', closeMobileMenu);
  }

  // Close mobile menu when clicking a link
  document.querySelectorAll('.mobile-nav-link').forEach((link) => {
    link.addEventListener('click', closeMobileMenu);
  });

  // Update cart count
  updateCartCount();

  // Header scroll effect
  window.addEventListener('scroll', () => {
    const header = document.getElementById('main-header');
    if (header) {
      if (window.scrollY > 50) {
        header.classList.add('scrolled');
        header.style.boxShadow = '0 5px 20px rgba(0, 0, 0, 0.1)';
      } else {
        header.classList.remove('scrolled');
        header.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.05)';
      }
    }
  });

  // Search functionality
  const searchToggle = document.getElementById('search-toggle');
  if (searchToggle) {
    searchToggle.addEventListener('click', function () {
      showNotification('Search functionality coming soon!', 'info');
    });
  }
}

// ====== CART FUNCTIONALITY ======
let cart = JSON.parse(localStorage.getItem('trendaryo_cart')) || [];
let wishlist = JSON.parse(localStorage.getItem('trendaryo_wishlist')) || [];

function updateCartCount() {
  const cartCount = document.querySelector('.cart-count');
  const mobileCartCount = document.querySelector('.mobile-cart-count');
  if (cartCount) {
    const count = cart.reduce((total, item) => total + item.quantity, 0);
    cartCount.textContent = count;
    cartCount.style.display = count > 0 ? 'flex' : 'none';
  }
  if (mobileCartCount) {
    const count = cart.reduce((total, item) => total + item.quantity, 0);
    mobileCartCount.textContent = count;
    mobileCartCount.style.display = count > 0 ? 'flex' : 'none';
  }
}

function updateWishlistCount() {
  const wishlistCount = document.querySelector('.wishlist-count');
  if (wishlistCount) {
    const count = wishlist.length;
    wishlistCount.textContent = count;
    wishlistCount.style.display = count > 0 ? 'flex' : 'none';
  }
}

function addToCart(productData) {
  // Ensure productData has required fields
  if (typeof productData === 'string') {
    // If just an ID is passed, create a basic product object
    productData = {
      id: productData,
      name: `Product ${productData}`,
      price: 99.99,
      quantity: 1,
      image: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
    };
  }

  const existingItem = cart.find((item) => item.id === productData.id);
  if (existingItem) {
    existingItem.quantity += productData.quantity || 1;
  } else {
    cart.push({
      ...productData,
      quantity: productData.quantity || 1
    });
  }

  localStorage.setItem('trendaryo_cart', JSON.stringify(cart));
  updateCartCount();

  // Show notification
  showNotification('Product added to cart!');
}

function removeFromCart(productId) {
  cart = cart.filter((item) => item.id !== productId);
  localStorage.setItem('trendaryo_cart', JSON.stringify(cart));
  updateCartCount();
}

function updateCartQuantity(productId, quantity) {
  const item = cart.find((item) => item.id === productId);
  if (item) {
    if (quantity <= 0) {
      removeFromCart(productId);
    } else {
      item.quantity = quantity;
      localStorage.setItem('trendaryo_cart', JSON.stringify(cart));
      updateCartCount();
    }
  }
}

function getCartTotal() {
  return cart.reduce((total, item) => total + item.price * item.quantity, 0);
}

// ====== WISHLIST FUNCTIONALITY ======
function addToWishlist(productData) {
  if (typeof productData === 'string') {
    productData = {
      id: productData,
      name: `Product ${productData}`,
      price: 99.99,
      image: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
    };
  }

  const existingItem = wishlist.find((item) => item.id === productData.id);
  if (existingItem) {
    showNotification('Item already in wishlist');
    return;
  }

  wishlist.push({
    ...productData,
    dateAdded: new Date().toISOString(),
    priceAlert: true
  });

  localStorage.setItem('trendaryo_wishlist', JSON.stringify(wishlist));
  updateWishlistCount();
  showNotification('Added to wishlist!');
}

function removeFromWishlist(productId) {
  wishlist = wishlist.filter((item) => item.id !== productId);
  localStorage.setItem('trendaryo_wishlist', JSON.stringify(wishlist));
  updateWishlistCount();
}

// ====== UTILITY FUNCTIONS ======
function showNotification(message, type = 'success') {
  // Remove existing notification
  const existingNotification = document.querySelector('.notification');
  if (existingNotification) {
    existingNotification.remove();
  }

  // Create notification
  const notification = document.createElement('div');
  notification.className = `notification notification-${type}`;
  notification.innerHTML = `
        <span>${message}</span>
        <button class="notification-close">&times;</button>
    `;

  // Add styles
  notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? '#4CAF50' : type === 'error' ? '#f44336' : '#d4af37'};
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 5px;
        box-shadow: 0 5px 15px rgba(0,0,0,0.2);
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 1rem;
        z-index: 9999;
        animation: slideIn 0.3s ease;
        max-width: 400px;
    `;

  document.body.appendChild(notification);

  // Close button
  notification.querySelector('.notification-close').addEventListener('click', () => {
    notification.remove();
  });

  // Auto-remove after 3 seconds
  setTimeout(() => {
    if (notification.parentNode) {
      notification.remove();
    }
  }, 3000);
}

// Generate placeholder product image
function generatePlaceholderImage(width = 300, height = 300, text = 'Product') {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  
  // Background
  ctx.fillStyle = '#f0f0f0';
  ctx.fillRect(0, 0, width, height);
  
  // Text
  ctx.fillStyle = '#999';
  ctx.font = '16px Arial';
  ctx.textAlign = 'center';
  ctx.fillText(text, width/2, height/2);
  
  return canvas.toDataURL();
}

// Format currency
function formatCurrency(amount) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount);
}

// Debounce function for search
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

// ====== FORM HANDLING ======
function handleNewsletterForm(formId) {
  const form = document.getElementById(formId);
  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      const email = this.querySelector('input[type="email"]').value;

      // Simple validation
      if (!email || !email.includes('@')) {
        showNotification('Please enter a valid email address', 'error');
        return;
      }

      // Simulate API call
      setTimeout(() => {
        showNotification('Thank you for subscribing to the Trendaryo Circle!');
        this.reset();
      }, 500);
    });
  }
}

// ====== INITIALIZATION ======
document.addEventListener('DOMContentLoaded', function () {
  // Always load header and footer
  loadHeader();
  loadFooter();

  // Initialize newsletter forms
  handleNewsletterForm('community-form');
  handleNewsletterForm('newsletter-form');
  
  // Initialize cart and wishlist counts
  cart = JSON.parse(localStorage.getItem('trendaryo_cart')) || [];
  wishlist = JSON.parse(localStorage.getItem('trendaryo_wishlist')) || [];
  updateCartCount();
  updateWishlistCount();
  
  // Add body padding for fixed header
  document.body.style.paddingTop = '100px';
  
  // Initialize smooth scrolling for anchor links
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', function (e) {
      const href = this.getAttribute('href');
      if (href === '#' || href === '#!') return;

      const targetElement = document.querySelector(href);
      if (targetElement) {
        e.preventDefault();
        window.scrollTo({
          top: targetElement.offsetTop - 80,
          behavior: 'smooth',
        });
      }
    });
  });

  // Smooth scrolling for anchor links
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', function (e) {
      const href = this.getAttribute('href');
      if (href === '#' || href === '#!') return;

      const targetElement = document.querySelector(href);
      if (targetElement) {
        e.preventDefault();
        window.scrollTo({
          top: targetElement.offsetTop - 80,
          behavior: 'smooth',
        });
      }
    });
  });

  // Add to cart buttons
  document.addEventListener('click', function (e) {
    if (e.target.classList.contains('add-to-cart') || e.target.closest('.add-to-cart')) {
      const button = e.target.classList.contains('add-to-cart')
        ? e.target
        : e.target.closest('.add-to-cart');
      const productId = button.getAttribute('data-id');

      if (productId) {
        addToCart(productId);

        // Visual feedback
        const originalText = button.textContent;
        button.textContent = 'Added!';
        button.style.backgroundColor = '#4CAF50';

        setTimeout(() => {
          button.textContent = originalText;
          button.style.backgroundColor = '';
        }, 1500);
      }
    }
  });
});

// Add CSS for notifications
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    .notification-close {
        background: none;
        border: none;
        color: white;
        font-size: 1.5rem;
        cursor: pointer;
        padding: 0;
        line-height: 1;
    }
`;
document.head.appendChild(style);
