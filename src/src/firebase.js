import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyBprJQ6Xf8FvQIBPgGJn2ldwRFYvEBI4Mk",
    authDomain: "intelligent-plant-6f187.firebaseapp.com",
    projectId: "intelligent-plant-6f187",
    storageBucket: "intelligent-plant-6f187.appspot.com",
    messagingSenderId: "585462630314",
    appId: "1:585462630314:web:84d6b84f42efb45dde4dd3",
    measurementId: "G-63JKZC5QM1"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db };