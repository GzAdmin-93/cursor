# 🌳 Groundzy - Tree Management Platform

A web-based tree identification and management system built with vanilla JavaScript, Firebase, and Google Maps.

## 🚀 Quick Start

### Local Development
```bash
# Option 1: Using live-server (recommended)
npm install -g live-server
live-server --port=8000 --open=/dashboard.html

# Option 2: Using Python
python -m http.server 8000

# Option 3: Using Node.js
npx serve .
```

### Access the App
- **Login Page**: http://localhost:8000/
- **Dashboard**: http://localhost:8000/dashboard.html
- **Admin Panel**: http://localhost:8000/admin.html

## 🏗️ Project Structure

```
groundzy/
├── index.html          # Login page
├── dashboard.html      # Main dashboard
├── admin.html          # Admin panel
├── dashboard.js        # Main dashboard logic
├── script.js           # Login/authentication logic
├── tutorial.js         # Tutorial system
├── style.css           # Login page styles
├── dashboard.css       # Dashboard styles
├── config/
│   └── firebase.js     # Firebase configuration
├── modules/
│   ├── auth.js         # Authentication module
│   ├── map.js          # Map management module
│   └── tree.js         # Tree management module
└── README.md           # This file
```

## 🔧 Features

- **User Authentication** with Firebase Auth
- **Interactive Map** with Google Maps API
- **Tree Management** (Add, Edit, Delete, View)
- **AI Tree Identification** with PlantNet API
- **Species Catalog** with autocomplete
- **Tutorial System** for new users
- **Admin Panel** for management
- **Responsive Design** for mobile/desktop

## 🌐 Deployment

### GitHub Pages
1. Push code to GitHub repository
2. Go to Settings → Pages
3. Select "Deploy from a branch" → main
4. Access at: `https://username.github.io/repo-name`

### Netlify
1. Drag project folder to [netlify.com](https://netlify.com)
2. Get instant deployment URL
3. Connect GitHub for auto-deploy

## 🔑 Environment Variables

The app uses Firebase configuration. Make sure your Firebase project is set up with:
- Authentication (Email/Password)
- Firestore Database
- Storage
- Google Maps API key

## 📱 Browser Support

- Chrome (recommended)
- Firefox
- Safari
- Edge

## 🐛 Troubleshooting

### Common Issues:
1. **"initMap is not a function"** - Check console for module loading errors
2. **Firebase errors** - Verify Firebase configuration
3. **Map not loading** - Check Google Maps API key
4. **CORS errors** - Use local server, not file:// protocol

### Debug Mode:
Open browser console (F12) to see detailed logs and error messages.

## 📄 License

This project is proprietary software for Groundzy. 