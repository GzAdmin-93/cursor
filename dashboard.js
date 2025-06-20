// ============================
// 🌱 DASHBOARD ENTRY POINT (Refactored)
// ============================

// Real initMap function that gets called by the placeholder
window.realInitMap = async function() {
  try {
    console.log('🚀 Real initMap called');
    
    // Import modules dynamically since we're using ES6 modules
    console.log('📦 Importing modules...');
    const { authManager } = await import('./modules/auth.js');
    const { mapManager } = await import('./modules/map.js');
    const { treeManager } = await import('./modules/tree.js');
    const { db, storage } = await import('./config/firebase.js');

    console.log('📦 Modules imported successfully');

    // Initialize authentication and session
    console.log('🔐 Starting authentication...');
    await authManager.init();
    console.log('🔐 Authentication initialized');

    // Initialize map
    console.log('🗺️ Starting map initialization...');
    mapManager.init();
    console.log('🗺️ Map initialized');

    // Load plant options for autocomplete
    console.log('🌱 Loading plant options...');
    await treeManager.loadPlantOptions();
    console.log('🌱 Plant options loaded');

    // Load saved trees onto the map
    console.log('🌳 Loading saved trees...');
    await treeManager.loadSavedTrees();
    console.log('🌳 Trees loaded');

    // Setup UI event listeners
    console.log('🎯 Setting up event listeners...');
    setupEventListeners();
    console.log('🎯 Event listeners setup');

    // Hide loading overlay
    console.log('🎉 Hiding loading overlay...');
    hideLoadingOverlay();

    console.log('✅ Dashboard initialized successfully');
  } catch (error) {
    console.error('❌ Dashboard initialization failed:', error);
    console.error('Error details:', error.stack);
    
    // Hide loading overlay even if there's an error
    hideLoadingOverlay();
    
    // Show error to user
    alert('Failed to initialize dashboard: ' + error.message);
  }
};

// Hide loading overlay
function hideLoadingOverlay() {
  const spinner = document.getElementById("mapLoadingOverlay");
  if (spinner) {
    console.log('🎯 Hiding loading overlay...');
    spinner.style.opacity = "0";
    spinner.style.transition = "opacity 0.5s ease";
    setTimeout(() => {
      spinner.style.display = "none";
      console.log('✅ Loading overlay hidden');
    }, 500);
  } else {
    console.warn('⚠️ Loading overlay element not found');
  }
}

// Setup UI event listeners
function setupEventListeners() {
  // Tree management
  document.getElementById('saveTreeBtn')?.addEventListener('click', () => {
    // We'll need to access treeManager here - we can make it global or use a different approach
    console.log('Save tree clicked');
  });
  
  document.getElementById('addButton')?.addEventListener('click', () => {
    console.log('Add button clicked');
  });
  
  document.getElementById('treeSpecies')?.addEventListener('change', (e) => {
    console.log('Tree species changed:', e.target.value);
  });

  // Sign out
  document.getElementById('signOutBtn')?.addEventListener('click', () => {
    console.log('Sign out clicked');
  });

  // Add more event listeners as needed...
}

  // ============================
// NOTE:
// - This approach uses dynamic imports to handle ES6 modules
// - The global initMap function is required by Google Maps
// - We'll need to refactor the event listeners to properly access the managers
  // ============================
