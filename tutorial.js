// ============================
// 🎓 GROUNDZY TUTORIAL SYSTEM
// ============================

// ============================ 🧪 DEV: Jump to Tutorial Step from Console ============================
function goToTutorialStep(stepNumber) {
  console.log(`🧭 Jumping to tutorial step ${stepNumber}...`);
  window.tutorialStep = stepNumber;
  closeAllModals();
  runTutorialStep();
}

// Global function to test step 7 directly
window.testStep7 = function() {
  console.log('🧪 Testing step 7 directly...');
  window.tutorialStep = 7;
  runTutorialStep();
};

// Global function to check current tutorial state
window.checkTutorialState = function() {
  console.log('🔍 Current tutorial state:');
  console.log('- Tutorial step:', window.tutorialStep);
  console.log('- Is in tutorial:', window.isInTutorial);
  console.log('- All tree markers:', allTreeMarkers.length);
  console.log('- Map manager available:', !!window.mapManager);
};

// ============================ 🟢 Step 0: Show Welcome Modal ============================
function showTutorialWelcomeModal() {
  closeAllModals();

  const modal = document.createElement("div");
  modal.id = "tutorialWelcomeModal";
  modal.className = "modal";
  modal.innerHTML = `
    <div class="modal-content">
      <h2>👋 Welcome to Groundzy!</h2>
      <p>This quick walkthrough will guide you through your first tree search, identification, and entry using the map.</p>
      <div class="modal-actions">
        <button class="groundzy-btn" onclick="startGroundzyTutorial()">Start Tutorial</button>
        <button class="red-btn" onclick="skipGroundzyTutorial()">Skip</button>
      </div>
    </div>
  `;

  document.body.appendChild(modal);
}

// ============================ 🟢 Step 1: Handle Start / Skip ============================
function startGroundzyTutorial() {
  document.getElementById("tutorialWelcomeModal")?.remove();
  window.isInTutorial = true;
  window.tutorialStep = 2; // Step 2 = dashboard intro
  runTutorialStep();
}

function skipGroundzyTutorial() {
  document.getElementById("tutorialWelcomeModal")?.remove();

  const user = firebase.auth().currentUser;
  if (user) {
    firebase.firestore().collection("users").doc(user.uid).update({
      hasCompletedTutorial: true,
    });
  }
}

// ============================ 🔄 Tutorial Flow Controller ============================
function runTutorialStep() {
  console.log('🎯 Running tutorial step:', window.tutorialStep);
  
  switch (window.tutorialStep) {
    case 2:
      console.log('📋 Step 2: Dashboard Explanation');
      showDashboardExplanation();
      break;
    case 3:
      console.log('🔍 Step 3: Highlight Search Button');
      highlightSearchButton();
      break;
    case 4:
      console.log('🌲 Step 4: Sherman Found Prompt');
      showShermanFoundPrompt();
      break;
    case 5:
      console.log('🌤️ Step 5: Highlight Weather Box');
      highlightWeatherBox();
      break;
    case 6:
      console.log('🌳 Step 6: Highlight Tree Legend');
      highlightTreeLegend();
      break;
    case 7:
      console.log('📍 Step 7: Show View Tree Modal Walkthrough');
      promptTapTreeMarker();
      break;
    case 8:
      console.log('📖 Step 8: View Tree Intro Prompt');
      showViewTreeIntroPrompt();
      break;
    case 9:
      console.log('🪄 Step 9: Wizard Intro Modal');
      showWizardIntroModal();
      break;
    case 10:
      console.log('✈️ Step 10: Start Wizard Fly');
      startWizardFlyToLoneCypress();
      break;
    case 11:
      console.log('🌲 Step 11: Lone Cypress Intro');
      showLoneCypressIntro();
      break;
    case 12:
      console.log('🔍 Step 12: Highlight Identify Button');
      highlightIdentifyTreeButton();
      break;
    case 13:
      console.log('📋 Step 13: Wizard Instructions');
      showWizardInstructions();
      break;
    case 14:
      console.log('🪄 Step 14: Open Tutorial Wizard');
      openTutorialTreeWizard();
      break;
    case 15:
      console.log('➕ Step 15: Add Identified Tree Prompt');
      showAddIdentifiedTreePrompt();
      break;
    case 16:
      console.log('🌳 Step 16: Add Tree Modal');
      showStep16_AddTreeModal();
      break;
    case 17:
      console.log('🏠 Step 17: Final Home Highlight');
      showFinalStep_HighlightHome();
      break;
    case 18:
      console.log('🎉 Step 18: Final Confetti');
      showFinalConfettiStep();
      break;
    default:
      console.log('❌ Unknown tutorial step:', window.tutorialStep);
  }
}

function nextTutorialStep() {
  document.querySelectorAll(".modal").forEach((el) => {
    if (el.id?.startsWith("tutorial")) el.remove();
  });

  window.tutorialStep += 1;
  runTutorialStep();
}

// ============================ 🗺️ Step 2: Dashboard Explanation ============================
function showDashboardExplanation() {
  const modal = document.createElement("div");
  modal.id = "tutorialDashboardModal";
  modal.className = "modal";
  modal.innerHTML = `
    <div class="modal-content">
    <h2>🗺️ Welcome to the Dashboard</h2>
    <p>This is your interactive Groundzy map — where you can search, identify trees, and manage your entries.</p>
    <p>We'll guide you step-by-step through the tools you'll need.</p>    
      <div class="modal-actions">
      <button class="groundzy-btn" onclick="document.getElementById('tutorialDashboardBorder')?.remove(); nextTutorialStep()">Next</button>
      </div>
    </div>
  `;

  // 🟩 Add full dashboard border
  const border = document.createElement("div");
  border.id = "tutorialDashboardBorder";
  border.className = "tutorial-border";
  document.body.appendChild(border);

  document.body.appendChild(modal);
}

function removeDashboardGlowAndContinue() {
  document.getElementById("tutorialDashboardModal")?.remove();
  document.getElementById("tutorialScreenGlow")?.remove();
  window.tutorialStep = 3;
  runTutorialStep();
}

