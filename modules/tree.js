// ============================
// 🌳 TREE MANAGEMENT MODULE
// ============================

console.log('🌳 Tree module loading...');

import { db, storage } from '../config/firebase.js';

export class TreeManager {
  constructor() {
    this.editingTreeId = null;
    this.newTreeLocation = null;
    this.lastSavedTreeInfo = null;
  }

  // Generate unique TIN
  async generateUniqueTIN(userCode) {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let tin, exists = true;

    function getRandomBlock(length = 4) {
      let result = "";
      for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      return result;
    }

    while (exists) {
      const block = getRandomBlock();
      tin = `GZ-${userCode}-${block}`;
      
      const snapshot = await db.collection("map_items")
        .where("tin", "==", tin)
        .limit(1)
        .get();
      
      exists = !snapshot.empty;
    }
    return tin;
  }

  // Get icon for species
  async getIconForSpecies(speciesName) {
    const snapshot = await db.collection("catalog_items").get();
    let iconFile = "icon_undefined.svg";

    snapshot.forEach((doc) => {
      const item = doc.data();
      if (item.commonName?.toLowerCase() === speciesName.toLowerCase()) {
        iconFile = item.icon || "icon_undefined.svg";
      }
    });

    return iconFile;
  }

  // Auto-fill species details
  async autofillSpeciesDetails(commonName) {
    if (!commonName) return;

    const snapshot = await db.collection("catalog_items").get();
    let match = null;

    snapshot.forEach((doc) => {
      const item = doc.data();
      if (item.commonName?.toLowerCase() === commonName.toLowerCase()) {
        match = item;
      }
    });

    if (!match) return;

    const set = (id, value) => {
      const el = document.getElementById(id);
      if (el) el.value = value || "";
    };

    set("treeGenus", match.genus);
    set("treeSpeciesName", match.species);
    set("treeBotanicalName", match.scientificName || `${match.genus || ""} ${match.species || ""}`);
    set("treeFamily", match.family);
    set("treeAlternateNames", match.alternateNames);
    set("treeOriginStatus", match.native || "");
    set("treeUSDAZone", match.hardinessZone);
    set("treeGrowthHabit", match.growthHabit);
    set("treeLifespan", match.lifeSpan);
    set("treeEcosystemRole", match.ecosystemFunction);
    set("treeUseCategories", match.useCategories);

    // Show species notes
    const infoBox = document.getElementById("speciesInfoBox");
    const infoText = document.getElementById("speciesInfoText");

    if (match.notes) {
      infoText.textContent = match.notes;
      infoBox.style.display = "block";
    } else {
      infoText.textContent = "";
      infoBox.style.display = "none";
    }
  }

  // Load plant options for autocomplete
  async loadPlantOptions() {
    try {
      console.log('🌱 Loading plant options...');
      const snapshot = await db.collection("catalog_items").orderBy("commonName").get();
      const datalist = document.getElementById("speciesList");

      if (!datalist) {
        console.warn('⚠️ speciesList datalist not found');
        return;
      }

      datalist.innerHTML = "";

      snapshot.forEach((doc) => {
        const data = doc.data();
        if (data.commonName) {
          const option = document.createElement("option");
          option.value = data.commonName;
          datalist.appendChild(option);
        }
      });
      
      console.log(`✅ Loaded ${snapshot.size} plant options`);
    } catch (error) {
      console.error('❌ Failed to load plant options:', error);
    }
  }

