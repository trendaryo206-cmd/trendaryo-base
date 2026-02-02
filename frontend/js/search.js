class SearchSystem {
  constructor() {
    this.searchInput = null;
    this.searchResults = null;
    this.searchOverlay = null;
    this.init();
  }

  init() {
    this.createSearchUI();
    this.setupEventListeners();
  }

  createSearchUI() {
    // Add search button to header
    const headerContainer = document.getElementById('header-container');
    if (headerContainer) {
      const searchHTML = `
        <div class="search-container">
          <button class="search-toggle" id="search-toggle">
            <i class="fas fa-search"></i>
          </button>
          <div class="search-overlay" id="search-overlay">
            <div class="search-modal">
              <div class="search-header">
                <div class="search-input-container">
                  <i class="fas fa-search"></i>
                  <input type="text" 
                         id="search-input" 
                         placeholder="Search products, categories, trends..." 
                         autocomplete="off">
                  <button class="search-close" id="search-close">
                    <i class="fas fa-times"></i>
                  </button>
                </div>
              </div>
              <div class="search-results" id="search-results">
                <!-- Results will appear here -->
              </div>
              <div class="search-categories">
                <span>Popular Searches:</span>
                <a href="/shop.html?q=smart+watch">Smart Watch</a>
                <a href="/shop.html?q=backpack">Backpack</a>
                <a href="/shop.html?q=earbuds">Earbuds</a>
                <a href="/shop.html?q=sustainable">Sustainable</a>
              </div>
            </div>
          </div>
        </div>
      `;

      headerContainer.insertAdjacentHTML('beforeend', searchHTML);

      this.searchInput = document.getElementById('search-input');
      this.searchResults = document.getElementById('search-results');
      this.searchOverlay = document.getElementById('search-overlay');
    }
  }

  setupEventListeners() {
    // Toggle search overlay
    document.getElementById('search-toggle')?.addEventListener('click', () => {
      this.searchOverlay.classList.add('active');
      this.searchInput.focus();
    });

    // Close search
    document.getElementById('search-close')?.addEventListener('click', () => {
      this.searchOverlay.classList.remove('active');
    });

    // Close on escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        this.searchOverlay.classList.remove('active');
      }
    });

    // Search input with debounce
    let searchTimeout;
    this.searchInput?.addEventListener('input', (e) => {
      clearTimeout(searchTimeout);
      const query = e.target.value.trim();

      if (query.length === 0) {
        this.showRecentSearches();
        return;
      }

      if (query.length < 2) return;

      searchTimeout = setTimeout(() => {
        this.performSearch(query);
      }, 300);
    });

    // Handle search form submission
    const searchForm = document.querySelector('form[role="search"]');
    if (searchForm) {
      searchForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const query = this.searchInput.value.trim();
        if (query) {
          window.location.href = `/shop.html?q=${encodeURIComponent(query)}`;
        }
      });
    }
  }

  async performSearch(query) {
    try {
      const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
      const results = await response.json();

      this.displayResults(results, query);
    } catch (err) {
      console.error('Search error:', err);
      this.searchResults.innerHTML = `
        <div class="search-error">
          <p>Unable to perform search. Please try again.</p>
        </div>
      `;
    }
  }

  displayResults(results, query) {
    if (results.length === 0) {
      this.searchResults.innerHTML = `
        <div class="no-results">
          <p>No results found for "<strong>${query}</strong>"</p>
          <p>Try different keywords or browse our categories.</p>
        </div>
      `;
      return;
    }

    this.searchResults.innerHTML = `
      <div class="search-results-header">
        <p>${results.length} results for "<strong>${query}</strong>"</p>
        <a href="/shop.html?q=${encodeURIComponent(query)}" class="view-all">
          View all results
        </a>
      </div>
      <div class="search-results-grid">
        ${results
          .map(
            (product) => `
          <a href="/product.html?id=${product.id}" class="search-result-item">
            <div class="search-result-image">
              <div style="background-color: ${product.imageColor || '#f5f5f5'}; 
                         width: 60px; height: 60px; border-radius: 5px;">
              </div>
            </div>
            <div class="search-result-info">
              <h4>${product.name}</h4>
              <div class="search-result-price">$${product.price.toFixed(2)}</div>
              <div class="search-result-category">${product.category}</div>
            </div>
          </a>
        `
          )
          .join('')}
      </div>
    `;
  }

  showRecentSearches() {
    const recentSearches = JSON.parse(localStorage.getItem('recentSearches')) || [];

    if (recentSearches.length === 0) {
      this.searchResults.innerHTML = `
        <div class="search-suggestions">
          <p>Start typing to search for products</p>
        </div>
      `;
      return;
    }

    this.searchResults.innerHTML = `
      <div class="recent-searches">
        <h4>Recent Searches</h4>
        ${recentSearches
          .map(
            (term) => `
          <a href="/shop.html?q=${encodeURIComponent(term)}" class="recent-search-term">
            <i class="fas fa-history"></i>
            <span>${term}</span>
          </a>
        `
          )
          .join('')}
        <button class="clear-recent" id="clear-recent">
          Clear recent searches
        </button>
      </div>
    `;

    document.getElementById('clear-recent')?.addEventListener('click', () => {
      localStorage.removeItem('recentSearches');
      this.showRecentSearches();
    });
  }

  saveSearchTerm(term) {
    const recentSearches = JSON.parse(localStorage.getItem('recentSearches')) || [];

    // Remove if already exists
    const index = recentSearches.indexOf(term);
    if (index > -1) {
      recentSearches.splice(index, 1);
    }

    // Add to beginning
    recentSearches.unshift(term);

    // Keep only last 5 searches
    if (recentSearches.length > 5) {
      recentSearches.pop();
    }

    localStorage.setItem('recentSearches', JSON.stringify(recentSearches));
  }
}

