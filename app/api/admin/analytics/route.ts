// @ts-nocheck
import { NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebase-admin";

export async function GET() {
    try {
        const db = getAdminDb();

        // Firestore Counts (Client-side aggregation or simple size check, 
        // strictly speaking count() is optimized in newer SDKs but let's do simple snapshot size for MVP)
        // For larger scale, we'd use distributed counters or aggregation queries.

        const usersSnapshot = await db.collection("users").count().get();
        const totalUsers = usersSnapshot.data().count;

        // Active in last 24h
        const oneDayAgo = new Date();
        oneDayAgo.setDate(oneDayAgo.getDate() - 1);

        const activeSnapshot = await db.collection("users")
            .where("lastActive", ">=", oneDayAgo)
            .count().get();
        const activeUsers = activeSnapshot.data().count;

        const eventsSnapshot = await db.collection("analytics").count().get();
        const totalEvents = eventsSnapshot.data().count;

        const recentEventsSnapshot = await db.collection("analytics")
            .orderBy("timestamp", "desc")
            .limit(20)
            .get();

        const recentEvents = recentEventsSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            // Ensure dates are serializable
            timestamp: doc.data().timestamp?.toDate() || new Date()
        }));

        return NextResponse.json({
            totalUsers,
            activeUsers,
            totalEvents,
            recentEvents
        });
    } catch (error) {
        console.error("Analytics Stats Error:", error);
        return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 });
    }
}
