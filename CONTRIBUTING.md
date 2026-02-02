# Contributing to Trendaryo

Thank you for your interest in contributing to Trendaryo! We welcome contributions from the community.

## 🚀 Getting Started

1. **Fork the repository**
2. **Clone your fork**
   ```bash
   git clone https://github.com/YOUR_USERNAME/trendaryo-site.git
   cd trendaryo-site
   ```
3. **Create a branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

## 📋 Development Setup

### Frontend
```bash
cd frontend
npm install
npm run dev
```

### Backend
```bash
cd backend
npm install
cp .env.example .env
# Configure your .env file
npm run dev
```

## 🎯 How to Contribute

### 🐛 Bug Reports

When filing a bug report, please include:

- **Clear title and description**
- **Steps to reproduce**
- **Expected vs actual behavior**
- **Screenshots** (if applicable)
- **Environment details** (browser, OS, etc.)

### ✨ Feature Requests

For feature requests, please provide:

- **Clear description** of the feature
- **Use case** and motivation
- **Possible implementation** approach
- **Alternative solutions** considered

### 🔧 Code Contributions

1. **Follow the existing code style**
2. **Write clear commit messages**
3. **Add tests** for new features
4. **Update documentation** as needed
5. **Ensure all tests pass**

## 📝 Code Style

### HTML
- Use semantic HTML5 elements
- Maintain proper indentation (2 spaces)
- Include alt attributes for images
- Use meaningful class names

### CSS
- Use CSS custom properties for theming
- Follow BEM methodology for class naming
- Mobile-first responsive design
- Maintain consistent spacing

### JavaScript
- Use ES6+ features
- Follow camelCase naming convention
- Add comments for complex logic
- Handle errors gracefully

## 🧪 Testing

Before submitting a pull request:

```bash
# Frontend
cd frontend
npm run build  # Ensure build works
npm run preview  # Test production build

# Backend
cd backend
npm test  # Run tests (if available)
```

## 📤 Pull Request Process

1. **Update documentation** if needed
2. **Add yourself** to contributors list
3. **Create pull request** with:
   - Clear title and description
   - Reference to related issues
   - Screenshots of changes (if UI-related)

### Pull Request Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Tested locally
- [ ] All tests pass
- [ ] Cross-browser tested

## Screenshots
(If applicable)
```

## 🏷️ Commit Messages

Use conventional commit format:

```
type(scope): description

feat(auth): add user registration
fix(cart): resolve quantity update bug
docs(readme): update installation steps
style(header): improve mobile navigation
```

Types:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation
- `style`: Code style changes
- `refactor`: Code refactoring
- `test`: Adding tests
- `chore`: Maintenance tasks

## 🌟 Recognition

Contributors will be recognized in:
- README.md contributors section
- Release notes
- Project documentation

## 📞 Getting Help

- **GitHub Issues**: For bugs and feature requests
- **Email**: contribute@trendaryo.com
- **Discussions**: Use GitHub Discussions for questions

## 📜 Code of Conduct

Please note that this project follows our [Code of Conduct](CODE_OF_CONDUCT.md). By participating, you agree to abide by its terms.

## 📄 License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

Thank you for contributing to Trendaryo! 🎉