// ============================ 🔍 Step 3: Highlight Search Icon + Wait for Enter ============================
function highlightSearchButton() {
  const searchBtn = document.getElementById("searchBtn");
  const searchBar = document.getElementById("searchBar");
  const searchInput = document.getElementById("searchInput");
  const topIcons = document.getElementById("topIcons");
  const enterBtn = document.getElementById("triggerSearchBtn");

  if (!searchBtn || !searchBar || !searchInput || !topIcons || !enterBtn) {
    console.warn("❌ Tutorial search elements missing.");
    return;
  }

  // ✅ Glow effect on search icon
  searchBtn.classList.add("tutorial-glow");

  // ✅ Floating prompt for search icon
  const prompt = document.createElement("div");
  prompt.id = "tutorialSearchPrompt";
  prompt.style.position = "fixed";
  prompt.style.top = "70px";
  prompt.style.right = "16px";
  prompt.style.background = "#88bd4a";
  prompt.style.color = "white";
  prompt.style.padding = "12px 16px";
  prompt.style.borderRadius = "12px";
  prompt.style.boxShadow = "0 4px 12px rgba(0,0,0,0.3)";
  prompt.style.zIndex = "2000";
  prompt.innerHTML = `
    🔍 Let's start by searching for a specific tree using its Groundzy Code.<br><br>
    Tap this green search button in the top-right corner to begin.
  `;

  document.body.appendChild(prompt);

  searchBtn.addEventListener(
    "click",
    () => {
      searchBtn.classList.remove("tutorial-glow");
      prompt.remove();

      searchBar.classList.remove("hidden");
      topIcons.classList.add("hidden");
      searchInput.value = "GZ-BHE5-TFCF";

      enterBtn.classList.add("tutorial-glow");

      const enterPrompt = document.createElement("div");
      enterPrompt.id = "tutorialEnterPrompt";
      enterPrompt.style.position = "fixed";
      enterPrompt.style.top = "120px";
      enterPrompt.style.right = "16px";
      enterPrompt.style.background = "#88bd4a";
      enterPrompt.style.color = "white";
      enterPrompt.style.padding = "12px 16px";
      enterPrompt.style.borderRadius = "12px";
      enterPrompt.style.boxShadow = "0 4px 12px rgba(0,0,0,0.3)";
      enterPrompt.style.zIndex = "2000";
      enterPrompt.innerHTML = `
        ✅ Now tap the smaller search button to run the search for <strong>GZ-BHE5-TFCF</strong><br>
        (That's a real tree's unique Groundzy Code!)
      `;

      document.body.appendChild(enterPrompt);

      const onEnter = (event) => {
        if (event.key === "Enter") {
          document.getElementById("tutorialEnterPrompt")?.remove();
          enterBtn.classList.remove("tutorial-glow");
          searchInput.removeEventListener("keydown", onEnter);
          setTimeout(() => {
            window.tutorialStep = 4;
            runTutorialStep();
          }, 1500);
        }
      };

      searchInput.addEventListener("keydown", onEnter);

      enterBtn.addEventListener(
        "click",
        () => {
          document.getElementById("tutorialEnterPrompt")?.remove();
          enterBtn.classList.remove("tutorial-glow");
          setTimeout(() => {
            window.tutorialStep = 4;
            runTutorialStep();
          }, 1500);
        },
        { once: true }
      );
    },
    { once: true }
  );
}
// ============================ 🌲 Step 4: Sherman Tree Found Intro ============================
function showShermanFoundPrompt() {
  // ✅ Close search bar and restore top icons
  const searchBar = document.getElementById("searchBar");
  const topIcons = document.getElementById("topIcons");

  if (searchBar) searchBar.classList.add("hidden");
  if (topIcons) topIcons.classList.remove("hidden");

  const modal = document.createElement("div");
  modal.id = "tutorialShermanIntroModal";
  modal.className = "modal";
  modal.innerHTML = `
    <div class="modal-content">
      <h2>🎉 Found It!</h2>
      <p>You just searched for a real Groundzy Code: <strong>GZ-BHE5-TFCF</strong>.</p>
      <p>This points to the legendary <strong>General Sherman Tree</strong> — the largest known living tree on Earth! 🌲</p>
      <p>Before we explore its details, let's take a look at some helpful dashboard tools...</p>
      <div class="modal-actions">
        <button class="groundzy-btn" onclick="goToWeatherStep()">Next</button>
      </div>
    </div>
  `;
  document.body.appendChild(modal);
}

function goToWeatherStep() {
  document.getElementById("tutorialShermanIntroModal")?.remove();
  window.tutorialStep = 5;
  runTutorialStep();
}
// ============================ 🌤️ Step 5: Highlight Weather Box ============================
function highlightWeatherBox() {
  const box = document.getElementById("weatherBox");
  if (!box) return;

  box.classList.remove("hidden");
  box.classList.add("tutorial-glow");

  const prompt = document.createElement("div");
  prompt.id = "tutorialWeatherPrompt";
  prompt.style.background = "#88bd4a";
  prompt.style.color = "white";
  prompt.style.padding = "12px 16px";
  prompt.style.borderRadius = "12px";
  prompt.style.boxShadow = "0 4px 12px rgba(0,0,0,0.3)";
  prompt.style.zIndex = "2000";
  prompt.innerHTML = "🌤️ This shows real-time weather for your map location";

  document.body.appendChild(prompt);

  // ✅ Position prompt just below weather box after rendering
  setTimeout(() => {
    const boxRect = box.getBoundingClientRect();
    prompt.style.position = "fixed";
    prompt.style.left = boxRect.left + "px";
    prompt.style.top = boxRect.bottom + 8 + "px";
  }, 0);

  // ⏱️ Auto-remove after delay
  setTimeout(() => {
    document.getElementById("tutorialWeatherPrompt")?.remove();
    box.classList.remove("tutorial-glow");
    window.tutorialStep = 6;
    runTutorialStep();
  }, 3000);
}
// ============================ 🌳 Step 6: Highlight Tree Legend + Extra Tools ============================
let legendSubStep = 0;

