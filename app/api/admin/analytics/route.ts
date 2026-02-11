// @ts-nocheck
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
    try {
        const totalUsers = await prisma.user.count();

        // Active in last 24h
        const oneDayAgo = new Date();
        oneDayAgo.setDate(oneDayAgo.getDate() - 1);
        const activeUsers = await prisma.user.count({
            where: { lastActive: { gte: oneDayAgo } }
        });

        const totalEvents = await prisma.analyticsEvent.count();

        const recentEvents = await prisma.analyticsEvent.findMany({
            take: 20,
            orderBy: { timestamp: "desc" },
        });

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