  // Load saved trees
  async loadSavedTrees() {
    try {
      console.log('🌳 Loading saved trees...');
      
      if (!window.mapManager) {
        console.warn('⚠️ mapManager not ready, skipping tree loading');
        return;
      }
      
      if (!window.authManager) {
        console.warn('⚠️ authManager not ready, skipping tree loading');
        return;
      }
      
      const map = window.mapManager.getMap();
      if (!map || typeof map.getZoom !== "function") {
        console.warn('⚠️ Map not ready, skipping tree loading');
        return;
      }

      // Clear existing markers
      window.mapManager.getMarkers().forEach(({ marker }) => marker.setMap(null));
      window.mapManager.allTreeMarkers = [];

      const snapshot = await db.collection("map_items").get();
      const zoomLevel = map.getZoom();
      const userCode = window.authManager.getDatabaseCode();
      const isAdmin = window.authManager.isAdmin();

      console.log(`📊 Processing ${snapshot.size} trees...`);

      // Process trees in batches to avoid blocking the UI
      const trees = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
      const validTrees = trees.filter(data => !data.isDeleted && data.lat && data.lng);
      
      console.log(`✅ Found ${validTrees.length} valid trees`);

      // Process trees in smaller batches
      const batchSize = 10;
      for (let i = 0; i < validTrees.length; i += batchSize) {
        const batch = validTrees.slice(i, i + batchSize);
        
        // Process batch in parallel
        await Promise.all(batch.map(async (data) => {
          const isUserTree = isAdmin || 
                            data.databaseCode === userCode ||
                            data.databaseCode === "public-demo";

          const iconFile = await this.getIconForSpecies(data.commonName || data.species);
          data.iconFile = iconFile;

          const iconUrl = isUserTree
            ? `https://gzadmin-93.github.io/tree-icons/${iconFile}`
            : `https://gzadmin-93.github.io/tree-icons/icon_greyout.svg`;

          const shouldShow = (isAdmin && zoomLevel >= 11) ||
                            (isUserTree && zoomLevel >= 13) ||
                            (!isUserTree && zoomLevel >= 17);

          const marker = new google.maps.Marker({
            position: { lat: data.lat, lng: data.lng },
            map: shouldShow ? map : null,
            title: `${data.commonName} (TIN: ${data.tin})`,
            icon: {
              url: iconUrl,
              scaledSize: new google.maps.Size(32, 32),
              anchor: new google.maps.Point(16, 16)
            },
            treeId: data.id,
          });

          marker.addListener("click", () => {
            console.log('🌳 Marker clicked for tree:', data.tin);
            console.log('🔍 isUserTree:', isUserTree);
            console.log('👤 User database code:', userCode);
            console.log('🌳 Tree database code:', data.databaseCode);
            
            if (isUserTree) {
              console.log('✅ Showing view tree modal');
              this.showViewTreeModal(data);
            } else {
              console.log('🔐 Opening request access modal');
              this.openRequestAccessModal(data.tin || "Unknown");
            }
          });

          window.mapManager.addMarker(marker, data);
        }));

        // Small delay to prevent UI blocking
        if (i + batchSize < validTrees.length) {
          await new Promise(resolve => setTimeout(resolve, 10));
        }
      }

      console.log(`✅ Loaded ${validTrees.length} trees successfully`);
    } catch (error) {
      console.error('❌ Failed to load saved trees:', error);
    }
  }

