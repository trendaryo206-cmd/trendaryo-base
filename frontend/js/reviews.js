class ProductReviews {
  constructor(productId) {
    this.productId = productId;
    this.reviews = [];
    this.currentUser = JSON.parse(localStorage.getItem('user'));
    this.init();
  }

  async init() {
    await this.loadReviews();
    this.renderReviews();
    this.initReviewForm();
  }

  async loadReviews() {
    try {
      const response = await fetch(`/api/products/${this.productId}/reviews`);
      this.reviews = await response.json();
    } catch (err) {
      console.error('Error loading reviews:', err);
    }
  }

  renderReviews() {
    const reviewsContainer = document.getElementById('product-reviews');
    if (!reviewsContainer) return;

    const averageRating = this.calculateAverageRating();

    reviewsContainer.innerHTML = `
      <div class="reviews-header">
        <h3>Customer Reviews</h3>
        <div class="average-rating">
          <div class="rating-stars">
            ${this.renderStars(averageRating)}
          </div>
          <span class="rating-number">${averageRating.toFixed(1)}</span>
          <span class="rating-count">(${this.reviews.length} reviews)</span>
        </div>
      </div>

      <div class="reviews-grid">
        ${this.reviews.map((review) => this.renderReview(review)).join('')}
      </div>

      ${
        this.currentUser
          ? this.renderReviewForm()
          : `
        <div class="login-prompt">
          <p>Please <a href="#login">login</a> to write a review</p>
        </div>
      `
      }
    `;
  }

  renderReview(review) {
    return `
      <div class="review-card">
        <div class="review-header">
          <div class="reviewer-info">
            <div class="reviewer-avatar">
              ${review.userName.charAt(0)}
            </div>
            <div>
              <h4>${review.userName}</h4>
              <div class="review-rating">
                ${this.renderStars(review.rating)}
              </div>
            </div>
          </div>
          <span class="review-date">
            ${new Date(review.createdAt).toLocaleDateString()}
          </span>
        </div>
        <div class="review-body">
          <p>${review.comment}</p>
        </div>
        ${
          this.currentUser && this.currentUser.id === review.userId
            ? `
          <div class="review-actions">
            <button class="btn-edit-review" data-review-id="${review.id}">Edit</button>
            <button class="btn-delete-review" data-review-id="${review.id}">Delete</button>
          </div>
        `
            : ''
        }
      </div>
    `;
  }

  renderReviewForm() {
    return `
      <div class="review-form-container">
        <h4>Write a Review</h4>
        <form id="review-form">
          <div class="form-group">
            <label>Your Rating</label>
            <div class="star-rating">
              ${[1, 2, 3, 4, 5]
                .map(
                  (i) => `
                <i class="far fa-star" data-rating="${i}"></i>
              `
                )
                .join('')}
            </div>
            <input type="hidden" id="review-rating" value="5">
          </div>
          <div class="form-group">
            <label for="review-comment">Your Review</label>
            <textarea id="review-comment" rows="4" required></textarea>
          </div>
          <button type="submit" class="btn">Submit Review</button>
        </form>
      </div>
    `;
  }

  initReviewForm() {
    const reviewForm = document.getElementById('review-form');
    if (reviewForm) {
      // Star rating selection
      document.querySelectorAll('.star-rating .fa-star').forEach((star) => {
        star.addEventListener('click', () => {
          const rating = parseInt(star.getAttribute('data-rating'));
          document.getElementById('review-rating').value = rating;

          // Update stars display
          document.querySelectorAll('.star-rating .fa-star').forEach((s, i) => {
            if (i < rating) {
              s.classList.remove('far');
              s.classList.add('fas');
            } else {
              s.classList.remove('fas');
              s.classList.add('far');
            }
          });
        });
      });

      // Form submission
      reviewForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const rating = document.getElementById('review-rating').value;
        const comment = document.getElementById('review-comment').value;

        await this.submitReview(rating, comment);
      });
    }

    // Edit/Delete buttons
    document.querySelectorAll('.btn-edit-review').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const reviewId = e.target.getAttribute('data-review-id');
        this.editReview(reviewId);
      });
    });

    document.querySelectorAll('.btn-delete-review').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const reviewId = e.target.getAttribute('data-review-id');
        if (confirm('Delete this review?')) {
          this.deleteReview(reviewId);
        }
      });
    });
  }

  async submitReview(rating, comment) {
    try {
      const response = await fetch(`/api/products/${this.productId}/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ rating, comment }),
      });

      if (response.ok) {
        await this.loadReviews();
        this.renderReviews();
        this.showNotification('Review submitted successfully!', 'success');
      } else {
        this.showNotification('Failed to submit review', 'error');
      }
    } catch (err) {
      console.error('Error submitting review:', err);
      this.showNotification('An error occurred', 'error');
    }
  }

  async deleteReview(reviewId) {
    try {
      const response = await fetch(`/api/reviews/${reviewId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (response.ok) {
        await this.loadReviews();
        this.renderReviews();
        this.showNotification('Review deleted', 'success');
      }
    } catch (err) {
      console.error('Error deleting review:', err);
    }
  }

  renderStars(rating) {
    let stars = '';
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars += '<i class="fas fa-star"></i>';
      } else if (i === fullStars && hasHalfStar) {
        stars += '<i class="fas fa-star-half-alt"></i>';
      } else {
        stars += '<i class="far fa-star"></i>';
      }
    }
    return stars;
  }

  calculateAverageRating() {
    if (this.reviews.length === 0) return 0;
    const sum = this.reviews.reduce((total, review) => total + review.rating, 0);
    return sum / this.reviews.length;
  }

  showNotification(message, type) {
    // Use existing notification system
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    document.body.appendChild(notification);

    setTimeout(() => notification.remove(), 3000);
  }
}

// Initialize on product page
if (window.location.pathname.includes('product.html')) {
  document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get('id');

    if (productId) {
      const reviews = new ProductReviews(productId);
    }
  });
}
