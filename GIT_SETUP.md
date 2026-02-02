# Fresh Git Setup Instructions

## Quick Start (Windows)
```bash
setup-git.bat
```

## Quick Start (Linux/Mac)
```bash
chmod +x setup-git.sh
./setup-git.sh
```

## Manual Setup
```bash
# 1. Initialize Git
git init

# 2. Add all files
git add .

# 3. Initial commit
git commit -m "feat: initial commit - Trendaryo e-commerce website"

# 4. Set main branch
git branch -M main

# 5. Add your GitHub repository
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git

# 6. Push to GitHub
git push -u origin main
```

## After Pushing to GitHub
1. Go to your GitHub repository settings
2. Enable GitHub Pages
3. Set source to "GitHub Actions"
4. Your site will be live at: https://YOUR_USERNAME.github.io/YOUR_REPO_NAME