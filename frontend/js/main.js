// ====== SHARED COMPONENT LOADING ======
async function loadHeader() {
  const attempts = [
    'components/header.html',
    './components/header.html',
    '/frontend/components/header.html',
    window.location.pathname.replace(/[^/]*$/, '') + 'components/header.html',
  ];

  for (const path of attempts) {
    try {
      const res = await fetch(path);
      if (res.ok) {
        const data = await res.text();
        const container = document.getElementById('header-container');
        if (container) {
          container.innerHTML = data;
          initHeader();
        }
        return;
      }
    } catch (e) {
      // ignore and try next
    }
  }

  console.error('Error loading header: component not found in attempted paths');
  const container = document.getElementById('header-container');
  if (container) container.innerHTML = '<p>Error loading header</p>';
}

async function loadFooter() {
  const attempts = [
    'components/footer.html',
    './components/footer.html',
    '/frontend/components/footer.html',
    window.location.pathname.replace(/[^/]*$/, '') + 'components/footer.html',
  ];

  for (const path of attempts) {
    try {
      const res = await fetch(path);
      if (res.ok) {
        const data = await res.text();
        const container = document.getElementById('footer-container');
        if (container) container.innerHTML = data;
        return;
      }
    } catch (e) {
      // ignore and try next
    }
  }

  console.error('Error loading footer: component not found in attempted paths');
  const container = document.getElementById('footer-container');
  if (container) container.innerHTML = '<p>Error loading footer</p>';
}

// ====== HEADER FUNCTIONALITY ======
function initHeader() {
  // Mobile menu toggle
  const mobileMenuToggle = document.getElementById('mobile-menu-toggle');
  const navLinks = document.querySelector('.nav-links') || document.getElementById('nav-links');

  if (mobileMenuToggle && navLinks) {
    mobileMenuToggle.addEventListener('click', () => {
      navLinks.classList.toggle('active');
      mobileMenuToggle.innerHTML = navLinks.classList.contains('active')
        ? '<i class="fas fa-times"></i>'
        : '<i class="fas fa-bars"></i>';
    });

    // Close mobile menu when clicking a link
    document.querySelectorAll('.nav-links a').forEach((link) => {
      link.addEventListener('click', () => {
        navLinks.classList.remove('active');
        if (mobileMenuToggle) {
          mobileMenuToggle.innerHTML = '<i class="fas fa-bars"></i>';
        }
      });
    });
  }

  // Update cart count
  updateCartCount();

  // Header scroll effect
  window.addEventListener('scroll', () => {
    const header = document.getElementById('main-header');
    if (header) {
      if (window.scrollY > 100) {
        header.style.boxShadow = '0 5px 20px rgba(0, 0, 0, 0.1)';
      } else {
        header.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.05)';
      }
    }
  });
}

// ====== CART FUNCTIONALITY ======
let cart = JSON.parse(localStorage.getItem('trendaryo_cart')) || [];

function updateCartCount() {
  const cartCount = document.querySelector('.cart-count');
  if (cartCount) {
    const count = cart.reduce((total, item) => total + item.quantity, 0);
    cartCount.textContent = count;
    cartCount.style.display = count > 0 ? 'flex' : 'none';
  }
}

function addToCart(productId) {
  // In a real app, this would fetch product details from an API
  const product = {
    id: productId,
    name: `Product ${productId}`,
    price: 99.99,
    quantity: 1,
  };

  const existingItem = cart.find((item) => item.id === productId);
  if (existingItem) {
    existingItem.quantity++;
  } else {
    cart.push(product);
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
        background: ${type === 'success' ? '#4CAF50' : '#f44336'};
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
  // Load shared components on pages that have the containers
  if (document.getElementById('header-container')) {
    loadHeader();
  }
  if (document.getElementById('footer-container')) {
    loadFooter();
  }

  // Initialize newsletter forms
  handleNewsletterForm('community-form');

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
