import { initializeApp } from "firebase/app";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: "pgverse-588a2.firebaseapp.com",
  projectId: "pgverse-588a2",
  storageBucket: "pgverse-588a2.firebasestorage.app",
  messagingSenderId: "217120920677",
  appId: "1:217120920677:web:8d9c82527e5a80b134228c",
  measurementId: "G-D4H10BKBS4"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

/**
 * Sign In admin using real Firebase Auth API
 */
export const signInAdminWithFirebase = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    return {
      success: true,
      email: user.email,
      uid: user.uid,
      name: user.displayName || "Admin User"
    };
  } catch (error) {
    // Return readable error messages
    throw new Error(error.message || "Firebase Admin Authentication failed.");
  }
};
export { app, auth };
