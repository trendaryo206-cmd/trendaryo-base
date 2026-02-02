#!/bin/bash

echo "=========================================="
echo "  Fresh Git Setup for Trendaryo Project"
echo "=========================================="
echo

# Initialize new git repository
echo "1. Initializing new Git repository..."
git init

# Add all files
echo "2. Adding all project files..."
git add .

# Initial commit
echo "3. Creating initial commit..."
git commit -m "feat: initial commit - Trendaryo e-commerce website"

# Set main branch
echo "4. Setting main branch..."
git branch -M main

echo
echo "=========================================="
echo "Next steps:"
echo "1. Create a new repository on GitHub"
echo "2. Run: git remote add origin YOUR_GITHUB_REPO_URL"
echo "3. Run: git push -u origin main"
echo "=========================================="
echo
echo "Example:"
echo "git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git"
echo "git push -u origin main"
echo "=========================================="