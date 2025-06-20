// ============================
// 🔐 AUTHENTICATION MODULE
// ============================

import { db } from '../config/firebase.js';

export class AuthManager {
  constructor() {
    this.currentDatabaseCode = null;
    this.isAdminUser = false;
    this.adminUID = "ldoDleLEpWWhYWgB3QUwQrGlTOG2";
    this.currentUser = null;
  }

  // Initialize authentication state
  init() {
    return new Promise((resolve) => {
      firebase.auth().onAuthStateChanged(async (user) => {
        if (!user) {
          window.location.href = "/";
          return;
        }

        this.currentUser = user;
        this.isAdminUser = user.uid === this.adminUID;
        
        try {
          const userDoc = await db.collection("users").doc(user.uid).get();
          if (userDoc.exists) {
            const userData = userDoc.data();
            this.currentDatabaseCode = userData.databaseCode || null;
            
            // Check tutorial status
            if (!userData.hasCompletedTutorial) {
              setTimeout(() => {
                this.showTutorialWelcomeModal();
              }, 1500);
            }
            
            // Setup session management
            await this.setupSessionManagement(user.uid);
          }
          
          resolve({
            user,
            databaseCode: this.currentDatabaseCode,
            isAdmin: this.isAdminUser
          });
        } catch (error) {
          console.error("Auth initialization error:", error);
          resolve(null);
        }
      });
    });
  }

  // Session management
  async setupSessionManagement(userId) {
    const sessionRef = db.collection("users").doc(userId).collection("loginSessions");
    
    // End active sessions
    const activeSessions = await sessionRef.where("isActive", "==", true).get();
    activeSessions.forEach((doc) => {
      doc.ref.update({
        isActive: false,
        endedAt: firebase.firestore.FieldValue.serverTimestamp(),
      });
    });

    // Create new session
    const newSession = {
      startedAt: firebase.firestore.FieldValue.serverTimestamp(),
      isActive: true,
      deviceInfo: navigator.userAgent,
    };
    const newSessionRef = await sessionRef.add(newSession);

    // Real-time session monitoring
    newSessionRef.onSnapshot((doc) => {
      const data = doc.data();
      if (data && data.isActive === false) {
        alert("You've been signed out because your account was logged in on another device.");
        this.signOut();
      }
    });

    window.currentLoginSessionRef = newSessionRef;
  }

  // Sign out
  async signOut() {
    if (window.currentLoginSessionRef) {
      await window.currentLoginSessionRef.update({
        isActive: false,
        endedAt: firebase.firestore.FieldValue.serverTimestamp(),
      });
    }
    await firebase.auth().signOut();
  }

  // Get current user info
  getCurrentUser() {
    return this.currentUser;
  }

  // Get database code
  getDatabaseCode() {
    return this.currentDatabaseCode;
  }

  // Check if admin
  isAdmin() {
    return this.isAdminUser;
  }
}

export const authManager = new AuthManager(); 