function highlightTreeLegend() {
  const legend = document.getElementById("treeLegend");
  const gpsBtn = document.getElementById("gpsBtn");
  const notifBtn = document.getElementById("notificationsBtn");
  const screenshotBtn = document.getElementById("screenshotToggleBtn");

  const prompt = document.createElement("div");
  prompt.id = "tutorialLegendPrompt";
  prompt.style.position = "fixed";
  prompt.style.background = "#88bd4a";
  prompt.style.color = "white";
  prompt.style.padding = "12px 16px";
  prompt.style.borderRadius = "12px";
  prompt.style.boxShadow = "0 4px 12px rgba(0,0,0,0.3)";
  prompt.style.zIndex = "2000";
  prompt.style.maxWidth = "240px";

  const cleanUp = () => {
    document.getElementById("tutorialLegendPrompt")?.remove();
    [legend, gpsBtn, notifBtn, screenshotBtn].forEach((el) =>
      el?.classList.remove("tutorial-glow")
    );
  };

  const placePromptNear = (element, offsetY = 50, offsetX = 0) => {
    const rect = element.getBoundingClientRect();
    prompt.style.top = `${rect.bottom + offsetY}px`;
    prompt.style.left = `${rect.left + offsetX}px`;
  };

  const runSubStep = () => {
    cleanUp();

    switch (legendSubStep) {
      case 0:
        // 🌳 Tree Legend
        legend.classList.remove("hidden");
        legend.classList.add("tutorial-glow");
        prompt.innerHTML =
          "🌳 The legend shows which trees are visible on the map";
        document.body.appendChild(prompt);
        const legendRect = legend.getBoundingClientRect();
        prompt.style.top = `${legendRect.top - prompt.offsetHeight - 12}px`;
        prompt.style.left = `${legendRect.left}px`;

        setTimeout(() => {
          legendSubStep++;
          runSubStep();
        }, 4000);
        break;

      case 1:
        // 📍 GPS Button
        gpsBtn.classList.add("tutorial-glow");
        prompt.innerHTML =
          "📍 This button centers the map on your current location";
        document.body.appendChild(prompt);
        placePromptNear(gpsBtn, 12, -10);
        setTimeout(() => {
          legendSubStep++;
          runSubStep();
        }, 4000);
        break;

      case 2:
        // 🔔 Notifications Button
        gpsBtn.classList.remove("tutorial-glow");
        notifBtn.classList.add("tutorial-glow");
        prompt.innerHTML =
          "🔔 View system updates, messages, and tree sharing requests here";
        document.body.appendChild(prompt);
        placePromptNear(notifBtn, 12, -10);
        setTimeout(() => {
          legendSubStep++;
          runSubStep();
        }, 4000);
        break;

      case 3:
        // 📸 Screenshot Button
        notifBtn.classList.remove("tutorial-glow");
        screenshotBtn.classList.add("tutorial-glow");
        prompt.innerHTML =
          "📸 This hides the UI for clean map screenshots. Watch it in action!";
        document.body.appendChild(prompt);

        // Position ABOVE the button
        const rect = screenshotBtn.getBoundingClientRect();
        prompt.style.top = `${rect.top - prompt.offsetHeight - 12}px`;
        prompt.style.left = `${rect.left + rect.width / 2 - 120}px`; // 120 = half of maxWidth

        // Simulate a toggle on/off with better error handling
        setTimeout(() => {
          prompt.style.display = "none";
          
          // First click - enter screenshot mode
          if (screenshotBtn) {
            screenshotBtn.click();
            console.log('📸 Tutorial: Entered screenshot mode');
          }
          
          setTimeout(() => {
            // Second click - exit screenshot mode
            if (screenshotBtn) {
              screenshotBtn.click();
              console.log('📸 Tutorial: Exited screenshot mode');
            }
            
            // Show prompt again and continue
            setTimeout(() => {
              prompt.style.display = "block";
              legendSubStep++;
              runSubStep();
            }, 1000);
          }, 3000);
        }, 3000);
        break;

      case 4:
        // ✅ Done — move to Step 7
        cleanUp();
        window.tutorialStep = 7;
        runTutorialStep();
        break;
    }
  };

  runSubStep();
}

// ============================ 📍 Step 7: Show View Tree Modal Walkthrough ============================
function promptTapTreeMarker() {
  console.log('🎯 Starting tutorial step 7: Show View Tree Modal Walkthrough');
  
  // Show explanation prompt first
  const prompt = document.createElement("div");
  prompt.id = "tutorialModalExplanation";
  prompt.style.position = "fixed";
  prompt.style.bottom = "120px";
  prompt.style.left = "50%";
  prompt.style.transform = "translateX(-50%)";
  prompt.style.background = "#88bd4a";
  prompt.style.color = "white";
  prompt.style.padding = "12px 16px";
  prompt.style.borderRadius = "12px";
  prompt.style.boxShadow = "0 4px 12px rgba(0,0,0,0.3)";
  prompt.style.zIndex = "2000";
  prompt.innerHTML = `
    🌲 Now let's explore the <strong>General Sherman Tree</strong> details!<br><br>
    We'll open the tree information modal to show you how to view tree data.<br><br>
    <button class="groundzy-btn" onclick="openTutorialViewTreeModal()" style="margin-top: 8px;">Open</button>
  `;

  document.body.appendChild(prompt);
}

// Function to open the view tree modal for tutorial
function openTutorialViewTreeModal() {
  // Remove the explanation prompt
  document.getElementById("tutorialModalExplanation")?.remove();
  
  // Open the view tree modal
  const viewTreeModal = document.getElementById("viewTreeModal");
  if (viewTreeModal) {
    console.log('✅ View tree modal found, opening...');
    viewTreeModal.classList.remove("hidden");
    
    // Populate the modal with General Sherman data
    populateViewTreeModal();
    
    // Continue to tutorial step 8 after a short delay
    setTimeout(() => {
      console.log('🔄 Proceeding to tutorial step 8...');
      window.tutorialStep = 8;
      runTutorialStep();
    }, 1000);
  } else {
    console.warn("❌ View tree modal not found - creating fallback");
    // Create a simple fallback modal
    const fallbackModal = document.createElement("div");
    fallbackModal.id = "viewTreeModal";
    fallbackModal.className = "modal";
    fallbackModal.innerHTML = `
      <div class="modal-content">
        <h2>🌲 General Sherman Tree</h2>
        <p>This is the legendary General Sherman Tree - the largest known living tree on Earth!</p>
        <p><strong>TIN:</strong> GZ-BHE5-TFCF</p>
        <p><strong>Species:</strong> Giant Sequoia</p>
        <p><strong>Location:</strong> Sequoia National Park, California</p>
        <div class="modal-actions">
          <button class="groundzy-btn" onclick="closeViewTreeAndStartWizard()">Continue Tutorial</button>
        </div>
      </div>
    `;
    document.body.appendChild(fallbackModal);
    
    // Continue to tutorial step 8
    setTimeout(() => {
      console.log('🔄 Proceeding to tutorial step 8 with fallback modal...');
      window.tutorialStep = 8;
      runTutorialStep();
    }, 500);
  }
}

