// @ts-nocheck
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
    try {
        const { userId, eventType, eventName, metadata, userAgent } = await req.json();

        if (!userId) return NextResponse.json({ error: "No User ID" }, { status: 400 });

        await prisma.analyticsEvent.create({
            data: {
                userId,
                eventType,
                eventName,
                metadata: metadata ? JSON.stringify(metadata) : null,
                userAgent: userAgent || null,
            },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Analytics Track Error:", error);
        return NextResponse.json({ error: "Failed to track" }, { status: 500 });
    }
}
