class Auth {
  constructor() {
    this.token = localStorage.getItem('token');
    this.user = JSON.parse(localStorage.getItem('user'));
    this.init();
  }

  init() {
    // Update UI based on auth status
    this.updateAuthUI();

    // Initialize auth forms
    this.initLoginForm();
    this.initRegisterForm();
    this.initLogout();
  }

  async login(email, password) {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        this.token = data.token;
        this.user = data.user;

        localStorage.setItem('token', this.token);
        localStorage.setItem('user', JSON.stringify(this.user));

        this.updateAuthUI();
        this.showNotification('Login successful!', 'success');

        // Redirect or close modal
        setTimeout(() => {
          window.location.href = '/account.html';
        }, 1000);

        return true;
      } else {
        this.showNotification(data.error, 'error');
        return false;
      }
    } catch (err) {
      console.error('Login error:', err);
      this.showNotification('Login failed. Please try again.', 'error');
      return false;
    }
  }

  async register(email, password, name) {
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name }),
      });

      const data = await response.json();

      if (response.ok) {
        this.token = data.token;
        this.user = data.user;

        localStorage.setItem('token', this.token);
        localStorage.setItem('user', JSON.stringify(this.user));

        this.updateAuthUI();
        this.showNotification('Registration successful!', 'success');

        // Redirect to account page
        setTimeout(() => {
          window.location.href = '/account.html';
        }, 1000);

        return true;
      } else {
        this.showNotification(data.error, 'error');
        return false;
      }
    } catch (err) {
      console.error('Registration error:', err);
      this.showNotification('Registration failed. Please try again.', 'error');
      return false;
    }
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.token = null;
    this.user = null;

    this.updateAuthUI();
    this.showNotification('Logged out successfully', 'success');

    // Redirect to homepage
    setTimeout(() => {
      window.location.href = '/';
    }, 1000);
  }

  updateAuthUI() {
    const authLinks = document.getElementById('auth-links');
    const userMenu = document.getElementById('user-menu');

    if (!authLinks || !userMenu) return;

    if (this.isAuthenticated()) {
      authLinks.style.display = 'none';
      userMenu.style.display = 'block';

      // Update user info
      document.querySelectorAll('.user-name').forEach((el) => {
        el.textContent = this.user.name;
      });

      document.querySelectorAll('.user-email').forEach((el) => {
        el.textContent = this.user.email;
      });
    } else {
      authLinks.style.display = 'block';
      userMenu.style.display = 'none';
    }
  }

  isAuthenticated() {
    return !!this.token && !!this.user;
  }

  getAuthHeader() {
    return this.token ? { Authorization: `Bearer ${this.token}` } : {};
  }

  initLoginForm() {
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
      loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;

        await this.login(email, password);
      });
    }
  }

  initRegisterForm() {
    const registerForm = document.getElementById('register-form');
    if (registerForm) {
      registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const name = document.getElementById('register-name').value;
        const email = document.getElementById('register-email').value;
        const password = document.getElementById('register-password').value;
        const confirmPassword = document.getElementById('register-confirm-password').value;

        if (password !== confirmPassword) {
          this.showNotification('Passwords do not match', 'error');
          return;
        }

        await this.register(email, password, name);
      });
    }
  }

  initLogout() {
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', (e) => {
        e.preventDefault();
        this.logout();
      });
    }
  }

  showNotification(message, type) {
    // Use existing notification function or create new
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
      <span>${message}</span>
      <button class="notification-close">&times;</button>
    `;

    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: ${type === 'success' ? '#4CAF50' : '#f44336'};
      color: white;
      padding: 1rem 1.5rem;
      border-radius: 5px;
      box-shadow: 0 5px 15px rgba(0,0,0,0.2);
      z-index: 9999;
      animation: slideIn 0.3s ease;
    `;

    document.body.appendChild(notification);

    notification.querySelector('.notification-close').addEventListener('click', () => {
      notification.remove();
    });

    setTimeout(() => {
      if (notification.parentNode) {
        notification.remove();
      }
    }, 3000);
  }
}

// Initialize auth system
const auth = new Auth();

// Update header with auth links
document.addEventListener('DOMContentLoaded', () => {
  // Add auth links to header
  const headerContainer = document.getElementById('header-container');
  if (headerContainer) {
    // This would be added to the header component
    const authHTML = `
      <div id="auth-links" style="display: none;">
        <a href="#login" class="btn btn-outline" id="login-link">Login</a>
        <a href="#register" class="btn" id="register-link">Sign Up</a>
      </div>
      <div id="user-menu" style="display: none;">
        <div class="user-dropdown">
          <button class="user-avatar">
            <span class="user-initials">${auth.user ? auth.user.name.charAt(0) : 'U'}</span>
          </button>
          <div class="dropdown-content">
            <a href="/account.html"><i class="fas fa-user"></i> My Account</a>
            <a href="/orders.html"><i class="fas fa-box"></i> My Orders</a>
            <a href="/wishlist.html"><i class="fas fa-heart"></i> Wishlist</a>
            <a href="#" id="logout-btn"><i class="fas fa-sign-out-alt"></i> Logout</a>
          </div>
        </div>
      </div>
    `;

    // Add to existing header
    const existingHeader = headerContainer.innerHTML;
    headerContainer.innerHTML = existingHeader + authHTML;

    // Initialize modals
    auth.init();
  }
});
