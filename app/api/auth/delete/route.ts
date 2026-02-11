// @ts-nocheck
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAdminAuth } from "@/lib/firebase-admin";

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
            // If user doesn't exist in Firebase, we can still proceed to clean up DB
            console.warn("Firebase User already deleted or not found:", firebaseError.message);
        }

        // 2. Delete related data in DB
        // We explicitly delete to ensure child records are removed before the parent User record
        await prisma.analyticsEvent.deleteMany({ where: { userId: uid } });
        await prisma.order.deleteMany({ where: { userId: uid } });
        await prisma.user.delete({ where: { id: uid } });

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error("Delete Error:", error);
        return NextResponse.json({ error: "Delete failed" }, { status: 500 });
    }
}
