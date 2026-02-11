// @ts-nocheck
import * as admin from "firebase-admin";

const initializeFirebaseAdmin = () => {
    if (admin.apps.length > 0) {
        return admin.apps[0];
    }

    try {
        let serviceAccount;

        // Prioritize Environment Variable (Production)
        if (process.env.FIREBASE_SERVICE_ACCOUNT) {
            try {
                serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
            } catch (e) {
                console.error("Failed to parse FIREBASE_SERVICE_ACCOUNT environment variable");
            }
        }

        // Fallback to local file (Development) - REMOVED for production cleanliness
        // if (!serviceAccount) ...

        if (serviceAccount) {
            return admin.initializeApp({
                credential: admin.credential.cert(serviceAccount),
            });
        } else {
            console.error("Firebase Admin could not be initialized: No credentials found.");
            return null;
        }

    } catch (error) {
        console.error("Firebase Admin initialization error:", error);
        return null;
    }
};

// Initialize once
const app = initializeFirebaseAdmin();

// Export getters to ensure the app is initialized before use
export const getAdminAuth = () => {
    const currentApp = admin.apps.length > 0 ? admin.apps[0] : initializeFirebaseAdmin();
    if (!currentApp) throw new Error("Firebase Admin not initialized");
    return admin.auth(currentApp);
};

export const getAdminDb = () => {
    const currentApp = admin.apps.length > 0 ? admin.apps[0] : initializeFirebaseAdmin();
    if (!currentApp) throw new Error("Firebase Admin not initialized");
    return admin.firestore(currentApp);
};

export default admin;
