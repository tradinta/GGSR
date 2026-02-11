// @ts-nocheck
import { NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebase-admin";

export async function POST(req: Request) {
    try {
        const { uid, email, userAgent } = await req.json();

        if (!uid) {
            return NextResponse.json({ error: "Missing UID" }, { status: 400 });
        }

        const db = getAdminDb();
        const userRef = db.collection("users").doc(uid);

        // Firestore Merge: Create if new, update fields if exists
        await userRef.set({
            uid: uid,
            email: email || `user_${uid.slice(0, 6)}@kihumba.com`,
            userAgent: userAgent || null,
            lastActive: new Date(),
            visitCount: admin.firestore.FieldValue.increment(1)
        }, { merge: true });

        // Set default role if new (safe to do blindly with merge logic? No, set with merge overwrites if key exists)
        // Actually, we should check if role exists to avoid overwriting ADMIN.
        // But 'set' with merge doesn't destroy other fields. 
        // If we want to set default role only on creation, we need a check.
        // Let's simpler approach: just update the access info. 
        // We will assume creation logic happens elsewhere or we use a transaction? 
        // For sync, we just want to ensure the doc exists.

        // Let's do a transactional update to be safe about "creation defaults"
        await db.runTransaction(async (t) => {
            const doc = await t.get(userRef);
            if (!doc.exists) {
                t.set(userRef, {
                    uid,
                    email: email || `user_${uid.slice(0, 6)}@kihumba.com`,
                    role: "USER",
                    createdAt: new Date(),
                    visitCount: 1,
                    lastActive: new Date(),
                    userAgent: userAgent || null
                });
            } else {
                t.update(userRef, {
                    lastActive: new Date(),
                    visitCount: admin.firestore.FieldValue.increment(1),
                    userAgent: userAgent || null
                });
            }
        });

        // Log Analytics
        await db.collection("analytics").add({
            userId: uid,
            eventType: "SESSION_START",
            eventName: "app_open",
            userAgent: userAgent || null,
            timestamp: new Date()
        });

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error("Sync Error:", error);
        return NextResponse.json({ error: "Sync failed" }, { status: 500 });
    }
}
