@echo off
echo ========================================
echo 🌳 Groundzy - Update GitHub
echo ========================================
echo.

echo 📊 Checking Git status...
git status

echo.
echo 📁 Adding all changed files...
git add .

echo.
echo 💾 Committing changes...
git commit -m "Update: %date% %time%"

echo.
echo 🚀 Pushing to GitHub...
git push

echo.
echo ✅ Update complete! Your changes are now on GitHub.
echo 🌐 Visit: https://github.com/GzAdmin-93/cursor
echo.

pause 