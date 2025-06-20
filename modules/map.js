// ============================
// 🗺️ MAP MANAGEMENT MODULE
// ============================

import { authManager } from './auth.js';

export class MapManager {
  constructor() {
    this.map = null;
    this.allTreeMarkers = [];
    this.treeMarker = null;
    this.centerTreeLocation = null;
    this.searchBox = null;
    this.placesService = null;
  }

  // Initialize Google Maps
  init() {
    const center = { lat: 41.723158305053474, lng: -88.06867936825057 };
    
    this.map = new google.maps.Map(document.getElementById("map"), {
      zoom: 11,
      center: center,
      mapTypeId: "hybrid",
      disableDefaultUI: true,
      zoomControl: false,
      tilt: 0,
      heading: 0,
      styles: [
        { featureType: "poi.business", stylers: [{ visibility: "off" }] },
        { featureType: "poi.medical", stylers: [{ visibility: "off" }] },
        { featureType: "poi.attraction", stylers: [{ visibility: "off" }] },
        {
          featureType: "administrative",
          elementType: "geometry",
          stylers: [{ visibility: "off" }],
        },
        { elementType: "labels.icon", stylers: [{ visibility: "off" }] },
      ],
    });

    this.setupSearchBox();
    this.setupMapListeners();
    this.checkJumpToTree();
    
    return this.map;
  }

  // Setup search functionality
  setupSearchBox() {
    const input = document.getElementById("searchInput");
    if (!input) return;

    this.searchBox = new google.maps.places.SearchBox(input);
    this.placesService = new google.maps.places.PlacesService(this.map);

    // Bias search results to current map view
    this.map.addListener("bounds_changed", () => {
      this.searchBox.setBounds(this.map.getBounds());
    });

    // Setup search button listener
    document.getElementById("triggerSearchBtn")?.addEventListener("click", () => {
      this.performSearch();
    });
  }

  // Perform search
  async performSearch() {
    const inputValue = document.getElementById("searchInput")?.value.trim();
    if (!inputValue) return;

    // Case 1: Groundzy TIN
    if (inputValue.startsWith("GZ-")) {
      await this.searchByTIN(inputValue);
      return;
    }

    // Case 2: Tag Code
    if (await this.searchByTagCode(inputValue)) {
      return;
    }

    // Case 3: Google Places API
    this.searchByPlaces(inputValue);
  }

  // Search by TIN
  async searchByTIN(tin) {
    const snapshot = await firebase.firestore()
      .collection("map_items")
      .where("tin", "==", tin.toUpperCase())
      .limit(1)
      .get();

    if (!snapshot.empty) {
      const data = snapshot.docs[0].data();
      if (data.lat && data.lng) {
        this.map.setCenter({ lat: data.lat, lng: data.lng });
        this.map.setZoom(20);
      }
    }
  }

  // Search by tag code
  async searchByTagCode(tagCode) {
    const snapshot = await firebase.firestore()
      .collection("map_items")
      .where("tagCode", "==", tagCode)
      .limit(1)
      .get();

    if (!snapshot.empty) {
      const data = snapshot.docs[0].data();
      if (data.lat && data.lng) {
        this.map.setCenter({ lat: data.lat, lng: data.lng });
        this.map.setZoom(20);
        return true;
      }
    }
    return false;
  }

  // Search by Google Places
  searchByPlaces(query) {
    const request = {
      query: query,
      fields: ["name", "geometry", "formatted_address", "types"],
    };

    this.placesService.findPlaceFromQuery(request, (results, status) => {
      if (status === google.maps.places.PlacesServiceStatus.OK && results[0]) {
        this.zoomToPlace(results[0]);
      }
    });
  }

  // Zoom to place
  zoomToPlace(place) {
    if (place.geometry && place.geometry.location) {
      this.map.setCenter(place.geometry.location);
      this.map.setZoom(18);
    }
  }

  // Setup map event listeners
  setupMapListeners() {
    this.map.addListener("zoom_changed", () => {
      this.updateTreeLegend();
      this.updateMarkerVisibility();
    });

    this.map.addListener("bounds_changed", () => {
      this.updateTreeLegend();
    });
  }

  // Check for jump-to-tree from admin panel
  checkJumpToTree() {
    const jumpLat = localStorage.getItem("jumpToTreeLat");
    const jumpLng = localStorage.getItem("jumpToTreeLng");

    if (jumpLat && jumpLng) {
      const jumpLocation = {
        lat: parseFloat(jumpLat),
        lng: parseFloat(jumpLng),
      };

      this.map.setCenter(jumpLocation);
      this.map.setZoom(20);

      // Clean up
      localStorage.removeItem("jumpToTreeLat");
      localStorage.removeItem("jumpToTreeLng");
      localStorage.removeItem("jumpToTreeId");
    }
  }

  // Update marker visibility based on zoom
  updateMarkerVisibility() {
    const zoomLevel = this.map.getZoom();
    const isAdmin = authManager.isAdmin();
    const databaseCode = authManager.getDatabaseCode();

    this.allTreeMarkers.forEach(({ marker, data }) => {
      const isUserTree = isAdmin || 
                        data.databaseCode === databaseCode ||
                        data.databaseCode === "public-demo";

      const shouldShow = (isAdmin && zoomLevel >= 11) ||
                        (isUserTree && zoomLevel >= 13) ||
                        (!isUserTree && zoomLevel >= 17);

      marker.setMap(shouldShow ? this.map : null);
    });
  }

  // Update tree legend
  updateTreeLegend() {
    if (!this.map || !authManager.getDatabaseCode() || this.map.getZoom() < 14) {
      const legendBox = document.getElementById("treeLegend");
      legendBox.innerHTML = "";
      legendBox.classList.add("hidden");
      return;
    }

    const bounds = this.map.getBounds();
    const visibleSpecies = new Map();

    this.allTreeMarkers.forEach(({ marker, data }) => {
      if (!bounds.contains(marker.getPosition())) return;

      const name = data.commonName || data.species || "Unknown";
      const icon = data.iconFile || "icon_undefined.svg";

      if (visibleSpecies.has(name)) {
        visibleSpecies.get(name).count += 1;
      } else {
        visibleSpecies.set(name, { icon, count: 1 });
      }
    });

    const legendBox = document.getElementById("treeLegend");
    legendBox.innerHTML = "";

    if (visibleSpecies.size === 0) {
      legendBox.classList.add("hidden");
      return;
    }

    visibleSpecies.forEach((info, speciesName) => {
      const div = document.createElement("div");
      div.innerHTML = `
        <img src="https://gzadmin-93.github.io/tree-icons/${info.icon}" alt="${speciesName}" />
        ${speciesName} (${info.count})
      `;
      legendBox.appendChild(div);
    });

    legendBox.classList.remove("hidden");
  }

  // Get map instance
  getMap() {
    return this.map;
  }

  // Get all markers
  getMarkers() {
    return this.allTreeMarkers;
  }

  // Add marker
  addMarker(marker, data) {
    this.allTreeMarkers.push({ marker, data });
  }

  // Remove marker
  removeMarker(markerId) {
    const index = this.allTreeMarkers.findIndex(m => m.data.id === markerId);
    if (index !== -1) {
      this.allTreeMarkers[index].marker.setMap(null);
      this.allTreeMarkers.splice(index, 1);
    }
  }
}

export const mapManager = new MapManager(); 