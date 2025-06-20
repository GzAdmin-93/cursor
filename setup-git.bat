@echo off
echo ========================================
echo 🌳 Groundzy - Git Setup
echo ========================================
echo.

echo 🔧 Initializing Git repository...
git init

echo.
echo 📁 Adding all files to Git...
git add .

echo.
echo 💾 Making initial commit...
git commit -m "Initial commit - Groundzy tree management platform with modular architecture"

echo.
echo 🔗 Connecting to GitHub repository...
git remote add origin https://github.com/GzAdmin-93/cursor.git

echo.
echo 🚀 Pushing to GitHub...
git branch -M main
git push -u origin main

echo.
echo ✅ Setup complete! Your code is now on GitHub.
echo 🌐 Visit: https://github.com/GzAdmin-93/cursor
echo.
echo 💡 Next: Enable GitHub Pages in repository settings
echo.

pause 