// ============================
// 🌱 DASHBOARD ENTRY POINT (Refactored)
// ============================

// Import API configurations
import { PLANTNET_CONFIG } from './config/api-keys.js';

// Global managers (will be set after initialization)
window.authManager = null;
window.mapManager = null;
window.treeManager = null;

// Global function to close all submenus
function closeAllSubmenus() {
  const allSubmenus = document.querySelectorAll(".submenu");
  allSubmenus.forEach((sm) => sm.classList.add("hidden"));
  // Update button states if function exists
  if (typeof updateButtonStates === 'function') {
    updateButtonStates();
  }
}

// Global function to close all modals
function closeAllModals() {
  document.querySelectorAll(".modal").forEach((modal) => {
    modal.classList.add("hidden");
  });
}

// Make it globally available
window.closeAllSubmenus = closeAllSubmenus;
window.closeAllModals = closeAllModals;

// Real initMap function that gets called by the placeholder
window.realInitMap = async function() {
  // Add a timeout to prevent hanging
  const timeoutPromise = new Promise((_, reject) => {
    setTimeout(() => reject(new Error('Initialization timeout - taking too long')), 30000); // 30 second timeout
  });

  try {
    console.log('🚀 Real initMap called');
    
    // Race between initialization and timeout
    await Promise.race([
      initializeDashboard(),
      timeoutPromise
    ]);
  } catch (error) {
    console.error('❌ Dashboard initialization failed:', error);
    console.error('Error details:', error.stack);
    
    // Hide loading overlay even if there's an error
    hideLoadingOverlay();
    
    // Show error to user
    if (error.message.includes('timeout')) {
      alert('Dashboard is taking longer than expected to load. Please refresh the page or check your internet connection.');
    } else {
      alert('Failed to initialize dashboard: ' + error.message);
    }
  }
};

