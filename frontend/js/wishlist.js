class Wishlist {
  constructor() {
    this.wishlistItems = JSON.parse(localStorage.getItem('wishlist')) || [];
    this.user = JSON.parse(localStorage.getItem('user'));
    this.init();
  }

  init() {
    this.updateWishlistCount();
    this.setupWishlistButtons();

    // Load wishlist page if needed
    if (window.location.pathname.includes('wishlist.html')) {
      this.loadWishlistPage();
    }
  }

  async toggleWishlist(productId) {
    if (!this.user) {
      this.showLoginPrompt();
      return;
    }

    const isInWishlist = this.wishlistItems.some((item) => item.id === productId);

    if (isInWishlist) {
      await this.removeFromWishlist(productId);
    } else {
      await this.addToWishlist(productId);
    }
  }

  async addToWishlist(productId) {
    try {
      // Get product details
      const product = await this.getProductDetails(productId);

      // Add to local storage
      this.wishlistItems.push(product);
      localStorage.setItem('wishlist', JSON.stringify(this.wishlistItems));

      // Update UI
      this.updateWishlistCount();
      this.updateWishlistButton(productId, true);

      // Save to server
      await fetch('/api/wishlist', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ productId }),
      });

      this.showNotification('Added to wishlist', 'success');
    } catch (err) {
      console.error('Error adding to wishlist:', err);
      this.showNotification('Failed to add to wishlist', 'error');
    }
  }

  async removeFromWishlist(productId) {
    try {
      // Remove from local storage
      this.wishlistItems = this.wishlistItems.filter((item) => item.id !== productId);
      localStorage.setItem('wishlist', JSON.stringify(this.wishlistItems));

      // Update UI
      this.updateWishlistCount();
      this.updateWishlistButton(productId, false);

      // Remove from server
      await fetch(`/api/wishlist/${productId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      this.showNotification('Removed from wishlist', 'success');
    } catch (err) {
      console.error('Error removing from wishlist:', err);
    }
  }

  updateWishlistCount() {
    const wishlistCount = document.querySelector('.wishlist-count');
    if (wishlistCount) {
      const count = this.wishlistItems.length;
      wishlistCount.textContent = count;
      wishlistCount.style.display = count > 0 ? 'flex' : 'none';
    }
  }

  setupWishlistButtons() {
    // Add wishlist button to product cards
    document.addEventListener('click', (e) => {
      const wishlistBtn = e.target.closest('.wishlist-btn');
      if (wishlistBtn) {
        e.preventDefault();
        const productId = wishlistBtn.getAttribute('data-id');
        this.toggleWishlist(productId);
      }
    });
  }

  updateWishlistButton(productId, isInWishlist) {
    const buttons = document.querySelectorAll(`.wishlist-btn[data-id="${productId}"]`);
    buttons.forEach((btn) => {
      if (isInWishlist) {
        btn.innerHTML = '<i class="fas fa-heart"></i>';
        btn.classList.add('in-wishlist');
      } else {
        btn.innerHTML = '<i class="far fa-heart"></i>';
        btn.classList.remove('in-wishlist');
      }
    });
  }

  async loadWishlistPage() {
    const wishlistContainer = document.getElementById('wishlist-items');
    if (!wishlistContainer) return;

    if (this.wishlistItems.length === 0) {
      wishlistContainer.innerHTML = `
        <div class="empty-wishlist">
          <i class="far fa-heart"></i>
          <h3>Your wishlist is empty</h3>
          <p>Save items you love to your wishlist</p>
          <a href="/shop.html" class="btn">Start Shopping</a>
        </div>
      `;
      return;
    }

    wishlistContainer.innerHTML = `
      <div class="wishlist-header">
        <h2>My Wishlist</h2>
        <button class="btn btn-outline" id="clear-wishlist">
          Clear All
        </button>
      </div>
      <div class="wishlist-grid">
        ${this.wishlistItems.map((item) => this.renderWishlistItem(item)).join('')}
      </div>
    `;

    // Add event listeners
    document.getElementById('clear-wishlist')?.addEventListener('click', () => {
      if (confirm('Clear all items from wishlist?')) {
        this.clearWishlist();
      }
    });

    // Setup remove buttons
    document.querySelectorAll('.remove-wishlist').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const productId = e.target.closest('button').getAttribute('data-id');
        this.removeFromWishlist(productId);
        this.loadWishlistPage();
      });
    });

    // Setup move to cart buttons
    document.querySelectorAll('.move-to-cart').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const productId = e.target.closest('button').getAttribute('data-id');
        this.moveToCart(productId);
      });
    });
  }

  renderWishlistItem(item) {
    return `
      <div class="wishlist-item">
        <div class="wishlist-item-image">
          <div style="background-color: ${item.imageColor || '#f5f5f5'}; 
                     width: 120px; height: 120px; border-radius: 5px;">
          </div>
          <button class="remove-wishlist" data-id="${item.id}" title="Remove">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="wishlist-item-info">
          <h3>${item.name}</h3>
          <div class="wishlist-item-price">$${item.price.toFixed(2)}</div>
          <div class="wishlist-item-status ${item.status}">
            ${this.getStatusBadge(item.status)}
          </div>
        </div>
        <div class="wishlist-item-actions">
          <button class="btn move-to-cart" data-id="${item.id}">
            Add to Cart
          </button>
          <button class="btn btn-outline view-product" 
                  onclick="window.location.href='/product.html?id=${item.id}'">
            View Product
          </button>
        </div>
      </div>
    `;
  }

  getStatusBadge(status) {
    switch (status) {
      case 'hot':
        return '🔥 Hot';
      case 'new':
        return '✨ New';
      case 'limited':
        return '⏳ Limited';
      default:
        return 'In Stock';
    }
  }

  async moveToCart(productId) {
    try {
      const product = this.wishlistItems.find((item) => item.id === productId);
      if (product) {
        // Add to cart
        const cart = JSON.parse(localStorage.getItem('cart')) || [];
        cart.push({ ...product, quantity: 1 });
        localStorage.setItem('cart', JSON.stringify(cart));

        // Remove from wishlist
        await this.removeFromWishlist(productId);

        // Update cart count
        const cartCount = document.querySelector('.cart-count');
        if (cartCount) {
          cartCount.textContent = cart.length;
          cartCount.style.display = 'flex';
        }

        this.showNotification('Added to cart', 'success');
      }
    } catch (err) {
      console.error('Error moving to cart:', err);
    }
  }

  clearWishlist() {
    this.wishlistItems = [];
    localStorage.removeItem('wishlist');

    // Clear from server
    fetch('/api/wishlist/clear', {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    });

    this.updateWishlistCount();
    this.loadWishlistPage();
  }

  async getProductDetails(productId) {
    // Try to get from local storage first
    const allProducts = JSON.parse(localStorage.getItem('allProducts')) || [];
    let product = allProducts.find((p) => p.id === productId);

    if (!product) {
      // Fetch from API
      const response = await fetch(`/api/products/${productId}`);
      product = await response.json();
    }

    return product;
  }

  showLoginPrompt() {
    const modal = document.createElement('div');
    modal.className = 'login-modal';
    modal.innerHTML = `
      <div class="modal-content">
        <h3>Sign In Required</h3>
        <p>Please sign in to save items to your wishlist.</p>
        <div class="modal-actions">
          <button class="btn" id="go-to-login">Sign In</button>
          <button class="btn btn-outline" id="close-modal">Cancel</button>
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    document.getElementById('go-to-login').addEventListener('click', () => {
      window.location.href = '/login.html';
    });

    document.getElementById('close-modal').addEventListener('click', () => {
      modal.remove();
    });
  }

  showNotification(message, type) {
    // Use existing notification system
    console.log(message);
  }
}

// Initialize wishlist
const wishlist = new Wishlist();

// Add wishlist button to product cards dynamically
document.addEventListener('DOMContentLoaded', () => {
  // Add wishlist button to existing product cards
  document.querySelectorAll('.product-card').forEach((card) => {
    const productId = card.querySelector('.add-to-cart')?.getAttribute('data-id');
    if (productId) {
      const wishlistBtn = document.createElement('button');
      wishlistBtn.className = 'wishlist-btn';
      wishlistBtn.setAttribute('data-id', productId);
      wishlistBtn.innerHTML = '<i class="far fa-heart"></i>';
      wishlistBtn.title = 'Add to wishlist';

      // Check if already in wishlist
      if (wishlist.wishlistItems.some((item) => item.id === productId)) {
        wishlistBtn.innerHTML = '<i class="fas fa-heart"></i>';
        wishlistBtn.classList.add('in-wishlist');
      }

      card.querySelector('.product-image').appendChild(wishlistBtn);
    }
  });
});
