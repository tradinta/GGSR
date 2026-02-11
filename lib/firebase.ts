// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getAnalytics, isSupported } from "firebase/analytics";

const firebaseConfig = {
    apiKey: "AIzaSyDLw1tY0rQ6cSTgAJPnKROSvaz4qN3og1Q",
    authDomain: "ggrsts.firebaseapp.com",
    projectId: "ggrsts",
    storageBucket: "ggrsts.firebasestorage.app",
    messagingSenderId: "338926745243",
    appId: "1:338926745243:web:0a38bcfc7acc697262b83e",
    measurementId: "G-F3SNFSLRZ0"
};

// Initialize Firebase
// Avoid re-initializing if already initialized (hot reload)
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);

// Analytics only supported in browser environment
let analytics;
if (typeof window !== "undefined") {
    isSupported().then((yes) => {
        if (yes) {
            analytics = getAnalytics(app);
        }
    });
}

export { app, auth, analytics };