// Separate initialization function
async function initializeDashboard() {
  // Import modules dynamically since we're using ES6 modules
  console.log('📦 Importing modules...');
  const { authManager } = await import('./modules/auth.js');
  const { mapManager } = await import('./modules/map.js');
  const { treeManager } = await import('./modules/tree.js');
  const { db, storage } = await import('./config/firebase.js');

  console.log('📦 Modules imported successfully');
  console.log('🔍 treeManager imported:', !!treeManager);
  console.log('🔍 treeManager type:', typeof treeManager);
  console.log('🔍 treeManager constructor:', treeManager?.constructor?.name);

  // Make managers globally available IMMEDIATELY
  window.authManager = authManager;
  window.mapManager = mapManager;
  window.treeManager = treeManager;

  console.log('📦 Modules imported successfully');
  console.log('🔍 window.treeManager assigned:', !!window.treeManager);
  console.log('🔍 window.treeManager type:', typeof window.treeManager);
  console.log('🔍 window.treeManager constructor:', window.treeManager?.constructor?.name);
  console.log('🔍 window.treeManager methods:', window.treeManager ? Object.getOwnPropertyNames(Object.getPrototypeOf(window.treeManager)) : 'treeManager is null/undefined');

  // Initialize authentication and map in parallel
  console.log('🔐 Starting authentication and map initialization...');
  const [authResult] = await Promise.all([
    authManager.init(),
    mapManager.init()
  ]);
  console.log('🔐 Authentication and map initialized');

  // Setup UI event listeners immediately (don't wait for data loading)
  console.log('🎯 Setting up event listeners...');
  setupEventListeners();
  console.log('🎯 Event listeners setup');

  // Hide loading overlay early to show the interface
  console.log('🎉 Hiding loading overlay...');
  hideLoadingOverlay();

  // Load data in the background (non-blocking)
  console.log('🌱 Loading data in background...');
  Promise.all([
    treeManager.loadPlantOptions(),
    treeManager.loadSavedTrees()
  ]).then(() => {
    console.log('✅ Background data loading complete');
    // Sync allTreeMarkers with mapManager markers
    if (window.mapManager) {
      window.allTreeMarkers = window.mapManager.getMarkers();
      console.log('✅ Synced allTreeMarkers:', window.allTreeMarkers.length);
    }
  }).catch(error => {
    console.error('❌ Background data loading failed:', error);
  });

// 🌳 Add Tree Direct Button
const addTreeDirectBtn = document.getElementById('addTreeDirectBtn');
if (addTreeDirectBtn) {
  addTreeDirectBtn.addEventListener("click", (e) => {
    e.preventDefault();
    console.log('🌳 Direct Add Tree button clicked');
    openTreeModal(); // This function already exists
  });
}


  // Check for notifications (non-blocking)
  checkForNotifications().catch(error => {
    console.error('❌ Notification check failed:', error);
  });

  console.log('✅ Dashboard initialized successfully');

  // Make functions globally available
  window.closeAllSubmenus = closeAllSubmenus;
  window.closeAllModals = closeAllModals;
  window.fetchWeather = fetchWeather;
  window.minimizeViewTreeModal = minimizeViewTreeModal;
  window.restoreViewTreeModal = restoreViewTreeModal;
  window.addPhotoBlock = addPhotoBlock;
  window.previewPhoto = previewPhoto;
  window.removePhotoBlock = removePhotoBlock;
  window.updateAddMorePhotosButton = updateAddMorePhotosButton;
  window.displayPlantnetResults = displayPlantnetResults;
  window.closeFullscreenPhoto = closeFullscreenPhoto;
  window.testTreeModal = testTreeModal;
  window.testModalDirectly = testModalDirectly;

  // Initialize weather with default location (Chicago area)
  fetchWeather(41.723158305053474, -88.06867936825057);

  // Bottom menu navigation
  const menuButtons = document.querySelectorAll(".bottom-menu a");
  const allSubmenus = document.querySelectorAll(".submenu");
  const homeButton = document.querySelector(".bottom-menu a");

  // Make variables globally available for tutorial
  window.menuButtons = menuButtons;
  window.allSubmenus = allSubmenus;
  window.allTreeMarkers = []; // Initialize empty array for tutorial

  window.menuButtons.forEach((btn) => {
    const submenuId = btn.getAttribute("data-submenu");

    btn.addEventListener("click", (e) => {
      e.preventDefault();
      
      // Close all modals
      document.querySelectorAll(".modal").forEach(modal => modal.classList.add("hidden"));

      // Deactivate all buttons
      window.menuButtons.forEach((b) => b.classList.remove("active"));

      // Hide all submenus
      window.allSubmenus.forEach((sm) => sm.classList.add("hidden"));

      // Add highlight to clicked button
      btn.classList.add("active");

      // Handle submenu if exists
      if (submenuId) {
        const targetSubmenu = document.getElementById(submenuId);
        if (targetSubmenu) {
          targetSubmenu.classList.remove("hidden");
        }
      }

      // Special behavior: If clicked Home, recenters the map
      if (btn === homeButton && window.mapManager) {
        const map = window.mapManager.getMap();
        map.setZoom(11);
        map.setCenter({ lat: 41.723158305053474, lng: -88.06867936825057 });
      }

      // Special behavior: If Identify, open the modal
      if (btn.id === "identifyTreeBtn") {
        closeAllModals();
        document.getElementById("treeIdentifierModal").classList.remove("hidden");
        
        // Clear existing photo inputs and add initial photo block
        const photoContainer = document.getElementById("photoInputContainer");
        if (photoContainer) {
          photoContainer.innerHTML = "";
          addPhotoBlock(); // Add initial photo block
          updateAddMorePhotosButton(); // Update button state
        }
      }
    });
  });

  // Setup weather map listener when dashboard initializes
  setupWeatherMapListener();

  // Center pin auto-hide functionality
  setupCenterPinAutoHide();

  // Make tutorial functions globally available
  window.showTutorialWelcomeModal = showTutorialWelcomeModal;
}

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
  // GPS Button
  const gpsBtn = document.getElementById("gpsBtn");
  if (gpsBtn) {
    gpsBtn.addEventListener("click", () => {
      console.log('📍 GPS button clicked');
      if (!navigator.geolocation) {
        alert("Geolocation is not supported by your browser.");
        return;
      }

      gpsBtn.classList.add("active");

      // Remove GPS highlight after 25s
      setTimeout(() => {
        gpsBtn.classList.remove("active");
      }, 25000);

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const userLocation = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };

          const map = window.mapManager.getMap();
          map.setCenter(userLocation);
          map.setZoom(20);

          // Groundzy green pulse animation
          const groundzyCircle = new google.maps.Circle({
            strokeColor: "#b3e878",
            strokeOpacity: 0.8,
            strokeWeight: 2,
            fillColor: "#b3e878",
            fillOpacity: 0.4,
            map: map,
            center: userLocation,
            radius: 2,
          });

          let pulseUp = true;
          const pulseInterval = setInterval(() => {
            const radius = groundzyCircle.getRadius();
            groundzyCircle.setRadius(pulseUp ? radius + 0.5 : radius - 0.5);
            pulseUp = !pulseUp;
          }, 500);

          setTimeout(() => {
            groundzyCircle.setMap(null);
            clearInterval(pulseInterval);
          }, 25000);
        },
        (error) => {
          alert("Unable to retrieve your location.");
          gpsBtn.classList.remove("active");
        }
      );
    });
  }

  // Search functionality
  const searchBtn = document.getElementById("searchBtn");
  const closeSearchBtn = document.getElementById("closeSearchBtn");
  const searchBar = document.getElementById("searchBar");
  const topIcons = document.getElementById("topIcons");

  searchBtn?.addEventListener("click", () => {
    document.getElementById("searchInput").value = "";
    searchBar.classList.remove("hidden");
    topIcons.classList.add("hidden");
  });

  closeSearchBtn?.addEventListener("click", () => {
    searchBar.classList.add("hidden");
    topIcons.classList.remove("hidden");
    document.getElementById("searchInput").value = "";
  });

  // Tree management
  document.getElementById('saveTreeBtn')?.addEventListener('click', () => {
    console.log('Save tree clicked');
    if (window.treeManager) {
      window.treeManager.saveTree();
    }
  });

  // Copy Last Tree Button
  document.getElementById('copyLastTreeBtn')?.addEventListener('click', () => {
    console.log('Copy last tree clicked');
    const info = window.lastSavedTreeInfo;
    if (info && info.type && info.commonName) {
      const typeInput = document.getElementById("treeType");
      const speciesInput = document.getElementById("treeSpecies");
      if (typeInput && speciesInput) {
        typeInput.value = info.type;
        speciesInput.value = info.commonName;
        console.log('✅ Copied last tree info:', info);
        
        // Optionally trigger autofill
        if (window.treeManager) {
          window.treeManager.autofillSpeciesDetails(info.commonName);
        }
      }
    } else {
      alert("No recent tree saved yet.");
    }
  });
  
  const addButton = document.getElementById('addButton');
  console.log('🔍 Add button found:', !!addButton);
  
  if (addButton) {
    console.log('🔍 Add button element:', addButton);
    console.log('🔍 Add button HTML:', addButton.outerHTML);
    
    // Add the data-submenu attribute back
    addButton.setAttribute('data-submenu', 'submenu-add');
    
    // Simple click handler - show submenu
    addButton.addEventListener("click", function(e) {
      e.preventDefault();
      console.log('🎯 Add button clicked - showing submenu');
      console.log('🔍 Event target:', e.target);
      console.log('🔍 Event currentTarget:', e.currentTarget);
      showAddSubmenu();
    });
    
    console.log('✅ Add button event listener attached');
  } else {
    console.error('❌ Add button not found!');
  }
  
  document.getElementById('treeSpecies')?.addEventListener('change', (e) => {
    console.log('Tree species changed:', e.target.value);
    if (window.treeManager) {
      window.treeManager.autofillSpeciesDetails(e.target.value);
    }
  });

  // Sign out
  document.getElementById('signOutBtn')?.addEventListener('click', () => {
    console.log('Sign out clicked');
    if (window.authManager) {
      window.authManager.signOut();
    }
  });

  // Notifications button
  document.getElementById('notificationsBtn')?.addEventListener('click', async () => {
    console.log('Notifications clicked');
    const modal = document.getElementById("notificationsModal");
    if (modal) {
      modal.classList.remove("hidden");
      await loadNotifications();
      
      // Clear notification badge when opened
      const badge = document.querySelector('.notification-badge');
      if (badge) {
        badge.remove();
      }
    }
  });

  // Screenshot toggle button
  document.getElementById('screenshotToggleBtn')?.addEventListener('click', (e) => {
    e.preventDefault();
    console.log('Screenshot toggle clicked');
    
    const body = document.body;
    const isScreenshotMode = body.classList.contains('screenshot-mode');
    
    if (isScreenshotMode) {
      // Exit screenshot mode with fade animation
      body.classList.remove('screenshot-mode');
      showScreenshotIndicator('Screenshot mode disabled', false);
      console.log('📸 Exited screenshot mode');
    } else {
      // Enter screenshot mode with fade animation
      body.classList.add('screenshot-mode');
      showScreenshotIndicator('Screenshot mode enabled', true);
      console.log('📸 Entered screenshot mode');
    }
  });

  // Click anywhere to exit screenshot mode
  document.addEventListener('click', (e) => {
    const body = document.body;
    const isScreenshotMode = body.classList.contains('screenshot-mode');
    
    // Don't exit if clicking on the screenshot toggle button itself
    if (isScreenshotMode && !e.target.closest('#screenshotToggleBtn')) {
      body.classList.remove('screenshot-mode');
      showScreenshotIndicator('Screenshot mode disabled', false);
      console.log('📸 Exited screenshot mode (clicked outside)');
    }
  });

  // Function to show screenshot mode indicator
  function showScreenshotIndicator(message, isEntering) {
    // Remove existing indicator
    const existingIndicator = document.querySelector('.screenshot-indicator');
    if (existingIndicator) {
      existingIndicator.remove();
    }

    // Create new indicator
    const indicator = document.createElement('div');
    indicator.className = 'screenshot-indicator';
    indicator.textContent = message;
    document.body.appendChild(indicator);

    // Show indicator with fade in
    setTimeout(() => {
      indicator.classList.add('show');
    }, 10);

    // Hide indicator after delay
    setTimeout(() => {
      indicator.classList.remove('show');
      setTimeout(() => {
        if (indicator.parentNode) {
          indicator.remove();
        }
      }, 300); // Wait for fade out animation
    }, 1500);
  }

  // Groundzy logo refresh functionality
  const logoPills = document.querySelectorAll('.logo-pill');
  logoPills.forEach(logo => {
    logo.addEventListener('click', () => {
      console.log('🔄 Groundzy logo clicked - refreshing page');
      window.location.reload();
    });
  });

  // Feedback button functionality
  document.getElementById('feedback-button')?.addEventListener('click', () => {
    console.log('Feedback button clicked');
    const modal = document.getElementById("feedback-modal");
    if (modal) {
      modal.classList.remove("hidden");
    }
    // Close submenu after opening modal
    closeAllSubmenus();
  });

  // Tutorial button functionality
  document.getElementById('tutorial-button')?.addEventListener('click', () => {
    console.log('Tutorial button clicked');
    // Start the tutorial
    if (typeof startGroundzyTutorial === 'function') {
      startGroundzyTutorial();
    } else {
      console.error('startGroundzyTutorial function not found');
      alert('Tutorial function not available. Please refresh the page.');
    }
    // Close submenu after opening tutorial
    closeAllSubmenus();
  });

  // Tree identifier submit button functionality
  document.getElementById('submitIdentifierBtn')?.addEventListener('click', async () => {
    const submitBtn = document.getElementById('submitIdentifierBtn');
    submitBtn.disabled = true;
    submitBtn.innerHTML = `<img src="https://gzadmin-93.github.io/tree-icons/icon-117.svg" style="width: 20px; height: 20px; animation: spin 2s linear infinite; vertical-align: middle;" /> Identifying...`;

    const photoBlocks = document.querySelectorAll('.photo-input');

    if (photoBlocks.length === 0) {
      alert("Please add at least one photo.");
      submitBtn.disabled = false;
      submitBtn.innerHTML = "🌳 Identify Tree";
      return;
    }

    const formData = new FormData();

    for (const block of photoBlocks) {
      const fileInput = block.querySelector('input[type="file"]');
      const organSelect = block.querySelector('.organ-type-select');

      const file = fileInput?.files[0];
      let organ = organSelect?.value;

      if (!file || !organ) continue;

      formData.append("images", file);
      formData.append("organs", organ);
    }

    console.log("📤 Submitting to Pl@ntNet:");
    photoBlocks.forEach((block, index) => {
      const fileInput = block.querySelector('input[type="file"]');
      const organSelect = block.querySelector('.organ-type-select');

      const file = fileInput?.files[0];
      let organ = organSelect?.value;

      console.log(
        `🖼️ Image ${index + 1}:`,
        file?.name || "none",
        "| Organ:",
        organ
      );
    });

    const apiKey = PLANTNET_CONFIG.API_KEY;
    const apiUrl = `${PLANTNET_CONFIG.BASE_URL}/identify/${PLANTNET_CONFIG.PROJECT}?api-key=${apiKey}`;

    try {
      const response = await fetch(apiUrl, {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      console.log("🧠 Pl@ntNet Query:", data.query);
      console.log("📊 Received", data.query.images.length, "images");
      console.log("📍 Organs:", data.query.organs);

      console.log("✅ Pl@ntNet Results:", data);

      displayPlantnetResults(data.results);

      submitBtn.disabled = false;
      submitBtn.innerHTML = "🌳 Identify Tree";
    } catch (error) {
      console.error("❌ Identification error:", error);
      alert("Something went wrong identifying the tree.");

      submitBtn.disabled = false;
      submitBtn.innerHTML = "🌳 Identify Tree";
    }
  });

  // Function to update button states based on open modals
  function updateButtonStates() {
    const modals = document.querySelectorAll(".modal");
    const submenus = document.querySelectorAll(".submenu");
    
    // Reset all buttons
    window.menuButtons.forEach((btn) => btn.classList.remove("active"));
    
    // Check for open modals and highlight corresponding buttons
    if (!document.getElementById("treeIdentifierModal").classList.contains("hidden")) {
      document.getElementById("identifyTreeBtn")?.classList.add("active");
    }
    
    if (!document.getElementById("treeModal").classList.contains("hidden")) {
      document.getElementById("addButton")?.classList.add("active");
    }
    
    // Check for open submenus
    submenus.forEach((submenu) => {
      if (!submenu.classList.contains("hidden")) {
        const submenuId = submenu.id;
        if (submenuId === "submenu-account") {
          document.querySelector('[data-submenu="submenu-account"]')?.classList.add("active");
        } else if (submenuId === "submenu-add") {
          document.getElementById("addButton")?.classList.add("active");
        }
      }
    });
  }

  // Monitor modal and submenu visibility changes
  const observer = new MutationObserver(updateButtonStates);
  const modals = document.querySelectorAll(".modal, .submenu");
  modals.forEach((modal) => {
    observer.observe(modal, { attributes: true, attributeFilter: ['class'] });
  });

  // Hide submenus when clicking outside
  document.addEventListener("click", (e) => {
    const clickedInside = [...window.allSubmenus].some((sub) =>
      sub.contains(e.target)
    );
    const clickedOnMenuButton = [...window.menuButtons].some((btn) =>
      btn.contains(e.target)
    );

    if (!clickedInside && !clickedOnMenuButton) {
      window.allSubmenus.forEach((sm) => sm.classList.add("hidden"));
      updateButtonStates();
    }
  });

  console.log('🎯 Event listeners setup complete');
}

// Display PlantNet identification results
function displayPlantnetResults(results = []) {
  const preview = document.getElementById("identifierPreview");

  if (!preview) {
    console.warn("❌ identifierPreview element not found.");
    return;
  }

  preview.innerHTML = "<p><strong>Identification Results:</strong></p>";

  if (results.length === 0) {
    preview.innerHTML += "<p>No results found. Try another image or organ.</p>";
  } else {
    const listHTML = results
      .slice(0, 3)
      .map((r) => {
        const score = Math.round(r.score * 100);
        const name = r.species.commonNames?.[0] || "No Common Name";
        const sciName = r.species.scientificNameWithoutAuthor || "Unknown";
        return `
          <div style="margin-top: 12px; padding: 10px; border: 1px solid #ccc; border-radius: 10px;">
            <strong>${name}</strong> <em>(${sciName})</em><br />
            Confidence: ${score}%<br />
            <button onclick="useIdentifiedSpecies('${name.replace(/'/g, "\\'")}')" style="margin-top: 8px;" class="groundzy-btn">🌳 Use This Species</button>
          </div>
        `;
      })
      .join("");
    preview.innerHTML += listHTML;
  }

  preview.style.display = "block";
  
  // Use the robust scrolling logic from the tutorial
  setTimeout(() => {
    preview.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, 300); // A small delay to ensure the element is ready
}

// ============================
// NOTE:
// - This approach uses dynamic imports to handle ES6 modules
// - The global initMap function is required by Google Maps
// - Managers are now globally available for event listeners
// ============================

// ============================
// 🗂️ MINIMIZE VIEW TREE MODAL
// ============================

function minimizeViewTreeModal() {
  const modal = document.getElementById("viewTreeModal");
  modal.classList.add("hidden");

  const speciesName =
    document.getElementById("viewTreeSpeciesNameText")?.textContent ||
    "Unknown";
  const tin = document.getElementById("viewTreeTINText")?.textContent || "--";
  const iconSrc = document.getElementById("viewTreeProfileImage")?.src || "";

  const match = window.allTreeMarkers.find((m) => m.data.tin === tin);
  if (!match) {
    alert("⚠️ Could not locate this tree's full data.");
    return;
  }

  const treeId = match.data.id;
  const minimizedBar = document.getElementById("minimizedModalBar");

  // Check if already exists
  const existing = minimizedBar.querySelector(`[data-tree-id="${treeId}"]`);
  if (existing) {
    // If it exists, move it to the front to show it's active
    minimizedBar.appendChild(existing);
    return;
  }

  minimizedBar.classList.remove("hidden");

  const thumb = document.createElement("div");
  thumb.className = "minimized-thumbnail";
  thumb.dataset.treeId = treeId;
  thumb.style.display = "flex";

  thumb.innerHTML = `
    <img src="${iconSrc}" alt="Tree Icon" />
    <div>
      <div class="mini-name">${speciesName}</div>
      <div class="mini-tin">${tin}</div>
    </div>
    <button onclick="restoreViewTreeModal(this)">🗖</button>
  `;

  minimizedBar.appendChild(thumb);
}

function restoreViewTreeModal(btn) {
  const thumb = btn.closest(".minimized-thumbnail");
  const treeId = thumb?.dataset.treeId;

  if (!treeId) {
    alert("⚠️ Could not find this tree.");
    return;
  }

  const match = window.allTreeMarkers.find((m) => m.data.id === treeId);
  if (match) {
    // Remove the thumbnail completely instead of just hiding it
    thumb.remove();
    // Show the modal
    window.treeManager?.showViewTreeModal(match.data);
  } else {
    alert("⚠️ Tree data not found.");
  }

  // Hide the bar if no thumbnails left
  const bar = document.getElementById("minimizedModalBar");
  const remainingThumbs = bar.querySelectorAll(".minimized-thumbnail");
  if (remainingThumbs.length === 0) {
    bar.classList.add("hidden");
  }
}

// Toggle collapsible sections
function toggleCollapse(button) {
  const content = button.nextElementSibling;
  if (content) {
    const isCollapsed = content.style.display === "none";
    content.style.display = isCollapsed ? "block" : "none";
    button.classList.toggle("collapsed", !isCollapsed);
  }
}

// Close modal function
function closeModal(button) {
  const modal = button.closest('.modal');
  if (modal) {
    modal.classList.add('hidden');
  }
}

// Close request access modal
function closeRequestAccessModal(event) {
  const modal = document.getElementById("requestAccessModal");
  if (modal) {
    modal.classList.add("hidden");
  }
}

// Handle request access click
function handleRequestAccessClick() {
  const tin = document.getElementById("nonUserGZCode")?.textContent;
  if (tin) {
    // You can implement the actual request access logic here
    alert(`Request access for tree ${tin} - This feature will be implemented soon.`);
  }
  closeRequestAccessModal();
}

// Show add submenu
function showAddSubmenu() {
  console.log('🎯 showAddSubmenu called');
  
  // Hide all submenus first
  const allSubmenus = document.querySelectorAll(".submenu");
  console.log('🔍 Found submenus:', allSubmenus.length);
  allSubmenus.forEach((sm) => {
    console.log('🔍 Hiding submenu:', sm.id);
    sm.classList.add("hidden");
  });
  
  // Show the add submenu
  const addSubmenu = document.getElementById("submenu-add");
  console.log('🔍 Add submenu found:', !!addSubmenu);
  if (addSubmenu) {
    addSubmenu.classList.remove("hidden");
    console.log('✅ Add submenu shown');
    console.log('🔍 Add submenu classes:', addSubmenu.className);
  } else {
    console.error('❌ Add submenu not found');
  }
}

// Open tree modal
function openTreeModal() {
  console.log('🌳 openTreeModal called');
  console.log('🔍 treeManager available:', !!window.treeManager);
  console.log('🔍 treeManager object:', window.treeManager);
  console.log('🔍 treeManager type:', typeof window.treeManager);
  console.log('🔍 treeManager constructor:', window.treeManager?.constructor?.name);
  console.log('🔍 treeManager methods:', Object.getOwnPropertyNames(Object.getPrototypeOf(window.treeManager || {})));
  
  if (window.treeManager && typeof window.treeManager.openTreeModal === 'function') {
    console.log('✅ Calling treeManager.openTreeModal()');
    try {
      window.treeManager.openTreeModal();
      console.log('✅ treeManager.openTreeModal() called successfully');
      // Close submenu after opening modal
      closeAllSubmenus();
    } catch (error) {
      console.error('❌ Error calling treeManager.openTreeModal():', error);
      console.error('❌ Error stack:', error.stack);
      alert('Error opening modal: ' + error.message);
    }
  } else {
    console.error('❌ treeManager not available or openTreeModal not a function');
    console.log('🔍 Available window objects:', Object.keys(window).filter(key => key.includes('Manager')));
    console.log('🔍 treeManager methods:', window.treeManager ? Object.getOwnPropertyNames(Object.getPrototypeOf(window.treeManager)) : 'treeManager is null/undefined');
    
    // Fallback: try to open modal directly
    const modal = document.getElementById("treeModal");
    if (modal) {
      modal.classList.remove("hidden");
      console.log('✅ Modal opened directly');
      // Close submenu after opening modal
      closeAllSubmenus();
    } else {
      console.error('❌ Modal element not found');
      alert('Modal not found');
    }
  }
}

// Make openTreeModal globally available immediately
window.openTreeModal = openTreeModal;

// Sign out function
function signOut() {
  if (window.authManager) {
    window.authManager.signOut();
  }
}

// Make signOut globally available immediately
window.signOut = signOut;

// Remove tree photo
function removeTreePhoto() {
  const photoInput = document.getElementById("treePhotoInput");
  const photoPreview = document.getElementById("treePhotoPreview");
  const removeBtn = document.getElementById("removePhotoBtn");
  
  if (photoInput) photoInput.value = "";
  if (photoPreview) photoPreview.style.display = "none";
  if (removeBtn) removeBtn.style.display = "none";
}

// Make removeTreePhoto globally available immediately
window.removeTreePhoto = removeTreePhoto;

// Start location picker
function startLocationPicker() {
  if (window.mapManager) {
    // This would typically enable map click to set location
    alert("Location picker mode activated. Click on the map to set the tree location.");
  }
}

// Add photo block for tree identifier
function addPhotoBlock() {
  const container = document.getElementById("photoInputContainer");
  if (!container) return;

  const existingBlocks = container.querySelectorAll('.photo-input');
  if (existingBlocks.length >= 5) {
    alert('Maximum 5 photos allowed for tree identification.');
    return;
  }

  const photoBlock = document.createElement("div");
  photoBlock.className = "photo-input";
  const blockId = `block-${Math.random().toString(36).substring(2, 11)}`;
  photoBlock.style.cssText = "margin: 10px 0; padding: 10px; border: 2px dashed #ccc; border-radius: 8px;";
  
  photoBlock.innerHTML = `
    <div style="display: flex; gap: 10px; align-items: flex-start;">
      <div style="flex-shrink: 0;">
        <img class="photo-preview" style="width: 100px; height: 100px; object-fit: cover; display: none; border-radius: 8px; border: 1px solid #ddd; background-color: #f0f0f0;">
      </div>
      <div style="flex: 1; display: flex; flex-direction: column; gap: 8px;">
        <div>
          <label style="display: block; margin-bottom: 4px; font-weight: bold; color: #1a3e3c; font-size: 0.9em;">Photo Type:</label>
          <select class="organ-type-select" style="width: 100%; padding: 6px; border: 1px solid #ccc; border-radius: 4px;">
            <option value="">Select organ type...</option>
            <option value="leaf">🍃 Leaf</option>
            <option value="bark">🌳 Bark</option>
            <option value="flower">🌸 Flower</option>
            <option value="fruit">🍎 Fruit</option>
            <option value="auto">🌿 Whole Plant</option>
            <option value="other">📸 Other</option>
          </select>
        </div>
        <div>
          <label for="file-input-${blockId}" style="display: block; text-align: center; padding: 6px 10px; border: 1px solid #ccc; border-radius: 4px; cursor: pointer; background-color: #f9f9f9;">
            Choose File
          </label>
          <input id="file-input-${blockId}" type="file" accept="image/*" onchange="previewPhoto(this)" style="display: none;">
          <span class="file-name-display" style="font-size: 0.8em; color: #555; margin-top: 4px; display: block; text-align: center; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;"></span>
        </div>
        <button onclick="removePhotoBlock(this)" style="background: #ff6b6b; color: white; border: none; padding: 6px 10px; border-radius: 4px; cursor: pointer; width: 100%;">Remove</button>
      </div>
    </div>
  `;
  
  container.appendChild(photoBlock);
  updateAddMorePhotosButton();
}

// Update the "Add More Photos" button state
function updateAddMorePhotosButton() {
  const container = document.getElementById("photoInputContainer");
  const addMoreBtn = document.querySelector('button[onclick="addPhotoBlock()"]');
  
  if (container && addMoreBtn) {
    const existingBlocks = container.querySelectorAll('.photo-input');
    const hasReachedLimit = existingBlocks.length >= 5;
    
    if (hasReachedLimit) {
      addMoreBtn.disabled = true;
      addMoreBtn.style.opacity = "0.5";
      addMoreBtn.style.cursor = "not-allowed";
      addMoreBtn.textContent = "Max Photos (5)";
    } else {
      addMoreBtn.disabled = false;
      addMoreBtn.style.opacity = "1";
      addMoreBtn.style.cursor = "pointer";
      addMoreBtn.textContent = "Add More Photos";
    }
  }
}

// Preview photo for tree identifier
function previewPhoto(input) {
  const file = input.files[0];
  const photoBlock = input.closest('.photo-input');

  if (!photoBlock) {
    console.error("Could not find parent photo block.");
    return;
  }

  const preview = photoBlock.querySelector('.photo-preview');
  const fileNameDisplay = photoBlock.querySelector('.file-name-display');

  if (file) {
    const reader = new FileReader();
    reader.onload = function(e) {
      preview.src = e.target.result;
      preview.style.display = 'block';
    };
    reader.readAsDataURL(file);
    fileNameDisplay.textContent = file.name;
  } else {
    // This part runs if the user cancels file selection
    preview.src = "";
    preview.style.display = 'none';
    fileNameDisplay.textContent = "";
  }
}

// Remove photo block
function removePhotoBlock(button) {
  button.parentElement.remove();
  
  // Update the "Add More Photos" button state
  updateAddMorePhotosButton();
}

// Close fullscreen photo
function closeFullscreenPhoto() {
  const wrapper = document.getElementById("fullscreenPhotoWrapper");
  if (wrapper) {
    wrapper.style.display = "none";
  }
}

// Load notifications data
async function loadNotifications() {
  const modal = document.getElementById("notificationsModal");
  if (!modal) return;

  try {
    // Import Firebase modules
    const { db } = await import('./config/firebase.js');

    // Fetch system updates from Firestore
    const settingsDoc = await db.collection("settings").doc("global").get();
    const settingsData = settingsDoc.data() || {};
    
    const changeLog = settingsData.changelog || ""; // Note: it's "changelog" not "changeLog"
    const updatedAt = settingsData.updatedAt;
    const version = settingsData.version || "Unknown";

    // System Updates
    const systemUpdatesSection = modal.querySelector('h4');
    if (systemUpdatesSection && systemUpdatesSection.textContent.includes('📢 System Updates')) {
      const systemUpdatesP = systemUpdatesSection.nextElementSibling;
      if (systemUpdatesP && systemUpdatesP.tagName === 'P') {
        let changeLogHtml = '';
        
        if (changeLog && changeLog.trim() !== '') {
          // Split the changelog string by lines and format each as a bullet point
          const changeLogLines = changeLog.split('\n').filter(line => line.trim() !== '');
          changeLogHtml = changeLogLines.map(line => `• ${line.trim()}`).join('<br>');
        } else {
          changeLogHtml = '• No recent updates';
        }

        // Handle updatedAt as string timestamp
        let updateDate = 'Unknown';
        if (updatedAt) {
          try {
            const date = new Date(updatedAt);
            updateDate = date.toLocaleDateString();
          } catch (e) {
            console.error('Error parsing updatedAt:', e);
            updateDate = 'Unknown';
          }
        }

        systemUpdatesP.innerHTML = `
          <strong>Groundzy v${version}</strong> - Latest updates<br>
          ${changeLogHtml}<br>
          <small>Updated: ${updateDate}</small>
        `;
      }
    }

    // Tree Sharing Requests
    const sharingSection = modal.querySelector('h4:nth-of-type(2)');
    if (sharingSection && sharingSection.textContent.includes('🌳 Tree Sharing Requests')) {
      const sharingP = sharingSection.nextElementSibling;
      if (sharingP && sharingP.tagName === 'P') {
        sharingP.innerHTML = `
          <strong>No new requests</strong><br>
          <small>You have 0 pending tree sharing requests</small>
        `;
      }
    }

    // Warnings
    const warningsSection = modal.querySelector('h4:nth-of-type(3)');
    if (warningsSection && warningsSection.textContent.includes('⚠️ Warnings')) {
      const warningsP = warningsSection.nextElementSibling;
      if (warningsP && warningsP.tagName === 'P') {
        warningsP.innerHTML = `
          <strong>No active warnings</strong><br>
          <small>All systems are running smoothly</small>
        `;
      }
    }

    // Messages
    const messagesSection = modal.querySelector('h4:nth-of-type(4)');
    if (messagesSection && messagesSection.textContent.includes('💬 Messages')) {
      const messagesP = messagesSection.nextElementSibling;
      if (messagesP && messagesP.tagName === 'P') {
        messagesP.innerHTML = `
          <strong>No new messages</strong><br>
          <small>Check back later for updates</small>
        `;
      }
    }

    // Update notification badge based on whether there are actual updates
    const hasUpdates = changeLog && changeLog.trim() !== '';
    updateNotificationBadge(hasUpdates);

  } catch (error) {
    console.error('Failed to load notifications:', error);
    
    // Fallback to default content if Firestore fails
    const systemUpdatesSection = modal.querySelector('h4');
    if (systemUpdatesSection && systemUpdatesSection.textContent.includes('📢 System Updates')) {
      const systemUpdatesP = systemUpdatesSection.nextElementSibling;
      if (systemUpdatesP && systemUpdatesP.tagName === 'P') {
        systemUpdatesP.innerHTML = `
          <strong>Unable to load updates</strong><br>
          <small>Please check your connection and try again</small>
        `;
      }
    }
  }
}

// Update notification badge
function updateNotificationBadge(hasUpdates) {
  const notificationsBtn = document.getElementById('notificationsBtn');
  if (!notificationsBtn) return;

  // Remove existing badge
  const existingBadge = notificationsBtn.querySelector('.notification-badge');
  if (existingBadge) {
    existingBadge.remove();
  }

  // For demo purposes, show a badge with "1" (you can make this dynamic)
  const hasNotifications = hasUpdates; // This could be determined by checking actual notifications
  
  if (hasNotifications) {
    const badge = document.createElement('div');
    badge.className = 'notification-badge';
    badge.textContent = '1';
    badge.style.cssText = `
      position: absolute;
      top: -5px;
      right: -5px;
      background: #ff6b6b;
      color: white;
      border-radius: 50%;
      width: 18px;
      height: 18px;
      font-size: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: bold;
    `;
    
    notificationsBtn.style.position = 'relative';
    notificationsBtn.appendChild(badge);
  }
}

// Check for notifications and update badge
async function checkForNotifications() {
  try {
    // Import Firebase modules
    const { db } = await import('./config/firebase.js');

    // Fetch system updates from Firestore
    const settingsDoc = await db.collection("settings").doc("global").get();
    const settingsData = settingsDoc.data() || {};
    
    const changeLog = settingsData.changelog || ""; // Note: it's "changelog" not "changeLog"
    const hasUpdates = changeLog && changeLog.trim() !== '';
    
    updateNotificationBadge(hasUpdates);
  } catch (error) {
    console.error('Failed to check for notifications:', error);
    // Don't show badge if we can't check for updates
    updateNotificationBadge(false);
  }
}

// ============================
// MAKE FUNCTIONS GLOBALLY AVAILABLE
// ============================

// Make all utility functions available globally for HTML onclick handlers
window.closeModal = closeModal;
window.closeRequestAccessModal = closeRequestAccessModal;
window.handleRequestAccessClick = handleRequestAccessClick;
window.openTreeModal = openTreeModal;
window.signOut = signOut;
window.removeTreePhoto = removeTreePhoto;
window.startLocationPicker = startLocationPicker;
window.addPhotoBlock = addPhotoBlock;
window.previewPhoto = previewPhoto;
window.removePhotoBlock = removePhotoBlock;
window.closeFullscreenPhoto = closeFullscreenPhoto;
window.minimizeViewTreeModal = minimizeViewTreeModal;
window.restoreViewTreeModal = restoreViewTreeModal;
window.toggleCollapse = toggleCollapse;
window.loadNotifications = loadNotifications;
window.updateNotificationBadge = updateNotificationBadge;
window.checkForNotifications = checkForNotifications;
window.useIdentifiedSpecies = useIdentifiedSpecies;
window.openRequestAccessModal = (tin) => {
  if (window.treeManager) {
    window.treeManager.openRequestAccessModal(tin);
  }
};

// Weather functionality
// ============================
// ️ WEATHER INFO
// ============================

async function fetchWeather(lat, lon) {
  const apiKey = "79d8dda0ff989a7e8664d9683ed82788";
  const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=imperial&appid=${apiKey}`;

  try {
    const res = await fetch(url);
    const data = await res.json();

    const temp = Math.round(data.main.temp);
    const windSpeed = Math.round(data.wind.speed);
    const windDeg = data.wind.deg;
    const city = data.name || "";
    const country = data.sys?.country || "";

    // 🌤️ Add weather emoji based on condition
    const mainCondition = data.weather?.[0]?.main || "";
    let emoji = "🌤️";

    if (mainCondition === "Clear") emoji = "☀️";
    else if (mainCondition === "Rain") emoji = "🌧️";
    else if (mainCondition === "Thunderstorm") emoji = "⛈️";
    else if (mainCondition === "Drizzle") emoji = "🌦️";
    else if (mainCondition === "Snow") emoji = "❄️";
    else if (mainCondition === "Clouds") emoji = "☁️";
    else if (mainCondition === "Fog" || mainCondition === "Mist") emoji = "🌫️";

    document.getElementById("weatherTemp").textContent = `${emoji} ${temp}°`;

    document.getElementById("weatherWind").textContent = `${windSpeed} mph`;
    document.getElementById(
      "weatherIcon"
    ).style.transform = `rotate(${windDeg}deg)`;
    document.getElementById(
      "weatherLocation"
    ).textContent = `${city}, ${country}`;

    document.getElementById("weatherBox").classList.remove("hidden");
  } catch (err) {
    console.error("❌ Weather fetch failed:", err);
  }
}

// Function to update weather based on map center
function updateWeatherFromMapCenter() {
  if (window.mapManager) {
    const map = window.mapManager.getMap();
    const center = map.getCenter();
    fetchWeather(center.lat(), center.lng());
  }
}

// Update weather immediately when map center changes (no debouncing)
function immediateWeatherUpdate() {
  updateWeatherFromMapCenter();
}

// Add map center change listener
function setupWeatherMapListener() {
  if (window.mapManager) {
    const map = window.mapManager.getMap();
    map.addListener('center_changed', immediateWeatherUpdate);
    console.log('✅ Weather map listener added - updates while moving');
  } else {
    // Retry after a short delay if mapManager isn't ready
    setTimeout(setupWeatherMapListener, 500);
  }
}

// Setup weather map listener when dashboard initializes
setupWeatherMapListener();

// Center pin auto-hide functionality
function setupCenterPinAutoHide() {
  const centerPin = document.getElementById("centerPin");
  if (!centerPin) {
    console.warn("Center pin element not found");
    return;
  }

  let hideTimeout;
  const HIDE_DELAY = 3000; // 3 seconds

  // Function to show the center pin
  function showCenterPin() {
    centerPin.style.opacity = "1";
    centerPin.style.visibility = "visible";
  }

  // Function to hide the center pin
  function hideCenterPin() {
    centerPin.style.opacity = "0";
    centerPin.style.visibility = "hidden";
  }

  // Function to reset the hide timer
  function resetHideTimer() {
    // Clear existing timeout
    if (hideTimeout) {
      clearTimeout(hideTimeout);
    }
    
    // Show the pin
    showCenterPin();
    
    // Set new timeout to hide after delay
    hideTimeout = setTimeout(() => {
      hideCenterPin();
    }, HIDE_DELAY);
  }

  // Add map movement listeners
  if (window.mapManager) {
    const map = window.mapManager.getMap();
    
    // Listen for map movement events
    map.addListener('center_changed', resetHideTimer);
    map.addListener('zoom_changed', resetHideTimer);
    map.addListener('bounds_changed', resetHideTimer);
    
    console.log('✅ Center pin auto-hide setup complete');
  } else {
    // Retry after a short delay if mapManager isn't ready
    setTimeout(setupCenterPinAutoHide, 500);
  }
}

// Update weather when GPS is used
const originalGpsBtn = document.getElementById("gpsBtn");
if (originalGpsBtn) {
  const originalClick = originalGpsBtn.onclick;
  originalGpsBtn.addEventListener("click", (e) => {
    // Get user location and update weather
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          fetchWeather(latitude, longitude);
        },
        (error) => {
          console.error('GPS error:', error);
        }
      );
    }
  });
}

// Update weather periodically (every 30 minutes) as backup
setInterval(() => {
  updateWeatherFromMapCenter();
}, 30 * 60 * 1000); // 30 minutes

// Use identified species in Add Tree modal
function useIdentifiedSpecies(commonName) {
  // 1. Set species and autofill
  const speciesInput = document.getElementById("treeSpecies");
  if (speciesInput) {
    speciesInput.value = commonName;
    if (window.treeManager) {
      window.treeManager.autofillSpeciesDetails(commonName);
    }
  }

  // 2. Grab first photo file from wizard (if available)
  const firstPhotoInput = document.querySelector(
    "#photoInputContainer input[type='file']"
  );
  const treePhotoInput = document.getElementById("treePhotoInput");

  if (firstPhotoInput?.files?.length > 0 && treePhotoInput) {
    const file = firstPhotoInput.files[0];

    // Simulate file transfer (uses File object)
    const dataTransfer = new DataTransfer();
    dataTransfer.items.add(file);
    treePhotoInput.files = dataTransfer.files;

    console.log(
      "📸 Transferred photo from wizard to Add Tree modal:",
      file.name
    );
  }

  // 3. Close the identifier wizard
  document.getElementById("treeIdentifierModal")?.classList.add("hidden");

  // 4. Open the Add Tree modal
  openTreeModal();
}

// Test tree modal function
function testTreeModal() {
  console.log('🧪 Testing tree modal...');
  console.log('🔍 window.treeManager:', !!window.treeManager);
  console.log('🔍 window.mapManager:', !!window.mapManager);
  console.log('🔍 window.authManager:', !!window.authManager);
  
  if (window.treeManager && typeof window.treeManager.openTreeModal === 'function') {
    console.log('✅ Calling treeManager.openTreeModal()');
    window.treeManager.openTreeModal();
  } else {
    console.error('❌ treeManager not available or openTreeModal not a function');
    alert('Tree manager not ready');
  }
}

// Simple test function that doesn't depend on modules
function testModalDirectly() {
  console.log('🧪 Testing modal directly...');
  const modal = document.getElementById("treeModal");
  if (modal) {
    modal.classList.remove("hidden");
    console.log('✅ Modal opened directly');
  } else {
    console.error('❌ Modal element not found');
  }
}