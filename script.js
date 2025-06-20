// SECTION: ✅ Initialize Firebase
const firebaseConfig = {
  apiKey: "AIzaSyCGCgjRdDecwdBZVai_SI-vtufFoZIMiGM",
  authDomain: "groundzy-live.firebaseapp.com",
  databaseURL: "https://groundzy-live-default-rtdb.firebaseio.com/",
  projectId: "groundzy-live",
  storageBucket: "groundzy-live.firebasestorage.app",
  messagingSenderId: "475442443428",
  appId: "1:475442443428:web:ef4f84e078e2112c452231",
  measurementId: "G-TVMP6LSH6X",
};
firebase.initializeApp(firebaseConfig);
const firestore = firebase.firestore();

// SECTION: 🔤 Generate Unique User Code
function generateUserCode() {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let code = "";
  for (let i = 0; i < 4; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

async function getUniqueUserCode() {
  const usersRef = firestore.collection("users");
  let code,
    exists = true;

  while (exists) {
    code = generateUserCode();
    const snapshot = await usersRef.where("userCode", "==", code).get();
    exists = !snapshot.empty;
  }

  return code;
}

// SECTION: ✅ Toggle Forms
function toggleResetForm() {
  document.getElementById("resetForm").classList.toggle("hidden");
}

function showRegisterFields() {
  document.getElementById("registrationForm").classList.remove("hidden");
  document.getElementById("email").classList.add("hidden");
  document.getElementById("password").classList.add("hidden");
  document.querySelector(".buttons").classList.add("hidden");
}

function hideRegisterForm() {
  document.getElementById("registrationForm").classList.add("hidden");
  document.getElementById("email").classList.remove("hidden");
  document.getElementById("password").classList.remove("hidden");
  document.querySelector(".buttons").classList.remove("hidden");
}

// SECTION: ✅ Login
function login() {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  firebase
    .auth()
    .signInWithEmailAndPassword(email, password)
    .then((userCredential) => {
      alert("Login successful!");
      window.location.href = "/dashboard";
    })
    .catch((error) => {
      alert("Login failed: " + error.message);
    });
}

// SECTION: ✅ Registration + Save Profile
function submitFullRegistration(event) {
  event.preventDefault();

  const email = document.getElementById("regEmail").value;
  const password = document.getElementById("regPassword").value;
  const confirm = document.getElementById("regConfirm").value;

  if (password !== confirm) {
    alert("Passwords do not match.");
    return;
  }

  const selectedOrgId = document.getElementById("regOrgDropdown").value;
  const enteredCode = document.getElementById("regOrgCode").value;

  if (selectedOrgId) {
    firestore
      .collection("databases")
      .doc(selectedOrgId)
      .get()
      .then((doc) => {
        if (!doc.exists) {
          alert("Database not found.");
          return;
        }

        const orgData = doc.data();
        if (enteredCode !== orgData.databaseCode) {
          alert("Incorrect database password.");
          return;
        }

        createAccountWithOrg(orgData, selectedOrgId);
      })
      .catch((error) => {
        alert("Error checking database: " + error.message);
      });
  } else {
    createAccountWithOrg(null, null);
  }
}

// SECTION: ✅ Create User + Save Profile
async function createAccountWithOrg(orgData, orgId) {
  const email = document.getElementById("regEmail").value;
  const password = document.getElementById("regPassword").value;

  try {
    const userCredential = await firebase
      .auth()
      .createUserWithEmailAndPassword(email, password);
    const uid = userCredential.user.uid;
    const userCode = await getUniqueUserCode();

    const profile = {
      name: document.getElementById("regName").value,
      email: email,
      userCode: userCode,
      timestamp: new Date().toISOString(),
    };

    // If no orgData (i.e., no database selected), create a new one
    if (!orgData) {
      const newDbRef = firestore.collection("databases").doc(uid);
      const newDbData = {
        name: profile.name + "'s Database",
        createdBy: uid,
        email: profile.email,
        createdAt: new Date().toISOString(),
        databaseCode: generateUserCode(), // optional: make a simple access code
      };

      await newDbRef.set(newDbData);

      profile.organizationId = uid;
      profile.organizationName = newDbData.name;
      profile.databaseCode = newDbData.databaseCode; // ✅ Save code under user
    } else {
      // User joined existing database
      profile.organizationId = orgId;
      profile.organizationName = orgData.name || "";
      profile.databaseCode = orgData.databaseCode || ""; // ✅ Save code under user
    }

    await firestore.collection("users").doc(uid).set(profile);

    document.getElementById("registrationForm").reset();
    hideRegisterForm();
    document.getElementById("email").value = email;
    document.getElementById("password").value = "";
  } catch (error) {
    alert("Registration failed: " + error.message);
  }
}

// SECTION: ✅ Password Reset
function submitPasswordReset(event) {
  event.preventDefault();
  const email = document.getElementById("resetEmail").value;

  firebase
    .auth()
    .sendPasswordResetEmail(email)
    .then(() => {
      alert("Password reset link sent! Check your email.");
      document.getElementById("resetForm").reset();
      toggleResetForm();
    })
    .catch((error) => {
      alert("Reset failed: " + error.message);
    });
}

// SECTION: 🏢 Organization Join Logic
function toggleOrganizationFields() {
  const checked = document.getElementById("regJoinOrg").checked;
  document.getElementById("orgFields").classList.toggle("hidden", !checked);
}

// SECTION: 🌿 Load Groundzy Version (Login Page)
function loadVersion() {
  const versionBox = document.querySelector(".groundzy-version");
  if (!versionBox) return;

  firebase
    .firestore()
    .collection("settings")
    .doc("global")
    .get()
    .then((doc) => {
      if (doc.exists) {
        const data = doc.data();
        versionBox.textContent = "Version " + (data.version || "unknown");
      }
    });
}