  // Save tree
  async saveTree() {
    // 🧪 Tutorial mode check - don't save real trees during tutorial
    if (window.isInTutorial) {
      console.log('🧪 Tutorial mode detected - skipping real save');
      return;
    }

    const saveBtn = document.getElementById("saveTreeBtn");
    if (!saveBtn) return;

    saveBtn.disabled = true;
    saveBtn.innerHTML = `<img src="https://gzadmin-93.github.io/tree-icons/icon-117.svg" style="width: 20px; height: 20px; animation: spin 2s linear infinite; vertical-align: middle;" /> Saving...`;

    try {
      const get = (id) => document.getElementById(id)?.value?.trim() || "";

      const commonName = get("treeSpecies");
      if (!commonName) {
        alert("Please enter a species.");
        return;
      }

      if (!this.editingTreeId && !this.newTreeLocation) {
        alert("Please center the map before adding a tree.");
        return;
      }

      const iconFile = await this.getIconForSpecies(commonName);
      
      // Get species notes from catalog
      let speciesNotes = "";
      try {
        const catalogSnapshot = await db.collection("catalog_items").get();
        catalogSnapshot.forEach((doc) => {
          const item = doc.data();
          if (item.commonName?.toLowerCase() === commonName.toLowerCase()) {
            speciesNotes = item.notes || "";
          }
        });
      } catch (error) {
        console.error('Failed to fetch species notes:', error);
      }
      
      let photoUrl = this.editingTreeId
        ? window.mapManager.getMarkers().find((m) => m.data.id === this.editingTreeId)?.data.photoUrl || ""
        : "";

      // Handle photo upload
      const photoInput = document.getElementById("treePhotoInput");
      const photoFile = photoInput?.files[0];

      if (photoFile) {
        const maxSizeMB = 10;
        const fileSizeMB = photoFile.size / (1024 * 1024);

        if (fileSizeMB > maxSizeMB) {
          alert(`❌ Image too large. Please upload a photo smaller than ${maxSizeMB} MB.`);
          return;
        }

        const user = window.authManager.getCurrentUser();
        const filePath = `tree_photos/${user.uid}/${Date.now()}_${photoFile.name}`;
        const photoRef = storage.ref().child(filePath);
        const snapshot = await photoRef.put(photoFile);
        photoUrl = await snapshot.ref.getDownloadURL();
      }

      const user = window.authManager.getCurrentUser();
      const userDoc = await db.collection("users").doc(user.uid).get();
      const userCode = userDoc.data().userCode || "UNKN";

      let lat = parseFloat(get("treeLatitude"));
      let lng = parseFloat(get("treeLongitude"));

      if (isNaN(lat) || isNaN(lng)) {
        alert("Please enter valid latitude and longitude values.");
        return;
      }

      // Store last tree info for quick copy
      this.lastSavedTreeInfo = {
        type: get("treeType"),
        commonName: get("treeSpecies"),
      };

      const treeData = {
        tagCode: get("treeTagCode"),
        type: get("treeType"),
        commonName,
        scientificName: get("treeBotanicalName"),
        genus: get("treeGenus"),
        species: get("treeSpeciesName"),
        family: get("treeFamily"),
        alternateNames: get("treeAlternateNames"),
        originStatus: get("treeOriginStatus"),
        hardinessZone: get("treeUSDAZone"),
        growthHabit: get("treeGrowthHabit"),
        lifespanCategory: get("treeLifespan"),
        ecosystemFunction: get("treeEcosystemRole"),
        useCategories: get("treeUseCategories"),
        height: get("treeHeight"),
        trunkDiameter: get("treeDBH"),
        canopySpread: get("treeCanopy"),
        address: get("treeAddress"),
        locationNotes: get("treeLocationNotes"),
        health: get("treeHealth"),
        structure: get("treeStructure"),
        leafCondition: get("treeLeafCondition"),
        lastInspected: get("lastInspected"),
        nextInspection: get("nextInspection"),
        pests: get("treePests"),
        diseases: get("treeDiseases"),
        age: get("treeAge"),
        damage: get("treeDamage"),
        issueNotes: get("issueNotes"),
        actions: get("treeActions"),
        actionPriority: get("actionPriority"),
        followUpPerson: get("followUpPerson"),
        nextActionDate: get("nextActionDate"),
        followUpNotes: get("followUpNotes"),
        userNotes: get("userNotes"),
        lat,
        lng,
        formattedCoordinates: `${lat?.toFixed(6)}, ${lng?.toFixed(6)}`,
        photoUrl,
        createdBy: user.uid,
        databaseCode: userDoc.data().databaseCode || null,
        updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
        speciesNotes,
      };

      if (this.editingTreeId) {
        await this.updateTree(this.editingTreeId, treeData, iconFile);
      } else {
        await this.createTree(treeData, userCode, iconFile);
      }

      window.mapManager.updateTreeLegend();
      this.closeTreeModal();

      saveBtn.disabled = false;
      saveBtn.innerHTML = "💾 Save";
    } catch (error) {
      alert("Failed to save tree: " + error.message);
      saveBtn.disabled = false;
      saveBtn.innerHTML = "💾 Save";
    }
  }

  // Update existing tree
  async updateTree(treeId, treeData, iconFile) {
    const originalDoc = await db.collection("map_items").doc(treeId).get();
    const originalData = originalDoc.data();

    await db.collection("map_items").doc(treeId).update(treeData);

    treeData.tin = originalData.tin || "";
    treeData.iconFile = iconFile;
    treeData.updatedAt = firebase.firestore.Timestamp.now();

    // Refresh marker on map
    const index = window.mapManager.getMarkers().findIndex((m) => m.data.id === treeId);
    if (index !== -1) {
      window.mapManager.getMarkers()[index].marker.setMap(null);

      const updatedMarker = new google.maps.Marker({
        position: { lat: treeData.lat, lng: treeData.lng },
        map: window.mapManager.getMap(),
        title: `${treeData.commonName} (TIN: ${treeData.tin})`,
        icon: {
          url: `https://gzadmin-93.github.io/tree-icons/${iconFile}`,
          scaledSize: new google.maps.Size(32, 32),
          anchor: new google.maps.Point(16, 16)
        },
        treeId: treeId,
      });

      updatedMarker.addListener("click", () => {
        this.showViewTreeModal({
          ...treeData,
          id: treeId,
        });
      });

      window.mapManager.getMarkers()[index] = {
        marker: updatedMarker,
        data: {
          ...treeData,
          id: treeId,
          iconFile,
        },
      };
    }

    alert("✅ Tree updated successfully!");
  }