// Populate the view tree modal with General Sherman data
function populateViewTreeModal() {
  // Set basic tree info
  const elements = {
    'viewTreeSpeciesNameText': 'Giant Sequoia',
    'viewTreeTypeText': 'Tree',
    'viewTreeTINText': 'GZ-BHE5-TFCF',
    'viewTreeGenusText': 'Sequoiadendron',
    'viewTreeSpeciesText': 'giganteum',
    'viewTreeFamilyText': 'Cupressaceae',
    'viewTreeAgeText': '2,200+ years',
    'viewTreeHeightText': '275 feet (83.8 m)',
    'viewTreeDBHText': '25.9 feet (7.9 m)',
    'viewTreeCanopyText': '107 feet (32.6 m)',
    'viewTreeHealthText': 'Excellent',
    'viewTreeStructureText': 'Sound',
    'viewTreeLeafConditionText': 'Healthy',
    'viewTreeTagText': 'Sherman-001',
    'viewTreeLocationText': '36.581644, -118.751418',
    'viewTreeOriginText': 'Native to California',
    'viewTreeFunctionText': 'Heritage tree, tourist attraction',
    'viewTreeIssuesText': 'None currently',
    'viewTreeRecommendationsText': 'Continue current maintenance program',
    'viewTreeNotesText': 'The largest known living single-stem tree on Earth'
  };

  // Update each element
  Object.entries(elements).forEach(([id, text]) => {
    const element = document.getElementById(id);
    if (element) {
      element.textContent = text;
    }
  });

  // Set tree icon
  const profileImg = document.getElementById("viewTreeProfileImage");
  if (profileImg) {
    profileImg.src = "https://gzadmin-93.github.io/tree-icons/icon-376.svg";
  }

  // Set tree photo
  const photoBox = document.getElementById("viewTreePhotoBox");
  const photoImg = document.getElementById("viewTreePhoto");
  if (photoBox && photoImg) {
    photoImg.src = "https://firebasestorage.googleapis.com/v0/b/groundzy-live.firebasestorage.app/o/tree_photos%2FMrTaFWcl9VQtrAhElyjTNqfFxgk1%2F1749683830225_General_Sherman_en_californie_a_s%C3%A9quoia_parc.jpg?alt=media&token=317913c5-be7f-41e2-86c0-9b363e183905";
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
  }

  // Set species info
  const speciesInfoText = document.getElementById('viewSpeciesInfoText');
  if (speciesInfoText) {
    speciesInfoText.innerHTML = `
      <strong>Giant Sequoia (Sequoiadendron giganteum)</strong><br><br>
      The Giant Sequoia is one of the most massive living organisms on Earth. 
      These trees can live for over 3,000 years and reach heights of over 300 feet. 
      They are native to the western slopes of the Sierra Nevada mountains in California.<br><br>
      <strong>Key Features:</strong><br>
      • Massive trunk with thick, fire-resistant bark<br>
        • Conical crown with scale-like leaves<br>
        • Produces small cones that release seeds after fire<br>
        • Excellent drought and fire resistance
    `;
  }

  // Show the species info box
  const speciesInfoBox = document.getElementById('viewSpeciesInfoBox');
  if (speciesInfoBox) {
    speciesInfoBox.style.display = 'block';
  }
}

// ============================ 📖 Step 8: View Tree Modal Walkthrough ============================
function showViewTreeIntroPrompt() {
  console.log('🎯 Starting tutorial step 8: View Tree Modal Walkthrough');
  
  const modal = document.getElementById("viewTreeModal");
  const modalContent = modal?.querySelector(".modal-content");

  console.log('🔍 Modal found:', !!modal);
  console.log('🔍 Modal hidden:', modal?.classList.contains("hidden"));
  console.log('🔍 Modal content found:', !!modalContent);

  if (!modal || modal.classList.contains("hidden") || !modalContent) {
    console.warn("❌ View Tree modal not open or not found.");
    console.log('🔍 Modal element:', modal);
    console.log('🔍 Modal classes:', modal?.className);
    
    // Try to open the modal if it exists but is hidden
    if (modal && modal.classList.contains("hidden")) {
      console.log('🔄 Attempting to open hidden modal...');
      modal.classList.remove("hidden");
      setTimeout(() => {
        showViewTreeIntroPrompt();
      }, 100);
      return;
    }
    
    // If modal doesn't exist, skip this step
    console.log('⏭️ Skipping step 8 - modal not available');
    window.tutorialStep = 9;
    runTutorialStep();
    return;
  }

  console.log('✅ Modal is open and ready for walkthrough');

  const steps = [
    {
      message:
        "<strong>Species & Type:</strong><br>This is a Giant Sequoia listed as a Tree.",
      selectors: ["#viewTreeSpeciesNameText", "#viewTreeTypeText"],
      insertAfter: "#viewTreeTypeText",
    },
    {
      message:
        "🆔 <strong>TIN & Icon:</strong><br>This is the tree's unique code and icon.",
      selectors: ["#viewTreeTINText", "#viewTreeProfileImage"],
      insertAfter: "#viewTreeTINText",
    },
    {
      message:
        "🧬 <strong>Genus, Species & Family:</strong><br>This shows the scientific classification.",
      selectors: [
        "#viewTreeGenusText",
        "#viewTreeSpeciesText",
        "#viewTreeFamilyText",
      ],
      insertAfter: "#viewTreeFamilyText",
    },
    {
      message:
        "📸 <strong>Tree Photo:</strong><br>Tap the image to enlarge it.",
      selectors: ["#viewTreePhotoBox"],
      insertAfter: "#viewTreePhotoBox",
    },
    {
      message:
        "📘 <strong>Groundzy Notes:</strong><br>Expert notes about this species are shown here.",
      selectors: ["#viewSpeciesInfoBox"],
      insertAfter: "#viewSpeciesInfoBox",
    },
    {
      message:
        "📏❤️ <strong>Structure & Health:</strong><br>See age, size, and health conditions.",
      selectors: [
        "#viewTreeAgeText",
        "#viewTreeHeightText",
        "#viewTreeDBHText",
        "#viewTreeCanopyText",
        "#viewTreeHealthText",
        "#viewTreeStructureText",
        "#viewTreeLeafConditionText",
      ],
      insertAfter: "#viewTreeLeafConditionText",
    },
    {
      message:
        "🏷️ <strong>Tag & Location:</strong><br>Shows the tree's tag number and precise coordinates.",
      selectors: [
        "#viewTreeTagTitle",
        "#viewTreeTagText",
        "#viewTreeLocationText",
      ],
      insertAfter: "#viewTreeLocationText",
    },
    {
      message:
        "🌍 <strong>Origin & Function:</strong><br>Learn where the tree came from and its intended purpose.",
      selectors: [
        "#viewTreeOriginTitle",
        "#viewTreeOriginText",
        "#viewTreeFunctionText",
      ],
      insertAfter: "#viewTreeFunctionText",
    },
    {
      message:
        "🚨 <strong>Issues & Recommendations:</strong><br>Maintenance needs or advice for this tree.",
      selectors: [
        "#viewTreeIssuesTitle",
        "#viewTreeIssuesText",
        "#viewTreeRecommendationsText",
      ],
      insertAfter: "#viewTreeRecommendationsText",
    },
    {
      message:
        "✍️ <strong>Notes:</strong><br>Any custom notes entered for this tree.",
      selectors: ["#viewTreeNotesTitle", "#viewTreeNotesText"],
      insertAfter: "#viewTreeNotesText",
    },
    {
      message: `
        ✅ <strong>Nice work!</strong><br>
        You've just explored every part of the <strong>tree info screen</strong> — including species, health, and location.<br><br>
        <button class="groundzy-btn" onclick="closeViewTreeAndStartWizard()">Next Step</button>
      `,
      selectors: [],
      insertAfter: "#viewUserNotesText",
      isCloseStep: true,
    },
  ];

  let current = 0;

  const showNext = () => {
    document.getElementById("tutorialViewPrompt")?.remove();
    document
      .querySelectorAll(".tutorial-glow")
      .forEach((el) => el.classList.remove("tutorial-glow"));

    if (current >= steps.length) return;

    const { message, selectors, insertAfter, isCloseStep } = steps[current];

    selectors.forEach((sel) => {
      const el = document.querySelector(sel);
      if (el) el.classList.add("tutorial-glow");
    });

    const prompt = document.createElement("div");
    prompt.id = "tutorialViewPrompt";
    prompt.style.background = "#88bd4a";
    prompt.style.color = "white";
    prompt.style.padding = "12px 16px";
    prompt.style.borderRadius = "12px";
    prompt.style.boxShadow = "0 4px 12px rgba(0,0,0,0.3)";
    prompt.style.fontSize = "0.95em";
    prompt.style.zIndex = "3000";
    prompt.style.maxWidth = "240px";
    prompt.innerHTML = message;

    if (isCloseStep) {
      prompt.style.position = "fixed";
      prompt.style.bottom = "100px";
      prompt.style.left = "50%";
      prompt.style.transform = "translateX(-50%)";

      document.body.appendChild(prompt);

      const closeBtn = document.querySelector(".modal-close-button");
      if (closeBtn) {
        closeBtn.classList.add("tutorial-glow");
        closeBtn.addEventListener(
          "click",
          () => {
            document.getElementById("viewTreeModal")?.classList.add("hidden");
            document.getElementById("tutorialViewPrompt")?.remove();
            closeBtn.classList.remove("tutorial-glow");
            window.tutorialStep = 9;
            runTutorialStep();
          },
          { once: true }
        );
      }
    } else {
      prompt.style.margin = "12px 0";
      const anchor = document.querySelector(insertAfter);
      if (anchor && anchor.parentNode) {
        anchor.parentNode.insertBefore(prompt, anchor.nextSibling);
      } else {
        modalContent.appendChild(prompt);
      }

      prompt.scrollIntoView({ behavior: "smooth", block: "center" });
      current += 1;
      setTimeout(showNext, 3600);
    }
  };

  showNext();
}

