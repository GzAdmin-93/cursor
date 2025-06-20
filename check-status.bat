@echo off
echo ========================================
echo 🌳 Groundzy - Check Git Status
echo ========================================
echo.

echo 📊 Current Git status:
git status

echo.
echo 📝 Recent commits:
git log --oneline -5

echo.
echo 💡 To update GitHub, run: update-git.bat
echo.

pause 