  // Create new tree
  async createTree(treeData, userCode, iconFile) {
    treeData.tin = await this.generateUniqueTIN(userCode);
    treeData.updatedAt = firebase.firestore.Timestamp.now();

    const newDocRef = await db.collection("map_items").add(treeData);
    const newTreeId = newDocRef.id;

    const finalMarker = new google.maps.Marker({
      position: { lat: treeData.lat, lng: treeData.lng },
      map: window.mapManager.getMap(),
      title: `${treeData.commonName} (TIN: ${treeData.tin})`,
      icon: {
        url: `https://gzadmin-93.github.io/tree-icons/${iconFile}`,
        scaledSize: new google.maps.Size(32, 32),
        anchor: new google.maps.Point(16, 16)
      },
      treeId: newTreeId,
    });

    finalMarker.addListener("click", () => {
      this.showViewTreeModal({
        ...treeData,
        id: newTreeId,
        iconFile,
      });
    });

    window.mapManager.addMarker(finalMarker, {
      ...treeData,
      id: newTreeId,
      iconFile,
    });
  }

  // Delete tree
  async deleteTree(treeId) {
    if (!confirm("Are you sure you want to delete this tree?")) return;

    try {
      await db.collection("map_items").doc(treeId).update({
        isDeleted: true,
        deletedAt: firebase.firestore.FieldValue.serverTimestamp(),
      });

      window.mapManager.removeMarker(treeId);
      window.mapManager.updateTreeLegend();
      this.closeViewTreeModal();

      alert("✅ Tree deleted successfully!");
    } catch (error) {
      alert("Failed to delete tree: " + error.message);
    }
  }

  // Modal management methods
  openTreeModal() {
    console.log('🌳 openTreeModal called');
    
    if (!window.mapManager) {
      console.error('❌ mapManager not available');
      alert('Map not ready. Please wait a moment and try again.');
      return;
    }
    
    const map = window.mapManager.getMap();
    if (map) {
      console.log('🗺️ Map found, getting center...');
      const center = map.getCenter();
      this.newTreeLocation = {
        lat: center.lat(),
        lng: center.lng(),
      };
      console.log('📍 New tree location:', this.newTreeLocation);

      // Hide TIN box in Add Tree mode
      const tinBox = document.getElementById("editTreeTINBox");
      const tinText = document.getElementById("editTreeTINText");
      if (tinBox && tinText) {
        tinText.textContent = "";
        tinBox.style.display = "none";
        console.log('✅ Hidden TIN box');
      }

      const latInput = document.getElementById("treeLatitude");
      const lngInput = document.getElementById("treeLongitude");
      
      if (latInput && lngInput) {
        latInput.value = this.newTreeLocation.lat.toFixed(6);
        lngInput.value = this.newTreeLocation.lng.toFixed(6);
        console.log('✅ Set latitude/longitude inputs');
      } else {
        console.error('❌ Could not find latitude/longitude inputs');
      }

      // Reverse geocode
      const geocoder = new google.maps.Geocoder();
      geocoder.geocode({ location: this.newTreeLocation }, (results, status) => {
        if (status === "OK" && results[0]) {
          const addressInput = document.getElementById("treeAddress");
          if (addressInput) {
            addressInput.value = results[0].formatted_address;
            console.log('✅ Set address from geocoding');
          }
        } else {
          const addressInput = document.getElementById("treeAddress");
          if (addressInput) {
            addressInput.value = ""; // fallback to empty
            console.warn("No address found for location");
          }
        }
      });
    } else {
      console.error('❌ Map not found');
    }

    const modalTitle = document.getElementById("treeModalTitle");
    if (modalTitle) {
      modalTitle.textContent = "New Tree Entry";
      console.log('✅ Set modal title');
    }

    this.closeAllModals();
    
    const treeModal = document.getElementById("treeModal");
    if (treeModal) {
      treeModal.classList.remove("hidden");
      
      // Force modal to be visible and positioned correctly
      treeModal.style.display = "flex";
      treeModal.style.position = "fixed";
      treeModal.style.top = "150px";
      treeModal.style.bottom = "100px";
      treeModal.style.left = "0";
      treeModal.style.right = "0";
      treeModal.style.zIndex = "9999"; // Very high z-index
      treeModal.style.justifyContent = "center";
      treeModal.style.alignItems = "center";
      treeModal.style.backgroundColor = "transparent";
      treeModal.style.opacity = "1";
      treeModal.style.visibility = "visible";
      
      console.log('✅ Tree modal shown');
      
      // Always scroll to top when modal opens
      const modalContent = treeModal.querySelector('.modal-content');
      if (modalContent) {
        modalContent.scrollTo(0, 0);
        console.log('✅ Scrolled to top');
        console.log('🔍 Modal content dimensions:', modalContent.getBoundingClientRect());
      }

      // Collapse all toggle sections by default
      const collapsibleHeaders = treeModal.querySelectorAll('.collapsible-header');
      collapsibleHeaders.forEach((button) => {
        const content = button.nextElementSibling;
        if (!button.classList.contains("collapsed")) {
          button.classList.add("collapsed");
        }
        if (content) {
          content.style.display = "none";
        }
      });
      console.log('✅ Collapsed all sections');
    } else {
      console.error('❌ Could not find treeModal element');
    }
  }