function closeViewTreeAndStartWizard() {
  document.getElementById("viewTreeModal")?.classList.add("hidden");
  document.getElementById("tutorialViewPrompt")?.remove();
  document
    .querySelectorAll(".tutorial-glow")
    .forEach((el) => el.classList.remove("tutorial-glow"));
  window.tutorialStep = 9;
  runTutorialStep();
}
// ============================ 🪄 Step 9: Wizard Intro Modal ============================
function showWizardIntroModal() {
  const modal = document.createElement("div");
  modal.id = "tutorialWizardIntroModal";
  modal.className = "modal";
  modal.innerHTML = `
    <div class="modal-content">
      <h2>🪄🌳 Tree Identifier Wizard</h2>
      <p>Next, we'll show you how to identify a tree using Groundzy's AI-powered wizard — starting with the famous <strong>Lone Cypress</strong> 🌲</p>
      <p><strong>Not a fan of scenic flights?</strong> You can tap "Skip Fly" anytime during the trip to jump ahead instantly.</p>
      <div class="modal-actions">
        <button class="groundzy-btn" onclick="startWizardFlyToLoneCypress()">Next</button>
      </div>
    </div>
  `;
  document.body.appendChild(modal);
}
// ============================ ✈️ Step 10: Fly to Lone Cypress ============================
function startWizardFlyToLoneCypress() {
  document.getElementById("tutorialWizardIntroModal")?.remove();

  const funnyPrompts = [
    "🛫 Whoa... this is high!",
    "🌎 I can see my house from here!",
    "🍃 Squirrels don't get this kind of view.",
    "📷 Great spot for drone selfies.",
    "🛰️ Groundzy One is cleared for takeoff.",
    "🎒 Please return your tray tables to the upright position.",
    "🪂 Hope you packed a parachute.",
    "🐦 Bird's-eye view activated!",
    "🎡 WHEEEEEE!!!",
  ];

  const selected = [
    "🌲 Flying to the Lone Cypress...",
    ...funnyPrompts.sort(() => 0.5 - Math.random()).slice(0, 2),
  ];

  const flyPrompt = showMapFlyPrompt(selected[0]);
  const flyTimeouts = [];

  // 🎬 Show rotating fun prompts
  flyTimeouts.push(
    setTimeout(() => {
      flyPrompt.querySelector("span").textContent = selected[1];
    }, 7300)
  );
  flyTimeouts.push(
    setTimeout(() => {
      flyPrompt.querySelector("span").textContent = selected[2];
    }, 14600)
  );

  // 🗺️ Map flight
  const sherman = { lat: 36.58151678691618, lng: -118.7518612801296 };
  const loneCypress = { lat: 36.56875255038538, lng: -121.96523806032035 };

  const map = window.mapManager?.getMap();
  if (!map) {
    console.error('❌ Map not available for tutorial flight');
    return;
  }

  map.setCenter(sherman);
  map.setZoom(19);

  const zoomOutSteps = [18, 17, 16, 15, 14, 13, 12, 11, 10, 9, 8];
  const zoomOutDelay = 800;
  zoomOutSteps.forEach((z, i) => {
    flyTimeouts.push(setTimeout(() => map.setZoom(z), i * zoomOutDelay));
  });

  const zoomOutTotalTime = zoomOutSteps.length * zoomOutDelay;

  flyTimeouts.push(
    setTimeout(() => {
      map.panTo(loneCypress);
    }, zoomOutTotalTime + 1000)
  );

  const zoomInSteps = [10, 11, 12, 13, 14, 15, 16, 17, 18, 19];
  const zoomInDelay = 900;
  const zoomInStartTime = zoomOutTotalTime + 1000 + 2500;

  zoomInSteps.forEach((z, i) => {
    flyTimeouts.push(
      setTimeout(() => {
        map.setCenter(loneCypress);
        map.setZoom(z);
      }, zoomInStartTime + i * zoomInDelay)
    );
  });

  const zoomInTotalTime = zoomInSteps.length * zoomInDelay;
  const totalFlyTime = zoomOutTotalTime + 1000 + 2500 + zoomInTotalTime + 1000;

  flyTimeouts.push(
    setTimeout(() => {
      flyPrompt?.remove();
      skipBtn?.remove();
      window.tutorialStep = 11;
      runTutorialStep();
    }, totalFlyTime)
  );

  // ✅ Add Skip Fly Button
  const skipBtn = document.createElement("button");
  skipBtn.textContent = "⏩ Skip Fly";
  skipBtn.style.position = "fixed";
  skipBtn.style.bottom = "90px";
  skipBtn.style.left = "50%";
  skipBtn.style.transform = "translateX(-50%)";
  skipBtn.style.padding = "10px 18px";
  skipBtn.style.background = "#f1f5f5";
  skipBtn.style.color = "#263e39";
  skipBtn.style.fontWeight = "bold";
  skipBtn.style.border = "2px solid #88bd4a";
  skipBtn.style.borderRadius = "12px";
  skipBtn.style.boxShadow = "0 2px 8px rgba(0,0,0,0.2)";
  skipBtn.style.zIndex = "3000";
  skipBtn.style.cursor = "pointer";
  document.body.appendChild(skipBtn);

  skipBtn.addEventListener("click", () => {
    flyTimeouts.forEach(clearTimeout);
    flyPrompt?.remove();
    skipBtn?.remove();
    const map = window.mapManager?.getMap();
    if (map) {
      map.setCenter(loneCypress);
      map.setZoom(19);
    }
    showLoneCypressIntro(); // skip a step number
  });
}

