@echo off
echo ==========================================
echo   Fresh Git Setup for Trendaryo Project
echo ==========================================
echo.

REM Initialize new git repository
echo 1. Initializing new Git repository...
git init

REM Add all files
echo 2. Adding all project files...
git add .

REM Initial commit
echo 3. Creating initial commit...
git commit -m "feat: initial commit - Trendaryo e-commerce website"

REM Set main branch
echo 4. Setting main branch...
git branch -M main

echo.
echo ==========================================
echo Next steps:
echo 1. Create a new repository on GitHub
echo 2. Run: git remote add origin YOUR_GITHUB_REPO_URL
echo 3. Run: git push -u origin main
echo ==========================================
echo.
echo Example:
echo git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
echo git push -u origin main
echo ==========================================

pause