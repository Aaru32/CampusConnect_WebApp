// CampusConnect Firebase Client Bridge
import { initializeApp } from 'https://www.gstatic.com/firebasejs/11.4.0/firebase-app.js';
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  onAuthStateChanged
} from 'https://www.gstatic.com/firebasejs/11.4.0/firebase-auth.js';
import {
  getFirestore,
  doc,
  getDoc,
  getDocFromServer,
  setDoc,
  updateDoc,
  collection,
  query,
  where,
  getDocs,
  addDoc,
  onSnapshot,
  serverTimestamp
} from 'https://www.gstatic.com/firebasejs/11.4.0/firebase-firestore.js';

export const firebaseConfig = {
  projectId: "knitted-hash-w5wls",
  appId: "1:588571950493:web:34a3470d2bb902b78c4374",
  apiKey: "AIzaSyCA6GAy_Qh7uhc0fIGzW8YWOIstFHM0-OI",
  authDomain: "knitted-hash-w5wls.firebaseapp.com",
  firestoreDatabaseId: "ai-studio-campusconnectweb-eb62d81a-1b67-4a1b-837e-fda665d86573",
  storageBucket: "knitted-hash-w5wls.firebasestorage.app",
  messagingSenderId: "588571950493",
  measurementId: "",
  oAuthClientId: "588571950493-h8jgqk7aapsck58bss6q6734qt63p36t.apps.googleusercontent.com"
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

// Test connection on boot
(async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn("Please check your Firebase configuration or internet connection.");
    }
  }
})();

// Standardized Error Handler
export function handleFirestoreError(error, operationType, path) {
  const errInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid || null,
      email: auth.currentUser?.email || null,
      emailVerified: auth.currentUser?.emailVerified || null,
      isAnonymous: auth.currentUser?.isAnonymous || null
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Authentication Helpers
export async function loginWithEmail(email, password) {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const userDoc = await getDoc(doc(db, 'users', userCredential.user.uid));
    const userData = userDoc.exists() ? userDoc.data() : null;
    return { user: userCredential.user, profile: userData };
  } catch (error) {
    if (error.code === 'auth/operation-not-allowed') {
      console.warn("Firebase Email/Password provider is not yet enabled in Firebase Console. Falling back to local verified authentication.");
      return { operationNotAllowed: true };
    }
    console.warn("Firebase Login Error:", error.message || error);
    throw error;
  }
}

export async function loginWithGoogle(expectedRole = "student") {
  const provider = new GoogleAuthProvider();
  try {
    const result = await signInWithPopup(auth, provider);
    const user = result.user;
    const userDocRef = doc(db, 'users', user.uid);
    let userDoc = await getDoc(userDocRef);
    let profile = null;

    if (!userDoc.exists()) {
      // Auto-provision profile with default role
      profile = {
        uid: user.uid,
        email: user.email,
        name: user.displayName || 'Google User',
        role: expectedRole,
        authorizationStatus: expectedRole === 'student' ? 'AUTHORIZED' : 'PENDING_APPROVAL',
        createdAt: new Date().toISOString()
      };
      await setDoc(userDocRef, profile);
      if (expectedRole === 'student') {
        await setDoc(doc(db, 'students', user.uid), {
          uid: user.uid,
          fullName: profile.name,
          email: user.email,
          rollNumber: 'NEW',
          department: 'Computer Science & Engineering',
          semester: '1st Semester',
          updatedAt: new Date().toISOString()
        });
      }
    } else {
      profile = userDoc.data();
    }
    return { user, profile };
  } catch (error) {
    console.error("Google Sign-In Error:", error);
    throw error;
  }
}

export async function registerWithEmail(email, password, profileData) {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const uid = userCredential.user.uid;
    const isStudent = profileData.role === 'student';

    const baseUser = {
      uid,
      email,
      name: profileData.name || 'User',
      role: profileData.role,
      mobile: profileData.mobile || '',
      authorizationStatus: isStudent ? 'AUTHORIZED' : 'PENDING_APPROVAL',
      createdAt: new Date().toISOString()
    };

    await setDoc(doc(db, 'users', uid), baseUser);

    if (isStudent) {
      await setDoc(doc(db, 'students', uid), {
        uid,
        fullName: profileData.name || 'User',
        rollNumber: profileData.rollNo || 'PENDING',
        department: profileData.branch || 'General',
        branch: profileData.branch || 'General',
        semester: '1st Semester',
        email,
        mobileNumber: profileData.mobile || '',
        updatedAt: new Date().toISOString()
      });
    } else if (profileData.role === 'faculty') {
      await setDoc(doc(db, 'faculty', uid), {
        uid,
        fullName: profileData.name || 'Faculty Member',
        employeeId: profileData.employeeId || 'FAC-NEW',
        department: profileData.department || 'General',
        designation: profileData.designation || 'Lecturer',
        email,
        isApproved: false
      });
    }

    return { user: userCredential.user, profile: baseUser };
  } catch (error) {
    if (error.code === 'auth/operation-not-allowed') {
      console.warn("Firebase Email/Password registration is not enabled in Firebase Console. Falling back to local storage.");
      return { operationNotAllowed: true };
    }
    console.warn("Registration Error:", error.message || error);
    throw error;
  }
}

export async function logoutUser() {
  await signOut(auth);
  sessionStorage.clear();
  localStorage.removeItem("campusConnectRemember");
}

// Client-Side Route Guard
export function setupRouteGuard(requiredRole, loginRedirect = "/Login/login.html") {
  return new Promise((resolve) => {
    onAuthStateChanged(auth, async (user) => {
      if (!user) {
        window.location.replace(loginRedirect);
        return;
      }
      try {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (!userDoc.exists()) {
          window.location.replace(loginRedirect);
          return;
        }
        const data = userDoc.data();
        if (requiredRole && data.role !== requiredRole && data.role !== 'admin') {
          // Redirect unauthorized roles to their own dashboard
          if (data.role === 'student') window.location.replace('/Dashboard/Student/student-dashboard.html');
          else if (data.role === 'faculty') window.location.replace('/Dashboard/Faculty/faculty-dashboard.html');
          else window.location.replace('/Dashboard/Admin/admin-dashboard.html');
          return;
        }
        resolve({ user, profile: data });
      } catch (err) {
        console.error("Route guard verification error:", err);
        window.location.replace(loginRedirect);
      }
    });
  });
}

// Expose globally on window for non-module compatibility
if (typeof window !== 'undefined') {
  window.CampusConnectFirebase = {
    auth,
    db,
    loginWithEmail,
    loginWithGoogle,
    registerWithEmail,
    logoutUser,
    setupRouteGuard
  };
}
