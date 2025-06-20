@echo off
echo ========================================
echo 🌳 Groundzy - Start Development Server
echo ========================================
echo.

echo 🚀 Starting live-server...
echo 📱 Your app will open at: http://localhost:8000
echo 🗺️ Dashboard: http://localhost:8000/dashboard.html
echo.

live-server --port=8000 --open=/dashboard.html

pause 