  closeTreeModal() {
    this.newTreeLocation = null;
    this.editingTreeId = null;

    const clear = (id) => {
      const el = document.getElementById(id);
      if (el) el.value = "";
    };

    // Clear all form fields
    const fields = [
      "treeSpecies", "treeTagCode", "treeBotanicalName", "treeGenus",
      "treeSpeciesName", "treeFamily", "treeAlternateNames", "treeOriginStatus",
      "treeUSDAZone", "treeGrowthHabit", "treeLifespan", "treeEcosystemRole",
      "treeUseCategories", "treeHeight", "treeDBH", "treeCanopy",
      "treeCoordinates", "treeAddress", "treeLocationNotes", "treeHealth",
      "treeStructure", "treeLeafCondition", "lastInspected", "nextInspection",
      "treePests", "treeDiseases", "treeAge", "treeDamage", "issueNotes",
      "treeActions", "actionPriority", "followUpPerson", "nextActionDate",
      "followUpNotes", "userNotes", "treePhotoInput", "treeType"
    ];

    fields.forEach(clear);
    this.removeTreePhoto();

    document.getElementById("treeModal")?.classList.add("hidden");
  }

  closeAllModals() {
    document.querySelectorAll(".modal").forEach((modal) => {
      modal.classList.add("hidden");
    });
  }

