# 🛍️ Trendaryo - Handpicked Trends, Delivered to You

A modern e-commerce website showcasing curated trending products with a clean, responsive design.

## 🌟 Features

- **Responsive Design**: Optimized for all devices
- **Modern UI/UX**: Clean, professional interface with smooth animations
- **Product Showcase**: Trending products with interactive elements
- **Shopping Cart**: Add to cart functionality
- **User Authentication**: Login/Register system
- **Collections**: Curated product collections
- **Newsletter Signup**: Community engagement features

## 🚀 Live Demo

Visit the live site: [trendaryo.com](https://trendaryo.com)

## 🛠️ Tech Stack

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Build Tool**: Vite
- **Backend**: Node.js, Express.js
- **Database**: MongoDB
- **Deployment**: GitHub Pages (Frontend), Separate hosting for Backend
- **Styling**: Custom CSS with CSS Variables

## 📁 Project Structure

```
project-trendaryo-main/
├── frontend/           # Frontend application
│   ├── assets/        # Images and static assets
│   ├── components/    # Reusable HTML components
│   ├── css/          # Stylesheets
│   ├── js/           # JavaScript modules
│   ├── *.html        # HTML pages
│   └── package.json  # Frontend dependencies
├── backend/          # Backend API (Node.js/Express)
│   ├── controller/   # Route controllers
│   ├── middleware/   # Custom middleware
│   ├── models/       # Database models
│   ├── routes/       # API routes
│   └── server.js     # Main server file
└── .github/          # GitHub Actions workflows
```

## 🚀 Quick Start

### Frontend Development

1. **Clone the repository**
   ```bash
   git clone https://github.com/trendaryo-admin/trendaryo-site.git
   cd trendaryo-site
   ```

2. **Install frontend dependencies**
   ```bash
   cd frontend
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Build for production**
   ```bash
   npm run build
   ```

### Backend Setup

1. **Navigate to backend directory**
   ```bash
   cd backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your MongoDB URI and JWT secret
   ```

4. **Start the server**
   ```bash
   npm run dev
   ```

## 🌐 Deployment

### GitHub Pages (Automatic)

The site automatically deploys to GitHub Pages when you push to the `main` branch. The GitHub Actions workflow:

1. Builds the frontend using Vite
2. Deploys to GitHub Pages
3. Updates the custom domain (trendaryo.com)

### Manual Deployment

To deploy manually:

```bash
cd frontend
npm run build
# Upload the dist/ folder to your hosting provider
```

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the backend directory:

```env
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
PORT=5000
```

### Custom Domain

The site is configured to use `trendaryo.com`. To change this:

1. Update the `CNAME` file in the root directory
2. Update the `cname` field in `.github/workflows/deploy.yml`

## 📱 Pages

- **Home** (`index.html`) - Landing page with hero section and trending products
- **Shop** (`shop.html`) - Product catalog
- **Product** (`product.html`) - Individual product details
- **Cart** (`cart.html`) - Shopping cart
- **Checkout** (`checkout.html`) - Order completion
- **Account** (`account.html`) - User dashboard
- **About** (`about.html`) - Company information
- **Contact** (`contact.html`) - Contact form

## 🎨 Customization

### Colors

The site uses CSS custom properties for easy theming:

```css
:root {
  --primary-dark: #0a192f;
  --primary-light: #ffffff;
  --accent-gold: #d4af37;
  --accent-light-gold: #f4e8c1;
  --text-dark: #333333;
  --text-light: #666666;
}
```

### Fonts

- **Headings**: Playfair Display (serif)
- **Body**: Inter (sans-serif)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support, email support@trendaryo.com or create an issue in this repository.

## 🔗 Links

- **Website**: [trendaryo.com](https://trendaryo.com)
- **Repository**: [GitHub](https://github.com/trendaryo-admin/trendaryo-site)

---

Made with ❤️ by the Trendaryo team