function showMapFlyPrompt(text) {
  const div = document.createElement("div");
  div.id = "mapFlyPrompt";
  div.innerHTML = `
    <div style="display: flex; flex-direction: column; align-items: center; gap: 10px;">
      <img src="https://gzadmin-93.github.io/tree-icons/icon-117.svg" style="width: 28px; height: 28px; animation: spin 2s linear infinite;" />
      <span style="font-size: 1em; font-weight: 500;">${text}</span>
    </div>
  `;

  div.style.position = "fixed";
  div.style.top = "25%";
  div.style.left = "50%";
  div.style.transform = "translate(-50%, -50%)";
  div.style.background = "rgba(136, 189, 74, 0.85)";
  div.style.color = "white";
  div.style.padding = "16px 24px";
  div.style.borderRadius = "14px";
  div.style.boxShadow = "0 4px 14px rgba(0, 0, 0, 0.25)";
  div.style.zIndex = "2000";
  div.style.textAlign = "center";
  div.style.minWidth = "200px";
  div.style.maxWidth = "260px";

  document.body.appendChild(div);
  return div;
}
// ============================ 🌲 Step 11: Show Lone Cypress Intro ============================
function showLoneCypressIntro() {
  const modal = document.createElement("div");
  modal.id = "tutorialLoneCypressModal";
  modal.className = "modal";
  modal.innerHTML = `
    <div class="modal-content">
      <h2>🌲 The Lone Cypress</h2>
      <p>This is the iconic <strong>Lone Cypress</strong> — standing for over 250 years on California's coast.</p>
      <p>Let's identify it using Groundzy's <strong>Tree Wizard</strong>.</p>
      <div class="modal-actions">
        <button class="groundzy-btn" onclick="goToTreeWizard()">Next</button>
      </div>
    </div>
  `;

  document.body.appendChild(modal);
}

function goToTreeWizard() {
  document.getElementById("tutorialLoneCypressModal")?.remove();
  window.tutorialStep = 12;
  runTutorialStep();
}

// ============================ 🧙 Step 12: Highlight Identify Tree Button ============================
function highlightIdentifyTreeButton() {
  const btn = document.getElementById("identifyTreeBtn");
  if (!btn) return;

  btn.classList.add("tutorial-glow");

  const prompt = document.createElement("div");
  prompt.id = "tutorialIdentifyPrompt";
  prompt.style.position = "fixed";
  prompt.style.bottom = "100px";
  prompt.style.left = "50%";
  prompt.style.transform = "translateX(-50%)";
  prompt.style.background = "#88bd4a";
  prompt.style.color = "white";
  prompt.style.padding = "12px 16px";
  prompt.style.borderRadius = "12px";
  prompt.style.boxShadow = "0 4px 12px rgba(0,0,0,0.3)";
  prompt.style.zIndex = "2000";
  prompt.innerHTML = `
    🧙 Tap the <strong>wizard hat icon</strong> in the bottom menu to open the Tree Identifier Wizard
  `;

  document.body.appendChild(prompt);

  btn.addEventListener(
    "click",
    () => {
      btn.classList.remove("tutorial-glow");
      prompt.remove();
      window.tutorialStep = 13;
      runTutorialStep();
    },
    { once: true }
  );
}
// ============================ 📘 Step 13: Explain Wizard Use ============================
function showWizardInstructions() {
  closeAllModals();

  const modal = document.createElement("div");
  modal.id = "tutorialWizardHowToModal";
  modal.className = "modal";
  modal.innerHTML = `
    <div class="modal-content">
      <h2>📘 How the Tree Identifier Works</h2>
      <p>
        For best results, upload <strong>clear, close-up photos</strong> of different parts of the <strong>same tree</strong>:<br><br>
        🌿 Leaf<br>
        🌸 Flower<br>
        🍎 Fruit<br>
        🌳 Bark
      </p>
      <p>Groundzy's wizard will use AI and expert data to find the closest species match.</p>
      <div class="modal-actions">
        <button class="groundzy-btn" onclick="startWizardScroll()">Got It – Let's Identify!</button>
      </div>
    </div>
  `;
  document.body.appendChild(modal);
}

function startWizardScroll() {
  document.getElementById("tutorialWizardHowToModal")?.remove();
  window.tutorialStep = 14;
  runTutorialStep();
}

// ============================ 🧪 Step 14: Open Tree Identifier Wizard with Sample Photos ============================
function openTutorialTreeWizard() {
  closeAllModals();

  const wizard = document.getElementById("treeIdentifierModal");
  wizard?.classList.remove("hidden");

  window.isInTutorialWizard = true;
  const container = document.getElementById("photoInputContainer");
  if (!container) return;

  container.innerHTML = "";

  const addTutorialPhoto = (url, organ = "habit") => {
    const block = document.createElement("div");
    block.className = "photo-block";
    block.style.marginTop = "12px";
    block.innerHTML = `
      <img src="${url}" style="max-width: 100%; border-radius: 12px;" />
      <select class="styled-input organ-select" style="margin-top: 8px;">
        <option value="${organ}">Whole Plant (auto)</option>
      </select>
    `;
    container.appendChild(block);
  };

  addTutorialPhoto(
    "https://upload.wikimedia.org/wikipedia/commons/b/b9/The_Lone_Cypress.jpg"
  );
  addTutorialPhoto(
    "https://upload.wikimedia.org/wikipedia/commons/7/74/The_Lone_Cypress%2C_17_Mile_Drive%2C_Pebble_Beach%2C_California.jpg"
  );

  const identifyBtn = document.getElementById("submitIdentifierBtn");
  identifyBtn?.classList.add("tutorial-glow");

  const prompt = document.createElement("div");
  prompt.id = "tutorialWizardPrompt";
  prompt.style.position = "fixed";
  prompt.style.bottom = "180px";
  prompt.style.left = "50%";
  prompt.style.transform = "translateX(-50%)";
  prompt.style.background = "#88bd4a";
  prompt.style.color = "white";
  prompt.style.padding = "12px 16px";
  prompt.style.borderRadius = "12px";
  prompt.style.boxShadow = "0 4px 12px rgba(0,0,0,0.3)";
  prompt.style.zIndex = "2000";
  prompt.innerHTML = `
    🧪 We've added two sample photos of the <strong>Lone Cypress</strong> for you.<br><br>
    Now tap the <strong>Identify</strong> button below to let Groundzy's AI wizard analyze them and suggest a match!
  `;

  setTimeout(() => {
    const scrollTarget = document.getElementById("submitIdentifierBtn");
    scrollTarget?.scrollIntoView({ behavior: "smooth", block: "center" });

    setTimeout(() => {
      document.body.appendChild(prompt);
    }, 600);
  }, 300);

  if (identifyBtn) {
    const clone = identifyBtn.cloneNode(true);
    identifyBtn.parentNode.replaceChild(clone, identifyBtn);

    clone.classList.add("tutorial-glow");
    clone.addEventListener("click", () => {
      clone.classList.remove("tutorial-glow");
      document.getElementById("tutorialWizardPrompt")?.remove();

      // 🔄 Show fake loading spinner
      clone.disabled = true;
      clone.innerHTML = `<img src="https://gzadmin-93.github.io/tree-icons/icon-117.svg" style="width: 20px; height: 20px; animation: spin 2s linear infinite; vertical-align: middle;" /> Identifying...`;

      // Scroll to result area
      const preview = document.getElementById("identifierPreview");
      if (preview) {
        preview.scrollIntoView({ behavior: "smooth", block: "center" });
      }

      setTimeout(() => {
        clone.disabled = false;
        clone.innerHTML = "🌳 Identify Tree";
        showFakeWizardResults();

        // ✅ Wait just a bit to ensure results render, then scroll to button
        setTimeout(() => {
          const preview = document.getElementById("identifierPreview");
          if (preview) {
            preview.scrollIntoView({ behavior: "smooth", block: "center" });
          }
        }, 300); // Slight delay so it scrolls AFTER results are drawn
      }, 2000);
    });
  }
}