  // Additional methods would be implemented here...
  showViewTreeModal(data) {
    // Populate modal with tree data
    const set = (id, value) => {
      const element = document.getElementById(id);
      if (element) {
        element.textContent = value || "--";
      }
    };

    // Set basic info
    set("viewTreeSpeciesNameText", data.commonName);
    set("viewTreeTypeText", data.type);
    set("viewTreeTINText", data.tin);
    set("viewTreeGenusText", data.genus);
    set("viewTreeSpeciesText", data.species);
    set("viewTreeFamilyText", data.family);

    // Set scientific info
    set("viewTreeAlternateNamesText", data.alternateNames || "None");

    // Set age & structure
    set("viewTreeAgeText", data.age);
    set("viewTreeHeightText", data.height);
    set("viewTreeDBHText", data.trunkDiameter);
    set("viewTreeCanopyText", data.canopySpread);

    // Set health & condition
    set("viewTreeHealthText", data.health);
    set("viewTreeStructureText", data.structure);
    set("viewTreeLeafConditionText", data.leafCondition);
    set("viewLastInspectedText", data.lastInspected);
    set("viewNextInspectionText", data.nextInspection);

    // Set tag & location
    set("viewTreeTagCodeText", data.tagCode);
    set("viewTreeLatitudeText", data.lat ? data.lat.toFixed(6) : "--");
    set("viewTreeLongitudeText", data.lng ? data.lng.toFixed(6) : "--");
    set("viewTreeAddressText", data.address);
    set("viewTreeLocationNotesText", data.locationNotes);

    // Set origin & function
    set("viewTreeOriginStatusText", data.originStatus);
    set("viewTreeUSDAZoneText", data.hardinessZone);
    set("viewTreeGrowthHabitText", data.growthHabit);
    set("viewTreeLifespanText", data.lifespanCategory);
    set("viewTreeEcosystemRoleText", data.ecosystemFunction);
    set("viewTreeUseCategoriesText", data.useCategories);

    // Set issues & recommendations
    set("viewTreePestsText", data.pests);
    set("viewTreeDiseasesText", data.diseases);
    set("viewTreeDamageText", data.damage);
    set("viewIssueNotesText", data.issueNotes);
    set("viewTreeActionsText", data.actions);
    set("viewActionPriorityText", data.actionPriority);
    set("viewFollowUpPersonText", data.followUpPerson);
    set("viewNextActionDateText", data.nextActionDate);
    set("viewFollowUpNotesText", data.followUpNotes);

    // Set notes
    set("viewUserNotesText", data.userNotes);

    // Set updated time
    const updatedAt = data.updatedAt;
    if (updatedAt) {
      const date = updatedAt.toDate ? updatedAt.toDate() : new Date(updatedAt);
      set("viewTreeUpdatedAt", `Last Updated: ${date.toLocaleDateString()} ${date.toLocaleTimeString()}`);
    } else {
      set("viewTreeUpdatedAt", "Last Updated: --");
    }

    // Set tree photo
    const photoBox = document.getElementById("viewTreePhotoBox");
    const photoImg = document.getElementById("viewTreePhoto");
    if (data.photoUrl && data.photoUrl !== "") {
      photoImg.src = data.photoUrl;
      photoBox.style.display = "block";
      
      // Add click functionality to enlarge photo
      photoImg.style.cursor = "pointer";
      photoImg.onclick = function() {
        // Create photo enlargement modal
        const photoModal = document.createElement("div");
        photoModal.id = "photoEnlargementModal";
        photoModal.style.position = "fixed";
        photoModal.style.top = "0";
        photoModal.style.left = "0";
        photoModal.style.width = "100%";
        photoModal.style.height = "100%";
        photoModal.style.backgroundColor = "rgba(0,0,0,0.9)";
        photoModal.style.zIndex = "3000";
        photoModal.style.display = "flex";
        photoModal.style.alignItems = "center";
        photoModal.style.justifyContent = "center";
        photoModal.style.cursor = "pointer";
        
        photoModal.innerHTML = `
          <img src="${photoImg.src}" alt="Tree Photo" style="max-width: 90%; max-height: 90%; object-fit: contain; border-radius: 8px;" />
          <div style="position: absolute; top: 20px; right: 20px; color: white; font-size: 24px; cursor: pointer; background: rgba(0,0,0,0.5); border-radius: 50%; width: 40px; height: 40px; display: flex; align-items: center; justify-content: center;">×</div>
        `;
        
        document.body.appendChild(photoModal);
        
        // Close modal when clicked
        photoModal.onclick = function() {
          document.body.removeChild(photoModal);
        };
      };
    } else {
      photoBox.style.display = "none";
    }

    // Set tree icon
    const profileImg = document.getElementById("viewTreeProfileImage");
    if (data.iconFile) {
      profileImg.src = `https://gzadmin-93.github.io/tree-icons/${data.iconFile}`;
    } else {
      profileImg.src = "https://gzadmin-93.github.io/tree-icons/icon_undefined.svg";
    }

    // Set species info
    const speciesInfoBox = document.getElementById("viewSpeciesInfoBox");
    const speciesInfoText = document.getElementById("viewSpeciesInfoText");
    
    // Function to fetch and display species notes
    const fetchAndDisplaySpeciesNotes = async () => {
      try {
        // First check if we already have species notes
        if (data.speciesNotes && data.speciesNotes.trim() !== "") {
          speciesInfoText.textContent = data.speciesNotes;
          speciesInfoBox.style.display = "block";
          return;
        }
        
        // If no species notes, try to fetch from catalog
        if (data.commonName) {
          const catalogSnapshot = await db.collection("catalog_items").get();
          let foundNotes = "";
          
          catalogSnapshot.forEach((doc) => {
            const item = doc.data();
            if (item.commonName?.toLowerCase() === data.commonName.toLowerCase()) {
              foundNotes = item.notes || "";
            }
          });
          
          if (foundNotes && foundNotes.trim() !== "") {
            speciesInfoText.textContent = foundNotes;
            speciesInfoBox.style.display = "block";
            return;
          }
        }
        
        // Fallback to scientific name if no notes found
        if (data.scientificName) {
          speciesInfoText.textContent = `Scientific Name: ${data.scientificName}`;
          speciesInfoBox.style.display = "block";
        } else {
          speciesInfoBox.style.display = "none";
        }
      } catch (error) {
        console.error('Failed to fetch species notes:', error);
        // Fallback to scientific name on error
        if (data.scientificName) {
          speciesInfoText.textContent = `Scientific Name: ${data.scientificName}`;
          speciesInfoBox.style.display = "block";
        } else {
          speciesInfoBox.style.display = "none";
        }
      }
    };
    
    // Call the function to fetch and display species notes
    fetchAndDisplaySpeciesNotes();

    // Set up edit and delete buttons
    const editBtn = document.getElementById("goToEditModeBtn");
    const deleteBtn = document.getElementById("deleteTreeBtn");

    if (editBtn) {
      editBtn.onclick = () => {
        this.closeViewTreeModal();
        this.editingTreeId = data.id;
        this.openTreeModal();
        this.populateTreeForm(data);
      };
    }

    if (deleteBtn) {
      deleteBtn.onclick = () => {
        this.deleteTree(data.id);
      };
    }

    // Show modal
    const modal = document.getElementById("viewTreeModal");
    if (modal) {
      modal.classList.remove("hidden");
    }
  }

