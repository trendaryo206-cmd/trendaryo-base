// Minimal products loader for demo purposes
(function () {
  function renderProduct(product) {
    return `
      <div class="product-card">
        <div class="product-card-image">
          <img src="${product.image}" alt="${product.name}" />
        </div>
        <div class="product-card-info">
          <h4 class="product-card-title">${product.name}</h4>
          <div class="product-card-price">${product.price}</div>
          <button class="btn add-to-cart" data-id="${product.id}">Add to cart</button>
        </div>
      </div>
    `;
  }

  function loadProducts(offset = 0, limit = 8) {
    const sample = [];
    for (let i = 1 + offset; i <= offset + limit; i++) {
      sample.push({
        id: i,
        name: `Sample Product ${i}`,
        price: `$${(19.99 + i).toFixed(2)}`,
        image: 'https://images.unsplash.com/photo-1526178614474-3f27d9f7ae0b?auto=format&fit=crop&w=600&q=60',
      });
    }
    const grid = document.getElementById('products-grid');
    if (!grid) return;
    sample.forEach((p) => {
      const wrapper = document.createElement('div');
      wrapper.innerHTML = renderProduct(p);
      grid.appendChild(wrapper.firstElementChild);
    });
  }

  // Expose init for shop page
  window.initShopPage = function () {
    const loadMore = document.getElementById('load-more');
    let offset = 0;
    const limit = 8;
    loadProducts(offset, limit);
    offset += limit;
    if (loadMore) {
      loadMore.addEventListener('click', function () {
        loadProducts(offset, limit);
        offset += limit;
      });
    }
  };
})();