function showFakeWizardResults() {
  const resultBox = document.getElementById("identifierPreview");
  if (!resultBox) return;

  resultBox.innerHTML = `
    <p><strong>Top Match:</strong> <span style="color:#88bd4a">Monterey Cypress</span></p>
    <p><strong>Confidence:</strong> 94%</p>
    <p>This species is native to the Central California coast, and your photo matches the famous Lone Cypress tree!</p>
  `;
  resultBox.style.display = "block";

  const nextBtn = document.createElement("button");
  nextBtn.className = "groundzy-btn";
  nextBtn.style.marginTop = "12px";
  nextBtn.textContent = "Next Step";
  resultBox.appendChild(nextBtn);

  nextBtn.addEventListener("click", () => {
    resultBox.innerHTML = ""; // Optional: clear results if you want to hide them
    window.tutorialStep = 15;
    runTutorialStep();
  });
}

// ============================ ➕ Step 15: Prompt to Add Identified Tree ============================
function showAddIdentifiedTreePrompt(retries = 10) {
  closeAllModals();

  const addBtn = document.getElementById("addButton");
  if (!addBtn) {
    if (retries > 0) {
      setTimeout(() => showAddIdentifiedTreePrompt(retries - 1), 300);
    } else {
      console.warn("❌ Add Tree button not found after retrying.");
    }
    return;
  }

  // 🌍 STEP 1: Highlight the Center Pin first
  const centerPin = document.getElementById("centerPin");
  if (centerPin) {
    centerPin.style.display = "block";
    centerPin.classList.add("tutorial-glow");

    const pinPrompt = document.createElement("div");
    pinPrompt.id = "tutorialCenterPinPrompt";
    pinPrompt.style.position = "fixed";
    pinPrompt.style.top = "50%";
    pinPrompt.style.left = "50%";
    pinPrompt.style.transform = "translate(-50%, 20px)";
    pinPrompt.style.background = "#88bd4a";
    pinPrompt.style.color = "white";
    pinPrompt.style.padding = "12px 16px";
    pinPrompt.style.borderRadius = "12px";
    pinPrompt.style.boxShadow = "0 4px 12px rgba(0,0,0,0.3)";
    pinPrompt.style.zIndex = "2000";
    pinPrompt.style.textAlign = "center";
    pinPrompt.style.maxWidth = "260px";
    pinPrompt.innerHTML = `
      📍 This center pin shows where your next tree will be added.<br><br>
      You can move the map to reposition it!
    `;
    document.body.appendChild(pinPrompt);

    // 🕒 After delay, switch to the Add prompt
    setTimeout(() => {
      document.getElementById("tutorialCenterPinPrompt")?.remove();
      centerPin.classList.remove("tutorial-glow");

      // 🌿 STEP 2: Highlight the Add Button
      addBtn.classList.add("tutorial-glow");

      const addPrompt = document.createElement("div");
      addPrompt.id = "tutorialAddPrompt";
      addPrompt.style.position = "fixed";
      addPrompt.style.bottom = "100px";
      addPrompt.style.left = "50%";
      addPrompt.style.transform = "translateX(-50%)";
      addPrompt.style.background = "#88bd4a";
      addPrompt.style.color = "white";
      addPrompt.style.padding = "12px 16px";
      addPrompt.style.borderRadius = "12px";
      addPrompt.style.boxShadow = "0 4px 12px rgba(0,0,0,0.3)";
      addPrompt.style.zIndex = "2000";
      addPrompt.style.maxWidth = "260px";
      addPrompt.style.textAlign = "center";
      addPrompt.innerHTML = `Tap the <strong>"+" button</strong> below to add the <strong>Lone Cypress</strong> to your map.<br><br>
        We'll pre-fill your entry with the ID results!
      `;
      document.body.appendChild(addPrompt);

      addBtn.addEventListener(
        "click",
        () => {
          addBtn.classList.remove("tutorial-glow");
          addPrompt.remove();
          window.tutorialStep = 16;
          runTutorialStep();
        },
        { once: true }
      );
    }, 4000);
  }
}