  closeViewTreeModal() {
    const modal = document.getElementById("viewTreeModal");
    if (modal) {
      modal.classList.add("hidden");
    }
  }

  populateTreeForm(data) {
    const set = (id, value) => {
      const element = document.getElementById(id);
      if (element) {
        element.value = value || "";
      }
    };

    // Populate form fields with tree data
    set("treeTagCode", data.tagCode);
    set("treeType", data.type);
    set("treeSpecies", data.commonName);
    set("treeBotanicalName", data.scientificName);
    set("treeGenus", data.genus);
    set("treeSpeciesName", data.species);
    set("treeFamily", data.family);
    set("treeAlternateNames", data.alternateNames);
    set("treeOriginStatus", data.originStatus);
    set("treeUSDAZone", data.hardinessZone);
    set("treeGrowthHabit", data.growthHabit);
    set("treeLifespan", data.lifespanCategory);
    set("treeEcosystemRole", data.ecosystemFunction);
    set("treeUseCategories", data.useCategories);
    set("treeHeight", data.height);
    set("treeDBH", data.trunkDiameter);
    set("treeCanopy", data.canopySpread);
    set("treeAddress", data.address);
    set("treeLocationNotes", data.locationNotes);
    set("treeHealth", data.health);
    set("treeStructure", data.structure);
    set("treeLeafCondition", data.leafCondition);
    set("lastInspected", data.lastInspected);
    set("nextInspection", data.nextInspection);
    set("treePests", data.pests);
    set("treeDiseases", data.diseases);
    set("treeAge", data.age);
    set("treeDamage", data.damage);
    set("issueNotes", data.issueNotes);
    set("treeActions", data.actions);
    set("actionPriority", data.actionPriority);
    set("followUpPerson", data.followUpPerson);
    set("nextActionDate", data.nextActionDate);
    set("followUpNotes", data.followUpNotes);
    set("userNotes", data.userNotes);
    set("treeLatitude", data.lat);
    set("treeLongitude", data.lng);

    // Set the tree icon
    if (data.iconFile) {
      const iconSelect = document.getElementById("treeIconSelect");
      if (iconSelect) {
        iconSelect.value = data.iconFile;
      }
    }

    // Update the form title to indicate editing
    const modalTitle = document.querySelector("#treeModal h2");
    if (modalTitle) {
      modalTitle.textContent = "✏️ Edit Tree";
    }

    // Update the save button text
    const saveBtn = document.getElementById("saveTreeBtn");
    if (saveBtn) {
      saveBtn.innerHTML = "💾 Update Tree";
    }
  }

  openRequestAccessModal(tin) {
    console.log('🔐 Opening request access modal for TIN:', tin);
    
    // Set the tree code in the modal
    const treeCodeElement = document.getElementById("nonUserGZCode");
    if (treeCodeElement) {
      treeCodeElement.textContent = tin;
      console.log('✅ Set tree code in modal:', tin);
    } else {
      console.error('❌ Could not find nonUserGZCode element');
    }

    // Show the modal
    const modal = document.getElementById("requestAccessModal");
    if (modal) {
      modal.classList.remove("hidden");
      console.log('✅ Request access modal shown');
    } else {
      console.error('❌ Could not find requestAccessModal element');
    }
  }

  removeTreePhoto() {
    // Implementation for removing tree photo
  }
}

export const treeManager = new TreeManager(); 