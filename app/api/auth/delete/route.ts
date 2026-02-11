// @ts-nocheck
import { NextResponse } from "next/server";
import { getAdminAuth, getAdminDb } from "@/lib/firebase-admin";

export async function POST(req: Request) {
    try {
        const { uid } = await req.json();

        if (!uid) {
            return NextResponse.json({ error: "Missing UID" }, { status: 400 });
        }

        // 1. Delete from Firebase Auth using Admin SDK
        try {
            const adminAuth = getAdminAuth();
            await adminAuth.deleteUser(uid);
        } catch (firebaseError: any) {
            console.warn("Firebase User already deleted or not found:", firebaseError.message);
        }

        // 2. Delete related data in Firestore
        const db = getAdminDb();

        // Delete User Doc
        await db.collection("users").doc(uid).delete();

        // Delete related orders (batch delete recommended for large sets, simplified here)
        const ordersSnapshot = await db.collection("orders").where("userId", "==", uid).get();
        const batch = db.batch();
        ordersSnapshot.docs.forEach((doc) => {
            batch.delete(doc.ref);
        });

        // Delete analytics
        const analyticsSnapshot = await db.collection("analytics").where("userId", "==", uid).get();
        analyticsSnapshot.docs.forEach((doc) => {
            batch.delete(doc.ref);
        });

        await batch.commit();

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error("Delete Error:", error);
        return NextResponse.json({ error: "Delete failed" }, { status: 500 });
    }
}