// ============================ ✅ Step 16: Add Tree Modal with Monterey Cypress ============================
function showStep16_AddTreeModal() {
  closeAllModals();

  // 🧼 Extra safety: make sure Step 11 modal is gone
  document.getElementById("tutorialLoneCypressModal")?.remove();

  const loneCypressLat = 36.56875255038538;
  const loneCypressLng = -121.96523806032035;

  // 🌍 Move map to location
  const map = window.mapManager?.getMap();
  if (map) {
    map.setCenter({ lat: loneCypressLat, lng: loneCypressLng });
    map.setZoom(19);
  }

  // ✅ Set tutorial flags
  window.isInTutorial = true;
  window.tutorialStep = 16;

  // 🪄 Open Add Tree Modal
  if (typeof openTreeModal === 'function') {
    openTreeModal();
  } else if (window.treeManager && typeof window.treeManager.openTreeModal === 'function') {
    window.treeManager.openTreeModal();
  } else {
    console.error('❌ openTreeModal not available in tutorial');
    alert('Tree modal not ready. Please refresh the page.');
    return;
  }

  // 🧩 Fill out basic info
  document.getElementById("treeSpecies").value = "Monterey Cypress";
  document.getElementById("treeType").value = "Tree";
  document.getElementById("treeLatitude").value = loneCypressLat.toFixed(6);
  document.getElementById("treeLongitude").value = loneCypressLng.toFixed(6);
  
  // Safely call autofillSpeciesDetails if available
  try {
    if (window.treeManager && typeof window.treeManager.autofillSpeciesDetails === 'function') {
      window.treeManager.autofillSpeciesDetails("Monterey Cypress");
    }
  } catch (error) {
    console.log('⚠️ autofillSpeciesDetails not available:', error.message);
  }

  // 💾 Highlight Save Button
  const saveBtn = document.getElementById("saveTreeBtn");
  if (!saveBtn) return;

  saveBtn.classList.add("tutorial-glow");

  // 💬 Floating prompt
  const prompt = document.createElement("div");
  prompt.id = "tutorialSavePrompt";
  // Position prompt just above the Save button
  const saveBtnRect = saveBtn.getBoundingClientRect();
  prompt.style.position = "fixed";
  prompt.style.top = `${saveBtnRect.top - 90}px`; // ~70px above button
  prompt.style.left = `${saveBtnRect.left + saveBtnRect.width / 2 - 120}px`; // center prompt (assuming ~240px max width)

  prompt.style.background = "#88bd4a";
  prompt.style.color = "white";
  prompt.style.padding = "12px 16px";
  prompt.style.borderRadius = "12px";
  prompt.style.boxShadow = "0 4px 12px rgba(0,0,0,0.3)";
  prompt.style.zIndex = "2000";
  prompt.innerHTML = `💾 Tap <strong>"Save"</strong> to finish adding your first tree!`;
  document.body.appendChild(prompt);

  // 🧪 Simulate save without Firebase
  saveBtn.addEventListener(
    "click",
    () => {
      // 🔕 Let dashboard.js block real save (window.isInTutorial = true)
      saveBtn.disabled = true;
      saveBtn.innerHTML = `🌳 Saving...`;

      // 🧼 Remove glow + prompt
      saveBtn.classList.remove("tutorial-glow");
      document.getElementById("tutorialSavePrompt")?.remove();

      // 🧪 Simulate fake marker & success modal
      setTimeout(() => {
        try {
          window.treeManager?.closeTreeModal();
          simulateTutorialMarker(loneCypressLat, loneCypressLng);
          showStep16CongratsModal();
        } catch (error) {
          console.error('❌ Error in tutorial save simulation:', error);
        } finally {
          // Always reset the save button
          saveBtn.disabled = false;
          saveBtn.innerHTML = "💾 Save";
        }
      }, 1200);
    },
    { once: true }
  );
}

function simulateTutorialMarker(lat, lng) {
  const iconUrl = "https://gzadmin-93.github.io/tree-icons/icon-117.svg";
  const map = window.mapManager?.getMap();
  
  if (!map) {
    console.error('❌ Map not available for tutorial marker');
    return;
  }

  const marker = new google.maps.Marker({
    position: { lat, lng },
    map: map,
    title: "Monterey Cypress",
    icon: {
      url: iconUrl,
      scaledSize: new google.maps.Size(28, 28),
    },
    animation: google.maps.Animation.DROP,
    zIndex: 999,
  });

  // Store so we can reference or remove it later
  window.tutorialTreeMarker = marker;
}

function showStep16CongratsModal() {
  const modal = document.createElement("div");
  modal.id = "tutorialCongratsModal";
  modal.className = "modal";
  modal.innerHTML = `
    <div class="modal-content">
      <h2>🎉 Nice Work!</h2>
      <p>You just saved your first tree entry on the Groundzy map — a legendary <strong>Monterey Cypress</strong>.</p>
      <p>Let's finish up and return home to start your journey!</p>
      <div class="modal-actions">
        <button class="groundzy-btn" onclick="goToFinalTutorialStep()">Next Step</button>
      </div>
    </div>
  `;

  document.body.appendChild(modal);
}

function goToFinalTutorialStep() {
  document.getElementById("tutorialCongratsModal")?.remove();
  window.tutorialStep = 17;
  runTutorialStep();
}
// ============================ 🎯 Step 17: Tap Home to Finish ============================
function showFinalStep_HighlightHome() {
  closeAllModals();

  const homeBtn = document.querySelector(".bottom-menu a"); // first button
  if (!homeBtn) return;

  homeBtn.classList.add("tutorial-glow");

  const prompt = document.createElement("div");
  prompt.id = "tutorialHomePrompt";
  prompt.style.position = "fixed";
  prompt.style.bottom = "100px";
  prompt.style.left = "50%";
  prompt.style.transform = "translateX(-50%)";
  prompt.style.background = "#88bd4a";
  prompt.style.color = "white";
  prompt.style.padding = "12px 16px";
  prompt.style.borderRadius = "12px";
  prompt.style.boxShadow = "0 4px 12px rgba(0,0,0,0.3)";
  prompt.style.zIndex = "2000";
  prompt.innerHTML = `🏡 Tap the <strong>Home</strong> button to return to your starting map location.`;

  document.body.appendChild(prompt);

  // ✅ Intercept the click to trigger final celebration
  homeBtn.addEventListener(
    "click",
    () => {
      homeBtn.classList.remove("tutorial-glow");
      document.getElementById("tutorialHomePrompt")?.remove();

      setTimeout(() => {
        showFinalConfettiStep(); // ⬅️ launches final celebration
      }, 1200); // allow map to recenter
    },
    { once: true }
  );
}
// ============================ 🎉 Step 18: Final Celebration ============================
function showFinalConfettiStep() {
  // 🌿 Groundzy green confetti!
  confetti({
    particleCount: 150,
    spread: 90,
    origin: { y: 0.6 },
    colors: ["#88bd4a", "#b9d88c", "#f1f5f5"],
  });

  const modal = document.createElement("div");
  modal.id = "tutorialCompleteModal";
  modal.className = "modal";
  modal.innerHTML = `
    <div class="modal-content">
      <h2>🎓 Tutorial Complete!</h2>
      <p>You've added your first tree, explored key features, and learned how to use Groundzy's tools like a pro.</p>
      <p>You're now ready to start mapping your own trees 🌳💪</p>
      <div class="modal-actions">
        <button class="groundzy-btn" onclick="completeGroundzyTutorial()">Let's Go!</button>
      </div>
    </div>
  `;
  document.body.appendChild(modal);
}
function completeGroundzyTutorial() {
  document.getElementById("tutorialCompleteModal")?.remove();

  // 🧹 Clean up tutorial marker
  if (window.tutorialTreeMarker) {
    window.tutorialTreeMarker.setMap(null);
    window.tutorialTreeMarker = null;
  }

  // ✅ Update Firebase flag
  const user = firebase.auth().currentUser;
  if (user) {
    firebase.firestore().collection("users").doc(user.uid).update({
      hasCompletedTutorial: true,
    });
  }

  window.isInTutorial = false;
  window.tutorialStep = null;
}
