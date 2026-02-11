"use client";

import { useEffect, useState } from "react";
import { auth } from "@/lib/firebase";
import { signInAnonymously, onAuthStateChanged, User, signOut, updateEmail, updatePassword } from "firebase/auth";

export function useAuth() {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            setUser(user);
            setLoading(false);

            // Auto-upgrade anonymous user to have credentials if not already
            if (user && user.isAnonymous && !user.email) {
                try {
                    const email = `user_${user.uid}@kihumba.com`;
                    // Note: This effectively converts them to email/password user, 
                    // but we keep the flow anonymous from their perspective.
                    await updateEmail(user, email);
                    await updatePassword(user, user.uid);
                    // Refresh user to get updated fields
                    setUser({ ...user, email });
                } catch (err) {
                    console.error("Auto-upgrade error:", err);
                    // If fail (e.g. rate limit), we just continue. 
                    // They might not be able to recover if this fails.
                }
            }

            // Sync User to DB for Analytics
            if (user) {
                fetch("/api/auth/sync", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        uid: user.uid,
                        email: user.email,
                        userAgent: navigator.userAgent
                    })
                }).catch(err => console.error("Sync failed:", err));
            }
        });
        return () => unsubscribe();
    }, []);

    const login = async () => {
        setLoading(true);
        setError(null);
        try {
            await signInAnonymously(auth);
            // The onAuthStateChanged listener will handle the upgrade
        } catch (err: any) {
            console.error("Login Error:", err);
            if (err.code === 'auth/network-request-failed') {
                setError("Network connection issue. Please check your internet.");
            } else {
                setError("Unable to create secure session. Please try again.");
            }
        } finally {
            setLoading(false);
        }
    };

    const logout = async () => {
        try {
            await signOut(auth);
        } catch (err) {
            console.error("Logout Error:", err);
        }
    };

    return { user, loading, error, login, logout };
}
