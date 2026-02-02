class StripePayment {
  constructor() {
    this.stripe = Stripe(process.env.STRIPE_PUBLIC_KEY);
    this.elements = this.stripe.elements();
    this.cardElement = null;
    this.paymentForm = null;
  }

  init() {
    // Create card element
    const style = {
      base: {
        color: '#32325d',
        fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
        fontSmoothing: 'antialiased',
        fontSize: '16px',
        '::placeholder': {
          color: '#aab7c4',
        },
      },
      invalid: {
        color: '#fa755a',
        iconColor: '#fa755a',
      },
    };

    this.cardElement = this.elements.create('card', { style });
    this.cardElement.mount('#card-element');

    // Handle form submission
    this.paymentForm = document.getElementById('payment-form');
    if (this.paymentForm) {
      this.paymentForm.addEventListener('submit', this.handleSubmit.bind(this));
    }
  }

  async handleSubmit(event) {
    event.preventDefault();

    const submitButton = event.target.querySelector('button[type="submit"]');
    const originalText = submitButton.textContent;
    submitButton.textContent = 'Processing...';
    submitButton.disabled = true;

    try {
      // Get client secret from server
      const { amount } = JSON.parse(localStorage.getItem('cartTotal'));
      const response = await fetch('/api/create-payment-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ amount }),
      });

      const { clientSecret } = await response.json();

      // Confirm payment
      const { error, paymentIntent } = await this.stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: this.cardElement,
          billing_details: {
            name: document.getElementById('card-name').value,
          },
        },
      });

      if (error) {
        this.showMessage(error.message);
        submitButton.textContent = originalText;
        submitButton.disabled = false;
      } else {
        // Payment successful
        await this.saveOrder(paymentIntent);
        this.showMessage('Payment successful! Redirecting...');

        setTimeout(() => {
          window.location.href = '/order-success.html';
        }, 2000);
      }
    } catch (err) {
      console.error('Payment error:', err);
      this.showMessage('An error occurred. Please try again.');
      submitButton.textContent = originalText;
      submitButton.disabled = false;
    }
  }

  async saveOrder(paymentIntent) {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const shippingAddress = JSON.parse(localStorage.getItem('shippingAddress'));

    const orderData = {
      products: cart.map((item) => ({
        productId: item.id,
        quantity: item.quantity,
        price: item.price,
      })),
      shippingAddress,
      paymentMethod: 'card',
      paymentId: paymentIntent.id,
    };

    await fetch('/api/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify(orderData),
    });

    // Clear cart
    localStorage.removeItem('cart');
    localStorage.removeItem('cartTotal');
  }

  showMessage(message) {
    const messageContainer = document.getElementById('payment-message');
    messageContainer.textContent = message;
    messageContainer.style.display = 'block';

    setTimeout(() => {
      messageContainer.style.display = 'none';
    }, 5000);
  }
}

// Initialize Stripe on checkout page
if (window.location.pathname.includes('checkout.html')) {
  document.addEventListener('DOMContentLoaded', () => {
    const stripePayment = new StripePayment();
    stripePayment.init();
  });
}