// Add search CSS
const searchStyles = `
  .search-container {
    position: relative;
  }
  
  .search-toggle {
    background: none;
    border: none;
    color: var(--text-dark);
    font-size: 1.2rem;
    cursor: pointer;
    padding: 0.5rem;
  }
  
  .search-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.8);
    z-index: 2000;
    display: none;
    opacity: 0;
    transition: opacity 0.3s ease;
  }
  
  .search-overlay.active {
    display: block;
    opacity: 1;
  }
  
  .search-modal {
    background-color: var(--primary-light);
    width: 100%;
    max-width: 800px;
    margin: 100px auto 0;
    border-radius: 10px;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
    max-height: 70vh;
    overflow-y: auto;
  }
  
  .search-header {
    padding: 1.5rem;
    border-bottom: 1px solid var(--gray-border);
  }
  
  .search-input-container {
    display: flex;
    align-items: center;
    gap: 1rem;
  }
  
  .search-input-container i {
    color: var(--text-light);
  }
  
  #search-input {
    flex: 1;
    border: none;
    font-size: 1.2rem;
    padding: 0.5rem 0;
    background: none;
  }
  
  #search-input:focus {
    outline: none;
  }
  
  .search-close {
    background: none;
    border: none;
    font-size: 1.5rem;
    cursor: pointer;
    color: var(--text-light);
  }
  
  .search-results {
    padding: 1.5rem;
  }
  
  .search-results-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1.5rem;
  }
  
  .search-results-grid {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }
  
  .search-result-item {
    display: flex;
    gap: 1rem;
    padding: 1rem;
    border-radius: 5px;
    text-decoration: none;
    color: var(--text-dark);
    transition: background-color 0.3s ease;
  }
  
  .search-result-item:hover {
    background-color: var(--gray-bg);
  }
  
  .search-result-info h4 {
    margin-bottom: 0.5rem;
  }
  
  .search-result-price {
    color: var(--accent-gold);
    font-weight: 600;
  }
  
  .search-result-category {
    font-size: 0.9rem;
    color: var(--text-light);
    text-transform: capitalize;
  }
  
  .search-categories {
    padding: 1.5rem;
    border-top: 1px solid var(--gray-border);
    display: flex;
    align-items: center;
    gap: 1rem;
    flex-wrap: wrap;
  }
  
  .search-categories span {
    font-weight: 600;
  }
  
  .search-categories a {
    color: var(--accent-gold);
    text-decoration: none;
    padding: 0.3rem 0.8rem;
    border: 1px solid var(--accent-gold);
    border-radius: 20px;
    font-size: 0.9rem;
  }
  
  .recent-searches {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .recent-search-term {
    display: flex;
    align-items: center;
    gap: 0.8rem;
    padding: 0.8rem;
    text-decoration: none;
    color: var(--text-dark);
    border-radius: 5px;
    transition: background-color 0.3s ease;
  }
  
  .recent-search-term:hover {
    background-color: var(--gray-bg);
  }
  
  .clear-recent {
    margin-top: 1rem;
    background: none;
    border: none;
    color: var(--text-light);
    cursor: pointer;
    text-align: left;
    padding: 0.5rem;
  }
`;

// Add styles to document
const styleSheet = document.createElement('style');
styleSheet.textContent = searchStyles;
document.head.appendChild(styleSheet);

// Initialize search system
document.addEventListener('DOMContentLoaded', () => {
  const searchSystem = new SearchSystem();
});
