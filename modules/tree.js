// ============================
// 🌳 TREE MANAGEMENT MODULE
// ============================

import { firebase, db, storage } from '../config/firebase.js';
import { authManager } from './auth.js';
import { mapManager } from './map.js';

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
    const snapshot = await db.collection("catalog_items").orderBy("commonName").get();
    const datalist = document.getElementById("speciesList");

    datalist.innerHTML = "";

    snapshot.forEach((doc) => {
      const data = doc.data();
      if (data.commonName) {
        const option = document.createElement("option");
        option.value = data.commonName;
        datalist.appendChild(option);
      }
    });
  }

  // Load saved trees
  async loadSavedTrees() {
    const map = mapManager.getMap();
    if (!map || typeof map.getZoom !== "function") return;

    mapManager.getMarkers().forEach(({ marker }) => marker.setMap(null));
    mapManager.allTreeMarkers = [];

    const snapshot = await db.collection("map_items").get();
    const zoomLevel = map.getZoom();

    for (const doc of snapshot.docs) {
      const data = doc.data();
      data.id = doc.id;

      if (data.isDeleted) continue;
      if (!data.lat || !data.lng) continue;

      const isUserTree = authManager.isAdmin() || 
                        data.databaseCode === authManager.getDatabaseCode() ||
                        data.databaseCode === "public-demo";

      const iconFile = await this.getIconForSpecies(data.commonName || data.species);
      data.iconFile = iconFile;

      const iconUrl = isUserTree
        ? `https://gzadmin-93.github.io/tree-icons/${iconFile}`
        : `https://gzadmin-93.github.io/tree-icons/icon_greyout.svg`;

      const shouldShow = (authManager.isAdmin() && map.getZoom() >= 11) ||
                        (isUserTree && map.getZoom() >= 13) ||
                        (!isUserTree && map.getZoom() >= 17);

      const marker = new google.maps.Marker({
        position: { lat: data.lat, lng: data.lng },
        map: shouldShow ? map : null,
        title: data.tin || "Unnamed Tree",
        icon: {
          url: iconUrl,
          scaledSize: new google.maps.Size(28, 28),
        },
      });

      marker.addListener("click", () => {
        if (isUserTree) {
          this.showViewTreeModal(data);
        } else {
          this.openRequestAccessModal(data.tin || "Unknown");
        }
      });

      mapManager.addMarker(marker, data);
    }
  }

  // Save tree
  async saveTree() {
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
      let photoUrl = this.editingTreeId
        ? mapManager.getMarkers().find((m) => m.data.id === this.editingTreeId)?.data.photoUrl || ""
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

        const user = authManager.getCurrentUser();
        const filePath = `tree_photos/${user.uid}/${Date.now()}_${photoFile.name}`;
        const photoRef = storage.ref().child(filePath);
        const snapshot = await photoRef.put(photoFile);
        photoUrl = await snapshot.ref.getDownloadURL();
      }

      const user = authManager.getCurrentUser();
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
      };

      if (this.editingTreeId) {
        await this.updateTree(this.editingTreeId, treeData, iconFile);
      } else {
        await this.createTree(treeData, userCode, iconFile);
      }

      mapManager.updateTreeLegend();
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
    const index = mapManager.getMarkers().findIndex((m) => m.data.id === treeId);
    if (index !== -1) {
      mapManager.getMarkers()[index].marker.setMap(null);

      const updatedMarker = new google.maps.Marker({
        position: { lat: treeData.lat, lng: treeData.lng },
        map: mapManager.getMap(),
        title: treeData.commonName,
        icon: {
          url: `https://gzadmin-93.github.io/tree-icons/${iconFile}`,
          scaledSize: new google.maps.Size(28, 28),
        },
      });

      updatedMarker.addListener("click", () => {
        this.showViewTreeModal({
          ...treeData,
          id: treeId,
        });
      });

      mapManager.getMarkers()[index] = {
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
      map: mapManager.getMap(),
      title: treeData.commonName,
      icon: {
        url: `https://gzadmin-93.github.io/tree-icons/${iconFile}`,
        scaledSize: new google.maps.Size(28, 28),
      },
    });

    finalMarker.addListener("click", () => {
      this.showViewTreeModal({
        ...treeData,
        id: newTreeId,
        iconFile,
      });
    });

    mapManager.addMarker(finalMarker, {
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

      mapManager.removeMarker(treeId);
      mapManager.updateTreeLegend();
      this.closeViewTreeModal();

      alert("✅ Tree deleted successfully!");
    } catch (error) {
      alert("Failed to delete tree: " + error.message);
    }
  }

  // Modal management methods
  openTreeModal() {
    const map = mapManager.getMap();
    if (map) {
      const center = map.getCenter();
      this.newTreeLocation = {
        lat: center.lat(),
        lng: center.lng(),
      };

      document.getElementById("treeLatitude").value = this.newTreeLocation.lat.toFixed(6);
      document.getElementById("treeLongitude").value = this.newTreeLocation.lng.toFixed(6);

      // Reverse geocode
      const geocoder = new google.maps.Geocoder();
      geocoder.geocode({ location: this.newTreeLocation }, (results, status) => {
        if (status === "OK" && results[0]) {
          document.getElementById("treeAddress").value = results[0].formatted_address;
        }
      });
    }

    document.getElementById("treeModalTitle").textContent = "New Tree Entry";
    this.closeAllModals();
    document.getElementById("treeModal").classList.remove("hidden");
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
    // Implementation for viewing tree details
  }

  closeViewTreeModal() {
    // Implementation for closing view modal
  }

  openRequestAccessModal(tin) {
    // Implementation for access request modal
  }

  removeTreePhoto() {
    // Implementation for removing tree photo
  }
}

export const treeManager = new TreeManager(); 