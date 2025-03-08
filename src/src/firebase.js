import { initializeApp } from "firebase/app";
//import { getAuth } from "firebase/auth";
import { initializeAuth, browserSessionPersistence } from "firebase/auth";
import { getFirestore, collection, addDoc, getDocs, query, where } from "firebase/firestore";

// Firebase configuration object
const firebaseConfig = {
    apiKey: "AIzaSyBprJQ6Xf8FvQIBPgGJn2ldwRFYvEBI4Mk", // API key for Firebase project
    authDomain: "intelligent-plant-6f187.firebaseapp.com", // Domain for Firebase Authentication
    projectId: "intelligent-plant-6f187", // Firebase project ID
    storageBucket: "intelligent-plant-6f187.appspot.com", // Cloud Storage bucket
    messagingSenderId: "585462630314", // Sender ID for Firebase Cloud Messaging
    appId: "1:585462630314:web:84d6b84f42efb45dde4dd3", // Firebase app ID
    measurementId: "G-63JKZC5QM1", // Google Analytics measurement ID
};

// Initialize Firebase app
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication with session persistence
const auth = initializeAuth(app, {
    persistence: browserSessionPersistence, // Persist authentication state only for the current session
});

// Alternative way to initialize Authentication (commented out)
// const auth = getAuth(app); // Initialize Firebase Authentication

// Initialize Firestore database
const db = getFirestore(app);

// Export Firebase instances for use in other parts of the application
export { auth, db };