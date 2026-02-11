// @ts-nocheck
import * as admin from "firebase-admin";

const initializeFirebaseAdmin = () => {
    if (admin.apps.length > 0) {
        return admin.apps[0];
    }

    try {
        const serviceAccount = require("./firebase-service-account.json");
        return admin.initializeApp({
            credential: admin.credential.cert(serviceAccount),
        });
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
