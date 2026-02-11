// @ts-nocheck
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
    try {
        const { uid, email, userAgent } = await req.json();

        if (!uid) {
            return NextResponse.json({ error: "Missing UID" }, { status: 400 });
        }

        // Upsert User: Create if new, update visit info if exists
        const user = await prisma.user.upsert({
            where: { id: uid },
            update: {
                lastActive: new Date(),
                visitCount: { increment: 1 },
                userAgent: userAgent || null,
            },
            create: {
                id: uid,
                email: email || `user_${uid}@kihumba.com`, // Fallback if not provided, though useAuth should provide it
                userAgent: userAgent || null,
                visitCount: 1,
                lastActive: new Date(),
            },
        });

        // Log the "SESSION_START" event
        await prisma.analyticsEvent.create({
            data: {
                userId: uid,
                eventType: "SESSION_START",
                eventName: "app_open",
                userAgent: userAgent || null,
            },
        });

        return NextResponse.json({ success: true, user });
    } catch (error: any) {
        console.error("Sync Error:", error);
        return NextResponse.json({ error: "Sync failed" }, { status: 500 });
    }
}
