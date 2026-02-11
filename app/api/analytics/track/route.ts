// @ts-nocheck
import { NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebase-admin";

export async function POST(req: Request) {
    try {
        const { userId, eventType, eventName, metadata, userAgent } = await req.json();

        // Loose tracking, if no user ID we might still want to track? 
        // Prisma schema allowed nullable userId.

        const db = getAdminDb();

        await db.collection("analytics").add({
            userId: userId || null,
            eventType,
            eventName,
            metadata: metadata ? JSON.stringify(metadata) : null,
            userAgent: userAgent || null,
            timestamp: new Date()
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Analytics Track Error:", error);
        return NextResponse.json({ error: "Failed to track" }, { status: 500 });
    }
}
